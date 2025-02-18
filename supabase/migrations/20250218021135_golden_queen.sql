/*
  # Fix roles and policies

  1. Changes
    - Drops all dependent policies first
    - Recreates roles and user_roles tables
    - Updates has_role function with proper parameter naming
    - Recreates all policies
  
  2. Security
    - Maintains RLS
    - Preserves role-based access control
*/

-- First drop all dependent policies
DO $$ 
BEGIN
  -- Drop all existing policies that depend on has_role
  EXECUTE 'DROP POLICY IF EXISTS "Admins can manage roles" ON roles';
  EXECUTE 'DROP POLICY IF EXISTS "Admins can manage user roles" ON user_roles';
  EXECUTE 'DROP POLICY IF EXISTS "Admins can manage announcements" ON announcements';
  EXECUTE 'DROP POLICY IF EXISTS "Admins can manage all prayers" ON prayers';
  EXECUTE 'DROP POLICY IF EXISTS "Admins can manage approval history" ON prayer_approval_history';
  EXECUTE 'DROP POLICY IF EXISTS "Admins can manage donations" ON donations';
  EXECUTE 'DROP POLICY IF EXISTS "Admins can manage meetings" ON meetings';
  EXECUTE 'DROP POLICY IF EXISTS "Staff can view assigned cards" ON connection_cards';
  EXECUTE 'DROP POLICY IF EXISTS "Admins can manage all cards" ON connection_cards';
  EXECUTE 'DROP POLICY IF EXISTS "Admins can manage scriptures" ON scriptures';
  EXECUTE 'DROP POLICY IF EXISTS "Admins can manage devotionals" ON devotionals';
  EXECUTE 'DROP POLICY IF EXISTS "Admins can manage schedules" ON church_schedules';
  EXECUTE 'DROP POLICY IF EXISTS "Admins can manage newsletter subscriptions" ON newsletter_subscriptions';
  EXECUTE 'DROP POLICY IF EXISTS "Admins can manage all events" ON events';
  EXECUTE 'DROP POLICY IF EXISTS "Admins can manage all registrations" ON event_registrations';
  EXECUTE 'DROP POLICY IF EXISTS "Admins can manage campaigns" ON fundraising_campaigns';
  EXECUTE 'DROP POLICY IF EXISTS "Admins can manage donations" ON campaign_donations';
  EXECUTE 'DROP POLICY IF EXISTS "Admins can manage contact submissions" ON contact_submissions';
  EXECUTE 'DROP POLICY IF EXISTS "Admins can manage streams" ON live_streams';
  EXECUTE 'DROP POLICY IF EXISTS "Admins can manage categories" ON tithe_offering_categories';
  EXECUTE 'DROP POLICY IF EXISTS "Authorized users can manage offerings" ON tithe_offerings';
  EXECUTE 'DROP POLICY IF EXISTS "Authorized users can verify offerings" ON tithe_offering_verifications';
END $$;

-- Drop and recreate the has_role function with proper parameter naming
DROP FUNCTION IF EXISTS has_role(uuid, text);

CREATE OR REPLACE FUNCTION has_role(input_user_id uuid, input_role_name text)
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

