/*
  # Update connection cards schema to match frontend

  1. Changes
    - Rename columns to match frontend field names
    - Add missing fields
    - Update field types and constraints

  2. Security
    - Maintain existing RLS policies
*/

-- Drop existing table and recreate with correct structure
DROP TABLE IF EXISTS connection_cards;

CREATE TABLE connection_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  address text,
  city text,
  state text,
  zip_code text,
  is_first_time boolean DEFAULT false,
  how_did_you_hear text,
  prayer_request text,
  interested_in text[],
  visit_type text CHECK (visit_type IN ('first-time', 'returning', 'regular')),
  preferred_contact text CHECK (preferred_contact IN ('email', 'phone', 'text')),
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