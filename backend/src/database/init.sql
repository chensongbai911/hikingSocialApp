-- 创建数据库
CREATE DATABASE IF NOT EXISTS hiking_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hiking_app;

-- 用户表
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY COMMENT '用户UUID',
  email VARCHAR(255) UNIQUE NOT NULL COMMENT '邮箱',
  password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
  nickname VARCHAR(100) NOT NULL COMMENT '昵称',
  avatar_url VARCHAR(500) COMMENT '头像URL',
  gender ENUM('male', 'female', 'other') COMMENT '性别',
  age INT COMMENT '年龄',
  bio TEXT COMMENT '关于我',
  hiking_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner' COMMENT '徒步等级',
  is_active BOOLEAN DEFAULT TRUE COMMENT '是否活跃',
  is_verified BOOLEAN DEFAULT FALSE COMMENT '是否验证',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  deleted_at TIMESTAMP NULL COMMENT '删除时间',
  KEY idx_email (email),
  KEY idx_created_at (created_at),
  KEY idx_hiking_level (hiking_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 用户偏好表
CREATE TABLE user_preferences (
  id VARCHAR(36) PRIMARY KEY COMMENT '记录ID',
  user_id VARCHAR(36) NOT NULL COMMENT '用户ID',
  preference_type ENUM('time', 'type', 'special', 'distance', 'interest') COMMENT '偏好类型',
  preference_value VARCHAR(100) COMMENT '偏好值',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_preference (user_id, preference_type, preference_value),
  KEY idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户偏好表';

-- 用户相册表
CREATE TABLE user_photos (
  id VARCHAR(36) PRIMARY KEY COMMENT '照片ID',
  user_id VARCHAR(36) NOT NULL COMMENT '用户ID',
  photo_url VARCHAR(500) NOT NULL COMMENT '照片URL',
  sort_order INT DEFAULT 0 COMMENT '排序',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  KEY idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户相册表';

-- 活动表
CREATE TABLE activities (
  id VARCHAR(36) PRIMARY KEY COMMENT '活动ID',
  creator_id VARCHAR(36) NOT NULL COMMENT '创建者ID',
  title VARCHAR(255) NOT NULL COMMENT '活动标题',
  description TEXT COMMENT '活动描述',
  cover_image_url VARCHAR(500) COMMENT '封面图URL',
  location VARCHAR(255) NOT NULL COMMENT '地点名称',
  latitude DECIMAL(10, 8) COMMENT '纬度',
  longitude DECIMAL(11, 8) COMMENT '经度',
  start_time DATETIME NOT NULL COMMENT '开始时间',
  end_time DATETIME COMMENT '结束时间',
  difficulty ENUM('easy', 'moderate', 'hard') DEFAULT 'easy' COMMENT '难度',
  max_participants INT COMMENT '最大参与人数',
  status ENUM('pending', 'approved', 'ongoing', 'completed', 'cancelled') DEFAULT 'pending' COMMENT '活动状态',
  route_description TEXT COMMENT '路线描述',
  equipment_required TEXT COMMENT '装备要求',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  deleted_at TIMESTAMP NULL COMMENT '删除时间',
  FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
  KEY idx_status (status),
  KEY idx_start_time (start_time),
  KEY idx_creator_id (creator_id),
  KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='活动表';

-- 参与关系表
CREATE TABLE participations (
  id VARCHAR(36) PRIMARY KEY COMMENT '参与记录ID',
  user_id VARCHAR(36) NOT NULL COMMENT '用户ID',
  activity_id VARCHAR(36) NOT NULL COMMENT '活动ID',
  status ENUM('joined', 'completed', 'cancelled') DEFAULT 'joined' COMMENT '参与状态',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间',
  completed_at TIMESTAMP NULL COMMENT '完成时间',
  cancelled_at TIMESTAMP NULL COMMENT '取消时间',
  feedback TEXT COMMENT '活动反馈',
  rating INT COMMENT '活动评分',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
  UNIQUE KEY unique_participation (user_id, activity_id),
  KEY idx_user_id (user_id),
  KEY idx_activity_id (activity_id),
  KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='参与关系表';

-- 对话表
CREATE TABLE conversations (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '对话ID',
  user_id1 VARCHAR(36) NOT NULL COMMENT '参与者1ID',
  user_id2 VARCHAR(36) NOT NULL COMMENT '参与者2ID',
  last_message_id INT COMMENT '最后一条消息ID',
  last_message_at TIMESTAMP NULL COMMENT '最后消息时间',
  last_message_content VARCHAR(255) COMMENT '最后消息内容（缓存）',
  user1_unread_count INT DEFAULT 0 COMMENT '用户1未读消息数',
  user2_unread_count INT DEFAULT 0 COMMENT '用户2未读消息数',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  deleted_at TIMESTAMP NULL COMMENT '删除时间',
  FOREIGN KEY (user_id1) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id2) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_users (user_id1, user_id2),
  KEY idx_user1_time (user_id1, last_message_at),
  KEY idx_user2_time (user_id2, last_message_at),
  KEY idx_last_message_at (last_message_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='对话表';

-- 消息表
CREATE TABLE messages (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '消息ID',
  conversation_id INT NOT NULL COMMENT '对话ID',
  sender_id VARCHAR(36) NOT NULL COMMENT '发送者ID',
  content TEXT COMMENT '消息内容',
  content_type ENUM('text', 'image', 'file') DEFAULT 'text' COMMENT '消息类型',
  image_url VARCHAR(500) COMMENT '图片URL',
  file_url VARCHAR(500) COMMENT '文件URL',
  is_read BOOLEAN DEFAULT FALSE COMMENT '是否已读',
  read_at TIMESTAMP NULL COMMENT '阅读时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  deleted_at TIMESTAMP NULL COMMENT '删除时间',
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  KEY idx_conversation_time (conversation_id, created_at),
  KEY idx_sender_time (sender_id, created_at),
  KEY idx_is_read (is_read, conversation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='消息表';

-- 添加外键关联
ALTER TABLE conversations ADD FOREIGN KEY (last_message_id) REFERENCES messages(id) ON DELETE SET NULL;

-- 创建索引以优化查询性能
ALTER TABLE activities ADD INDEX idx_location (location);
ALTER TABLE activities ADD INDEX idx_difficulty (difficulty);
ALTER TABLE user_preferences ADD INDEX idx_preference_type (preference_type);
