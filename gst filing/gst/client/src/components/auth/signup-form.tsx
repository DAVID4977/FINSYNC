import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/use-auth";
import { useNotification } from "@/hooks/use-notification";
import { User, Mail, Building, Lock, UserPlus } from "lucide-react";

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

export default function SignupForm({ onSwitchToLogin }: SignupFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const { register, isLoading } = useAuth();
  const { showNotification } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      showNotification("Please agree to the Terms of Service and Privacy Policy.", "error");
      return;
    }
    
    try {
      await register(email, password, `${firstName} ${lastName}`, company);
      showNotification("Account created successfully! Welcome to FinSync.", "success");
    } catch (error) {
      showNotification("Registration failed. Please try again.", "error");
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="animate-scale-in"
      data-testid="signup-form"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="inline-block p-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-full mb-4"
        >
          <UserPlus className="w-6 h-6 text-white" />
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-2" data-testid="signup-title">
          Create Account
        </h2>
        <p className="text-gray-300" data-testid="signup-subtitle">
          Join thousands of professionals
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" data-testid="signup-form-element">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <Input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="form-input-enhanced w-full pl-10 pr-4 py-4 rounded-xl border border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white/95"
              required
              data-testid="input-first-name"
            />
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <Input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="form-input-enhanced w-full pl-10 pr-4 py-4 rounded-xl border border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white/95"
              required
              data-testid="input-last-name"
            />
          </div>
        </div>
        
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
            <Building className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <Input
            type="text"
            placeholder="Company Name"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="form-input-enhanced w-full pl-10 pr-4 py-4 rounded-xl border border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white/95"
            required
            data-testid="input-company"
          />
        </div>
        
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input-enhanced w-full pl-10 pr-4 py-4 rounded-xl border border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white/95"
            required
            data-testid="input-password"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="agree-terms"
            checked={agreeTerms}
            onCheckedChange={(checked) => setAgreeTerms(!!checked)}
            data-testid="checkbox-terms"
          />
          <Label htmlFor="agree-terms" className="text-sm text-gray-300">
            I agree to the{" "}
            <Button variant="link" className="text-blue-400 hover:text-blue-300 p-0 h-auto">
              Terms of Service
            </Button>{" "}
            and{" "}
            <Button variant="link" className="text-blue-400 hover:text-blue-300 p-0 h-auto">
              Privacy Policy
            </Button>
          </Label>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="button-ripple w-full bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-green-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          data-testid="button-signup"
        >
          {isLoading ? "Creating Account..." : "Create Account"}
          <UserPlus className="w-4 h-4 ml-2" />
        </Button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-gray-400">
          Already have an account?{" "}
          <Button
            variant="link"
            onClick={onSwitchToLogin}
            className="text-blue-400 hover:text-blue-300 font-semibold transition-colors p-0"
            data-testid="link-login"
          >
            Sign in
          </Button>
        </p>
      </div>
    </motion.div>
  );
}
