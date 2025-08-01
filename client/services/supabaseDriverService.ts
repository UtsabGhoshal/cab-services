import { supabase } from '@/supabase/config';
import type { FirebaseDriver } from '@/shared/driverTypes';

export class SupabaseDriverService {
  private tableName = 'drivers';

  // Create a new driver
  async createDriver(driverData: Omit<FirebaseDriver, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date().toISOString();
    const driver = {
      ...driverData,
      created_at: now,
      updated_at: now,
    };

    const { data, error } = await supabase
      .from(this.tableName)
      .insert(driver)
      .select('id')
      .single();

    if (error) {
      console.error('Error creating driver:', error);
      throw new Error(`Failed to create driver: ${error.message}`);
    }

    return data.id;
  }

  // Get driver by ID
  async getDriverById(id: string): Promise<FirebaseDriver | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return null;
      }
      console.error('Error getting driver by ID:', error);
      throw new Error(`Failed to get driver: ${error.message}`);
    }

    return this.transformSupabaseDriver(data);
  }

  // Get driver by email
  async getDriverByEmail(email: string): Promise<FirebaseDriver | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return null;
      }
      console.error('Error getting driver by email:', error);
      throw new Error(`Failed to get driver: ${error.message}`);
    }

    return this.transformSupabaseDriver(data);
  }

  // Update driver
  async updateDriver(id: string, updates: Partial<FirebaseDriver>): Promise<void> {
    const { updated_at, created_at, ...updateData } = updates as any;
    const now = new Date().toISOString();

    const { error } = await supabase
      .from(this.tableName)
      .update({
        ...updateData,
        updated_at: now,
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating driver:', error);
      throw new Error(`Failed to update driver: ${error.message}`);
    }
  }

  // Get all drivers
  async getAllDrivers(): Promise<FirebaseDriver[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting all drivers:', error);
      throw new Error(`Failed to get drivers: ${error.message}`);
    }

    return data.map(driver => this.transformSupabaseDriver(driver));
  }

  // Delete driver
  async deleteDriver(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting driver:', error);
      throw new Error(`Failed to delete driver: ${error.message}`);
    }
  }

  // Subscribe to driver changes
  subscribeToDriverChanges(callback: (drivers: FirebaseDriver[]) => void) {
    return supabase
      .channel('drivers_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: this.tableName },
        async () => {
          // Fetch updated data when changes occur
          const drivers = await this.getAllDrivers();
          callback(drivers);
        }
      )
      .subscribe();
  }

  // Transform Supabase driver to Firebase format
  private transformSupabaseDriver(supabaseDriver: any): FirebaseDriver {
    return {
      id: supabaseDriver.id,
      email: supabaseDriver.email,
      fullName: supabaseDriver.full_name || supabaseDriver.fullName,
      phoneNumber: supabaseDriver.phone_number || supabaseDriver.phoneNumber,
      licenseNumber: supabaseDriver.license_number || supabaseDriver.licenseNumber,
      vehicleInfo: supabaseDriver.vehicle_info || supabaseDriver.vehicleInfo,
      isApproved: supabaseDriver.is_approved || supabaseDriver.isApproved || false,
      isActive: supabaseDriver.is_active || supabaseDriver.isActive || true,
      rating: supabaseDriver.rating || 5.0,
      totalRides: supabaseDriver.total_rides || supabaseDriver.totalRides || 0,
      status: supabaseDriver.status || 'offline',
      currentLocation: supabaseDriver.current_location || supabaseDriver.currentLocation,
      createdAt: supabaseDriver.created_at || supabaseDriver.createdAt,
      updatedAt: supabaseDriver.updated_at || supabaseDriver.updatedAt,
    };
  }

  // Initialize demo drivers for development
  async initializeDemoDrivers(): Promise<void> {
    const demoDrivers = [
      {
        email: 'driver1@example.com',
        fullName: 'John Doe',
        phoneNumber: '+1-234-567-8901',
        licenseNumber: 'DL123456789',
        vehicleInfo: {
          make: 'Toyota',
          model: 'Camry',
          year: 2020,
          color: 'Blue',
          licensePlate: 'ABC-123'
        },
        isApproved: true,
        rating: 4.8,
        totalRides: 150,
        status: 'online' as const,
      },
      {
        email: 'driver2@example.com',
        fullName: 'Jane Smith',
        phoneNumber: '+1-234-567-8902',
        licenseNumber: 'DL987654321',
        vehicleInfo: {
          make: 'Honda',
          model: 'Civic',
          year: 2021,
          color: 'Red',
          licensePlate: 'XYZ-789'
        },
        isApproved: true,
        rating: 4.9,
        totalRides: 200,
        status: 'offline' as const,
      }
    ];

    for (const driverData of demoDrivers) {
      try {
        const existingDriver = await this.getDriverByEmail(driverData.email);
        if (!existingDriver) {
          await this.createDriver(driverData);
          console.log(`✅ Created demo driver: ${driverData.email}`);
        }
      } catch (error) {
        console.warn(`⚠️ Could not create demo driver ${driverData.email}:`, error);
      }
    }
  }
}

// Export singleton instance
export const supabaseDriverService = new SupabaseDriverService();
