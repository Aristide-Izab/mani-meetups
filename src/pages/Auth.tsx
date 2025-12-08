import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Session } from "@supabase/supabase-js";
import Navbar from "@/components/Navbar";
import { Sparkles, Briefcase, ArrowRight, ArrowLeft, User, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type SignupStep = "type" | "details";

const Auth = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [signupStep, setSignupStep] = useState<SignupStep>("type");

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [userType, setUserType] = useState<"customer" | "business" | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        navigate("/dashboard");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Logged in successfully!");
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userType) {
      toast.error("Please select an account type");
      setSignupStep("type");
      return;
    }
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: {
        data: {
          full_name: fullName,
          user_type: userType,
          phone: phone,
        },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Account created successfully!");
    }
    setLoading(false);
  };

  const handleTypeSelection = (type: "customer" | "business") => {
    setUserType(type);
    setSignupStep("details");
  };

  const handleBackToTypeSelection = () => {
    setSignupStep("type");
  };

  // Reset signup step when switching tabs
  useEffect(() => {
    if (activeTab === "login") {
      setSignupStep("type");
      setUserType(null);
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-32 pb-16">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-hero bg-clip-text text-transparent">
              Welcome to Meet&Mani
            </h1>
            <p className="text-muted-foreground">
              Connect with nail techs at your favorite malls
            </p>
          </div>

          <Card className="shadow-elegant overflow-hidden">
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
              <CardDescription>Sign in or create an account to continue</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full bg-gradient-hero" disabled={loading}>
                      {loading ? "Logging in..." : "Login"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="min-h-[400px]">
                  <AnimatePresence mode="wait">
                    {signupStep === "type" ? (
                      <motion.div
                        key="type-selection"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                      >
                        <div className="text-center py-4">
                          <h3 className="text-lg font-semibold text-foreground mb-2">
                            Choose Your Account Type
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Select how you'd like to use Meet&Mani
                          </p>
                        </div>

                        {/* Customer Card */}
                        <button
                          type="button"
                          onClick={() => handleTypeSelection("customer")}
                          className="w-full group relative overflow-hidden rounded-xl border-2 border-border bg-card p-6 text-left transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/10"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="relative flex items-start gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-hero text-primary-foreground shadow-md">
                              <User className="h-7 w-7" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
                                Customer
                                <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                              </h4>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                Book nail services and meet talented nail techs at malls near you
                              </p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                <span className="inline-flex items-center gap-1 rounded-full bg-secondary/80 px-2.5 py-1 text-xs text-secondary-foreground">
                                  <Sparkles className="h-3 w-3" />
                                  Browse businesses
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-secondary/80 px-2.5 py-1 text-xs text-secondary-foreground">
                                  Book appointments
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>

                        {/* Business Card */}
                        <button
                          type="button"
                          onClick={() => handleTypeSelection("business")}
                          className="w-full group relative overflow-hidden rounded-xl border-2 border-border bg-card p-6 text-left transition-all duration-300 hover:border-accent hover:shadow-lg hover:shadow-accent/10"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="relative flex items-start gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent/80 text-accent-foreground shadow-md">
                              <Building2 className="h-7 w-7" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
                                Nail Tech Business
                                <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                              </h4>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                Grow your nail business by connecting with customers at local malls
                              </p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                <span className="inline-flex items-center gap-1 rounded-full bg-secondary/80 px-2.5 py-1 text-xs text-secondary-foreground">
                                  <Briefcase className="h-3 w-3" />
                                  Manage bookings
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-secondary/80 px-2.5 py-1 text-xs text-secondary-foreground">
                                  Grow clientele
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="details-form"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <button
                          type="button"
                          onClick={handleBackToTypeSelection}
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Back to account type
                        </button>

                        <div className="mb-6 p-3 rounded-lg bg-secondary/50 border border-border">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                              userType === "customer" 
                                ? "bg-gradient-hero text-primary-foreground" 
                                : "bg-gradient-to-br from-accent to-accent/80 text-accent-foreground"
                            }`}>
                              {userType === "customer" ? <User className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {userType === "customer" ? "Customer Account" : "Business Account"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {userType === "customer" ? "Book nail services" : "Offer nail services"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <form onSubmit={handleSignup} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="full-name">Full Name</Label>
                            <Input
                              id="full-name"
                              type="text"
                              placeholder="John Doe"
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="signup-email">Email</Label>
                            <Input
                              id="signup-email"
                              type="email"
                              placeholder="you@example.com"
                              value={signupEmail}
                              onChange={(e) => setSignupEmail(e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone (Optional)</Label>
                            <Input
                              id="phone"
                              type="tel"
                              placeholder="+27 123 456 789"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="signup-password">Password</Label>
                            <Input
                              id="signup-password"
                              type="password"
                              value={signupPassword}
                              onChange={(e) => setSignupPassword(e.target.value)}
                              required
                            />
                          </div>
                          <Button type="submit" className="w-full bg-gradient-hero" disabled={loading}>
                            {loading ? "Creating account..." : "Create Account"}
                          </Button>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;
