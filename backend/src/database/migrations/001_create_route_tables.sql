-- Routes and related tables

CREATE TABLE IF NOT EXISTS routes (
    id VARCHAR(36) PRIMARY KEY COMMENT 'Route ID (UUID)',
    name VARCHAR(100) NOT NULL COMMENT 'Route name',
    description TEXT COMMENT 'Description',
    difficulty ENUM(
        'easy',
        'moderate',
        'hard',
        'expert'
    ) NOT NULL DEFAULT 'moderate' COMMENT 'Difficulty',
    distance DECIMAL(8, 2) COMMENT 'Distance km',
    elevation_gain DECIMAL(8, 2) COMMENT 'Ascent meters',
    elevation_loss DECIMAL(8, 2) COMMENT 'Descent meters',
    estimated_duration INT COMMENT 'Estimated minutes',
    season VARCHAR(50) COMMENT 'Suitable seasons',
    route_type ENUM(
        'loop',
        'out_and_back',
        'point_to_point'
    ) DEFAULT 'out_and_back' COMMENT 'Route type',
    start_point POINT NOT NULL COMMENT 'Start coordinate',
    end_point POINT COMMENT 'End coordinate',
    region VARCHAR(100) COMMENT 'Region',
    creator_id VARCHAR(36) NOT NULL COMMENT 'Creator user id',
    status ENUM(
        'draft',
        'published',
        'archived'
    ) DEFAULT 'draft' COMMENT 'Status',
    privacy ENUM(
        'public',
        'private',
        'friends_only'
    ) DEFAULT 'public' COMMENT 'Privacy',
    view_count INT DEFAULT 0,
    favorite_count INT DEFAULT 0,
    completion_count INT DEFAULT 0,
    rating_avg DECIMAL(3, 2) DEFAULT 0.00,
    rating_count INT DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP NULL,
    verified_by VARCHAR(36),
    cover_image VARCHAR(500),
    images JSON,
    warnings TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_routes_creator_id (creator_id),
    INDEX idx_routes_difficulty (difficulty),
    INDEX idx_routes_distance (distance),
    INDEX idx_routes_status (status),
    INDEX idx_routes_created_at (created_at DESC),
    SPATIAL INDEX idx_routes_start_point (start_point),
    FOREIGN KEY (creator_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS route_waypoints (
    id VARCHAR(36) PRIMARY KEY COMMENT 'Waypoint ID (UUID)',
    route_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    location POINT NOT NULL,
    elevation DECIMAL(6, 2),
    order_index INT NOT NULL,
    waypoint_type ENUM(
        'start',
        'checkpoint',
        'rest',
        'viewpoint',
        'water',
        'shelter',
        'end'
    ) DEFAULT 'checkpoint',
    estimated_arrival_time INT,
    distance_from_start DECIMAL(8, 2),
    photos JSON,
    tips TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_route_waypoints_route_id (route_id),
    INDEX idx_route_waypoints_order (route_id, order_index),
    SPATIAL INDEX idx_route_waypoints_location (location),
    FOREIGN KEY (route_id) REFERENCES routes (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS route_risk_points (
    id VARCHAR(36) PRIMARY KEY,
    route_id VARCHAR(36) NOT NULL,
    location POINT NOT NULL,
    name VARCHAR(100),
    risk_type ENUM(
        'steep_slope',
        'cliff',
        'river_crossing',
        'wildlife',
        'weather',
        'avalanche',
        'rockfall',
        'other'
    ) NOT NULL,
    risk_level ENUM(
        'low',
        'medium',
        'high',
        'extreme'
    ) DEFAULT 'medium',
    description TEXT,
    mitigation TEXT,
    active_seasons VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_route_risk_points_route_id (route_id),
    INDEX idx_route_risk_points_risk_level (risk_level),
    SPATIAL INDEX idx_route_risk_points_location (location),
    FOREIGN KEY (route_id) REFERENCES routes (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS route_tags (
    id VARCHAR(36) PRIMARY KEY,
    route_id VARCHAR(36) NOT NULL,
    tag_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_route_tags_route_id (route_id),
    INDEX idx_route_tags_tag_name (tag_name),
    UNIQUE KEY uk_route_tag (route_id, tag_name),
    FOREIGN KEY (route_id) REFERENCES routes (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS route_favorites (
    id VARCHAR(36) PRIMARY KEY,
    route_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_route_favorites_user_id (user_id),
    INDEX idx_route_favorites_route_id (route_id),
    UNIQUE KEY uk_user_route_favorite (user_id, route_id),
    FOREIGN KEY (route_id) REFERENCES routes (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- No seed data to keep migration simple.
