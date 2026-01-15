-- 清理 users 表，只保留1条测试数据

USE hiking_app;

-- 查看当前用户数
SELECT '当前用户数:' as info, COUNT(*) as count FROM users;

-- 显示所有用户
SELECT id, email, nickname, created_at FROM users ORDER BY created_at;

-- 保留最早创建的用户（或 user-011），删除其他用户
-- 假设保留 user-011
DELETE FROM users
WHERE id != 'user-011' AND email != 'user1@test.com';

-- 验证结果
SELECT '清理后用户数:' as info, COUNT(*) as count FROM users;
SELECT id, email, nickname FROM users;
