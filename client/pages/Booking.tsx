import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  MapPin,
  Car,
  Clock,
  DollarSign,
  AlertTriangle,
  AlertCircle,
  Map,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { MapsConfigResponse, BookingLocation, PricingInfo } from "@shared/maps";
import { FallbackMap } from "@/components/FallbackMap";

interface GoogleMapsProps {
  onLocationSelect: (location: BookingLocation, isPickup: boolean) => void;
  pickup?: BookingLocation;
  destination?: BookingLocation;
  locationMode: "pickup" | "destination";
}

const GoogleMapsComponent = ({
  onLocationSelect,
  pickup,
  destination,
  locationMode,
}: GoogleMapsProps) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [directionsService, setDirectionsService] =
    useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] =
    useState<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    if (window.google && !map) {
      const mapElement = document.getElementById("google-map");
      if (mapElement) {
        const newMap = new google.maps.Map(mapElement, {
          center: { lat: 22.5726, lng: 88.3639 }, // Kolkata, India default
          zoom: 13,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
        });

        const newDirectionsService = new google.maps.DirectionsService();
        const newDirectionsRenderer = new google.maps.DirectionsRenderer({
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: "#f59e0b",
            strokeWeight: 4,
          },
        });

        newDirectionsRenderer.setMap(newMap);
        setMap(newMap);
        setDirectionsService(newDirectionsService);
        setDirectionsRenderer(newDirectionsRenderer);

        // Add click listener for location selection
        newMap.addListener("click", (event: google.maps.MapMouseEvent) => {
          if (event.latLng) {
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: event.latLng }, (results, status) => {
              if (status === "OK" && results && results[0]) {
                const location: BookingLocation = {
                  address: results[0].formatted_address,
                  lat: event.latLng!.lat(),
                  lng: event.latLng!.lng(),
                };
                // Use the current location mode (pickup or destination)
                const isSettingPickup = locationMode === "pickup";
                onLocationSelect(location, isSettingPickup);
              }
            });
          }
        });
      }
    }
  }, [map, onLocationSelect, pickup, locationMode]);

  useEffect(() => {
    if (
      map &&
      pickup &&
      destination &&
      directionsService &&
      directionsRenderer
    ) {
      // Clear existing markers
      markers.forEach((marker) => marker.setMap(null));

      // Create new markers
      const pickupMarker = new google.maps.Marker({
        position: { lat: pickup.lat, lng: pickup.lng },
        map: map,
        title: "Pickup Location",
        icon: {
          url:
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="12" fill="#10b981" stroke="white" stroke-width="3"/>
              <circle cx="16" cy="16" r="4" fill="white"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(32, 32),
        },
      });

      const destinationMarker = new google.maps.Marker({
        position: { lat: destination.lat, lng: destination.lng },
        map: map,
        title: "Destination",
        icon: {
          url:
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="12" fill="#ef4444" stroke="white" stroke-width="3"/>
              <circle cx="16" cy="16" r="4" fill="white"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(32, 32),
        },
      });

      setMarkers([pickupMarker, destinationMarker]);

      // Draw route
      directionsService.route(
        {
          origin: { lat: pickup.lat, lng: pickup.lng },
          destination: { lat: destination.lat, lng: destination.lng },
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === "OK" && result) {
            directionsRenderer.setDirections(result);
          }
        },
      );
    }
  }, [map, pickup, destination, directionsService, directionsRenderer]);

  return (
    <div
      id="google-map"
      style={{ width: "100%", height: "400px", borderRadius: "8px" }}
      className="border border-gray-200"
    />
  );
};

