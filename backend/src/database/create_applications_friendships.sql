-- 创建申请表
CREATE TABLE IF NOT EXISTS applications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(36) NOT NULL,
  activity_id VARCHAR(36) NOT NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  message TEXT COMMENT '申请留言',
  reviewed_at DATETIME COMMENT '审核时间',
  reviewed_by VARCHAR(36) COMMENT '审核人ID',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY unique_user_activity (user_id, activity_id),
  INDEX idx_status (status),
  INDEX idx_activity (activity_id),
  INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建好友关系表
CREATE TABLE IF NOT EXISTS friendships (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(36) NOT NULL,
  friend_id VARCHAR(36) NOT NULL,
  status ENUM('pending', 'accepted', 'rejected', 'blocked') NOT NULL DEFAULT 'pending',
  initiated_by VARCHAR(36) NOT NULL COMMENT '发起请求的用户ID',
  message TEXT COMMENT '好友请求附言',
  accepted_at DATETIME COMMENT '接受时间',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_friendship (user_id, friend_id),
  INDEX idx_status (status),
  INDEX idx_user (user_id),
  INDEX idx_friend (friend_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 添加一些测试数据
-- 用户申请加入活动
INSERT IGNORE INTO applications (user_id, activity_id, status, message, created_at) VALUES
('user-002', 'act-001', 'pending', '经常参加周末徒步，体能良好，希望能加入大家一起出发！', NOW() - INTERVAL 2 HOUR),
('user-003', 'act-001', 'pending', '刚开始徒步，想认识爱户外的朋友，装备已买齐。', NOW() - INTERVAL 1 HOUR);

-- 一些好友关系
INSERT IGNORE INTO friendships (user_id, friend_id, status, initiated_by, accepted_at) VALUES
-- user-001和user-002是好友
('user-001', 'user-002', 'accepted', 'user-001', NOW() - INTERVAL 5 DAY),
('user-002', 'user-001', 'accepted', 'user-001', NOW() - INTERVAL 5 DAY),
-- user-001和user-003是好友
('user-001', 'user-003', 'accepted', 'user-003', NOW() - INTERVAL 3 DAY),
('user-003', 'user-001', 'accepted', 'user-003', NOW() - INTERVAL 3 DAY),
-- user-004向user-001发送好友请求(待处理)
('user-001', 'user-004', 'pending', 'user-004', NULL),
('user-004', 'user-001', 'pending', 'user-004', NULL);
