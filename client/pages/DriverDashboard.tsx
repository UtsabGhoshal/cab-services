import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useDriverService } from "@/hooks/useDriverService";
import { useAuth } from "@/contexts/AuthContext";
import { driverMatchingService } from "@/services/driverMatchingService";
import {
  Car,
  MapPin,
  Clock,
  IndianRupee,
  Star,
  User,
  Power,
  Navigation,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  Settings,
  Bell,
  Menu,
  X,
  Route,
  Timer,
  Target,
  Award,
  Activity,
  LogOut,
  Crown,
  Building,
  Fuel,
  Shield,
  Calculator,
  PieChart,
  BarChart3,
} from "lucide-react";

// Enhanced types for the new driver system
interface DriverType {
  type: "owner" | "fleet";
  vehicleId?: string;
  commissionRate?: number; // For vehicle owners (e.g., 0.05 for 5%)
  salaryPerKm?: number; // For fleet drivers (e.g., 12 for ₹12/km)
}

interface RideRequest {
  id: string;
  passengerName: string;
  pickup: {
    address: string;
    lat: number;
    lng: number;
  };
  destination: {
    address: string;
    lat: number;
    lng: number;
  };
  estimatedEarnings: number;
  driverEarnings: number; // After commission/salary calculation
  distance: number;
  duration: number;
  timestamp: Date;
  rideType: "economy" | "premium" | "luxury";
  fareBreakdown?: {
    baseFare: number;
    distanceFare: number;
    timeFare: number;
    total: number;
    commission?: number;
    driverPayout: number;
  };
}

interface OngoingRide {
  id: string;
  passengerName: string;
  passengerPhone: string;
  pickup: {
    address: string;
    lat: number;
    lng: number;
  };
  destination: {
    address: string;
    lat: number;
    lng: number;
  };
  totalFare: number;
  driverEarnings: number;
  status: "picking_up" | "en_route" | "arrived";
  startTime: Date;
  estimatedArrival: Date;
  distance: number;
}

interface RideHistory {
  id: string;
  passengerName: string;
  pickup: string;
  destination: string;
  totalFare: number;
  driverEarnings: number;
  commission?: number; // For vehicle owners
  kmDriven?: number; // For fleet drivers
  rating: number;
  date: Date;
  duration: number;
  distance: number;
}

interface DriverStats {
  // Earnings
  totalEarnings: number;
  todayEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  
  // Commission/Salary breakdown
  totalCommissionPaid?: number; // For vehicle owners
  totalKmSalary?: number; // For fleet drivers
  
  // Rides
  totalRides: number;
  todayRides: number;
  totalKmDriven: number;
  todayKmDriven: number;
  
  // Performance
  averageRating: number;
  onlineHours: number;
  acceptanceRate: number;
  completionRate: number;
  
  // Goals
  monthlyTarget?: number;
  targetProgress?: number;
}

interface DriverProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  driverType: DriverType;
  vehicleNumber?: string; // For vehicle owners
  vehicleModel?: string; // For vehicle owners
  assignedVehicle?: string; // For fleet drivers
  licenseNumber: string;
  rating: number;
  joinDate: Date;
  profilePhoto?: string;
  currentShift?: {
    startTime: Date;
    targetKm?: number;
    completedKm?: number;
  };
}

