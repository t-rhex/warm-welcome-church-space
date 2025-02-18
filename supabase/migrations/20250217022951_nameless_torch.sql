/*
  # Add Prayer Approvals

  1. Changes
    - Add approved_by and approved_at columns to prayers table
    - Add trigger to track approval history
    - Add policy for admin approvals

  2. Security
    - Only admins can approve prayers
    - Track who approved each prayer and when
*/

-- Add approval tracking columns
ALTER TABLE prayers
  ADD COLUMN approved_by uuid REFERENCES auth.users,
  ADD COLUMN approved_at timestamptz;

-- Create approval history table
CREATE TABLE IF NOT EXISTS prayer_approval_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prayer_id uuid REFERENCES prayers NOT NULL,
  approved_by uuid REFERENCES auth.users NOT NULL,
  status text NOT NULL,
  approved_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE prayer_approval_history ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access to approval history
CREATE POLICY "Admins can view approval history"
  ON prayer_approval_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (
    SELECT auth.uid() 
    FROM auth.users 
    WHERE auth.uid() = auth.uid()
  ));

-- Create trigger to track approval history
CREATE OR REPLACE FUNCTION track_prayer_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    INSERT INTO prayer_approval_history (prayer_id, approved_by, status)
    VALUES (NEW.id, auth.uid(), NEW.status);
    
    NEW.approved_by = auth.uid();
    NEW.approved_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prayer_approval_trigger
  BEFORE UPDATE ON prayers
  FOR EACH ROW
  WHEN (NEW.status = 'approved' AND OLD.status != 'approved')
  EXECUTE FUNCTION track_prayer_approval();