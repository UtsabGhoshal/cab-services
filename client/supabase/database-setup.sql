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
  passenger_name VARCHAR(255),
  passenger_phone VARCHAR(20),
  pickup_location JSONB NOT NULL,
  destination JSONB NOT NULL,
  ride_type VARCHAR(50) DEFAULT 'standard',
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

-- Create driver_sessions table (for tracking online/offline status)
CREATE TABLE IF NOT EXISTS driver_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  driver_id UUID REFERENCES drivers(id) NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  total_minutes INTEGER,
  earnings DECIMAL(10,2) DEFAULT 0,
  rides_completed INTEGER DEFAULT 0
);

-- Create driver_earnings table (for detailed earnings tracking)
CREATE TABLE IF NOT EXISTS driver_earnings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  driver_id UUID REFERENCES drivers(id) NOT NULL,
  ride_id UUID REFERENCES rides(id),
  base_fare DECIMAL(10,2) NOT NULL,
  commission DECIMAL(10,2) DEFAULT 0,
  net_earnings DECIMAL(10,2) NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_drivers_email ON drivers(email);
CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);
CREATE INDEX IF NOT EXISTS idx_drivers_is_approved ON drivers(is_approved);
CREATE INDEX IF NOT EXISTS idx_drivers_is_active ON drivers(is_active);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_rides_user_id ON rides(user_id);
CREATE INDEX IF NOT EXISTS idx_rides_driver_id ON rides(driver_id);
CREATE INDEX IF NOT EXISTS idx_rides_status ON rides(status);
CREATE INDEX IF NOT EXISTS idx_rides_created_at ON rides(created_at);
CREATE INDEX IF NOT EXISTS idx_vehicles_license_plate ON vehicles(license_plate);
CREATE INDEX IF NOT EXISTS idx_vehicles_driver_id ON vehicles(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_sessions_driver_id ON driver_sessions(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_earnings_driver_id ON driver_earnings(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_earnings_date ON driver_earnings(date);

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
ALTER TABLE driver_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_earnings ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "Drivers can update their assigned rides" ON rides
  FOR UPDATE USING (
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

-- Create policies for driver_sessions table
CREATE POLICY "Drivers can view their own sessions" ON driver_sessions
  FOR SELECT USING (
    auth.uid()::text IN (
      SELECT id::text FROM drivers WHERE email = auth.email() AND drivers.id = driver_sessions.driver_id
    )
  );

-- Create policies for driver_earnings table
CREATE POLICY "Drivers can view their own earnings" ON driver_earnings
  FOR SELECT USING (
    auth.uid()::text IN (
      SELECT id::text FROM drivers WHERE email = auth.email() AND drivers.id = driver_earnings.driver_id
    )
  );

-- Insert sample demo data
INSERT INTO drivers (email, full_name, phone_number, license_number, vehicle_info, is_approved, is_active, rating, total_rides, status) VALUES 
  (
    'driver1@example.com', 
    'John Doe', 
    '+1-234-567-8901', 
    'DL123456789', 
    '{"make": "Toyota", "model": "Camry", "year": 2020, "color": "Blue", "licensePlate": "ABC-123"}', 
    true, 
    true, 
    4.8, 
    150, 
    'offline'
  ),
  (
    'driver2@example.com', 
    'Jane Smith', 
    '+1-234-567-8902', 
    'DL987654321', 
    '{"make": "Honda", "model": "Civic", "year": 2021, "color": "Red", "licensePlate": "XYZ-789"}', 
    true, 
    true, 
    4.9, 
    200, 
    'offline'
  )
ON CONFLICT (email) DO NOTHING;

-- Insert sample users
INSERT INTO users (email, full_name, phone_number) VALUES 
  ('user1@example.com', 'Alice Johnson', '+1-234-567-8903'),
  ('user2@example.com', 'Bob Wilson', '+1-234-567-8904')
ON CONFLICT (email) DO NOTHING;

-- Insert sample vehicles
INSERT INTO vehicles (license_plate, make, model, year, color, driver_id) VALUES 
  (
    'ABC-123', 
    'Toyota', 
    'Camry', 
    2020, 
    'Blue', 
    (SELECT id FROM drivers WHERE email = 'driver1@example.com')
  ),
  (
    'XYZ-789', 
    'Honda', 
    'Civic', 
    2021, 
    'Red', 
    (SELECT id FROM drivers WHERE email = 'driver2@example.com')
  )
ON CONFLICT (license_plate) DO NOTHING;

-- Create a view for driver statistics
CREATE OR REPLACE VIEW driver_stats AS
SELECT 
  d.id,
  d.email,
  d.full_name,
  d.rating,
  d.total_rides,
  COALESCE(SUM(de.net_earnings), 0) as total_earnings,
  COALESCE(SUM(CASE WHEN de.date = CURRENT_DATE THEN de.net_earnings ELSE 0 END), 0) as today_earnings,
  COALESCE(SUM(CASE WHEN de.date >= DATE_TRUNC('week', CURRENT_DATE) THEN de.net_earnings ELSE 0 END), 0) as week_earnings,
  COALESCE(SUM(CASE WHEN de.date >= DATE_TRUNC('month', CURRENT_DATE) THEN de.net_earnings ELSE 0 END), 0) as month_earnings,
  COUNT(CASE WHEN r.status = 'completed' THEN 1 END) as completed_rides,
  ROUND(
    (COUNT(CASE WHEN r.status = 'completed' THEN 1 END)::DECIMAL / 
     NULLIF(COUNT(CASE WHEN r.status IN ('completed', 'cancelled') THEN 1 END), 0)) * 100, 
    2
  ) as completion_rate
FROM drivers d
LEFT JOIN driver_earnings de ON d.id = de.driver_id
LEFT JOIN rides r ON d.id = r.driver_id
GROUP BY d.id, d.email, d.full_name, d.rating, d.total_rides;

-- Create a function to calculate driver earnings
CREATE OR REPLACE FUNCTION calculate_driver_earnings(
  driver_uuid UUID,
  base_fare_amount DECIMAL(10,2),
  commission_rate DECIMAL(5,4) DEFAULT 0.05
)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  commission_amount DECIMAL(10,2);
  net_earnings DECIMAL(10,2);
BEGIN
  commission_amount := base_fare_amount * commission_rate;
  net_earnings := base_fare_amount - commission_amount;
  
  -- Insert earning record
  INSERT INTO driver_earnings (driver_id, base_fare, commission, net_earnings)
  VALUES (driver_uuid, base_fare_amount, commission_amount, net_earnings);
  
  RETURN net_earnings;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions (adjust as needed for your setup)
-- GRANT USAGE ON SCHEMA public TO authenticated;
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Note: Run this script in your Supabase SQL Editor
-- After running this, your Supabase database will be ready for the URide application

-- To verify the setup, you can run:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
