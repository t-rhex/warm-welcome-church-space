/*
  # Live Streaming Management

  1. New Tables
    - `live_streams`
      - Manages live streaming events and schedules
      - Tracks stream status, platform links, and timing

  2. Security
    - Enable RLS
    - Only admins can manage streams
    - Public can view active streams
*/

-- Create live streams table
CREATE TABLE live_streams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  platform text NOT NULL CHECK (platform IN ('facebook', 'youtube', 'both')),
  facebook_url text,
  youtube_url text,
  status text NOT NULL CHECK (status IN ('scheduled', 'live', 'ended', 'cancelled')),
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  created_by uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE live_streams ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can view active streams"
  ON live_streams
  FOR SELECT
  TO public
  USING (
    status IN ('scheduled', 'live') AND
    start_time >= CURRENT_DATE - INTERVAL '1 day'
  );

CREATE POLICY "Admins can manage streams"
  ON live_streams
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
CREATE INDEX idx_live_streams_status ON live_streams(status);
CREATE INDEX idx_live_streams_timing ON live_streams(start_time, end_time);

-- Create updated_at trigger
CREATE TRIGGER update_live_streams_updated_at
  BEFORE UPDATE ON live_streams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();