/*
  # Add prayer interactions tracking

  1. New Tables
    - `prayer_interactions`
      - `id` (uuid, primary key)
      - `prayer_id` (uuid, references prayers)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamp)

  2. Changes
    - Add unique constraint to prevent multiple interactions from same user
    - Add trigger to update prayer_count automatically

  3. Security
    - Enable RLS
    - Add policies for interaction management
*/

-- Create prayer interactions table
CREATE TABLE IF NOT EXISTS prayer_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prayer_id uuid REFERENCES prayers NOT NULL,
  user_id uuid REFERENCES auth.users,
  created_at timestamptz DEFAULT now()
);

-- Add unique constraint to prevent multiple interactions
ALTER TABLE prayer_interactions
  ADD CONSTRAINT unique_prayer_interaction UNIQUE (prayer_id, user_id);

-- Enable RLS
ALTER TABLE prayer_interactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create their own interactions"
  ON prayer_interactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own interactions"
  ON prayer_interactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger to update prayer_count
CREATE OR REPLACE FUNCTION update_prayer_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE prayers
    SET prayer_count = prayer_count + 1
    WHERE id = NEW.prayer_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE prayers
    SET prayer_count = prayer_count - 1
    WHERE id = OLD.prayer_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prayer_interaction_trigger
  AFTER INSERT OR DELETE ON prayer_interactions
  FOR EACH ROW
  EXECUTE FUNCTION update_prayer_count();