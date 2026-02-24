import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  FileText,
  Calendar,
  Target,
  Award,
  Zap
} from "lucide-react";
import Sidebar from "@/components/dashboard/sidebar";
import Header from "@/components/dashboard/header";

// Mock compliance data
const complianceData = {
  overallScore: 87,
  lastUpdated: "2024-01-15",
  nextReview: "2024-02-15",
  totalRequirements: 24,
  completedRequirements: 21,
  pendingRequirements: 3,
  criticalIssues: 1,
  warnings: 2,
  recentActivities: [
    {
      id: 1,
      type: "success",
      title: "GSTR-1 Filed Successfully",
      description: "Monthly return for December 2024 filed on time",
      date: "2024-01-15",
      icon: CheckCircle
    },
    {
      id: 2,
      type: "warning",
      title: "GSTR-3B Due Soon",
      description: "Monthly return due in 5 days",
      date: "2024-01-10",
      icon: Clock
    },
    {
      id: 3,
      type: "error",
      title: "HSN Code Update Required",
      description: "Update HSN codes for 3 products",
      date: "2024-01-08",
      icon: AlertTriangle
    }
  ],
  complianceAreas: [
    {
      name: "GST Returns",
      score: 95,
      status: "compliant",
      description: "All returns filed on time"
    },
    {
      name: "Invoice Compliance",
      score: 88,
      status: "warning",
      description: "Minor formatting issues detected"
    },
    {
      name: "HSN Classification",
      score: 75,
      status: "error",
      description: "Updates required for 3 products"
    },
    {
      name: "Documentation",
      score: 92,
      status: "compliant",
      description: "All documents properly maintained"
    }
  ]
};

export default function CompliancePage() {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "compliant":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case "error":
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "warning":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "error":
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen flex bg-gray-50/50"
      data-testid="compliance-page"
    >
      <Sidebar />
      
      <main className="flex-1 ml-64 min-h-screen">
        <Header 
          title="Compliance"
          subtitle="Monitor your GST compliance status and regulatory requirements."
          icon={<Shield className="w-7 h-7 text-white" />}
        />
        
        <motion.div
          variants={containerVariants}
          className="p-6 space-y-6"
          data-testid="compliance-content"
        >
          {/* Compliance Overview Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glass-effect border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Overall Score</p>
                    <p className="text-3xl font-bold text-gray-900">{complianceData.overallScore}%</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <Progress value={complianceData.overallScore} className="mt-4" />
              </CardContent>
            </Card>

            <Card className="glass-effect border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Requirements</p>
                    <p className="text-3xl font-bold text-gray-900">{complianceData.completedRequirements}/{complianceData.totalRequirements}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">Completed</p>
              </CardContent>
            </Card>

            <Card className="glass-effect border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Critical Issues</p>
                    <p className="text-3xl font-bold text-red-600">{complianceData.criticalIssues}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">Need attention</p>
              </CardContent>
            </Card>

            <Card className="glass-effect border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Next Review</p>
                    <p className="text-lg font-bold text-gray-900">{complianceData.nextReview}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">Scheduled</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Compliance Areas */}
          <motion.div variants={itemVariants}>
            <Card className="glass-effect border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Compliance Areas
                </CardTitle>
                <CardDescription>
                  Detailed breakdown of compliance across different areas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {complianceData.complianceAreas.map((area, index) => (
                  <motion.div
                    key={area.name}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(area.status)}
                      <div>
                        <h4 className="font-semibold text-gray-900">{area.name}</h4>
                        <p className="text-sm text-gray-600">{area.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={area.score} className="w-24" />
                      <Badge className={getStatusColor(area.status)}>
                        {area.score}%
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activities */}
          <motion.div variants={itemVariants}>
            <Card className="glass-effect border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  Recent Activities
                </CardTitle>
                <CardDescription>
                  Latest compliance activities and updates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {complianceData.recentActivities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg"
                  >
                    {getActivityIcon(activity.type)}
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{activity.title}</h4>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.date}</p>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <motion.div variants={itemVariants} className="flex justify-center gap-4">
            <Button className="professional-button flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Run Compliance Check
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Generate Report
            </Button>
          </motion.div>
        </motion.div>
      </main>
    </motion.div>
  );
}