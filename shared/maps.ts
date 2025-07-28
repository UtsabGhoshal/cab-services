export interface MapsConfigResponse {
  apiKey: string;
  success: boolean;
}

export interface BookingLocation {
  address: string;
  lat: number;
  lng: number;
}

export interface BookingRequest {
  pickup: BookingLocation;
  destination: BookingLocation;
  carType: string;
  purpose: 'general' | 'emergency';
  userId: string;
}

export interface PricingInfo {
  basePrice: number;
  emergencyMultiplier: number;
  finalPrice: number;
  estimatedTime: string;
  distance: string;
}
