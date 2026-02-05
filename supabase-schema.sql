-- Restocka Supabase Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Locations table (with optional GPS coordinates)
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255),
  full_name VARCHAR(255),
  phone VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Memberships table (links users to organizations with roles)
CREATE TABLE IF NOT EXISTS memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('OWNER', 'MANAGER')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  category VARCHAR(100),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stock Levels table
CREATE TABLE IF NOT EXISTS stock_levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL CHECK (status IN ('OK', 'LOW', 'CRITICAL')),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, location_id)
);

-- Usage Rates table
CREATE TABLE IF NOT EXISTS usage_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  daily_usage DECIMAL(10, 2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, location_id)
);

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  whatsapp_phone VARCHAR(50),
  email VARCHAR(255),
  lead_time_hours INTEGER DEFAULT 24,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reorder Rules table
CREATE TABLE IF NOT EXISTS reorder_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  safety_days INTEGER NOT NULL DEFAULT 3,
  reorder_qty DECIMAL(10, 2) NOT NULL DEFAULT 10,
  automation_mode VARCHAR(20) NOT NULL DEFAULT 'MANUAL' CHECK (automation_mode IN ('MANUAL', 'ASSISTED', 'AUTO')),
  emergency_override BOOLEAN DEFAULT FALSE,
  price_cap DECIMAL(10, 2),
  max_spend DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, location_id)
);

-- Purchase Orders table
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SENT', 'DELIVERED', 'PROBLEM', 'CANCELED')),
  total_amount DECIMAL(10, 2),
  notes TEXT,
  whatsapp_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchase Order Items table
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity DECIMAL(10, 2) NOT NULL,
  unit_price DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_locations_organization ON locations(organization_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user ON memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_products_organization ON products(organization_id);
CREATE INDEX IF NOT EXISTS idx_stock_levels_product_location ON stock_levels(product_id, location_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_organization ON purchase_orders(organization_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reorder_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Organizations: Users can see organizations they belong to
CREATE POLICY "Users can view their organizations" ON organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM memberships 
      WHERE memberships.organization_id = organizations.id 
      AND memberships.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert organizations" ON organizations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Locations: Users can see locations in their organizations
CREATE POLICY "Users can view locations" ON locations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM memberships 
      WHERE memberships.organization_id = locations.organization_id 
      AND memberships.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert locations" ON locations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM memberships 
      WHERE memberships.organization_id = locations.organization_id 
      AND memberships.user_id = auth.uid()
      AND memberships.role = 'OWNER'
    )
  );

-- Memberships: Users can view their memberships
CREATE POLICY "Users can view memberships" ON memberships
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Owners can manage memberships" ON memberships
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM memberships m2 
      WHERE m2.organization_id = memberships.organization_id 
      AND m2.user_id = auth.uid()
      AND m2.role = 'OWNER'
    )
  );

-- Products: Users can see products in their organizations
CREATE POLICY "Users can view products" ON products
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM memberships 
      WHERE memberships.organization_id = products.organization_id 
      AND memberships.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert products" ON products
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM memberships 
      WHERE memberships.organization_id = products.organization_id 
      AND memberships.user_id = auth.uid()
    )
  );

-- Similar policies for other tables (simplified for brevity)
CREATE POLICY "Users can view stock levels" ON stock_levels
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM stock_levels sl
      JOIN locations l ON l.id = sl.location_id
      JOIN memberships m ON m.organization_id = l.organization_id
      WHERE m.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view suppliers" ON suppliers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM memberships 
      WHERE memberships.organization_id = suppliers.organization_id 
      AND memberships.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view purchase orders" ON purchase_orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM memberships 
      WHERE memberships.organization_id = purchase_orders.organization_id 
      AND memberships.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view alerts" ON alerts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM memberships 
      WHERE memberships.organization_id = alerts.organization_id 
      AND memberships.user_id = auth.uid()
    )
  );

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables with updated_at column
CREATE TRIGGER update_purchase_orders_updated_at
  BEFORE UPDATE ON purchase_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE organizations IS 'Restaurant/business organizations';
COMMENT ON TABLE locations IS 'Physical locations (restaurants, warehouses)';
COMMENT ON TABLE memberships IS 'User-Organization relationships with roles';
COMMENT ON TABLE products IS 'Inventory products';
COMMENT ON TABLE stock_levels IS 'Current stock quantities per product and location';
COMMENT ON TABLE usage_rates IS 'Daily usage rates for demand forecasting';
COMMENT ON TABLE suppliers IS 'Vendor/supplier information';
COMMENT ON TABLE reorder_rules IS 'Automated reorder configuration';
COMMENT ON TABLE purchase_orders IS 'Purchase order headers';
COMMENT ON TABLE purchase_order_items IS 'Individual items in purchase orders';
COMMENT ON TABLE alerts IS 'System notifications and alerts';
