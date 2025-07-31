import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Car,
  Users,
  IndianRupee,
  BarChart3,
  Settings,
  Search,
  Filter,
  Plus,
  Edit,
  Eye,
  Crown,
  Building,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Star,
  TrendingUp,
  AlertTriangle,
  Shield,
  Fuel,
  Calendar,
  Phone,
  Mail,
  Award,
} from "lucide-react";

interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: "owner" | "fleet";
  status: "active" | "inactive" | "pending";
  rating: number;
  totalRides: number;
  totalEarnings: number;
  joinDate: Date;
  vehicleId?: string;
  assignedVehicle?: string;
  commissionRate?: number;
  salaryPerKm?: number;
  licenseNumber: string;
  documentsVerified: boolean;
}

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  registrationNumber: string;
  type: "company" | "driver_owned";
  status: "available" | "assigned" | "maintenance";
  assignedDriverId?: string;
  assignedDriverName?: string;
  mileage: number;
  lastService: Date;
  insuranceExpiry: Date;
  registrationExpiry: Date;
}

interface CommissionSettings {
  vehicleOwnerRate: number;
  fleetDriverSalaryRate: number;
  platformFee: number;
  bonusThresholds: {
    rides: number;
    bonus: number;
  }[];
}

export default function AdminPanel() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Sample data
  const [drivers] = useState<Driver[]>([
    {
      id: "d1",
      name: "Rajesh Kumar",
      email: "rajesh.driver@uride.com",
      phone: "+91 99999 12345",
      type: "owner",
      status: "active",
      rating: 4.8,
      totalRides: 487,
      totalEarnings: 42180,
      joinDate: new Date("2024-01-15"),
      vehicleId: "v1",
      commissionRate: 0.05,
      licenseNumber: "DL1420110012345",
      documentsVerified: true,
    },
    {
      id: "d2",
      name: "Amit Singh",
      email: "amit.fleet@uride.com",
      phone: "+91 88888 12345",
      type: "fleet",
      status: "active",
      rating: 4.7,
      totalRides: 392,
      totalEarnings: 28450,
      joinDate: new Date("2024-02-20"),
      assignedVehicle: "v3",
      salaryPerKm: 12,
      licenseNumber: "DL1420110054321",
      documentsVerified: true,
    },
    {
      id: "d3",
      name: "Priya Sharma",
      email: "priya.driver@uride.com",
      phone: "+91 77777 12345",
      type: "owner",
      status: "pending",
      rating: 0,
      totalRides: 0,
      totalEarnings: 0,
      joinDate: new Date("2024-12-15"),
      commissionRate: 0.05,
      licenseNumber: "DL1420110067890",
      documentsVerified: false,
    },
    {
      id: "d4",
      name: "Vikash Gupta",
      email: "vikash.fleet@uride.com",
      phone: "+91 66666 12345",
      type: "fleet",
      status: "inactive",
      rating: 4.5,
      totalRides: 156,
      totalEarnings: 12400,
      joinDate: new Date("2024-03-10"),
      salaryPerKm: 12,
      licenseNumber: "DL1420110098765",
      documentsVerified: true,
    },
  ]);

  const [vehicles] = useState<Vehicle[]>([
    {
      id: "v1",
      make: "Honda",
      model: "City",
      year: 2022,
      color: "White",
      registrationNumber: "DL 01 AB 1234",
      type: "driver_owned",
      status: "assigned",
      assignedDriverId: "d1",
      assignedDriverName: "Rajesh Kumar",
      mileage: 45000,
      lastService: new Date("2024-11-01"),
      insuranceExpiry: new Date("2025-06-15"),
      registrationExpiry: new Date("2025-12-31"),
    },
    {
      id: "v2",
      make: "Maruti Suzuki",
      model: "Swift Dzire",
      year: 2023,
      color: "Silver",
      registrationNumber: "DL 02 CD 5678",
      type: "company",
      status: "available",
      mileage: 12000,
      lastService: new Date("2024-11-15"),
      insuranceExpiry: new Date("2025-08-20"),
      registrationExpiry: new Date("2026-03-15"),
    },
    {
      id: "v3",
      make: "Maruti Suzuki",
      model: "Swift Dzire",
      year: 2023,
      color: "Blue",
      registrationNumber: "DL 03 EF 9012",
      type: "company",
      status: "assigned",
      assignedDriverId: "d2",
      assignedDriverName: "Amit Singh",
      mileage: 18500,
      lastService: new Date("2024-10-20"),
      insuranceExpiry: new Date("2025-07-10"),
      registrationExpiry: new Date("2026-02-28"),
    },
    {
      id: "v4",
      make: "Hyundai",
      model: "Aura",
      year: 2024,
      color: "Red",
      registrationNumber: "DL 04 GH 3456",
      type: "company",
      status: "maintenance",
      mileage: 8500,
      lastService: new Date("2024-12-01"),
      insuranceExpiry: new Date("2025-09-30"),
      registrationExpiry: new Date("2026-05-15"),
    },
  ]);

  const [commissionSettings, setCommissionSettings] = useState<CommissionSettings>({
    vehicleOwnerRate: 5, // 5%
    fleetDriverSalaryRate: 12, // ��12 per km
    platformFee: 2, // 2%
    bonusThresholds: [
      { rides: 50, bonus: 500 },
      { rides: 100, bonus: 1200 },
      { rides: 200, bonus: 2500 },
    ],
  });

  // Dashboard stats
  const dashboardStats = {
    totalDrivers: drivers.length,
    activeDrivers: drivers.filter(d => d.status === "active").length,
    pendingApprovals: drivers.filter(d => d.status === "pending").length,
    totalVehicles: vehicles.length,
    availableVehicles: vehicles.filter(v => v.status === "available").length,
    totalRevenue: drivers.reduce((sum, d) => sum + d.totalEarnings, 0),
    monthlyCommission: drivers
      .filter(d => d.type === "owner")
      .reduce((sum, d) => sum + (d.totalEarnings * (d.commissionRate || 0)), 0),
  };

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.phone.includes(searchTerm);
    const matchesStatus = filterStatus === "all" || driver.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "available":
        return "bg-blue-100 text-blue-800";
      case "assigned":
        return "bg-purple-100 text-purple-800";
      case "maintenance":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleApproveDriver = (driverId: string) => {
    toast({
      title: "Driver Approved",
      description: "Driver has been approved and can now start taking rides",
    });
  };

  const handleRejectDriver = (driverId: string) => {
    toast({
      title: "Driver Rejected",
      description: "Driver application has been rejected",
      variant: "destructive",
    });
  };

  const handleAssignVehicle = (driverId: string, vehicleId: string) => {
    toast({
      title: "Vehicle Assigned",
      description: "Company vehicle has been assigned to the driver",
    });
  };

  const handleUpdateCommission = () => {
    toast({
      title: "Settings Updated",
      description: "Commission and salary rates have been updated",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 lg:px-8">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  URide Admin
                </span>
                <div className="text-xs text-gray-500 font-medium">
                  Management Panel
                </div>
              </div>
            </Link>

            <div className="flex items-center space-x-4">
              <Badge className="bg-blue-100 text-blue-800">
                <Users className="w-3 h-3 mr-1" />
                {dashboardStats.activeDrivers} Active Drivers
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/")}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                Exit Admin
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
            <TabsTrigger value="dashboard" className="text-xs sm:text-sm">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="drivers" className="text-xs sm:text-sm">
              Drivers
              {dashboardStats.pendingApprovals > 0 && (
                <Badge className="ml-2 bg-red-500 text-white text-xs">
                  {dashboardStats.pendingApprovals}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="vehicles" className="text-xs sm:text-sm">
              Vehicles
            </TabsTrigger>
            <TabsTrigger value="earnings" className="text-xs sm:text-sm">
              Earnings
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs sm:text-sm">
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600 font-medium">Total Drivers</p>
                        <p className="text-3xl font-bold text-blue-700">
                          {dashboardStats.totalDrivers}
                        </p>
                        <p className="text-sm text-blue-600">
                          {dashboardStats.activeDrivers} active
                        </p>
                      </div>
                      <Users className="w-12 h-12 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600 font-medium">Total Vehicles</p>
                        <p className="text-3xl font-bold text-green-700">
                          {dashboardStats.totalVehicles}
                        </p>
                        <p className="text-sm text-green-600">
                          {dashboardStats.availableVehicles} available
                        </p>
                      </div>
                      <Car className="w-12 h-12 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-600 font-medium">Total Revenue</p>
                        <p className="text-3xl font-bold text-purple-700">
                          ��{dashboardStats.totalRevenue.toLocaleString()}
                        </p>
                        <p className="text-sm text-purple-600">
                          This month
                        </p>
                      </div>
                      <IndianRupee className="w-12 h-12 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-orange-600 font-medium">Pending Approvals</p>
                        <p className="text-3xl font-bold text-orange-700">
                          {dashboardStats.pendingApprovals}
                        </p>
                        <p className="text-sm text-orange-600">
                          Requires action
                        </p>
                      </div>
                      <Clock className="w-12 h-12 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-3 bg-yellow-50 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">New driver application pending</p>
                        <p className="text-xs text-gray-600">Priya Sharma submitted documents 2 hours ago</p>
                      </div>
                      <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                        Review
                      </Button>
                    </div>
                    
                    <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
                      <Car className="w-5 h-5 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Vehicle maintenance completed</p>
                        <p className="text-xs text-gray-600">DL 04 GH 3456 is ready for assignment</p>
                      </div>
                      <Button size="sm" variant="outline">
                        Assign
                      </Button>
                    </div>

                    <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg">
                      <Star className="w-5 h-5 text-green-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">High-rated driver milestone</p>
                        <p className="text-xs text-gray-600">Rajesh Kumar completed 500 rides with 4.8★ rating</p>
                      </div>
                      <Button size="sm" variant="outline">
                        Reward
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Drivers Tab */}
          <TabsContent value="drivers">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Driver Management</h2>
                <Button className="bg-yellow-600 hover:bg-yellow-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Driver
                </Button>
              </div>

              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search drivers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Drivers List */}
              <div className="grid gap-4">
                {filteredDrivers.map((driver) => (
                  <Card key={driver.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                            {driver.name.split(" ").map(n => n[0]).join("")}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{driver.name}</h3>
                            <div className="flex items-center space-x-2">
                              <Badge className={driver.type === "owner" ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"}>
                                {driver.type === "owner" ? (
                                  <>
                                    <Crown className="w-3 h-3 mr-1" />
                                    Vehicle Owner
                                  </>
                                ) : (
                                  <>
                                    <Building className="w-3 h-3 mr-1" />
                                    Fleet Driver
                                  </>
                                )}
                              </Badge>
                              <Badge className={getStatusColor(driver.status)}>
                                {driver.status}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Rating</p>
                            <p className="font-semibold">{driver.rating > 0 ? `${driver.rating}★` : "New"}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Total Rides</p>
                            <p className="font-semibold">{driver.totalRides}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Earnings</p>
                            <p className="font-semibold">₹{driver.totalEarnings.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Joined</p>
                            <p className="font-semibold">{driver.joinDate.toLocaleDateString()}</p>
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2">
                          {driver.status === "pending" ? (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => handleApproveDriver(driver.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectDriver(driver.id)}
                                className="border-red-200 text-red-600 hover:bg-red-50"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <div className="flex space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedDriver(driver)}
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    View
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Driver Details - {driver.name}</DialogTitle>
                                  </DialogHeader>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                      <div>
                                        <Label className="text-sm text-gray-600">Contact</Label>
                                        <div className="space-y-1">
                                          <p className="text-sm">{driver.email}</p>
                                          <p className="text-sm">{driver.phone}</p>
                                        </div>
                                      </div>
                                      <div>
                                        <Label className="text-sm text-gray-600">License</Label>
                                        <p className="text-sm">{driver.licenseNumber}</p>
                                      </div>
                                      <div>
                                        <Label className="text-sm text-gray-600">Documents</Label>
                                        <Badge className={driver.documentsVerified ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                          {driver.documentsVerified ? "Verified" : "Pending"}
                                        </Badge>
                                      </div>
                                    </div>
                                    <div className="space-y-4">
                                      <div>
                                        <Label className="text-sm text-gray-600">Performance</Label>
                                        <div className="space-y-1">
                                          <p className="text-sm">Rating: {driver.rating}★</p>
                                          <p className="text-sm">Total Rides: {driver.totalRides}</p>
                                          <p className="text-sm">Earnings: ₹{driver.totalEarnings.toLocaleString()}</p>
                                        </div>
                                      </div>
                                      {driver.type === "fleet" && (
                                        <div>
                                          <Label className="text-sm text-gray-600">Vehicle Assignment</Label>
                                          <div className="flex items-center space-x-2">
                                            <Select
                                              value={driver.assignedVehicle || ""}
                                              onValueChange={(value) => handleAssignVehicle(driver.id, value)}
                                            >
                                              <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Assign vehicle" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {vehicles
                                                  .filter(v => v.type === "company" && v.status === "available")
                                                  .map(vehicle => (
                                                    <SelectItem key={vehicle.id} value={vehicle.id}>
                                                      {vehicle.make} {vehicle.model} - {vehicle.registrationNumber}
                                                    </SelectItem>
                                                  ))
                                                }
                                              </SelectContent>
                                            </Select>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button size="sm" variant="outline">
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Vehicles Tab */}
          <TabsContent value="vehicles">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Vehicle Management</h2>
                <Button className="bg-yellow-600 hover:bg-yellow-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Vehicle
                </Button>
              </div>

              {/* Vehicles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map((vehicle) => (
                  <Card key={vehicle.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Car className="w-8 h-8 text-blue-600" />
                            <div>
                              <h3 className="font-semibold">{vehicle.make} {vehicle.model}</h3>
                              <p className="text-sm text-gray-600">{vehicle.registrationNumber}</p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(vehicle.status)}>
                            {vehicle.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Year</p>
                            <p className="font-semibold">{vehicle.year}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Color</p>
                            <p className="font-semibold">{vehicle.color}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Type</p>
                            <p className="font-semibold">
                              {vehicle.type === "company" ? "Company" : "Driver Owned"}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Mileage</p>
                            <p className="font-semibold">{vehicle.mileage.toLocaleString()} km</p>
                          </div>
                        </div>

                        {vehicle.assignedDriverName && (
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                              <strong>Assigned to:</strong> {vehicle.assignedDriverName}
                            </p>
                          </div>
                        )}

                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedVehicle(vehicle)}
                                className="flex-1"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Vehicle Details</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm text-gray-600">Registration</Label>
                                    <p className="text-sm">{vehicle.registrationNumber}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm text-gray-600">Last Service</Label>
                                    <p className="text-sm">{vehicle.lastService.toLocaleDateString()}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm text-gray-600">Insurance Expiry</Label>
                                    <p className="text-sm">{vehicle.insuranceExpiry.toLocaleDateString()}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm text-gray-600">Registration Expiry</Label>
                                    <p className="text-sm">{vehicle.registrationExpiry.toLocaleDateString()}</p>
                                  </div>
                                </div>
                                {vehicle.assignedDriverName && (
                                  <div>
                                    <Label className="text-sm text-gray-600">Assigned Driver</Label>
                                    <p className="text-sm">{vehicle.assignedDriverName}</p>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Earnings & Commission</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600 font-medium">Total Revenue</p>
                        <p className="text-2xl font-bold text-green-700">
                          ₹{dashboardStats.totalRevenue.toLocaleString()}
                        </p>
                        <p className="text-xs text-green-600">This month</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-yellow-600 font-medium">Commission Earned</p>
                        <p className="text-2xl font-bold text-yellow-700">
                          ₹{Math.round(dashboardStats.monthlyCommission).toLocaleString()}
                        </p>
                        <p className="text-xs text-yellow-600">From vehicle owners</p>
                      </div>
                      <IndianRupee className="w-8 h-8 text-yellow-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600 font-medium">Fleet Salaries</p>
                        <p className="text-2xl font-bold text-blue-700">
                          ₹{drivers
                            .filter(d => d.type === "fleet")
                            .reduce((sum, d) => sum + d.totalEarnings, 0)
                            .toLocaleString()}
                        </p>
                        <p className="text-xs text-blue-600">Paid to fleet drivers</p>
                      </div>
                      <Building className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-600 font-medium">Avg. per Driver</p>
                        <p className="text-2xl font-bold text-purple-700">
                          ₹{Math.round(dashboardStats.totalRevenue / Math.max(dashboardStats.activeDrivers, 1)).toLocaleString()}
                        </p>
                        <p className="text-xs text-purple-600">Monthly average</p>
                      </div>
                      <BarChart3 className="w-8 h-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Earners */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="w-5 h-5 mr-2 text-yellow-600" />
                    Top Earning Drivers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {drivers
                      .sort((a, b) => b.totalEarnings - a.totalEarnings)
                      .slice(0, 5)
                      .map((driver, index) => (
                        <div key={driver.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-semibold">{driver.name}</p>
                              <p className="text-sm text-gray-600">
                                {driver.type === "owner" ? "Vehicle Owner" : "Fleet Driver"} • {driver.totalRides} rides
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">₹{driver.totalEarnings.toLocaleString()}</p>
                            <p className="text-sm text-gray-600">{driver.rating}★ rating</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Commission & Salary Settings</h2>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-blue-600" />
                    Rate Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="vehicleOwnerRate">Vehicle Owner Commission (%)</Label>
                      <Input
                        id="vehicleOwnerRate"
                        type="number"
                        value={commissionSettings.vehicleOwnerRate}
                        onChange={(e) => setCommissionSettings(prev => ({
                          ...prev,
                          vehicleOwnerRate: parseFloat(e.target.value)
                        }))}
                        min="0"
                        max="20"
                        step="0.1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Commission rate for drivers who own their vehicles
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="fleetDriverRate">Fleet Driver Salary (₹/km)</Label>
                      <Input
                        id="fleetDriverRate"
                        type="number"
                        value={commissionSettings.fleetDriverSalaryRate}
                        onChange={(e) => setCommissionSettings(prev => ({
                          ...prev,
                          fleetDriverSalaryRate: parseFloat(e.target.value)
                        }))}
                        min="5"
                        max="30"
                        step="0.5"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Per kilometer salary for company vehicle drivers
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="platformFee">Platform Fee (%)</Label>
                      <Input
                        id="platformFee"
                        type="number"
                        value={commissionSettings.platformFee}
                        onChange={(e) => setCommissionSettings(prev => ({
                          ...prev,
                          platformFee: parseFloat(e.target.value)
                        }))}
                        min="0"
                        max="10"
                        step="0.1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Additional platform fee on all rides
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label>Performance Bonuses</Label>
                    <div className="space-y-3 mt-2">
                      {commissionSettings.bonusThresholds.map((threshold, index) => (
                        <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <Label htmlFor={`rides-${index}`} className="text-sm">Rides Completed</Label>
                            <Input
                              id={`rides-${index}`}
                              type="number"
                              value={threshold.rides}
                              onChange={(e) => {
                                const newThresholds = [...commissionSettings.bonusThresholds];
                                newThresholds[index].rides = parseInt(e.target.value);
                                setCommissionSettings(prev => ({
                                  ...prev,
                                  bonusThresholds: newThresholds
                                }));
                              }}
                              min="10"
                              step="10"
                            />
                          </div>
                          <div className="flex-1">
                            <Label htmlFor={`bonus-${index}`} className="text-sm">Bonus Amount (₹)</Label>
                            <Input
                              id={`bonus-${index}`}
                              type="number"
                              value={threshold.bonus}
                              onChange={(e) => {
                                const newThresholds = [...commissionSettings.bonusThresholds];
                                newThresholds[index].bonus = parseInt(e.target.value);
                                setCommissionSettings(prev => ({
                                  ...prev,
                                  bonusThresholds: newThresholds
                                }));
                              }}
                              min="100"
                              step="100"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button onClick={handleUpdateCommission} className="bg-yellow-600 hover:bg-yellow-700">
                    Update Settings
                  </Button>
                </CardContent>
              </Card>

              {/* Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Settings Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <h4 className="font-semibold text-yellow-800 mb-2">Vehicle Owner Example</h4>
                      <p className="text-sm text-yellow-700">
                        For a ₹500 ride, driver keeps ₹{500 - (500 * commissionSettings.vehicleOwnerRate / 100)} 
                        (₹{500 * commissionSettings.vehicleOwnerRate / 100} commission)
                      </p>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2">Fleet Driver Example</h4>
                      <p className="text-sm text-blue-700">
                        For a 10km trip, driver earns ₹{10 * commissionSettings.fleetDriverSalaryRate} 
                        (₹{commissionSettings.fleetDriverSalaryRate}/km)
                      </p>
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
