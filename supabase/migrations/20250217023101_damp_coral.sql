/*
  # Add User Roles Management

  1. New Tables
    - `roles` - Defines available roles (admin, member)
    - `user_roles` - Maps users to their roles

  2. Changes
    - Add default roles
    - Add function to check user roles
    - Add trigger to assign default role on user creation

  3. Security
    - Enable RLS on role tables
    - Add policies for role management
*/

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  role_id uuid REFERENCES roles NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role_id)
);

-- Enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Insert default roles
INSERT INTO roles (name, description) VALUES
  ('admin', 'Full access to all features and management capabilities'),
  ('member', 'Standard member access')
ON CONFLICT (name) DO NOTHING;

-- Create function to check if user has role
CREATE OR REPLACE FUNCTION has_role(user_id uuid, role_name text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = user_id
    AND r.name = role_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to assign default role
CREATE OR REPLACE FUNCTION assign_default_role()
RETURNS TRIGGER AS $$
DECLARE
  member_role_id uuid;
BEGIN
  -- Get member role id
  SELECT id INTO member_role_id FROM roles WHERE name = 'member';
  
  -- Assign member role to new user
  INSERT INTO user_roles (user_id, role_id)
  VALUES (NEW.id, member_role_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to assign default role on user creation
CREATE TRIGGER assign_default_role_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION assign_default_role();

-- Create policies for roles table
CREATE POLICY "Admins can manage roles"
  ON roles
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view roles"
  ON roles
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for user_roles table
CREATE POLICY "Admins can manage user roles"
  ON user_roles
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own roles"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Update existing prayer policies to use role check
DROP POLICY IF EXISTS "Admins can manage all prayers" ON prayers;
CREATE POLICY "Admins can manage all prayers"
  ON prayers
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Update approval policies
DROP POLICY IF EXISTS "Admins can view approval history" ON prayer_approval_history;
CREATE POLICY "Admins can view approval history"
  ON prayer_approval_history
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));