-- 修复 user_preferences 表的 preference_type 字段
-- 将 ENUM 改为 VARCHAR(50) 以支持更灵活的偏好类型

USE hiking_app;

-- 1. 修改 preference_type 字段类型
ALTER TABLE user_preferences
MODIFY COLUMN preference_type VARCHAR(50) NOT NULL COMMENT '偏好类型';

-- 2. 更新已有的 ENUM 值映射（如果有数据的话）
UPDATE user_preferences SET preference_type = 'hiking_time' WHERE preference_type = 'time';
UPDATE user_preferences SET preference_type = 'activity_type' WHERE preference_type = 'type';
UPDATE user_preferences SET preference_type = 'special_interest' WHERE preference_type = 'special';
UPDATE user_preferences SET preference_type = 'distance_preference' WHERE preference_type = 'distance';
UPDATE user_preferences SET preference_type = 'general_interest' WHERE preference_type = 'interest';

-- 3. 验证修改
DESCRIBE user_preferences;

SELECT '修改完成！preference_type 现在是 VARCHAR(50) 类型' AS status;
