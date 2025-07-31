import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/config";
import { firebaseDriverService, type FirebaseDriver } from "@/services/firebaseDriverService";
import { fallbackAuthService } from "@/services/fallbackAuthService";
import { Timestamp } from "firebase/firestore";
import {
  Car,
  User,
  FileText,
  Phone,
  Shield,
  Upload,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building,
  CreditCard,
  Camera,
  MapPin,
  Calendar,
  Crown,
} from "lucide-react";

interface DriverFormData {
  // Personal Information
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
  address: string;
  
  // Driver License Information
  licenseNumber: string;
  licenseExpiry: string;
  licenseDocument: File | null;
  
  // Vehicle Information (if owns car)
  hasVehicle: "yes" | "no" | "";
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vehicleColor: string;
  vehicleNumber: string;
  registrationDocument: File | null;
  insuranceDocument: File | null;
  
  // ID Verification
  idProofType: "aadhar" | "passport" | "voter" | "";
  idProofNumber: string;
  idProofDocument: File | null;
  
  // Background Check
  hasCleanRecord: boolean;
  backgroundCheckConsent: boolean;
  
  // Terms
  acceptTerms: boolean;
  acceptPrivacyPolicy: boolean;
}

const initialFormData: DriverFormData = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  dateOfBirth: "",
  address: "",
  licenseNumber: "",
  licenseExpiry: "",
  licenseDocument: null,
  hasVehicle: "",
  vehicleMake: "",
  vehicleModel: "",
  vehicleYear: "",
  vehicleColor: "",
  vehicleNumber: "",
  registrationDocument: null,
  insuranceDocument: null,
  idProofType: "",
  idProofNumber: "",
  idProofDocument: null,
  hasCleanRecord: false,
  backgroundCheckConsent: false,
  acceptTerms: false,
  acceptPrivacyPolicy: false,
};

