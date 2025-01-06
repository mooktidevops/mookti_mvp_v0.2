import { sql } from 'drizzle-orm';
import { text } from 'drizzle-orm/pg-core';

// Add display_type column
export const addDisplayTypeColumn = sql`
  ALTER TABLE content_chunks 
  ADD COLUMN display_type text NOT NULL 
  DEFAULT 'message' 
  CHECK (display_type IN ('message', 'card', 'card_carousel'));
`;

// Update existing rows to have display_type = 'message'
export const updateExistingRows = sql`
  UPDATE content_chunks 
  SET display_type = 'message' 
  WHERE display_type IS NULL;
`; 