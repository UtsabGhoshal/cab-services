import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import UserAvatar from "@/components/UserAvatar";
import {
  Car,
  MapPin,
  Clock,
  Star,
  Shield,
  Phone,
  Users,
  Zap,
  Award,
  Heart,
  Download,
  Play,
  CheckCircle,
  ArrowRight,
  Smartphone,
  Globe,
  TrendingUp,
  DollarSign,
} from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-hidden">
      {/* Enhanced Animated Background Elements */}
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

      {/* Promotional Banner */}
      <div className="relative z-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 text-center overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-center space-x-4 text-sm font-medium animate-bounce">
            <Zap className="w-4 h-4" />
            <span>
              🎉 SPECIAL OFFER: Get 50% OFF your first 3 rides! Use code
              WELCOME50
            </span>
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="absolute inset-0 bg-white/10 transform -skew-y-1 animate-pulse"></div>
      </div>

      {/* Header with Enhanced Styling */}
      <header className="relative z-10 px-4 py-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 group cursor-pointer">
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
          </div>

          <UserAvatar />
        </div>
      </header>

      {/* Enhanced Hero Section with Images */}
      <main className="px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center py-12 lg:py-20">
            {/* Left Column - Enhanced Content */}
            <div className="space-y-8 animate-fade-in-left">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full border border-blue-200 shadow-sm animate-bounce">
                  <Zap className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-800">
                    🚀 Fastest Pickup in the City - Under 2 Minutes!
                  </span>
                </div>

                <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                  <span className="text-slate-800">Your Ride,</span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient-x">
                    Anytime
                  </span>
                  <br />
                  <span className="text-3xl lg:text-4xl text-slate-600 font-normal">
                    Anywhere in the City! 🌟
                  </span>
                </h1>

                <p className="text-xl lg:text-2xl text-slate-600 leading-relaxed">
                  Experience the future of transportation with our premium cab
                  service.
                  <span className="text-blue-600 font-semibold">
                    {" "}
                    Professional drivers
                  </span>
                  ,
                  <span className="text-purple-600 font-semibold">
                    {" "}
                    luxury vehicles
                  </span>
                  , and
                  <span className="text-pink-600 font-semibold">
                    {" "}
                    unmatched reliability
                  </span>
                  .
                </p>

                {/* Promotional Features */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">24/7 Service</span>
                  </div>
                  <div className="flex items-center space-x-2 text-blue-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">GPS Tracking</span>
                  </div>
                  <div className="flex items-center space-x-2 text-purple-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Safe & Secure</span>
                  </div>
                  <div className="flex items-center space-x-2 text-pink-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Fair Pricing</span>
                  </div>
                </div>
              </div>

              {/* Enhanced Booking Form */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-300 animate-pulse"></div>
                <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/40">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">
                      Book Your Premium Ride
                    </h3>
                    <p className="text-slate-600">
                      Get instant confirmation & live tracking
                    </p>
                  </div>

                  <div className="space-y-5">
                    <div className="relative group/input">
                      <div className="flex items-center space-x-4 p-5 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200 group-hover/input:border-blue-300 transition-all duration-300 group-hover/input:shadow-lg">
                        <div className="p-2 bg-blue-100 rounded-lg group-hover/input:bg-blue-200 transition-colors">
                          <MapPin className="w-5 h-5 text-blue-600" />
                        </div>
                        <input
                          type="text"
                          placeholder="Pickup location"
                          className="flex-1 bg-transparent border-none outline-none text-slate-700 placeholder-slate-500 text-lg"
                        />
                      </div>
                    </div>

                    <div className="relative group/input">
                      <div className="flex items-center space-x-4 p-5 bg-gradient-to-r from-slate-50 to-green-50 rounded-xl border border-slate-200 group-hover/input:border-green-300 transition-all duration-300 group-hover/input:shadow-lg">
                        <div className="p-2 bg-green-100 rounded-lg group-hover/input:bg-green-200 transition-colors">
                          <MapPin className="w-5 h-5 text-green-600" />
                        </div>
                        <input
                          type="text"
                          placeholder="Where to?"
                          className="flex-1 bg-transparent border-none outline-none text-slate-700 placeholder-slate-500 text-lg"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-7 text-xl font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        <Car className="w-6 h-6 mr-3 group-hover:animate-bounce" />
                        Book Your Premium Ride Now!
                        <Zap className="w-5 h-5 ml-3 group-hover:animate-spin" />
                      </Button>

                      <div className="text-center">
                        <p className="text-sm text-slate-600 mb-2">
                          New to QuickRide?
                        </p>
                        <Link to="/signup">
                          <Button
                            variant="outline"
                            className="border-green-300 text-green-600 hover:bg-green-50 hover:border-green-400 px-8 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                          >
                            Sign Up for FREE Rides! 🎁
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Stats Row */}
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center group cursor-pointer p-4 rounded-xl hover:bg-white/50 transition-all">
                  <div className="text-3xl font-bold text-blue-600 group-hover:scale-110 transition-transform mb-1">
                    50K+
                  </div>
                  <div className="text-sm text-slate-600">Happy Riders</div>
                  <div className="text-xs text-green-600 font-medium">
                    ↗ +15% this month
                  </div>
                </div>
                <div className="text-center group cursor-pointer p-4 rounded-xl hover:bg-white/50 transition-all">
                  <div className="text-3xl font-bold text-purple-600 group-hover:scale-110 transition-transform mb-1">
                    2.3M+
                  </div>
                  <div className="text-sm text-slate-600">Rides Completed</div>
                  <div className="text-xs text-green-600 font-medium">
                    ↗ +22% growth
                  </div>
                </div>
                <div className="text-center group cursor-pointer p-4 rounded-xl hover:bg-white/50 transition-all">
                  <div className="text-3xl font-bold text-pink-600 group-hover:scale-110 transition-transform mb-1">
                    4.9★
                  </div>
                  <div className="text-sm text-slate-600">User Rating</div>
                  <div className="text-xs text-green-600 font-medium">
                    🏆 Industry Best
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Enhanced Visual with Real Images */}
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
                    <h3 className="text-2xl font-bold mb-2">Premium Service</h3>
                    <p className="text-sm opacity-90">
                      Professional drivers, luxury experience
                    </p>
                  </div>
                  <div className="absolute top-6 right-6">
                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                      LIVE
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Grid with Enhanced Cards */}
              <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 shadow-2xl overflow-hidden">
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
                      Lightning Fast
                    </h3>
                    <p className="text-blue-100 text-sm">
                      Average pickup under 2 minutes
                    </p>
                    <div className="mt-3 flex items-center text-xs text-green-300">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      98% on-time rate
                    </div>
                  </div>

                  <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 text-white border border-white/20 hover:bg-white/25 transition-all duration-300 group cursor-pointer hover:scale-105">
                    <div className="p-3 bg-white/20 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                      <Shield className="w-8 h-8 group-hover:animate-pulse" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Ultra Safe</h3>
                    <p className="text-blue-100 text-sm">
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
                      Award Winning
                    </h3>
                    <p className="text-blue-100 text-sm">
                      Best cab service 2024
                    </p>
                    <div className="mt-3 flex items-center text-xs text-yellow-300">
                      <Star className="w-3 h-3 mr-1" />
                      Industry leader
                    </div>
                  </div>

                  <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 text-white border border-white/20 hover:bg-white/25 transition-all duration-300 group cursor-pointer hover:scale-105">
                    <div className="p-3 bg-white/20 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                      <DollarSign className="w-8 h-8 group-hover:animate-pulse" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Fair Pricing</h3>
                    <p className="text-blue-100 text-sm">
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
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-br from-green-400 to-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse animation-delay-1000"></div>
              <div className="absolute top-1/2 -right-4 w-24 h-24 bg-gradient-to-br from-pink-400 to-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse animation-delay-3000"></div>
            </div>
          </div>
        </div>

        {/* App Download Promotional Section */}
        <div className="max-w-7xl mx-auto py-16">
          <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 lg:p-16 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-white space-y-6">
                <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full border border-white/30">
                  <Smartphone className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Download Our App</span>
                </div>
                <h2 className="text-4xl lg:text-5xl font-bold">
                  Get the QuickRide App
                  <br />
                  <span className="text-yellow-300">50% OFF</span> First Ride!
                </h2>
                <p className="text-xl text-blue-100">
                  Book faster, track live, and enjoy exclusive app-only
                  discounts. Join over 50,000 happy riders!
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-xl font-semibold flex items-center space-x-3 hover:scale-105 transition-all">
                    <Download className="w-5 h-5" />
                    <span>Download for iOS</span>
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold flex items-center space-x-3 hover:scale-105 transition-all">
                    <Download className="w-5 h-5" />
                    <span>Download for Android</span>
                  </Button>
                </div>
              </div>
              <div className="relative">
                <img
                  src="https://images.pexels.com/photos/5077042/pexels-photo-5077042.jpeg"
                  alt="Mobile app booking interface"
                  className="w-80 h-96 object-cover rounded-2xl shadow-2xl mx-auto hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute -top-4 -right-4 bg-yellow-400 text-black px-4 py-2 rounded-full font-bold animate-bounce">
                  NEW!
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Testimonials with Images */}
        <div className="max-w-7xl mx-auto py-16">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full border border-blue-200 shadow-sm mb-6">
              <Heart className="w-4 h-4 text-red-500 mr-2" />
              <span className="text-sm font-medium text-blue-800">
                Customer Love
              </span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="text-slate-800">What Our</span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Customers Say
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group">
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-lg border border-white/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-center mb-6">
                  <img
                    src="https://images.pexels.com/photos/7693223/pexels-photo-7693223.jpeg"
                    alt="Happy customer Sarah"
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-slate-800">
                      Sarah Johnson
                    </h4>
                    <p className="text-sm text-slate-600">Business Executive</p>
                    <div className="flex text-yellow-400 mt-1">
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                    </div>
                  </div>
                </div>
                <p className="text-slate-600 italic">
                  "QuickRide has completely changed how I travel for work. The
                  drivers are professional, cars are always clean, and I never
                  wait more than 2 minutes!"
                </p>
              </div>
            </div>

            <div className="group">
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-lg border border-white/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-center mb-6">
                  <img
                    src="https://images.pexels.com/photos/4606402/pexels-photo-4606402.jpeg"
                    alt="Happy customer Mike"
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-slate-800">Mike Chen</h4>
                    <p className="text-sm text-slate-600">College Student</p>
                    <div className="flex text-yellow-400 mt-1">
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                    </div>
                  </div>
                </div>
                <p className="text-slate-600 italic">
                  "Best cab service in the city! The app is super easy to use,
                  prices are fair, and the drivers are always friendly. Highly
                  recommend!"
                </p>
              </div>
            </div>

            <div className="group">
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-lg border border-white/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-xl">D</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">David Park</h4>
                    <p className="text-sm text-slate-600">Marketing Manager</p>
                    <div className="flex text-yellow-400 mt-1">
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                    </div>
                  </div>
                </div>
                <p className="text-slate-600 italic">
                  "I've tried every cab service in town, but QuickRide is hands
                  down the best. Reliable, safe, and the customer service is
                  exceptional!"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Features Section with More Visuals */}
        <div className="max-w-7xl mx-auto py-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full border border-blue-200 shadow-sm mb-6">
              <Star className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-800">
                Why Choose Us
              </span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="text-slate-800">Experience the</span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                QuickRide Difference
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Join millions of satisfied customers who have made QuickRide their
              preferred choice for premium transportation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group cursor-pointer">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl blur opacity-0 group-hover:opacity-25 transition duration-300"></div>
                <div className="relative bg-white/70 backdrop-blur-lg rounded-2xl p-8 text-center shadow-lg border border-white/50 group-hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <Car className="w-10 h-10 text-blue-600 group-hover:animate-bounce" />
                  </div>
                  <h3 className="text-2xl font-semibold text-slate-800 mb-4">
                    Premium Fleet
                  </h3>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    Luxury vehicles maintained to perfection for your comfort
                    and style
                  </p>
                  <div className="text-sm text-blue-600 font-medium">
                    🚗 Latest models • 🛡️ Fully insured • ⭐ 5-star rated
                  </div>
                </div>
              </div>
            </div>

            <div className="group cursor-pointer">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur opacity-0 group-hover:opacity-25 transition duration-300"></div>
                <div className="relative bg-white/70 backdrop-blur-lg rounded-2xl p-8 text-center shadow-lg border border-white/50 group-hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <Globe className="w-10 h-10 text-purple-600 group-hover:animate-pulse" />
                  </div>
                  <h3 className="text-2xl font-semibold text-slate-800 mb-4">
                    Smart Tracking
                  </h3>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    Real-time GPS tracking with live updates and ETA
                    notifications
                  </p>
                  <div className="text-sm text-purple-600 font-medium">
                    📍 Live GPS • 📱 Push notifications • �� Accurate ETAs
                  </div>
                </div>
              </div>
            </div>

            <div className="group cursor-pointer">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-teal-600 rounded-3xl blur opacity-0 group-hover:opacity-25 transition duration-300"></div>
                <div className="relative bg-white/70 backdrop-blur-lg rounded-2xl p-8 text-center shadow-lg border border-white/50 group-hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <Zap className="w-10 h-10 text-green-600 group-hover:animate-spin" />
                  </div>
                  <h3 className="text-2xl font-semibold text-slate-800 mb-4">
                    Instant Booking
                  </h3>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    Book in seconds with our lightning-fast app and instant
                    confirmations
                  </p>
                  <div className="text-sm text-green-600 font-medium">
                    ⚡ 3-second booking • ✅ Instant confirmation • 🎯 AI
                    matching
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call-to-Action Section */}
        <div className="max-w-7xl mx-auto py-16">
          <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 rounded-3xl p-12 lg:p-20 text-center overflow-hidden">
            <div
              className={
                'absolute inset-0 bg-[url(\'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\')] opacity-50'
              }
            ></div>
            <div className="relative z-10 text-white space-y-8">
              <h2 className="text-4xl lg:text-6xl font-bold">
                Ready to Experience
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Premium Rides?
                </span>
              </h2>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Join thousands of satisfied customers. Download the app or book
                online now and get your first ride at 50% off!
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-12 py-6 text-xl font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                  <Car className="w-6 h-6 mr-3 group-hover:animate-bounce" />
                  Book Your First Ride
                  <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 px-12 py-6 text-xl font-semibold rounded-xl transition-all duration-300 hover:scale-105"
                >
                  <Play className="w-6 h-6 mr-3" />
                  Watch Demo
                </Button>
              </div>
              <div className="text-sm text-blue-200">
                ⭐ Rated 4.9/5 by 50,000+ riders • 🎉 Special offer ends soon!
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Enhanced Footer */}
      <footer className="relative bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 py-12 px-4 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-white/5 transform rotate-12 scale-150"></div>
        </div>
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
              <Car className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              QuickRide
            </span>
          </div>
          <p className="text-slate-300 mb-6">
            © 2024 QuickRide. All rights reserved. Your trusted premium ride
            partner.
          </p>
          <div className="flex justify-center space-x-8 text-sm text-slate-400 mb-6">
            <a href="#" className="hover:text-blue-400 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-blue-400 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-blue-400 transition-colors">
              Support
            </a>
            <a href="#" className="hover:text-blue-400 transition-colors">
              Driver Portal
            </a>
          </div>
          <div className="text-xs text-slate-500">
            🚗 Serving 25+ cities • 📱 Available 24/7 • 🌟 Premium service
            guaranteed
          </div>
        </div>
      </footer>
    </div>
  );
}
