-- URide Database Schema for Supabase
-- Run this in your Supabase SQL Editor to set up the required tables

-- Enable the necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create drivers table
CREATE TABLE IF NOT EXISTS drivers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  license_number VARCHAR(50) NOT NULL,
  vehicle_info JSONB,
  is_approved BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  rating DECIMAL(3,2) DEFAULT 5.0,
  total_rides INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'offline',
  current_location JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table (for regular passengers)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rides table
CREATE TABLE IF NOT EXISTS rides (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  driver_id UUID REFERENCES drivers(id),
  pickup_location JSONB NOT NULL,
  destination JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  fare DECIMAL(10,2),
  distance_km DECIMAL(8,2),
  duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vehicles table (for fleet management)
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  license_plate VARCHAR(20) UNIQUE NOT NULL,
  make VARCHAR(50) NOT NULL,
  model VARCHAR(50) NOT NULL,
  year INTEGER NOT NULL,
  color VARCHAR(30) NOT NULL,
  driver_id UUID REFERENCES drivers(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_drivers_email ON drivers(email);
CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);
CREATE INDEX IF NOT EXISTS idx_drivers_is_approved ON drivers(is_approved);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_rides_user_id ON rides(user_id);
CREATE INDEX IF NOT EXISTS idx_rides_driver_id ON rides(driver_id);
CREATE INDEX IF NOT EXISTS idx_rides_status ON rides(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_license_plate ON vehicles(license_plate);
CREATE INDEX IF NOT EXISTS idx_vehicles_driver_id ON vehicles(driver_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rides_updated_at BEFORE UPDATE ON rides 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Set up Row Level Security (RLS)
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- Create policies for drivers table
CREATE POLICY "Drivers can view their own data" ON drivers
  FOR SELECT USING (auth.email() = email);

CREATE POLICY "Drivers can update their own data" ON drivers
  FOR UPDATE USING (auth.email() = email);

CREATE POLICY "Allow public read access for approved drivers" ON drivers
  FOR SELECT USING (is_approved = true AND is_active = true);

-- Create policies for users table
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.email() = email);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.email() = email);

-- Create policies for rides table
CREATE POLICY "Users can view their own rides" ON rides
  FOR SELECT USING (
    auth.uid()::text IN (
      SELECT id::text FROM users WHERE email = auth.email()
    )
  );

CREATE POLICY "Drivers can view their assigned rides" ON rides
  FOR SELECT USING (
    auth.uid()::text IN (
      SELECT id::text FROM drivers WHERE email = auth.email()
    )
  );

-- Create policies for vehicles table
CREATE POLICY "Drivers can view their assigned vehicles" ON vehicles
  FOR SELECT USING (
    auth.uid()::text IN (
      SELECT id::text FROM drivers WHERE email = auth.email()
    )
  );

-- Insert sample demo data
INSERT INTO drivers (email, full_name, phone_number, license_number, vehicle_info, is_approved, is_active, rating, total_rides, status) VALUES 
  ('driver1@example.com', 'John Doe', '+1-234-567-8901', 'DL123456789', '{"make": "Toyota", "model": "Camry", "year": 2020, "color": "Blue", "licensePlate": "ABC-123"}', true, true, 4.8, 150, 'online'),
  ('driver2@example.com', 'Jane Smith', '+1-234-567-8902', 'DL987654321', '{"make": "Honda", "model": "Civic", "year": 2021, "color": "Red", "licensePlate": "XYZ-789"}', true, true, 4.9, 200, 'offline')
ON CONFLICT (email) DO NOTHING;

-- Insert sample users
INSERT INTO users (email, full_name, phone_number) VALUES 
  ('user1@example.com', 'Alice Johnson', '+1-234-567-8903'),
  ('user2@example.com', 'Bob Wilson', '+1-234-567-8904')
ON CONFLICT (email) DO NOTHING;

-- Note: Run this script in your Supabase SQL Editor
-- After running this, your Supabase database will be ready for the URide application
