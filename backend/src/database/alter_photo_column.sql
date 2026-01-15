-- 修改 activity_photos 表的 photo_url 字段以支持 base64 大图片
USE hiking_app;

ALTER TABLE activity_photos
MODIFY COLUMN photo_url LONGTEXT
COMMENT '照片URL（支持base64大图片）';

-- 验证修改
DESCRIBE activity_photos;
