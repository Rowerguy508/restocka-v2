-- Migration: Fix RLS policies for signup flow
-- Created: 2026-02-05

-- Allow any authenticated user to create organizations
DROP POLICY IF EXISTS "auth_users_can_create_orgs" ON organizations;
CREATE POLICY "auth_users_can_create_orgs"
ON organizations
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to insert locations (for signup flow)
DROP POLICY IF EXISTS "auth_users_can_create_locations" ON locations;
CREATE POLICY "auth_users_can_create_locations"
ON locations
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to create memberships (for self-signup)
DROP POLICY IF EXISTS "auth_users_can_create_memberships" ON memberships;
CREATE POLICY "auth_users_can_create_memberships"
ON memberships
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Keep read policies as they are (users can only see their orgs)
