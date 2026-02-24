import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { File, CheckCircle, AlertTriangle, TrendingUp } from "lucide-react";

const statsData = [
  {
    title: "Total GST Collection",
    value: "₹2,45,680",
    change: "+12%",
    icon: File,
    color: "from-blue-500 to-blue-600",
    progress: 75,
    changeType: "positive"
  },
  {
    title: "Processed Returns",
    value: "143",
    change: "+8%",
    icon: CheckCircle,
    color: "from-green-500 to-green-600",
    progress: 89,
    changeType: "positive"
  },
  {
    title: "Pending Actions",
    value: "5",
    change: "5 Pending",
    icon: AlertTriangle,
    color: "from-orange-500 to-orange-600",
    progress: 25,
    changeType: "warning"
  },
  {
    title: "Compliance Score",
    value: "94.2%",
    change: "+15%",
    icon: TrendingUp,
    color: "from-purple-500 to-purple-600",
    progress: 94,
    changeType: "positive"
  }
];

export default function StatsCards() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
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
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      data-testid="stats-cards"
    >
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        
        return (
          <motion.div
            key={stat.title}
            variants={cardVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="glass-effect hover-lift border-0 shadow-lg" data-testid={`stat-card-${index}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-xl`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <Badge
                    variant={stat.changeType === "positive" ? "default" : "destructive"}
                    className={`${
                      stat.changeType === "positive" 
                        ? "bg-green-100 text-green-600 hover:bg-green-200" 
                        : stat.changeType === "warning"
                        ? "bg-red-100 text-red-600 hover:bg-red-200"
                        : "bg-orange-100 text-orange-600 hover:bg-orange-200"
                    }`}
                    data-testid={`stat-badge-${index}`}
                  >
                    {stat.change}
                  </Badge>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-800 mb-1" data-testid={`stat-value-${index}`}>
                  {stat.value}
                </h3>
                <p className="text-gray-600 mb-4" data-testid={`stat-title-${index}`}>
                  {stat.title}
                </p>
                
                <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className={`bg-gradient-to-r ${stat.color} h-2 rounded-full progress-bar`}
                    initial={{ width: 0 }}
                    animate={{ width: `${stat.progress}%` }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                    data-testid={`stat-progress-${index}`}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
