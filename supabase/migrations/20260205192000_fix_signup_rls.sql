-- Fix RLS to allow new users to create organizations during signup

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to create organizations" ON public.organizations;
DROP POLICY IF EXISTS "Allow authenticated users to create locations" ON public.locations;
DROP POLICY IF EXISTS "Allow authenticated users to create memberships" ON public.memberships;
DROP POLICY IF EXISTS "Allow signup org insert" ON organizations;
DROP POLICY IF EXISTS "Allow signup loc insert" ON locations;
DROP POLICY IF EXISTS "Allow signup mem insert" ON memberships;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Allow authenticated users to INSERT organizations (for onboarding)
CREATE POLICY "Allow authenticated users to create organizations"
ON public.organizations
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to INSERT locations during onboarding  
CREATE POLICY "Allow authenticated users to create locations"
ON public.locations
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to INSERT memberships during onboarding
CREATE POLICY "Allow authenticated users to create memberships"
ON public.memberships
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow users to see their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON public.memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_org_id ON public.memberships(organization_id);