const CarTypeSelector = ({
  selectedType,
  onTypeChange,
}: {
  selectedType: string;
  onTypeChange: (type: string) => void;
}) => {
  const carTypes = [
    {
      id: "economy",
      name: "Economy",
      price: "₹30 base",
      capacity: "4 passengers",
      description: "Comfortable and affordable rides",
    },
    {
      id: "premium",
      name: "Premium",
      price: "₹45 base",
      capacity: "4 passengers",
      description: "AC vehicles with extra comfort",
    },
    {
      id: "suv",
      name: "SUV",
      price: "���60 base",
      capacity: "6 passengers",
      description: "Spacious for groups or luggage",
    },
    {
      id: "luxury",
      name: "Luxury",
      price: "₹100 base",
      capacity: "4 passengers",
      description: "Premium cars with top service",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {carTypes.map((car) => (
        <Card
          key={car.id}
          className={`cursor-pointer transition-all ${selectedType === car.id ? "ring-2 ring-primary border-primary" : "hover:border-gray-300"}`}
          onClick={() => onTypeChange(car.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Car className="h-4 w-4" />
                {car.name}
              </h3>
              <Badge variant="secondary">{car.price}</Badge>
            </div>
            <p className="text-sm text-gray-600 mb-1">{car.capacity}</p>
            <p className="text-xs text-gray-500">{car.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default function Booking() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [pickup, setPickup] = useState<BookingLocation | undefined>();
  const [destination, setDestination] = useState<BookingLocation | undefined>();
  const [carType, setCarType] = useState<string>("economy");
  const [purpose, setPurpose] = useState<"general" | "emergency">("general");
  const [pricing, setPricing] = useState<PricingInfo | null>(null);
  const [locationMode, setLocationMode] = useState<"pickup" | "destination">(
    "pickup",
  );
  const [useFallbackMap, setUseFallbackMap] = useState(false);
  const [mapsError, setMapsError] = useState<string | null>(null);
  const [pickupAutocomplete, setPickupAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const [destinationAutocomplete, setDestinationAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const [pickupInputValue, setPickupInputValue] = useState("");
  const [destinationInputValue, setDestinationInputValue] = useState("");

  const initializeAutocomplete = useCallback(() => {
    if (!window.google) return;

    // Initialize pickup autocomplete
    const pickupInput = document.getElementById(
      "pickup-autocomplete",
    ) as HTMLInputElement;
    const destinationInput = document.getElementById(
      "destination-autocomplete",
    ) as HTMLInputElement;

    if (pickupInput && !pickupAutocomplete) {
      const pickupAuto = new google.maps.places.Autocomplete(pickupInput, {
        types: ["establishment", "geocode"],
        componentRestrictions: { country: "IN" }, // Restrict to India
      });

      pickupAuto.addListener("place_changed", () => {
        const place = pickupAuto.getPlace();
        if (place.geometry && place.geometry.location) {
          const location: BookingLocation = {
            address: place.formatted_address || place.name || "",
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };
          setPickup(location);
          setPickupInputValue(location.address);
          setLocationMode("destination");
          toast({
            title: "Pickup Location Set",
            description: location.address,
          });
        }
      });

      setPickupAutocomplete(pickupAuto);
    }

    if (destinationInput && !destinationAutocomplete) {
      const destAuto = new google.maps.places.Autocomplete(destinationInput, {
        types: ["establishment", "geocode"],
        componentRestrictions: { country: "IN" }, // Restrict to India
      });

      destAuto.addListener("place_changed", () => {
        const place = destAuto.getPlace();
        if (place.geometry && place.geometry.location) {
          const location: BookingLocation = {
            address: place.formatted_address || place.name || "",
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };
          setDestination(location);
          setDestinationInputValue(location.address);
          toast({
            title: "Destination Set",
            description: location.address,
          });
        }
      });

      setDestinationAutocomplete(destAuto);
    }
  }, [pickupAutocomplete, destinationAutocomplete, toast]);

  const loadGoogleMaps = useCallback(async () => {
    try {
      const response = await fetch("/api/maps/config");
      const data: MapsConfigResponse = await response.json();

      if (!data.success) {
        throw new Error("Failed to get maps configuration");
      }

      // Load Google Maps API script
      if (!window.google) {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          // Check for Google Maps API errors after loading
          if (window.google && window.google.maps) {
            // Listen for Google Maps API errors
            window.google.maps.event.addDomListener(window, 'gm_authFailure', () => {
              console.error('Google Maps API authentication failed');
              setMapsError('Google Maps API authentication failed. Using fallback map.');
              setUseFallbackMap(true);
              setLoading(false);
            });

            // Check for billing issues by attempting to create a simple map
            try {
              const testDiv = document.createElement('div');
              const testMap = new window.google.maps.Map(testDiv, {
                center: { lat: 0, lng: 0 },
                zoom: 1
              });
              // If we get here without error, Google Maps is working
              setLoading(false);
              setTimeout(initializeAutocomplete, 100);
            } catch (error: any) {
              console.error('Google Maps initialization error:', error);
              if (error.message && error.message.includes('BillingNotEnabledMapError')) {
                setMapsError('Google Maps billing not enabled. Using free fallback map.');
              } else {
                setMapsError('Google Maps not available. Using fallback map.');
              }
              setUseFallbackMap(true);
              setLoading(false);
            }
          } else {
            throw new Error('Google Maps API failed to load properly');
          }
        };
        script.onerror = () => {
          console.error("Failed to load Google Maps API script");
          setMapsError('Google Maps API unavailable. Using fallback map.');
          setUseFallbackMap(true);
          setLoading(false);
        };
        document.head.appendChild(script);

        // Add a timeout fallback
        setTimeout(() => {
          if (loading && !window.google) {
            console.warn('Google Maps loading timeout');
            setMapsError('Google Maps loading timeout. Using fallback map.');
            setUseFallbackMap(true);
            setLoading(false);
          }
        }, 10000);
      } else {
        setLoading(false);
        // Initialize autocomplete if Google Maps is already loaded
        setTimeout(initializeAutocomplete, 100);
      }
    } catch (error) {
      console.error("Error loading Google Maps API:", error);
      setMapsError('Failed to initialize maps. Using fallback map.');
      setUseFallbackMap(true);
      setLoading(false);
    }
  }, [toast, loading]);

  useEffect(() => {
    loadGoogleMaps();
  }, []); // Empty dependency array - only run on mount

  const calculatePricing = () => {
    if (!pickup || !destination) return;

    // If Google Maps is available and working, use it for accurate calculations
    if (window.google && !useFallbackMap) {
      try {
        const service = new google.maps.DistanceMatrixService();
        service.getDistanceMatrix(
          {
            origins: [{ lat: pickup.lat, lng: pickup.lng }],
            destinations: [{ lat: destination.lat, lng: destination.lng }],
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.METRIC,
          },
          (response, status) => {
            if (status === google.maps.DistanceMatrixStatus.OK && response) {
              const element = response.rows[0].elements[0];
              if (element.status === "OK") {
                const distanceValue = element.distance.value / 1000; // Convert to km
                const durationValue = element.duration.value / 60; // Convert to minutes
                calculateFareWithDistance(distanceValue, Math.ceil(durationValue));
                return;
              }
            }
            // If Google Maps fails, fallback to simple calculation
            fallbackDistanceCalculation();
          },
        );
      } catch (error) {
        console.error('Google Maps Distance Matrix error:', error);
        fallbackDistanceCalculation();
      }
    } else {
      // Use fallback distance calculation
      fallbackDistanceCalculation();
    }
  };

  const fallbackDistanceCalculation = () => {
    if (!pickup || !destination) return;

    // Haversine formula for distance calculation
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRadians(destination.lat - pickup.lat);
    const dLng = toRadians(destination.lng - pickup.lng);
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRadians(pickup.lat)) * Math.cos(toRadians(destination.lat)) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    // Estimate time based on average city speed (25 km/h)
    const estimatedMinutes = Math.ceil((distance / 25) * 60);

    calculateFareWithDistance(distance, estimatedMinutes);
  };

  const toRadians = (degrees: number) => {
    return degrees * (Math.PI / 180);
  };

  const calculateFareWithDistance = (
    distance: number,
    estimatedMinutes: number,
  ) => {
    // Indian fare structure
    const minimumFare = 30; // ₹30 for first 2 km
    const rateAfter2km = 15; // ₹15 per additional km

    // Base rates for different car types (multiplier)
    const carMultiplier =
      carType === "economy"
        ? 1
        : carType === "premium"
          ? 1.5
          : carType === "suv"
            ? 2
            : 3.3;

    // Calculate fare based on Indian slab system
    let basePrice;
    if (distance <= 2) {
      basePrice = minimumFare * carMultiplier;
    } else {
      basePrice = (minimumFare + (distance - 2) * rateAfter2km) * carMultiplier;
    }

    // Check if it's night time (10 PM to 5 AM) - 25% surcharge
    const currentHour = new Date().getHours();
    const isNightTime = currentHour >= 22 || currentHour < 5;
    const nightMultiplier = isNightTime ? 1.25 : 1;

    // Emergency multiplier (50% extra)
    const emergencyMultiplier = purpose === "emergency" ? 1.5 : 1;

    // Calculate final price with all surcharges
    const finalPrice = basePrice * nightMultiplier * emergencyMultiplier;

    setPricing({
      basePrice: Math.round(basePrice),
      emergencyMultiplier,
      finalPrice: Math.round(finalPrice),
      estimatedTime: `${estimatedMinutes} min`,
      distance: `${distance.toFixed(1)} km`,
      nightSurcharge: isNightTime,
      nightMultiplier,
    });
  };

  // Calculate pricing when locations, car type, or purpose changes
  useEffect(() => {
    if (pickup && destination && window.google) {
      calculatePricing();
    }
  }, [
    pickup?.lat,
    pickup?.lng,
    destination?.lat,
    destination?.lng,
    carType,
    purpose,
  ]);

  // Input values are managed directly by user input and location selection handlers
  // No useEffect needed to prevent infinite loops

  const handleLocationSelect = (
    location: BookingLocation,
    isPickup: boolean,
  ) => {
    if (isPickup) {
      setPickup(location);
      setPickupInputValue(location.address);
      setLocationMode("destination"); // Auto-switch to destination after pickup is set
      toast({
        title: "Pickup Location Set",
        description: location.address,
      });
    } else {
      setDestination(location);
      setDestinationInputValue(location.address);
      toast({
        title: "Destination Set",
        description: location.address,
      });
    }
  };

  const handleBooking = async () => {
    if (!pickup || !destination) {
      toast({
        title: "Missing Information",
        description: "Please select both pickup and destination locations",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to book a ride",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!pricing) {
      toast({
        title: "Pricing Error",
        description: "Unable to calculate fare. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setBookingLoading(true);

    try {
      const response = await fetch("/api/rides", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          pickup,
          destination,
          carType,
          purpose,
          pricing,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Booking Confirmed! 🎉",
          description: `Your ${carType} ride from ${pickup.address} to ${destination.address} has been booked successfully.`,
        });

        // Navigate back to dashboard after successful booking
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        throw new Error(data.message || "Failed to create booking");
      }
    } catch (error: any) {
      console.error("Booking error:", error);
      toast({
        title: "Booking Failed",
        description:
          error.message || "Unable to complete booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading Go Maps Pro...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Book Your Ride</h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Map and Location */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Select Locations
                </CardTitle>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Currently setting:{" "}
                    <span className="font-medium text-blue-600">
                      {locationMode === "pickup" ? "Pickup" : "Destination"}
                    </span>
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant={
                        locationMode === "pickup" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setLocationMode("pickup")}
                    >
                      Set Pickup
                    </Button>
                    <Button
                      variant={
                        locationMode === "destination" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setLocationMode("destination")}
                    >
                      Set Destination
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Maps Error Warning */}
                {mapsError && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-amber-800">
                          Map Service Notice
                        </p>
                        <p className="text-xs text-amber-700 mt-1">
                          {mapsError} Location selection is still fully functional.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Conditional Map Rendering */}
                {useFallbackMap ? (
                  <FallbackMap
                    onLocationSelect={handleLocationSelect}
                    pickup={pickup}
                    destination={destination}
                    locationMode={locationMode}
                  />
                ) : (
                  <GoogleMapsComponent
                    onLocationSelect={handleLocationSelect}
                    pickup={pickup}
                    destination={destination}
                    locationMode={locationMode}
                  />
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="pickup-autocomplete">Pickup Location</Label>
                    <Input
                      id="pickup-autocomplete"
                      value={pickupInputValue}
                      onChange={(e) => {
                        setPickupInputValue(e.target.value);
                        if (e.target.value === "") {
                          setPickup(undefined);
                        }
                      }}
                      placeholder="Type or click map to set pickup"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="destination-autocomplete">
                      Destination
                    </Label>
                    <Input
                      id="destination-autocomplete"
                      value={destinationInputValue}
                      onChange={(e) => {
                        setDestinationInputValue(e.target.value);
                        if (e.target.value === "") {
                          setDestination(undefined);
                        }
                      }}
                      placeholder="Type or click map to set destination"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    💡 <strong>Tip:</strong> You can either type in the search
                    boxes above or click directly on the map to set locations.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Car Selection and Booking */}
          <div className="space-y-6">
            {/* Fare Structure */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Fare Structure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Minimum Fare</span>
                    <span className="font-medium">₹30 for first 2 km</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rate After 2 km</span>
                    <span className="font-medium">₹15 per additional km</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Waiting Charges</span>
                    <span className="font-medium">₹3 per 2 minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Night Surcharge</span>
                    <span className="font-medium">
                      25% extra (10 PM - 5 AM)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Emergency Booking</span>
                    <span className="font-medium text-red-600">50% extra</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Car Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Choose Your Vehicle</CardTitle>
              </CardHeader>
              <CardContent>
                <CarTypeSelector
                  selectedType={carType}
                  onTypeChange={setCarType}
                />
              </CardContent>
            </Card>

            {/* Purpose Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Trip Purpose</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={purpose}
                  onValueChange={(value: "general" | "emergency") =>
                    setPurpose(value)
                  }
                >
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="general" id="general" />
                    <Label htmlFor="general" className="flex-1 cursor-pointer">
                      <div>
                        <p className="font-medium">General Purpose</p>
                        <p className="text-sm text-gray-600">
                          Standard booking with regular pricing
                        </p>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="emergency" id="emergency" />
                    <Label
                      htmlFor="emergency"
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            Emergency
                          </p>
                          <p className="text-sm text-gray-600">
                            Priority booking with 50% surcharge
                          </p>
                        </div>
                        <Badge variant="destructive">+50%</Badge>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Pricing Summary */}
            {pricing && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Trip Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Distance:</span>
                      <span>{pricing.distance}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated Time:</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {pricing.estimatedTime}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Base Fare:</span>
                      <span>₹{pricing.basePrice}</span>
                    </div>
                    {pricing.nightSurcharge && (
                      <div className="flex justify-between text-blue-600">
                        <span>Night Surcharge (25%):</span>
                        <span>+₹{Math.round(pricing.basePrice * 0.25)}</span>
                      </div>
                    )}
                    {purpose === "emergency" && (
                      <div className="flex justify-between text-red-600">
                        <span>Emergency Surcharge (50%):</span>
                        <span>
                          +₹
                          {Math.round(
                            pricing.basePrice *
                              (pricing.nightMultiplier || 1) *
                              0.5,
                          )}
                        </span>
                      </div>
                    )}
                    <hr />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>₹{pricing.finalPrice}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Book Now Button */}
            <Button
              className="w-full h-12 text-lg"
              onClick={handleBooking}
              disabled={!pickup || !destination || bookingLoading}
            >
              {bookingLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Booking...
                </>
              ) : (
                "Confirm Booking"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