export default function DriverSignup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<DriverFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  
  const licenseFileRef = useRef<HTMLInputElement>(null);
  const registrationFileRef = useRef<HTMLInputElement>(null);
  const insuranceFileRef = useRef<HTMLInputElement>(null);
  const idProofFileRef = useRef<HTMLInputElement>(null);

  const totalSteps = formData.hasVehicle === "yes" ? 6 : 5;
  const progress = (currentStep / totalSteps) * 100;

  const updateFormData = (field: keyof DriverFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (field: keyof DriverFormData, file: File | null) => {
    updateFormData(field, file);
  };

  const sendVerificationCode = async () => {
    if (!formData.phone) {
      toast({
        title: "Error",
        description: "Please enter your phone number first",
        variant: "destructive",
      });
      return;
    }

    try {
      // In a real app, this would send an SMS
      toast({
        title: "Verification Code Sent",
        description: `Code sent to ${formData.phone}. Use 123456 for demo.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send verification code",
        variant: "destructive",
      });
    }
  };

  const verifyPhone = () => {
    if (verificationCode === "123456") {
      setPhoneVerified(true);
      toast({
        title: "Phone Verified",
        description: "Your phone number has been verified successfully",
      });
    } else {
      toast({
        title: "Invalid Code",
        description: "Please enter the correct verification code",
        variant: "destructive",
      });
    }
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1: // Personal Info & Phone Verification
        if (!formData.fullName || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword || !formData.dateOfBirth || !formData.address) {
          toast({
            title: "Missing Information",
            description: "Please fill in all required fields",
            variant: "destructive",
          });
          return false;
        }
        if (formData.password.length < 6) {
          toast({
            title: "Weak Password",
            description: "Password must be at least 6 characters long",
            variant: "destructive",
          });
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          toast({
            title: "Password Mismatch",
            description: "Passwords do not match",
            variant: "destructive",
          });
          return false;
        }
        if (!phoneVerified) {
          toast({
            title: "Phone Not Verified",
            description: "Please verify your phone number to continue",
            variant: "destructive",
          });
          return false;
        }
        return true;

      case 2: // Vehicle Choice
        if (!formData.hasVehicle) {
          toast({
            title: "Vehicle Information Required",
            description: "Please select whether you have your own vehicle",
            variant: "destructive",
          });
          return false;
        }
        return true;

      case 3: // Vehicle Details (if has vehicle) OR Driver License (if no vehicle)
        if (formData.hasVehicle === "yes") {
          if (!formData.vehicleMake || !formData.vehicleModel || !formData.vehicleYear || 
              !formData.vehicleColor || !formData.vehicleNumber) {
            toast({
              title: "Missing Vehicle Information",
              description: "Please fill in all vehicle details",
              variant: "destructive",
            });
            return false;
          }
        } else {
          if (!formData.licenseNumber || !formData.licenseExpiry || !formData.licenseDocument) {
            toast({
              title: "Missing License Information",
              description: "Please provide your driver's license details and upload the document",
              variant: "destructive",
            });
            return false;
          }
        }
        return true;

      case 4: // Vehicle Documents (if has vehicle) OR ID Verification (if no vehicle)
        if (formData.hasVehicle === "yes") {
          if (!formData.registrationDocument || !formData.insuranceDocument) {
            toast({
              title: "Missing Documents",
              description: "Please upload both registration and insurance documents",
              variant: "destructive",
            });
            return false;
          }
        } else {
          if (!formData.idProofType || !formData.idProofNumber || !formData.idProofDocument) {
            toast({
              title: "Missing ID Verification",
              description: "Please provide ID proof details and upload the document",
              variant: "destructive",
            });
            return false;
          }
        }
        return true;

      case 5: // Driver License (if has vehicle) OR Background Check (if no vehicle)
        if (formData.hasVehicle === "yes") {
          if (!formData.licenseNumber || !formData.licenseExpiry || !formData.licenseDocument) {
            toast({
              title: "Missing License Information",
              description: "Please provide your driver's license details",
              variant: "destructive",
            });
            return false;
          }
        } else {
          if (!formData.hasCleanRecord || !formData.backgroundCheckConsent) {
            toast({
              title: "Background Check Required",
              description: "Please complete the background check section",
              variant: "destructive",
            });
            return false;
          }
        }
        return true;

      case 6: // ID Verification & Background Check (if has vehicle) OR Terms (if no vehicle)
        if (formData.hasVehicle === "yes") {
          if (!formData.idProofType || !formData.idProofNumber || !formData.idProofDocument ||
              !formData.hasCleanRecord || !formData.backgroundCheckConsent) {
            toast({
              title: "Missing Information",
              description: "Please complete all verification requirements",
              variant: "destructive",
            });
            return false;
          }
        }
        if (!formData.acceptTerms || !formData.acceptPrivacyPolicy) {
          toast({
            title: "Accept Terms",
            description: "Please accept the terms and conditions to continue",
            variant: "destructive",
          });
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;

      // Determine driver type
      const driverType = {
        type: formData.hasVehicle === "yes" ? "owner" : "fleet" as "owner" | "fleet",
        commissionRate: formData.hasVehicle === "yes" ? 0.05 : undefined,
        salaryPerKm: formData.hasVehicle === "no" ? 12 : undefined,
      };

      // Create driver document in Firestore
      const driverData: Omit<FirebaseDriver, "id" | "createdAt" | "updatedAt"> = {
        name: formData.fullName,
        email: formData.email.toLowerCase(),
        phone: formData.phone,
        driverType,
        status: "pending",
        rating: 0,
        totalRides: 0,
        totalEarnings: 0,
        totalKmDriven: 0,
        joinDate: Timestamp.now(),

        // Vehicle Information
        vehicleNumber: formData.hasVehicle === "yes" ? formData.vehicleNumber?.toUpperCase() : undefined,
        vehicleModel: formData.hasVehicle === "yes" ? `${formData.vehicleMake} ${formData.vehicleModel} ${formData.vehicleYear}` : undefined,

        // License and Documents
        licenseNumber: formData.licenseNumber.toUpperCase(),
        licenseExpiry: Timestamp.fromDate(new Date(formData.licenseExpiry)),
        documentsVerified: false,

        // ID Verification
        idProofType: formData.idProofType,
        idProofNumber: formData.idProofNumber,

        // Background Check
        hasCleanRecord: formData.hasCleanRecord,
        backgroundCheckCompleted: false,

        // Performance Metrics (initial values)
        acceptanceRate: 0,
        completionRate: 0,
        averageRating: 0,
        onlineHours: 0,
      };

      const driverId = await firebaseDriverService.createDriver(driverData);

      toast({
        title: "Application Submitted! 🎉",
        description: "Your driver application has been submitted successfully. You will be contacted within 24-48 hours for verification.",
      });

      setTimeout(() => {
        navigate("/driver-login");
      }, 2000);

    } catch (error: any) {
      console.error("Driver signup error:", error);

      let errorMessage = "An error occurred while submitting your application. Please try again.";

      if (error.code === "auth/email-already-in-use") {
        errorMessage = "An account with this email already exists. Please try logging in instead.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak. Please choose a stronger password.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address.";
      }

      toast({
        title: "Submission Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <User className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
              <p className="text-gray-600">Let's start with your basic details</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => updateFormData("fullName", e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                  placeholder="Enter your email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <div className="flex space-x-2">
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => updateFormData("phone", e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    disabled={phoneVerified}
                    className={phoneVerified ? "bg-green-50 border-green-300" : ""}
                  />
                  {!phoneVerified ? (
                    <Button 
                      type="button" 
                      onClick={sendVerificationCode}
                      variant="outline"
                      className="whitespace-nowrap"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Send OTP
                    </Button>
                  ) : (
                    <Button variant="outline" disabled className="text-green-600">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Verified
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => updateFormData("password", e.target.value)}
                  placeholder="Enter a strong password (min 6 characters)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                  placeholder="Confirm your password"
                />
                {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-sm text-red-600">Passwords do not match</p>
                )}
              </div>

              {formData.phone && !phoneVerified && (
                <div className="space-y-2">
                  <Label htmlFor="verificationCode">Verification Code *</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="verificationCode"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                    />
                    <Button 
                      type="button" 
                      onClick={verifyPhone}
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      Verify
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">Use 123456 for demo</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => updateFormData("dateOfBirth", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Complete Address *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => updateFormData("address", e.target.value)}
                placeholder="Enter your complete address"
                rows={3}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Car className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Vehicle Information</h2>
              <p className="text-gray-600">Do you have your own vehicle?</p>
            </div>

            <RadioGroup
              value={formData.hasVehicle}
              onValueChange={(value) => updateFormData("hasVehicle", value)}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <Card className={`p-6 cursor-pointer transition-all ${
                formData.hasVehicle === "yes" ? "ring-2 ring-yellow-500 bg-yellow-50" : "hover:shadow-md"
              }`}>
                <Label htmlFor="has-vehicle" className="cursor-pointer">
                  <div className="flex items-center space-x-4">
                    <RadioGroupItem value="yes" id="has-vehicle" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <Car className="w-8 h-8 text-yellow-600" />
                        <h3 className="text-lg font-semibold">I have my own car</h3>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p className="flex items-center space-x-2">
                          <Crown className="w-4 h-4 text-yellow-500" />
                          <span>5% commission on earnings</span>
                        </p>
                        <p className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Keep 95% of ride earnings</span>
                        </p>
                        <p className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Flexible working hours</span>
                        </p>
                        <p className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Choose your preferred routes</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </Label>
              </Card>

              <Card className={`p-6 cursor-pointer transition-all ${
                formData.hasVehicle === "no" ? "ring-2 ring-yellow-500 bg-yellow-50" : "hover:shadow-md"
              }`}>
                <Label htmlFor="no-vehicle" className="cursor-pointer">
                  <div className="flex items-center space-x-4">
                    <RadioGroupItem value="no" id="no-vehicle" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <Building className="w-8 h-8 text-blue-600" />
                        <h3 className="text-lg font-semibold">Join our fleet</h3>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p className="flex items-center space-x-2">
                          <CreditCard className="w-4 h-4 text-blue-500" />
                          <span>Salary based on kilometers driven</span>
                        </p>
                        <p className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>No vehicle maintenance costs</span>
                        </p>
                        <p className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Fuel provided by company</span>
                        </p>
                        <p className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Insurance coverage included</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </Label>
              </Card>
            </RadioGroup>

            {formData.hasVehicle && (
              <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">
                      {formData.hasVehicle === "yes" ? "Own Vehicle Requirements" : "Fleet Driver Requirements"}
                    </h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      {formData.hasVehicle === "yes" 
                        ? "You'll need to provide vehicle registration, insurance, and other documents in the next steps."
                        : "You'll be assigned a company vehicle after completing background verification and training."
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        if (formData.hasVehicle === "yes") {
          return (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Car className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900">Vehicle Details</h2>
                <p className="text-gray-600">Tell us about your vehicle</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="vehicleMake">Vehicle Make *</Label>
                  <Input
                    id="vehicleMake"
                    value={formData.vehicleMake}
                    onChange={(e) => updateFormData("vehicleMake", e.target.value)}
                    placeholder="e.g., Maruti Suzuki, Hyundai"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicleModel">Vehicle Model *</Label>
                  <Input
                    id="vehicleModel"
                    value={formData.vehicleModel}
                    onChange={(e) => updateFormData("vehicleModel", e.target.value)}
                    placeholder="e.g., Swift Dzire, i20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicleYear">Manufacturing Year *</Label>
                  <Input
                    id="vehicleYear"
                    type="number"
                    min="2010"
                    max="2024"
                    value={formData.vehicleYear}
                    onChange={(e) => updateFormData("vehicleYear", e.target.value)}
                    placeholder="e.g., 2020"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicleColor">Vehicle Color *</Label>
                  <Input
                    id="vehicleColor"
                    value={formData.vehicleColor}
                    onChange={(e) => updateFormData("vehicleColor", e.target.value)}
                    placeholder="e.g., White, Silver"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="vehicleNumber">Vehicle Registration Number *</Label>
                  <Input
                    id="vehicleNumber"
                    value={formData.vehicleNumber}
                    onChange={(e) => updateFormData("vehicleNumber", e.target.value.toUpperCase())}
                    placeholder="e.g., DL01AB1234"
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>
              </div>
            </div>
          );
        } else {
          return (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <FileText className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900">Driver's License</h2>
                <p className="text-gray-600">Upload your driving license details</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">License Number *</Label>
                  <Input
                    id="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={(e) => updateFormData("licenseNumber", e.target.value.toUpperCase())}
                    placeholder="e.g., DL1420110012345"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licenseExpiry">License Expiry Date *</Label>
                  <Input
                    id="licenseExpiry"
                    type="date"
                    value={formData.licenseExpiry}
                    onChange={(e) => updateFormData("licenseExpiry", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Upload License Document *</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => licenseFileRef.current?.click()}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {formData.licenseDocument ? "Change Document" : "Upload Document"}
                    </Button>
                    <input
                      ref={licenseFileRef}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload("licenseDocument", e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    {formData.licenseDocument && (
                      <p className="text-sm text-green-600 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        {formData.licenseDocument.name}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Upload clear photo of both sides of your license (JPEG, PNG, or PDF)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        }

      case 4:
        if (formData.hasVehicle === "yes") {
          return (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <FileText className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900">Vehicle Documents</h2>
                <p className="text-gray-600">Upload required vehicle documents</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label>Registration Certificate (RC) *</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => registrationFileRef.current?.click()}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Upload RC
                    </Button>
                    <input
                      ref={registrationFileRef}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload("registrationDocument", e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    {formData.registrationDocument && (
                      <p className="text-sm text-green-600 mt-2 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        {formData.registrationDocument.name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Insurance Document *</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insuranceFileRef.current?.click()}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Upload Insurance
                    </Button>
                    <input
                      ref={insuranceFileRef}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload("insuranceDocument", e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    {formData.insuranceDocument && (
                      <p className="text-sm text-green-600 mt-2 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        {formData.insuranceDocument.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800">Document Requirements</h4>
                    <ul className="text-sm text-blue-700 mt-1 space-y-1">
                      <li>• Ensure all documents are valid and not expired</li>
                      <li>• Upload clear, high-quality images</li>
                      <li>• All document names should match your provided information</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          );
        } else {
          return (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Shield className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900">ID Verification</h2>
                <p className="text-gray-600">Verify your identity with government-issued ID</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>ID Proof Type *</Label>
                  <RadioGroup
                    value={formData.idProofType}
                    onValueChange={(value) => updateFormData("idProofType", value)}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="aadhar" id="aadhar" />
                      <Label htmlFor="aadhar">Aadhar Card</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="passport" id="passport" />
                      <Label htmlFor="passport">Passport</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="voter" id="voter" />
                      <Label htmlFor="voter">Voter ID</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idProofNumber">ID Proof Number *</Label>
                  <Input
                    id="idProofNumber"
                    value={formData.idProofNumber}
                    onChange={(e) => updateFormData("idProofNumber", e.target.value)}
                    placeholder={
                      formData.idProofType === "aadhar" ? "XXXX XXXX XXXX" :
                      formData.idProofType === "passport" ? "Passport Number" :
                      "Voter ID Number"
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Upload ID Document *</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <div className="space-y-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => idProofFileRef.current?.click()}
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        {formData.idProofDocument ? "Change Document" : "Upload ID Proof"}
                      </Button>
                      <input
                        ref={idProofFileRef}
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload("idProofDocument", e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      {formData.idProofDocument && (
                        <p className="text-sm text-green-600 flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          {formData.idProofDocument.name}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Upload clear photo of your ID proof (JPEG, PNG, or PDF)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }

      case 5:
        if (formData.hasVehicle === "yes") {
          return (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <FileText className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900">Driver's License</h2>
                <p className="text-gray-600">Upload your driving license details</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">License Number *</Label>
                  <Input
                    id="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={(e) => updateFormData("licenseNumber", e.target.value.toUpperCase())}
                    placeholder="e.g., DL1420110012345"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licenseExpiry">License Expiry Date *</Label>
                  <Input
                    id="licenseExpiry"
                    type="date"
                    value={formData.licenseExpiry}
                    onChange={(e) => updateFormData("licenseExpiry", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Upload License Document *</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => licenseFileRef.current?.click()}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {formData.licenseDocument ? "Change Document" : "Upload Document"}
                    </Button>
                    <input
                      ref={licenseFileRef}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload("licenseDocument", e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    {formData.licenseDocument && (
                      <p className="text-sm text-green-600 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        {formData.licenseDocument.name}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Upload clear photo of both sides of your license (JPEG, PNG, or PDF)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        } else {
          return (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Shield className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900">Background Check</h2>
                <p className="text-gray-600">Safety verification and consent</p>
              </div>

              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Safety Declaration</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="cleanRecord"
                        checked={formData.hasCleanRecord}
                        onCheckedChange={(checked) => updateFormData("hasCleanRecord", checked)}
                      />
                      <Label htmlFor="cleanRecord" className="text-sm leading-relaxed">
                        I declare that I have no criminal record and have not been involved in any major traffic violations or accidents in the past 3 years. I understand that providing false information may result in immediate disqualification.
                      </Label>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="backgroundConsent"
                        checked={formData.backgroundCheckConsent}
                        onCheckedChange={(checked) => updateFormData("backgroundCheckConsent", checked)}
                      />
                      <Label htmlFor="backgroundConsent" className="text-sm leading-relaxed">
                        I consent to URide conducting a comprehensive background check including criminal record verification, driving history, and reference checks. I understand this is mandatory for fleet driver positions.
                      </Label>
                    </div>
                  </div>
                </Card>

                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800">Background Check Process</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Our background check includes criminal record verification, driving history review, and reference checks. This process typically takes 2-3 business days and is mandatory for all fleet drivers.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }

      case 6:
        if (formData.hasVehicle === "yes") {
          return (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Shield className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900">Final Verification</h2>
                <p className="text-gray-600">Complete ID verification and background check</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">ID Verification</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>ID Proof Type *</Label>
                      <RadioGroup
                        value={formData.idProofType}
                        onValueChange={(value) => updateFormData("idProofType", value)}
                        className="grid grid-cols-1 gap-3"
                      >
                        <div className="flex items-center space-x-2 p-3 border rounded-lg">
                          <RadioGroupItem value="aadhar" id="aadhar-final" />
                          <Label htmlFor="aadhar-final">Aadhar Card</Label>
                        </div>
                        <div className="flex items-center space-x-2 p-3 border rounded-lg">
                          <RadioGroupItem value="passport" id="passport-final" />
                          <Label htmlFor="passport-final">Passport</Label>
                        </div>
                        <div className="flex items-center space-x-2 p-3 border rounded-lg">
                          <RadioGroupItem value="voter" id="voter-final" />
                          <Label htmlFor="voter-final">Voter ID</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="idProofNumber">ID Proof Number *</Label>
                      <Input
                        id="idProofNumber"
                        value={formData.idProofNumber}
                        onChange={(e) => updateFormData("idProofNumber", e.target.value)}
                        placeholder={
                          formData.idProofType === "aadhar" ? "XXXX XXXX XXXX" :
                          formData.idProofType === "passport" ? "Passport Number" :
                          "Voter ID Number"
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Upload ID Document *</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => idProofFileRef.current?.click()}
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          {formData.idProofDocument ? "Change" : "Upload"}
                        </Button>
                        <input
                          ref={idProofFileRef}
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileUpload("idProofDocument", e.target.files?.[0] || null)}
                          className="hidden"
                        />
                        {formData.idProofDocument && (
                          <p className="text-sm text-green-600 mt-2">
                            <CheckCircle className="w-4 h-4 inline mr-1" />
                            {formData.idProofDocument.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Background Check</h3>
                  
                  <Card className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="cleanRecord-final"
                          checked={formData.hasCleanRecord}
                          onCheckedChange={(checked) => updateFormData("hasCleanRecord", checked)}
                        />
                        <Label htmlFor="cleanRecord-final" className="text-sm">
                          I declare that I have no criminal record and have not been involved in any major traffic violations in the past 3 years.
                        </Label>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="backgroundConsent-final"
                          checked={formData.backgroundCheckConsent}
                          onCheckedChange={(checked) => updateFormData("backgroundCheckConsent", checked)}
                        />
                        <Label htmlFor="backgroundConsent-final" className="text-sm">
                          I consent to URide conducting a comprehensive background check including criminal record and driving history verification.
                        </Label>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t">
                <h3 className="text-lg font-semibold">Terms and Conditions</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="acceptTerms"
                      checked={formData.acceptTerms}
                      onCheckedChange={(checked) => updateFormData("acceptTerms", checked)}
                    />
                    <Label htmlFor="acceptTerms" className="text-sm">
                      I accept the{" "}
                      <a href="#" className="text-yellow-600 hover:underline">
                        Terms and Conditions
                      </a>{" "}
                      for URide drivers
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="acceptPrivacy"
                      checked={formData.acceptPrivacyPolicy}
                      onCheckedChange={(checked) => updateFormData("acceptPrivacyPolicy", checked)}
                    />
                    <Label htmlFor="acceptPrivacy" className="text-sm">
                      I accept the{" "}
                      <a href="#" className="text-yellow-600 hover:underline">
                        Privacy Policy
                      </a>{" "}
                      and consent to data processing
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          );
        } else {
          return (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900">Terms and Conditions</h2>
                <p className="text-gray-600">Review and accept our terms to complete your application</p>
              </div>

              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Fleet Driver Agreement</h3>
                  <div className="space-y-4 text-sm text-gray-600">
                    <p>By joining URide as a fleet driver, you agree to:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Maintain professional conduct and provide excellent customer service</li>
                      <li>Follow all traffic rules and company safety protocols</li>
                      <li>Complete mandatory training programs within specified timeframes</li>
                      <li>Maintain assigned vehicles in good condition</li>
                      <li>Work according to assigned schedules and routes</li>
                      <li>Salary will be calculated based on kilometers driven and performance metrics</li>
                    </ul>
                  </div>
                </Card>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="acceptTerms-fleet"
                      checked={formData.acceptTerms}
                      onCheckedChange={(checked) => updateFormData("acceptTerms", checked)}
                    />
                    <Label htmlFor="acceptTerms-fleet" className="text-sm">
                      I accept the{" "}
                      <a href="#" className="text-yellow-600 hover:underline">
                        Terms and Conditions
                      </a>{" "}
                      for URide fleet drivers
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="acceptPrivacy-fleet"
                      checked={formData.acceptPrivacyPolicy}
                      onCheckedChange={(checked) => updateFormData("acceptPrivacyPolicy", checked)}
                    />
                    <Label htmlFor="acceptPrivacy-fleet" className="text-sm">
                      I accept the{" "}
                      <a href="#" className="text-yellow-600 hover:underline">
                        Privacy Policy
                      </a>{" "}
                      and consent to data processing
                    </Label>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-800">Ready to Submit</h4>
                      <p className="text-sm text-green-700 mt-1">
                        Your application is complete and ready for submission. Our team will review your application and contact you within 24-48 hours.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
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
                  Driver Registration
                </div>
              </div>
            </Link>

            <div className="text-right">
              <div className="text-sm text-gray-600">Step {currentStep} of {totalSteps}</div>
              <div className="text-xs text-gray-500">
                {formData.hasVehicle === "yes" ? "Own Vehicle" : formData.hasVehicle === "no" ? "Fleet Driver" : "Registration"}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8">
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </Button>

              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Submit Application</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Need help? Contact our support team at{" "}
            <a href="tel:+911234567890" className="text-yellow-600 hover:underline">
              +91 12345 67890
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
