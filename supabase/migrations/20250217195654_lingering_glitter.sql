/*
  # Create fundraising schema

  1. New Tables
    - `fundraising_campaigns`
      - Core campaign information
      - Progress tracking
      - Ministry association
      - Campaign status and dates
    - `campaign_donations`
      - Individual donation records
      - Donor information
      - Payment tracking

  2. Security
    - Enable RLS on all tables
    - Public can view active campaigns
    - Authenticated users can donate
    - Admins can manage campaigns

  3. Features
    - Campaign progress tracking
    - Ministry categorization
    - Donor recognition options
    - Campaign updates
*/

-- Create fundraising_campaigns table
CREATE TABLE fundraising_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  short_description text,
  ministry text NOT NULL,
  campaign_type text NOT NULL CHECK (campaign_type IN ('ministry', 'missions', 'project', 'other')),
  goal_amount decimal(10,2) NOT NULL,
  current_amount decimal(10,2) DEFAULT 0,
  start_date timestamptz NOT NULL,
  end_date timestamptz,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  featured boolean DEFAULT false,
  image_url text,
  contact_name text,
  contact_email text,
  contact_phone text,
  updates jsonb[] DEFAULT ARRAY[]::jsonb[],
  created_by uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  published_at timestamptz,
  completed_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create campaign_donations table
CREATE TABLE campaign_donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES fundraising_campaigns NOT NULL,
  amount decimal(10,2) NOT NULL,
  donor_name text,
  donor_email text,
  donor_phone text,
  message text,
  show_amount boolean DEFAULT true,
  show_name boolean DEFAULT true,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method text,
  payment_id text,
  user_id uuid REFERENCES auth.users,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE fundraising_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_donations ENABLE ROW LEVEL SECURITY;

-- Create policies for fundraising_campaigns
CREATE POLICY "Public can view active campaigns"
  ON fundraising_campaigns
  FOR SELECT
  TO public
  USING (status = 'active');

CREATE POLICY "Admins can manage campaigns"
  ON fundraising_campaigns
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

-- Create policies for campaign_donations
CREATE POLICY "Public can create donations"
  ON campaign_donations
  FOR INSERT
  TO public
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM fundraising_campaigns fc
      WHERE fc.id = campaign_id
      AND fc.status = 'active'
    )
  );

CREATE POLICY "Users can view their own donations"
  ON campaign_donations
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 
      FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name = 'admin'
    )
  );

CREATE POLICY "Admins can manage donations"
  ON campaign_donations
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
CREATE INDEX idx_fundraising_campaigns_status ON fundraising_campaigns(status);
CREATE INDEX idx_fundraising_campaigns_ministry ON fundraising_campaigns(ministry);
CREATE INDEX idx_fundraising_campaigns_dates ON fundraising_campaigns(start_date, end_date);
CREATE INDEX idx_campaign_donations_campaign ON campaign_donations(campaign_id);
CREATE INDEX idx_campaign_donations_user ON campaign_donations(user_id);
CREATE INDEX idx_campaign_donations_status ON campaign_donations(status);

-- Create trigger to update campaign amounts
CREATE OR REPLACE FUNCTION update_campaign_amount()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'completed' THEN
    UPDATE fundraising_campaigns 
    SET current_amount = current_amount + NEW.amount
    WHERE id = NEW.campaign_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
      UPDATE fundraising_campaigns 
      SET current_amount = current_amount + NEW.amount
      WHERE id = NEW.campaign_id;
    ELSIF OLD.status = 'completed' AND NEW.status != 'completed' THEN
      UPDATE fundraising_campaigns 
      SET current_amount = current_amount - OLD.amount
      WHERE id = NEW.campaign_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_campaign_amount_trigger
  AFTER INSERT OR UPDATE ON campaign_donations
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_amount();

-- Create trigger for updated_at
CREATE TRIGGER update_fundraising_campaigns_updated_at
  BEFORE UPDATE ON fundraising_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();