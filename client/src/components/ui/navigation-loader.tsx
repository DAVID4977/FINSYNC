import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function NavigationLoader() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center space-y-4"
      >
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-gray-700 font-medium">Loading...</p>
      </motion.div>
    </motion.div>
  );
}