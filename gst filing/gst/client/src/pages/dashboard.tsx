import { motion } from "framer-motion";
import { LayoutDashboard } from "lucide-react";
import Sidebar from "@/components/dashboard/sidebar";
import Header from "@/components/dashboard/header";
import StatsCards from "@/components/dashboard/stats-cards";
import Charts from "@/components/dashboard/charts";
import RecentActivities from "@/components/dashboard/recent-activities";

export default function DashboardPage() {
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
      data-testid="dashboard-page"
    >
      <Sidebar />
      
      <main className="flex-1 ml-64 min-h-screen">
        <Header 
          title="Dashboard Overview"
          subtitle="Welcome back! Here's what's happening with your GST compliance."
          icon={<LayoutDashboard className="w-7 h-7 text-white" />}
        />
        
        <motion.div
          variants={containerVariants}
          className="p-6 space-y-8"
          data-testid="dashboard-content"
        >
          <motion.div variants={itemVariants}>
            <StatsCards />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Charts />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <RecentActivities />
          </motion.div>
          
        </motion.div>
      </main>
    </motion.div>
  );
}
