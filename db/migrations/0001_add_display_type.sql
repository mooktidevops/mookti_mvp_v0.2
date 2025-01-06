-- Add display_type column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'content_chunks' 
                  AND column_name = 'display_type') 
    THEN
        ALTER TABLE content_chunks 
        ADD COLUMN display_type text NOT NULL DEFAULT 'message';

        -- Add check constraint
        ALTER TABLE content_chunks 
        ADD CONSTRAINT content_chunks_display_type_check 
        CHECK (display_type IN ('message', 'card', 'card_carousel'));
    END IF;
END $$; 