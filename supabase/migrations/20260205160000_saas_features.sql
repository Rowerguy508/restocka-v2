-- Invitations table for team invites
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('OWNER', 'MANAGER', 'STAFF')),
  invite_code VARCHAR(20) NOT NULL UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'EXPIRED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id)
);

-- Subscriptions table for Stripe billing
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_customer_id VARCHAR(255) UNIQUE,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  plan VARCHAR(20) NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit log for stock changes
CREATE TABLE IF NOT EXISTS stock_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  previous_quantity DECIMAL(10, 2),
  new_quantity DECIMAL(10, 2),
  changed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_audit_log ENABLE ROW LEVEL SECURITY;

-- Invitations policies
CREATE POLICY "Organization members can view invitations" ON invitations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM memberships 
      WHERE memberships.organization_id = invitations.organization_id 
      AND memberships.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can create invitations" ON invitations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM memberships 
      WHERE memberships.organization_id = invitations.organization_id 
      AND memberships.user_id = auth.uid()
      AND memberships.role = 'OWNER'
    )
  );

-- Subscriptions policies
CREATE POLICY "Organization members can view subscription" ON subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM memberships 
      WHERE memberships.organization_id = subscriptions.organization_id 
      AND memberships.user_id = auth.uid()
    )
  );

-- Audit log policies
CREATE POLICY "Organization members can view audit log" ON stock_audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM memberships 
      WHERE memberships.organization_id = stock_audit_log.organization_id 
      AND memberships.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert audit log entries" ON stock_audit_log
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM memberships 
      WHERE memberships.organization_id = stock_audit_log.organization_id 
      AND memberships.user_id = auth.uid()
    )
  );

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_invitations_code ON invitations(invite_code);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);
CREATE INDEX IF NOT EXISTS idx_audit_log_product ON stock_audit_log(product_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON stock_audit_log(created_at DESC);
