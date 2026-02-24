import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { Bell, Search, User, LogOut, Settings, UserCircle, Upload } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

export default function Header({ title, subtitle, icon }: HeaderProps) {
  const { user, logout } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load avatar from localStorage on component mount
  useEffect(() => {
    const savedAvatar = localStorage.getItem("user_avatar");
    if (savedAvatar) {
      setAvatarUrl(savedAvatar);
    }
  }, []);

  const headerVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  // Function to get initials from user name
  const getUserInitials = (name: string | undefined) => {
    if (!name) return "JD"; // Default initials
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  // Handle avatar file selection
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setAvatarUrl(imageUrl);
        localStorage.setItem("user_avatar", imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger file input when avatar is clicked
  const triggerFileInput = () => {
    fileInputRef.current?.click();
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
            <Button
              variant="outline"
              size="icon"
              className="relative p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover-lift"
              data-testid="notification-button"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs animate-pulse p-0"
                data-testid="notification-badge"
              >
                3
              </Badge>
            </Button>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              size="icon"
              className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover-lift"
              data-testid="search-button"
            >
              <Search className="w-5 h-5 text-gray-600" />
            </Button>
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
                    {avatarUrl ? (
                      <AvatarImage src={avatarUrl} alt="User avatar" />
                    ) : (
                      <AvatarFallback className="bg-blue-600 text-white">
                        {getUserInitials(user?.username)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span className="font-medium text-gray-700 pr-2" data-testid="user-name-header">
                    {user?.username || "John Doe"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium text-gray-900" data-testid="dropdown-user-name">
                    {user?.username}
                  </p>
                  <p className="text-xs text-gray-500" data-testid="dropdown-user-email">
                    {user?.email}
                  </p>
                  {user?.company_name && (
                    <p className="text-xs text-gray-500" data-testid="dropdown-user-company">
                      {user.company_name}
                    </p>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer" 
                  onClick={triggerFileInput}
                  data-testid="profile-menu-item"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  <span>Change Avatar</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" data-testid="settings-menu-item">
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
          
          {/* Hidden file input for avatar selection */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleAvatarChange}
          />
        </div>
      </div>
    </motion.header>
  );
}
