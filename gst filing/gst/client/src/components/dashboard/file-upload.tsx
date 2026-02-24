import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { CloudUpload, FileText, X } from "lucide-react";

export default function FileUpload() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const { toast } = useToast();

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

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  }, []);

  const handleFiles = useCallback((files: File[]) => {
    const validFiles = files.filter(file => {
      const validTypes = ['application/pdf', 'image/png', 'image/jpeg'];
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
      processFiles(validFiles);
    }
  }, [showNotification]);

  const processFiles = useCallback(async (files: File[]) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
      
      const response = await fetch('/api/extract-gst', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('finsync_token')}`,
        },
        body: formData,
      });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (response.ok) {
        const result = await response.json();
        setIsUploading(false);
        showNotification(`Successfully processed ${files.length} invoice(s)! ${result.message || 'Excel file generated.'}`, "success");
        
        // Trigger reports page refresh
        localStorage.setItem('finsync_file_upload_completed', Date.now().toString());
        window.dispatchEvent(new CustomEvent('fileUploadCompleted', { detail: result }));
        
        // Download the Excel file with authentication
        if (result.download_url) {
          try {
            const downloadResponse = await fetch(result.download_url, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('finsync_token')}`,
              },
            });
            
            if (downloadResponse.ok) {
              const blob = await downloadResponse.blob();
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = 'GST_Invoices_Extract.xlsx';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);
            } else {
              console.error('Download failed:', await downloadResponse.text());
              showNotification('Failed to download Excel file. Please try again.', 'error');
            }
          } catch (downloadError) {
            console.error('Download error:', downloadError);
            showNotification('Failed to download Excel file. Please try again.', 'error');
          }
        }
      } else {
        const error = await response.json();
        throw new Error(error.message || error.error || 'Processing failed');
      }
    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process files. Please try again.';
      console.error('File upload error:', error);
      showNotification(errorMessage, 'error');
    }
  }, [showNotification]);

  const removeFile = useCallback((index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      data-testid="file-upload"
    >
      <Card className="glass-effect border-0 shadow-lg" data-testid="upload-card">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800" data-testid="upload-title">
            Quick Upload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            whileHover={{ scale: 1.02 }}
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer ${
              isDragOver
                ? "border-blue-500 bg-blue-50/30"
                : "border-gray-300 hover:border-blue-500 hover:bg-blue-50/30"
            }`}
            data-testid="drop-zone"
          >
            <motion.div
              animate={{
                y: isDragOver ? -5 : [0, -10, 0],
              }}
              transition={{
                duration: isDragOver ? 0.2 : 2,
                repeat: isDragOver ? 0 : Infinity,
                ease: "easeInOut"
              }}
            >
              <CloudUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            </motion.div>
            
            <h4 className="text-lg font-semibold text-gray-700 mb-2" data-testid="upload-heading">
              Drag & Drop your files here
            </h4>
            <p className="text-gray-500 mb-4" data-testid="upload-description">
              or click to browse files
            </p>
            
            <input
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileSelect}
              className="hidden"
              id="file-input"
              data-testid="file-input"
            />
            
            <Button
              onClick={() => document.getElementById('file-input')?.click()}
              className="button-ripple px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
              data-testid="choose-files-button"
            >
              Choose Files
            </Button>
            
            <p className="text-sm text-gray-400 mt-4" data-testid="upload-formats">
              Supports: PDF, PNG, JPG (Max 50MB per file)
            </p>
          </motion.div>

          {isUploading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
              data-testid="upload-progress"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Uploading...</span>
                <span className="text-sm text-gray-500">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="progress-bar" />
            </motion.div>
          )}

          {uploadedFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
              data-testid="uploaded-files"
            >
              <h5 className="font-semibold text-gray-700 mb-3">Uploaded Files</h5>
              <div className="space-y-2">
                {uploadedFiles.map((file, index) => (
                  <motion.div
                    key={`${file.name}-${index}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm"
                    data-testid={`uploaded-file-${index}`}
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      data-testid={`remove-file-${index}`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
