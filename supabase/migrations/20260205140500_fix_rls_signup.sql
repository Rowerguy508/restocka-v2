-- Migration: Fix RLS for organization creation during signup
-- Created: 2026-02-05

-- Allow any authenticated user to create organizations
DROP POLICY IF EXISTS "Users can insert organizations" ON organizations;
CREATE POLICY "Users can insert organizations"
ON organizations
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Also fix locations insert policy
DROP POLICY IF EXISTS "Users can insert locations" ON locations;
CREATE POLICY "Users can insert locations"
ON locations
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM memberships 
    WHERE memberships.organization_id = locations.organization_id 
    AND memberships.user_id = auth.uid()
    AND memberships.role = 'OWNER'
  )
);

-- And fix memberships insert policy
DROP POLICY IF EXISTS "Owners can manage memberships" ON memberships;
CREATE POLICY "Owners can manage memberships"
ON memberships
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM memberships m2 
    WHERE m2.organization_id = memberships.organization_id 
    AND m2.user_id = auth.uid()
    AND m2.role = 'OWNER'
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM memberships m2 
    WHERE m2.organization_id = memberships.organization_id 
    AND m2.user_id = auth.uid()
    AND m2.role = 'OWNER'
  )
);
