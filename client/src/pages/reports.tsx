import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, FileSpreadsheet, Calendar, Package, Trash2, FileBarChart, ExternalLink, Building } from "lucide-react";
import { useLocation } from "wouter";
import { format } from "date-fns";
import Sidebar from "@/components/dashboard/sidebar";
import Header from "@/components/dashboard/header";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/utils";

interface DownloadHistory {
  id: string;
  filename: string;
  invoicesCount: string;
  fileSize?: string;
  downloadedAt?: string;
}

// Utility: Safe file size parser
function parseFileSize(sizeVal?: string) {
  if (!sizeVal) return 0;
  // Remove all non-number/dot
  const num = parseFloat((sizeVal + '').replace(/[^0-9.]/g, ''));
  // if original ends with KB/kb/KB, return as is; if ends with MB, multiply
  if (/mb/i.test(sizeVal)) return Math.round(num * 1024) || 0;
  return Math.round(num) || 0;
}

// Utility: Safe date formatter
function safeFormat(dateVal?: string) {
  if (!dateVal) return "—";
  const d = new Date(dateVal);
  // invalid date check
  if (isNaN(d.valueOf()) || d.getFullYear() < 2000) return "—";
  try {
    return format(d, 'dd MMM yyyy');
  } catch {
    return "—";
  }
}

