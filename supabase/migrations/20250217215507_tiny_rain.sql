-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS assign_default_role_trigger ON auth.users;
DROP FUNCTION IF EXISTS assign_default_role();

-- Recreate function with better error handling
CREATE OR REPLACE FUNCTION assign_default_role()
RETURNS TRIGGER AS $$
DECLARE
  member_role_id uuid;
BEGIN
  -- Get member role id with error handling
  SELECT id INTO member_role_id 
  FROM roles 
  WHERE name = 'member';

  IF member_role_id IS NULL THEN
    RAISE EXCEPTION 'Member role not found';
  END IF;
  
  -- Insert with error handling
  BEGIN
    INSERT INTO user_roles (user_id, role_id)
    VALUES (NEW.id, member_role_id);
  EXCEPTION WHEN unique_violation THEN
    -- Ignore if role already assigned
    NULL;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
CREATE TRIGGER assign_default_role_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION assign_default_role();

-- Ensure member role exists
INSERT INTO roles (name, description)
VALUES ('member', 'Standard member access')
ON CONFLICT (name) DO NOTHING;

-- Fix any existing users without roles
INSERT INTO user_roles (user_id, role_id)
SELECT 
  users.id as user_id,
  roles.id as role_id
FROM auth.users users
CROSS JOIN roles
WHERE roles.name = 'member'
AND NOT EXISTS (
  SELECT 1 
  FROM user_roles ur 
  WHERE ur.user_id = users.id
)
ON CONFLICT (user_id, role_id) DO NOTHING;