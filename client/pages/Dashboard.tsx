import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import {
  Car,
  MapPin,
  Clock,
  Star,
  User,
  Settings,
  CreditCard,
  History,
  Bell,
  LogOut,
  Phone,
  Mail,
  Calendar,
  Award,
  Gift,
  TrendingUp,
  ArrowRight,
  IndianRupee,
  Shield,
  Loader,
} from "lucide-react";

interface Ride {
  id: string;
  from: string;
  to: string;
  date: Date;
  amount: number;
  status: string;
  driverName: string;
  rating?: number;
}

interface UserStats {
  totalRides: number;
  totalSpent: number;
  averageRating: number;
  memberLevel: string;
  joinDate: Date;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [recentRides, setRecentRides] = useState<Ride[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    logout();
  };

  const fetchUserData = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/user/${user.id}/data`);
      const data = await response.json();

      if (data.success) {
        setRecentRides(data.recentRides || []);
        setUserStats(data.stats || null);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [user?.id]);

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const diffTime = now.getTime() - dateObj.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today, ${dateObj.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
    } else if (diffDays === 1) {
      return `Yesterday, ${dateObj.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
    } else {
      return `${dateObj.toLocaleDateString("en-IN")}, ${dateObj.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            Please sign in to access your dashboard
          </h2>
          <Link to="/login">
            <Button>Go to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="relative z-10 px-4 py-6 lg:px-8 bg-white/80 backdrop-blur-md border-b border-white/20">
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
                URide
              </span>
              <div className="text-xs text-slate-500 font-medium">
                Your Trusted Ride Partner
              </div>
            </div>
          </Link>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-slate-600">
              <span>Welcome back,</span>
              <span className="font-semibold text-blue-600">{user.name}</span>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="px-4 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-full h-full bg-white/10 transform rotate-12 scale-150 animate-pulse"></div>
              </div>
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                      Welcome back, {user.name}! 👋
                    </h1>
                    <p className="text-xl text-blue-100">
                      Ready for your next premium ride?
                    </p>
                  </div>
                  <div className="hidden lg:block">
                    <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
                      {getInitials(user.name)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Recent Rides */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Book Action */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 shadow-lg text-white">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <Car className="w-6 h-6 mr-3" />
                  Ready for a ride?
                </h2>
                <p className="text-blue-100 mb-6">
                  Book your next premium ride in just a few clicks
                </p>
                <Button
                  onClick={() => navigate("/booking")}
                  className="bg-white text-blue-600 hover:bg-blue-50 py-3 px-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Car className="w-5 h-5 mr-3" />
                  Book a Ride Now
                  <ArrowRight className="w-5 h-5 ml-3" />
                </Button>
              </div>

              {/* Recent Rides */}
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/50">
                <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center">
                  <History className="w-6 h-6 mr-3 text-purple-600" />
                  Recent Rides
                </h2>
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader className="w-6 h-6 animate-spin text-blue-600" />
                      <span className="ml-2 text-slate-600">
                        Loading rides...
                      </span>
                    </div>
                  ) : recentRides.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <Car className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No rides yet. Book your first ride!</p>
                    </div>
                  ) : (
                    recentRides.map((ride, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Car className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-slate-800">
                              {ride.from} → {ride.to}
                            </div>
                            <div className="text-sm text-slate-500">
                              {formatDate(ride.date)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-slate-800">
                            ₹{ride.amount.toFixed(2)}
                          </div>
                          <div className="text-sm text-green-600">
                            {ride.status}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4 border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  View All Rides
                </Button>
              </div>
            </div>

            {/* Right Column - Profile & Stats */}
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/50">
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  Profile
                </h2>
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
                    {getInitials(user.name)}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    {user.name}
                  </h3>
                  <p className="text-slate-600">{user.email}</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-slate-600">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center space-x-3 text-slate-600">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">{user.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-3 text-slate-600">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">
                      Member since{" "}
                      {userStats?.joinDate
                        ? new Date(userStats.joinDate).toLocaleDateString(
                            "en-IN",
                          )
                        : "Dec 2024"}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4 border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>

              {/* Stats Card */}
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/50">
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                  Your Stats
                </h2>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Car className="w-5 h-5 text-blue-600" />
                        <span className="text-slate-700">Total Rides</span>
                      </div>
                      <span className="font-bold text-blue-600">
                        {userStats?.totalRides || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <IndianRupee className="w-5 h-5 text-green-600" />
                        <span className="text-slate-700">Total Spent</span>
                      </div>
                      <span className="font-bold text-green-600">
                        ₹{userStats?.totalSpent?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Star className="w-5 h-5 text-purple-600" />
                        <span className="text-slate-700">Avg Rating</span>
                      </div>
                      <span className="font-bold text-purple-600">
                        {userStats?.averageRating?.toFixed(1) || "0.0"}★
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Award className="w-5 h-5 text-orange-600" />
                        <span className="text-slate-700">Member Level</span>
                      </div>
                      <span className="font-bold text-orange-600">
                        {userStats?.memberLevel || "Bronze"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/50">
                <h2 className="text-xl font-bold text-slate-800 mb-4">
                  Quick Actions
                </h2>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-slate-200 hover:bg-slate-50"
                  >
                    <CreditCard className="w-4 h-4 mr-3" />
                    Payment Methods
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-slate-200 hover:bg-slate-50"
                  >
                    <Bell className="w-4 h-4 mr-3" />
                    Notifications
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-slate-200 hover:bg-slate-50"
                  >
                    <Gift className="w-4 h-4 mr-3" />
                    Rewards & Offers
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-slate-200 hover:bg-slate-50"
                  >
                    <Shield className="w-4 h-4 mr-3" />
                    Safety Center
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
