import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useDriverService } from "@/hooks/useDriverService";
import { useAuth } from "@/contexts/AuthContext";
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
} from "lucide-react";

// Types for driver data
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
  distance: number;
  duration: number;
  timestamp: Date;
  rideType: "economy" | "premium" | "luxury";
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
  earnings: number;
  status: "picking_up" | "en_route" | "arrived";
  startTime: Date;
  estimatedArrival: Date;
}

interface RideHistory {
  id: string;
  passengerName: string;
  pickup: string;
  destination: string;
  earnings: number;
  rating: number;
  date: Date;
  duration: number;
  distance: number;
}

interface DriverStats {
  totalEarnings: number;
  todayEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  totalRides: number;
  todayRides: number;
  averageRating: number;
  onlineHours: number;
  acceptanceRate: number;
  completionRate: number;
}

interface DriverProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicleNumber: string;
  vehicleModel: string;
  licenseNumber: string;
  rating: number;
  joinDate: Date;
  profilePhoto?: string;
}

export default function DriverDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(false);
  const [activeTab, setActiveTab] = useState("requests");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sample data - In real app, this would come from Firebase
  const [rideRequests, setRideRequests] = useState<RideRequest[]>([
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
      distance: 15.2,
      duration: 35,
      timestamp: new Date(),
      rideType: "economy",
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
      distance: 8.5,
      duration: 22,
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      rideType: "premium",
    },
  ]);

  const [ongoingRides, setOngoingRides] = useState<OngoingRide[]>([
    {
      id: "ride_1",
      passengerName: "Amit Kumar",
      passengerPhone: "+91 98765 43210",
      pickup: {
        address: "Karol Bagh Metro Station",
        lat: 28.6444,
        lng: 77.1908,
      },
      destination: {
        address: "Red Fort",
        lat: 28.6562,
        lng: 77.2410,
      },
      earnings: 320,
      status: "en_route",
      startTime: new Date(Date.now() - 15 * 60 * 1000),
      estimatedArrival: new Date(Date.now() + 10 * 60 * 1000),
    },
  ]);

  const [rideHistory, setRideHistory] = useState<RideHistory[]>([
    {
      id: "hist_1",
      passengerName: "Sneha Gupta",
      pickup: "Gurgaon Cyber City",
      destination: "New Delhi Railway Station",
      earnings: 520,
      rating: 5,
      date: new Date(Date.now() - 2 * 60 * 60 * 1000),
      duration: 45,
      distance: 18.2,
    },
    {
      id: "hist_2",
      passengerName: "Vikas Agarwal",
      pickup: "Lajpat Nagar",
      destination: "Nehru Place",
      earnings: 180,
      rating: 4,
      date: new Date(Date.now() - 4 * 60 * 60 * 1000),
      duration: 25,
      distance: 7.8,
    },
    {
      id: "hist_3",
      passengerName: "Mohan Das",
      pickup: "Janakpuri West",
      destination: "Dwarka Sector 21",
      earnings: 250,
      rating: 5,
      date: new Date(Date.now() - 6 * 60 * 60 * 1000),
      duration: 30,
      distance: 12.5,
    },
  ]);

  const [driverStats, setDriverStats] = useState<DriverStats>({
    totalEarnings: 45280,
    todayEarnings: 1250,
    weeklyEarnings: 8960,
    monthlyEarnings: 32140,
    totalRides: 487,
    todayRides: 8,
    averageRating: 4.8,
    onlineHours: 6.5,
    acceptanceRate: 92,
    completionRate: 98,
  });

  const [driverProfile, setDriverProfile] = useState<DriverProfile>({
    id: "driver_123",
    name: "Rajesh Kumar",
    phone: "+91 99999 12345",
    email: "rajesh.driver@uride.com",
    vehicleNumber: "DL 01 AB 1234",
    vehicleModel: "Honda City 2022",
    licenseNumber: "DL1420110012345",
    rating: 4.8,
    joinDate: new Date("2024-01-15"),
    profilePhoto: undefined,
  });

  // Handle online/offline toggle
  const handleOnlineToggle = (checked: boolean) => {
    setIsOnline(checked);
    toast({
      title: checked ? "You're now online!" : "You're now offline",
      description: checked 
        ? "You'll start receiving ride requests" 
        : "You won't receive new ride requests",
    });
  };

  // Handle ride request actions
  const handleAcceptRequest = (requestId: string) => {
    const request = rideRequests.find(r => r.id === requestId);
    if (request) {
      // Move to ongoing rides
      const newOngoingRide: OngoingRide = {
        id: `ride_${Date.now()}`,
        passengerName: request.passengerName,
        passengerPhone: "+91 98765 43210", // Would come from API
        pickup: request.pickup,
        destination: request.destination,
        earnings: request.estimatedEarnings,
        status: "picking_up",
        startTime: new Date(),
        estimatedArrival: new Date(Date.now() + request.duration * 60 * 1000),
      };
      
      setOngoingRides(prev => [newOngoingRide, ...prev]);
      setRideRequests(prev => prev.filter(r => r.id !== requestId));
      setActiveTab("ongoing");
      
      toast({
        title: "Ride Accepted!",
        description: `You've accepted the ride to ${request.destination.address}`,
      });
    }
  };

  const handleRejectRequest = (requestId: string) => {
    setRideRequests(prev => prev.filter(r => r.id !== requestId));
    toast({
      title: "Ride Rejected",
      description: "The ride request has been declined",
    });
  };

  // Handle ongoing ride actions
  const handleCompleteRide = (rideId: string) => {
    const ride = ongoingRides.find(r => r.id === rideId);
    if (ride) {
      // Move to history
      const historyEntry: RideHistory = {
        id: ride.id,
        passengerName: ride.passengerName,
        pickup: ride.pickup.address,
        destination: ride.destination.address,
        earnings: ride.earnings,
        rating: 5, // Would be set by passenger
        date: new Date(),
        duration: Math.floor((Date.now() - ride.startTime.getTime()) / 60000),
        distance: 10, // Would be calculated
      };
      
      setRideHistory(prev => [historyEntry, ...prev]);
      setOngoingRides(prev => prev.filter(r => r.id !== rideId));
      
      // Update stats
      setDriverStats(prev => ({
        ...prev,
        todayEarnings: prev.todayEarnings + ride.earnings,
        todayRides: prev.todayRides + 1,
        totalEarnings: prev.totalEarnings + ride.earnings,
        totalRides: prev.totalRides + 1,
      }));
      
      toast({
        title: "Ride Completed!",
        description: `You earned ₹${ride.earnings} for this ride`,
      });
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "picking_up": return "bg-blue-100 text-blue-800";
      case "en_route": return "bg-green-100 text-green-800";
      case "arrived": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "picking_up": return "Picking Up";
      case "en_route": return "En Route";
      case "arrived": return "Arrived";
      default: return status;
    }
  };

  const getRideTypeColor = (type: string) => {
    switch (type) {
      case "economy": return "bg-blue-100 text-blue-800";
      case "premium": return "bg-purple-100 text-purple-800";
      case "luxury": return "bg-gold-100 text-gold-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 lg:px-8">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-green-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  URide
                </span>
                <div className="text-xs text-slate-500 font-medium">
                  Driver Panel
                </div>
              </div>
            </Link>

            {/* Desktop Header Actions */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="text-sm text-slate-600">
                  {isOnline ? "Online" : "Offline"}
                </div>
                <Switch
                  checked={isOnline}
                  onCheckedChange={handleOnlineToggle}
                  className="data-[state=checked]:bg-green-600"
                />
                <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              </div>
              
              <div className="text-right">
                <div className="text-sm text-slate-600">Today's Earnings</div>
                <div className="text-xl font-bold text-green-600">
                  ₹{driverStats.todayEarnings.toLocaleString()}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/")}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Exit Driver Mode
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
          <div className="md:hidden mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Switch
                checked={isOnline}
                onCheckedChange={handleOnlineToggle}
                className="data-[state=checked]:bg-green-600"
              />
              <span className="text-sm text-slate-600">
                {isOnline ? "Online" : "Offline"}
              </span>
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-600">Today</div>
              <div className="text-lg font-bold text-green-600">
                ₹{driverStats.todayEarnings.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed top-0 right-0 h-full w-80 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Driver Menu</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <h3 className="font-medium mb-2">Profile</h3>
                <p className="text-sm text-slate-600">{driverProfile.name}</p>
                <p className="text-sm text-slate-600">{driverProfile.vehicleModel}</p>
              </div>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate("/")}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Exit Driver Mode
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Today's Rides</p>
                  <p className="text-2xl font-bold text-blue-600">{driverStats.todayRides}</p>
                </div>
                <Car className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Today's Earnings</p>
                  <p className="text-2xl font-bold text-green-600">₹{driverStats.todayEarnings}</p>
                </div>
                <IndianRupee className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Rating</p>
                  <p className="text-2xl font-bold text-purple-600">{driverStats.averageRating}★</p>
                </div>
                <Star className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Online Hours</p>
                  <p className="text-2xl font-bold text-orange-600">{driverStats.onlineHours}h</p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="requests" className="text-xs sm:text-sm">
              Requests
              {rideRequests.length > 0 && (
                <Badge className="ml-2 bg-red-500 text-white">{rideRequests.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="ongoing" className="text-xs sm:text-sm">
              Ongoing
              {ongoingRides.length > 0 && (
                <Badge className="ml-2 bg-blue-500 text-white">{ongoingRides.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs sm:text-sm">History</TabsTrigger>
            <TabsTrigger value="earnings" className="text-xs sm:text-sm">Earnings</TabsTrigger>
          </TabsList>

          {/* Ride Requests Tab */}
          <TabsContent value="requests">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800">Ride Requests</h2>
                {!isOnline && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Go online to receive requests
                  </Badge>
                )}
              </div>

              {rideRequests.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Car className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-600 mb-2">
                      No ride requests
                    </h3>
                    <p className="text-slate-500">
                      {isOnline 
                        ? "You'll see new ride requests here when passengers book rides near you"
                        : "Turn on your online status to start receiving ride requests"
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {rideRequests.map((request) => (
                    <Card key={request.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-lg">{request.passengerName}</h3>
                              <Badge className={getRideTypeColor(request.rideType)}>
                                {request.rideType}
                              </Badge>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-start space-x-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full mt-2" />
                                <div>
                                  <p className="text-sm text-slate-600">Pickup</p>
                                  <p className="font-medium">{request.pickup.address}</p>
                                </div>
                              </div>
                              <div className="flex items-start space-x-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full mt-2" />
                                <div>
                                  <p className="text-sm text-slate-600">Destination</p>
                                  <p className="font-medium">{request.destination.address}</p>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-6 text-sm text-slate-600">
                              <div className="flex items-center space-x-1">
                                <Route className="w-4 h-4" />
                                <span>{request.distance} km</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Timer className="w-4 h-4" />
                                <span>{request.duration} min</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <IndianRupee className="w-4 h-4" />
                                <span className="font-semibold text-green-600">₹{request.estimatedEarnings}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex space-x-3 lg:flex-col lg:space-x-0 lg:space-y-2 lg:w-32">
                            <Button
                              onClick={() => handleAcceptRequest(request.id)}
                              className="flex-1 lg:w-full bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Accept
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleRejectRequest(request.id)}
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

          {/* Ongoing Rides Tab */}
          <TabsContent value="ongoing">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-800">Ongoing Rides</h2>

              {ongoingRides.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Activity className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-600 mb-2">
                      No ongoing rides
                    </h3>
                    <p className="text-slate-500">
                      Your active rides will appear here
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {ongoingRides.map((ride) => (
                    <Card key={ride.id} className="border-l-4 border-l-green-500">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-lg">{ride.passengerName}</h3>
                              <Badge className={getStatusColor(ride.status)}>
                                {getStatusText(ride.status)}
                              </Badge>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-start space-x-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full mt-2" />
                                <div>
                                  <p className="text-sm text-slate-600">Pickup</p>
                                  <p className="font-medium">{ride.pickup.address}</p>
                                </div>
                              </div>
                              <div className="flex items-start space-x-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full mt-2" />
                                <div>
                                  <p className="text-sm text-slate-600">Destination</p>
                                  <p className="font-medium">{ride.destination.address}</p>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-6 text-sm text-slate-600">
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>Started {formatTime(ride.startTime)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Target className="w-4 h-4" />
                                <span>ETA {formatTime(ride.estimatedArrival)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <IndianRupee className="w-4 h-4" />
                                <span className="font-semibold text-green-600">₹{ride.earnings}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex space-x-3 lg:flex-col lg:space-x-0 lg:space-y-2 lg:w-40">
                            <Button
                              variant="outline"
                              className="flex-1 lg:w-full border-blue-200 text-blue-600 hover:bg-blue-50"
                            >
                              <Phone className="w-4 h-4 mr-2" />
                              Call
                            </Button>
                            <Button
                              variant="outline"
                              className="flex-1 lg:w-full border-purple-200 text-purple-600 hover:bg-purple-50"
                            >
                              <Navigation className="w-4 h-4 mr-2" />
                              Navigate
                            </Button>
                            <Button
                              onClick={() => handleCompleteRide(ride.id)}
                              className="flex-1 lg:w-full bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Complete
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

          {/* Ride History Tab */}
          <TabsContent value="history">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-800">Ride History</h2>

              {rideHistory.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-600 mb-2">
                      No ride history
                    </h3>
                    <p className="text-slate-500">
                      Your completed rides will appear here
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {rideHistory.map((ride) => (
                    <Card key={ride.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-lg">{ride.passengerName}</h3>
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                <span className="font-medium">{ride.rating}</span>
                              </div>
                            </div>
                            
                            <div className="text-sm text-slate-600">
                              <p><span className="font-medium">From:</span> {ride.pickup}</p>
                              <p><span className="font-medium">To:</span> {ride.destination}</p>
                            </div>

                            <div className="flex items-center space-x-4 text-sm text-slate-600">
                              <span>{formatDate(ride.date)} at {formatTime(ride.date)}</span>
                              <span>•</span>
                              <span>{ride.distance} km</span>
                              <span>•</span>
                              <span>{ride.duration} min</span>
                            </div>
                          </div>

                          <div className="text-right sm:ml-4">
                            <div className="text-2xl font-bold text-green-600">
                              ₹{ride.earnings}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-800">Earnings Summary</h2>

              {/* Earnings Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-slate-600">Today</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-3xl font-bold text-green-600">
                      ₹{driverStats.todayEarnings.toLocaleString()}
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                      {driverStats.todayRides} rides completed
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-slate-600">This Week</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-3xl font-bold text-blue-600">
                      ₹{driverStats.weeklyEarnings.toLocaleString()}
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                      Average ₹{Math.round(driverStats.weeklyEarnings / 7)} per day
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-slate-600">This Month</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-3xl font-bold text-purple-600">
                      ₹{driverStats.monthlyEarnings.toLocaleString()}
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                      Average ₹{Math.round(driverStats.monthlyEarnings / 30)} per day
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-slate-600">Total</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-3xl font-bold text-orange-600">
                      ₹{driverStats.totalEarnings.toLocaleString()}
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                      {driverStats.totalRides} total rides
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {driverStats.averageRating}★
                      </div>
                      <div className="text-sm text-slate-600">Average Rating</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {driverStats.acceptanceRate}%
                      </div>
                      <div className="text-sm text-slate-600">Acceptance Rate</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        {driverStats.completionRate}%
                      </div>
                      <div className="text-sm text-slate-600">Completion Rate</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-3xl font-bold text-orange-600 mb-2">
                        {driverStats.onlineHours}h
                      </div>
                      <div className="text-sm text-slate-600">Hours Online Today</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Driver Profile */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    Driver Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-green-600 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto md:mx-0">
                      {driverProfile.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 space-y-2 text-center md:text-left">
                      <h3 className="text-xl font-bold text-slate-800">{driverProfile.name}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-600">
                        <div>
                          <p><span className="font-medium">Phone:</span> {driverProfile.phone}</p>
                          <p><span className="font-medium">Email:</span> {driverProfile.email}</p>
                          <p><span className="font-medium">License:</span> {driverProfile.licenseNumber}</p>
                        </div>
                        <div>
                          <p><span className="font-medium">Vehicle:</span> {driverProfile.vehicleModel}</p>
                          <p><span className="font-medium">Number:</span> {driverProfile.vehicleNumber}</p>
                          <p><span className="font-medium">Member since:</span> {formatDate(driverProfile.joinDate)}</p>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                      <Settings className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
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
