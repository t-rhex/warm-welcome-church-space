/*
  # Update Prayer Wall Schema for Anonymous Submissions

  1. Changes to `prayers` table
    - Make `author_id` nullable
    - Add `author_name` (text) for anonymous submissions
    - Add `author_email` (text) for optional contact
  
  2. Security
    - Update RLS policies to allow anonymous submissions
    - Maintain privacy controls
*/

-- Modify prayers table
ALTER TABLE prayers
  ALTER COLUMN author_id DROP NOT NULL,
  ADD COLUMN author_name text,
  ADD COLUMN author_email text;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create their own prayers" ON prayers;
DROP POLICY IF EXISTS "Users can view their own prayers" ON prayers;
DROP POLICY IF EXISTS "Users can view public prayers on wall" ON prayers;
DROP POLICY IF EXISTS "Users can update their own prayers" ON prayers;

-- Create new policies
-- Anyone can create prayers
CREATE POLICY "Anyone can create prayers"
  ON prayers
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Users can view their own prayers
CREATE POLICY "Users can view their own prayers"
  ON prayers
  FOR SELECT
  TO authenticated
  USING (
    (auth.uid() = author_id) OR 
    (is_public = true AND show_on_wall = true AND status = 'approved')
  );

-- Anonymous users can view approved public prayers
CREATE POLICY "Anonymous users can view approved public prayers"
  ON prayers
  FOR SELECT
  TO public
  USING (is_public = true AND show_on_wall = true AND status = 'approved');

-- Users can update their own prayers
CREATE POLICY "Users can update their own prayers"
  ON prayers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);