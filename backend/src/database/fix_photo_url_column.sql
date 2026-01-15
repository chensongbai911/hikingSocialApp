-- Fix photo_url column size to support base64 images
-- Base64 images can be very large, so we need to use LONGTEXT

USE hiking_app;

-- Modify the photo_url column to LONGTEXT to support base64 encoded images
ALTER TABLE user_photos 
MODIFY COLUMN photo_url LONGTEXT NOT NULL COMMENT '照片URL或Base64数据';

-- Also update avatar_url in users table to support base64
ALTER TABLE users 
MODIFY COLUMN avatar_url LONGTEXT COMMENT '头像URL或Base64数据';

-- Update activities cover image as well
ALTER TABLE activities 
MODIFY COLUMN cover_image_url LONGTEXT COMMENT '封面图URL或Base64数据';

-- Update message images
ALTER TABLE messages 
MODIFY COLUMN image_url LONGTEXT COMMENT '图片URL或Base64数据';

-- Update message files
ALTER TABLE messages 
MODIFY COLUMN file_url LONGTEXT COMMENT '文件URL或Base64数据';
