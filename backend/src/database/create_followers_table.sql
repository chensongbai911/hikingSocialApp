-- 创建关注者表
CREATE TABLE IF NOT EXISTS user_followers (
    id VARCHAR(36) PRIMARY KEY COMMENT '关注关系ID',
    follower_id VARCHAR(36) NOT NULL COMMENT '粉丝用户ID',
    following_id VARCHAR(36) NOT NULL COMMENT '被关注用户ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '关注时间',
    KEY idx_follower_id (follower_id),
    KEY idx_following_id (following_id),
    UNIQUE KEY unique_follow (follower_id, following_id),
    CONSTRAINT fk_follower_id FOREIGN KEY (follower_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_following_id FOREIGN KEY (following_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '用户关注者表';

-- 显示创建结果
SELECT 'user_followers 表创建成功' as message;
