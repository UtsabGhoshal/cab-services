import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/config";
import { firebaseDriverService } from "@/services/firebaseDriverService";
import { fallbackAuthService } from "@/services/fallbackAuthService";
import {
  Car,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  Shield,
  CheckCircle,
  AlertCircle,
  Crown,
  Building,
} from "lucide-react";

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function DriverLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    rememberMe: false,
  });

  const updateFormData = (field: keyof LoginFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      let user, driver;

      try {
        // Try Firebase Auth first
        const userCredential = await signInWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

        user = userCredential.user;
        driver = await firebaseDriverService.getDriverByEmail(formData.email);
      } catch (firebaseError: any) {
        console.warn("Firebase auth failed, using fallback:", firebaseError.message);

        // Use fallback auth service
        const fallbackCredential = await fallbackAuthService.signInWithEmailAndPassword(
          formData.email,
          formData.password
        );

        user = fallbackCredential.user;
        driver = await fallbackAuthService.getDriverByEmail(formData.email);

        toast({
          title: "Development Mode",
          description: "Using fallback authentication for development.",
        });
      }

      if (!driver) {
        toast({
          title: "Driver Not Found",
          description: "No driver account found with this email. Please contact support.",
          variant: "destructive",
        });
        return;
      }

      if (driver.status !== "active") {
        toast({
          title: "Account Inactive",
          description: "Your driver account is pending approval or inactive. Please contact support.",
          variant: "destructive",
        });
        return;
      }

      // Store driver info in localStorage
      const driverSession = {
        id: driver.id,
        uid: user.uid,
        email: user.email,
        name: driver.name,
        phone: driver.phone,
        driverType: driver.driverType,
        status: driver.status,
        vehicleNumber: driver.vehicleNumber,
        vehicleModel: driver.vehicleModel,
        licenseNumber: driver.licenseNumber,
        averageRating: driver.averageRating,
        totalRides: driver.totalRides,
        totalEarnings: driver.totalEarnings,
        totalKmDriven: driver.totalKmDriven,
        acceptanceRate: driver.acceptanceRate,
        completionRate: driver.completionRate,
        onlineHours: driver.onlineHours,
        joinDate: driver.joinDate,
        createdAt: driver.createdAt
      };

      localStorage.setItem("uride_driver", JSON.stringify(driverSession));
      localStorage.setItem("uride_driver_token", await user.getIdToken());

      if (formData.rememberMe) {
        localStorage.setItem("uride_driver_remember", "true");
      }

      toast({
        title: "Welcome Back! 🚗",
        description: "Login successful. Redirecting to dashboard...",
      });
      navigate("/driver-dashboard");

    } catch (error: any) {
      console.error("Driver login error:", error);
      let errorMessage = "An error occurred during login. Please try again.";

      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed login attempts. Please try again later.";
      } else if (error.code === "auth/user-disabled") {
        errorMessage = "This account has been disabled. Please contact support.";
      }

      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (type: "owner" | "fleet") => {
    const demoCredentials = {
      owner: {
        email: "rajesh.driver@uride.com",
        password: "demo123",
        type: "Vehicle Owner Driver",
      },
      fleet: {
        email: "amit.fleet@uride.com",
        password: "demo123",
        type: "Fleet Driver",
      }
    };

    const demo = demoCredentials[type];
    setFormData(prev => ({ ...prev, email: demo.email, password: demo.password }));

    try {
      setIsLoading(true);

      let user, driver;

      try {
        // Try Firebase Auth first
        const userCredential = await signInWithEmailAndPassword(
          auth,
          demo.email,
          demo.password
        );

        user = userCredential.user;
        driver = await firebaseDriverService.getDriverByEmail(demo.email);
      } catch (firebaseError: any) {
        console.warn("Firebase demo login failed, using fallback:", firebaseError.message);

        // Use fallback auth service
        const fallbackCredential = await fallbackAuthService.signInWithEmailAndPassword(
          demo.email,
          demo.password
        );

        user = fallbackCredential.user;
        driver = await fallbackAuthService.getDriverByEmail(demo.email);

        toast({
          title: "Development Mode",
          description: "Using demo fallback authentication.",
        });
      }

      if (!driver) {
        toast({
          title: "Demo Driver Not Found",
          description: "Demo driver profile not found. Please contact support.",
          variant: "destructive",
        });
        return;
      }

      if (driver.status !== "active") {
        toast({
          title: "Demo Account Inactive",
          description: "Demo driver account is not active. Please contact support.",
          variant: "destructive",
        });
        return;
      }

      // Store driver info in localStorage
      const driverSession = {
        id: driver.id,
        uid: user.uid,
        email: user.email,
        name: driver.name,
        phone: driver.phone,
        driverType: driver.driverType,
        status: driver.status,
        vehicleNumber: driver.vehicleNumber,
        vehicleModel: driver.vehicleModel,
        licenseNumber: driver.licenseNumber,
        averageRating: driver.averageRating,
        totalRides: driver.totalRides,
        totalEarnings: driver.totalEarnings,
        totalKmDriven: driver.totalKmDriven,
        acceptanceRate: driver.acceptanceRate,
        completionRate: driver.completionRate,
        onlineHours: driver.onlineHours,
        joinDate: driver.joinDate,
        createdAt: driver.createdAt
      };

      localStorage.setItem("uride_driver", JSON.stringify(driverSession));
      localStorage.setItem("uride_driver_token", await user.getIdToken());

      toast({
        title: "Demo Login Successful! 🚗",
        description: `Logged in as ${demo.type}`,
      });

      setTimeout(() => {
        navigate("/driver-dashboard");
      }, 1000);

    } catch (error: any) {
      console.error("Demo login error:", error);

      let errorMessage = "Demo login failed. Please try again.";

      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        errorMessage = "Demo user not found. Please contact support to set up demo accounts.";
      }

      toast({
        title: "Demo Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-white/20">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  URide
                </span>
                <div className="text-xs text-gray-500 font-medium">
                  Driver Portal
                </div>
              </div>
            </Link>

            <div className="flex items-center space-x-4">
              <Link
                to="/signup"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Passenger Login
              </Link>
              <Link
                to="/driver-signup"
                className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
              >
                New Driver? Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Benefits */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome Back,{" "}
                <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  Driver!
                </span>
              </h1>
              <p className="text-xl text-gray-600">
                Continue earning with URide's flexible driver platform
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 border-l-4 border-l-yellow-500 bg-yellow-50/50">
                <div className="flex items-center space-x-3 mb-3">
                  <Crown className="w-8 h-8 text-yellow-600" />
                  <h3 className="font-semibold text-gray-900">Own Vehicle</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Keep 95% of earnings</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>5% commission only</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Flexible hours</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6 border-l-4 border-l-blue-500 bg-blue-50/50">
                <div className="flex items-center space-x-3 mb-3">
                  <Building className="w-8 h-8 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Fleet Driver</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Per-km salary</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>No vehicle costs</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Insurance included</span>
                  </li>
                </ul>
              </Card>
            </div>

            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-6 rounded-xl border border-yellow-200">
              <div className="flex items-start space-x-3">
                <Shield className="w-6 h-6 text-yellow-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-2">
                    Secure & Trusted Platform
                  </h4>
                  <ul className="space-y-1 text-sm text-yellow-700">
                    <li>• Background verified drivers only</li>
                    <li>• 24/7 customer support</li>
                    <li>• Weekly earnings payouts</li>
                    <li>• Real-time ride tracking</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="max-w-md mx-auto w-full">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Driver Login
                </CardTitle>
                <p className="text-gray-600">
                  Sign in to access your driver dashboard
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateFormData("email", e.target.value)}
                        placeholder="Enter your email"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => updateFormData("password", e.target.value)}
                        placeholder="Enter your password"
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="rememberMe"
                        checked={formData.rememberMe}
                        onCheckedChange={(checked) => updateFormData("rememberMe", checked)}
                      />
                      <Label htmlFor="rememberMe" className="text-sm text-gray-600">
                        Remember me
                      </Label>
                    </div>
                    <Link
                      to="/forgot-password"
                      className="text-sm text-yellow-600 hover:text-yellow-700"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>

                {/* Demo Login Buttons */}
                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Try Demo</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleDemoLogin("owner")}
                      className="w-full border-yellow-200 text-yellow-700 hover:bg-yellow-50"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Demo: Vehicle Owner
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleDemoLogin("fleet")}
                      className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      <Building className="w-4 h-4 mr-2" />
                      Demo: Fleet Driver
                    </Button>
                  </div>
                </div>

                <div className="text-center pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{" "}
                    <Link
                      to="/driver-signup"
                      className="text-yellow-600 hover:text-yellow-700 font-medium"
                    >
                      Sign up as driver
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Help Section */}
            <div className="mt-6 text-center">
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                <a href="tel:+911234567890" className="flex items-center space-x-1 hover:text-yellow-600">
                  <Phone className="w-4 h-4" />
                  <span>Support: +91 12345 67890</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-yellow-100 to-orange-100 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Join Thousands of Successful Drivers
            </h2>
            <p className="text-gray-600">
              URide drivers earn more with better support and flexibility
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">5000+</div>
              <div className="text-sm text-gray-600">Active Drivers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">₹25K</div>
              <div className="text-sm text-gray-600">Avg Monthly Earnings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">4.8★</div>
              <div className="text-sm text-gray-600">Driver Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">24/7</div>
              <div className="text-sm text-gray-600">Support Available</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
