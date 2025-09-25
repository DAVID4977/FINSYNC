import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { Search, User, LogOut, Settings, UserCircle, FileText, BarChart3, AlertTriangle, Building, Home } from "lucide-react";
import { useLocation } from "wouter";

interface HeaderProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

export default function Header({ title, subtitle, icon }: HeaderProps) {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const headerVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.header
      variants={headerVariants}
      initial="hidden"
      animate="visible"
      className="glass-effect backdrop-blur-sm p-6 sticky top-0 z-30"
      data-testid="dashboard-header"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-4 bg-blue-600 rounded-2xl">
            {icon}
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900" data-testid="header-title">
              {title}
            </h1>
            <p className="text-gray-600 mt-2 text-lg" data-testid="header-subtitle">
              {subtitle}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover-lift"
                  data-testid="search-button"
                >
                  <Search className="w-5 h-5 text-gray-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 mt-2">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium text-gray-900">Quick Navigation</p>
                  <p className="text-xs text-gray-500">Jump to different sections</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => setLocation("/dashboard")}
                >
                  <Home className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => setLocation("/gst-returns")}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  <span>GST Returns</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => setLocation("/reports")}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  <span>Reports</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => setLocation("/analytics")}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  <span>Analytics</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => setLocation("/invoice-upload")}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Invoice Upload</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => setLocation("/compliance")}
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  <span>Compliance</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => setLocation("/admin")}
                >
                  <Building className="mr-2 h-4 w-4" />
                  <span>Admin Panel</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center space-x-3 p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover-lift"
                  data-testid="user-menu-button"
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-blue-600">
                      <User className="w-4 h-4 text-white" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-gray-700 pr-2" data-testid="user-name-header">
                    {user?.name || "John Doe"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium text-gray-900" data-testid="dropdown-user-name">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500" data-testid="dropdown-user-email">
                    {user?.email}
                  </p>
                  {user?.company && (
                    <p className="text-xs text-gray-500" data-testid="dropdown-user-company">
                      {user.company}
                    </p>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer" 
                  onClick={() => setLocation("/settings")}
                  data-testid="profile-menu-item"
                >
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer" 
                  onClick={() => setLocation("/settings")}
                  data-testid="settings-menu-item"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50" 
                  onClick={logout}
                  data-testid="logout-menu-item"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
