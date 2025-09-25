import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Upload, AlertTriangle } from "lucide-react";

const activities = [
  {
    title: "GSTR-1 filed successfully",
    description: "Filed for March 2024 • 2 hours ago",
    status: "Completed",
    icon: CheckCircle,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    badgeVariant: "default" as const,
    badgeClass: "bg-green-100 text-green-700"
  },
  {
    title: "Invoice data uploaded",
    description: "245 invoices processed • 4 hours ago",
    status: "Processing",
    icon: Upload,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    badgeVariant: "default" as const,
    badgeClass: "bg-blue-100 text-blue-700"
  },
  {
    title: "GSTR-3B due reminder",
    description: "Due date: 20th April 2024 • 1 day left",
    status: "Pending",
    icon: AlertTriangle,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    badgeVariant: "destructive" as const,
    badgeClass: "bg-orange-100 text-orange-700"
  }
];

export default function RecentActivities() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
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
      data-testid="recent-activities"
    >
      <Card className="glass-effect border-0 shadow-lg" data-testid="activities-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold text-gray-800" data-testid="activities-title">
            Recent Activities
          </CardTitle>
          <Button
            variant="link"
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            data-testid="view-all-activities"
          >
            View All
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {activities.map((activity, index) => {
            const Icon = activity.icon;
            
            return (
              <motion.div
                key={activity.title}
                variants={itemVariants}
                whileHover={{ x: 4, backgroundColor: "rgba(255, 255, 255, 0.8)" }}
                className="flex items-center space-x-4 p-4 bg-white/50 rounded-xl transition-all duration-300 cursor-pointer"
                data-testid={`activity-item-${index}`}
              >
                <div className={`p-2 ${activity.iconBg} rounded-full`}>
                  <Icon className={`w-4 h-4 ${activity.iconColor}`} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800" data-testid={`activity-title-${index}`}>
                    {activity.title}
                  </p>
                  <p className="text-sm text-gray-600" data-testid={`activity-description-${index}`}>
                    {activity.description}
                  </p>
                </div>
                <Badge
                  variant={activity.badgeVariant}
                  className={`${activity.badgeClass} hover:opacity-80`}
                  data-testid={`activity-status-${index}`}
                >
                  {activity.status}
                </Badge>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>
    </motion.div>
  );
}
