/*
  # Create church schedules table

  1. New Tables
    - `church_schedules`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `day_of_week` (text)
      - `start_time` (text)
      - `end_time` (text)
      - `location` (text)
      - `type` (text)
      - `is_recurring` (boolean)
      - `status` (text)
      - `created_by` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `church_schedules` table
    - Add policies for public viewing and admin management
*/

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
  created_by uuid REFERENCES auth.users NOT NULL,
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

-- Create updated_at trigger
CREATE TRIGGER update_church_schedules_updated_at
  BEFORE UPDATE ON church_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();