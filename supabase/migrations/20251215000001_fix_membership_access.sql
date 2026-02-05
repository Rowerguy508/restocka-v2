-- Secure function to get my own membership (Bypasses RLS permissions)
CREATE OR REPLACE FUNCTION get_my_membership()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  -- Safe: Only selects rows where user_id matches the authenticated user
  SELECT row_to_json(m) INTO result
  FROM memberships m
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  RETURN result;
END;
$$;
