import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Settings,
  User,
  CreditCard,
  Bell,
  Moon,
  Sun,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Sidebar from "@/components/dashboard/sidebar";
import Header from "@/components/dashboard/header";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [currentPlan, setCurrentPlan] = useState("free");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Initialize form fields with user data
  useEffect(() => {
    if (user) {
      // Split username into first and last name
      const nameParts = user.username?.split(" ") || [];
      setFirstName(nameParts[0] || "");
      setLastName(nameParts.slice(1).join(" ") || "");
      // For phone number, we would need to get it from the database
      // For now, we'll use a default value
      setPhoneNumber(user.phone_number || "");
    }
  }, [user]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  const handleSaveProfile = () => {
    // In a real app, this would save to the database
    const fullName = `${firstName} ${lastName}`.trim();
    
    toast({
      title: "Profile Updated",
      description: "Your profile settings have been saved successfully.",
    });
  };

  const handleUpgradeToPremium = () => {
    setCurrentPlan("premium");
    toast({
      title: "Subscription Activated",
      description:
        "Welcome to FinSync Premium! Your subscription is now active.",
    });
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen flex bg-transparent"
      data-testid="settings-page"
    >
      <Sidebar />

      <main className="flex-1 ml-64 min-h-screen">
        <Header
          title="Settings"
          subtitle="Manage your account preferences and subscription."
          icon={<Settings className="w-7 h-7 text-white" />}
        />

        <motion.div
          variants={containerVariants}
          className="p-6 space-y-6"
          data-testid="settings-content"
        >
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-card p-1 rounded-xl border border-border shadow-sm backdrop-blur-sm">
              <TabsTrigger
                value="profile"
                className="rounded-lg text-muted-foreground font-medium data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-none hover:bg-accent transition-all duration-200"
              >
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="subscription"
                className="rounded-lg text-muted-foreground font-medium data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-none hover:bg-accent transition-all duration-200"
              >
                Subscription
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="rounded-lg text-muted-foreground font-medium data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-none hover:bg-accent transition-all duration-200"
              >
                Notifications
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <motion.div variants={itemVariants}>
                <Card className="professional-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="w-5 h-5" />
                      <span>Profile Information</span>
                    </CardTitle>
                    <CardDescription>
                      Update your account details and personal information.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input 
                          id="firstName" 
                          value={firstName} 
                          onChange={(e) => setFirstName(e.target.value)} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input 
                          id="lastName" 
                          value={lastName} 
                          onChange={(e) => setLastName(e.target.value)} 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="bg-gray-100 cursor-not-allowed"
                      />
                      <p className="text-sm text-gray-500">
                        Email cannot be changed
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={user?.company_name || ""}
                        disabled
                        className="bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        value={phoneNumber} 
                        onChange={(e) => setPhoneNumber(e.target.value)} 
                        placeholder="+91 9876543210"
                      />
                    </div>
                    <Button
                      onClick={handleSaveProfile}
                      className="w-full md:w-auto"
                    >
                      Save Changes
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="subscription" className="space-y-6">
              <motion.div variants={itemVariants}>
                <Card className="professional-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CreditCard className="w-5 h-5" />
                      <span>Current Plan</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {currentPlan === "premium"
                            ? "Premium Plan"
                            : "Free Plan"}
                        </h3>
                        <p className="text-gray-600">
                          {currentPlan === "premium"
                            ? "Full access to all FinSync features"
                            : "Basic GST compliance features"}
                        </p>
                      </div>
                      {currentPlan === "premium" && (
                        <Badge variant="default" className="bg-green-600">
                          Active
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {currentPlan === "free" && (
                <motion.div variants={itemVariants}>
                  <Card className="professional-card border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-blue-900">
                          Premium Plan
                        </span>
                        <Badge
                          variant="secondary"
                          className="bg-blue-100 text-blue-800"
                        >
                          Recommended
                        </Badge>
                      </CardTitle>
                      <CardDescription className="text-blue-700">
                        Unlock advanced GST analytics, unlimited file uploads,
                        and priority support.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-blue-900">
                          ₹1,000
                        </div>
                        <div className="text-gray-600">per month</div>
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900">
                          Premium Features:
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {[
                            "Unlimited invoice processing",
                            "Advanced GST analytics",
                            "Priority customer support",
                            "Custom report generation",
                            "API access for integrations",
                            "Multi-user collaboration",
                            "Advanced compliance alerts",
                            "Export to multiple formats",
                          ].map((feature, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2"
                            >
                              <Check className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-gray-700">
                                {feature}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button
                        onClick={handleUpgradeToPremium}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
                        size="lg"
                      >
                        Upgrade to Premium
                      </Button>

                      <p className="text-xs text-gray-500 text-center">
                        Cancel anytime. No hidden fees. 30-day money-back
                        guarantee.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {currentPlan === "premium" && (
                <motion.div variants={itemVariants}>
                  <Card className="professional-card">
                    <CardHeader>
                      <CardTitle>Billing Information</CardTitle>
                      <CardDescription>
                        Manage your subscription and billing details.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                        <div>
                          <h3 className="font-semibold text-green-800">
                            Next Billing Date
                          </h3>
                          <p className="text-green-600">February 26, 2025</p>
                        </div>
                        <div className="text-right">
                          <h3 className="font-semibold text-green-800">
                            Amount
                          </h3>
                          <p className="text-green-600">₹1,000</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline">Update Payment Method</Button>
                        <Button variant="outline">Download Invoice</Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <motion.div variants={itemVariants}>
                <Card className="professional-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Bell className="w-5 h-5" />
                      <span>Notification Preferences</span>
                    </CardTitle>
                    <CardDescription>
                      Control how you receive notifications and alerts.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Push Notifications</Label>
                        <p className="text-sm text-gray-600">
                          Receive notifications in your browser
                        </p>
                      </div>
                      <Switch
                        checked={notifications}
                        onCheckedChange={setNotifications}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-gray-600">
                          Receive updates via email
                        </p>
                      </div>
                      <Switch
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>

                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </motion.div>
  );
}
