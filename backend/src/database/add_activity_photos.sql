-- 添加活动照片表，支持多张照片存储
USE hiking_app;

-- 创建活动照片表
CREATE TABLE IF NOT EXISTS activity_photos (
  id VARCHAR(36) PRIMARY KEY COMMENT '照片ID',
  activity_id VARCHAR(36) NOT NULL COMMENT '活动ID',
  photo_url VARCHAR(500) NOT NULL COMMENT '照片URL',
  is_cover BOOLEAN DEFAULT FALSE COMMENT '是否为封面图',
  sort_order INT DEFAULT 0 COMMENT '排序（0=封面）',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
  KEY idx_activity_id (activity_id),
  KEY idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='活动照片表';

-- 迁移现有数据：将 activities.cover_image_url 迁移到 activity_photos
INSERT INTO activity_photos (id, activity_id, photo_url, is_cover, sort_order)
SELECT
  CONCAT(id, '-cover') as id,
  id as activity_id,
  cover_image_url as photo_url,
  TRUE as is_cover,
  0 as sort_order
FROM activities
WHERE cover_image_url IS NOT NULL AND cover_image_url != '';

-- 可选：删除旧的 cover_image_url 字段（建议先备份数据）
-- ALTER TABLE activities DROP COLUMN cover_image_url;
