/*
  # Events Management Schema

  1. New Tables
    - `events`
      - Core event information including title, description, dates, location
      - Support for recurring events
      - Categories and tags
      - Registration tracking
      - Media attachments
    
  2. Security
    - Enable RLS
    - Public can view published events
    - Admins can manage all events
*/

-- Create events table
CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  short_description text,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  location text,
  venue_name text,
  address text,
  city text,
  state text,
  zip_code text,
  is_featured boolean DEFAULT false,
  is_recurring boolean DEFAULT false,
  recurrence_pattern jsonb,
  category text,
  tags text[],
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
  max_attendees integer,
  current_attendees integer DEFAULT 0,
  registration_required boolean DEFAULT false,
  registration_deadline timestamptz,
  registration_url text,
  image_url text,
  additional_images text[],
  contact_name text,
  contact_email text,
  contact_phone text,
  cost decimal(10,2),
  created_by uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  published_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create event registrations table
CREATE TABLE event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events NOT NULL,
  user_id uuid REFERENCES auth.users,
  attendee_name text NOT NULL,
  attendee_email text NOT NULL,
  attendee_phone text,
  number_of_guests integer DEFAULT 1,
  status text DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  cancelled_at timestamptz,
  UNIQUE(event_id, attendee_email)
);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Create policies for events
CREATE POLICY "Public can view published events"
  ON events
  FOR SELECT
  TO public
  USING (
    status = 'published' 
    AND start_date >= CURRENT_DATE
  );

CREATE POLICY "Admins can manage all events"
  ON events
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

-- Create policies for event registrations
CREATE POLICY "Users can register for events"
  ON event_registrations
  FOR INSERT
  TO public
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM events e 
      WHERE e.id = event_id 
      AND e.status = 'published'
      AND e.registration_required = true
      AND (e.registration_deadline IS NULL OR e.registration_deadline >= CURRENT_TIMESTAMP)
      AND (e.max_attendees IS NULL OR e.current_attendees < e.max_attendees)
    )
  );

CREATE POLICY "Users can view their own registrations"
  ON event_registrations
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

CREATE POLICY "Admins can manage all registrations"
  ON event_registrations
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
CREATE INDEX idx_events_dates ON events(start_date, end_date);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_event_registrations_event ON event_registrations(event_id);
CREATE INDEX idx_event_registrations_user ON event_registrations(user_id);

-- Create trigger to update attendee count
CREATE OR REPLACE FUNCTION update_event_attendee_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'confirmed' THEN
    UPDATE events 
    SET current_attendees = current_attendees + NEW.number_of_guests
    WHERE id = NEW.event_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status = 'confirmed' AND NEW.status = 'cancelled' THEN
      UPDATE events 
      SET current_attendees = current_attendees - OLD.number_of_guests
      WHERE id = NEW.event_id;
    ELSIF OLD.status != 'confirmed' AND NEW.status = 'confirmed' THEN
      UPDATE events 
      SET current_attendees = current_attendees + NEW.number_of_guests
      WHERE id = NEW.event_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_event_attendee_count_trigger
  AFTER INSERT OR UPDATE ON event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_event_attendee_count();

-- Create updated_at triggers
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_registrations_updated_at
  BEFORE UPDATE ON event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();