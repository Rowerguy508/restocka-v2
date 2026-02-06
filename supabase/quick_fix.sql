-- Quick fix for signup - run this in Supabase SQL Editor

-- Enable inserts for authenticated users during signup
CREATE POLICY "Allow signup org insert" ON organizations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow signup loc insert" ON locations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow signup mem insert" ON memberships FOR INSERT TO authenticated WITH CHECK (true);
