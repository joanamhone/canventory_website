/*
  # Initial Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `created_at` (timestamp)
      - `role` (text)
    
    - `patients`
      - `id` (uuid, primary key)
      - `name` (text)
      - `age` (integer)
      - `gender` (text)
      - `residence` (text)
      - `phone` (text, nullable)
      - `email` (text, nullable)
      - `has_outstanding_balance` (boolean)
      - `total_outstanding` (decimal)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `inventory_items`
      - `id` (uuid, primary key)
      - `name` (text)
      - `category` (text)
      - `current_stock` (integer)
      - `unit` (text)
      - `unit_cost` (decimal)
      - `reorder_level` (integer)
      - `reorder_quantity` (integer)
      - `supplier` (text, nullable)
      - `notes` (text, nullable)
      - `expiry_date` (timestamp, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `treatments`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, references patients)
      - `date` (timestamp)
      - `diagnosis` (text)
      - `notes` (text, nullable)
      - `total_cost` (decimal)
      - `amount_paid` (decimal)
      - `payment_status` (text)
      - `due_date` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `treatment_medications`
      - `id` (uuid, primary key)
      - `treatment_id` (uuid, references treatments)
      - `inventory_item_id` (uuid, references inventory_items)
      - `quantity` (integer)
      - `dosage` (text)
      - `instructions` (text, nullable)
      - `unit_cost` (decimal)
      - `total_cost` (decimal)
    
    - `treatment_services`
      - `id` (uuid, primary key)
      - `treatment_id` (uuid, references treatments)
      - `name` (text)
      - `description` (text, nullable)
      - `cost` (decimal)
    
    - `inventory_transactions`
      - `id` (uuid, primary key)
      - `inventory_item_id` (uuid, references inventory_items)
      - `type` (text)
      - `quantity` (integer)
      - `balance` (integer)
      - `reason` (text)
      - `reference_id` (uuid, nullable)
      - `reference_type` (text, nullable)
      - `created_at` (timestamp)
      - `created_by` (uuid, references users)
    
    - `payments`
      - `id` (uuid, primary key)
      - `treatment_id` (uuid, references treatments)
      - `amount` (decimal)
      - `date` (timestamp)
      - `method` (text)
      - `status` (text)
      - `notes` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `alerts`
      - `id` (uuid, primary key)
      - `type` (text)
      - `reference_id` (uuid)
      - `reference_type` (text)
      - `message` (text)
      - `is_read` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  role text NOT NULL DEFAULT 'staff'
);

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  age integer NOT NULL,
  gender text NOT NULL,
  residence text NOT NULL,
  phone text,
  email text,
  has_outstanding_balance boolean DEFAULT false,
  total_outstanding decimal(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Inventory items table
CREATE TABLE IF NOT EXISTS inventory_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  category text NOT NULL,
  current_stock integer NOT NULL DEFAULT 0,
  unit text NOT NULL,
  unit_cost decimal(10,2) NOT NULL,
  reorder_level integer NOT NULL,
  reorder_quantity integer NOT NULL,
  supplier text,
  notes text,
  expiry_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Treatments table
CREATE TABLE IF NOT EXISTS treatments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id uuid NOT NULL REFERENCES patients(id),
  date timestamptz NOT NULL DEFAULT now(),
  diagnosis text NOT NULL,
  notes text,
  total_cost decimal(10,2) NOT NULL DEFAULT 0,
  amount_paid decimal(10,2) NOT NULL DEFAULT 0,
  payment_status text NOT NULL DEFAULT 'pending',
  due_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Treatment medications table
CREATE TABLE IF NOT EXISTS treatment_medications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  treatment_id uuid NOT NULL REFERENCES treatments(id),
  inventory_item_id uuid NOT NULL REFERENCES inventory_items(id),
  quantity integer NOT NULL,
  dosage text NOT NULL,
  instructions text,
  unit_cost decimal(10,2) NOT NULL,
  total_cost decimal(10,2) NOT NULL
);

-- Treatment services table
CREATE TABLE IF NOT EXISTS treatment_services (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  treatment_id uuid NOT NULL REFERENCES treatments(id),
  name text NOT NULL,
  description text,
  cost decimal(10,2) NOT NULL
);

-- Inventory transactions table
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  inventory_item_id uuid NOT NULL REFERENCES inventory_items(id),
  type text NOT NULL,
  quantity integer NOT NULL,
  balance integer NOT NULL,
  reason text NOT NULL,
  reference_id uuid,
  reference_type text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES users(id)
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  treatment_id uuid NOT NULL REFERENCES treatments(id),
  amount decimal(10,2) NOT NULL,
  date timestamptz NOT NULL DEFAULT now(),
  method text NOT NULL,
  status text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  type text NOT NULL,
  reference_id uuid NOT NULL,
  reference_type text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Staff can view all patients" ON patients
  FOR SELECT USING (auth.role() IN ('staff', 'admin'));

CREATE POLICY "Staff can modify patients" ON patients
  FOR ALL USING (auth.role() IN ('staff', 'admin'));

CREATE POLICY "Staff can view inventory" ON inventory_items
  FOR SELECT USING (auth.role() IN ('staff', 'admin'));

CREATE POLICY "Staff can modify inventory" ON inventory_items
  FOR ALL USING (auth.role() IN ('staff', 'admin'));

CREATE POLICY "Staff can view treatments" ON treatments
  FOR SELECT USING (auth.role() IN ('staff', 'admin'));

CREATE POLICY "Staff can modify treatments" ON treatments
  FOR ALL USING (auth.role() IN ('staff', 'admin'));

CREATE POLICY "Staff can view medications" ON treatment_medications
  FOR SELECT USING (auth.role() IN ('staff', 'admin'));

CREATE POLICY "Staff can modify medications" ON treatment_medications
  FOR ALL USING (auth.role() IN ('staff', 'admin'));

CREATE POLICY "Staff can view services" ON treatment_services
  FOR SELECT USING (auth.role() IN ('staff', 'admin'));

CREATE POLICY "Staff can modify services" ON treatment_services
  FOR ALL USING (auth.role() IN ('staff', 'admin'));

CREATE POLICY "Staff can view transactions" ON inventory_transactions
  FOR SELECT USING (auth.role() IN ('staff', 'admin'));

CREATE POLICY "Staff can create transactions" ON inventory_transactions
  FOR INSERT WITH CHECK (auth.role() IN ('staff', 'admin'));

CREATE POLICY "Staff can view payments" ON payments
  FOR SELECT USING (auth.role() IN ('staff', 'admin'));

CREATE POLICY "Staff can modify payments" ON payments
  FOR ALL USING (auth.role() IN ('staff', 'admin'));

CREATE POLICY "Users can view their alerts" ON alerts
  FOR SELECT USING (auth.role() IN ('staff', 'admin'));

CREATE POLICY "Users can modify their alerts" ON alerts
  FOR ALL USING (auth.role() IN ('staff', 'admin'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(name);
CREATE INDEX IF NOT EXISTS idx_inventory_items_name ON inventory_items(name);
CREATE INDEX IF NOT EXISTS idx_treatments_patient_id ON treatments(patient_id);
CREATE INDEX IF NOT EXISTS idx_treatments_date ON treatments(date);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_item_id ON inventory_transactions(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_payments_treatment_id ON payments(treatment_id);
CREATE INDEX IF NOT EXISTS idx_alerts_reference_id ON alerts(reference_id);

-- Create functions for common operations
CREATE OR REPLACE FUNCTION update_patient_balance()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE patients
  SET 
    total_outstanding = (
      SELECT COALESCE(SUM(total_cost - amount_paid), 0)
      FROM treatments
      WHERE patient_id = NEW.patient_id
    ),
    has_outstanding_balance = (
      SELECT COALESCE(SUM(total_cost - amount_paid), 0) > 0
      FROM treatments
      WHERE patient_id = NEW.patient_id
    ),
    updated_at = now()
  WHERE id = NEW.patient_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_patient_balance_on_treatment
AFTER INSERT OR UPDATE OF total_cost, amount_paid
ON treatments
FOR EACH ROW
EXECUTE FUNCTION update_patient_balance();

-- Create function to update inventory
CREATE OR REPLACE FUNCTION update_inventory_stock()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE inventory_items
  SET 
    current_stock = NEW.balance,
    updated_at = now()
  WHERE id = NEW.inventory_item_id;
  
  -- Create alert if stock is low
  IF NEW.balance <= (
    SELECT reorder_level 
    FROM inventory_items 
    WHERE id = NEW.inventory_item_id
  ) THEN
    INSERT INTO alerts (
      type,
      reference_id,
      reference_type,
      message
    )
    VALUES (
      'low_stock',
      NEW.inventory_item_id,
      'inventory_item',
      'Low stock alert: Item needs reordering'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for inventory updates
CREATE TRIGGER update_inventory_stock_on_transaction
AFTER INSERT
ON inventory_transactions
FOR EACH ROW
EXECUTE FUNCTION update_inventory_stock();