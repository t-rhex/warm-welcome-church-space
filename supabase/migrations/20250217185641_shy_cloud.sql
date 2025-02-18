/*
  # Add rich text formatting to schedules

  1. Changes
    - Add HTML support for schedule descriptions
    - Add sections for better content organization
    - Add additional metadata fields

  2. Security
    - Sanitize HTML input
    - Maintain existing RLS policies
*/

-- Add new columns for rich text content
ALTER TABLE church_schedules
  ADD COLUMN content_sections jsonb[] DEFAULT ARRAY[]::jsonb[],
  ADD COLUMN meta_tags text[] DEFAULT ARRAY[]::text[],
  ADD COLUMN last_modified_by uuid REFERENCES auth.users;

-- Create function to validate HTML content
CREATE OR REPLACE FUNCTION validate_html_content(content text)
RETURNS boolean AS $$
BEGIN
  -- Basic validation - ensure content is not malicious
  -- In a production environment, you'd want more sophisticated validation
  RETURN (
    content !~ '<script>' AND
    content !~ 'javascript:' AND
    content !~ 'onerror=' AND
    content !~ 'onload='
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add validation trigger
CREATE OR REPLACE FUNCTION validate_schedule_content()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate description HTML
  IF NOT validate_html_content(NEW.description) THEN
    RAISE EXCEPTION 'Invalid HTML content in description';
  END IF;
  
  -- Set last modified information
  NEW.last_modified_by = auth.uid();
  NEW.updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_schedule_content_trigger
  BEFORE INSERT OR UPDATE ON church_schedules
  FOR EACH ROW
  EXECUTE FUNCTION validate_schedule_content();