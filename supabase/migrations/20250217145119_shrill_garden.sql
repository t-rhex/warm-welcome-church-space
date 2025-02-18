/*
  # Add Donations and Meetings Tables

  1. New Tables
    - donations: For donation requests
    - meetings: For meeting hosting requests
    
  2. Security
    - Enable RLS
    - Add policies for public submissions
    - Add policies for admin management
*/

-- Create donations table
CREATE TABLE donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  goal_amount decimal(10,2) NOT NULL,
  current_amount decimal(10,2) DEFAULT 0,
  category text NOT NULL,
  requester_name text NOT NULL,
  requester_email text NOT NULL,
  requester_phone text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  is_public boolean DEFAULT false,
  approved_by uuid REFERENCES auth.users,
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  end_date timestamptz,
  supporting_documents text[]
);

-- Create meetings table
CREATE TABLE meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  organizer_name text NOT NULL,
  organizer_email text NOT NULL,
  organizer_phone text,
  expected_attendees integer,
  meeting_date timestamptz NOT NULL,
  duration_minutes integer NOT NULL,
  room_preference text,
  equipment_needed text[],
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  approved_by uuid REFERENCES auth.users,
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  notes text
);

-- Enable RLS
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- Create policies for donations
CREATE POLICY "Anyone can submit donation requests"
  ON donations
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can view approved donations"
  ON donations
  FOR SELECT
  TO public
  USING (
    status = 'approved' 
    AND is_public = true
  );

CREATE POLICY "Admins can manage donations"
  ON donations
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

-- Create policies for meetings
CREATE POLICY "Anyone can submit meeting requests"
  ON meetings
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can manage meetings"
  ON meetings
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
CREATE INDEX idx_donations_status ON donations(status);
CREATE INDEX idx_donations_public ON donations(is_public) WHERE is_public = true;
CREATE INDEX idx_meetings_status ON meetings(status);
CREATE INDEX idx_meetings_date ON meetings(meeting_date);

-- Create updated_at triggers
CREATE TRIGGER update_donations_updated_at
  BEFORE UPDATE ON donations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meetings_updated_at
  BEFORE UPDATE ON meetings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();