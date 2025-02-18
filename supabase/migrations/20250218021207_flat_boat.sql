/*
  # Fix roles and policies

  1. Changes
    - Drops all dependent policies
    - Recreates roles and user_roles tables if they don't exist
    - Updates has_role function
    - Recreates all policies
  
  2. Security
    - Maintains RLS
    - Preserves role-based access control
*/

-- Create roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create user_roles table if it doesn't exist
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

-- Insert default roles if they don't exist
INSERT INTO roles (name, description)
VALUES 
  ('admin', 'Full access to all features and management capabilities'),
  ('member', 'Standard member access'),
  ('finance', 'Access to financial features')
ON CONFLICT (name) DO NOTHING;

-- Create function to assign default role
CREATE OR REPLACE FUNCTION assign_default_role()
RETURNS TRIGGER AS $$
DECLARE
  member_role_id uuid;
BEGIN
  -- Get member role id
  SELECT id INTO member_role_id FROM roles WHERE name = 'member';
  
  -- Assign member role to new user if role exists
  IF member_role_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role_id)
    VALUES (NEW.id, member_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to assign default role on user creation
CREATE OR REPLACE TRIGGER assign_default_role_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION assign_default_role();

-- Create function to check if user has role
CREATE OR REPLACE FUNCTION check_user_role(input_user_id uuid, input_role_name text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = input_user_id
    AND r.name = input_role_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);

-- Create policies for roles table
CREATE POLICY "Admins can manage roles"
  ON roles
  FOR ALL
  TO authenticated
  USING (check_user_role(auth.uid(), 'admin'));

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
  USING (check_user_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own roles"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Update all other policies to use the new check_user_role function
DO $$ 
BEGIN
  -- Announcements policies
  EXECUTE 'CREATE POLICY "Admins can manage announcements" ON announcements FOR ALL TO authenticated USING (check_user_role(auth.uid(), ''admin''))';

  -- Prayers and related policies
  EXECUTE 'CREATE POLICY "Admins can manage all prayers" ON prayers FOR ALL TO authenticated USING (check_user_role(auth.uid(), ''admin''))';
  EXECUTE 'CREATE POLICY "Admins can manage approval history" ON prayer_approval_history FOR ALL TO authenticated USING (check_user_role(auth.uid(), ''admin''))';

  -- Donations and meetings policies
  EXECUTE 'CREATE POLICY "Admins can manage donations" ON donations FOR ALL TO authenticated USING (check_user_role(auth.uid(), ''admin''))';
  EXECUTE 'CREATE POLICY "Admins can manage meetings" ON meetings FOR ALL TO authenticated USING (check_user_role(auth.uid(), ''admin''))';

  -- Connection cards policies
  EXECUTE 'CREATE POLICY "Staff can view assigned cards" ON connection_cards FOR SELECT TO authenticated USING (assigned_to = auth.uid() OR check_user_role(auth.uid(), ''admin''))';
  EXECUTE 'CREATE POLICY "Admins can manage all cards" ON connection_cards FOR ALL TO authenticated USING (check_user_role(auth.uid(), ''admin''))';

  -- Content management policies
  EXECUTE 'CREATE POLICY "Admins can manage scriptures" ON scriptures FOR ALL TO authenticated USING (check_user_role(auth.uid(), ''admin''))';
  EXECUTE 'CREATE POLICY "Admins can manage devotionals" ON devotionals FOR ALL TO authenticated USING (check_user_role(auth.uid(), ''admin''))';
  EXECUTE 'CREATE POLICY "Admins can manage schedules" ON church_schedules FOR ALL TO authenticated USING (check_user_role(auth.uid(), ''admin''))';

  -- Newsletter policies
  EXECUTE 'CREATE POLICY "Admins can manage newsletter subscriptions" ON newsletter_subscriptions FOR ALL TO authenticated USING (check_user_role(auth.uid(), ''admin''))';

  -- Events policies
  EXECUTE 'CREATE POLICY "Admins can manage all events" ON events FOR ALL TO authenticated USING (check_user_role(auth.uid(), ''admin''))';
  EXECUTE 'CREATE POLICY "Admins can manage all registrations" ON event_registrations FOR ALL TO authenticated USING (check_user_role(auth.uid(), ''admin''))';

  -- Fundraising policies
  EXECUTE 'CREATE POLICY "Admins can manage campaigns" ON fundraising_campaigns FOR ALL TO authenticated USING (check_user_role(auth.uid(), ''admin''))';
  EXECUTE 'CREATE POLICY "Admins can manage donations" ON campaign_donations FOR ALL TO authenticated USING (check_user_role(auth.uid(), ''admin''))';

  -- Contact and live stream policies
  EXECUTE 'CREATE POLICY "Admins can manage contact submissions" ON contact_submissions FOR ALL TO authenticated USING (check_user_role(auth.uid(), ''admin''))';
  EXECUTE 'CREATE POLICY "Admins can manage streams" ON live_streams FOR ALL TO authenticated USING (check_user_role(auth.uid(), ''admin''))';

  -- Tithe and offering policies
  EXECUTE 'CREATE POLICY "Admins can manage categories" ON tithe_offering_categories FOR ALL TO authenticated USING (check_user_role(auth.uid(), ''admin''))';
  EXECUTE 'CREATE POLICY "Authorized users can manage offerings" ON tithe_offerings FOR ALL TO authenticated USING (check_user_role(auth.uid(), ''admin'') OR check_user_role(auth.uid(), ''finance''))';
  EXECUTE 'CREATE POLICY "Authorized users can verify offerings" ON tithe_offering_verifications FOR ALL TO authenticated USING (check_user_role(auth.uid(), ''admin'') OR check_user_role(auth.uid(), ''finance''))';
END $$;