import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Car, Clock, DollarSign, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MapsConfigResponse, BookingLocation, PricingInfo } from "@shared/maps";

interface GoogleMapsProps {
  onLocationSelect: (location: BookingLocation, isPickup: boolean) => void;
  pickup?: BookingLocation;
  destination?: BookingLocation;
  locationMode: 'pickup' | 'destination';
}

const GoogleMapsComponent = ({ onLocationSelect, pickup, destination }: GoogleMapsProps) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    if (window.google && !map) {
      const mapElement = document.getElementById('google-map');
      if (mapElement) {
        const newMap = new google.maps.Map(mapElement, {
          center: { lat: 22.5726, lng: 88.3639 }, // Kolkata, India default
          zoom: 13,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        const newDirectionsService = new google.maps.DirectionsService();
        const newDirectionsRenderer = new google.maps.DirectionsRenderer({
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: '#f59e0b',
            strokeWeight: 4
          }
        });

        newDirectionsRenderer.setMap(newMap);
        setMap(newMap);
        setDirectionsService(newDirectionsService);
        setDirectionsRenderer(newDirectionsRenderer);

        // Add click listener for location selection
        newMap.addListener('click', (event: google.maps.MapMouseEvent) => {
          if (event.latLng) {
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: event.latLng }, (results, status) => {
              if (status === 'OK' && results && results[0]) {
                const location: BookingLocation = {
                  address: results[0].formatted_address,
                  lat: event.latLng!.lat(),
                  lng: event.latLng!.lng()
                };
                // Use the current location mode (pickup or destination)
                const isSettingPickup = locationMode === 'pickup';
                onLocationSelect(location, isSettingPickup);
              }
            });
          }
        });
      }
    }
  }, [map, onLocationSelect, pickup]);

  useEffect(() => {
    if (map && pickup && destination && directionsService && directionsRenderer) {
      // Clear existing markers
      markers.forEach(marker => marker.setMap(null));

      // Create new markers
      const pickupMarker = new google.maps.Marker({
        position: { lat: pickup.lat, lng: pickup.lng },
        map: map,
        title: 'Pickup Location',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="12" fill="#10b981" stroke="white" stroke-width="3"/>
              <circle cx="16" cy="16" r="4" fill="white"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(32, 32)
        }
      });

      const destinationMarker = new google.maps.Marker({
        position: { lat: destination.lat, lng: destination.lng },
        map: map,
        title: 'Destination',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="12" fill="#ef4444" stroke="white" stroke-width="3"/>
              <circle cx="16" cy="16" r="4" fill="white"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(32, 32)
        }
      });

      setMarkers([pickupMarker, destinationMarker]);

      // Draw route
      directionsService.route({
        origin: { lat: pickup.lat, lng: pickup.lng },
        destination: { lat: destination.lat, lng: destination.lng },
        travelMode: google.maps.TravelMode.DRIVING
      }, (result, status) => {
        if (status === 'OK' && result) {
          directionsRenderer.setDirections(result);
        }
      });
    }
  }, [map, pickup, destination, directionsService, directionsRenderer, markers]);

  return (
    <div 
      id="google-map" 
      style={{ width: '100%', height: '400px', borderRadius: '8px' }}
      className="border border-gray-200"
    />
  );
};