export default function ReportsPage() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [showGovernmentPortal, setShowGovernmentPortal] = useState(false);

  // 🔐 Session or token
  const sessionId =
    (typeof window !== "undefined" &&
      localStorage.getItem("finsync_session_id")) ||
    "";
  const token =
    (typeof window !== "undefined" &&
      localStorage.getItem("finsync_token")) ||
    "";

  // 🔹 Fetch Reports
  const {
    data: reports = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<DownloadHistory[]>({
    queryKey: ["download-history", sessionId, token],
    queryFn: async () => {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        let url = `${API_BASE_URL}/api/download-history`;
        if (token) headers["Authorization"] = `Bearer ${token}`;
        else if (sessionId)
          url += `?session_id=${encodeURIComponent(sessionId)}`;

        const res = await fetch(url, { headers, credentials: "include" });
        if (!res.ok) throw new Error(`Fetch failed: ${res.statusText}`);

        const raw = await res.json();
        console.log('[Download History Raw]', raw); // DEBUG: output response body

        // Try to extract rows as before, but much more robust
        const rows =
          Array.isArray(raw) ? raw :
          raw?.history || raw?.data || raw?.results || raw?.download_history || [];

        // Map and normalize all possibly present fields (snake_case/camelCase)
        return (rows || []).map((r: any, idx: number) => ({
          id: r.id || r.report_id || r._id || r.ID || idx, // idx as hard fallback
          filename: r.filename || r.file_name || r.file || "Unknown_Report.xlsx",
          invoicesCount: r.invoicesCount || r.invoices_count || r.invoice_count || "0",
          fileSize: r.fileSize || r.file_size || r.size || "0",
          downloadedAt: r.downloadedAt || r.downloaded_at || r.createdAt || r.created_at || "",
        }));
      } catch (err) {
        console.error("❌ Error fetching download history:", err);
        return [];
      }
    },
    refetchInterval: 10000, // auto-refresh every 10s
  });

  // Listen for file upload completion to refresh reports
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'finsync_file_upload_completed') {
        console.log('File upload completed, refreshing reports...');
        queryClient.invalidateQueries({ queryKey: ["download-history", sessionId, token] });
        refetch();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events
    const handleCustomEvent = () => {
      console.log('Custom file upload event received, refreshing reports...');
      queryClient.invalidateQueries({ queryKey: ["download-history", sessionId, token] });
      refetch();
    };
    
    window.addEventListener('fileUploadCompleted', handleCustomEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('fileUploadCompleted', handleCustomEvent);
    };
  }, [queryClient, refetch, sessionId, token]);

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

  // 📥 Download report
  const handleDownload = async (reportId?: string, filename?: string) => {
    try {
      if (!reportId) return;

      const headers: Record<string, string> = {};
      let url = `${API_BASE_URL}/api/download-excel`;
      if (token) headers["Authorization"] = `Bearer ${token}`;
      else if (sessionId)
        url += `?session_id=${encodeURIComponent(sessionId)}`;

      url += `${url.includes("?") ? "&" : "?"}report_id=${encodeURIComponent(
        reportId
      )}`;

      const res = await fetch(url, { headers, credentials: "include" });
      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename || "Report.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  // 🗑️ Delete report
  const handleDeleteReport = async (reportId?: string) => {
    try {
      if (!reportId) return;

      const headers: Record<string, string> = {};
      let url = `${API_BASE_URL}/api/download-history/${encodeURIComponent(
        reportId
      )}`;
      if (token) headers["Authorization"] = `Bearer ${token}`;
      else if (sessionId)
        url += `?session_id=${encodeURIComponent(sessionId)}`;

      const res = await fetch(url, {
        method: "DELETE",
        headers,
        credentials: "include",
      });

      if (res.ok) refetch();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleCleanupDuplicates = async () => {
    try {
      const headers: Record<string, string> = {};
      let url = `${API_BASE_URL}/api/cleanup-duplicate-reports`;
      if (token) headers["Authorization"] = `Bearer ${token}`;
      else if (sessionId)
        url += `?session_id=${encodeURIComponent(sessionId)}`;

      const response = await fetch(url, {
        method: 'POST',
        headers,
        credentials: 'include'
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Cleanup result:', result);
        // Refresh reports after cleanup
        queryClient.invalidateQueries({ queryKey: ["download-history", sessionId, token] });
        refetch();
      }
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex bg-gray-50/50">
        <Sidebar />
        <main className="flex-1 ml-64 min-h-screen">
          <Header 
            title="Reports"
            subtitle="Download and manage your generated GST Excel documents."
            icon={<FileBarChart className="w-7 h-7 text-white" />}
          />
          <div className="p-6 space-y-6">
            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // 🔴 Error
  if (isError) {
    return (
      <div className="min-h-screen flex bg-gray-50/50">
        <Sidebar />
        <main className="flex-1 ml-64">
          <Header
            title="Reports"
            subtitle="Download and manage your generated GST Excel documents."
            icon={<FileBarChart className="w-7 h-7 text-white" />}
          />
          <div className="p-8 text-center text-red-500">
            Error fetching reports.
          </div>
        </main>
      </div>
    );
  }


  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen flex bg-gray-50/50"
      data-testid="reports-page"
    >
      <Sidebar />
      
      <main className="flex-1 ml-64 min-h-screen">
        <Header 
          title="Reports"
          subtitle="Download and manage your generated GST Excel documents."
          icon={<FileBarChart className="w-6 h-6 text-white" />}
        />
        
        <motion.div
          variants={containerVariants}
          className="p-6 space-y-6"
          data-testid="reports-content"
        >
          {/* Statistics */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="professional-card border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Excel Reports</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">{reports.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Generated from invoice uploads</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <FileSpreadsheet className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="professional-card border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Invoices Processed</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">
                      {reports.reduce((sum, r) => sum + parseInt(r.invoicesCount || "0", 10), 0)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Across all reports</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <Package className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="professional-card border-l-4 border-l-purple-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Government Portal</p>
                    <p className="text-lg font-bold text-purple-600 mt-2">Upload to GST Portal</p>
                    <p className="text-xs text-gray-500 mt-1">Submit reports to tax portal</p>
                  </div>
                  <Button
                    onClick={() => setShowGovernmentPortal(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
                    disabled={reports.length === 0}
                  >
                    <Building className="w-4 h-4" />
                    Portal
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* GST Reports List */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                GST Reports & Government Upload
              </h2>
              {reports.length > 0 && (
                <div className="flex items-center gap-4">
                  <p className="text-sm text-gray-500">
                    {reports.length} report{reports.length !== 1 ? 's' : ''} available
                  </p>
                  <Button
                    onClick={handleCleanupDuplicates}
                    variant="outline"
                    size="sm"
                    className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                  >
                    Clean Duplicates
                  </Button>
                  <Button
                    onClick={() => setShowGovernmentPortal(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
                    disabled={reports.length === 0}
                  >
                    <Building className="w-4 h-4" />
                    Government Portal
                  </Button>
                </div>
              )}
            </div>
            
            {reports.length === 0 ? (
              <Card className="professional-card">
                <CardContent className="p-12 text-center">
                  <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <FileSpreadsheet className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-3">No GST Reports Yet</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Upload invoices through the "Invoice Upload" section to generate GST reports. They will appear here for download and government portal upload.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-lg mx-auto">
                    <p className="text-sm text-blue-800">
                      <strong>Next Steps:</strong> Go to Invoice Upload → Upload files → GST reports will be generated and ready for government submission
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {reports.map((report) => (
                  <motion.div
                    key={report.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.01, y: -2 }}
                    className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300"
                    data-testid={`report-${report.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-green-100 p-3 rounded-lg">
                          <FileSpreadsheet className="w-8 h-8 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {report.filename}
                            </h3>
                            <Badge className="bg-green-100 text-green-800 px-3 py-1">
                              EXCEL
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center text-gray-600">
                              <Package className="w-4 h-4 mr-2 text-green-500" />
                              <span className="font-medium">{report.invoicesCount}</span>
                              <span className="ml-1">invoices</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Download className="w-4 h-4 mr-2 text-blue-500" />
                              <span className="font-medium">{report.fileSize ? parseFileSize(report.fileSize) : 0}</span>
                              <span className="ml-1">KB</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                              <span className="font-medium">
                                {report.downloadedAt ? 
                                    safeFormat(report.downloadedAt)
                                  : "Unknown"
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownload(report.id, report.filename)}
                          className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowGovernmentPortal(true)}
                          className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                        >
                          <Building className="w-4 h-4 mr-2" />
                          Upload to Portal
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                          onClick={() => handleDeleteReport(report.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Government Portal Modal */}
          {showGovernmentPortal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowGovernmentPortal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Building className="w-6 h-6 text-purple-600" />
                    Government GST Portal
                  </h3>
                  <Button
                    variant="ghost"
                    onClick={() => setShowGovernmentPortal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </Button>
                </div>
                
                <div className="p-6 overflow-y-auto max-h-[70vh]">
                  <div className="mb-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-blue-800">
                        <strong>Ready to Upload:</strong> You have {reports.length} GST report(s) ready for submission to the government portal.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {reports.slice(0, 4).map((report) => (
                        <div key={report.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center gap-3">
                            <FileSpreadsheet className="w-8 h-8 text-green-600" />
                            <div>
                              <p className="font-medium text-gray-900">{report.filename}</p>
                              <p className="text-sm text-gray-600">{report.invoicesCount} invoices</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Government Portal Interface */}
                  <div className="border border-gray-300 rounded-lg overflow-hidden bg-white" style={{ height: '500px' }}>
                    <div className="bg-[#10264d] text-white p-4">
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        🇮🇳 GST Portal - File Returns
                      </h3>
                      <p className="text-sm">Government of India - Goods and Services Tax</p>
                    </div>
                    
                    <div className="p-6 space-y-4">
                      <h4 className="text-lg font-semibold text-gray-800">Upload GST Returns</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Financial Year *
                          </label>
                          <select className="w-full p-2 border border-gray-300 rounded-md">
                            <option>2024-25</option>
                            <option>2023-24</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Return Type *
                          </label>
                          <select className="w-full p-2 border border-gray-300 rounded-md">
                            <option>GSTR-1</option>
                            <option>GSTR-3B</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Period *
                          </label>
                          <select className="w-full p-2 border border-gray-300 rounded-md">
                            <option>September 2024</option>
                            <option>October 2024</option>
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Upload Excel File *
                        </label>
                        <input 
                          type="file" 
                          accept=".xlsx,.xls" 
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div className="flex gap-3 pt-4">
                        <Button 
                          className="bg-[#3a557d] hover:bg-[#10264d] text-white"
                          onClick={() => {
                            alert('✅ GST Return submitted successfully!\nReference ID: GST2024' + Math.random().toString().substr(2,6));
                          }}
                        >
                          Submit to GST Portal
                        </Button>
                        <Button variant="outline">
                          Save Draft
                        </Button>
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                        <p className="text-sm text-blue-800">
                          💡 <strong>Note:</strong> This is a mock government portal interface. 
                          Your actual GST reports from FinSync can be uploaded here.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() => setShowGovernmentPortal(false)}
                  >
                    Close Portal
                  </Button>
                  <Button 
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={() => {
                      window.open('https://standalone-government-portal.netlify.app', '_blank');
                    }}
                  >
                    Open in New Tab
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </main>
    </motion.div>
  );
}

