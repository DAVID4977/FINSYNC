import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Download, Eye, Plus, FileText, TrendingUp, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import type { GstReturn } from "@shared/schema";
import Sidebar from "@/components/dashboard/sidebar";
import Header from "@/components/dashboard/header";

export default function GstReturnsPage() {
  const { data: gstReturns = [], isLoading } = useQuery<GstReturn[]>({
    queryKey: ["/api/gst-returns"],
  });

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Filed":
        return <Badge className="bg-green-100 text-green-800 gst-compliant">Filed</Badge>;
      case "Pending":
        return <Badge className="bg-yellow-100 text-yellow-800 gst-warning">Pending</Badge>;
      case "Draft":
        return <Badge className="bg-blue-100 text-blue-800">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getReturnIcon = (returnType: string) => {
    switch (returnType) {
      case "GSTR-1":
        return <FileText className="w-5 h-5 text-blue-600" />;
      case "GSTR-3B":
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse"></div>
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
      className="min-h-screen flex bg-gray-50/50"
      data-testid="gst-returns-page"
    >
      <Sidebar />
      
      <main className="flex-1 ml-64 min-h-screen">
        <Header 
          title="GST Returns"
          subtitle="Manage your GST return filings and track compliance status."
          icon={<FileText className="w-7 h-7 text-white" />}
        />
        
        <motion.div
          variants={containerVariants}
          className="p-6 space-y-6"
          data-testid="gst-returns-content"
        >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            GST Returns
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and track your GST return filings as per Indian tax regulations
          </p>
        </div>
        <Button 
          className="professional-button flex items-center gap-2"
          data-testid="new-return-button"
        >
          <Plus className="w-4 h-4" />
          New Return
        </Button>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="professional-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Filed Returns</p>
                <p className="text-2xl font-bold text-green-600">
                  {gstReturns.filter(r => r.status === "Filed").length}
                </p>
              </div>
              <FileText className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="professional-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {gstReturns.filter(r => r.status === "Pending").length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="professional-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Draft</p>
                <p className="text-2xl font-bold text-blue-600">
                  {gstReturns.filter(r => r.status === "Draft").length}
                </p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="professional-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tax</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{gstReturns.reduce((sum, r) => sum + parseFloat(r.totalTax || "0"), 0).toLocaleString()}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Returns List */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Recent Returns
        </h2>
        
        {gstReturns.length === 0 ? (
          <Card className="professional-card">
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No GST Returns Found</h3>
              <p className="text-gray-600 mb-4">
                Start by creating your first GST return filing
              </p>
              <Button className="professional-button">
                <Plus className="w-4 h-4 mr-2" />
                Create First Return
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {gstReturns.map((gstReturn) => (
              <motion.div
                key={gstReturn.id}
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                className="professional-card p-6"
                data-testid={`gst-return-${gstReturn.id}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getReturnIcon(gstReturn.returnType)}
                    <div>
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {gstReturn.returnType}
                        </h3>
                        {getStatusBadge(gstReturn.status)}
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Period: {gstReturn.period}
                        </span>
                        {gstReturn.filedAt && (
                          <span>
                            Filed: {format(new Date(gstReturn.filedAt), "dd MMM yyyy")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total Tax</p>
                      <p className="font-semibold text-lg text-gray-900">
                        ₹{parseFloat(gstReturn.totalTax || "0").toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
        </motion.div>
      </main>
    </motion.div>
  );
}