-- Recreate all policies
DO $$ 
BEGIN
  -- Roles and user_roles policies
  EXECUTE 'CREATE POLICY "Admins can manage roles" ON roles FOR ALL TO authenticated USING (has_role(auth.uid(), ''admin''))';
  EXECUTE 'CREATE POLICY "Users can view roles" ON roles FOR SELECT TO authenticated USING (true)';
  EXECUTE 'CREATE POLICY "Admins can manage user roles" ON user_roles FOR ALL TO authenticated USING (has_role(auth.uid(), ''admin''))';
  EXECUTE 'CREATE POLICY "Users can view their own roles" ON user_roles FOR SELECT TO authenticated USING (user_id = auth.uid())';

  -- Announcements policies
  EXECUTE 'CREATE POLICY "Admins can manage announcements" ON announcements FOR ALL TO authenticated USING (has_role(auth.uid(), ''admin''))';

  -- Prayers and related policies
  EXECUTE 'CREATE POLICY "Admins can manage all prayers" ON prayers FOR ALL TO authenticated USING (has_role(auth.uid(), ''admin''))';
  EXECUTE 'CREATE POLICY "Admins can manage approval history" ON prayer_approval_history FOR ALL TO authenticated USING (has_role(auth.uid(), ''admin''))';

  -- Donations and meetings policies
  EXECUTE 'CREATE POLICY "Admins can manage donations" ON donations FOR ALL TO authenticated USING (has_role(auth.uid(), ''admin''))';
  EXECUTE 'CREATE POLICY "Admins can manage meetings" ON meetings FOR ALL TO authenticated USING (has_role(auth.uid(), ''admin''))';

  -- Connection cards policies
  EXECUTE 'CREATE POLICY "Staff can view assigned cards" ON connection_cards FOR SELECT TO authenticated USING (assigned_to = auth.uid() OR has_role(auth.uid(), ''admin''))';
  EXECUTE 'CREATE POLICY "Admins can manage all cards" ON connection_cards FOR ALL TO authenticated USING (has_role(auth.uid(), ''admin''))';

  -- Content management policies
  EXECUTE 'CREATE POLICY "Admins can manage scriptures" ON scriptures FOR ALL TO authenticated USING (has_role(auth.uid(), ''admin''))';
  EXECUTE 'CREATE POLICY "Admins can manage devotionals" ON devotionals FOR ALL TO authenticated USING (has_role(auth.uid(), ''admin''))';
  EXECUTE 'CREATE POLICY "Admins can manage schedules" ON church_schedules FOR ALL TO authenticated USING (has_role(auth.uid(), ''admin''))';

  -- Newsletter policies
  EXECUTE 'CREATE POLICY "Admins can manage newsletter subscriptions" ON newsletter_subscriptions FOR ALL TO authenticated USING (has_role(auth.uid(), ''admin''))';

  -- Events policies
  EXECUTE 'CREATE POLICY "Admins can manage all events" ON events FOR ALL TO authenticated USING (has_role(auth.uid(), ''admin''))';
  EXECUTE 'CREATE POLICY "Admins can manage all registrations" ON event_registrations FOR ALL TO authenticated USING (has_role(auth.uid(), ''admin''))';

  -- Fundraising policies
  EXECUTE 'CREATE POLICY "Admins can manage campaigns" ON fundraising_campaigns FOR ALL TO authenticated USING (has_role(auth.uid(), ''admin''))';
  EXECUTE 'CREATE POLICY "Admins can manage donations" ON campaign_donations FOR ALL TO authenticated USING (has_role(auth.uid(), ''admin''))';

  -- Contact and live stream policies
  EXECUTE 'CREATE POLICY "Admins can manage contact submissions" ON contact_submissions FOR ALL TO authenticated USING (has_role(auth.uid(), ''admin''))';
  EXECUTE 'CREATE POLICY "Admins can manage streams" ON live_streams FOR ALL TO authenticated USING (has_role(auth.uid(), ''admin''))';

  -- Tithe and offering policies
  EXECUTE 'CREATE POLICY "Admins can manage categories" ON tithe_offering_categories FOR ALL TO authenticated USING (has_role(auth.uid(), ''admin''))';
  EXECUTE 'CREATE POLICY "Authorized users can manage offerings" ON tithe_offerings FOR ALL TO authenticated USING (has_role(auth.uid(), ''admin'') OR has_role(auth.uid(), ''finance''))';
  EXECUTE 'CREATE POLICY "Authorized users can verify offerings" ON tithe_offering_verifications FOR ALL TO authenticated USING (has_role(auth.uid(), ''admin'') OR has_role(auth.uid(), ''finance''))';
END $$;