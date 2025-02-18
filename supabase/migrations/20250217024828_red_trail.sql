/*
  # Fix connection cards table structure

  1. Changes
    - Rename columns to match frontend naming
    - Add missing columns
    - Update constraints

  2. Security
    - Maintain existing RLS policies
*/

-- Drop existing table and recreate with correct structure
DROP TABLE IF EXISTS connection_cards;

CREATE TABLE connection_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  firstName text NOT NULL,
  lastName text NOT NULL,
  email text NOT NULL,
  phone text,
  address text,
  city text,
  state text,
  zipCode text,
  isFirstTime boolean DEFAULT true,
  howDidYouHear text,
  prayerRequest text,
  interestedIn text[],
  visitType text CHECK (visitType IN ('first-time', 'returning', 'regular')),
  preferredContact text CHECK (preferredContact IN ('email', 'phone', 'text')),
  status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'completed')),
  assigned_to uuid REFERENCES auth.users,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  contacted_at timestamptz,
  notes text
);

-- Enable RLS
ALTER TABLE connection_cards ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow public submissions
CREATE POLICY "Anyone can submit connection cards"
  ON connection_cards
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Only admins can view and manage connection cards
CREATE POLICY "Admins can manage connection cards"
  ON connection_cards
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_connection_cards_updated_at
  BEFORE UPDATE ON connection_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();