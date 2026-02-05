-- 1. Add Invite Code Column
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE;

-- 2. Function to Generate Random Code (6 chars, uppercase)
CREATE OR REPLACE FUNCTION generate_invite_code() 
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER := 0;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 3. Trigger to Auto-Set Code on Insert
CREATE OR REPLACE FUNCTION set_invite_code() 
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invite_code IS NULL THEN
    NEW.invite_code := generate_invite_code();
    -- Simple collision handling: loop until unique (rare for 6 chars small scale, but good practice)
    WHILE EXISTS (SELECT 1 FROM organizations WHERE invite_code = NEW.invite_code) LOOP
      NEW.invite_code := generate_invite_code();
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_org_created_add_code
  BEFORE INSERT ON organizations
  FOR EACH ROW
  EXECUTE PROCEDURE set_invite_code();

-- 4. Backfill Existing Organizations
UPDATE organizations SET invite_code = generate_invite_code() WHERE invite_code IS NULL;

-- 5. Secure Function to Join by Code
-- This must be SECURITY DEFINER to allow a non-member to find the Org ID
CREATE OR REPLACE FUNCTION join_organization_by_code(code TEXT)
RETURNS JSON AS $$
DECLARE
  target_org_id UUID;
  target_org_name TEXT;
BEGIN
  -- Find Org
  SELECT id, name INTO target_org_id, target_org_name
  FROM organizations 
  WHERE invite_code = code;

  IF target_org_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Invalid code');
  END IF;

  -- Check if already a member
  IF EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND organization_id = target_org_id) THEN
    RETURN json_build_object('success', false, 'message', 'Already a member');
  END IF;

  -- Insert Membership (Default minimal role: STAFF)
  INSERT INTO memberships (user_id, organization_id, role)
  VALUES (auth.uid(), target_org_id, 'STAFF');

  RETURN json_build_object('success', true, 'org_name', target_org_name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
