import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Car,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Star,
  Shield,
  Zap,
  CheckCircle,
  User,
  Phone,
  MapPin,
  Calendar,
  Gift,
  Award,
  Globe,
  IndianRupee,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const { signup, isLoading } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-orange-400 to-red-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000"></div>

        {/* Floating Car Icons */}
        <div className="absolute top-20 left-20 text-yellow-300 opacity-30 animate-float">
          <Car className="w-8 h-8" />
        </div>
        <div className="absolute top-40 right-32 text-orange-300 opacity-30 animate-float animation-delay-1000">
          <Car className="w-6 h-6" />
        </div>
        <div className="absolute bottom-32 left-1/4 text-amber-300 opacity-30 animate-float animation-delay-3000">
          <Car className="w-10 h-10" />
        </div>
        <div className="absolute top-1/3 right-1/4 text-yellow-300 opacity-30 animate-float animation-delay-2000">
          <Gift className="w-7 h-7" />
        </div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 py-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center space-x-3 group cursor-pointer"
          >
            <div className="relative">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Car className="w-7 h-7 text-white transform group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full"></div>
            </div>
            <div>
              <span className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                URide
              </span>
              <div className="text-xs text-slate-500 font-medium">
                Your Trusted Ride Partner
              </div>
            </div>
          </Link>

          <div className="flex items-center space-x-3">
            <Link to="/login">
              <Button
                variant="ghost"
                className="flex items-center space-x-2 hover:bg-yellow-50 transition-all duration-300"
              >
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </Button>
            </Link>
            <Link to="/">
              <Button
                variant="ghost"
                className="flex items-center space-x-2 hover:bg-yellow-50 transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Column - Sign Up Form */}
            <div className="animate-fade-in-left">
              <div className="max-w-md mx-auto lg:mx-0">
                <div className="text-center mb-8">
                  <h1 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-4">
                    Join{" "}
                    <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                      URide
                    </span>
                    <br />
                    <span className="text-3xl">Today!</span>
                  </h1>
                  <p className="text-xl text-slate-600">
                    Create your account and start enjoying reliable rides
                  </p>
                </div>

                {/* Sign Up Form */}
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                  <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/40">
                    {error && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                        {error}
                      </div>
                    )}
                    <form
                      className="space-y-6"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        setError("");

                        if (
                          !formData.name ||
                          !formData.email ||
                          !formData.phone ||
                          !formData.password
                        ) {
                          setError("Please fill in all required fields");
                          return;
                        }

                        if (formData.password !== formData.confirmPassword) {
                          setError("Passwords do not match");
                          return;
                        }

                        if (formData.password.length < 6) {
                          setError("Password must be at least 6 characters");
                          return;
                        }

                        const success = await signup({
                          name: formData.name,
                          email: formData.email,
                          phone: formData.phone,
                          password: formData.password,
                        });

                        if (success) {
                          navigate("/");
                        } else {
                          setError(
                            "Failed to create account. Please try again.",
                          );
                        }
                      }}
                    >
                      <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">
                          Create Your Account
                        </h3>
                        <p className="text-slate-600">
                          Join thousands of happy riders today
                        </p>
                      </div>

                      {/* Full Name */}
                      <div className="space-y-2">
                        <label htmlFor="fullName" className="text-sm font-medium text-slate-700">
                          Full Name *
                        </label>
                        <div className="relative group/input">
                          <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-slate-50 to-yellow-50 rounded-xl border border-slate-200 group-hover/input:border-yellow-300 transition-all duration-300">
                            <User className="w-5 h-5 text-yellow-600" />
                            <input
                              id="fullName"
                              name="fullName"
                              type="text"
                              placeholder="Enter your full name"
                              value={formData.name}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  name: e.target.value,
                                })
                              }
                              className="flex-1 bg-transparent border-none outline-none text-slate-700 placeholder-slate-500"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-slate-700">
                          Email Address *
                        </label>
                        <div className="relative group/input">
                          <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-slate-50 to-orange-50 rounded-xl border border-slate-200 group-hover/input:border-orange-300 transition-all duration-300">
                            <Mail className="w-5 h-5 text-orange-600" />
                            <input
                              id="email"
                              name="email"
                              type="email"
                              placeholder="Enter your email address"
                              value={formData.email}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  email: e.target.value,
                                })
                              }
                              className="flex-1 bg-transparent border-none outline-none text-slate-700 placeholder-slate-500"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Phone Number */}
                      <div className="space-y-2">
                        <label htmlFor="phone" className="text-sm font-medium text-slate-700">
                          Phone Number *
                        </label>
                        <div className="relative group/input">
                          <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-slate-50 to-amber-50 rounded-xl border border-slate-200 group-hover/input:border-amber-300 transition-all duration-300">
                            <Phone className="w-5 h-5 text-amber-600" />
                            <input
                              id="phone"
                              name="phone"
                              type="tel"
                              placeholder="Enter your phone number"
                              value={formData.phone}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  phone: e.target.value,
                                })
                              }
                              className="flex-1 bg-transparent border-none outline-none text-slate-700 placeholder-slate-500"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Password */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                          Password *
                        </label>
                        <div className="relative group/input">
                          <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-slate-50 to-red-50 rounded-xl border border-slate-200 group-hover/input:border-red-300 transition-all duration-300">
                            <Lock className="w-5 h-5 text-red-600" />
                            <input
                              type={showPassword ? "text" : "password"}
                              placeholder="Create a strong password"
                              value={formData.password}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  password: e.target.value,
                                })
                              }
                              className="flex-1 bg-transparent border-none outline-none text-slate-700 placeholder-slate-500"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="text-slate-500 hover:text-red-600 transition-colors"
                            >
                              {showPassword ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Confirm Password */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                          Confirm Password *
                        </label>
                        <div className="relative group/input">
                          <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-slate-50 to-red-50 rounded-xl border border-slate-200 group-hover/input:border-red-300 transition-all duration-300">
                            <Lock className="w-5 h-5 text-red-600" />
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm your password"
                              value={formData.confirmPassword}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  confirmPassword: e.target.value,
                                })
                              }
                              className="flex-1 bg-transparent border-none outline-none text-slate-700 placeholder-slate-500"
                              required
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              className="text-slate-500 hover:text-red-600 transition-colors"
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Terms Agreement */}
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            className="w-5 h-5 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500 mt-1"
                          />
                          <span className="text-sm text-slate-600">
                            I agree to the{" "}
                            <a
                              href="#"
                              className="text-yellow-600 hover:underline font-medium"
                            >
                              Terms of Service
                            </a>{" "}
                            and{" "}
                            <a
                              href="#"
                              className="text-yellow-600 hover:underline font-medium"
                            >
                              Privacy Policy
                            </a>
                          </span>
                        </div>

                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-1"
                          />
                          <span className="text-sm text-slate-600">
                            I want to receive ride updates and offers via email
                            and SMS
                          </span>
                        </div>
                      </div>

                      {/* Create Account Button */}
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        {isLoading ? (
                          <>
                            <div className="w-5 h-5 mr-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Creating Account...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-5 h-5 mr-3 group-hover:animate-bounce" />
                            Create My Account
                            <Gift className="w-5 h-5 ml-3" />
                          </>
                        )}
                      </Button>
                    </form>

                    {/* Divider */}
                    <div className="my-6">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-slate-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-white text-slate-500">
                            or sign up with
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Social Sign Up */}
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        variant="outline"
                        className="py-3 border-2 hover:bg-gray-50 transition-all duration-300 hover:scale-105"
                      >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        Google
                      </Button>
                      <Button
                        variant="outline"
                        className="py-3 border-2 hover:bg-gray-50 transition-all duration-300 hover:scale-105"
                      >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                          />
                        </svg>
                        Facebook
                      </Button>
                    </div>

                    {/* Already have account */}
                    <div className="mt-6 text-center">
                      <p className="text-slate-600">
                        Already have an account?{" "}
                        <Link
                          to="/login"
                          className="text-yellow-600 hover:text-yellow-700 font-semibold transition-colors"
                        >
                          Sign in here
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Benefits & Features */}
            <div className="animate-fade-in-right">
              <div className="space-y-8">
                {/* Service Features */}
                <div className="bg-gradient-to-br from-yellow-500 via-orange-600 to-amber-600 rounded-3xl p-8 shadow-2xl overflow-hidden relative">
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-0 w-full h-full bg-white/5 transform -rotate-12 scale-150 animate-pulse animation-delay-2000"></div>
                  </div>

                  <div className="relative text-white space-y-6">
                    <h2 className="text-2xl font-bold mb-6">
                      Why Choose URide?
                    </h2>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Shield className="w-6 h-6 mb-2" />
                        <h4 className="font-semibold">Safe & Verified</h4>
                        <p className="text-sm opacity-90">
                          All drivers background checked
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Zap className="w-6 h-6 mb-2" />
                        <h4 className="font-semibold">Quick Service</h4>
                        <p className="text-sm opacity-90">
                          3-minute average pickup
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Globe className="w-6 h-6 mb-2" />
                        <h4 className="font-semibold">Live Tracking</h4>
                        <p className="text-sm opacity-90">
                          Real-time ride monitoring
                        </p>
                      </div>

                      <div className="space-y-2">
                        <IndianRupee className="w-6 h-6 mb-2" />
                        <h4 className="font-semibold">Fair Pricing</h4>
                        <p className="text-sm opacity-90">
                          Transparent rates in rupees
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/20">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold">25K+</div>
                          <div className="text-sm opacity-90">Happy Users</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">1.2M+</div>
                          <div className="text-sm opacity-90">Rides</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">4.8★</div>
                          <div className="text-sm opacity-90">Rating</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Testimonial */}
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/50">
                  <div className="flex items-center mb-4">
                    <img
                      src="https://images.pexels.com/photos/7693223/pexels-photo-7693223.jpeg"
                      alt="Happy customer"
                      className="w-12 h-12 rounded-full object-cover mr-4"
                    />
                    <div>
                      <h4 className="font-semibold text-slate-800">
                        Priya Sharma
                      </h4>
                      <div className="flex text-yellow-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-600 italic">
                    "URide has made my daily commute so much easier! The drivers
                    are professional, cars are clean, and the pricing is very
                    reasonable. Highly recommended!"
                  </p>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse animation-delay-1000"></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
