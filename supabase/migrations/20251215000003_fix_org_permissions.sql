-- Enable RLS on organizations (if not already)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- 1. Grant generic access to authenticated users
GRANT ALL ON organizations TO authenticated;
GRANT ALL ON organizations TO service_role;

-- 2. Allow any authenticated user to create a NEW organization
-- (They become the owner via the membership trigger/logic later)
CREATE POLICY "Allow authenticated to create organizations"
ON organizations
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 3. Allow members to view their own organization
CREATE POLICY "Allow members to view their own organization"
ON organizations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM memberships
    WHERE memberships.organization_id = organizations.id
    AND memberships.user_id = auth.uid()
  )
);

-- 4. Allow members to update their own organization (Owner only ideally, but keeping simple for now)
CREATE POLICY "Allow members to update their own organization"
ON organizations
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM memberships
    WHERE memberships.organization_id = organizations.id
    AND memberships.user_id = auth.uid()
  )
);
