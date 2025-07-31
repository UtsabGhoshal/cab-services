import React, { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserAvatar from "@/components/UserAvatar";
import SimpleMap from "@/components/SimpleMap";
import { PlacesList } from "@/components/PlaceCard";
import { usePlaces, usePopularCategories } from "@/hooks/usePlaces";
import { FoursquarePlace } from "@/lib/foursquare";
import {
  Car,
  MapPin,
  Search,
  Filter,
  RefreshCw,
  Navigation,
  List,
  Map as MapIcon,
  Locate,
  Star,
  Clock,
  AlertCircle,
} from "lucide-react";

export default function Places() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("map");
  const [selectedPlace, setSelectedPlace] = useState<FoursquarePlace | null>(
    null,
  );

  const {
    places,
    loading,
    error,
    userLocation,
    locationPermission,
    searchPlaces,
    refetch,
    fetchPlaces,
  } = usePlaces({
    radius: 3000,
    limit: 30,
    autoFetch: true,
  });

  const popularCategories = usePopularCategories();

  const handleSearch = useCallback(async () => {
    if (searchQuery.trim()) {
      await searchPlaces(searchQuery.trim());
    } else {
      await refetch();
    }
  }, [searchQuery, searchPlaces, refetch]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleCategorySearch = async (categoryName: string) => {
    setSearchQuery(categoryName);
    await searchPlaces(categoryName);
  };

  const handlePlaceSelect = (place: FoursquarePlace) => {
    setSelectedPlace(place);
    // You could navigate to booking page with this place as destination
    console.log("Selected place:", place);
  };

  const handleGetDirections = (place: FoursquarePlace) => {
    if (userLocation) {
      const directionsUrl = `https://www.google.com/maps/dir/${userLocation.latitude},${userLocation.longitude}/${place.geocodes.main.latitude},${place.geocodes.main.longitude}`;
      window.open(directionsUrl, "_blank");
    }
  };

  const getCurrentLocation = async () => {
    if (userLocation) {
      await fetchPlaces(userLocation);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 lg:px-8">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  URide
                </span>
                <div className="text-xs text-slate-500 font-medium">
                  Explore Places
                </div>
              </div>
            </Link>
            <UserAvatar />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 lg:px-8">
        {/* Page Title and Controls */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-2">
                Explore{" "}
                <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  Nearby Places
                </span>
              </h1>
              <p className="text-slate-600 text-lg">
                Discover interesting places around you with Foursquare
                integration
              </p>
            </div>
            <Button
              onClick={getCurrentLocation}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Locate className="w-4 h-4 mr-2" />
              Update Location
            </Button>
          </div>

          {/* Location Status */}
          <div className="mb-6">
            {locationPermission === false && (
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 text-amber-700">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm">
                      Location access denied. Using default location (New
                      Delhi). Please enable location services for better
                      results.
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {userLocation && (
              <div className="flex items-center space-x-2 text-green-600 text-sm">
                <MapPin className="w-4 h-4" />
                <span>
                  Current location: {userLocation.latitude.toFixed(4)},{" "}
                  {userLocation.longitude.toFixed(4)}
                </span>
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="flex space-x-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for restaurants, cafes, shops..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 h-12 text-lg border-gray-300 focus:border-yellow-500 focus:ring-yellow-500"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={loading}
              className="bg-yellow-500 hover:bg-yellow-600 text-white h-12 px-8"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>

          {/* Popular Categories */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Popular Categories
            </h3>
            <div className="flex flex-wrap gap-2">
              {popularCategories.map((category) => (
                <Badge
                  key={category.id}
                  variant="outline"
                  className="cursor-pointer hover:bg-yellow-50 hover:border-yellow-300 transition-colors px-3 py-2"
                  onClick={() => handleCategorySearch(category.name)}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-2">
            <TabsTrigger value="map" className="flex items-center space-x-2">
              <MapIcon className="w-4 h-4" />
              <span>Map View</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center space-x-2">
              <List className="w-4 h-4" />
              <span>List View</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Map */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Places Map</span>
                      <Badge variant="secondary">
                        {places.length} places found
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {userLocation ? (
                      <SimpleMap
                        center={userLocation}
                        places={places}
                        userLocation={userLocation}
                        height="500px"
                        onPlaceClick={setSelectedPlace}
                      />
                    ) : (
                      <div className="h-[500px] flex items-center justify-center bg-gray-100 rounded-lg">
                        <div className="text-center">
                          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">Loading map...</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Selected Place Details or Places List */}
              <div className="space-y-4">
                {selectedPlace ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Selected Place</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedPlace(null)}
                        >
                          ✕
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {selectedPlace.name}
                        </h3>
                        {selectedPlace.categories[0] && (
                          <Badge variant="secondary" className="mt-2">
                            {selectedPlace.categories[0].name}
                          </Badge>
                        )}
                      </div>

                      {selectedPlace.location.formatted_address && (
                        <p className="text-gray-600">
                          {selectedPlace.location.formatted_address}
                        </p>
                      )}

                      <div className="space-y-2">
                        <Button
                          onClick={() => handlePlaceSelect(selectedPlace)}
                          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                        >
                          Select as Destination
                        </Button>
                        <Button
                          onClick={() => handleGetDirections(selectedPlace)}
                          variant="outline"
                          className="w-full"
                        >
                          <Navigation className="w-4 h-4 mr-2" />
                          Get Directions
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <PlacesList
                    places={places.slice(0, 5)}
                    loading={loading}
                    error={error}
                    onPlaceSelect={handlePlaceSelect}
                    onGetDirections={handleGetDirections}
                    compact={true}
                    maxHeight="500px"
                  />
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="list" className="space-y-6">
            <PlacesList
              places={places}
              loading={loading}
              error={error}
              onPlaceSelect={handlePlaceSelect}
              onGetDirections={handleGetDirections}
              compact={false}
            />
          </TabsContent>
        </Tabs>

        {/* Stats */}
        {places.length > 0 && (
          <Card className="mt-8">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {places.length}
                  </div>
                  <div className="text-sm text-gray-600">Places Found</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {
                      new Set(
                        places.flatMap((p) => p.categories.map((c) => c.name)),
                      ).size
                    }
                  </div>
                  <div className="text-sm text-gray-600">Categories</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {
                      places.filter((p) => p.distance && p.distance < 1000)
                        .length
                    }
                  </div>
                  <div className="text-sm text-gray-600">Within 1km</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {
                      places.filter((p) => p.chains && p.chains.length > 0)
                        .length
                    }
                  </div>
                  <div className="text-sm text-gray-600">Chain Stores</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
