-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS assign_default_role_trigger ON auth.users;

-- Create temporary roles table
CREATE TABLE roles_new (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create temporary user_roles table
CREATE TABLE user_roles_new (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  role_id uuid REFERENCES roles_new NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role_id)
);

-- Copy data from existing tables if they exist
INSERT INTO roles_new (id, name, description, created_at)
SELECT id, name, description, created_at
FROM roles
ON CONFLICT (name) DO NOTHING;

INSERT INTO user_roles_new (id, user_id, role_id, created_at)
SELECT id, user_id, role_id, created_at
FROM user_roles
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Drop existing policies that depend on the tables
DO $$ 
BEGIN
  -- Drop policies from announcements
  DROP POLICY IF EXISTS "Admins can manage announcements" ON announcements;
  DROP POLICY IF EXISTS "Admins can insert announcements" ON announcements;
  
  -- Drop policies from prayers
  DROP POLICY IF EXISTS "Admins can manage all prayers" ON prayers;
  
  -- Drop policies from prayer_approval_history
  DROP POLICY IF EXISTS "Admins can manage approval history" ON prayer_approval_history;
  
  -- Drop policies from donations and meetings
  DROP POLICY IF EXISTS "Admins can manage donations" ON donations;
  DROP POLICY IF EXISTS "Admins can manage meetings" ON meetings;
  
  -- Drop policies from connection_cards
  DROP POLICY IF EXISTS "Staff can view assigned cards" ON connection_cards;
  DROP POLICY IF EXISTS "Admins can manage all cards" ON connection_cards;
  
  -- Drop policies from scriptures and devotionals
  DROP POLICY IF EXISTS "Admins can manage scriptures" ON scriptures;
  DROP POLICY IF EXISTS "Admins can manage devotionals" ON devotionals;
  
  -- Drop policies from church_schedules
  DROP POLICY IF EXISTS "Admins can manage schedules" ON church_schedules;
  
  -- Drop policies from newsletter_subscriptions
  DROP POLICY IF EXISTS "Admins can manage newsletter subscriptions" ON newsletter_subscriptions;
  
  -- Drop policies from events and registrations
  DROP POLICY IF EXISTS "Admins can manage all events" ON events;
  DROP POLICY IF EXISTS "Admins can manage all registrations" ON event_registrations;
  
  -- Drop policies from fundraising
  DROP POLICY IF EXISTS "Admins can manage campaigns" ON fundraising_campaigns;
  DROP POLICY IF EXISTS "Admins can manage donations" ON campaign_donations;
  
  -- Drop policies from contact submissions
  DROP POLICY IF EXISTS "Admins can manage contact submissions" ON contact_submissions;
  
  -- Drop policies from live streams
  DROP POLICY IF EXISTS "Admins can manage streams" ON live_streams;
  
  -- Drop policies from tithe offerings
  DROP POLICY IF EXISTS "Admins can manage categories" ON tithe_offering_categories;
  DROP POLICY IF EXISTS "Authorized users can manage offerings" ON tithe_offerings;
  DROP POLICY IF EXISTS "Authorized users can verify offerings" ON tithe_offering_verifications;
END $$;

-- Drop existing tables
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- Rename temporary tables to final names
ALTER TABLE roles_new RENAME TO roles;
ALTER TABLE user_roles_new RENAME TO user_roles;

-- Enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Insert default roles
INSERT INTO roles (name, description) VALUES
  ('admin', 'Full access to all features and management capabilities'),
  ('member', 'Standard member access'),
  ('finance', 'Access to financial features')
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
  IF member_role_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role_id)
    VALUES (NEW.id, member_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;
  END IF;
  
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

-- Recreate policies for other tables
DO $$ 
BEGIN
  -- Recreate policies for announcements
  CREATE POLICY "Admins can manage announcements"
    ON announcements
    FOR ALL
    TO authenticated
    USING (has_role(auth.uid(), 'admin'));

  -- Recreate policies for prayers
  CREATE POLICY "Admins can manage all prayers"
    ON prayers
    FOR ALL
    TO authenticated
    USING (has_role(auth.uid(), 'admin'));

  -- Recreate policies for prayer approval history
  CREATE POLICY "Admins can manage approval history"
    ON prayer_approval_history
    FOR ALL
    TO authenticated
    USING (has_role(auth.uid(), 'admin'));

  -- Recreate policies for donations and meetings
  CREATE POLICY "Admins can manage donations"
    ON donations
    FOR ALL
    TO authenticated
    USING (has_role(auth.uid(), 'admin'));

  CREATE POLICY "Admins can manage meetings"
    ON meetings
    FOR ALL
    TO authenticated
    USING (has_role(auth.uid(), 'admin'));

  -- Recreate policies for connection cards
  CREATE POLICY "Staff can view assigned cards"
    ON connection_cards
    FOR SELECT
    TO authenticated
    USING (
      assigned_to = auth.uid() OR
      has_role(auth.uid(), 'admin')
    );

  CREATE POLICY "Admins can manage all cards"
    ON connection_cards
    FOR ALL
    TO authenticated
    USING (has_role(auth.uid(), 'admin'));

  -- Recreate policies for scriptures and devotionals
  CREATE POLICY "Admins can manage scriptures"
    ON scriptures
    FOR ALL
    TO authenticated
    USING (has_role(auth.uid(), 'admin'));

  CREATE POLICY "Admins can manage devotionals"
    ON devotionals
    FOR ALL
    TO authenticated
    USING (has_role(auth.uid(), 'admin'));

  -- Recreate policies for church schedules
  CREATE POLICY "Admins can manage schedules"
    ON church_schedules
    FOR ALL
    TO authenticated
    USING (has_role(auth.uid(), 'admin'));

  -- Recreate policies for newsletter subscriptions
  CREATE POLICY "Admins can manage newsletter subscriptions"
    ON newsletter_subscriptions
    FOR ALL
    TO authenticated
    USING (has_role(auth.uid(), 'admin'));

  -- Recreate policies for events and registrations
  CREATE POLICY "Admins can manage all events"
    ON events
    FOR ALL
    TO authenticated
    USING (has_role(auth.uid(), 'admin'));

  CREATE POLICY "Admins can manage all registrations"
    ON event_registrations
    FOR ALL
    TO authenticated
    USING (has_role(auth.uid(), 'admin'));

  -- Recreate policies for fundraising
  CREATE POLICY "Admins can manage campaigns"
    ON fundraising_campaigns
    FOR ALL
    TO authenticated
    USING (has_role(auth.uid(), 'admin'));

  CREATE POLICY "Admins can manage donations"
    ON campaign_donations
    FOR ALL
    TO authenticated
    USING (has_role(auth.uid(), 'admin'));

  -- Recreate policies for contact submissions
  CREATE POLICY "Admins can manage contact submissions"
    ON contact_submissions
    FOR ALL
    TO authenticated
    USING (has_role(auth.uid(), 'admin'));

  -- Recreate policies for live streams
  CREATE POLICY "Admins can manage streams"
    ON live_streams
    FOR ALL
    TO authenticated
    USING (has_role(auth.uid(), 'admin'));

  -- Recreate policies for tithe offerings
  CREATE POLICY "Admins can manage categories"
    ON tithe_offering_categories
    FOR ALL
    TO authenticated
    USING (has_role(auth.uid(), 'admin'));

  CREATE POLICY "Authorized users can manage offerings"
    ON tithe_offerings
    FOR ALL
    TO authenticated
    USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'finance'));

  CREATE POLICY "Authorized users can verify offerings"
    ON tithe_offering_verifications
    FOR ALL
    TO authenticated
    USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'finance'));
END $$;