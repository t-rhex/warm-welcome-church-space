/*
  # Fix Prayer Request Policies

  1. Changes
    - Drop existing policies
    - Create new policies with proper role checks
    - Add indexes for better performance
    
  2. Security
    - Admins can manage all prayers
    - Users can view their own prayers
    - Public can view approved public prayers
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can manage all prayers" ON prayers;
DROP POLICY IF EXISTS "Users can view their own prayers" ON prayers;
DROP POLICY IF EXISTS "Users can view public prayers on wall" ON prayers;
DROP POLICY IF EXISTS "Anyone can create prayers" ON prayers;
DROP POLICY IF EXISTS "Anonymous users can view approved public prayers" ON prayers;
DROP POLICY IF EXISTS "Users can update their own prayers" ON prayers;

-- Create new policies
-- Admin policy
CREATE POLICY "Admins can manage all prayers"
  ON prayers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name = 'admin'
    )
  );

-- User policies
CREATE POLICY "Users can view their own prayers"
  ON prayers
  FOR SELECT
  TO authenticated
  USING (
    author_id = auth.uid() OR
    (is_public = true AND show_on_wall = true AND status = 'approved')
  );

CREATE POLICY "Users can create prayers"
  ON prayers
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can update their own prayers"
  ON prayers
  FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

-- Public policy
CREATE POLICY "Public can view approved prayers"
  ON prayers
  FOR SELECT
  TO public
  USING (
    is_public = true 
    AND show_on_wall = true 
    AND status = 'approved'
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_prayers_status ON prayers(status);
CREATE INDEX IF NOT EXISTS idx_prayers_author ON prayers(author_id);
CREATE INDEX IF NOT EXISTS idx_prayers_public ON prayers(is_public, show_on_wall, status) WHERE is_public = true;