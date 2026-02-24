import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth";
import DashboardPage from "@/pages/dashboard";
import GstReturnsPage from "@/pages/gst-returns";
import AnalyticsPage from "@/pages/analytics";
import ReportsPage from "@/pages/reports";
import InvoiceUploadPage from "@/pages/invoice-upload";
import SettingsPage from "@/pages/setting";
import CompliancePage from "@/pages/compliance";
import AdminPanel from "@/pages/admin-panel";
import GovernmentUploadPage from "@/pages/government-upload";
import LoadingScreen from "@/components/ui/loading-screen";
import IntroAnimation from "@/components/intro/intro-animation";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { NotificationProvider } from "@/hooks/use-notification";
import { useEffect, useState } from "react";

function AppRouter() {
  const { user, isLoading } = useAuth();
  const [showIntro, setShowIntro] = useState(true);
  const [hasSeenIntro, setHasSeenIntro] = useState(false);

  const handleIntroComplete = () => {
    setShowIntro(false);
    setHasSeenIntro(true);
  };

  // Always show intro first on fresh app start, regardless of login status
  if (showIntro && !hasSeenIntro) {
    return <IntroAnimation onComplete={handleIntroComplete} />;
  }

  // Show loading screen only after intro is complete and during authentication
  if (isLoading && hasSeenIntro) {
    return <LoadingScreen />;
  }

  return (
    <AnimatePresence mode="wait">
      <Switch>
        <Route path="/" component={user ? DashboardPage : AuthPage} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/dashboard" component={user ? DashboardPage : AuthPage} />
        <Route path="/gst-returns" component={user ? GstReturnsPage : AuthPage} />
        <Route path="/analytics" component={user ? AnalyticsPage : AuthPage} />
        <Route path="/invoice-upload" component={user ? InvoiceUploadPage : AuthPage} />
        <Route path="/reports" component={user ? ReportsPage : AuthPage} />
        <Route path="/compliance" component={user ? CompliancePage : AuthPage} />
        <Route path="/settings" component={user ? SettingsPage : AuthPage} />
        <Route path="/admin" component={user ? AdminPanel : AuthPage} />
        <Route path="/government-upload" component={user ? GovernmentUploadPage : AuthPage} />
        <Route component={NotFound} />
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Reduced mount time to allow intro animation to show first
    const mountTimer = setTimeout(() => {
      setMounted(true);
    }, 300); // Minimal delay just for component initialization

    return () => clearTimeout(mountTimer);
  }, []);

  // Show minimal loading only during initial mount
  if (!mounted) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-blue-950 to-cyan-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <TooltipProvider>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="min-h-screen font-inter"
            >
              <AppRouter />
              <Toaster />
            </motion.div>
          </TooltipProvider>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
