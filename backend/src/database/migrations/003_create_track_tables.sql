-- Track system tables
-- Created: 2026-01-19

-- 1. Tracks table
CREATE TABLE IF NOT EXISTS tracks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    route_id VARCHAR(36),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    total_distance DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_duration INT NOT NULL DEFAULT 0,
    total_elevation_gain DECIMAL(10, 2) DEFAULT 0,
    total_elevation_loss DECIMAL(10, 2) DEFAULT 0,
    max_altitude DECIMAL(10, 2),
    min_altitude DECIMAL(10, 2),
    avg_speed DECIMAL(10, 2),
    max_speed DECIMAL(10, 2),
    start_point POINT NOT NULL,
    end_point POINT NOT NULL,
    start_location_name VARCHAR(200),
    end_location_name VARCHAR(200),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    status ENUM(
        'recording',
        'paused',
        'completed',
        'failed'
    ) DEFAULT 'recording',
    is_public BOOLEAN DEFAULT TRUE,
    view_count INT DEFAULT 0,
    like_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    SPATIAL INDEX idx_start_point (start_point),
    INDEX idx_user_id (user_id),
    INDEX idx_route_id (route_id),
    INDEX idx_status (status),
    INDEX idx_start_time (start_time),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (route_id) REFERENCES routes (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 2. Track points table
CREATE TABLE IF NOT EXISTS track_points (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    track_id INT NOT NULL,
    location POINT NOT NULL,
    altitude DECIMAL(10, 2),
    accuracy DECIMAL(10, 2),
    speed DECIMAL(10, 2),
    heading DECIMAL(5, 2),
    recorded_at TIMESTAMP NOT NULL,
    heart_rate INT,
    SPATIAL INDEX idx_location (location),
    INDEX idx_track_id (track_id),
    INDEX idx_recorded_at (recorded_at),
    FOREIGN KEY (track_id) REFERENCES tracks (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 3. Hiking reports table
CREATE TABLE IF NOT EXISTS hiking_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    track_id INT NOT NULL UNIQUE,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    weather VARCHAR(100),
    difficulty_rating INT,
    scenery_rating INT,
    cover_image_url VARCHAR(500),
    image_urls TEXT,
    view_count INT DEFAULT 0,
    like_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    share_count INT DEFAULT 0,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_is_public (is_public),
    FOREIGN KEY (track_id) REFERENCES tracks (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 4. Report comments table
CREATE TABLE IF NOT EXISTS report_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_id INT NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    parent_id INT,
    content TEXT NOT NULL,
    like_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_report_id (report_id),
    INDEX idx_user_id (user_id),
    INDEX idx_parent_id (parent_id),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (report_id) REFERENCES hiking_reports (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES report_comments (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 5. Track likes table
CREATE TABLE IF NOT EXISTS track_likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    track_id INT NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_like (track_id, user_id),
    INDEX idx_track_id (track_id),
    INDEX idx_user_id (user_id),
    FOREIGN KEY (track_id) REFERENCES tracks (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- No seed data in this migration
