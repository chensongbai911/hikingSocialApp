-- Patch 2026-01-18: Fix message_reports table and SQL errors
-- Purpose: Ensure message_reports table exists and fix SQL queries

-- 1. message_reports 表（若不存在则创建，存在则跳过）
CREATE TABLE IF NOT EXISTS message_reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    message_id INT NOT NULL,
    reporter_id VARCHAR(50) NOT NULL,
    reason VARCHAR(255) NOT NULL,
    extra JSON NULL,
    status ENUM('pending','reviewing','resolved','rejected') DEFAULT 'pending',
    handled_by VARCHAR(50) NULL,
    handled_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reports_message FOREIGN KEY (message_id) REFERENCES messages (id),
    INDEX idx_message (message_id),
    INDEX idx_reporter (reporter_id),
    INDEX idx_status (status)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 2. 若 messages.receiver_id 不存在则添加
SET @col_exists := (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'messages'
        AND COLUMN_NAME = 'receiver_id'
);
SET @ddl := IF(@col_exists = 0,
    'ALTER TABLE messages ADD COLUMN receiver_id VARCHAR(50) AFTER sender_id',
    'SELECT 1'
);
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3. 若 messages.receiver_id 索引不存在则添加
SET @idx_exists := (
    SELECT COUNT(*) FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'messages'
        AND INDEX_NAME = 'idx_receiver'
);
SET @ddl2 := IF(@idx_exists = 0,
    'ALTER TABLE messages ADD INDEX idx_receiver (receiver_id)',
    'SELECT 1'
);
PREPARE stmt2 FROM @ddl2; EXECUTE stmt2; DEALLOCATE PREPARE stmt2;
