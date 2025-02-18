/*
  # Create announcements system

  1. New Tables
    - `announcements`
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `show_in_banner` (boolean)
      - `start_date` (timestamptz)
      - `end_date` (timestamptz)
      - `created_by` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `status` (text) - active/inactive
      - `priority` (integer)
      - `link` (text)
      - `link_text` (text)

  2. Security
    - Enable RLS
    - Add policies for admins and public access
*/

-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  show_in_banner boolean DEFAULT false,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  created_by uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  priority integer DEFAULT 0,
  link text,
  link_text text
);

-- Enable RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Public can view active announcements
CREATE POLICY "Public can view active announcements"
  ON announcements
  FOR SELECT
  TO public
  USING (
    status = 'active' 
    AND start_date <= now() 
    AND end_date >= now()
  );

-- Admins can manage all announcements
CREATE POLICY "Admins can manage announcements"
  ON announcements
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Create updated_at trigger
CREATE TRIGGER announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();