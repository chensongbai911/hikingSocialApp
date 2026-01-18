-- Patch 2026-01-18: Fix message_reports table and SQL errors
-- Purpose: Ensure message_reports table exists and fix SQL queries

-- 1. Check and recreate message_reports table if needed
DROP TABLE IF EXISTS message_reports;

CREATE TABLE message_reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    message_id INT NOT NULL,
    reporter_id VARCHAR(50) NOT NULL,
    reason VARCHAR(255) NOT NULL,
    extra JSON NULL,
    status ENUM(
        'pending',
        'reviewing',
        'resolved',
        'rejected'
    ) DEFAULT 'pending',
    handled_by VARCHAR(50) NULL,
    handled_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reports_message FOREIGN KEY (message_id) REFERENCES messages (id),
    INDEX idx_message (message_id),
    INDEX idx_reporter (reporter_id),
    INDEX idx_status (status)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 2. Verify messages table has receiver_id column
-- If not present, add it
ALTER TABLE messages ADD COLUMN IF NOT EXISTS receiver_id VARCHAR(50) AFTER sender_id;

-- 3. Add index on receiver_id if not exists
ALTER TABLE messages ADD INDEX idx_receiver (receiver_id);

-- 4. Ensure conversations table uses correct field names
-- (user1_id and user2_id instead of user_id1/user_id2 in some queries)
-- Adding aliases for compatibility
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS user_id1 VARCHAR(50) AS (user1_id) VIRTUAL;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS user_id2 VARCHAR(50) AS (user2_id) VIRTUAL;
