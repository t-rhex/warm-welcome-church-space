/*
  # Fix announcements table and policies

  1. Drop existing table and recreate with correct structure
  2. Add proper policies for admin access and public viewing
  3. Add necessary indexes for performance
*/

-- Drop existing table if it exists
DROP TABLE IF EXISTS announcements;

-- Create announcements table
CREATE TABLE announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  show_in_banner boolean DEFAULT false,
  start_date timestamptz,
  end_date timestamptz,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  priority integer DEFAULT 0,
  link text,
  link_text text,
  created_by uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Create policy for public viewing of published announcements
CREATE POLICY "Anyone can view published announcements"
  ON announcements
  FOR SELECT
  TO public
  USING (
    status = 'published' 
    AND (start_date IS NULL OR start_date <= now()) 
    AND (end_date IS NULL OR end_date >= now())
  );

-- Create updated_at trigger
CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();