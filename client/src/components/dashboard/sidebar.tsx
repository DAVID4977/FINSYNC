import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";

import { LogoText } from "@/components/ui/logo";
import {
  Gauge,
  File,
  BarChart3,
  Receipt,
  FileSpreadsheet,
  Shield,
  Settings,
  User,
  Upload
} from "lucide-react";
import { useLocation } from "wouter";

const navigation = [
  { name: "Dashboard", icon: Gauge, path: "/dashboard" },
  { name: "GST Returns", icon: File, path: "/gst-returns" },
  { name: "Analytics", icon: BarChart3, path: "/analytics" },
  { name: "Invoice Upload", icon: Receipt, path: "/invoice-upload" },
  { name: "Reports", icon: FileSpreadsheet, path: "/reports" },
  { name: "Compliance", icon: Shield, path: "/compliance" },
  { name: "Settings", icon: Settings, path: "/settings" },
];

export default function Sidebar() {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Load avatar from localStorage on component mount
  useEffect(() => {
    const savedAvatar = localStorage.getItem("user_avatar");
    if (savedAvatar) {
      setAvatarUrl(savedAvatar);
    }
  }, []);

  const [location, setLocation] = useLocation();

  const handleNavigation = async (path: string) => {
    if (location === path) return;
    
    // Small delay for smooth transition feel
    await new Promise(resolve => setTimeout(resolve, 100));
    setLocation(path);
  };

  // Function to get initials from user name
  const getUserInitials = (name: string | undefined) => {
    if (!name) return "JD"; // Default initials
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const sidebarVariants = {
    hidden: { x: -280, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.aside
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
      className="w-64 professional-sidebar text-white p-6 fixed h-full z-40"
      data-testid="sidebar"
    >
      <motion.div
        variants={itemVariants}
        className="mb-8"
        data-testid="sidebar-header"
      >
        <LogoText className="text-white" />
      </motion.div>

      <nav className="space-y-2" data-testid="sidebar-nav">
        {navigation.map((item, index) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <motion.div
              key={item.name}
              variants={itemVariants}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Button
                variant="ghost"
                onClick={() => handleNavigation(item.path)}
                className={`professional-nav-item w-full justify-start space-x-3 px-4 py-3 transition-all duration-200 ${
                  isActive
                    ? "professional-nav-item active"
                    : "text-gray-300 hover:text-white"
                }`}
                data-testid={`nav-item-${item.name.toLowerCase().replace(' ', '-')}`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Button>
            </motion.div>
          );
        })}
      </nav>

      <motion.div
        variants={itemVariants}
        className="absolute bottom-6 left-6 right-6"
        data-testid="sidebar-user"
      >
        <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt="User avatar" />
              ) : (
                <AvatarFallback className="bg-blue-600 text-white">
                  {getUserInitials(user?.username)}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <p className="font-semibold text-sm text-white" data-testid="user-name">
                {user?.username || "John Doe"}
              </p>
              <p className="text-xs text-gray-300" data-testid="user-plan">
                Enterprise User
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.aside>
  );
}
