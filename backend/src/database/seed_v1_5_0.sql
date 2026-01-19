-- v1.5.0 应用层测试数据（不清空表，安全插入）
USE hiking_app;

-- 待审核 (pending) - 使用 applications 表统一管理申请
INSERT IGNORE INTO
    applications (
        user_id,
        activity_id,
        status,
        message,
        created_at,
        updated_at
    )
VALUES (
        'user-002',
        'act-008',
        'pending',
        '想参加环湖徒步，体力尚可～',
        NOW() - INTERVAL 50 MINUTE,
        NOW() - INTERVAL 50 MINUTE
    ),
    (
        'user-004',
        'act-009',
        'pending',
        '带相机记录宠物与自然的美好',
        NOW() - INTERVAL 30 MINUTE,
        NOW() - INTERVAL 30 MINUTE
    );

-- 已通过 (approved) - 记录审核通过的申请
INSERT IGNORE INTO
    applications (
        user_id,
        activity_id,
        status,
        message,
        reviewed_at,
        reviewed_by,
        created_at,
        updated_at
    )
VALUES (
        'user-003',
        'act-001',
        'approved',
        '我已准备好，请通过～',
        NOW() - INTERVAL 1 DAY,
        'user-001',
        NOW() - INTERVAL 2 DAY,
        NOW() - INTERVAL 1 DAY
    );

-- 已拒绝 (rejected) - 记录被拒绝的申请
INSERT IGNORE INTO
    applications (
        user_id,
        activity_id,
        status,
        message,
        reviewed_at,
        reviewed_by,
        created_at,
        updated_at
    )
VALUES (
        'user-010',
        'act-001',
        'rejected',
        '时间不太合适，下次再约',
        NOW() - INTERVAL 1 DAY,
        'user-001',
        NOW() - INTERVAL 2 DAY,
        NOW() - INTERVAL 1 DAY
    );

-- 好友关系：便于消息与社交功能测试
INSERT IGNORE INTO
    friendships (
        user_id,
        friend_id,
        status,
        initiated_by,
        accepted_at,
        created_at
    )
VALUES (
        'user-001',
        'user-003',
        'accepted',
        'user-003',
        NOW() - INTERVAL 3 DAY,
        NOW() - INTERVAL 3 DAY
    ),
    (
        'user-003',
        'user-001',
        'accepted',
        'user-003',
        NOW() - INTERVAL 3 DAY,
        NOW() - INTERVAL 3 DAY
    );
