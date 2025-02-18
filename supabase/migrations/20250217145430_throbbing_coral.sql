/*
  # Fix Connection Cards Foreign Key Relationship

  1. Changes
    - Drop and recreate the foreign key constraint for assigned_to
    - Add proper indexes for better query performance
    - Update policies to handle assigned staff correctly

  2. Security
    - Maintain RLS policies for proper access control
*/

-- Drop existing constraint if it exists
ALTER TABLE connection_cards
  DROP CONSTRAINT IF EXISTS connection_cards_assigned_to_fkey;

-- Recreate the foreign key constraint
ALTER TABLE connection_cards
  ADD CONSTRAINT connection_cards_assigned_to_fkey 
  FOREIGN KEY (assigned_to) 
  REFERENCES auth.users(id);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_connection_cards_assigned_to 
  ON connection_cards(assigned_to);
CREATE INDEX IF NOT EXISTS idx_connection_cards_status 
  ON connection_cards(status);
CREATE INDEX IF NOT EXISTS idx_connection_cards_created_at 
  ON connection_cards(created_at);

-- Update policies to handle assigned staff correctly
DROP POLICY IF EXISTS "Assigned staff can view their cards" ON connection_cards;
DROP POLICY IF EXISTS "Admins can manage connection cards" ON connection_cards;

-- Create new policies
CREATE POLICY "Staff can view assigned cards"
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

CREATE POLICY "Admins can manage all cards"
  ON connection_cards
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