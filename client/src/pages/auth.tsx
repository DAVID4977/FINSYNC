import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InteractiveBackground } from "@/components/ui/interactive-background";
import { Mail, Lock, User, Building, Eye, EyeOff, Check, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, delay: number}>>([]);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    company: ""
  });
  const { login, register } = useAuth();
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);

  const dynamicTexts = [
    "Enterprise GST\nCompliance Suite",
    "AI-Powered\nTax Automation",
    "Real-time\nCompliance Tracking",
    "Smart Invoice\nProcessing"
  ];

  // Generate floating particles
  useEffect(() => {
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5
    }));
    setParticles(newParticles);

    // Dynamic text rotation
    const textInterval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % dynamicTexts.length);
    }, 4000);

    return () => clearInterval(textInterval);
  }, []);

  // Real-time validation
  const validateField = (field: string, value: string) => {
    const errors: {[key: string]: string} = {};

    switch (field) {
      case 'email':
        if (!value) {
          errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = 'Invalid email format';
        }
        break;
      case 'password':
        if (!value) {
          errors.password = 'Password is required';
        } else if (value.length < 6) {
          errors.password = 'Password must be at least 6 characters';
        }
        break;
      case 'name':
        if (!isLogin && !value) {
          errors.name = 'Full name is required';
        }
        break;
      case 'company':
        if (!isLogin && !value) {
          errors.company = 'Company name is required';
        }
        break;
    }

    setFormErrors(prev => ({ ...prev, ...errors }));
    return Object.keys(errors).length === 0;
  };

  // Check if field is valid
  const isFieldValid = (field: string, value: string) => {
    switch (field) {
      case 'email':
        return value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'password':
        return value && value.length >= 6;
      case 'name':
        return !isLogin ? value.length > 0 : true;
      case 'company':
        return !isLogin ? value.length > 0 : true;
      default:
        return true;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate all fields
    const emailValid = validateField('email', formData.email);
    const passwordValid = validateField('password', formData.password);
    const nameValid = isLogin || validateField('name', formData.name);
    const companyValid = isLogin || validateField('company', formData.company);

    if (!emailValid || !passwordValid || !nameValid || !companyValid) {
      setIsLoading(false);
      return;
    }

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast({
          title: "Login Successful",
          description: "Welcome to FinSync Enterprise",
        });
      } else {
        await register(formData);
        toast({
          title: "Registration Successful",
          description: "Your account has been created successfully. Please log in.",
        });
        // Switch to login tab after successful registration
        setIsLogin(true);
      }
    } catch (error: any) {
      toast({
        title: "Authentication Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear previous error and validate
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Real-time validation for better UX
    if (value) {
      validateField(field, value);
    }
  };

  const handleFieldFocus = (field: string) => {
    setFocusedField(field);
  };

  const handleFieldBlur = (field: string, value: string) => {
    setFocusedField(null);
    validateField(field, value);
  };

  return (
    <div className="h-screen relative overflow-hidden" ref={containerRef}>
      {/* Full Screen Interactive Financial Network Background */}
      <InteractiveBackground className="z-0" />

      {/* Right Side Login Panel */}
      <div className="absolute right-8 top-1/2 transform -translate-y-1/2 z-10">
        <div className="w-[450px] bg-black/20 backdrop-blur-sm relative overflow-hidden shadow-2xl rounded-2xl border border-cyan-400/30">
          <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-blue-900/20 to-cyan-900/15 backdrop-blur-sm rounded-2xl"></div>

          {/* Subtle Glow Effects */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            <motion.div
              className="absolute -top-16 -right-16 w-32 h-32 bg-gradient-to-br from-cyan-400/20 to-blue-400/15 rounded-full blur-2xl"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute -bottom-16 -left-16 w-32 h-32 bg-gradient-to-br from-blue-400/15 to-cyan-400/10 rounded-full blur-2xl"
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            />
          </div>

          <motion.div
            initial="hidden"
            animate="visible"
            className="relative z-10 p-6"
            data-testid="auth-page"
          >
            {/* Modern Header */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-4"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-lg border border-cyan-400/30">
                  <Lock className="w-6 h-6 text-white" />
                </div>
              </motion.div>

              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-2xl font-bold text-white mb-2 tracking-tight drop-shadow-lg"
              >
                {isLogin ? "Welcome Back" : "Join FinSync"}
              </motion.h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-cyan-200 text-base font-light"
              >
                {isLogin
                  ? "Access your dashboard"
                  : "Start your journey"
                }
              </motion.p>
            </div>

            {/* Modern Authentication Form */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="bg-black/10 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-cyan-400/20"
            >
              <Card className="border-0 shadow-none bg-transparent">
                <CardContent className="p-0">
                  <Tabs value={isLogin ? "login" : "register"} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4 bg-black/60 p-1 rounded-2xl border border-cyan-400/40 backdrop-blur-sm shadow-lg">
                      <TabsTrigger
                        value="login"
                        onClick={() => setIsLogin(true)}
                        data-testid="login-tab"
                        className="text-cyan-300/80 font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/30 data-[state=active]:to-blue-500/30 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/20 rounded-xl py-3 transition-all duration-300 data-[state=active]:border data-[state=active]:border-cyan-400/60 hover:text-cyan-200"
                      >
                        Sign In
                      </TabsTrigger>
                      <TabsTrigger
                        value="register"
                        onClick={() => setIsLogin(false)}
                        data-testid="register-tab"
                        className="text-cyan-300/80 font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/30 data-[state=active]:to-blue-500/30 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/20 rounded-xl py-3 transition-all duration-300 data-[state=active]:border data-[state=active]:border-cyan-400/60 hover:text-cyan-200"
                      >
                        Sign Up
                      </TabsTrigger>
                    </TabsList>

                    <form onSubmit={handleSubmit} className="space-y-3">
                      {/* Registration fields */}
                      {!isLogin && (
                        <>
                          <motion.div
                            className="space-y-2"
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.7 }}
                          >
                            <Label htmlFor="name" className="text-sm text-cyan-200 aesthetic-body mb-2 block flex items-center justify-between">
                              Full Name
                              {formData.name && isFieldValid('name', formData.name) && (
                                <motion.div
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  className="text-emerald-500"
                                >
                                  <Check className="w-4 h-4" />
                                </motion.div>
                              )}
                            </Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyan-400/70" />
                              <Input
                                id="name"
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                onFocus={() => handleFieldFocus('name')}
                                onBlur={() => handleFieldBlur('name', formData.name)}
                                placeholder="Enter your full name"
                                className="pl-10 bg-black/20 border-cyan-400/30 text-white placeholder:text-cyan-300/50 focus:border-cyan-400/60 focus:ring-cyan-400/30"
                              />
                            </div>
                            {formErrors.name && (
                              <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-400 text-xs flex items-center"
                              >
                                <AlertCircle className="w-3 h-3 mr-1" />
                                {formErrors.name}
                              </motion.p>
                            )}
                          </motion.div>

                          <motion.div
                            className="space-y-2"
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.8 }}
                          >
                            <Label htmlFor="company" className="text-sm text-cyan-200 aesthetic-body mb-2 block flex items-center justify-between">
                              Company Name
                              {formData.company && isFieldValid('company', formData.company) && (
                                <motion.div
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  className="text-emerald-500"
                                >
                                  <Check className="w-4 h-4" />
                                </motion.div>
                              )}
                            </Label>
                            <div className="relative">
                              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyan-400/70" />
                              <Input
                                id="company"
                                type="text"
                                value={formData.company}
                                onChange={(e) => handleInputChange('company', e.target.value)}
                                onFocus={() => handleFieldFocus('company')}
                                onBlur={() => handleFieldBlur('company', formData.company)}
                                placeholder="Enter your company name"
                                className="pl-10 bg-black/20 border-cyan-400/30 text-white placeholder:text-cyan-300/50 focus:border-cyan-400/60 focus:ring-cyan-400/30"
                              />
                            </div>
                            {formErrors.company && (
                              <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-400 text-xs flex items-center"
                              >
                                <AlertCircle className="w-3 h-3 mr-1" />
                                {formErrors.company}
                              </motion.p>
                            )}
                          </motion.div>
                        </>
                      )}

                      {/* Email field */}
                      <motion.div
                        className="space-y-2"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: isLogin ? 0.7 : 0.9 }}
                      >
                        <Label htmlFor="email" className="text-sm text-cyan-200 aesthetic-body mb-2 block flex items-center justify-between">
                          Email Address
                          {formData.email && isFieldValid('email', formData.email) && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="text-emerald-500"
                            >
                              <Check className="w-4 h-4" />
                            </motion.div>
                          )}
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyan-400/70" />
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            onFocus={() => handleFieldFocus('email')}
                            onBlur={() => handleFieldBlur('email', formData.email)}
                            placeholder="Enter your email"
                            className="pl-10 bg-black/20 border-cyan-400/30 text-white placeholder:text-cyan-300/50 focus:border-cyan-400/60 focus:ring-cyan-400/30"
                          />
                        </div>
                        {formErrors.email && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-400 text-xs flex items-center"
                          >
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {formErrors.email}
                          </motion.p>
                        )}
                      </motion.div>

                      {/* Password field */}
                      <motion.div
                        className="space-y-2"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: isLogin ? 0.8 : 1.0 }}
                      >
                        <Label htmlFor="password" className="text-sm text-cyan-200 aesthetic-body mb-2 block flex items-center justify-between">
                          Password
                          {formData.password && isFieldValid('password', formData.password) && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="text-emerald-500"
                            >
                              <Check className="w-4 h-4" />
                            </motion.div>
                          )}
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyan-400/70" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            onFocus={() => handleFieldFocus('password')}
                            onBlur={() => handleFieldBlur('password', formData.password)}
                            placeholder="Enter your password"
                            className="pl-10 pr-10 bg-black/20 border-cyan-400/30 text-white placeholder:text-cyan-300/50 focus:border-cyan-400/60 focus:ring-cyan-400/30"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-400/70 hover:text-cyan-300"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {formErrors.password && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-400 text-xs flex items-center"
                          >
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {formErrors.password}
                          </motion.p>
                        )}
                      </motion.div>

                      {/* Submit button */}
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: isLogin ? 0.9 : 1.1 }}
                        className="pt-2"
                      >
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium py-6 rounded-xl shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 border border-cyan-400/30"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {isLogin ? "Signing In..." : "Creating Account..."}
                            </>
                          ) : isLogin ? (
                            "Sign In"
                          ) : (
                            "Create Account"
                          )}
                        </Button>
                      </motion.div>
                    </form>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
