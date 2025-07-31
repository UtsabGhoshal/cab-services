# Google Maps API Troubleshooting

## BillingNotEnabledMapError

If you encounter the error `BillingNotEnabledMapError`, this means your Google Maps API key requires billing to be enabled in the Google Cloud Console.

### Solution Options:

#### Option 1: Enable Billing (Recommended for Production)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to "Billing" in the left sidebar
4. Set up a billing account
5. Enable billing for your project
6. Make sure the following APIs are enabled:
   - Maps JavaScript API
   - Places API
   - Geocoding API

#### Option 2: Use Fallback Map (Already Implemented)

The application automatically falls back to a free alternative when Google Maps fails:

- **Search-based location selection** using OpenStreetMap's Nominatim service
- **Current location detection** using browser geolocation
- **Quick location shortcuts** for common places
- **Manual coordinate entry** support

### How the Fallback Works:

1. **Automatic Detection**: The app detects Google Maps billing errors
2. **Graceful Fallback**: Switches to SimpleFallbackMap component
3. **Full Functionality**: Users can still select pickup/destination locations
4. **Distance Calculation**: Uses Haversine formula for fare estimation

### Features Available in Fallback Mode:

✅ **Location Search**: Search for places across India  
✅ **Current Location**: Use GPS to set pickup/destination  
✅ **Quick Shortcuts**: Predefined locations (Connaught Place, IGI Airport, etc.)  
✅ **Fare Calculation**: Accurate distance-based pricing  
✅ **Ride Booking**: Complete booking functionality maintained

### User Experience:

- Users see a clear notification about the map service status
- All essential functionality remains available
- No loss of core features
- Transparent about using alternative map service

### For Developers:

The fallback system is implemented in:

- `client/components/SimpleFallbackMap.tsx` - Fallback map component
- `client/pages/Booking.tsx` - Main booking page with conditional rendering
- Error detection and graceful handling built-in

### Testing the Fallback:

To test the fallback manually, you can:

1. Disable your internet connection temporarily
2. Use an invalid Google Maps API key
3. Block the Google Maps script in browser dev tools

This ensures your users always have a working ride booking experience, regardless of Google Maps API status.
