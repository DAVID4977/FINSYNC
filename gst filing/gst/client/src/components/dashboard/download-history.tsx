import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Download, Calendar, FileSpreadsheet, Package } from "lucide-react";
import { format } from "date-fns";
import type { DownloadHistory } from "@shared/schema";

export default function DownloadHistoryComponent() {
  const { data: downloads = [], isLoading } = useQuery<DownloadHistory[]>({
    queryKey: ["/api/download-history"],
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 px-3">
          Download History
        </h3>
        <div className="space-y-2 px-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-3"
      data-testid="download-history-section"
    >
      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 px-3 flex items-center gap-2">
        <Download className="w-4 h-4" />
        Download History
      </h3>
      
      {downloads.length === 0 ? (
        <motion.div
          variants={itemVariants}
          className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
          data-testid="no-downloads-message"
        >
          No downloads yet
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} className="space-y-2 px-3">
          {downloads.slice(0, 5).map((download) => (
            <motion.div
              key={download.id}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.02,
                backgroundColor: "rgba(59, 130, 246, 0.05)"
              }}
              className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 cursor-pointer transition-colors"
              data-testid={`download-item-${download.id}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <FileSpreadsheet className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                    {download.filename}
                  </p>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Package className="w-3 h-3" />
                      <span>{download.invoicesCount} invoices</span>
                    </div>
                    
                    {download.fileSize && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>•</span>
                        <span>{Math.round(parseInt(download.fileSize) / 1024)} KB</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {download.downloadedAt ? format(new Date(download.downloadedAt), "MMM dd, HH:mm") : "Unknown"}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          
          {downloads.length > 5 && (
            <motion.div
              variants={itemVariants}
              className="text-center py-2"
            >
              <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                View all ({downloads.length})
              </button>
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}