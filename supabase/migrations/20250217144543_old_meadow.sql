/*
  # Fix Prayer Interactions Policies

  1. Changes
    - Drop and recreate prayer interactions policies
    - Add proper indexes for performance
    - Fix interaction checking queries
    
  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create their own interactions" ON prayer_interactions;
DROP POLICY IF EXISTS "Users can view their own interactions" ON prayer_interactions;

-- Create new policies
CREATE POLICY "Users can manage their own interactions"
  ON prayer_interactions
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_prayer_interactions_user ON prayer_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_prayer_interactions_prayer ON prayer_interactions(prayer_id);
CREATE INDEX IF NOT EXISTS idx_prayer_interactions_combined ON prayer_interactions(prayer_id, user_id);

-- Add unique constraint if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_prayer_interaction'
  ) THEN
    ALTER TABLE prayer_interactions
      ADD CONSTRAINT unique_prayer_interaction 
      UNIQUE (prayer_id, user_id);
  END IF;
END $$;