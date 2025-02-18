/*
  # Fix roles and policies

  1. Changes
    - Drops all existing policies
    - Drops existing has_role function
    - Creates new check_user_role function
    - Recreates all policies with new function
  
  2. Security
    - Maintains RLS
    - Preserves role-based access control
*/

-- First drop all dependent policies
DO $$ 
BEGIN
  -- Drop all existing policies
  DROP POLICY IF EXISTS "Admins can manage roles" ON roles;
  DROP POLICY IF EXISTS "Users can view roles" ON roles;
  DROP POLICY IF EXISTS "Admins can manage user roles" ON user_roles;
  DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
  DROP POLICY IF EXISTS "Admins can manage announcements" ON announcements;
  DROP POLICY IF EXISTS "Admins can manage all prayers" ON prayers;
  DROP POLICY IF EXISTS "Users can view their own prayers" ON prayers;
  DROP POLICY IF EXISTS "Users can manage their own interactions" ON prayer_interactions;
  DROP POLICY IF EXISTS "Admins can manage approval history" ON prayer_approval_history;
  DROP POLICY IF EXISTS "Admins can manage donations" ON donations;
  DROP POLICY IF EXISTS "Admins can manage meetings" ON meetings;
  DROP POLICY IF EXISTS "Staff can view assigned cards" ON connection_cards;
  DROP POLICY IF EXISTS "Admins can manage all cards" ON connection_cards;
  DROP POLICY IF EXISTS "Admins can manage scriptures" ON scriptures;
  DROP POLICY IF EXISTS "Admins can manage devotionals" ON devotionals;
  DROP POLICY IF EXISTS "Admins can manage schedules" ON church_schedules;
  DROP POLICY IF EXISTS "Admins can manage newsletter subscriptions" ON newsletter_subscriptions;
  DROP POLICY IF EXISTS "Admins can manage all events" ON events;
  DROP POLICY IF EXISTS "Admins can manage all registrations" ON event_registrations;
  DROP POLICY IF EXISTS "Admins can manage campaigns" ON fundraising_campaigns;
  DROP POLICY IF EXISTS "Admins can manage donations" ON campaign_donations;
  DROP POLICY IF EXISTS "Admins can manage contact submissions" ON contact_submissions;
  DROP POLICY IF EXISTS "Admins can manage streams" ON live_streams;
  DROP POLICY IF EXISTS "Admins can manage categories" ON tithe_offering_categories;
  DROP POLICY IF EXISTS "Authorized users can manage offerings" ON tithe_offerings;
  DROP POLICY IF EXISTS "Authorized users can verify offerings" ON tithe_offering_verifications;
END $$;

-- Drop existing function
DROP FUNCTION IF EXISTS has_role(uuid, text) CASCADE;

-- Create new role checking function
CREATE OR REPLACE FUNCTION check_user_role(check_user_id uuid, check_role_name text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = check_user_id
    AND r.name = check_role_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- Recreate all other policies with new function
DO $$ 
BEGIN
  -- Announcements policies
  EXECUTE 'CREATE POLICY "Admins can manage announcements" ON announcements FOR ALL TO authenticated USING (check_user_role(auth.uid(), ''admin''))';

  -- Prayers and related policies
  EXECUTE 'CREATE POLICY "Admins can manage all prayers" ON prayers FOR ALL TO authenticated USING (check_user_role(auth.uid(), ''admin''))';
  EXECUTE 'CREATE POLICY "Users can view their own prayers" ON prayers FOR SELECT TO authenticated USING (author_id = auth.uid() OR (is_public = true AND show_on_wall = true AND status = ''approved''))';
  EXECUTE 'CREATE POLICY "Users can manage their own interactions" ON prayer_interactions FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid())';
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