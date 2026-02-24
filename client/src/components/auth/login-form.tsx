import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/use-auth";
import { useNotification } from "@/hooks/use-notification";
import { Mail, Lock, Eye, EyeOff, UserCircle, ArrowRight } from "lucide-react";

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

export default function LoginForm({ onSwitchToSignup }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login, isLoading } = useAuth();
  const { showNotification } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      showNotification("Login successful! Welcome back.", "success");
    } catch (error) {
      showNotification("Login failed. Please check your credentials.", "error");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await login("demo@example.com", "password"); // Mock Google login
      showNotification("Google sign-in successful!", "success");
    } catch (error) {
      showNotification("Google sign-in failed.", "error");
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="animate-scale-in"
      data-testid="login-form"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="inline-block p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4"
        >
          <UserCircle className="w-6 h-6 text-white" />
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-2" data-testid="login-title">
          Welcome Back
        </h2>
        <p className="text-gray-300" data-testid="login-subtitle">
          Sign in to your account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" data-testid="login-form-element">
        <div className="space-y-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input-enhanced w-full pl-10 pr-4 py-4 rounded-xl border border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white/95"
              required
              data-testid="input-email"
            />
          </div>
          
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input-enhanced w-full pl-10 pr-12 py-4 rounded-xl border border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white/95"
              required
              data-testid="input-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              data-testid="toggle-password"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
              ) : (
                <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember-me"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(!!checked)}
              data-testid="checkbox-remember"
            />
            <Label htmlFor="remember-me" className="text-sm text-gray-300">
              Remember me
            </Label>
          </div>
          <Button
            variant="link"
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors p-0"
            data-testid="link-forgot-password"
          >
            Forgot password?
          </Button>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="button-ripple w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          data-testid="button-login"
        >
          {isLoading ? "Signing In..." : "Sign In"}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/20"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-slate-800 text-gray-400">Or continue with</span>
          </div>
        </div>

        <Button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 border border-white/20"
          data-testid="button-google-login"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>Sign in with Google</span>
        </Button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-gray-400">
          Don't have an account?{" "}
          <Button
            variant="link"
            onClick={onSwitchToSignup}
            className="text-blue-400 hover:text-blue-300 font-semibold transition-colors p-0"
            data-testid="link-signup"
          >
            Sign up
          </Button>
        </p>
      </div>
    </motion.div>
  );
}
