import { motion } from "framer-motion";
import { Upload } from "lucide-react";
import Sidebar from "@/components/dashboard/sidebar";
import Header from "@/components/dashboard/header";
import FileUpload from "@/components/dashboard/file-upload";

export default function InvoiceUploadPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen flex bg-gray-50/50"
      data-testid="invoice-upload-page"
    >
      <Sidebar />
      
      <main className="flex-1 ml-64 min-h-screen">
        <Header 
          title="Invoice Upload"
          subtitle="Upload invoices to extract GST details and generate Excel reports."
          icon={<Upload className="w-7 h-7 text-white" />}
        />
        
        <motion.div
          variants={containerVariants}
          className="p-6 space-y-8"
          data-testid="invoice-upload-content"
        >


          {/* File Upload Section */}
          <motion.div variants={itemVariants}>
            <FileUpload />
          </motion.div>

          {/* Instructions */}
          <motion.div variants={itemVariants}>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                How to Use Invoice Upload
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
                    <span className="text-blue-600 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Upload Files</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Drag and drop or select PDF, PNG, or JPG invoice files
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 rounded-full p-2 flex-shrink-0">
                    <span className="text-green-600 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">AI Processing</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      AI extracts GST details and validates tax information
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-purple-100 rounded-full p-2 flex-shrink-0">
                    <span className="text-purple-600 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Excel Generation</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Generated Excel files are saved to Reports section
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </motion.div>
  );
}