-- 清理 destinations 表的重复数据
-- 保留每个 name 对应的 id 最小的记录

-- 1. 创建临时表保存要保留的记录 ID
CREATE TEMPORARY TABLE keep_ids (
    id INT PRIMARY KEY
);

-- 2. 插入要保留的记录 ID（每个 name 保留 id 最小的）
INSERT INTO keep_ids (id)
SELECT MIN(id)
FROM destinations
GROUP BY name;

-- 3. 删除不在保留列表中的记录
DELETE FROM destinations
WHERE id NOT IN (SELECT id FROM keep_ids);

-- 4. 删除临时表
DROP TEMPORARY TABLE keep_ids;

-- 5. 查看清理后的结果
SELECT name, COUNT(*) as count
FROM destinations
GROUP BY name;
