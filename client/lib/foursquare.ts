// Foursquare Places API configuration and service

const FOURSQUARE_API_KEY = 'HQ0UKUCCE50REY2FOJ0OSPYN1CIPSXKRQZD00IHNF4K3DWFU';
const FOURSQUARE_BASE_URL = 'https://api.foursquare.com/v3/places';

export interface FoursquarePlace {
  fsq_id: string;
  name: string;
  categories: Array<{
    id: number;
    name: string;
    short_name: string;
    plural_name: string;
    icon: {
      prefix: string;
      suffix: string;
    };
  }>;
  chains?: Array<{
    id: string;
    name: string;
  }>;
  location: {
    address?: string;
    address_extended?: string;
    census_block?: string;
    country: string;
    cross_street?: string;
    dma?: string;
    formatted_address: string;
    locality?: string;
    neighborhood?: string[];
    po_box?: string;
    post_town?: string;
    postcode?: string;
    region?: string;
  };
  geocodes: {
    main: {
      latitude: number;
      longitude: number;
    };
    roof?: {
      latitude: number;
      longitude: number;
    };
  };
  link?: string;
  related_places?: object;
  timezone?: string;
  distance?: number;
}

export interface FoursquareSearchParams {
  ll?: string; // latitude,longitude
  near?: string; // location name
  radius?: number; // in meters, max 100000
  categories?: string; // comma-separated category IDs
  query?: string; // search term
  limit?: number; // max 50
  sort?: 'DISTANCE' | 'POPULARITY' | 'RATING' | 'RELEVANCE';
}

export interface FoursquareSearchResponse {
  results: FoursquarePlace[];
  context: {
    geo_bounds: {
      circle: {
        center: {
          latitude: number;
          longitude: number;
        };
        radius: number;
      };
    };
  };
}

class FoursquareService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = FOURSQUARE_API_KEY;
    this.baseUrl = FOURSQUARE_BASE_URL;
  }

  async searchPlaces(params: FoursquareSearchParams): Promise<FoursquareSearchResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.ll) searchParams.append('ll', params.ll);
    if (params.near) searchParams.append('near', params.near);
    if (params.radius) searchParams.append('radius', params.radius.toString());
    if (params.categories) searchParams.append('categories', params.categories);
    if (params.query) searchParams.append('query', params.query);
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.sort) searchParams.append('sort', params.sort);

    const response = await fetch(`${this.baseUrl}/search?${searchParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': this.apiKey,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Foursquare API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getNearbyPlaces(
    latitude: number, 
    longitude: number, 
    radius: number = 5000,
    limit: number = 20,
    query?: string
  ): Promise<FoursquarePlace[]> {
    const params: FoursquareSearchParams = {
      ll: `${latitude},${longitude}`,
      radius,
      limit,
      sort: 'DISTANCE',
    };

    if (query) {
      params.query = query;
    }

    const response = await this.searchPlaces(params);
    return response.results;
  }

  // Calculate distance between two points using Haversine formula
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Format distance for display
  formatDistance(distanceInKm: number): string {
    if (distanceInKm < 1) {
      return `${Math.round(distanceInKm * 1000)}m`;
    }
    return `${distanceInKm.toFixed(1)}km`;
  }

  // Get category icon URL
  getCategoryIcon(category: FoursquarePlace['categories'][0], size: number = 64): string {
    if (category?.icon) {
      return `${category.icon.prefix}${size}${category.icon.suffix}`;
    }
    return '';
  }
}

export const foursquareService = new FoursquareService();
