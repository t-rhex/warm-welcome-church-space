-- Create devotionals table
CREATE TABLE devotionals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  verse_reference text NOT NULL,
  verse_text text NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_by uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE devotionals ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can view active devotionals"
  ON devotionals
  FOR SELECT
  TO public
  USING (
    status = 'active'
    AND start_date <= now()
    AND end_date >= now()
  );

CREATE POLICY "Admins can manage devotionals"
  ON devotionals
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

-- Create indexes
CREATE INDEX idx_devotionals_dates ON devotionals(start_date, end_date);
CREATE INDEX idx_devotionals_status ON devotionals(status);

-- Create updated_at trigger
CREATE TRIGGER update_devotionals_updated_at
  BEFORE UPDATE ON devotionals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();