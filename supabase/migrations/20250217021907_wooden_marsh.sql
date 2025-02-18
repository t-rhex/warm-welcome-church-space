/*
  # Prayer Wall Schema

  1. New Tables
    - `prayers`
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `author_id` (uuid, references auth.users)
      - `is_public` (boolean)
      - `show_on_wall` (boolean)
      - `prayer_count` (integer)
      - `status` (text) - 'pending', 'approved', 'completed'
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
  2. Security
    - Enable RLS on `prayers` table
    - Add policies for:
      - Users can create their own prayers
      - Users can view their own prayers
      - Users can view public prayers on the wall
      - Admins can view and manage all prayers
*/

-- Create prayers table
CREATE TABLE IF NOT EXISTS prayers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  author_id uuid REFERENCES auth.users NOT NULL,
  is_public boolean DEFAULT false,
  show_on_wall boolean DEFAULT false,
  prayer_count integer DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE prayers ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can create their own prayers
CREATE POLICY "Users can create their own prayers"
  ON prayers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- Users can view their own prayers
CREATE POLICY "Users can view their own prayers"
  ON prayers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = author_id);

-- Users can view public prayers on the wall
CREATE POLICY "Users can view public prayers on wall"
  ON prayers
  FOR SELECT
  TO authenticated
  USING (is_public = true AND show_on_wall = true AND status = 'approved');

-- Users can update their own prayers
CREATE POLICY "Users can update their own prayers"
  ON prayers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Admins can view and manage all prayers
CREATE POLICY "Admins can manage all prayers"
  ON prayers
  FOR ALL
  TO admin
  USING (true);

-- Function to update prayer count
CREATE OR REPLACE FUNCTION increment_prayer_count(prayer_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE prayers
  SET prayer_count = prayer_count + 1
  WHERE id = prayer_id;
END;
$$ LANGUAGE plpgsql;