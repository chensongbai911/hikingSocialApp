-- 查看并清理 destinations 重复数据的详细脚本

USE hiking_app;

-- 查看总数
SELECT '总记录数:' as info, COUNT(*) as count FROM destinations;

-- 查看重复的地点名称
SELECT '重复地点:' as info, name, COUNT(*) as count
FROM destinations
GROUP BY name
HAVING count > 1
ORDER BY count DESC, name;

-- 创建临时表保存要保留的记录（每个name保留ID最小的一条）
CREATE TEMPORARY TABLE IF NOT EXISTS destinations_to_keep AS
SELECT MIN(id) as id
FROM destinations
GROUP BY name;

-- 显示将要删除的记录数
SELECT '将删除的记录数:' as info, COUNT(*) as count
FROM destinations
WHERE id NOT IN (SELECT id FROM destinations_to_keep);

-- 执行删除
DELETE FROM destinations
WHERE id NOT IN (SELECT id FROM destinations_to_keep);

-- 清理临时表
DROP TEMPORARY TABLE IF EXISTS destinations_to_keep;

-- 验证结果
SELECT '清理后总记录数:' as info, COUNT(*) as count FROM destinations;
SELECT '剩余重复记录:' as info, COUNT(*) as count
FROM (
    SELECT name, COUNT(*) as cnt
    FROM destinations
    GROUP BY name
    HAVING cnt > 1
) as duplicates;
