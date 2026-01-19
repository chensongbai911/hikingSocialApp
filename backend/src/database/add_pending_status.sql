-- 添加 pending 状态到 participations 表
-- 用于支持活动申请审核流程

USE hiking_app;

-- 修改 participations 表的 status 字段，添加 'pending' 状态
ALTER TABLE participations
MODIFY COLUMN status ENUM(
    'pending',
    'joined',
    'completed',
    'cancelled',
    'rejected'
) DEFAULT 'pending' COMMENT '参与状态：pending-待审核, joined-已加入, completed-已完成, cancelled-已取消, rejected-已拒绝';

-- 添加 applied_at 字段用于记录申请时间
ALTER TABLE participations
ADD COLUMN applied_at TIMESTAMP NULL COMMENT '申请时间' AFTER status;

-- 添加 approved_at 字段用于记录审核通过时间
ALTER TABLE participations
ADD COLUMN approved_at TIMESTAMP NULL COMMENT '审核通过时间' AFTER applied_at;

-- 添加 rejected_at 字段用于记录拒绝时间
ALTER TABLE participations
ADD COLUMN rejected_at TIMESTAMP NULL COMMENT '拒绝时间' AFTER approved_at;

-- 更新现有数据：将 joined 状态的记录设置申请和审核时间
UPDATE participations
SET
    applied_at = joined_at,
    approved_at = joined_at
WHERE
    status = 'joined'
    AND applied_at IS NULL;

-- 添加索引以提高查询性能
CREATE INDEX idx_applied_at ON participations (applied_at);

CREATE INDEX idx_status_activity ON participations (status, activity_id);

-- 显示修改结果
SHOW COLUMNS FROM participations LIKE 'status';
