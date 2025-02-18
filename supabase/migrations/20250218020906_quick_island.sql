/*
  # Fix ambiguous column references

  1. Updates
    - Drop and recreate policies with explicit table references
    - Update has_role function with proper parameter naming
  
  2. Changes
    - Fixes ambiguous user_id references in policies
    - Properly handles function replacement
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view their own prayers" ON prayers;
DROP POLICY IF EXISTS "Users can manage their own interactions" ON prayer_interactions;

-- Drop existing function first
DROP FUNCTION IF EXISTS has_role(uuid, text);

-- Recreate function with proper parameter naming
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

-- Recreate policies with explicit table references
CREATE POLICY "Users can view their own roles"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (user_roles.user_id = auth.uid());

-- Update prayers policies
CREATE POLICY "Users can view their own prayers"
  ON prayers
  FOR SELECT
  TO authenticated
  USING (
    prayers.author_id = auth.uid() OR
    (prayers.is_public = true AND prayers.show_on_wall = true AND prayers.status = 'approved')
  );

-- Update prayer interactions policies
CREATE POLICY "Users can manage their own interactions"
  ON prayer_interactions
  FOR ALL
  TO authenticated
  USING (prayer_interactions.user_id = auth.uid())
  WITH CHECK (prayer_interactions.user_id = auth.uid());