import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { MoreHorizontal } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Charts() {
  const gstTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'GST Collection',
        data: [180000, 210000, 245000, 220000, 270000, 295000],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
      }
    ]
  };

  const complianceData = {
    labels: ['Completed', 'Pending', 'Overdue'],
    datasets: [
      {
        data: [85, 10, 5],
        backgroundColor: [
          'rgb(34, 197, 94)',
          'rgb(249, 115, 22)',
          'rgb(239, 68, 68)'
        ],
        borderWidth: 0,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          callback: function(value: any) {
            return '₹' + (value / 1000) + 'K';
          }
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        }
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const chartVariants = {
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
      className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      data-testid="charts-section"
    >
      <motion.div variants={chartVariants}>
        <Card className="chart-container border-0 shadow-lg" data-testid="gst-chart-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold text-gray-800" data-testid="gst-chart-title">
              Monthly GST Trends
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                data-testid="chart-filter-6m"
              >
                6M
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                data-testid="chart-filter-1y"
              >
                1Y
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64" data-testid="gst-chart">
              <Line data={gstTrendData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={chartVariants}>
        <Card className="chart-container border-0 shadow-lg" data-testid="compliance-chart-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold text-gray-800" data-testid="compliance-chart-title">
              Compliance Distribution
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              data-testid="chart-options"
            >
              <MoreHorizontal className="w-4 h-4 text-gray-600" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-64" data-testid="compliance-chart">
              <Doughnut data={complianceData} options={doughnutOptions} />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
