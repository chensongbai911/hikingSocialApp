-- Add recall columns to messages table (idempotent)
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS is_recalled TINYINT(1) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS recalled_at TIMESTAMP NULL,
  ADD COLUMN IF NOT EXISTS recalled_by VARCHAR(50) NULL;
