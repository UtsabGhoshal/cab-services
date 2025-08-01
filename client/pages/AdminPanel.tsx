import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
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
  Activity,
  RefreshCw,
  Download,
  Bell,
  Zap,
  Target,
  UserX,
  Ban,
  PlayCircle,
  PauseCircle,
  Navigation,
  Wifi,
  WifiOff,
  MessageSquare,
  FileText,
  Truck,
  Wrench,
  AlertCircle,
  Timer,
} from "lucide-react";

// Driver types from our service
interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  driverType: {
    type: "owner" | "fleet";
    vehicleId?: string;
    commissionRate?: number;
    salaryPerKm?: number;
  };
  status: "active" | "inactive" | "pending" | "suspended";
  documentsVerified: boolean;
  licenseNumber: string;
  vehicleNumber?: string;
  vehicleModel?: string;
  assignedVehicle?: string;
  
  averageRating: number;
  totalRides: number;
  totalEarnings: number;
  totalKmDriven: number;
  acceptanceRate: number;
  completionRate: number;
  onlineHours: number;
  
  joinDate: Date;
  lastActive?: Date;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  isOnline: boolean;
  currentLocation?: {
    lat: number;
    lng: number;
    lastUpdated: Date;
  };
  
  currentShift?: {
    startTime: Date;
    targetKm?: number;
    completedKm?: number;
    earnings: number;
  };
}

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  registrationNumber: string;
  type: "company" | "driver_owned";
  status: "available" | "assigned" | "maintenance" | "out_of_service";
  
  assignedDriverId?: string;
  assignedDriverName?: string;
  
  mileage: number;
  fuelType: "petrol" | "diesel" | "cng" | "electric";
  
  lastService: Date;
  nextService: Date;
  insuranceExpiry: Date;
  registrationExpiry: Date;
  pollutionExpiry: Date;
  
  totalKmDriven: number;
  totalRides: number;
  averageRating: number;
  
  createdAt: Date;
  updatedAt: Date;
}

