-- Add payment fields to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS payment_id TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded'));

-- Create payments table to track payment history
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  payment_provider TEXT NOT NULL CHECK (payment_provider IN ('paypal', 'credit_card', 'other')),
  payment_id TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for payments table
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policy for users to see only their own payments
CREATE POLICY "Users can view their own payments"
  ON payments FOR SELECT
  USING (booking_id IN (
    SELECT b.id FROM bookings b
    JOIN customers c ON b.customer_id = c.id
    WHERE c.id = auth.uid()
  ));

-- Policy for users to insert their own payments
CREATE POLICY "Users can insert their own payments"
  ON payments FOR INSERT
  WITH CHECK (booking_id IN (
    SELECT b.id FROM bookings b
    JOIN customers c ON b.customer_id = c.id
    WHERE c.id = auth.uid()
  ));

-- Policy for users to update their own payments
CREATE POLICY "Users can update their own payments"
  ON payments FOR UPDATE
  USING (booking_id IN (
    SELECT b.id FROM bookings b
    JOIN customers c ON b.customer_id = c.id
    WHERE c.id = auth.uid()
  ));
