/*
  # Scripture of the Week Table

  1. New Tables
    - `scriptures`
      - `id` (uuid, primary key)
      - `verse_text` (text, the scripture text)
      - `verse_reference` (text, e.g., "Jeremiah 29:11")
      - `start_date` (timestamptz, when to start showing)
      - `end_date` (timestamptz, when to stop showing)
      - `status` (text, active/inactive)
      - `created_by` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for admin management
    - Add policy for public viewing
*/

-- Create scriptures table
CREATE TABLE scriptures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  verse_text text NOT NULL,
  verse_reference text NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_by uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE scriptures ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can view active scriptures"
  ON scriptures
  FOR SELECT
  TO public
  USING (
    status = 'active'
    AND start_date <= now()
    AND end_date >= now()
  );

CREATE POLICY "Admins can manage scriptures"
  ON scriptures
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
CREATE INDEX idx_scriptures_dates ON scriptures(start_date, end_date);
CREATE INDEX idx_scriptures_status ON scriptures(status);

-- Create updated_at trigger
CREATE TRIGGER update_scriptures_updated_at
  BEFORE UPDATE ON scriptures
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();