-- 创建 users 表
CREATE TABLE IF NOT EXISTS users (
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

-- 添加外键约束到其他表
ALTER TABLE user_preferences ADD CONSTRAINT user_preferences_user_id_foreign FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE user_photos ADD CONSTRAINT user_photos_user_id_foreign FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE activities ADD CONSTRAINT activities_creator_id_foreign FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE participations ADD CONSTRAINT participations_user_id_foreign FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE participations ADD CONSTRAINT participations_activity_id_foreign FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE;
ALTER TABLE conversations ADD CONSTRAINT conversations_user_id1_foreign FOREIGN KEY (user_id1) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE conversations ADD CONSTRAINT conversations_user_id2_foreign FOREIGN KEY (user_id2) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE messages ADD CONSTRAINT messages_sender_id_foreign FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE messages ADD CONSTRAINT messages_conversation_id_foreign FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE;
