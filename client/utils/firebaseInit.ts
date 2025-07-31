import { doc, setDoc, collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';

// Initialize Firebase collections with sample data if they don't exist
export const initializeFirebaseCollections = async (driverId: string) => {
  try {
    // Initialize driver document
    const driverRef = doc(db, 'drivers', driverId);
    await setDoc(driverRef, {
      id: driverId,
      isOnline: false,
      location: null,
      lastUpdate: Timestamp.now(),
      totalEarnings: 0,
      totalRides: 0,
      createdAt: Timestamp.now(),
    }, { merge: true }); // merge: true prevents overwriting existing data

    console.log('Firebase collections initialized successfully');
  } catch (error) {
    console.warn('Failed to initialize Firebase collections:', error);
    // Don't throw error as this is optional initialization
  }
};

// Create sample ride request for testing (development only)
export const createSampleRideRequest = async () => {
  try {
    const rideRequestsRef = collection(db, 'rideRequests');
    await addDoc(rideRequestsRef, {
      passengerName: "Test Passenger",
      passengerPhone: "+91 98765 43210",
      pickup: {
        address: "Connaught Place, New Delhi",
        lat: 28.6139,
        lng: 77.209,
      },
      destination: {
        address: "India Gate, New Delhi",
        lat: 28.6129,
        lng: 77.2295,
      },
      estimatedEarnings: 250,
      distance: 5.2,
      duration: 18,
      timestamp: Timestamp.now(),
      rideType: "economy",
      status: "pending",
      createdAt: Timestamp.now(),
    });
    
    console.log('Sample ride request created');
  } catch (error) {
    console.warn('Failed to create sample ride request:', error);
  }
};
