-- Chat feature schema migration
-- Generated: 2026-01-16
-- Charset: utf8mb4 for emoji support

SET NAMES utf8mb4;

-- 1) conversations
CREATE TABLE IF NOT EXISTS conversations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user1_id VARCHAR(50) NOT NULL,
    user2_id VARCHAR(50) NOT NULL,
    last_message_id INT NULL,
    last_message_at TIMESTAMP NULL,
    user1_unread_count INT DEFAULT 0,
    user2_unread_count INT DEFAULT 0,
    is_user1_blocked BOOLEAN DEFAULT FALSE,
    is_user2_blocked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_conversation (user1_id, user2_id),
    INDEX idx_users (user1_id, user2_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 2) messages
-- Note: text length limited to 200 by application validation
CREATE TABLE IF NOT EXISTS messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    conversation_id INT NOT NULL,
    sender_id VARCHAR(50) NOT NULL,
    receiver_id VARCHAR(50) NOT NULL,
    content VARCHAR(200) NULL,
    message_type ENUM('text', 'image', 'file') DEFAULT 'text',
    attachment_url VARCHAR(1024) NULL,
    attachment_meta JSON NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    is_recalled BOOLEAN DEFAULT FALSE,
    recalled_at TIMESTAMP NULL,
    recalled_by VARCHAR(50) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_messages_conversation FOREIGN KEY (conversation_id) REFERENCES conversations (id),
    INDEX idx_conversation (conversation_id),
    INDEX idx_sender (sender_id),
    INDEX idx_created_at (created_at),
    INDEX idx_read_at (read_at)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 3) message_limits
CREATE TABLE IF NOT EXISTS message_limits (
    id INT PRIMARY KEY AUTO_INCREMENT,
    conversation_id INT NOT NULL,
    sender_id VARCHAR(50) NOT NULL,
    receiver_id VARCHAR(50) NOT NULL,
    message_count INT DEFAULT 0,
    is_limited BOOLEAN DEFAULT TRUE,
    limit_reason ENUM(
        'not_mutual_follow',
        'receiver_not_replied'
    ) DEFAULT 'not_mutual_follow',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_sender_receiver (conversation_id, sender_id),
    INDEX idx_conversation (conversation_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 4) user_blacklist
CREATE TABLE IF NOT EXISTS user_blacklist (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(50) NOT NULL,
    blocked_user_id VARCHAR(50) NOT NULL,
    reason VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_user_blocked (user_id, blocked_user_id),
    INDEX idx_user (user_id),
    INDEX idx_blocked (blocked_user_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 5) message_reports
CREATE TABLE IF NOT EXISTS message_reports (
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

-- 6) messages_archive (for audit only)
CREATE TABLE IF NOT EXISTS messages_archive (
    id INT PRIMARY KEY AUTO_INCREMENT,
    conversation_id INT NOT NULL,
    original_message_id INT NULL,
    snapshot JSON NOT NULL,
    archived_reason ENUM(
        'conversation_cleared',
        'moderation',
        'other'
    ) DEFAULT 'conversation_cleared',
    archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_conv (conversation_id),
    INDEX idx_archived_at (archived_at)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