const CarTypeSelector = ({ selectedType, onTypeChange }: { selectedType: string, onTypeChange: (type: string) => void }) => {
  const carTypes = [
    { id: 'economy', name: 'Economy', price: '₹30 base', capacity: '4 passengers', description: 'Comfortable and affordable rides' },
    { id: 'premium', name: 'Premium', price: '₹45 base', capacity: '4 passengers', description: 'AC vehicles with extra comfort' },
    { id: 'suv', name: 'SUV', price: '₹60 base', capacity: '6 passengers', description: 'Spacious for groups or luggage' },
    { id: 'luxury', name: 'Luxury', price: '₹100 base', capacity: '4 passengers', description: 'Premium cars with top service' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {carTypes.map((car) => (
        <Card 
          key={car.id}
          className={`cursor-pointer transition-all ${selectedType === car.id ? 'ring-2 ring-primary border-primary' : 'hover:border-gray-300'}`}
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
  const [loading, setLoading] = useState(true);
  const [pickup, setPickup] = useState<BookingLocation | undefined>();
  const [destination, setDestination] = useState<BookingLocation | undefined>();
  const [carType, setCarType] = useState<string>('economy');
  const [purpose, setPurpose] = useState<'general' | 'emergency'>('general');
  const [pricing, setPricing] = useState<PricingInfo | null>(null);
  const [locationMode, setLocationMode] = useState<'pickup' | 'destination'>('pickup');

  const loadGoogleMaps = useCallback(async () => {
    try {
      const response = await fetch('/api/maps/config');
      const data: MapsConfigResponse = await response.json();
      
      if (!data.success) {
        throw new Error('Failed to get maps configuration');
      }

      // Load Go Maps Pro script
      if (!window.google) {
        const script = document.createElement('script');
        script.src = `https://maps.gomaps.pro/maps/api/js?key=${data.apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => setLoading(false);
        script.onerror = () => {
          toast({
            title: "Error",
            description: "Failed to load Go Maps Pro",
            variant: "destructive"
          });
          setLoading(false);
        };
        document.head.appendChild(script);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading Go Maps Pro:', error);
      toast({
        title: "Error",
        description: "Failed to initialize Go Maps Pro",
        variant: "destructive"
      });
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadGoogleMaps();
  }, [loadGoogleMaps]);

  const calculatePricing = useCallback(() => {
    if (!pickup || !destination) return;

    // Simple distance calculation (in a real app, you'd use the Go Maps Pro Distance Matrix API)
    const distance = Math.sqrt(
      Math.pow(pickup.lat - destination.lat, 2) + Math.pow(pickup.lng - destination.lng, 2)
    ) * 111; // rough conversion to km

    // Indian fare structure
    const minimumFare = 30; // ₹30 for first 2 km
    const rateAfter2km = 15; // ₹15 per additional km

    // Base rates for different car types (multiplier)
    const carMultiplier = carType === 'economy' ? 1 : carType === 'premium' ? 1.5 : carType === 'suv' ? 2 : 3.3;

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
    const emergencyMultiplier = purpose === 'emergency' ? 1.5 : 1;

    // Calculate final price with all surcharges
    const finalPrice = basePrice * nightMultiplier * emergencyMultiplier;

    setPricing({
      basePrice: Math.round(basePrice),
      emergencyMultiplier,
      finalPrice: Math.round(finalPrice),
      estimatedTime: `${Math.ceil(distance * 3)} min`, // Adjusted for Indian traffic
      distance: `${distance.toFixed(1)} km`,
      nightSurcharge: isNightTime,
      nightMultiplier
    });
  }, [pickup, destination, carType, purpose]);

  useEffect(() => {
    calculatePricing();
  }, [calculatePricing]);

  const handleLocationSelect = (location: BookingLocation, isPickup: boolean) => {
    if (isPickup) {
      setPickup(location);
      toast({
        title: "Pickup Location Set",
        description: location.address,
      });
    } else {
      setDestination(location);
      toast({
        title: "Destination Set",
        description: location.address,
      });
    }
  };

  const handleBooking = () => {
    if (!pickup || !destination) {
      toast({
        title: "Missing Information",
        description: "Please select both pickup and destination locations",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Booking Confirmed!",
      description: `Your ${carType} ride has been booked for ${purpose} purposes.`,
    });

    // In a real app, you'd send this to your backend
    console.log({
      pickup,
      destination,
      carType,
      purpose,
      pricing
    });
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
            onClick={() => navigate('/dashboard')}
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
                <p className="text-sm text-gray-600">Click on the map to set pickup and destination</p>
              </CardHeader>
              <CardContent>
                <GoogleMapsComponent 
                  onLocationSelect={handleLocationSelect}
                  pickup={pickup}
                  destination={destination}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="pickup">Pickup Location</Label>
                    <Input 
                      id="pickup"
                      value={pickup?.address || ''}
                      placeholder="Click on map to set pickup"
                      readOnly
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="destination">Destination</Label>
                    <Input 
                      id="destination"
                      value={destination?.address || ''}
                      placeholder="Click on map to set destination"
                      readOnly
                      className="mt-1"
                    />
                  </div>
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
                    <span className="font-medium">25% extra (10 PM - 5 AM)</span>
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
                <CarTypeSelector selectedType={carType} onTypeChange={setCarType} />
              </CardContent>
            </Card>

            {/* Purpose Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Trip Purpose</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={purpose} onValueChange={(value: 'general' | 'emergency') => setPurpose(value)}>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="general" id="general" />
                    <Label htmlFor="general" className="flex-1 cursor-pointer">
                      <div>
                        <p className="font-medium">General Purpose</p>
                        <p className="text-sm text-gray-600">Standard booking with regular pricing</p>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="emergency" id="emergency" />
                    <Label htmlFor="emergency" className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            Emergency
                          </p>
                          <p className="text-sm text-gray-600">Priority booking with 50% surcharge</p>
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
                    {purpose === 'emergency' && (
                      <div className="flex justify-between text-red-600">
                        <span>Emergency Surcharge (50%):</span>
                        <span>+₹{Math.round(pricing.basePrice * (pricing.nightMultiplier || 1) * 0.5)}</span>
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
              disabled={!pickup || !destination}
            >
              Confirm Booking
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
