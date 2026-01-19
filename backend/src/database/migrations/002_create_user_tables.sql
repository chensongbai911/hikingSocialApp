-- ===================================
-- 用户系统表结构
-- 创建日期: 2026-01-19
-- ===================================

-- 1. 用户表
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
  email VARCHAR(100) NOT NULL UNIQUE COMMENT '邮箱',
  password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
  phone VARCHAR(20) COMMENT '手机号',

-- 个人信息
nickname VARCHAR(50) COMMENT '昵称',
avatar_url VARCHAR(500) COMMENT '头像URL',
gender ENUM('male', 'female', 'other') COMMENT '性别',
birthday DATE COMMENT '生日',
bio TEXT COMMENT '个人简介',

-- 徒步相关
hiking_level ENUM(
    'beginner',
    'intermediate',
    'advanced',
    'expert'
) DEFAULT 'beginner' COMMENT '徒步等级',
total_distance DECIMAL(10, 2) DEFAULT 0 COMMENT '累计徒步距离（公里）',
total_elevation DECIMAL(10, 2) DEFAULT 0 COMMENT '累计爬升（米）',
total_hikes INT DEFAULT 0 COMMENT '徒步次数',
total_routes_created INT DEFAULT 0 COMMENT '创建路线数',

-- 社交统计
followers_count INT DEFAULT 0 COMMENT '粉丝数',
following_count INT DEFAULT 0 COMMENT '关注数',

-- 安全相关
emergency_contact_name VARCHAR(100) COMMENT '紧急联系人姓名',
emergency_contact_phone VARCHAR(20) COMMENT '紧急联系人电话',

-- 账号状态
status ENUM(
    'active',
    'inactive',
    'banned'
) DEFAULT 'active' COMMENT '账号状态',
email_verified BOOLEAN DEFAULT FALSE COMMENT '邮箱是否验证',
phone_verified BOOLEAN DEFAULT FALSE COMMENT '手机是否验证',

-- 时间戳

last_login_at TIMESTAMP NULL COMMENT '最后登录时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  INDEX idx_username (username),
  INDEX idx_email (email),
  INDEX idx_phone (phone),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 2. 用户关注表
CREATE TABLE IF NOT EXISTS user_follows (
    id INT AUTO_INCREMENT PRIMARY KEY,
    follower_id VARCHAR(36) NOT NULL COMMENT '关注者ID',
    following_id VARCHAR(36) NOT NULL COMMENT '被关注者ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '关注时间',
    UNIQUE KEY unique_follow (follower_id, following_id),
    INDEX idx_follower (follower_id),
    INDEX idx_following (following_id),
    FOREIGN KEY (follower_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '用户关注表';

-- 3. 用户设置表
CREATE TABLE IF NOT EXISTS user_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL UNIQUE COMMENT '用户ID',

-- 隐私设置
profile_visibility ENUM(
    'public',
    'followers',
    'private'
) DEFAULT 'public' COMMENT '个人主页可见性',
location_sharing ENUM(
    'always',
    'hiking_only',
    'never'
) DEFAULT 'hiking_only' COMMENT '位置分享设置',

-- 通知设置
notify_new_follower BOOLEAN DEFAULT TRUE COMMENT '新粉丝通知',
notify_route_comment BOOLEAN DEFAULT TRUE COMMENT '路线评论通知',
notify_hiking_invite BOOLEAN DEFAULT TRUE COMMENT '徒步邀请通知',
notify_team_message BOOLEAN DEFAULT TRUE COMMENT '队伍消息通知',
notify_sos_alert BOOLEAN DEFAULT TRUE COMMENT 'SOS预警通知',

-- 推送设置
push_enabled BOOLEAN DEFAULT TRUE COMMENT '启用推送',
push_sound BOOLEAN DEFAULT TRUE COMMENT '推送声音',

-- 其他设置

distance_unit ENUM('km', 'mile') DEFAULT 'km' COMMENT '距离单位',
  elevation_unit ENUM('m', 'ft') DEFAULT 'm' COMMENT '海拔单位',
  language VARCHAR(10) DEFAULT 'zh-CN' COMMENT '语言',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户设置表';

-- 4. 刷新令牌表
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL COMMENT '用户ID',
    token VARCHAR(500) NOT NULL UNIQUE COMMENT '刷新令牌',
    expires_at TIMESTAMP NOT NULL COMMENT '过期时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_user_id (user_id),
    INDEX idx_token (token),
    INDEX idx_expires_at (expires_at),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '刷新令牌表';

-- No seed data in this migration. Use separate seed script if needed.
