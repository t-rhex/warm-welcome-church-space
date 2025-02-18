/*
  # Refresh schema cache

  1. Changes
    - Refresh schema cache by altering and reverting a column
    - No actual schema changes
*/

-- Alter and revert a column to force schema cache refresh
DO $$ 
BEGIN
  -- Temporarily alter column
  ALTER TABLE connection_cards 
    ALTER COLUMN firstName TYPE text;
  
  -- Revert back
  ALTER TABLE connection_cards 
    ALTER COLUMN firstName TYPE text;
END $$;