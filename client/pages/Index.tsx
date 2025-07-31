import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import UserAvatar from "@/components/UserAvatar";
import { useAuth } from "@/contexts/AuthContext";
import {
  Car,
  MapPin,
  Clock,
  Star,
  Shield,
  Zap,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  IndianRupee,
  Globe,
  Award,
} from "lucide-react";

export default function Index() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 overflow-hidden">
      {/* Enhanced Animated Background Elements */}
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
      </div>

      {/* Header with Enhanced Styling */}
      <header className="relative z-10 px-4 py-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 group cursor-pointer">
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
          </div>

          <UserAvatar />
        </div>
      </header>

      {/* Enhanced Hero Section */}
      <main className="px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center py-12 lg:py-20">
            {/* Left Column - Enhanced Content */}
            <div className="space-y-8 animate-fade-in-left">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full border border-yellow-200 shadow-sm">
                  <Zap className="w-4 h-4 text-yellow-600 mr-2" />
                  <span className="text-sm font-medium text-yellow-800">
                    🚀 Fastest Pickup in the City - Under 2 Minutes!
                  </span>
                </div>

                <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                  <span className="text-slate-800">Your Ride,</span>
                  <br />
                  <span className="bg-gradient-to-r from-yellow-600 via-orange-600 to-amber-600 bg-clip-text text-transparent animate-gradient-x">
                    Anytime
                  </span>
                  <br />
                  <span className="text-3xl lg:text-4xl text-slate-600 font-normal">
                    Anywhere in the City! 🌟
                  </span>
                </h1>

                <p className="text-xl lg:text-2xl text-slate-600 leading-relaxed">
                  Experience reliable transportation with our premium cab
                  service.
                  <span className="text-yellow-600 font-semibold">
                    {" "}
                    Professional drivers
                  </span>
                  ,
                  <span className="text-orange-600 font-semibold">
                    {" "}
                    clean vehicles
                  </span>
                  , and
                  <span className="text-amber-600 font-semibold">
                    {" "}
                    affordable rates
                  </span>
                  .
                </p>

                {/* Service Features */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">24/7 Service</span>
                  </div>
                  <div className="flex items-center space-x-2 text-yellow-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">GPS Tracking</span>
                  </div>
                  <div className="flex items-center space-x-2 text-orange-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Safe & Secure</span>
                  </div>
                  <div className="flex items-center space-x-2 text-amber-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Fair Pricing</span>
                  </div>
                </div>
              </div>

              {/* Enhanced Booking Form */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-300 animate-pulse"></div>
                <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/40">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">
                      Book Your Ride
                    </h3>
                    <p className="text-slate-600">
                      Get instant confirmation & live tracking
                    </p>
                  </div>

                  <div className="space-y-5">
                    <div className="relative group/input">
                      <div className="flex items-center space-x-4 p-5 bg-gradient-to-r from-slate-50 to-yellow-50 rounded-xl border border-slate-200 group-hover/input:border-yellow-300 transition-all duration-300 group-hover/input:shadow-lg">
                        <div className="p-2 bg-yellow-100 rounded-lg group-hover/input:bg-yellow-200 transition-colors">
                          <MapPin className="w-5 h-5 text-yellow-600" />
                        </div>
                        <input
                          type="text"
                          placeholder="Connaught Place, New Delhi"
                          className="flex-1 bg-transparent border-none outline-none text-slate-700 placeholder-slate-500 text-lg"
                        />
                      </div>
                    </div>

                    <div className="relative group/input">
                      <div className="flex items-center space-x-4 p-5 bg-gradient-to-r from-slate-50 to-orange-50 rounded-xl border border-slate-200 group-hover/input:border-orange-300 transition-all duration-300 group-hover/input:shadow-lg">
                        <div className="p-2 bg-orange-100 rounded-lg group-hover/input:bg-orange-200 transition-colors">
                          <MapPin className="w-5 h-5 text-orange-600" />
                        </div>
                        <input
                          type="text"
                          placeholder="IGI Airport, Terminal 3"
                          className="flex-1 bg-transparent border-none outline-none text-slate-700 placeholder-slate-500 text-lg"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Link to="/booking">
                        <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white py-7 text-xl font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                          <Car className="w-6 h-6 mr-3 group-hover:animate-bounce" />
                          Book Your Ride Now!
                          <Zap className="w-5 h-5 ml-3 group-hover:animate-spin" />
                        </Button>
                      </Link>

                      <Link to="/places">
                        <Button
                          variant="outline"
                          className="w-full bg-white/80 backdrop-blur-md border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group"
                        >
                          <MapPin className="w-5 h-5 mr-3 group-hover:animate-pulse" />
                          Explore Nearby Places
                          <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>

                      {!user ? (
                        <div className="text-center">
                          <p className="text-sm text-slate-600 mb-2">
                            New to URide?
                          </p>
                          <Link to="/signup">
                            <Button
                              variant="outline"
                              className="border-green-300 text-green-600 hover:bg-green-50 hover:border-green-400 px-8 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                            >
                              Sign Up Now! 🎁
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="text-center">
                          <p className="text-sm text-slate-600 mb-2">
                            Welcome back, {user.name}! 👋
                          </p>
                          <Link to="/dashboard">
                            <Button
                              variant="outline"
                              className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 px-8 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                            >
                              Go to Dashboard 📊
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Stats Row */}
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center group cursor-pointer p-4 rounded-xl hover:bg-white/50 transition-all">
                  <div className="text-3xl font-bold text-yellow-600 group-hover:scale-110 transition-transform mb-1">
                    25K+
                  </div>
                  <div className="text-sm text-slate-600">Happy Riders</div>
                  <div className="text-xs text-green-600 font-medium">
                    ↗ +15% this month
                  </div>
                </div>
                <div className="text-center group cursor-pointer p-4 rounded-xl hover:bg-white/50 transition-all">
                  <div className="text-3xl font-bold text-orange-600 group-hover:scale-110 transition-transform mb-1">
                    1.2M+
                  </div>
                  <div className="text-sm text-slate-600">Rides Completed</div>
                  <div className="text-xs text-green-600 font-medium">
                    ↗ +22% growth
                  </div>
                </div>
                <div className="text-center group cursor-pointer p-4 rounded-xl hover:bg-white/50 transition-all">
                  <div className="text-3xl font-bold text-amber-600 group-hover:scale-110 transition-transform mb-1">
                    4.8★
                  </div>
                  <div className="text-sm text-slate-600">User Rating</div>
                  <div className="text-xs text-green-600 font-medium">
                    🏆 Highly Rated
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Enhanced Visual */}
            <div className="relative animate-fade-in-right">
              {/* Main Feature Image */}
              <div className="relative z-10 mb-8">
                <div className="relative overflow-hidden rounded-3xl shadow-2xl group">
                  <img
                    src="https://images.pexels.com/photos/4606402/pexels-photo-4606402.jpeg"
                    alt="Professional taxi service with happy customers"
                    className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                  <div className="absolute bottom-6 left-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">
                      Reliable Service
                    </h3>
                    <p className="text-sm opacity-90">
                      Professional drivers, comfortable rides
                    </p>
                  </div>
                  <div className="absolute top-6 right-6">
                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                      AVAILABLE
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Grid with Enhanced Cards */}
              <div className="relative bg-gradient-to-br from-yellow-500 via-orange-600 to-amber-600 rounded-3xl p-8 shadow-2xl overflow-hidden">
                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 left-0 w-full h-full bg-white/10 transform rotate-12 scale-150 animate-pulse"></div>
                  <div className="absolute top-0 left-0 w-full h-full bg-white/5 transform -rotate-12 scale-150 animate-pulse animation-delay-2000"></div>
                </div>

                <div className="relative grid grid-cols-2 gap-6">
                  <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 text-white border border-white/20 hover:bg-white/25 transition-all duration-300 group cursor-pointer hover:scale-105">
                    <div className="p-3 bg-white/20 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                      <Clock className="w-8 h-8 group-hover:animate-spin" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      Quick Service
                    </h3>
                    <p className="text-yellow-100 text-sm">
                      Average pickup under 3 minutes
                    </p>
                    <div className="mt-3 flex items-center text-xs text-green-300">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      95% on-time rate
                    </div>
                  </div>

                  <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 text-white border border-white/20 hover:bg-white/25 transition-all duration-300 group cursor-pointer hover:scale-105">
                    <div className="p-3 bg-white/20 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                      <Shield className="w-8 h-8 group-hover:animate-pulse" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Safe Rides</h3>
                    <p className="text-yellow-100 text-sm">
                      Verified drivers & live tracking
                    </p>
                    <div className="mt-3 flex items-center text-xs text-green-300">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      100% verified drivers
                    </div>
                  </div>

                  <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 text-white border border-white/20 hover:bg-white/25 transition-all duration-300 group cursor-pointer hover:scale-105">
                    <div className="p-3 bg-white/20 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                      <Award className="w-8 h-8 group-hover:animate-bounce" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      Quality Service
                    </h3>
                    <p className="text-yellow-100 text-sm">
                      Consistently high ratings
                    </p>
                    <div className="mt-3 flex items-center text-xs text-yellow-300">
                      <Star className="w-3 h-3 mr-1" />
                      Customer favorite
                    </div>
                  </div>

                  <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 text-white border border-white/20 hover:bg-white/25 transition-all duration-300 group cursor-pointer hover:scale-105">
                    <div className="p-3 bg-white/20 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                      <IndianRupee className="w-8 h-8 group-hover:animate-pulse" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Fair Pricing</h3>
                    <p className="text-yellow-100 text-sm">
                      Transparent, competitive rates
                    </p>
                    <div className="mt-3 flex items-center text-xs text-green-300">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      No hidden fees
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced decorative elements */}
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse animation-delay-1000"></div>
              <div className="absolute top-1/2 -right-4 w-24 h-24 bg-gradient-to-br from-orange-400 to-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse animation-delay-3000"></div>
            </div>
          </div>
        </div>

        {/* Enhanced Features Section */}
        <div className="max-w-7xl mx-auto py-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full border border-yellow-200 shadow-sm mb-6">
              <Star className="w-4 h-4 text-yellow-600 mr-2" />
              <span className="text-sm font-medium text-yellow-800">
                Why Choose Us
              </span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="text-slate-800">Experience the</span>
              <br />
              <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                URide Difference
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Join thousands of satisfied customers who have made URide their
              preferred choice for reliable transportation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group cursor-pointer">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-3xl blur opacity-0 group-hover:opacity-25 transition duration-300"></div>
                <div className="relative bg-white/70 backdrop-blur-lg rounded-2xl p-8 text-center shadow-lg border border-white/50 group-hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2">
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <Car className="w-10 h-10 text-yellow-600 group-hover:animate-bounce" />
                  </div>
                  <h3 className="text-2xl font-semibold text-slate-800 mb-4">
                    Clean Fleet
                  </h3>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    Well-maintained vehicles for your comfort and safety
                  </p>
                  <div className="text-sm text-yellow-600 font-medium">
                    🚗 Regular maintenance • 🛡️ Fully insured • ⭐ Clean
                    vehicles
                  </div>
                </div>
              </div>
            </div>

            <div className="group cursor-pointer">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-amber-600 rounded-3xl blur opacity-0 group-hover:opacity-25 transition duration-300"></div>
                <div className="relative bg-white/70 backdrop-blur-lg rounded-2xl p-8 text-center shadow-lg border border-white/50 group-hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <Globe className="w-10 h-10 text-orange-600 group-hover:animate-pulse" />
                  </div>
                  <h3 className="text-2xl font-semibold text-slate-800 mb-4">
                    Smart Tracking
                  </h3>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    Real-time GPS tracking with live updates and ETA
                    notifications
                  </p>
                  <div className="text-sm text-orange-600 font-medium">
                    📍 Live GPS • 📱 Push notifications • ⏱️ Accurate ETAs
                  </div>
                </div>
              </div>
            </div>

            <div className="group cursor-pointer">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-600 to-yellow-600 rounded-3xl blur opacity-0 group-hover:opacity-25 transition duration-300"></div>
                <div className="relative bg-white/70 backdrop-blur-lg rounded-2xl p-8 text-center shadow-lg border border-white/50 group-hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2">
                  <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <Zap className="w-10 h-10 text-amber-600 group-hover:animate-spin" />
                  </div>
                  <h3 className="text-2xl font-semibold text-slate-800 mb-4">
                    Easy Booking
                  </h3>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    Book in seconds with our user-friendly interface and instant
                    confirmations
                  </p>
                  <div className="text-sm text-amber-600 font-medium">
                    ⚡ Quick booking • ✅ Instant confirmation • 🎯 Smart
                    matching
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call-to-Action Section */}
        <div className="max-w-7xl mx-auto py-16">
          <div className="relative bg-gradient-to-br from-slate-900 via-yellow-900 to-orange-900 rounded-3xl p-12 lg:p-20 text-center overflow-hidden">
            <div
              className={
                'absolute inset-0 bg-[url(\'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\')] opacity-50'
              }
            ></div>
            <div className="relative z-10 text-white space-y-8">
              <h2 className="text-4xl lg:text-6xl font-bold">
                Ready to Experience
                <br />
                <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  Reliable Rides?
                </span>
              </h2>
              <p className="text-xl text-yellow-100 max-w-2xl mx-auto">
                Join thousands of satisfied customers. Book your ride now and
                experience the URide difference!
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link to="/booking">
                  <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-12 py-6 text-xl font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                    <Car className="w-6 h-6 mr-3 group-hover:animate-bounce" />
                    Book Your Ride
                    <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
              <div className="text-sm text-yellow-200">
                ⭐ Rated 4.8/5 by 25,000+ riders • 🚗 Available 24/7
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Enhanced Footer */}
      <footer className="relative bg-gradient-to-r from-slate-900 via-yellow-900 to-orange-900 py-12 px-4 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-white/5 transform rotate-12 scale-150"></div>
        </div>
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl">
              <Car className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              URide
            </span>
          </div>
          <p className="text-slate-300 mb-6">
            © 2024 URide. All rights reserved. Your trusted ride partner.
          </p>
          <div className="flex justify-center space-x-8 text-sm text-slate-400 mb-6">
            <a href="#" className="hover:text-yellow-400 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-yellow-400 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-yellow-400 transition-colors">
              Support
            </a>
            <a href="#" className="hover:text-yellow-400 transition-colors">
              Driver Portal
            </a>
          </div>
          <div className="text-xs text-slate-500">
            🚗 Serving multiple cities • 📱 Available 24/7 • 🌟 Quality service
            guaranteed
          </div>
        </div>
      </footer>
    </div>
  );
}
