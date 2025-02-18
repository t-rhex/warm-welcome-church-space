-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Authorized users can manage offerings" ON tithe_offerings;
  DROP POLICY IF EXISTS "Authorized users can verify offerings" ON tithe_offering_verifications;
END $$;

-- Create tithe and offerings table if it doesn't exist
CREATE TABLE IF NOT EXISTS tithe_offerings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_date date NOT NULL,
  service_type text NOT NULL CHECK (service_type IN ('sunday_morning', 'sunday_evening', 'wednesday', 'special')),
  category_id uuid REFERENCES tithe_offering_categories NOT NULL,
  amount decimal(10,2) NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('cash', 'check', 'card', 'online')),
  notes text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'finalized')),
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users NOT NULL,
  finalized_at timestamptz,
  finalized_by uuid REFERENCES auth.users,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create verifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS tithe_offering_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tithe_offering_id uuid REFERENCES tithe_offerings NOT NULL,
  verified_by uuid REFERENCES auth.users NOT NULL,
  verified_at timestamptz DEFAULT now(),
  notes text,
  UNIQUE(tithe_offering_id, verified_by)
);

-- Enable RLS
ALTER TABLE tithe_offerings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tithe_offering_verifications ENABLE ROW LEVEL SECURITY;

-- Create policies for tithe offerings
CREATE POLICY "Authorized users can manage offerings"
  ON tithe_offerings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'finance')
    )
  );

-- Create policies for verifications
CREATE POLICY "Authorized users can verify offerings"
  ON tithe_offering_verifications
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'finance')
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tithe_offerings_date ON tithe_offerings(service_date);
CREATE INDEX IF NOT EXISTS idx_tithe_offerings_status ON tithe_offerings(status);
CREATE INDEX IF NOT EXISTS idx_tithe_offerings_category ON tithe_offerings(category_id);
CREATE INDEX IF NOT EXISTS idx_tithe_offering_verifications_offering ON tithe_offering_verifications(tithe_offering_id);

-- Create function to check verification count if it doesn't exist
CREATE OR REPLACE FUNCTION check_verification_count()
RETURNS TRIGGER AS $$
DECLARE
  verification_count integer;
BEGIN
  -- Count existing verifications for this offering
  SELECT COUNT(*)
  INTO verification_count
  FROM tithe_offering_verifications
  WHERE tithe_offering_id = NEW.tithe_offering_id;

  -- If this is a new verification and we already have 2, prevent it
  IF TG_OP = 'INSERT' AND verification_count >= 2 THEN
    RAISE EXCEPTION 'Maximum of two verifications allowed per offering';
  END IF;

  -- If we now have 2 verifications, update the offering status
  IF verification_count = 1 THEN
    UPDATE tithe_offerings
    SET status = 'verified'
    WHERE id = NEW.tithe_offering_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for verification count check if it doesn't exist
DROP TRIGGER IF EXISTS check_verification_count_trigger ON tithe_offering_verifications;
CREATE TRIGGER check_verification_count_trigger
  BEFORE INSERT ON tithe_offering_verifications
  FOR EACH ROW
  EXECUTE FUNCTION check_verification_count();