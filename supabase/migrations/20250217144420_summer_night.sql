/*
  # Fix Prayer Approval History Policies

  1. Changes
    - Drop existing policies
    - Create new policies with proper role checks
    - Add indexes for better performance
    
  2. Security
    - Admins can manage approval history
    - Automatic tracking of prayer approvals
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view approval history" ON prayer_approval_history;

-- Create new policies
CREATE POLICY "Admins can manage approval history"
  ON prayer_approval_history
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

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_prayer_approval_history_prayer ON prayer_approval_history(prayer_id);
CREATE INDEX IF NOT EXISTS idx_prayer_approval_history_approver ON prayer_approval_history(approved_by);

-- Drop and recreate the trigger to handle approval history
DROP TRIGGER IF EXISTS prayer_approval_trigger ON prayers;
DROP FUNCTION IF EXISTS track_prayer_approval();

CREATE OR REPLACE FUNCTION track_prayer_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    INSERT INTO prayer_approval_history (
      prayer_id,
      approved_by,
      status
    ) VALUES (
      NEW.id,
      NEW.approved_by,
      NEW.status
    );
    
    NEW.approved_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER prayer_approval_trigger
  BEFORE UPDATE ON prayers
  FOR EACH ROW
  WHEN (NEW.status = 'approved' AND OLD.status != 'approved')
  EXECUTE FUNCTION track_prayer_approval();