interface AdminActivity {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType: "driver" | "vehicle" | "ride" | "application";
  targetId: string;
  details: Record<string, any>;
  timestamp: Date;
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
  const [rejectionReason, setRejectionReason] = useState("");
  const [suspensionReason, setSuspensionReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Real-time data from Supabase
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [adminActivities, setAdminActivities] = useState<AdminActivity[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>({});

  // Commission settings
  const [commissionSettings, setCommissionSettings] = useState<CommissionSettings>({
    vehicleOwnerRate: 5,
    fleetDriverSalaryRate: 12,
    platformFee: 2,
    bonusThresholds: [
      { rides: 50, bonus: 500 },
      { rides: 100, bonus: 1200 },
      { rides: 200, bonus: 2500 },
    ],
  });

  // Initialize Firebase admin service and set up real-time listeners
  useEffect(() => {
    let driversUnsubscribe: (() => void) | null = null;
    let vehiclesUnsubscribe: (() => void) | null = null;

    const initializeAdminService = async () => {
      try {
        setIsLoading(true);

        // Import Firebase service dynamically (since it's a server module)
        // In a real app, you'd create a client-side wrapper
        const mockDriversData: FirebaseDriver[] = [
          {
            id: "d1",
            name: "Rajesh Kumar",
            email: "rajesh.driver@uride.com",
            phone: "+91 99999 12345",
            driverType: {
              type: "owner",
              commissionRate: 0.05,
            },
            status: "active",
            documentsVerified: true,
            licenseNumber: "DL1420110012345",
            vehicleNumber: "DL 01 AB 1234",
            vehicleModel: "Honda City 2022",
            averageRating: 4.8,
            totalRides: 487,
            totalEarnings: 42180,
            totalKmDriven: 2340,
            acceptanceRate: 95,
            completionRate: 98,
            onlineHours: 156,
            joinDate: new Date("2024-01-15"),
            lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
            approvedAt: new Date("2024-01-16"),
            createdAt: new Date("2024-01-15"),
            updatedAt: new Date(),
            isOnline: true,
            currentLocation: {
              lat: 28.6139,
              lng: 77.209,
              lastUpdated: new Date(Date.now() - 5 * 60 * 1000),
            },
          },
          {
            id: "d2",
            name: "Amit Singh",
            email: "amit.fleet@uride.com",
            phone: "+91 88888 12345",
            driverType: {
              type: "fleet",
              salaryPerKm: 12,
            },
            status: "active",
            documentsVerified: true,
            licenseNumber: "DL1420110054321",
            assignedVehicle: "URide Fleet #FL-089",
            vehicleModel: "Maruti Swift Dzire 2023",
            averageRating: 4.7,
            totalRides: 392,
            totalEarnings: 28450,
            totalKmDriven: 2371,
            acceptanceRate: 92,
            completionRate: 96,
            onlineHours: 142,
            joinDate: new Date("2024-02-20"),
            lastActive: new Date(Date.now() - 30 * 60 * 1000),
            approvedAt: new Date("2024-02-21"),
            createdAt: new Date("2024-02-20"),
            updatedAt: new Date(),
            isOnline: true,
            currentShift: {
              startTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
              targetKm: 120,
              completedKm: 85,
              earnings: 1020,
            },
          },
          {
            id: "d3",
            name: "Priya Sharma",
            email: "priya.driver@uride.com",
            phone: "+91 77777 12345",
            driverType: {
              type: "owner",
              commissionRate: 0.05,
            },
            status: "pending",
            documentsVerified: false,
            licenseNumber: "DL1420110067890",
            averageRating: 0,
            totalRides: 0,
            totalEarnings: 0,
            totalKmDriven: 0,
            acceptanceRate: 0,
            completionRate: 0,
            onlineHours: 0,
            joinDate: new Date("2024-12-15"),
            createdAt: new Date("2024-12-15"),
            updatedAt: new Date(),
            isOnline: false,
          },
          {
            id: "d4",
            name: "Vikash Gupta",
            email: "vikash.fleet@uride.com",
            phone: "+91 66666 12345",
            driverType: {
              type: "fleet",
              salaryPerKm: 12,
            },
            status: "suspended",
            documentsVerified: true,
            licenseNumber: "DL1420110098765",
            assignedVehicle: "URide Fleet #FL-045",
            averageRating: 4.5,
            totalRides: 156,
            totalEarnings: 12400,
            totalKmDriven: 1033,
            acceptanceRate: 88,
            completionRate: 94,
            onlineHours: 78,
            joinDate: new Date("2024-03-10"),
            lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000),
            approvedAt: new Date("2024-03-11"),
            createdAt: new Date("2024-03-10"),
            updatedAt: new Date(),
            isOnline: false,
          },
        ];

        const mockVehiclesData: FirebaseVehicle[] = [
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
            fuelType: "petrol",
            lastService: new Date("2024-11-01"),
            nextService: new Date("2025-02-01"),
            insuranceExpiry: new Date("2025-06-15"),
            registrationExpiry: new Date("2025-12-31"),
            pollutionExpiry: new Date("2025-01-15"),
            totalKmDriven: 45000,
            totalRides: 487,
            averageRating: 4.8,
            createdAt: new Date("2024-01-15"),
            updatedAt: new Date(),
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
            fuelType: "petrol",
            lastService: new Date("2024-11-15"),
            nextService: new Date("2025-02-15"),
            insuranceExpiry: new Date("2025-08-20"),
            registrationExpiry: new Date("2026-03-15"),
            pollutionExpiry: new Date("2025-02-20"),
            totalKmDriven: 12000,
            totalRides: 0,
            averageRating: 0,
            createdAt: new Date("2024-10-01"),
            updatedAt: new Date(),
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
            fuelType: "petrol",
            lastService: new Date("2024-10-20"),
            nextService: new Date("2025-01-20"),
            insuranceExpiry: new Date("2025-07-10"),
            registrationExpiry: new Date("2026-02-28"),
            pollutionExpiry: new Date("2025-01-10"),
            totalKmDriven: 18500,
            totalRides: 392,
            averageRating: 4.7,
            createdAt: new Date("2024-02-01"),
            updatedAt: new Date(),
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
            fuelType: "petrol",
            lastService: new Date("2024-12-01"),
            nextService: new Date("2025-03-01"),
            insuranceExpiry: new Date("2025-09-30"),
            registrationExpiry: new Date("2026-05-15"),
            pollutionExpiry: new Date("2025-03-30"),
            totalKmDriven: 8500,
            totalRides: 0,
            averageRating: 0,
            createdAt: new Date("2024-11-01"),
            updatedAt: new Date(),
          },
        ];

        setDrivers(mockDriversData);
        setVehicles(mockVehiclesData);

        // Calculate dashboard stats
        const stats = {
          drivers: {
            total: mockDriversData.length,
            active: mockDriversData.filter(d => d.status === "active").length,
            pending: mockDriversData.filter(d => d.status === "pending").length,
            suspended: mockDriversData.filter(d => d.status === "suspended").length,
            online: mockDriversData.filter(d => d.isOnline).length,
            vehicleOwners: mockDriversData.filter(d => d.driverType.type === "owner").length,
            fleetDrivers: mockDriversData.filter(d => d.driverType.type === "fleet").length,
          },
          vehicles: {
            total: mockVehiclesData.length,
            available: mockVehiclesData.filter(v => v.status === "available").length,
            assigned: mockVehiclesData.filter(v => v.status === "assigned").length,
            maintenance: mockVehiclesData.filter(v => v.status === "maintenance").length,
            company: mockVehiclesData.filter(v => v.type === "company").length,
            driverOwned: mockVehiclesData.filter(v => v.type === "driver_owned").length,
          },
          earnings: {
            totalRevenue: mockDriversData.reduce((sum, d) => sum + d.totalEarnings, 0),
            totalRides: mockDriversData.reduce((sum, d) => sum + d.totalRides, 0),
            totalKmDriven: mockDriversData.reduce((sum, d) => sum + d.totalKmDriven, 0),
            averageRating: mockDriversData.length > 0 
              ? mockDriversData.reduce((sum, d) => sum + d.averageRating, 0) / mockDriversData.length 
              : 0,
          },
          performance: {
            averageAcceptanceRate: mockDriversData.length > 0 
              ? mockDriversData.reduce((sum, d) => sum + d.acceptanceRate, 0) / mockDriversData.length 
              : 0,
            averageCompletionRate: mockDriversData.length > 0 
              ? mockDriversData.reduce((sum, d) => sum + d.completionRate, 0) / mockDriversData.length 
              : 0,
            totalOnlineHours: mockDriversData.reduce((sum, d) => sum + d.onlineHours, 0),
          },
        };

        setDashboardStats(stats);
        setLastUpdated(new Date());

        // Mock admin activities
        const mockActivities: AdminActivity[] = [
          {
            id: "a1",
            adminId: "admin1",
            adminName: "Admin",
            action: "approve_driver",
            targetType: "driver",
            targetId: "d1",
            details: { driverName: "Rajesh Kumar", approvedAt: new Date().toISOString() },
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          },
          {
            id: "a2",
            adminId: "admin1",
            adminName: "Admin",
            action: "assign_vehicle",
            targetType: "vehicle",
            targetId: "v3",
            details: { vehicleNumber: "DL 03 EF 9012", driverName: "Amit Singh" },
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          },
          {
            id: "a3",
            adminId: "admin1",
            adminName: "Admin",
            action: "suspend_driver",
            targetType: "driver",
            targetId: "d4",
            details: { driverName: "Vikash Gupta", suspensionReason: "Multiple customer complaints" },
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
          },
        ];

        setAdminActivities(mockActivities);

      } catch (error) {
        console.error("Error initializing admin service:", error);
        toast({
          title: "Error",
          description: "Failed to load admin data. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeAdminService();

    // Cleanup subscriptions on unmount
    return () => {
      if (driversUnsubscribe) driversUnsubscribe();
      if (vehiclesUnsubscribe) vehiclesUnsubscribe();
    };
  }, [toast]);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      setLastUpdated(new Date());
      // Trigger a data refresh here in a real app
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, []);

  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch =
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.phone.includes(searchTerm);
    const matchesStatus =
      filterStatus === "all" || driver.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "suspended":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "available":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "assigned":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "maintenance":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "out_of_service":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-3 h-3" />;
      case "pending":
        return <Clock className="w-3 h-3" />;
      case "suspended":
        return <Ban className="w-3 h-3" />;
      case "online":
        return <Wifi className="w-3 h-3 text-green-600" />;
      case "offline":
        return <WifiOff className="w-3 h-3 text-gray-400" />;
      default:
        return <XCircle className="w-3 h-3" />;
    }
  };

  const handleApproveDriver = async (driverId: string) => {
    try {
      setIsLoading(true);
      // In a real app, call adminFirebaseService.approveDriver
      
      // Update local state
      setDrivers(prev => prev.map(driver => 
        driver.id === driverId 
          ? { ...driver, status: "active" as const, documentsVerified: true, approvedAt: new Date() }
          : driver
      ));

      toast({
        title: "Driver Approved ✅",
        description: "Driver has been approved and can now start taking rides",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve driver. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectDriver = async (driverId: string, reason: string) => {
    try {
      setIsLoading(true);
      // In a real app, call adminFirebaseService.rejectDriver
      
      // Update local state
      setDrivers(prev => prev.map(driver => 
        driver.id === driverId 
          ? { ...driver, status: "inactive" as const, documentsVerified: false }
          : driver
      ));

      toast({
        title: "Driver Rejected",
        description: "Driver application has been rejected",
        variant: "destructive",
      });
      setRejectionReason("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject driver. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuspendDriver = async (driverId: string, reason: string) => {
    try {
      setIsLoading(true);
      // In a real app, call adminFirebaseService.suspendDriver
      
      // Update local state
      setDrivers(prev => prev.map(driver => 
        driver.id === driverId 
          ? { ...driver, status: "suspended" as const, isOnline: false }
          : driver
      ));

      toast({
        title: "Driver Suspended",
        description: "Driver has been suspended from the platform",
        variant: "destructive",
      });
      setSuspensionReason("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to suspend driver. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignVehicle = async (driverId: string, vehicleId: string) => {
    try {
      setIsLoading(true);
      const vehicle = vehicles.find(v => v.id === vehicleId);
      const driver = drivers.find(d => d.id === driverId);
      
      if (!vehicle || !driver) return;

      // Update local state
      setVehicles(prev => prev.map(v => 
        v.id === vehicleId 
          ? { ...v, status: "assigned" as const, assignedDriverId: driverId, assignedDriverName: driver.name }
          : v
      ));

      setDrivers(prev => prev.map(d => 
        d.id === driverId 
          ? { ...d, assignedVehicle: `${vehicle.make} ${vehicle.model} - ${vehicle.registrationNumber}` }
          : d
      ));

      toast({
        title: "Vehicle Assigned ✅",
        description: `${vehicle.make} ${vehicle.model} has been assigned to ${driver.name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign vehicle. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCommission = () => {
    toast({
      title: "Settings Updated ✅",
      description: "Commission and salary rates have been updated",
    });
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

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
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
              <div className="flex items-center space-x-2 text-sm">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-600">Live Data</span>
                </div>
                <span className="text-gray-400">•</span>
                <span className="text-gray-500">Updated {formatRelativeTime(lastUpdated)}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLastUpdated(new Date())}
                  disabled={isLoading}
                  className="ml-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>

              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                <Users className="w-3 h-3 mr-1" />
                {dashboardStats.drivers?.online || 0} Online Drivers
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
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
            <TabsTrigger value="dashboard" className="text-xs sm:text-sm">
              <BarChart3 className="w-4 h-4 mr-1" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="drivers" className="text-xs sm:text-sm">
              <Users className="w-4 h-4 mr-1" />
              Drivers
              {dashboardStats.drivers?.pending > 0 && (
                <Badge className="ml-2 bg-red-500 text-white text-xs">
                  {dashboardStats.drivers.pending}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="vehicles" className="text-xs sm:text-sm">
              <Car className="w-4 h-4 mr-1" />
              Vehicles
            </TabsTrigger>
            <TabsTrigger value="earnings" className="text-xs sm:text-sm">
              <IndianRupee className="w-4 h-4 mr-1" />
              Earnings
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs sm:text-sm">
              <Settings className="w-4 h-4 mr-1" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-gray-800">
                  Admin Dashboard
                </h2>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </div>

              {/* Enhanced Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600 font-medium flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          Total Drivers
                        </p>
                        <p className="text-3xl font-bold text-blue-700">
                          {dashboardStats.drivers?.total || 0}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-sm">
                          <span className="text-green-600 flex items-center">
                            <Wifi className="w-3 h-3 mr-1" />
                            {dashboardStats.drivers?.online || 0} online
                          </span>
                          <span className="text-yellow-600 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {dashboardStats.drivers?.pending || 0} pending
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                          <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="text-xs text-blue-600">
                          {dashboardStats.drivers?.active || 0} active
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600 font-medium flex items-center">
                          <Car className="w-4 h-4 mr-1" />
                          Total Vehicles
                        </p>
                        <p className="text-3xl font-bold text-green-700">
                          {dashboardStats.vehicles?.total || 0}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-sm">
                          <span className="text-blue-600 flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {dashboardStats.vehicles?.available || 0} available
                          </span>
                          <span className="text-orange-600 flex items-center">
                            <Wrench className="w-3 h-3 mr-1" />
                            {dashboardStats.vehicles?.maintenance || 0} maintenance
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                          <Car className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="text-xs text-green-600">
                          {dashboardStats.vehicles?.assigned || 0} assigned
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-600 font-medium flex items-center">
                          <IndianRupee className="w-4 h-4 mr-1" />
                          Total Revenue
                        </p>
                        <p className="text-3xl font-bold text-purple-700">
                          ₹{(dashboardStats.earnings?.totalRevenue || 0).toLocaleString()}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-sm">
                          <span className="text-purple-600 flex items-center">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {dashboardStats.earnings?.totalRides || 0} rides
                          </span>
                          <span className="text-purple-600 flex items-center">
                            <Star className="w-3 h-3 mr-1" />
                            {(dashboardStats.earnings?.averageRating || 0).toFixed(1)}★
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                          <IndianRupee className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="text-xs text-purple-600">
                          {(dashboardStats.earnings?.totalKmDriven || 0).toLocaleString()} km
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-orange-600 font-medium flex items-center">
                          <Activity className="w-4 h-4 mr-1" />
                          Performance
                        </p>
                        <p className="text-3xl font-bold text-orange-700">
                          {Math.round(dashboardStats.performance?.averageAcceptanceRate || 0)}%
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-sm">
                          <span className="text-orange-600 flex items-center">
                            <Target className="w-3 h-3 mr-1" />
                            {Math.round(dashboardStats.performance?.averageCompletionRate || 0)}% completion
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-2">
                          <Activity className="w-6 h-6 text-orange-600" />
                        </div>
                        <div className="text-xs text-orange-600">
                          {dashboardStats.performance?.totalOnlineHours || 0}h online
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Real-time Activity Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Bell className="w-5 h-5 mr-2 text-blue-600" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {adminActivities.map((activity) => (
                        <div key={activity.id} className="flex items-start space-x-4 p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            {activity.action.includes('approve') && <CheckCircle className="w-4 h-4 text-green-600" />}
                            {activity.action.includes('reject') && <XCircle className="w-4 h-4 text-red-600" />}
                            {activity.action.includes('suspend') && <Ban className="w-4 h-4 text-orange-600" />}
                            {activity.action.includes('assign') && <Car className="w-4 h-4 text-blue-600" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {activity.action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </p>
                            <p className="text-xs text-gray-600">
                              {activity.details.driverName && `Driver: ${activity.details.driverName}`}
                              {activity.details.vehicleNumber && `Vehicle: ${activity.details.vehicleNumber}`}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatRelativeTime(activity.timestamp)} by {activity.adminName}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
                      Alerts & Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboardStats.drivers?.pending > 0 && (
                        <div className="flex items-center space-x-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <AlertTriangle className="w-5 h-5 text-yellow-600" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-yellow-800">
                              {dashboardStats.drivers.pending} pending driver applications
                            </p>
                            <p className="text-xs text-yellow-700">
                              Review and approve new driver registrations
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => setActiveTab("drivers")}
                            className="bg-yellow-600 hover:bg-yellow-700"
                          >
                            Review
                          </Button>
                        </div>
                      )}

                      {vehicles.filter(v => v.status === "maintenance").length > 0 && (
                        <div className="flex items-center space-x-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                          <Wrench className="w-5 h-5 text-orange-600" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-orange-800">
                              {vehicles.filter(v => v.status === "maintenance").length} vehicles in maintenance
                            </p>
                            <p className="text-xs text-orange-700">
                              Monitor vehicle maintenance status
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setActiveTab("vehicles")}
                            className="border-orange-200 text-orange-600 hover:bg-orange-50"
                          >
                            View
                          </Button>
                        </div>
                      )}

                      {drivers.filter(d => d.status === "suspended").length > 0 && (
                        <div className="flex items-center space-x-4 p-3 bg-red-50 rounded-lg border border-red-200">
                          <Ban className="w-5 h-5 text-red-600" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-red-800">
                              {drivers.filter(d => d.status === "suspended").length} suspended drivers
                            </p>
                            <p className="text-xs text-red-700">
                              Review suspended driver accounts
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setActiveTab("drivers")}
                            className="border-red-200 text-red-600 hover:bg-red-50"
                          >
                            Review
                          </Button>
                        </div>
                      )}

                      <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg border border-green-200">
                        <Star className="w-5 h-5 text-green-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-800">
                            Platform rating: {(dashboardStats.earnings?.averageRating || 0).toFixed(1)}★
                          </p>
                          <p className="text-xs text-green-700">
                            Excellent customer satisfaction
                          </p>
                        </div>
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          Excellent
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Enhanced Drivers Tab */}
          <TabsContent value="drivers">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">
                  Driver Management
                </h2>
                <div className="flex items-center space-x-3">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button className="bg-yellow-600 hover:bg-yellow-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Driver
                  </Button>
                </div>
              </div>

              {/* Enhanced Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search drivers by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Enhanced Drivers List */}
              <div className="grid gap-4">
                {filteredDrivers.map((driver) => (
                  <Card
                    key={driver.id}
                    className="hover:shadow-md transition-all duration-200 border-l-4"
                    style={{
                      borderLeftColor: 
                        driver.status === "active" ? "#10b981" :
                        driver.status === "pending" ? "#f59e0b" :
                        driver.status === "suspended" ? "#ef4444" : "#6b7280"
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              {driver.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </div>
                            {driver.isOnline && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold text-lg">
                                {driver.name}
                              </h3>
                              {driver.isOnline && (
                                <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                                  <Wifi className="w-3 h-3 mr-1" />
                                  Online
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge
                                className={
                                  driver.driverType.type === "owner"
                                    ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                    : "bg-blue-100 text-blue-800 border-blue-200"
                                }
                              >
                                {driver.driverType.type === "owner" ? (
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
                                {getStatusIcon(driver.status)}
                                <span className="ml-1">{driver.status}</span>
                              </Badge>
                              {driver.documentsVerified && (
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                  <Shield className="w-3 h-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div className="flex items-center space-x-1">
                                <Mail className="w-3 h-3" />
                                <span>{driver.email}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Phone className="w-3 h-3" />
                                <span>{driver.phone}</span>
                              </div>
                              {driver.currentLocation && (
                                <div className="flex items-center space-x-1 text-green-600">
                                  <MapPin className="w-3 h-3" />
                                  <span>Last seen {formatRelativeTime(driver.currentLocation.lastUpdated)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600 flex items-center">
                              <Star className="w-3 h-3 mr-1" />
                              Rating
                            </p>
                            <p className="font-semibold">
                              {driver.averageRating > 0 ? `${driver.averageRating}★` : "New"}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 flex items-center">
                              <Car className="w-3 h-3 mr-1" />
                              Rides
                            </p>
                            <p className="font-semibold">{driver.totalRides}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 flex items-center">
                              <IndianRupee className="w-3 h-3 mr-1" />
                              Earnings
                            </p>
                            <p className="font-semibold">
                              ₹{driver.totalEarnings.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 flex items-center">
                              <Navigation className="w-3 h-3 mr-1" />
                              Distance
                            </p>
                            <p className="font-semibold">{driver.totalKmDriven} km</p>
                          </div>
                          <div>
                            <p className="text-gray-600 flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              Joined
                            </p>
                            <p className="font-semibold">
                              {formatDate(driver.joinDate)}
                            </p>
                          </div>
                        </div>

                        {/* Enhanced Action Buttons */}
                        <div className="flex flex-col space-y-2 lg:w-48">
                          {driver.status === "pending" ? (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => handleApproveDriver(driver.id)}
                                disabled={isLoading}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                                  >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Reject
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Reject Driver Application</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Please provide a reason for rejecting {driver.name}'s application.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <Textarea
                                    placeholder="Enter rejection reason..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                  />
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleRejectDriver(driver.id, rejectionReason)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Reject Application
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="flex space-x-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setSelectedDriver(driver)}
                                      className="flex-1"
                                    >
                                      <Eye className="w-4 h-4 mr-1" />
                                      View
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                    <DialogHeader>
                                      <DialogTitle className="flex items-center space-x-2">
                                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                                          {driver.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                        </div>
                                        <div>
                                          <span>Driver Details - {driver.name}</span>
                                          <div className="flex items-center space-x-2 mt-1">
                                            <Badge className={getStatusColor(driver.status)}>
                                              {driver.status}
                                            </Badge>
                                            {driver.isOnline && (
                                              <Badge className="bg-green-100 text-green-800">
                                                <Wifi className="w-3 h-3 mr-1" />
                                                Online
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                      </DialogTitle>
                                    </DialogHeader>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      {/* Personal Information */}
                                      <div className="space-y-4">
                                        <div>
                                          <Label className="text-sm text-gray-600 font-semibold">
                                            Personal Information
                                          </Label>
                                          <div className="space-y-2 mt-2 p-3 bg-gray-50 rounded-lg">
                                            <div className="flex justify-between">
                                              <span className="text-sm text-gray-600">Email:</span>
                                              <span className="text-sm font-medium">{driver.email}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-sm text-gray-600">Phone:</span>
                                              <span className="text-sm font-medium">{driver.phone}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-sm text-gray-600">License:</span>
                                              <span className="text-sm font-medium">{driver.licenseNumber}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-sm text-gray-600">Joined:</span>
                                              <span className="text-sm font-medium">{formatDate(driver.joinDate)}</span>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Driver Type & Vehicle Info */}
                                        <div>
                                          <Label className="text-sm text-gray-600 font-semibold">
                                            Driver Type & Vehicle
                                          </Label>
                                          <div className="space-y-2 mt-2 p-3 bg-gray-50 rounded-lg">
                                            <div className="flex justify-between">
                                              <span className="text-sm text-gray-600">Type:</span>
                                              <Badge className={
                                                driver.driverType.type === "owner"
                                                  ? "bg-yellow-100 text-yellow-800"
                                                  : "bg-blue-100 text-blue-800"
                                              }>
                                                {driver.driverType.type === "owner" ? "Vehicle Owner" : "Fleet Driver"}
                                              </Badge>
                                            </div>
                                            {driver.driverType.type === "owner" ? (
                                              <>
                                                <div className="flex justify-between">
                                                  <span className="text-sm text-gray-600">Vehicle:</span>
                                                  <span className="text-sm font-medium">{driver.vehicleModel}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                  <span className="text-sm text-gray-600">Number:</span>
                                                  <span className="text-sm font-medium">{driver.vehicleNumber}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                  <span className="text-sm text-gray-600">Commission:</span>
                                                  <span className="text-sm font-medium">{(driver.driverType.commissionRate || 0) * 100}%</span>
                                                </div>
                                              </>
                                            ) : (
                                              <>
                                                <div className="flex justify-between">
                                                  <span className="text-sm text-gray-600">Assigned Vehicle:</span>
                                                  <span className="text-sm font-medium">{driver.assignedVehicle}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                  <span className="text-sm text-gray-600">Salary Rate:</span>
                                                  <span className="text-sm font-medium">₹{driver.driverType.salaryPerKm}/km</span>
                                                </div>
                                              </>
                                            )}
                                            <div className="flex justify-between">
                                              <span className="text-sm text-gray-600">Documents:</span>
                                              <Badge className={
                                                driver.documentsVerified 
                                                  ? "bg-green-100 text-green-800"
                                                  : "bg-red-100 text-red-800"
                                              }>
                                                {driver.documentsVerified ? "Verified" : "Pending"}
                                              </Badge>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Performance & Activity */}
                                      <div className="space-y-4">
                                        <div>
                                          <Label className="text-sm text-gray-600 font-semibold">
                                            Performance Metrics
                                          </Label>
                                          <div className="grid grid-cols-2 gap-4 mt-2">
                                            <div className="p-3 bg-blue-50 rounded-lg text-center">
                                              <div className="text-2xl font-bold text-blue-600">
                                                {driver.averageRating}★
                                              </div>
                                              <div className="text-xs text-blue-700">Rating</div>
                                            </div>
                                            <div className="p-3 bg-green-50 rounded-lg text-center">
                                              <div className="text-2xl font-bold text-green-600">
                                                {driver.totalRides}
                                              </div>
                                              <div className="text-xs text-green-700">Total Rides</div>
                                            </div>
                                            <div className="p-3 bg-purple-50 rounded-lg text-center">
                                              <div className="text-2xl font-bold text-purple-600">
                                                {driver.acceptanceRate}%
                                              </div>
                                              <div className="text-xs text-purple-700">Acceptance</div>
                                            </div>
                                            <div className="p-3 bg-orange-50 rounded-lg text-center">
                                              <div className="text-2xl font-bold text-orange-600">
                                                {driver.completionRate}%
                                              </div>
                                              <div className="text-xs text-orange-700">Completion</div>
                                            </div>
                                          </div>
                                        </div>

                                        <div>
                                          <Label className="text-sm text-gray-600 font-semibold">
                                            Earnings & Activity
                                          </Label>
                                          <div className="space-y-2 mt-2 p-3 bg-gray-50 rounded-lg">
                                            <div className="flex justify-between">
                                              <span className="text-sm text-gray-600">Total Earnings:</span>
                                              <span className="text-sm font-bold text-green-600">
                                                ₹{driver.totalEarnings.toLocaleString()}
                                              </span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-sm text-gray-600">Distance Driven:</span>
                                              <span className="text-sm font-medium">{driver.totalKmDriven} km</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-sm text-gray-600">Online Hours:</span>
                                              <span className="text-sm font-medium">{driver.onlineHours}h</span>
                                            </div>
                                            {driver.lastActive && (
                                              <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Last Active:</span>
                                                <span className="text-sm font-medium">
                                                  {formatRelativeTime(driver.lastActive)}
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        </div>

                                        {/* Current Shift (for fleet drivers) */}
                                        {driver.driverType.type === "fleet" && driver.currentShift && (
                                          <div>
                                            <Label className="text-sm text-gray-600 font-semibold">
                                              Current Shift
                                            </Label>
                                            <div className="space-y-2 mt-2 p-3 bg-blue-50 rounded-lg">
                                              <div className="flex justify-between">
                                                <span className="text-sm text-blue-700">Started:</span>
                                                <span className="text-sm font-medium text-blue-800">
                                                  {formatTime(driver.currentShift.startTime)}
                                                </span>
                                              </div>
                                              <div className="flex justify-between">
                                                <span className="text-sm text-blue-700">Target:</span>
                                                <span className="text-sm font-medium text-blue-800">
                                                  {driver.currentShift.targetKm} km
                                                </span>
                                              </div>
                                              <div className="flex justify-between">
                                                <span className="text-sm text-blue-700">Completed:</span>
                                                <span className="text-sm font-medium text-blue-800">
                                                  {driver.currentShift.completedKm} km
                                                </span>
                                              </div>
                                              <div className="mt-2">
                                                <Progress 
                                                  value={((driver.currentShift.completedKm || 0) / (driver.currentShift.targetKm || 1)) * 100} 
                                                  className="h-2"
                                                />
                                              </div>
                                              <div className="flex justify-between">
                                                <span className="text-sm text-blue-700">Shift Earnings:</span>
                                                <span className="text-sm font-bold text-blue-800">
                                                  ₹{driver.currentShift.earnings}
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Vehicle Assignment for Fleet Drivers */}
                                    {driver.driverType.type === "fleet" && driver.status === "active" && (
                                      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <Label className="text-sm text-blue-700 font-semibold">
                                          Vehicle Assignment
                                        </Label>
                                        <div className="flex items-center space-x-2 mt-2">
                                          <Select
                                            value={driver.assignedVehicle || ""}
                                            onValueChange={(value) => handleAssignVehicle(driver.id, value)}
                                          >
                                            <SelectTrigger className="flex-1">
                                              <SelectValue placeholder="Assign vehicle" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {vehicles
                                                .filter(v => v.type === "company" && (v.status === "available" || v.assignedDriverId === driver.id))
                                                .map((vehicle) => (
                                                  <SelectItem key={vehicle.id} value={vehicle.id}>
                                                    {vehicle.make} {vehicle.model} - {vehicle.registrationNumber}
                                                    {vehicle.assignedDriverId === driver.id && " (Current)"}
                                                  </SelectItem>
                                                ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                    )}
                                  </DialogContent>
                                </Dialog>

                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="flex-1"
                                >
                                  <Edit className="w-4 h-4 mr-1" />
                                  Edit
                                </Button>
                              </div>

                              {driver.status === "active" && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="w-full border-orange-200 text-orange-600 hover:bg-orange-50"
                                    >
                                      <Ban className="w-4 h-4 mr-1" />
                                      Suspend
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Suspend Driver</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Please provide a reason for suspending {driver.name}.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <Textarea
                                      placeholder="Enter suspension reason..."
                                      value={suspensionReason}
                                      onChange={(e) => setSuspensionReason(e.target.value)}
                                    />
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleSuspendDriver(driver.id, suspensionReason)}
                                        className="bg-orange-600 hover:bg-orange-700"
                                      >
                                        Suspend Driver
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}

                              {driver.status === "suspended" && (
                                <Button
                                  size="sm"
                                  onClick={() => handleApproveDriver(driver.id)}
                                  className="w-full bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Reactivate
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredDrivers.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">
                      No drivers found
                    </h3>
                    <p className="text-gray-500">
                      {searchTerm || filterStatus !== "all"
                        ? "Try adjusting your search or filter criteria"
                        : "No drivers have been registered yet"}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Vehicle Management Tab */}
          <TabsContent value="vehicles">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">
                  Vehicle Management
                </h2>
                <div className="flex items-center space-x-3">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button className="bg-yellow-600 hover:bg-yellow-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Vehicle
                  </Button>
                </div>
              </div>

              {/* Vehicles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map((vehicle) => (
                  <Card
                    key={vehicle.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <Car className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold">
                                {vehicle.make} {vehicle.model}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {vehicle.registrationNumber}
                              </p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(vehicle.status)}>
                            {getStatusIcon(vehicle.status)}
                            <span className="ml-1">{vehicle.status}</span>
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
                            <p className="font-semibold">
                              {vehicle.mileage.toLocaleString()} km
                            </p>
                          </div>
                        </div>

                        {vehicle.assignedDriverName && (
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4 text-blue-600" />
                              <div>
                                <p className="text-sm font-medium text-blue-800">
                                  Assigned to: {vehicle.assignedDriverName}
                                </p>
                                <p className="text-xs text-blue-600">
                                  {vehicle.totalRides} rides • {vehicle.averageRating}★ rating
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Service & Document Status */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">Next Service:</span>
                            <span className={
                              vehicle.nextService < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                                ? "text-orange-600 font-medium"
                                : "text-gray-800"
                            }>
                              {formatDate(vehicle.nextService)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">Insurance:</span>
                            <span className={
                              vehicle.insuranceExpiry < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                                ? "text-red-600 font-medium"
                                : "text-gray-800"
                            }>
                              {formatDate(vehicle.insuranceExpiry)}
                            </span>
                          </div>
                        </div>

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
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="flex items-center space-x-2">
                                  <Car className="w-6 h-6 text-blue-600" />
                                  <span>Vehicle Details - {vehicle.make} {vehicle.model}</span>
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-4">
                                    <div>
                                      <Label className="text-sm text-gray-600 font-semibold">
                                        Vehicle Information
                                      </Label>
                                      <div className="space-y-2 mt-2 p-3 bg-gray-50 rounded-lg">
                                        <div className="flex justify-between">
                                          <span className="text-sm text-gray-600">Registration:</span>
                                          <span className="text-sm font-medium">{vehicle.registrationNumber}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-sm text-gray-600">Year:</span>
                                          <span className="text-sm font-medium">{vehicle.year}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-sm text-gray-600">Color:</span>
                                          <span className="text-sm font-medium">{vehicle.color}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-sm text-gray-600">Fuel Type:</span>
                                          <span className="text-sm font-medium capitalize">{vehicle.fuelType}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-sm text-gray-600">Type:</span>
                                          <Badge className={
                                            vehicle.type === "company" 
                                              ? "bg-blue-100 text-blue-800"
                                              : "bg-yellow-100 text-yellow-800"
                                          }>
                                            {vehicle.type === "company" ? "Company" : "Driver Owned"}
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>

                                    <div>
                                      <Label className="text-sm text-gray-600 font-semibold">
                                        Performance
                                      </Label>
                                      <div className="grid grid-cols-3 gap-2 mt-2">
                                        <div className="p-2 bg-blue-50 rounded text-center">
                                          <div className="text-lg font-bold text-blue-600">
                                            {vehicle.totalRides}
                                          </div>
                                          <div className="text-xs text-blue-700">Rides</div>
                                        </div>
                                        <div className="p-2 bg-green-50 rounded text-center">
                                          <div className="text-lg font-bold text-green-600">
                                            {vehicle.averageRating || 0}★
                                          </div>
                                          <div className="text-xs text-green-700">Rating</div>
                                        </div>
                                        <div className="p-2 bg-purple-50 rounded text-center">
                                          <div className="text-lg font-bold text-purple-600">
                                            {vehicle.totalKmDriven.toLocaleString()}
                                          </div>
                                          <div className="text-xs text-purple-700">KM</div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-4">
                                    <div>
                                      <Label className="text-sm text-gray-600 font-semibold">
                                        Documents & Maintenance
                                      </Label>
                                      <div className="space-y-2 mt-2 p-3 bg-gray-50 rounded-lg">
                                        <div className="flex justify-between">
                                          <span className="text-sm text-gray-600">Last Service:</span>
                                          <span className="text-sm font-medium">{formatDate(vehicle.lastService)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span className="text-sm text-gray-600">Next Service:</span>
                                          <span className={`text-sm font-medium ${
                                            vehicle.nextService < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                                              ? "text-orange-600"
                                              : ""
                                          }`}>
                                            {formatDate(vehicle.nextService)}
                                          </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span className="text-sm text-gray-600">Insurance Expiry:</span>
                                          <span className={`text-sm font-medium ${
                                            vehicle.insuranceExpiry < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                                              ? "text-red-600"
                                              : ""
                                          }`}>
                                            {formatDate(vehicle.insuranceExpiry)}
                                          </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span className="text-sm text-gray-600">Registration Expiry:</span>
                                          <span className={`text-sm font-medium ${
                                            vehicle.registrationExpiry < new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
                                              ? "text-orange-600"
                                              : ""
                                          }`}>
                                            {formatDate(vehicle.registrationExpiry)}
                                          </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span className="text-sm text-gray-600">Pollution Expiry:</span>
                                          <span className={`text-sm font-medium ${
                                            vehicle.pollutionExpiry < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                                              ? "text-orange-600"
                                              : ""
                                          }`}>
                                            {formatDate(vehicle.pollutionExpiry)}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {vehicle.assignedDriverName && (
                                      <div>
                                        <Label className="text-sm text-gray-600 font-semibold">
                                          Assignment
                                        </Label>
                                        <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                          <div className="flex items-center space-x-2">
                                            <User className="w-4 h-4 text-blue-600" />
                                            <div>
                                              <p className="text-sm font-medium text-blue-800">
                                                {vehicle.assignedDriverName}
                                              </p>
                                              <p className="text-xs text-blue-600">
                                                Assigned Driver
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button size="sm" variant="outline" className="flex-1">
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

          {/* Enhanced Earnings Tab */}
          <TabsContent value="earnings">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">
                  Earnings & Commission
                </h2>
                <div className="flex items-center space-x-3">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </Button>
                  <Select defaultValue="monthly">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600 font-medium">
                          Total Revenue
                        </p>
                        <p className="text-2xl font-bold text-green-700">
                          ₹{(dashboardStats.earnings?.totalRevenue || 0).toLocaleString()}
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
                        <p className="text-sm text-yellow-600 font-medium">
                          Commission Earned
                        </p>
                        <p className="text-2xl font-bold text-yellow-700">
                          ₹{Math.round(
                            drivers
                              .filter(d => d.driverType.type === "owner")
                              .reduce((sum, d) => sum + d.totalEarnings * (d.driverType.commissionRate || 0), 0)
                          ).toLocaleString()}
                        </p>
                        <p className="text-xs text-yellow-600">
                          From vehicle owners
                        </p>
                      </div>
                      <IndianRupee className="w-8 h-8 text-yellow-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600 font-medium">
                          Fleet Salaries
                        </p>
                        <p className="text-2xl font-bold text-blue-700">
                          ₹{drivers
                            .filter(d => d.driverType.type === "fleet")
                            .reduce((sum, d) => sum + d.totalEarnings, 0)
                            .toLocaleString()}
                        </p>
                        <p className="text-xs text-blue-600">
                          Paid to fleet drivers
                        </p>
                      </div>
                      <Building className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-600 font-medium">
                          Avg. per Driver
                        </p>
                        <p className="text-2xl font-bold text-purple-700">
                          ₹{Math.round(
                            (dashboardStats.earnings?.totalRevenue || 0) /
                              Math.max(dashboardStats.drivers?.active || 1, 1)
                          ).toLocaleString()}
                        </p>
                        <p className="text-xs text-purple-600">
                          Monthly average
                        </p>
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
                        <div
                          key={driver.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-semibold">{driver.name}</p>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Badge className={
                                  driver.driverType.type === "owner"
                                    ? "bg-yellow-100 text-yellow-800 text-xs"
                                    : "bg-blue-100 text-blue-800 text-xs"
                                }>
                                  {driver.driverType.type === "owner" ? "Owner" : "Fleet"}
                                </Badge>
                                <span>•</span>
                                <span>{driver.totalRides} rides</span>
                                <span>•</span>
                                <span>{driver.averageRating}★</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">
                              ₹{driver.totalEarnings.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600">
                              {driver.totalKmDriven} km driven
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Enhanced Settings Tab */}
          <TabsContent value="settings">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Platform Settings
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="w-5 h-5 mr-2 text-blue-600" />
                      Commission & Salary Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="vehicleOwnerRate">
                          Vehicle Owner Commission (%)
                        </Label>
                        <Input
                          id="vehicleOwnerRate"
                          type="number"
                          value={commissionSettings.vehicleOwnerRate}
                          onChange={(e) =>
                            setCommissionSettings(prev => ({
                              ...prev,
                              vehicleOwnerRate: parseFloat(e.target.value),
                            }))
                          }
                          min="0"
                          max="20"
                          step="0.1"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Commission rate for drivers who own their vehicles
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="fleetDriverRate">
                          Fleet Driver Salary (₹/km)
                        </Label>
                        <Input
                          id="fleetDriverRate"
                          type="number"
                          value={commissionSettings.fleetDriverSalaryRate}
                          onChange={(e) =>
                            setCommissionSettings(prev => ({
                              ...prev,
                              fleetDriverSalaryRate: parseFloat(e.target.value),
                            }))
                          }
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
                          onChange={(e) =>
                            setCommissionSettings(prev => ({
                              ...prev,
                              platformFee: parseFloat(e.target.value),
                            }))
                          }
                          min="0"
                          max="10"
                          step="0.1"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Additional platform fee on all rides
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={handleUpdateCommission}
                      className="w-full bg-yellow-600 hover:bg-yellow-700"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Update Settings
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="w-5 h-5 mr-2 text-green-600" />
                      Performance Bonuses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {commissionSettings.bonusThresholds.map((threshold, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <Label htmlFor={`rides-${index}`} className="text-sm">
                              Rides Completed
                            </Label>
                            <Input
                              id={`rides-${index}`}
                              type="number"
                              value={threshold.rides}
                              onChange={(e) => {
                                const newThresholds = [...commissionSettings.bonusThresholds];
                                newThresholds[index].rides = parseInt(e.target.value);
                                setCommissionSettings(prev => ({
                                  ...prev,
                                  bonusThresholds: newThresholds,
                                }));
                              }}
                              min="10"
                              step="10"
                            />
                          </div>
                          <div className="flex-1">
                            <Label htmlFor={`bonus-${index}`} className="text-sm">
                              Bonus Amount (₹)
                            </Label>
                            <Input
                              id={`bonus-${index}`}
                              type="number"
                              value={threshold.bonus}
                              onChange={(e) => {
                                const newThresholds = [...commissionSettings.bonusThresholds];
                                newThresholds[index].bonus = parseInt(e.target.value);
                                setCommissionSettings(prev => ({
                                  ...prev,
                                  bonusThresholds: newThresholds,
                                }));
                              }}
                              min="100"
                              step="100"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Settings Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
                        <Crown className="w-4 h-4 mr-2" />
                        Vehicle Owner Example
                      </h4>
                      <p className="text-sm text-yellow-700">
                        For a ₹500 ride, driver keeps ₹
                        {500 - (500 * commissionSettings.vehicleOwnerRate) / 100}
                        <br />
                        <span className="text-xs">
                          (₹{(500 * commissionSettings.vehicleOwnerRate) / 100} commission deducted)
                        </span>
                      </p>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                        <Building className="w-4 h-4 mr-2" />
                        Fleet Driver Example
                      </h4>
                      <p className="text-sm text-blue-700">
                        For a 10km trip, driver earns ₹
                        {10 * commissionSettings.fleetDriverSalaryRate}
                        <br />
                        <span className="text-xs">
                          (₹{commissionSettings.fleetDriverSalaryRate}/km salary rate)
                        </span>
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
