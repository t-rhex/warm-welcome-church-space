/*
  # Create invitations system

  1. New Tables
    - `invitations`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `created_at` (timestamp)
      - `expires_at` (timestamp)
      - `used_at` (timestamp, nullable)
      - `created_by` (uuid, references auth.users)
  
  2. Security
    - Enable RLS on `invitations` table
    - Add policies for admins to manage invitations
    - Add policy for users to verify their invitation
*/

-- Create invitations table
CREATE TABLE IF NOT EXISTS invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_by uuid REFERENCES auth.users NOT NULL
);

-- Enable RLS
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Create admin role if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'admin') THEN
    CREATE ROLE admin;
  END IF;
END
$$;

-- Policies for admins
CREATE POLICY "Admins can manage invitations"
  ON invitations
  FOR ALL
  TO admin
  USING (true);

-- Policy for verifying invitations
CREATE POLICY "Users can verify their own invitation"
  ON invitations
  FOR SELECT
  TO authenticated
  USING (
    email = auth.jwt()->>'email' 
    AND used_at IS NULL 
    AND expires_at > now()
  );