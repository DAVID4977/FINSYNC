import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, AlertTriangle, X } from "lucide-react";

interface NotificationProps {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  onClose: (id: string) => void;
}

export default function Notification({ id, message, type, onClose }: NotificationProps) {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: AlertCircle,
  };

  const colors = {
    success: "text-green-500",
    error: "text-red-500",
    warning: "text-yellow-500",
    info: "text-blue-500",
  };

  const titles = {
    success: "Success!",
    error: "Error!",
    warning: "Warning!",
    info: "Info",
  };

  const Icon = icons[type];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-4 right-4 max-w-sm bg-white shadow-lg rounded-lg p-4 z-50 border"
        data-testid={`notification-${id}`}
      >
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <Icon className={`w-5 h-5 ${colors[type]}`} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800" data-testid="notification-title">
              {titles[type]}
            </p>
            <p className="text-sm text-gray-600" data-testid="notification-message">
              {message}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onClose(id)}
            className="text-gray-400 hover:text-gray-600 p-1"
            data-testid="notification-close"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
