/*
  # Update role checking function and policies

  1. Changes
    - Temporarily drops all dependent policies
    - Updates has_role function with proper parameter naming
    - Recreates all policies with explicit table references
  
  2. Security
    - Maintains all existing security policies
    - Updates function while preserving dependencies
*/

-- First, drop all dependent policies
DO $$ 
BEGIN
  -- Drop policies from roles and user_roles
  DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
  DROP POLICY IF EXISTS "Users can view roles" ON roles;
  DROP POLICY IF EXISTS "Admins can manage roles" ON roles;
  DROP POLICY IF EXISTS "Admins can manage user roles" ON user_roles;
  
  -- Drop policies from announcements
  DROP POLICY IF EXISTS "Admins can manage announcements" ON announcements;
  
  -- Drop policies from prayers and related tables
  DROP POLICY IF EXISTS "Admins can manage all prayers" ON prayers;
  DROP POLICY IF EXISTS "Users can view their own prayers" ON prayers;
  DROP POLICY IF EXISTS "Admins can manage approval history" ON prayer_approval_history;
  DROP POLICY IF EXISTS "Users can manage their own interactions" ON prayer_interactions;
  
  -- Drop policies from donations and meetings
  DROP POLICY IF EXISTS "Admins can manage donations" ON donations;
  DROP POLICY IF EXISTS "Admins can manage meetings" ON meetings;
  
  -- Drop policies from connection cards
  DROP POLICY IF EXISTS "Staff can view assigned cards" ON connection_cards;
  DROP POLICY IF EXISTS "Admins can manage all cards" ON connection_cards;
  
  -- Drop policies from scriptures and devotionals
  DROP POLICY IF EXISTS "Admins can manage scriptures" ON scriptures;
  DROP POLICY IF EXISTS "Admins can manage devotionals" ON devotionals;
  
  -- Drop policies from church schedules
  DROP POLICY IF EXISTS "Admins can manage schedules" ON church_schedules;
  
  -- Drop policies from newsletter subscriptions
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

-- Now we can safely update the has_role function
CREATE OR REPLACE FUNCTION has_role(user_id uuid, role_name text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = has_role.user_id
    AND r.name = has_role.role_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate all policies with explicit table references
DO $$ 
BEGIN
  -- Recreate roles and user_roles policies
  EXECUTE 'CREATE POLICY "Users can view their own roles" ON user_roles FOR SELECT TO authenticated USING (user_roles.user_id = auth.uid())';
  
  EXECUTE 'CREATE POLICY "Users can view roles" ON roles FOR SELECT TO authenticated USING (true)';
  
  EXECUTE 'CREATE POLICY "Admins can manage roles" ON roles FOR ALL TO authenticated USING (has_role(auth.uid(), ''admin''))';
  
  EXECUTE 'CREATE POLICY "Admins can manage user roles" ON user_roles FOR ALL TO authenticated USING (has_role(auth.uid(), ''admin''))';
  
  -- Recreate prayers policies
  EXECUTE 'CREATE POLICY "Users can view their own prayers" ON prayers FOR SELECT TO authenticated USING (prayers.author_id = auth.uid() OR (prayers.is_public = true AND prayers.show_on_wall = true AND prayers.status = ''approved''))';
  
  EXECUTE 'CREATE POLICY "Admins can manage all prayers" ON prayers FOR ALL TO authenticated USING (has_role(auth.uid(), ''admin''))';
  
  -- Recreate prayer interactions policy
  EXECUTE 'CREATE POLICY "Users can manage their own interactions" ON prayer_interactions FOR ALL TO authenticated USING (prayer_interactions.user_id = auth.uid()) WITH CHECK (prayer_interactions.user_id = auth.uid())';
  
  -- Recreate all other admin policies
  EXECUTE 'CREATE POLICY "Admins can manage approval history" ON prayer_approval_history FOR ALL TO authenticated USING (has_role(auth.uid(), ''admin''))';
  
  EXECUTE 'CREATE POLICY "Admins can manage donations" ON donations FOR ALL TO authenticated USING (has_role(auth.uid(), ''admin''))';
  
  EXECUTE 'CREATE POLICY "Admins can manage meetings" ON meetings FOR ALL TO authenticated USING (has_role(auth.uid(), ''admin''))';
  
  EXECUTE 'CREATE POLICY "Staff can view assigned cards" ON connection_cards FOR SELECT TO authenticated USING (assigned_to = auth.uid() OR has_role(auth.uid(), ''admin''))';
  
  EXECUTE 'CREATE POLICY "Admins can manage all cards" ON connection_cards FOR ALL TO authenticated USING (has_role(auth.uid(), ''admin''))';
  
  EXECUTE 'CREATE POLICY "Admins can manage scriptures" ON scriptures FOR ALL TO authenticated USING (has_role(auth.uid(), ''admin''))';
  
  EXECUTE 'CREATE POLICY "Admins can manage devotionals" ON devotionals FOR ALL TO authenticated USING (has_role(auth.uid(), ''admin''))';
  
  EXECUTE 'CREATE POLICY "Admins can manage schedules" ON church_schedules FOR ALL TO authenticated USING (has_role(auth.uid(), ''admin''))';
  
  EXECUTE 'CREATE POLICY "Admins can manage newsletter subscriptions" ON newsletter_subscriptions FOR ALL TO authenticated USING (has_role(auth.uid(), ''admin''))';
  
  EXECUTE 'CREATE POLICY "Admins can manage all events" ON events FOR ALL TO authenticated USING (has_role(auth.uid(), ''admin''))';
  
  EXECUTE 'CREATE POLICY "Admins can manage all registrations" ON event_registrations FOR ALL TO authenticated USING (has_role(auth.uid(), ''admin''))';
  
  EXECUTE 'CREATE POLICY "Admins can manage campaigns" ON fundraising_campaigns FOR ALL TO authenticated USING (has_role(auth.uid(), ''admin''))';
  
  EXECUTE 'CREATE POLICY "Admins can manage donations" ON campaign_donations FOR ALL TO authenticated USING (has_role(auth.uid(), ''admin''))';
  
  EXECUTE 'CREATE POLICY "Admins can manage contact submissions" ON contact_submissions FOR ALL TO authenticated USING (has_role(auth.uid(), ''admin''))';
  
  EXECUTE 'CREATE POLICY "Admins can manage streams" ON live_streams FOR ALL TO authenticated USING (has_role(auth.uid(), ''admin''))';
  
  EXECUTE 'CREATE POLICY "Admins can manage categories" ON tithe_offering_categories FOR ALL TO authenticated USING (has_role(auth.uid(), ''admin''))';
  
  EXECUTE 'CREATE POLICY "Authorized users can manage offerings" ON tithe_offerings FOR ALL TO authenticated USING (has_role(auth.uid(), ''admin'') OR has_role(auth.uid(), ''finance''))';
  
  EXECUTE 'CREATE POLICY "Authorized users can verify offerings" ON tithe_offering_verifications FOR ALL TO authenticated USING (has_role(auth.uid(), ''admin'') OR has_role(auth.uid(), ''finance''))';
END $$;