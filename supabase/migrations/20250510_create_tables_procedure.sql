CREATE OR REPLACE FUNCTION create_tables_if_not_exist()
RETURNS void AS $$
BEGIN
  -- Create extension for UUID generation if it doesn't exist
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  
  -- Create customers table if it doesn't exist
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'customers') THEN
    CREATE TABLE customers (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      zip TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Add RLS policies for customers table
    ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
    
    -- Policy for users to see only their own data
    CREATE POLICY "Users can view their own customer data"
      ON customers FOR SELECT
      USING (auth.uid() = id);
      
    -- Policy for users to insert their own data
    CREATE POLICY "Users can insert their own customer data"
      ON customers FOR INSERT
      WITH CHECK (auth.uid() = id);
      
    -- Policy for users to update their own data
    CREATE POLICY "Users can update their own customer data"
      ON customers FOR UPDATE
      USING (auth.uid() = id);
  END IF;
  
  -- Create bookings table if it doesn't exist
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'bookings') THEN
    CREATE TABLE bookings (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
      service_type TEXT NOT NULL CHECK (service_type IN ('one-time', 'regular')),
      frequency TEXT CHECK (frequency IN ('weekly', 'twice-weekly')),
      dogs INTEGER NOT NULL CHECK (dogs BETWEEN 1 AND 3),
      price DECIMAL(10, 2) NOT NULL,
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
      special_instructions TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Add RLS policies for bookings table
    ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
    
    -- Policy for users to see only their own bookings
    CREATE POLICY "Users can view their own bookings"
      ON bookings FOR SELECT
      USING (auth.uid() IN (SELECT id FROM customers WHERE id = customer_id));
      
    -- Policy for users to insert their own bookings
    CREATE POLICY "Users can insert their own bookings"
      ON bookings FOR INSERT
      WITH CHECK (auth.uid() IN (SELECT id FROM customers WHERE id = customer_id));
      
    -- Policy for users to update their own bookings
    CREATE POLICY "Users can update their own bookings"
      ON bookings FOR UPDATE
      USING (auth.uid() IN (SELECT id FROM customers WHERE id = customer_id));
  END IF;
  
  -- Create service_days table if it doesn't exist
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'service_days') THEN
    CREATE TABLE service_days (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
      day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 5),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Add RLS policies for service_days table
    ALTER TABLE service_days ENABLE ROW LEVEL SECURITY;
    
    -- Policy for users to see only their own service days
    CREATE POLICY "Users can view their own service days"
      ON service_days FOR SELECT
      USING (booking_id IN (
        SELECT b.id FROM bookings b
        JOIN customers c ON b.customer_id = c.id
        WHERE c.id = auth.uid()
      ));
      
    -- Policy for users to insert their own service days
    CREATE POLICY "Users can insert their own service days"
      ON service_days FOR INSERT
      WITH CHECK (booking_id IN (
        SELECT b.id FROM bookings b
        JOIN customers c ON b.customer_id = c.id
        WHERE c.id = auth.uid()
      ));
      
    -- Policy for users to update their own service days
    CREATE POLICY "Users can update their own service days"
      ON service_days FOR UPDATE
      USING (booking_id IN (
        SELECT b.id FROM bookings b
        JOIN customers c ON b.customer_id = c.id
        WHERE c.id = auth.uid()
      ));
  END IF;
END;
$$ LANGUAGE plpgsql;
