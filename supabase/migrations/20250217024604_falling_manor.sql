/*
  # Connection Card System

  1. New Tables
    - `connection_cards`
      - Basic visitor information
      - Contact preferences
      - Visit details
      - Interests and prayer requests

  2. Security
    - Enable RLS
    - Allow public submissions
    - Admin access for management
*/

-- Create connection cards table
CREATE TABLE IF NOT EXISTS connection_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  address text,
  city text,
  state text,
  zip_code text,
  is_first_time boolean DEFAULT true,
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

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_connection_cards_updated_at
  BEFORE UPDATE ON connection_cards
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();