/*
  # Fix schedule functionality

  1. Changes
    - Drop and recreate church_schedules table with proper structure
    - Add proper indexes and constraints
    - Update RLS policies
    - Add HTML content validation

  2. Security
    - Enable RLS
    - Add admin-only management policies
    - Add public view policies
*/

-- Drop existing table if it exists
DROP TABLE IF EXISTS church_schedules CASCADE;

-- Create church schedules table
CREATE TABLE church_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  day_of_week text NOT NULL CHECK (day_of_week IN ('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')),
  start_time text NOT NULL,
  end_time text NOT NULL,
  location text NOT NULL,
  type text NOT NULL,
  is_recurring boolean DEFAULT true,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  content_sections jsonb[] DEFAULT ARRAY[]::jsonb[],
  meta_tags text[] DEFAULT ARRAY[]::text[],
  created_by uuid REFERENCES auth.users NOT NULL,
  last_modified_by uuid REFERENCES auth.users,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE church_schedules ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can view active schedules"
  ON church_schedules
  FOR SELECT
  TO public
  USING (status = 'active');

CREATE POLICY "Admins can manage schedules"
  ON church_schedules
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

-- Create indexes
CREATE INDEX idx_church_schedules_day ON church_schedules(day_of_week);
CREATE INDEX idx_church_schedules_status ON church_schedules(status);
CREATE INDEX idx_church_schedules_type ON church_schedules(type);

-- Create HTML content validation function
CREATE OR REPLACE FUNCTION validate_html_content(content text)
RETURNS boolean AS $$
BEGIN
  RETURN (
    content !~ '<script>' AND
    content !~ 'javascript:' AND
    content !~ 'onerror=' AND
    content !~ 'onload='
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create content validation trigger
CREATE OR REPLACE FUNCTION validate_schedule_content()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate description HTML
  IF NOT validate_html_content(NEW.description) THEN
    RAISE EXCEPTION 'Invalid HTML content in description';
  END IF;
  
  -- Set last modified information
  NEW.last_modified_by = auth.uid();
  NEW.updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_schedule_content_trigger
  BEFORE INSERT OR UPDATE ON church_schedules
  FOR EACH ROW
  EXECUTE FUNCTION validate_schedule_content();