/*
  # Fix Connection Cards Foreign Key

  1. Changes
    - Add foreign key constraint for assigned_to column
    - Add index for better query performance
    - Update RLS policies to include assigned staff member access

  2. Security
    - Maintain existing RLS policies
    - Add policy for assigned staff members to view their cards
*/

-- Add foreign key constraint for assigned_to
ALTER TABLE connection_cards
  DROP CONSTRAINT IF EXISTS connection_cards_assigned_to_fkey,
  ADD CONSTRAINT connection_cards_assigned_to_fkey 
  FOREIGN KEY (assigned_to) 
  REFERENCES auth.users(id);

-- Add index for assigned_to
CREATE INDEX IF NOT EXISTS idx_connection_cards_assigned_to 
  ON connection_cards(assigned_to);

-- Add policy for assigned staff to view their cards
CREATE POLICY "Assigned staff can view their cards"
  ON connection_cards
  FOR SELECT
  TO authenticated
  USING (
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 
      FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name = 'admin'
    )
  );