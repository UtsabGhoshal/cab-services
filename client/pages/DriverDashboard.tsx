import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabaseAuthService } from "@/services/supabaseAuthService";
import { supabaseDriverService } from "@/services/supabaseDriverService";
import {
  Car,
  Navigation,
  Users,
  IndianRupee,
  Star,
  Clock,
  MapPin,
  Phone,
  Settings,
  Bell,
  LogOut,
  BarChart3,
  TrendingUp,
  Shield,
  Award,
  CheckCircle,
  AlertCircle,
  Zap,
  Timer,
  DollarSign,
} from "lucide-react";

interface DriverData {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicleInfo: any;
  rating: number;
  totalRides: number;
  status: string;
  isActive: boolean;
}

export default function DriverDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(false);
  const [driver, setDriver] = useState<DriverData | null>(null);
  const [stats, setStats] = useState({
    todayEarnings: 0,
    todayRides: 0,
    weeklyEarnings: 0,
    monthlyEarnings: 0,
    totalEarnings: 0,
    totalRides: 0,
    averageRating: 5.0,
    completionRate: 100,
  });
  const [currentRide, setCurrentRide] = useState(null);

  useEffect(() => {
    // Check if driver is logged in
    const driverData = localStorage.getItem("uride_driver");
    if (!driverData) {
      navigate("/driver-login");
      return;
    }

    try {
      const parsedDriver = JSON.parse(driverData);
      setDriver(parsedDriver);
      loadDriverStats(parsedDriver.id);
    } catch (error) {
      console.error("Error parsing driver data:", error);
      navigate("/driver-login");
    }
  }, [navigate]);

  const loadDriverStats = async (driverId: string) => {
    try {
      // In a real app, this would fetch from Supabase
      // For now, using mock data
      const mockStats = {
        todayEarnings: 1250,
        todayRides: 8,
        weeklyEarnings: 8750,
        monthlyEarnings: 32400,
        totalEarnings: 125600,
        totalRides: 487,
        averageRating: 4.8,
        completionRate: 96,
      };
      setStats(mockStats);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleStatusToggle = async (online: boolean) => {
    try {
      setIsOnline(online);
      if (driver) {
        // Update driver status in Supabase
        await supabaseDriverService.updateDriver(driver.id, {
          status: online ? "online" : "offline",
        });
      }
      
      toast({
        title: online ? "You're now online!" : "You're now offline",
        description: online 
          ? "You'll start receiving ride requests" 
          : "You won't receive any ride requests",
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update your status",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await supabaseAuthService.signOut();
      localStorage.removeItem("uride_driver");
      localStorage.removeItem("uride_driver_token");
      navigate("/driver-login");
      toast({
        title: "Logged out successfully",
        description: "Thank you for driving with URide!",
      });
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout fails, clear local storage and redirect
      localStorage.removeItem("uride_driver");
      localStorage.removeItem("uride_driver_token");
      navigate("/driver-login");
    }
  };

  if (!driver) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
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
                  Driver Dashboard
                </div>
              </div>
            </Link>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {isOnline ? "Online" : "Offline"}
                </span>
                <Switch
                  checked={isOnline}
                  onCheckedChange={handleStatusToggle}
                />
              </div>

              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-yellow-600">
                    {driver.name.charAt(0)}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {driver.name}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Status Banner */}
        <div className="mb-8">
          <Card className={`${isOnline ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                  <div>
                    <h3 className={`font-semibold ${isOnline ? 'text-green-800' : 'text-orange-800'}`}>
                      {isOnline ? 'You are online and ready for rides!' : 'You are currently offline'}
                    </h3>
                    <p className={`text-sm ${isOnline ? 'text-green-600' : 'text-orange-600'}`}>
                      {isOnline 
                        ? 'Passengers can find and book rides with you' 
                        : 'Go online to start receiving ride requests'
                      }
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => handleStatusToggle(!isOnline)}
                  className={isOnline ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'}
                >
                  {isOnline ? 'Go Offline' : 'Go Online'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Today's Earnings</p>
                  <p className="text-2xl font-bold text-green-800">₹{stats.todayEarnings}</p>
                  <p className="text-xs text-green-600">{stats.todayRides} rides completed</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <IndianRupee className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">This Week</p>
                  <p className="text-2xl font-bold text-blue-800">₹{stats.weeklyEarnings}</p>
                  <p className="text-xs text-blue-600">Average ₹{Math.round(stats.weeklyEarnings / 7)}/day</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Rating</p>
                  <p className="text-2xl font-bold text-purple-800">{stats.averageRating}★</p>
                  <p className="text-xs text-purple-600">{stats.totalRides} total rides</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-yellow-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-orange-800">{stats.completionRate}%</p>
                  <p className="text-xs text-orange-600">Excellent performance</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Ride / Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Navigation className="w-5 h-5 text-yellow-600" />
                  <span>Current Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentRide ? (
                  <div className="space-y-4">
                    {/* Current ride details would go here */}
                    <p className="text-gray-600">Ride in progress...</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Car className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">No active rides</h3>
                    <p className="text-gray-600 mb-4">
                      {isOnline ? 'Waiting for ride requests...' : 'Go online to receive ride requests'}
                    </p>
                    {!isOnline && (
                      <Button onClick={() => handleStatusToggle(true)} className="bg-yellow-600 hover:bg-yellow-700">
                        Go Online Now
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-yellow-600" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  View Ride History
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <IndianRupee className="w-4 h-4 mr-2" />
                  Earnings Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Car className="w-4 h-4 mr-2" />
                  Vehicle Settings
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Phone className="w-4 h-4 mr-2" />
                  Support & Help
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
