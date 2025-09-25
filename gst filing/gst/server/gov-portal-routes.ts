import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import db from "./db";
import { 
  govPortalUsers, 
  govPortalSessions, 
  govPortalUploads,
  insertGovPortalUserSchema,
  govPortalLoginSchema,
  type GovPortalUser,
  type InsertGovPortalUser,
  type GovPortalLoginCredentials
} from "../shared/schema";
import { eq, and } from "drizzle-orm";
import multer from "multer";

const router = Router();

// JWT Secret for government portal (separate from main app)
const GOV_PORTAL_JWT_SECRET = process.env.GOV_PORTAL_JWT_SECRET || "gov-portal-super-secret-key";

// Multer configuration for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only Excel and CSV files are allowed.'));
    }
  }
});

// Middleware to verify government portal JWT
interface GovPortalAuthenticatedRequest extends Request {
  govUser?: GovPortalUser;
}

const authenticateGovPortal = async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (!token) {
      return res.status(401).json({ error: "Access token required" });
    }

    const decoded = jwt.verify(token, GOV_PORTAL_JWT_SECRET) as any;
    
    // Check if session exists and is valid
    const session = await db.query.govPortalSessions.findFirst({
      where: and(
        eq(govPortalSessions.sessionToken, token),
        eq(govPortalSessions.userId, decoded.userId)
      )
    });

    if (!session || new Date() > session.expiresAt) {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    // Get user separately
    const user = await db.query.govPortalUsers.findFirst({
      where: eq(govPortalUsers.id, decoded.userId)
    });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.govUser = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// Government Portal Registration
router.post("/register", async (req, res) => {
  try {
    const validatedData = insertGovPortalUserSchema.parse(req.body);
    
    // Check if username already exists
    const existingUser = await db.query.govPortalUsers.findFirst({
      where: eq(govPortalUsers.username, validatedData.username),
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: "Username already exists",
        field: "username"
      });
    }

    // Check if email already exists
    const existingEmail = await db.query.govPortalUsers.findFirst({
      where: eq(govPortalUsers.email, validatedData.email),
    });

    if (existingEmail) {
      return res.status(400).json({ 
        error: "Email already registered",
        field: "email"
      });
    }

    // Check if GSTIN already exists
    const existingGstin = await db.query.govPortalUsers.findFirst({
      where: eq(govPortalUsers.gstin, validatedData.gstin),
    });

    if (existingGstin) {
      return res.status(400).json({ 
        error: "GSTIN already registered",
        field: "gstin"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Create user
    const newUser = await db.insert(govPortalUsers).values({
      ...validatedData,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: "Government portal account created successfully. You can now login.",
      redirectTo: "login"
    });

  } catch (error) {
    console.error("Government portal registration error:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.errors
      });
    }

    res.status(500).json({ 
      error: "Registration failed. Please try again.",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Government Portal Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = govPortalLoginSchema.parse(req.body);

    // Find user
    const user = await db.query.govPortalUsers.findFirst({
      where: eq(govPortalUsers.username, username),
    });

    if (!user) {
      return res.status(401).json({ 
        error: "Invalid credentials",
        message: "Username not found. Please register first."
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        error: "Account suspended",
        message: "Your account has been suspended. Contact administrator."
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: "Invalid credentials",
        message: "Incorrect password."
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        gstin: user.gstin 
      },
      GOV_PORTAL_JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Create session
    const sessionExpiry = new Date();
    sessionExpiry.setHours(sessionExpiry.getHours() + 24);

    await db.insert(govPortalSessions).values({
      userId: user.id,
      sessionToken: token,
      deviceInfo: req.headers["user-agent"] || "",
      ipAddress: req.ip || "",
      expiresAt: sessionExpiry,
    });

    // Update last login
    await db.update(govPortalUsers)
      .set({ lastLoginAt: new Date() })
      .where(eq(govPortalUsers.id, user.id));

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        gstin: user.gstin,
        companyName: user.companyName,
      },
      redirectTo: "dashboard"
    });

  } catch (error) {
    console.error("Government portal login error:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.errors
      });
    }

    res.status(500).json({ 
      error: "Login failed. Please try again.",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Government Portal Logout
router.post("/logout", authenticateGovPortal, async (req: any, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.substring(7);

    if (token) {
      // Delete session
      await db.delete(govPortalSessions)
        .where(eq(govPortalSessions.sessionToken, token));
    }

    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Government portal logout error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
});

// Upload GST Return to Government Portal
router.post("/upload-return", authenticateGovPortal, upload.single('file'), async (req: any, res) => {
  try {
    const { returnType, financialYear, period, quarter } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    if (!returnType || !financialYear || !period) {
      return res.status(400).json({ 
        error: "Missing required fields: returnType, financialYear, period" 
      });
    }

    // Generate reference number
    const referenceNumber = `GST${Date.now()}${Math.random().toString().substr(2,4)}`;
    
    // Generate acknowledgment number
    const acknowledgmentNumber = `ACK${Date.now()}${Math.random().toString().substr(2,6)}`;

    // Store upload in database
    const uploadRecord = await db.insert(govPortalUploads).values({
      userId: req.govUser.id,
      fileName: file.originalname,
      originalName: file.originalname,
      fileSize: file.size,
      fileType: file.mimetype,
      returnType,
      financialYear,
      period,
      quarter: quarter || null,
      referenceNumber,
      acknowledgmentNumber,
      status: "submitted",
      uploadedData: {
        uploadedAt: new Date().toISOString(),
        fileHash: Buffer.from(file.buffer).toString('base64').substr(0, 32),
        userAgent: req.headers["user-agent"],
        ipAddress: req.ip
      },
      submittedAt: new Date(),
    });

    // Simulate processing delay (in real system, this would be actual processing)
    setTimeout(async () => {
      try {
        await db.update(govPortalUploads)
          .set({ 
            status: "accepted",
            processedAt: new Date()
          })
          .where(eq(govPortalUploads.referenceNumber, referenceNumber));
      } catch (error) {
        console.error("Failed to update upload status:", error);
      }
    }, 5000); // 5 seconds delay

    res.json({
      success: true,
      message: "File uploaded successfully to Government GST Portal",
      referenceNumber,
      acknowledgmentNumber,
      status: "submitted",
      uploadedAt: new Date().toISOString(),
      processingMessage: "Your return is being processed. Status will be updated shortly."
    });

  } catch (error) {
    console.error("Government portal upload error:", error);
    res.status(500).json({ 
      error: "Upload failed. Please try again.",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Get upload history for user
router.get("/upload-history", authenticateGovPortal, async (req: any, res) => {
  try {
    const uploads = await db.query.govPortalUploads.findMany({
      where: eq(govPortalUploads.userId, req.govUser.id),
      orderBy: (uploads, { desc }) => [desc(uploads.createdAt)],
    });

    res.json({
      success: true,
      uploads: uploads.map(upload => ({
        id: upload.id,
        fileName: upload.fileName,
        returnType: upload.returnType,
        financialYear: upload.financialYear,
        period: upload.period,
        quarter: upload.quarter,
        referenceNumber: upload.referenceNumber,
        acknowledgmentNumber: upload.acknowledgmentNumber,
        status: upload.status,
        submittedAt: upload.submittedAt,
        processedAt: upload.processedAt,
      }))
    });

  } catch (error) {
    console.error("Get upload history error:", error);
    res.status(500).json({ error: "Failed to fetch upload history" });
  }
});

// Check upload status
router.get("/upload-status/:referenceNumber", authenticateGovPortal, async (req: any, res) => {
  try {
    const { referenceNumber } = req.params;

    const upload = await db.query.govPortalUploads.findFirst({
      where: and(
        eq(govPortalUploads.referenceNumber, referenceNumber),
        eq(govPortalUploads.userId, req.govUser.id)
      ),
    });

    if (!upload) {
      return res.status(404).json({ error: "Upload not found" });
    }

    res.json({
      success: true,
      referenceNumber: upload.referenceNumber,
      acknowledgmentNumber: upload.acknowledgmentNumber,
      status: upload.status,
      submittedAt: upload.submittedAt,
      processedAt: upload.processedAt,
      fileName: upload.fileName,
      returnType: upload.returnType,
      financialYear: upload.financialYear,
      period: upload.period,
    });

  } catch (error) {
    console.error("Check upload status error:", error);
    res.status(500).json({ error: "Failed to check upload status" });
  }
});

// Verify session (for frontend to check if user is logged in)
router.get("/verify-session", authenticateGovPortal, async (req: any, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.govUser.id,
        username: req.govUser.username,
        email: req.govUser.email,
        gstin: req.govUser.gstin,
        companyName: req.govUser.companyName,
      }
    });
  } catch (error) {
    res.status(401).json({ error: "Session verification failed" });
  }
});

export default router;