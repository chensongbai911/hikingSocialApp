-- 清理 destinations 表中的重复数据
-- 保留每个地点名称的第一条记录，删除其余重复记录

USE hiking_app;

-- 1. 查看重复数据
SELECT name, COUNT(*) as count
FROM destinations
GROUP BY name
HAVING count > 1;

-- 2. 删除重复数据，保留ID最小的记录
DELETE d1 FROM destinations d1
INNER JOIN destinations d2
WHERE
    d1.name = d2.name
    AND d1.id > d2.id;

-- 3. 验证结果
SELECT COUNT(*) as total_destinations FROM destinations;
SELECT name, COUNT(*) as count
FROM destinations
GROUP BY name
HAVING count > 1;

-- 如果还有重复，显示详细信息
SELECT * FROM destinations ORDER BY name, id;