export default function DriverDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("requests");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOnlineState, setIsOnlineState] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Use Firebase driver service
  const driverService = useDriverService({
    driverId: user?.id || "driver_123",
    autoStart: true,
  });

  // Real driver profile from database
  const [driverProfile, setDriverProfile] = useState<DriverProfile>({
    id: user?.id || "driver_123",
    name: user?.name || "New Driver",
    phone: user?.phone || "",
    email: user?.email || "",
    driverType: {
      type: "owner", // Will be loaded from database
      commissionRate: 0.05, // 5% for vehicle owners
      salaryPerKm: undefined,
    },
    vehicleNumber: "",
    vehicleModel: "",
    licenseNumber: "",
    rating: 0, // Start with 0
    joinDate: new Date(),
    currentShift: undefined,
  });

  // Fleet driver demo profile
  const [fleetDriverProfile] = useState<DriverProfile>({
    id: "driver_456",
    name: "Amit Singh",
    phone: "+91 88888 12345",
    email: "amit.fleet@uride.com",
    driverType: {
      type: "fleet",
      salaryPerKm: 12, // ₹12 per km for fleet drivers
      commissionRate: undefined,
    },
    assignedVehicle: "URide Fleet #FL-089",
    vehicleModel: "Maruti Swift Dzire 2023",
    licenseNumber: "DL1420110054321",
    rating: 4.7,
    joinDate: new Date("2024-02-20"),
    currentShift: {
      startTime: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      targetKm: 120,
      completedKm: 65,
    },
  });

  // Use owner profile for demo, but could be fleet based on user type
  const currentProfile = driverProfile;
  const isFleetDriver = currentProfile.driverType.type === "fleet";

  const [driverStats, setDriverStats] = useState<DriverStats>({
    totalEarnings: 0, // Start with 0
    todayEarnings: 0,
    weeklyEarnings: 0,
    monthlyEarnings: 0,
    totalCommissionPaid: 0,
    totalKmSalary: 0,
    totalRides: 0,
    todayRides: 0,
    totalKmDriven: 0,
    todayKmDriven: 0,
    averageRating: 0,
    onlineHours: 0,
    acceptanceRate: 100, // Start with 100%
    completionRate: 100, // Start with 100%
    monthlyTarget: isFleetDriver ? 2000 : 1500, // Realistic targets
    targetProgress: 0,
  });

  // Sample ride requests with new earnings calculation
  const [fallbackRequests] = useState<RideRequest[]>([
    {
      id: "req_1",
      passengerName: "Rahul Sharma",
      pickup: {
        address: "Connaught Place, New Delhi",
        lat: 28.6139,
        lng: 77.209,
      },
      destination: {
        address: "IGI Airport, Terminal 3",
        lat: 28.5562,
        lng: 77.1,
      },
      estimatedEarnings: 450,
      driverEarnings: isFleetDriver ? 182 : 427.5, // Fleet: ₹12 × 15.2km = 182, Owner: 450 - 5% = 427.5
      distance: 15.2,
      duration: 35,
      timestamp: new Date(),
      rideType: "economy",
      fareBreakdown: {
        baseFare: 50,
        distanceFare: 320,
        timeFare: 80,
        total: 450,
        commission: isFleetDriver ? undefined : 22.5,
        driverPayout: isFleetDriver ? 182 : 427.5,
      },
    },
    {
      id: "req_2",
      passengerName: "Priya Singh",
      pickup: {
        address: "India Gate",
        lat: 28.6129,
        lng: 77.2295,
      },
      destination: {
        address: "Select City Walk Mall",
        lat: 28.5244,
        lng: 77.2066,
      },
      estimatedEarnings: 280,
      driverEarnings: isFleetDriver ? 102 : 266,
      distance: 8.5,
      duration: 22,
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      rideType: "premium",
      fareBreakdown: {
        baseFare: 60,
        distanceFare: 170,
        timeFare: 50,
        total: 280,
        commission: isFleetDriver ? undefined : 14,
        driverPayout: isFleetDriver ? 102 : 266,
      },
    },
  ]);

  const isDevelopmentMode = import.meta.env.DEV || !driverService.isConnected;
  const rideRequests =
    driverService.rideRequests.length > 0
      ? driverService.rideRequests
      : isDevelopmentMode
        ? fallbackRequests
        : [];
  const isOnline = driverService.isOnline;

  // Get driver's current location
  const getCurrentLocation = (): Promise<{lat: number, lng: number}> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000 // Cache for 1 minute
        }
      );
    });
  };

  // Handle online/offline toggle
  const handleOnlineToggle = async (checked: boolean) => {
    try {
      if (checked) {
        // Going online - need location
        const location = await getCurrentLocation();
        setCurrentLocation(location);

        await driverMatchingService.updateDriverLocation(
          user?.id || "driver_123",
          location.lat,
          location.lng,
          true,
          true
        );

        setIsOnlineState(true);
        setLocationError(null);

        toast({
          title: "You're now online! 🟢",
          description: "You'll start receiving ride requests",
        });
      } else {
        // Going offline
        await driverMatchingService.setDriverOffline(user?.id || "driver_123");
        setIsOnlineState(false);

        toast({
          title: "You're now offline 🔴",
          description: "You won't receive new ride requests",
        });
      }
    } catch (error: any) {
      console.error("Location error:", error);

      if (error.code === 1) {
        setLocationError("Location access denied. Please enable location services to go online.");
      } else if (error.code === 2) {
        setLocationError("Location unavailable. Please check your GPS settings.");
      } else if (error.code === 3) {
        setLocationError("Location request timeout. Please try again.");
      } else {
        setLocationError("Failed to get location. Please try again.");
      }

      toast({
        title: "Location Error",
        description: error.message || "Failed to update online status. Location access required.",
        variant: "destructive",
      });

      setIsOnlineState(false);
    }
  };

  // Handle ride request actions
  const handleAcceptRequest = async (requestId: string) => {
    try {
      const success = await driverMatchingService.acceptRide(requestId, user?.id || "driver_123");

      if (success) {
        setActiveTab("ongoing");
        const request = rideRequests.find((r) => r.id === requestId);

        toast({
          title: "Ride Accepted! 🎉",
          description: `You've accepted the ride. Earnings: ₹${request?.driverEarnings || 0}`,
        });

        // Update driver stats
        setDriverStats(prev => ({
          ...prev,
          todayRides: prev.todayRides + 1,
          totalRides: prev.totalRides + 1,
        }));
      } else {
        toast({
          title: "Ride Unavailable",
          description: "This ride has already been taken by another driver",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept ride. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancelRide = async (rideId: string, reason: string = "Driver cancelled") => {
    try {
      await driverMatchingService.cancelRide(rideId, user?.id || "driver_123", reason);

      toast({
        title: "Ride Cancelled",
        description: "You have cancelled the ride. A penalty may apply.",
        variant: "destructive",
      });

      // Refresh current data
      // In a real app, this would be handled by real-time listeners
      setActiveTab("requests");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel ride. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getRideTypeColor = (type: string) => {
    switch (type) {
      case "economy":
        return "bg-blue-100 text-blue-800";
      case "premium":
        return "bg-purple-100 text-purple-800";
      case "luxury":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const calculateShiftProgress = () => {
    if (!currentProfile.currentShift) return 0;
    const { targetKm = 100, completedKm = 0 } = currentProfile.currentShift;
    return Math.min((completedKm / targetKm) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 lg:px-8">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  URide
                </span>
                <div className="text-xs text-gray-500 font-medium">
                  Driver Panel
                </div>
              </div>
            </Link>

            {/* Desktop Header Actions */}
            <div className="hidden md:flex items-center space-x-6">
              {/* Driver Type Badge */}
              <div className="flex items-center space-x-2">
                {isFleetDriver ? (
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    <Building className="w-3 h-3 mr-1" />
                    Fleet Driver
                  </Badge>
                ) : (
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                    <Crown className="w-3 h-3 mr-1" />
                    Vehicle Owner
                  </Badge>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-600">
                  {isOnline ? "Online" : "Offline"}
                </div>
                <Switch
                  checked={isOnline}
                  onCheckedChange={handleOnlineToggle}
                  disabled={driverService.loading.toggleStatus}
                  className="data-[state=checked]:bg-green-600"
                />
                <div
                  className={`w-3 h-3 rounded-full ${isOnline ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}
                />
              </div>

              <div className="text-right">
                <div className="text-sm text-gray-600">Today's Earnings</div>
                <div className="text-xl font-bold text-green-600">
                  ₹{driverStats.todayEarnings.toLocaleString()}
                </div>
                {isFleetDriver && (
                  <div className="text-xs text-gray-500">
                    {driverStats.todayKmDriven} km @ ₹{currentProfile.driverType.salaryPerKm}/km
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/driver-login")}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Exit
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>

          {/* Mobile Header Info */}
          <div className="md:hidden mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Switch
                  checked={isOnline}
                  onCheckedChange={handleOnlineToggle}
                  disabled={driverService.loading.toggleStatus}
                  className="data-[state=checked]:bg-green-600"
                />
                <span className="text-sm text-gray-600">
                  {isOnline ? "Online" : "Offline"}
                </span>
                <div
                  className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}
                />
              </div>
              <div className="flex items-center space-x-2">
                {isFleetDriver ? (
                  <Badge className="bg-blue-100 text-blue-800 text-xs">
                    <Building className="w-3 h-3 mr-1" />
                    Fleet
                  </Badge>
                ) : (
                  <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                    <Crown className="w-3 h-3 mr-1" />
                    Owner
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Today's Earnings</div>
                <div className="text-lg font-bold text-green-600">
                  ₹{driverStats.todayEarnings.toLocaleString()}
                </div>
              </div>
              {isFleetDriver && (
                <div className="text-right">
                  <div className="text-xs text-gray-500">Today's Distance</div>
                  <div className="text-sm font-medium">{driverStats.todayKmDriven} km</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 lg:px-8">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Today's Earnings</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{driverStats.todayEarnings}
                  </p>
                  <p className="text-xs text-gray-500">
                    {driverStats.todayRides} rides • {driverStats.todayKmDriven} km
                  </p>
                </div>
                <IndianRupee className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    {isFleetDriver ? "Distance Today" : "Total Rides"}
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {isFleetDriver ? `${driverStats.todayKmDriven} km` : driverStats.todayRides}
                  </p>
                  <p className="text-xs text-gray-500">
                    {isFleetDriver 
                      ? `₹${currentProfile.driverType.salaryPerKm}/km rate`
                      : `${driverStats.totalRides} total rides`
                    }
                  </p>
                </div>
                {isFleetDriver ? (
                  <Route className="w-8 h-8 text-blue-600" />
                ) : (
                  <Car className="w-8 h-8 text-blue-600" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rating</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {driverStats.averageRating}★
                  </p>
                  <p className="text-xs text-gray-500">
                    {driverStats.acceptanceRate}% acceptance
                  </p>
                </div>
                <Star className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    {isFleetDriver ? "Shift Progress" : "Online Hours"}
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    {isFleetDriver 
                      ? `${Math.round(calculateShiftProgress())}%`
                      : `${driverStats.onlineHours}h`
                    }
                  </p>
                  <p className="text-xs text-gray-500">
                    {isFleetDriver 
                      ? `${currentProfile.currentShift?.completedKm}/${currentProfile.currentShift?.targetKm} km`
                      : `${driverStats.completionRate}% completion`
                    }
                  </p>
                </div>
                {isFleetDriver ? (
                  <Target className="w-8 h-8 text-orange-600" />
                ) : (
                  <Clock className="w-8 h-8 text-orange-600" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Shift Progress Bar for Fleet Drivers */}
        {isFleetDriver && currentProfile.currentShift && (
          <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">Current Shift Progress</h3>
                  <p className="text-sm text-blue-700">
                    Started {formatTime(currentProfile.currentShift.startTime)} • Target: {currentProfile.currentShift.targetKm} km
                  </p>
                </div>
                <Badge className="bg-blue-100 text-blue-800">
                  {Math.round(calculateShiftProgress())}% Complete
                </Badge>
              </div>
              <Progress value={calculateShiftProgress()} className="h-3 mb-2" />
              <div className="flex justify-between text-sm text-blue-700">
                <span>{currentProfile.currentShift.completedKm} km completed</span>
                <span>{(currentProfile.currentShift.targetKm || 0) - (currentProfile.currentShift.completedKm || 0)} km remaining</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="requests" className="text-xs sm:text-sm">
              Requests
              {rideRequests.length > 0 && (
                <Badge className="ml-2 bg-red-500 text-white">
                  {rideRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="ongoing" className="text-xs sm:text-sm">
              Active
            </TabsTrigger>
            <TabsTrigger value="earnings" className="text-xs sm:text-sm">
              Earnings
            </TabsTrigger>
            <TabsTrigger value="profile" className="text-xs sm:text-sm">
              Profile
            </TabsTrigger>
          </TabsList>

          {/* Ride Requests Tab */}
          <TabsContent value="requests">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">
                  Ride Requests
                </h2>
                {!isOnline && (
                  <Badge
                    variant="secondary"
                    className="bg-orange-100 text-orange-800"
                  >
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Go online to receive requests
                  </Badge>
                )}
              </div>

              {rideRequests.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">
                      No ride requests
                    </h3>
                    <p className="text-gray-500">
                      {isOnline
                        ? "You'll see new ride requests here when passengers book rides near you"
                        : "Turn on your online status to start receiving ride requests"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {rideRequests.map((request) => (
                    <Card
                      key={request.id}
                      className="border-l-4 border-l-yellow-500 bg-yellow-50/30"
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-lg">
                                {request.passengerName}
                              </h3>
                              <Badge
                                className={getRideTypeColor(request.rideType)}
                              >
                                {request.rideType}
                              </Badge>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-start space-x-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full mt-2" />
                                <div>
                                  <p className="text-sm text-gray-600">Pickup</p>
                                  <p className="font-medium">
                                    {request.pickup.address}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start space-x-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full mt-2" />
                                <div>
                                  <p className="text-sm text-gray-600">
                                    Destination
                                  </p>
                                  <p className="font-medium">
                                    {request.destination.address}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-6 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Route className="w-4 h-4" />
                                <span>{request.distance} km</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Timer className="w-4 h-4" />
                                <span>{request.duration} min</span>
                              </div>
                            </div>

                            {/* Earnings Breakdown */}
                            <div className="bg-white rounded-lg p-4 border">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-gray-600">Total Fare</p>
                                  <p className="text-lg font-semibold">₹{request.estimatedEarnings}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">
                                    {isFleetDriver ? "Your Salary" : "Your Earnings"}
                                  </p>
                                  <p className="text-lg font-bold text-green-600">
                                    ₹{request.driverEarnings}
                                  </p>
                                </div>
                              </div>
                              
                              {request.fareBreakdown && (
                                <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                                  {isFleetDriver ? (
                                    <p>Salary: {request.distance} km × ₹{currentProfile.driverType.salaryPerKm}/km = ₹{request.driverEarnings}</p>
                                  ) : (
                                    <p>After 5% commission: ₹{request.estimatedEarnings} - ₹{request.fareBreakdown.commission} = ₹{request.driverEarnings}</p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex space-x-3 lg:flex-col lg:space-x-0 lg:space-y-2 lg:w-32">
                            <Button
                              onClick={() => handleAcceptRequest(request.id)}
                              disabled={driverService.loading.acceptRide}
                              className="flex-1 lg:w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              {driverService.loading.acceptRide
                                ? "Accepting..."
                                : "Accept"}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {/* handleRejectRequest */}}
                              className="flex-1 lg:w-full border-red-200 text-red-600 hover:bg-red-50"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Active Rides Tab */}
          <TabsContent value="ongoing">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800">Active Rides</h2>
              <Card>
                <CardContent className="p-8 text-center">
                  <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">
                    No active rides
                  </h3>
                  <p className="text-gray-500">
                    Your ongoing rides will appear here
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">
                  Earnings Overview
                </h2>
                <Badge className={isFleetDriver ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"}>
                  {isFleetDriver ? "Fleet Driver" : "Vehicle Owner"}
                </Badge>
              </div>

              {/* Earnings Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-green-700">
                      Today's Earnings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-3xl font-bold text-green-600">
                      ₹{driverStats.todayEarnings.toLocaleString()}
                    </div>
                    <p className="text-sm text-green-600 mt-1">
                      {driverStats.todayRides} rides • {driverStats.todayKmDriven} km
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-blue-700">
                      This Week
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-3xl font-bold text-blue-600">
                      ₹{driverStats.weeklyEarnings.toLocaleString()}
                    </div>
                    <p className="text-sm text-blue-600 mt-1">
                      Average ₹{Math.round(driverStats.weeklyEarnings / 7)} per day
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-purple-700">
                      This Month
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-3xl font-bold text-purple-600">
                      ₹{driverStats.monthlyEarnings.toLocaleString()}
                    </div>
                    <p className="text-sm text-purple-600 mt-1">
                      {Math.round(driverStats.targetProgress || 0)}% of target
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-orange-700">
                      Total Earnings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-3xl font-bold text-orange-600">
                      ₹{driverStats.totalEarnings.toLocaleString()}
                    </div>
                    <p className="text-sm text-orange-600 mt-1">
                      {driverStats.totalRides} total rides
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Earnings Model Explanation */}
              <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-yellow-800">
                    <Calculator className="w-5 h-5 mr-2" />
                    Your Earnings Model
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isFleetDriver ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <Building className="w-8 h-8 text-blue-600" />
                        <div>
                          <h3 className="font-semibold text-blue-900">Fleet Driver - Salary Model</h3>
                          <p className="text-blue-700">₹{currentProfile.driverType.salaryPerKm} per kilometer driven</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="text-center p-3 bg-blue-100 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{driverStats.totalKmDriven}</div>
                          <div className="text-sm text-blue-700">Total KM Driven</div>
                        </div>
                        <div className="text-center p-3 bg-green-100 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">₹{currentProfile.driverType.salaryPerKm}</div>
                          <div className="text-sm text-green-700">Per KM Rate</div>
                        </div>
                        <div className="text-center p-3 bg-purple-100 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">₹{driverStats.totalKmSalary}</div>
                          <div className="text-sm text-purple-700">Total Salary</div>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
                        <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-700">
                          <p className="font-medium">Benefits Included:</p>
                          <ul className="mt-1 space-y-1">
                            <li>• Vehicle maintenance covered</li>
                            <li>• Fuel expenses covered</li>
                            <li>• Insurance provided</li>
                            <li>• No commission deductions</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <Crown className="w-8 h-8 text-yellow-600" />
                        <div>
                          <h3 className="font-semibold text-yellow-900">Vehicle Owner - Commission Model</h3>
                          <p className="text-yellow-700">Keep 95% of ride earnings (5% commission)</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="text-center p-3 bg-green-100 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">95%</div>
                          <div className="text-sm text-green-700">You Keep</div>
                        </div>
                        <div className="text-center p-3 bg-red-100 rounded-lg">
                          <div className="text-2xl font-bold text-red-600">5%</div>
                          <div className="text-sm text-red-700">Commission</div>
                        </div>
                        <div className="text-center p-3 bg-yellow-100 rounded-lg">
                          <div className="text-2xl font-bold text-yellow-600">₹{driverStats.totalCommissionPaid}</div>
                          <div className="text-sm text-yellow-700">Total Commission</div>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2 p-3 bg-yellow-50 rounded-lg">
                        <Crown className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div className="text-sm text-yellow-700">
                          <p className="font-medium">Your Responsibilities:</p>
                          <ul className="mt-1 space-y-1">
                            <li>• Vehicle maintenance and fuel</li>
                            <li>• Insurance coverage</li>
                            <li>• Flexible working hours</li>
                            <li>• Choose your preferred routes</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Monthly Target Progress */}
              {driverStats.monthlyTarget && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="w-5 h-5 mr-2 text-orange-600" />
                      Monthly Target Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Target: {isFleetDriver ? `${driverStats.monthlyTarget} km` : `₹${driverStats.monthlyTarget.toLocaleString()}`}
                        </span>
                        <Badge className="bg-orange-100 text-orange-800">
                          {Math.round(driverStats.targetProgress || 0)}% Complete
                        </Badge>
                      </div>
                      <Progress value={driverStats.targetProgress} className="h-3" />
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Achieved: </span>
                          <span className="font-semibold">
                            {isFleetDriver 
                              ? `${Math.round(((driverStats.targetProgress || 0) / 100) * driverStats.monthlyTarget)} km`
                              : `₹${Math.round(((driverStats.targetProgress || 0) / 100) * driverStats.monthlyTarget).toLocaleString()}`
                            }
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Remaining: </span>
                          <span className="font-semibold">
                            {isFleetDriver 
                              ? `${driverStats.monthlyTarget - Math.round(((driverStats.targetProgress || 0) / 100) * driverStats.monthlyTarget)} km`
                              : `₹${(driverStats.monthlyTarget - Math.round(((driverStats.targetProgress || 0) / 100) * driverStats.monthlyTarget)).toLocaleString()}`
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Driver Profile</h2>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto md:mx-0">
                      {currentProfile.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div className="flex-1 space-y-2 text-center md:text-left">
                      <h3 className="text-xl font-bold text-gray-800">
                        {currentProfile.name}
                      </h3>
                      <div className="flex items-center justify-center md:justify-start space-x-2">
                        {isFleetDriver ? (
                          <Badge className="bg-blue-100 text-blue-800">
                            <Building className="w-3 h-3 mr-1" />
                            Fleet Driver
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Crown className="w-3 h-3 mr-1" />
                            Vehicle Owner
                          </Badge>
                        )}
                        <Badge className="bg-green-100 text-green-800">
                          <Star className="w-3 h-3 mr-1" />
                          {currentProfile.rating} Rating
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600 mt-4">
                        <div>
                          <p><span className="font-medium">Phone:</span> {currentProfile.phone}</p>
                          <p><span className="font-medium">Email:</span> {currentProfile.email}</p>
                          <p><span className="font-medium">License:</span> {currentProfile.licenseNumber}</p>
                        </div>
                        <div>
                          <p>
                            <span className="font-medium">Vehicle:</span>{" "}
                            {isFleetDriver ? currentProfile.assignedVehicle : currentProfile.vehicleModel}
                          </p>
                          {!isFleetDriver && (
                            <p><span className="font-medium">Number:</span> {currentProfile.vehicleNumber}</p>
                          )}
                          <p><span className="font-medium">Member since:</span> {formatDate(currentProfile.joinDate)}</p>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="border-yellow-200 text-yellow-600 hover:bg-yellow-50"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {driverStats.averageRating}★
                      </div>
                      <div className="text-sm text-gray-600">
                        Average Rating
                      </div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {driverStats.acceptanceRate}%
                      </div>
                      <div className="text-sm text-gray-600">
                        Acceptance Rate
                      </div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        {driverStats.completionRate}%
                      </div>
                      <div className="text-sm text-gray-600">
                        Completion Rate
                      </div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-3xl font-bold text-orange-600 mb-2">
                        {driverStats.totalKmDriven}
                      </div>
                      <div className="text-sm text-gray-600">
                        Total KM Driven
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
