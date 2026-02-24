import{ useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from"@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { CloudUpload, FileText, X, Download } from "lucide-react";
import { api } from "@/lib/api";

export default function FileUpload() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
  // Update the type definition to include db_upload property andreport_id
  const [processingResult, setProcessingResult] = useState<{
    success: boolean; 
    message: string; 
    invoices_count: number;
    report_id?: string;
    db_upload?: {
      success: boolean;
      message: string;
      files_count: number;
    }
  }| null>(null);
  
  const { toast } = useToast();
  const { sessionId } = useAuth();

  const showNotification = (message: string, type: "success" | "error") => {
    toast({
      title: type === "success" ? "Success" : "Error",
     description: message,
      variant: type === "error" ? "destructive" : "default",
    });
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e:React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  },[]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  }, []);

  const handleFiles = useCallback((files: File[]) => {
    const validFiles = files.filter(file => {
      const validTypes =['application/pdf', 'image/png', 'image/jpeg'];
      const maxSize = 50 * 1024 * 1024; // 50MB
      
      if (!validTypes.includes(file.type)) {
        showNotification(`File ${file.name} is not a supported format.`, "error");
        return false;
      }
      
      if (file.size > maxSize) {
        showNotification(`File ${file.name} is too large (max 50MB).`, "error");
        return false;
      }
      
      return true;
    });

    if (validFiles.length > 0) {
setUploadedFiles(prev => [...prev, ...validFiles]);
    }
  }, [showNotification]);

  const processFiles = useCallback(async (files: File[]) => {
    if (!sessionId) {
      showNotification("You must be logged in to process files", "error");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setProcessingResult(null);
    
    // Declare progressInterval outside try-catch block so it's accessible in both
    let progressInterval: NodeJS.Timeout | null = null;
    
    try {
      // Simulate progress
      progressInterval = setInterval(() => {
setUploadProgress(prev => {
          if (prev >= 90) {
            if (progressInterval) clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
      
      // Connect to your actual backend
      const response =await api.uploadInvoices(files, sessionId);
      
      if (progressInterval) clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (response.success) {
        setProcessingResult(response);
        showNotification(response.message, "success");
        window.dispatchEvent(new Event("fileUploadCompleted")); // Notify reports page
      } else {
        throw new Error(response.message || "Failed to process files");
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      if (progressInterval) clearInterval(progressInterval);
      setIsUploading(false);
      setUploadProgress(0);
      showNotification(error.message || "Failed to process files", "error");
    }
 }, [sessionId, showNotification]);

  const downloadExcel = useCallback(async () => {
    if (!sessionId) {
      showNotification("You must be logged in to download files", "error");
      return;
    }

    if(!processingResult?.report_id) {
      showNotification("No report available for download", "error");
      return;
    }

    try {
      await api.downloadExcelFile(sessionId, processingResult.report_id);
      showNotification("Excel file downloaded successfully!", "success");
    } catch (error: any) {
     console.error('Download error:', error);
      showNotification(error.message || "Failed to download Excel file", "error");
    }
  }, [sessionId, processingResult, showNotification]);

 const removeFile = useCallback((index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearAllFiles = useCallback(() => {
    setUploadedFiles([]);
    setProcessingResult(null);
  }, []);

  // Loader spinner for UI
  const Spinner = () => (
    <svg className="animate-spin h-5 w-5 text-primary" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
  );

  return (
    <motion.div
      initial={{opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-centergap-2">
            <CloudUpload className="h-5 w-5" />
            Upload Invoices
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Drag and drop area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            } ${isUploading ? "opacity-60 pointer-events-none" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <CloudUpload className="mx-auto h-12 w-12 text-muted-foreground" />
            <div className="mt-4">
              <p className="text-lg font-medium">
                Drag and drop your invoices here
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Supports PDF, PNG, and JPEG files (max 50MB each)
              </p>
            </div>
            <Button
              variant="secondary"
              className="mt-4"
              onClick={() => document.getElementById("file-upload")?.click()}
              disabled={isUploading}
            >
              Browse Files
            </Button>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              multiple
              accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
              onChange={handleFileSelect}
              disabled={isUploading}
            />
          </div>

          {/* File list*/}
          {uploadedFiles.length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Selected Files ({uploadedFiles.length})</h3>
                <Button variant="ghost" size="sm" onClick={clearAllFiles}>
                  Clear All
                </Button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted rounded"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm truncate max-w-xs">{file.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => processFiles(uploadedFiles)}
                  disabled={isUploading}
                  className="flex-1 flex gap-2 items-center"
                >
                  {isUploading ? <Spinner /> : null}
                  {isUploading ? "Processing..." : "Process Invoices"}
                </Button>
              </div>
            </div>
          )}

          {/* Progress bar */}
          {isUploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-center text-muted-foreground">
                {uploadProgress < 100 ? "Processing invoices..." : "Processing complete!"}
              </p>
            </div>
          )}

          {/*Processing result */}
          {processingResult && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-green-800">Processing Complete!</p>
                  <p className="text-sm text-green-700 mt-1">
                    {processingResult.message}
                  </p>
                  {processingResult.db_upload && (
                    <p className={`text-sm mt-1 ${processingResult.db_upload.success ? 'text-green-700' : 'text-yellow-700'}`}>
                      Database: {processingResult.db_upload.message}
                    </p>
                  )}
                </div>
                <Button 
                  onClick={downloadExcel}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Excel
</Button>
              </div>
            </div>
          )}
          {processingResult && !processingResult.success && (
            <div className="p-3 bg-red-100 border border-red-200 rounded text-red-700 font-medium mb-4 text-sm">
              {processingResult.message || 'There was an error processing your invoices.'}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
