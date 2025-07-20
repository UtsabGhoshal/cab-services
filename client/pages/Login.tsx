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
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400 to-red-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-green-400 to-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000"></div>

        {/* Floating Car Icons */}
        <div className="absolute top-20 left-20 text-blue-300 opacity-30 animate-float">
          <Car className="w-8 h-8" />
        </div>
        <div className="absolute top-40 right-32 text-purple-300 opacity-30 animate-float animation-delay-1000">
          <Car className="w-6 h-6" />
        </div>
        <div className="absolute bottom-32 left-1/4 text-pink-300 opacity-30 animate-float animation-delay-3000">
          <Car className="w-10 h-10" />
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
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Car className="w-7 h-7 text-white transform group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full"></div>
            </div>
            <div>
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                QuickRide
              </span>
              <div className="text-xs text-slate-500 font-medium">
                Premium Cab Service
              </div>
            </div>
          </Link>

          <div className="flex items-center space-x-3">
            <Link to="/signup">
              <Button className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <User className="w-4 h-4 mr-2" />
                Sign Up
              </Button>
            </Link>
            <Link to="/">
              <Button
                variant="ghost"
                className="flex items-center space-x-2 hover:bg-blue-50 transition-all duration-300"
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
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Login Form */}
            <div className="animate-fade-in-left">
              <div className="max-w-md mx-auto lg:mx-0">
                <div className="text-center mb-8">
                  <h1 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-4">
                    Welcome Back
                    <br />
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      QuickRide
                    </span>
                  </h1>
                  <p className="text-xl text-slate-600">
                    Sign in to book your premium rides
                  </p>
                </div>

                {/* Login Form */}
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
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

                        if (!email || !password) {
                          setError("Please fill in all fields");
                          return;
                        }

                        const success = await login(email, password);
                        if (success) {
                          navigate("/");
                        } else {
                          setError("Invalid email or password");
                        }
                      }}
                    >
                      {/* Email Field */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                          Email Address
                        </label>
                        <div className="relative group/input">
                          <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200 group-hover/input:border-blue-300 transition-all duration-300">
                            <Mail className="w-5 h-5 text-blue-600" />
                            <input
                              type="email"
                              placeholder="Enter your email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="flex-1 bg-transparent border-none outline-none text-slate-700 placeholder-slate-500"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Password Field */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                          Password
                        </label>
                        <div className="relative group/input">
                          <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-slate-50 to-purple-50 rounded-xl border border-slate-200 group-hover/input:border-purple-300 transition-all duration-300">
                            <Lock className="w-5 h-5 text-purple-600" />
                            <input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="flex-1 bg-transparent border-none outline-none text-slate-700 placeholder-slate-500"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="text-slate-500 hover:text-purple-600 transition-colors"
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

                      {/* Remember Me / Forgot Password */}
                      <div className="flex items-center justify-between">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-600">
                            Remember me
                          </span>
                        </label>
                        <a
                          href="#"
                          className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          Forgot password?
                        </a>
                      </div>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        {isLoading ? (
                          <>
                            <div className="w-5 h-5 mr-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Signing In...
                          </>
                        ) : (
                          <>
                            <Car className="w-5 h-5 mr-3 group-hover:animate-bounce" />
                            Sign In
                            <Zap className="w-4 h-4 ml-3" />
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
                            or continue with
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Social Login */}
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

                    {/* Link to Sign Up */}
                    <div className="mt-6 text-center">
                      <p className="text-slate-600">
                        Don't have an account?{" "}
                        <Link
                          to="/signup"
                          className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                        >
                          Sign up here
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Features & Testimonial */}
            <div className="animate-fade-in-right">
              <div className="relative">
                {/* Main Feature Card */}
                <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 shadow-2xl overflow-hidden">
                  {/* Animated background pattern */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-0 w-full h-full bg-white/10 transform rotate-12 scale-150 animate-pulse"></div>
                    <div className="absolute top-0 left-0 w-full h-full bg-white/5 transform -rotate-12 scale-150 animate-pulse animation-delay-2000"></div>
                  </div>

                  <div className="relative text-white space-y-8">
                    <div>
                      <h2 className="text-3xl font-bold mb-4">
                        Join the QuickRide Family
                      </h2>
                      <p className="text-xl text-blue-100">
                        Experience premium transportation with trusted drivers
                        and luxury vehicles.
                      </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/15 backdrop-blur-md rounded-xl p-4 border border-white/20">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="p-2 bg-white/20 rounded-lg">
                            <Shield className="w-5 h-5" />
                          </div>
                          <span className="font-semibold">Verified Safe</span>
                        </div>
                        <p className="text-sm text-blue-100">
                          Background-checked drivers
                        </p>
                      </div>

                      <div className="bg-white/15 backdrop-blur-md rounded-xl p-4 border border-white/20">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="p-2 bg-white/20 rounded-lg">
                            <Zap className="w-5 h-5" />
                          </div>
                          <span className="font-semibold">Lightning Fast</span>
                        </div>
                        <p className="text-sm text-blue-100">
                          2-minute pickup time
                        </p>
                      </div>

                      <div className="bg-white/15 backdrop-blur-md rounded-xl p-4 border border-white/20">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="p-2 bg-white/20 rounded-lg">
                            <Star className="w-5 h-5" />
                          </div>
                          <span className="font-semibold">Top Rated</span>
                        </div>
                        <p className="text-sm text-blue-100">
                          4.9/5 customer rating
                        </p>
                      </div>

                      <div className="bg-white/15 backdrop-blur-md rounded-xl p-4 border border-white/20">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="p-2 bg-white/20 rounded-lg">
                            <MapPin className="w-5 h-5" />
                          </div>
                          <span className="font-semibold">Live Tracking</span>
                        </div>
                        <p className="text-sm text-blue-100">
                          Real-time updates
                        </p>
                      </div>
                    </div>

                    {/* Benefits List */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-300" />
                        <span>24/7 customer support</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-300" />
                        <span>No hidden fees or charges</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-300" />
                        <span>Premium vehicles only</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-300" />
                        <span>Easy cancellation policy</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/20">
                      <div className="text-center">
                        <div className="text-2xl font-bold">50K+</div>
                        <div className="text-sm text-blue-100">Happy Users</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">2.3M+</div>
                        <div className="text-sm text-blue-100">Rides</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">4.9★</div>
                        <div className="text-sm text-blue-100">Rating</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse"></div>
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-br from-green-400 to-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse animation-delay-1000"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
