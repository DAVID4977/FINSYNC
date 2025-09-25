import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { createGovernmentPortalService } from "./services/government-portal";
import authRoutes from "./auth-routes";
import adminRoutes from "./admin-routes";
import govPortalRoutes from "./gov-portal-routes";
import { authenticateToken, optionalAuth, type AuthenticatedRequest } from "./auth";
import db from "./db";
import { uploadedFiles, downloadHistory, invoices, gstReturns, users, auditLogs } from "../shared/schema";
import { eq, desc, count, sum, and, gte, sql } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, PNG, JPG, Excel, and CSV files are allowed.'));
    }
  }
});

// Initialize government portal service
const governmentPortal = createGovernmentPortalService();

export async function registerRoutes(app: Express): Promise<Server> {
  // Mount authentication routes
  app.use("/api/auth", authRoutes);
  
  // Mount admin routes
  app.use("/api/admin", adminRoutes);
  
  // Mount government portal routes
  app.use("/api/gov-portal", govPortalRoutes);

  // Ensure temp_uploads directory exists
  const fs = await import('fs');
  const tempDir = 'temp_uploads';
  try {
    await fs.promises.access(tempDir);
  } catch {
    await fs.promises.mkdir(tempDir, { recursive: true });
  }

  // GST extraction endpoint - now with authentication and database storage
  app.post('/api/extract-gst', authenticateToken, upload.array('files'), async (req: AuthenticatedRequest, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }
      
      // Check if Google API key is configured
      const hasValidApiKey = process.env.GOOGLE_API_KEY && 
        process.env.GOOGLE_API_KEY !== 'your_google_api_key_here' && 
        process.env.GOOGLE_API_KEY.length > 10; // Check for reasonable API key length
      
      if (!hasValidApiKey) {
        console.log('⚠️ Google API key not configured, using demo mode for GST extraction');
      } else {
        console.log('✅ Using real Gemini API for GST extraction');
      }
      
      const userId = req.user!.id;
      const allInvoices: any[] = [];
      
      for (const file of files) {
        // Store uploaded file info in database
        const fileId = randomUUID();
        await db.insert(uploadedFiles).values({
          id: fileId,
          userId,
          fileName: `${Date.now()}_${file.originalname}`,
          originalName: file.originalname,
          fileSize: file.size,
          fileType: path.extname(file.originalname).toLowerCase(),
          mimeType: file.mimetype,
          status: 'processing'
        });
        
        // Fetch the inserted file record
        const [uploadedFile] = await db.select().from(uploadedFiles).where(eq(uploadedFiles.id, fileId)).limit(1);
        
        // Ensure temp_uploads directory exists for this file
        const tempDir = 'temp_uploads';
        try {
          await fs.promises.access(tempDir);
        } catch {
          await fs.promises.mkdir(tempDir, { recursive: true });
        }
        
        // Save uploaded file temporarily
        const tempPath = `temp_uploads/${uploadedFile.fileName}`;
        await fs.promises.writeFile(tempPath, file.buffer);
        
        // Process file with Python backend
        const { spawn } = await import('child_process');
        const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
        
        // Determine Python path - try virtual environment first
        const venvPython = process.platform === 'win32' ? 'venv\\Scripts\\python.exe' : 'venv/bin/python';
        const pythonPath = fs.existsSync(venvPython) ? venvPython : pythonCommand;
        
        // Determine Python script to use based on API key availability
        const scriptToUse = hasValidApiKey ? 'python_backend/simple_server.py' : 'python_backend/demo_extractor.py';
        
        const pythonProcess = spawn(pythonPath, [
          scriptToUse,
          tempPath
        ], {
          cwd: process.cwd(),
          env: { 
            ...process.env, 
            PYTHONPATH: `${process.cwd()}/python_backend:${process.env.PYTHONPATH || ''}`,
            GOOGLE_API_KEY: process.env.GOOGLE_API_KEY
          },
          shell: process.platform === 'win32'
        });
        
        let output = '';
        let errorOutput = '';
        
        await new Promise<void>((resolve, reject) => {
          pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
          });
          
          pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
          });
          
          pythonProcess.on('close', async (code) => {
            // Cleanup temp file
            try {
              await fs.promises.unlink(tempPath);
            } catch (e) {
              console.log('Failed to cleanup temp file:', tempPath);
            }
            
            console.log('Python process output:', output);
            console.log('Python process errors:', errorOutput);
            
            if (code === 0) {
              try {
                const resultMatch = output.match(/\[RESULT\]\s*({.*})/);
                if (resultMatch) {
                  const result = JSON.parse(resultMatch[1]);
                  if (result.success) {
                    // Update file status and extraction data
                    await db.update(uploadedFiles)
                      .set({
                        status: 'completed',
                        extractedData: result,
                        invoicesExtracted: result.invoices_count || 0,
                        extractionLog: output,
                        updatedAt: new Date()
                      })
                      .where(eq(uploadedFiles.id, uploadedFile.id));
                    
                    // Note: Download history entry will be created only when user actually downloads the file
                    // This prevents duplicate entries in the reports section
                    
                    console.log(`✅ Successfully processed ${file.originalname}: ${result.invoices_count} invoices${result.demo_mode ? ' (Demo Mode)' : ''}`);
                  } else {
                    await db.update(uploadedFiles)
                      .set({
                        status: 'failed',
                        extractionLog: output || errorOutput,
                        updatedAt: new Date()
                      })
                      .where(eq(uploadedFiles.id, uploadedFile.id));
                    console.warn(`⚠️ No data extracted from ${file.originalname}`);
                  }
                  resolve();
                } else {
                  try {
                    const result = JSON.parse(output.trim());
                    if (result.success) {
                      await db.update(uploadedFiles)
                        .set({
                          status: 'completed',
                          extractedData: result,
                          invoicesExtracted: result.invoices_count || 0,
                          extractionLog: output,
                          updatedAt: new Date()
                        })
                        .where(eq(uploadedFiles.id, uploadedFile.id));
                      console.log(`✅ Successfully processed ${file.originalname}: ${result.invoices_count} invoices`);
                    }
                    resolve();
                  } catch (parseError) {
                    console.log(`ℹ️ Python output (non-JSON): ${output}`);
                    if (output.includes('Processing') || output.includes('SUCCESS')) {
                      await db.update(uploadedFiles)
                        .set({
                          status: 'completed',
                          extractionLog: output,
                          updatedAt: new Date()
                        })
                        .where(eq(uploadedFiles.id, uploadedFile.id));
                      resolve();
                    } else {
                      await db.update(uploadedFiles)
                        .set({
                          status: 'failed',
                          extractionLog: errorOutput || output,
                          updatedAt: new Date()
                        })
                        .where(eq(uploadedFiles.id, uploadedFile.id));
                      reject(new Error('No valid result from Python process'));
                    }
                  }
                }
              } catch (e) {
                console.error('Failed to parse Python output:', e);
                await db.update(uploadedFiles)
                  .set({
                    status: 'failed',
                    extractionLog: `Parse error: ${e}

Output: ${output}

Errors: ${errorOutput}`,
                    updatedAt: new Date()
                  })
                  .where(eq(uploadedFiles.id, uploadedFile.id));
                const errorMessage = e instanceof Error ? e.message : 'Unknown parsing error';
                reject(new Error(`Failed to parse Python output: ${errorMessage}`));
              }
            } else {
              console.error('Python process error with code:', code);
              
              let errorMessage = `Python process failed with exit code ${code}`;
              if (errorOutput.includes('ImportError') || errorOutput.includes('ModuleNotFoundError')) {
                errorMessage = 'Python dependencies missing. Please ensure all required packages are installed.';
              } else if (errorOutput.includes('GOOGLE_API_KEY') || errorOutput.includes('API key')) {
                errorMessage = 'Google API key configuration error. Please check your GOOGLE_API_KEY in .env file.';
              } else if (errorOutput.includes('Permission denied') || errorOutput.includes('Access denied')) {
                errorMessage = 'File access permission error. Please check file permissions.';
              }
              
              await db.update(uploadedFiles)
                .set({
                  status: 'failed',
                  extractionLog: `Process failed with code ${code}

Output: ${output}

Errors: ${errorOutput}`,
                  updatedAt: new Date()
                })
                .where(eq(uploadedFiles.id, uploadedFile.id));
              reject(new Error(errorMessage));
            }
          });
        });
      }
      
      // Log audit trail
      await db.insert(auditLogs).values({
        userId,
        action: 'gst_extraction',
        entityType: 'file',
        newData: {
          filesCount: files.length,
          fileNames: files.map(f => f.originalname)
        },
        ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.connection.remoteAddress || 'unknown',
        userAgent: req.headers['user-agent']
      });
      
      res.json({
        success: true,
        message: `Successfully processed ${files.length} file(s)${!hasValidApiKey ? ' (Demo Mode - Configure GOOGLE_API_KEY for AI extraction)' : ''}. Check Reports section for Excel download.`,
        download_url: '/api/download-excel',
        invoices_count: files.length,
        demo_mode: !hasValidApiKey
      });
      
    } catch (error) {
      console.error('GST extraction error:', error);
      
      let errorMessage = 'Internal server error';
      const errorStr = error instanceof Error ? error.message : String(error);
      
      if (errorStr.includes('Python process failed')) {
        errorMessage = 'Failed to process files with AI engine. Please check if Python environment is properly configured.';
      } else if (errorStr.includes('API key')) {
        errorMessage = 'AI processing unavailable. Please configure Google API key.';
      } else if (errorStr.includes('ENOENT')) {
        errorMessage = 'Python interpreter not found. Please ensure Python is installed and accessible.';
      }
      
      res.status(500).json({ 
        error: errorMessage,
        details: errorStr
      });
    }
  });
  
  // Government Portal Upload endpoint
  app.post('/api/upload-to-government', async (req, res) => {
    try {
      const { filename } = req.body;
      
      if (!filename) {
        return res.status(400).json({ error: 'Filename is required' });
      }
      
      // Get the Excel file path
      const excelPath = path.join(process.cwd(), 'python_backend/output/Consolidated_Invoices_Output.xlsx');
      
      // Check if file exists
      if (!fs.existsSync(excelPath)) {
        return res.status(404).json({ 
          error: 'Excel file not found',
          details: 'Please generate the Excel file first by processing invoices'
        });
      }
      
      // Upload to government portal using enhanced service
      const uploadResult = await governmentPortal.uploadToGovernment(excelPath, {
        originalFilename: filename,
        userId: 'anonymous' // No user system now
      });
      
      if (uploadResult.success) {
        // Log the upload
        console.log(`✅ Government upload: ${filename}`);
        
        res.json({
          success: true,
          message: uploadResult.message || 'Successfully uploaded to Government Portal',
          referenceNumber: uploadResult.referenceNumber,
          uploadTimestamp: uploadResult.timestamp,
          status: uploadResult.status
        });
      } else {
        res.status(400).json({ 
          error: uploadResult.error || 'Upload failed',
          validationErrors: uploadResult.validationErrors,
          details: 'Please check file format and content'
        });
      }
      
    } catch (error) {
      console.error('Government upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload to government portal failed';
      res.status(500).json({ 
        error: errorMessage,
        details: 'Internal server error occurred during upload'
      });
    }
  });

  // Add government portal status check endpoint
  app.get('/api/government-status/:referenceNumber', async (req, res) => {
    try {
      const { referenceNumber } = req.params;
      const status = await governmentPortal.checkStatus(referenceNumber);
      res.json(status);
    } catch (error) {
      console.error('Status check error:', error);
      res.status(500).json({ error: 'Failed to check status' });
    }
  });

  app.get('/api/download-excel', authenticateToken, async (req: AuthenticatedRequest, res) => {
    const excelPath = path.join(process.cwd(), 'python_backend/output/Consolidated_Invoices_Output.xlsx');
    
    // Check if file exists
    if (fs.existsSync(excelPath)) {
      try {
        const userId = req.user!.id;
        const stats = fs.statSync(excelPath);
        
        // Get the latest processed file to get invoice count
        const latestFile = await db
          .select()
          .from(uploadedFiles)
          .where(eq(uploadedFiles.userId, userId))
          .orderBy(desc(uploadedFiles.updatedAt))
          .limit(1);
        
        const invoicesCount = latestFile[0]?.invoicesExtracted || 0;
        
        // Log download in database
        await db.insert(downloadHistory).values({
          userId,
          filename: 'GST_Invoices_Extract.xlsx',
          fileType: 'excel',
          downloadType: 'gst_invoices',
          period: new Date().toISOString().slice(0, 7), // YYYY-MM format
          invoicesCount,
          fileSize: stats.size,
          filePath: excelPath
        });
        
        // Log audit trail
        await db.insert(auditLogs).values({
          userId,
          action: 'file_download',
          entityType: 'file',
          newData: {
            filename: 'GST_Invoices_Extract.xlsx',
            fileSize: stats.size,
            downloadType: 'gst_invoices',
            invoicesCount
          },
          ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.connection.remoteAddress || 'unknown',
          userAgent: req.headers['user-agent']
        });
        
        console.log(`✅ Excel file downloaded by user: ${req.user?.email} (${invoicesCount} invoices)`);

        res.download(excelPath, 'GST_Invoices_Extract.xlsx', (err) => {
          if (err) {
            console.error('Download error:', err);
            res.status(500).json({ error: 'Failed to download file' });
          }
        });
      } catch (error) {
        console.error('Error during download:', error);
        // Still allow download even if logging fails
        res.download(excelPath, 'GST_Invoices_Extract.xlsx');
      }
    } else {
      console.error('Excel file not found at:', excelPath);
      res.status(404).json({ error: 'Excel file not found' });
    }
  });

  // Dashboard stats with real database data
  app.get("/api/dashboard/stats", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      
      // Get total GST collection from invoices
      const [gstCollection] = await db
        .select({ 
          total: sql<string>`COALESCE(SUM(${invoices.igstAmount}), 0) + COALESCE(SUM(${invoices.cgstAmount}), 0) + COALESCE(SUM(${invoices.sgstAmount}), 0) + COALESCE(SUM(${invoices.cessAmount}), 0)`
        })
        .from(invoices)
        .where(eq(invoices.userId, userId));
      
      // Get processed returns count
      const [returnsCount] = await db
        .select({ count: count() })
        .from(gstReturns)
        .where(eq(gstReturns.userId, userId));
      
      // Get pending actions (returns with pending status)
      const [pendingActions] = await db
        .select({ count: count() })
        .from(gstReturns)
        .where(and(
          eq(gstReturns.userId, userId),
          eq(gstReturns.status, 'Pending')
        ));
      
      // Get uploaded files count
      const [filesCount] = await db
        .select({ count: count() })
        .from(uploadedFiles)
        .where(eq(uploadedFiles.userId, userId));
      
      // Get recent invoices
      const recentInvoices = await db
        .select({
          id: invoices.id,
          invoiceNumber: invoices.invoiceNumber,
          invoiceDate: invoices.invoiceDate,
          buyerName: invoices.buyerName,
          invoiceValue: invoices.invoiceValue,
          status: invoices.status
        })
        .from(invoices)
        .where(eq(invoices.userId, userId))
        .orderBy(desc(invoices.createdAt))
        .limit(5);
      
      // Calculate compliance score (simplified)
      const complianceScore = pendingActions.count === 0 ? 100 : Math.max(70, 100 - (pendingActions.count * 10));
      
      res.json({
        totalGstCollection: parseFloat(gstCollection.total || '0'),
        processedReturns: returnsCount.count,
        pendingActions: pendingActions.count,
        complianceScore,
        recentInvoices,
        uploadedFilesCount: filesCount.count
      });
    } catch (error) {
      console.error('Dashboard stats error:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
  });

  // Download history with real data
  app.get("/api/download-history", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      
      const history = await db
        .select()
        .from(downloadHistory)
        .where(eq(downloadHistory.userId, userId))
        .orderBy(desc(downloadHistory.downloadedAt))
        .limit(50);
      
      res.json(history);
    } catch (error) {
      console.error('Download history error:', error);
      res.status(500).json({ error: 'Failed to fetch download history' });
    }
  });

  // Delete download history entry
  app.delete("/api/download-history/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      
      // Delete the record (only if it belongs to the user)
      const result = await db
        .delete(downloadHistory)
        .where(and(
          eq(downloadHistory.id, id),
          eq(downloadHistory.userId, userId)
        ));
      
      res.json({ success: true, message: 'Report deleted successfully' });
    } catch (error) {
      console.error('Delete download history error:', error);
      res.status(500).json({ error: 'Failed to delete report' });
    }
  });

  // Clean up duplicate reports endpoint
  app.post("/api/cleanup-duplicate-reports", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      
      // Get all download history records for this user, grouped by filename and download date
      const allReports = await db
        .select()
        .from(downloadHistory)
        .where(eq(downloadHistory.userId, userId))
        .orderBy(desc(downloadHistory.downloadedAt));
      
      // Find duplicates (same filename, created within 1 minute of each other)
      const toDelete = [];
      const seen = new Map();
      
      for (const report of allReports) {
        const key = `${report.filename}_${report.downloadType}`;
        const downloadTime = report.downloadedAt ? new Date(report.downloadedAt).getTime() : Date.now();
        
        if (seen.has(key)) {
          const existingTime = seen.get(key).time;
          // If within 1 minute (60000ms), consider it a duplicate
          if (Math.abs(downloadTime - existingTime) < 60000) {
            toDelete.push(report.id);
          }
        } else {
          seen.set(key, { id: report.id, time: downloadTime });
        }
      }
      
      // Delete duplicates
      if (toDelete.length > 0) {
        for (const id of toDelete) {
          await db.delete(downloadHistory).where(eq(downloadHistory.id, id));
        }
      }
      
      res.json({ 
        success: true, 
        message: `Cleaned up ${toDelete.length} duplicate report(s)`,
        deletedCount: toDelete.length
      });
    } catch (error) {
      console.error('Cleanup duplicate reports error:', error);
      res.status(500).json({ error: 'Failed to cleanup duplicate reports' });
    }
  });

  // GST returns with real data
  app.get("/api/gst-returns", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      
      const returns = await db
        .select()
        .from(gstReturns)
        .where(eq(gstReturns.userId, userId))
        .orderBy(desc(gstReturns.createdAt));
      
      res.json(returns);
    } catch (error) {
      console.error('GST returns error:', error);
      res.status(500).json({ error: 'Failed to fetch GST returns' });
    }
  });

  // Invoices with real data
  app.get("/api/invoices", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const { page = 1, limit = 50 } = req.query;
      
      const offset = (Number(page) - 1) * Number(limit);
      
      const invoiceList = await db
        .select()
        .from(invoices)
        .where(eq(invoices.userId, userId))
        .orderBy(desc(invoices.createdAt))
        .limit(Number(limit))
        .offset(offset);
      
      const [totalCount] = await db
        .select({ count: count() })
        .from(invoices)
        .where(eq(invoices.userId, userId));
      
      res.json({
        invoices: invoiceList,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalCount.count,
          pages: Math.ceil(totalCount.count / Number(limit))
        }
      });
    } catch (error) {
      console.error('Invoices error:', error);
      res.status(500).json({ error: 'Failed to fetch invoices' });
    }
  });

  // Uploaded files with real data
  app.get("/api/files", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      
      const files = await db
        .select()
        .from(uploadedFiles)
        .where(eq(uploadedFiles.userId, userId))
        .orderBy(desc(uploadedFiles.createdAt))
        .limit(100);
      
      res.json(files);
    } catch (error) {
      console.error('Files error:', error);
      res.status(500).json({ error: 'Failed to fetch files' });
    }
  });

  // Charts with real data
  app.get("/api/charts/gst-trends", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      
      // Get GST data for last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const gstTrends = await db
        .select({
          month: invoices.invoiceDate,
          total: sql<string>`COALESCE(SUM(${invoices.igstAmount}), 0) + COALESCE(SUM(${invoices.cgstAmount}), 0) + COALESCE(SUM(${invoices.sgstAmount}), 0)`
        })
        .from(invoices)
        .where(and(
          eq(invoices.userId, userId),
          gte(invoices.invoiceDate, sixMonthsAgo)
        ))
        .groupBy(invoices.invoiceDate)
        .orderBy(invoices.invoiceDate);
      
      // Generate month labels and data
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      const data = new Array(6).fill(0);
      
      // Map actual data to months (simplified)
      gstTrends.forEach((trend, index) => {
        if (index < 6) {
          data[index] = parseFloat(trend.total || '0');
        }
      });
      
      res.json({
        labels: months,
        data
      });
    } catch (error) {
      console.error('GST trends error:', error);
      res.json({
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        data: [0, 0, 0, 0, 0, 0]
      });
    }
  });

  app.get("/api/charts/compliance", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      
      const [completed] = await db
        .select({ count: count() })
        .from(gstReturns)
        .where(and(
          eq(gstReturns.userId, userId),
          eq(gstReturns.status, 'Filed')
        ));
      
      const [pending] = await db
        .select({ count: count() })
        .from(gstReturns)
        .where(and(
          eq(gstReturns.userId, userId),
          eq(gstReturns.status, 'Pending')
        ));
      
      const [overdue] = await db
        .select({ count: count() })
        .from(gstReturns)
        .where(and(
          eq(gstReturns.userId, userId),
          eq(gstReturns.status, 'Overdue')
        ));
      
      res.json({
        labels: ['Completed', 'Pending', 'Overdue'],
        data: [completed.count, pending.count, overdue.count]
      });
    } catch (error) {
      console.error('Compliance error:', error);
      res.json({
        labels: ['Completed', 'Pending', 'Overdue'],
        data: [0, 0, 0]
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}