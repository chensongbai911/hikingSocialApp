SET NAMES utf8mb4;

START TRANSACTION;

DROP TEMPORARY TABLE IF EXISTS tmp_users;

CREATE TEMPORARY TABLE tmp_users AS
SELECT id, ROW_NUMBER() OVER (
        ORDER BY id
    ) AS rn
FROM users
WHERE
    deleted_at IS NULL;

DROP TEMPORARY TABLE IF EXISTS tmp_users2;

CREATE TEMPORARY TABLE tmp_users2 AS SELECT * FROM tmp_users;

UPDATE users u
JOIN tmp_users t ON u.id = t.id
SET
    gender = CASE MOD(t.rn, 3)
        WHEN 1 THEN 'male'
        WHEN 2 THEN 'female'
        ELSE 'other'
    END,
    age = 18 + t.rn,
    bio = CONCAT(
        '热爱徒步的用户',
        t.rn,
        '，喜欢结伴探索新路线。'
    ),
    province = '北京',
    city = CASE MOD(t.rn, 3)
        WHEN 1 THEN '北京'
        WHEN 2 THEN '上海'
        ELSE '广州'
    END,
    region = CASE MOD(t.rn, 3)
        WHEN 1 THEN '海淀区'
        WHEN 2 THEN '浦东新区'
        ELSE '天河区'
    END,
    hiking_level = CASE MOD(t.rn, 3)
        WHEN 1 THEN 'beginner'
        WHEN 2 THEN 'intermediate'
        ELSE 'advanced'
    END,
    avatar_url = CONCAT(
        'https://picsum.photos/300/300?random=',
        10 + t.rn
    ),
    is_active = 1,
    is_verified = 1;

INSERT IGNORE INTO
    user_settings (
        user_id,
        profile_visibility,
        location_sharing,
        notify_new_follower,
        notify_route_comment,
        notify_hiking_invite,
        notify_team_message,
        notify_sos_alert,
        push_enabled,
        push_sound,
        distance_unit,
        elevation_unit,
        language
    )
SELECT id, 'public', 'hiking_only', 1, 1, 1, 1, 1, 1, 1, 'km', 'm', 'zh-CN'
FROM tmp_users;

DELETE FROM user_photos
WHERE
    user_id IN (
        SELECT id
        FROM tmp_users
    );

INSERT INTO
    user_photos (
        id,
        user_id,
        photo_url,
        sort_order
    )
SELECT UUID(), t.id, CONCAT(
        'https://picsum.photos/800/600?random=', t.rn * 100 + s.n
    ), s.n
FROM tmp_users t
    CROSS JOIN (
        SELECT 1 AS n
        UNION ALL
        SELECT 2
        UNION ALL
        SELECT 3
    ) s;

DELETE FROM user_preferences
WHERE
    user_id IN (
        SELECT id
        FROM tmp_users
    );

INSERT INTO
    user_preferences (
        id,
        user_id,
        preference_type,
        preference_value
    )
SELECT
    UUID(),
    t.id,
    'time',
    CASE MOD(t.rn, 5)
        WHEN 1 THEN 'morning'
        WHEN 2 THEN 'afternoon'
        WHEN 3 THEN 'evening'
        WHEN 4 THEN 'weekend'
        ELSE 'weekday'
    END
FROM tmp_users t;

INSERT INTO
    user_preferences (
        id,
        user_id,
        preference_type,
        preference_value
    )
SELECT
    UUID(),
    t.id,
    'type',
    CASE MOD(t.rn, 6)
        WHEN 1 THEN 'sunrise'
        WHEN 2 THEN 'sunset'
        WHEN 3 THEN 'classic'
        WHEN 4 THEN 'adventure'
        WHEN 5 THEN 'leisure'
        ELSE 'training'
    END
FROM tmp_users t;

INSERT INTO
    user_preferences (
        id,
        user_id,
        preference_type,
        preference_value
    )
SELECT
    UUID(),
    t.id,
    'distance',
    CASE MOD(t.rn, 3)
        WHEN 1 THEN 'short'
        WHEN 2 THEN 'medium'
        ELSE 'long'
    END
FROM tmp_users t;

INSERT INTO
    user_preferences (
        id,
        user_id,
        preference_type,
        preference_value
    )
SELECT
    UUID(),
    t.id,
    'special',
    CASE MOD(t.rn, 4)
        WHEN 1 THEN '摄影'
        WHEN 2 THEN '露营'
        WHEN 3 THEN '观星'
        ELSE '美食'
    END
FROM tmp_users t;

INSERT INTO
    user_preferences (
        id,
        user_id,
        preference_type,
        preference_value
    )
SELECT
    UUID(),
    t.id,
    'interest',
    CASE MOD(t.rn, 4)
        WHEN 1 THEN '风景拍摄'
        WHEN 2 THEN '路线打卡'
        WHEN 3 THEN '户外社交'
        ELSE '轻松徒步'
    END
FROM tmp_users t;

INSERT IGNORE INTO
    user_follows (follower_id, following_id)
SELECT u1.id, u2.id
FROM tmp_users u1
    JOIN tmp_users2 u2 ON u1.id <> u2.id;

INSERT IGNORE INTO
    user_followers (id, follower_id, following_id)
SELECT UUID(), u1.id, u2.id
FROM tmp_users u1
    JOIN tmp_users2 u2 ON u1.id <> u2.id;

INSERT INTO
    friendships (
        user_id,
        friend_id,
        status,
        initiated_by,
        message,
        accepted_at,
        created_at,
        updated_at
    )
SELECT u1.id, u2.id, 'accepted', u1.id, '自动互关', NOW(), NOW(), NOW()
FROM tmp_users u1
    JOIN tmp_users2 u2 ON u1.id < u2.id
WHERE
    NOT EXISTS (
        SELECT 1
        FROM friendships f
        WHERE (
                f.user_id = u1.id
                AND f.friend_id = u2.id
            )
            OR (
                f.user_id = u2.id
                AND f.friend_id = u1.id
            )
    );

INSERT IGNORE INTO
    conversations (
        user_id1,
        user_id2,
        created_at,
        updated_at
    )
SELECT LEAST(u1.id, u2.id), GREATEST(u1.id, u2.id), NOW(), NOW()
FROM tmp_users u1
    JOIN tmp_users2 u2 ON u1.id < u2.id;

INSERT INTO
    messages (
        conversation_id,
        sender_id,
        content,
        content_type,
        created_at
    )
SELECT
    c.id,
    CASE s.seq
        WHEN 1 THEN c.user_id1
        WHEN 2 THEN c.user_id2
        ELSE c.user_id1
    END,
    CASE s.seq
        WHEN 1 THEN CONCAT(
            '你好，我是',
            u1.nickname,
            '，很高兴认识你！'
        )
        WHEN 2 THEN CONCAT(
            '嗨，',
            u2.nickname,
            '，一起约个徒步吧？'
        )
        ELSE '周末有空一起爬山吗？'
    END,
    'text',
    DATE_SUB(
        NOW(),
        INTERVAL(3 - s.seq) HOUR
    )
FROM
    conversations c
    JOIN users u1 ON u1.id = c.user_id1
    JOIN users u2 ON u2.id = c.user_id2
    JOIN (
        SELECT 1 AS seq
        UNION ALL
        SELECT 2
        UNION ALL
        SELECT 3
    ) s
WHERE
    NOT EXISTS (
        SELECT 1
        FROM messages m
        WHERE
            m.conversation_id = c.id
    );

UPDATE conversations c
JOIN (
    SELECT
        m.conversation_id,
        m.id AS last_id,
        m.created_at AS last_at,
        m.content AS last_content
    FROM messages m
        JOIN (
            SELECT conversation_id, MAX(created_at) AS max_time
            FROM messages
            GROUP BY
                conversation_id
        ) t ON t.conversation_id = m.conversation_id
        AND t.max_time = m.created_at
) lm ON lm.conversation_id = c.id
SET
    c.last_message_id = lm.last_id,
    c.last_message_at = lm.last_at,
    c.last_message_content = LEFT(lm.last_content, 255),
    c.user1_unread_count = 0,
    c.user2_unread_count = 0;

-- ==========================================
-- 扩展数据：方案A/B/C
-- ==========================================
SET @user_count := ( SELECT COUNT(*) FROM tmp_users );

DROP TEMPORARY TABLE IF EXISTS tmp_nums;

CREATE TEMPORARY TABLE tmp_nums (n INT PRIMARY KEY);

INSERT INTO
    tmp_nums (n)
VALUES (1),
    (2),
    (3),
    (4),
    (5),
    (6),
    (7),
    (8),
    (9),
    (10),
    (11),
    (12),
    (13),
    (14),
    (15),
    (16),
    (17),
    (18),
    (19),
    (20),
    (21),
    (22),
    (23),
    (24),
    (25),
    (26),
    (27),
    (28),
    (29),
    (30),
    (31),
    (32),
    (33),
    (34),
    (35),
    (36),
    (37),
    (38),
    (39),
    (40),
    (41),
    (42),
    (43),
    (44),
    (45),
    (46),
    (47),
    (48),
    (49),
    (50),
    (51),
    (52),
    (53),
    (54),
    (55),
    (56),
    (57),
    (58),
    (59),
    (60),
    (61),
    (62),
    (63),
    (64),
    (65),
    (66),
    (67),
    (68),
    (69),
    (70),
    (71),
    (72),
    (73),
    (74),
    (75),
    (76),
    (77),
    (78),
    (79),
    (80),
    (81),
    (82),
    (83),
    (84),
    (85),
    (86),
    (87),
    (88),
    (89),
    (90),
    (91),
    (92),
    (93),
    (94),
    (95),
    (96),
    (97),
    (98),
    (99),
    (100);

-- 方案A：每对好友追加 20 条消息
INSERT INTO
    messages (
        conversation_id,
        sender_id,
        content,
        content_type,
        created_at
    )
SELECT
    c.id,
    CASE
        WHEN MOD(n.n, 2) = 1 THEN c.user_id1
        ELSE c.user_id2
    END,
    CONCAT(
        '追加聊天消息 #',
        n.n,
        ' - ',
        u1.nickname,
        ' & ',
        u2.nickname
    ),
    'text',
    DATE_SUB(
        NOW(),
        INTERVAL(20 - n.n) MINUTE
    )
FROM
    conversations c
    JOIN users u1 ON u1.id = c.user_id1
    JOIN users u2 ON u2.id = c.user_id2
    JOIN tmp_nums n ON n.n <= 20;

-- 方案B：新增 20 个活动
DROP TEMPORARY TABLE IF EXISTS tmp_new_activities;

CREATE TEMPORARY TABLE tmp_new_activities AS
SELECT UUID() AS id, n.n AS seq, t.id AS creator_id
FROM tmp_nums n
    JOIN tmp_users t ON t.rn = MOD(n.n - 1, @user_count) + 1
WHERE
    n.n <= 20;

INSERT INTO
    activities (
        id,
        creator_id,
        title,
        description,
        cover_image_url,
        location,
        latitude,
        longitude,
        start_time,
        end_time,
        difficulty,
        max_participants,
        status,
        route_description,
        equipment_required,
        created_at,
        updated_at
    )
SELECT
    a.id,
    a.creator_id,
    CONCAT('测试活动 ', a.seq),
    CONCAT('这是用于测试的活动描述 ', a.seq),
    CONCAT(
        'https://picsum.photos/800/600?random=activity',
        a.seq
    ),
    '北京市海淀区',
    39.90 + a.seq * 0.001,
    116.30 + a.seq * 0.001,
    DATE_ADD(NOW(), INTERVAL a.seq DAY),
    DATE_ADD(NOW(), INTERVAL a.seq DAY) + INTERVAL 3 HOUR,
    CASE MOD(a.seq, 3)
        WHEN 1 THEN 'easy'
        WHEN 2 THEN 'moderate'
        ELSE 'hard'
    END,
    10 + MOD(a.seq, 6),
    'pending',
    '沿途风景优美，适合徒步',
    '登山鞋、饮水、外套',
    NOW(),
    NOW()
FROM tmp_new_activities a;

-- 方案B：新增 60 条报名（每活动 3 条）
INSERT INTO
    applications (
        user_id,
        activity_id,
        status,
        message,
        created_at,
        updated_at
    )
SELECT u.id, a.id, 'pending', CONCAT('申请参加活动 ', a.seq), NOW(), NOW()
FROM
    tmp_new_activities a
    JOIN tmp_nums n ON n.n <= 3
    JOIN tmp_users2 u ON u.rn = MOD(a.seq + n.n - 1, @user_count) + 1
WHERE
    u.id <> a.creator_id;

-- 方案C：新增 10 条路线
DROP TEMPORARY TABLE IF EXISTS tmp_new_routes;

CREATE TEMPORARY TABLE tmp_new_routes AS
SELECT UUID() AS id, n.n AS seq, t.id AS creator_id
FROM tmp_nums n
    JOIN tmp_users t ON t.rn = MOD(n.n - 1, @user_count) + 1
WHERE
    n.n <= 10;

INSERT INTO
    routes (
        id,
        name,
        description,
        difficulty,
        distance,
        elevation_gain,
        elevation_loss,
        estimated_duration,
        season,
        route_type,
        start_point,
        end_point,
        region,
        creator_id,
        status,
        privacy,
        view_count,
        favorite_count,
        completion_count,
        rating_avg,
        rating_count,
        is_verified,
        cover_image,
        images,
        warnings,
        created_at,
        updated_at
    )
SELECT
    r.id,
    CONCAT('测试路线 ', r.seq),
    '测试路线描述',
    CASE MOD(r.seq, 4)
        WHEN 1 THEN 'easy'
        WHEN 2 THEN 'moderate'
        WHEN 3 THEN 'hard'
        ELSE 'expert'
    END,
    5 + r.seq,
    200 + r.seq * 5,
    180 + r.seq * 4,
    120 + r.seq * 5,
    '全年',
    'loop',
    ST_GeomFromText(
        CONCAT(
            'POINT(',
            116.30 + r.seq * 0.01,
            ' ',
            39.90 + r.seq * 0.01,
            ')'
        )
    ),
    ST_GeomFromText(
        CONCAT(
            'POINT(',
            116.31 + r.seq * 0.01,
            ' ',
            39.91 + r.seq * 0.01,
            ')'
        )
    ),
    '北京',
    r.creator_id,
    'published',
    'public',
    0,
    0,
    0,
    0,
    0,
    0,
    CONCAT(
        'https://picsum.photos/800/600?random=route',
        r.seq
    ),
    NULL,
    '注意补给与天气变化',
    NOW(),
    NOW()
FROM tmp_new_routes r;

-- 方案C：新增 50 条轨迹
DROP TEMPORARY TABLE IF EXISTS tmp_new_tracks;

CREATE TEMPORARY TABLE tmp_new_tracks AS
SELECT n.n AS seq, t.id AS user_id, r.id AS route_id
FROM
    tmp_nums n
    JOIN tmp_users t ON t.rn = MOD(n.n - 1, @user_count) + 1
    JOIN tmp_new_routes r ON r.seq = MOD(n.n - 1, 10) + 1
WHERE
    n.n <= 50;

INSERT INTO
    tracks (
        user_id,
        route_id,
        name,
        description,
        total_distance,
        total_duration,
        total_elevation_gain,
        total_elevation_loss,
        max_altitude,
        min_altitude,
        avg_speed,
        max_speed,
        start_point,
        end_point,
        start_time,
        end_time,
        status,
        is_public,
        view_count,
        like_count,
        created_at,
        updated_at
    )
SELECT
    t.user_id,
    t.route_id,
    CONCAT('测试轨迹 ', t.seq),
    '测试轨迹描述',
    5 + t.seq * 0.5,
    3600 + t.seq * 10,
    200 + t.seq * 2,
    180 + t.seq * 2,
    1200 + t.seq,
    800 + t.seq,
    4 + t.seq * 0.1,
    8 + t.seq * 0.2,
    ST_GeomFromText(
        CONCAT(
            'POINT(',
            116.30 + t.seq * 0.002,
            ' ',
            39.90 + t.seq * 0.002,
            ')'
        )
    ),
    ST_GeomFromText(
        CONCAT(
            'POINT(',
            116.31 + t.seq * 0.002,
            ' ',
            39.91 + t.seq * 0.002,
            ')'
        )
    ),
    DATE_SUB(NOW(), INTERVAL t.seq DAY),
    DATE_SUB(NOW(), INTERVAL t.seq DAY) + INTERVAL 2 HOUR,
    'completed',
    1,
    0,
    0,
    NOW(),
    NOW()
FROM tmp_new_tracks t;

-- 方案C：最近 50 条轨迹临时表
DROP TEMPORARY TABLE IF EXISTS tmp_recent_tracks;

CREATE TEMPORARY TABLE tmp_recent_tracks AS
SELECT id, start_time, ROW_NUMBER() OVER (
        ORDER BY id DESC
    ) AS seq
FROM tracks
ORDER BY id DESC
LIMIT 50;

-- 方案C：轨迹点（每条 5 个）
INSERT INTO
    track_points (
        track_id,
        location,
        altitude,
        accuracy,
        speed,
        heading,
        recorded_at,
        heart_rate
    )
SELECT
    tr.id,
    ST_GeomFromText(
        CONCAT(
            'POINT(',
            116.30 + tr.seq * 0.002 + p.n * 0.0002,
            ' ',
            39.90 + tr.seq * 0.002 + p.n * 0.0002,
            ')'
        )
    ),
    500 + p.n * 5,
    5 + p.n,
    3 + p.n * 0.2,
    90 + p.n * 5,
    DATE_ADD(
        tr.start_time,
        INTERVAL p.n * 10 MINUTE
    ),
    80 + p.n * 2
FROM
    tmp_recent_tracks tr
    JOIN tmp_nums p ON p.n <= 5;

-- 方案C：新增 100 个点赞
INSERT INTO
    track_likes (track_id, user_id, created_at)
SELECT tr.id, u.id, NOW()
FROM
    tmp_nums n
    JOIN tmp_recent_tracks tr ON tr.seq = MOD(n.n - 1, 50) + 1
    JOIN tmp_users2 u ON u.rn = MOD(n.n - 1, @user_count) + 1
WHERE
    n.n <= 100;

-- 方案B：生成 40 条徒步报告 + 评论
DROP TEMPORARY TABLE IF EXISTS tmp_report_tracks;

CREATE TEMPORARY TABLE tmp_report_tracks AS
SELECT id AS track_id, seq
FROM tmp_recent_tracks
WHERE
    seq <= 40;

INSERT IGNORE INTO
    hiking_reports (
        track_id,
        user_id,
        title,
        content,
        weather,
        difficulty_rating,
        scenery_rating,
        cover_image_url,
        image_urls,
        view_count,
        like_count,
        comment_count,
        share_count,
        is_public,
        created_at,
        updated_at
    )
SELECT
    rt.track_id,
    u.id,
    CONCAT('测试徒步报告 ', rt.seq),
    '这是一段测试徒步报告内容。',
    '晴',
    4,
    5,
    CONCAT(
        'https://picsum.photos/800/600?random=report',
        rt.seq
    ),
    NULL,
    10,
    2,
    0,
    1,
    1,
    NOW(),
    NOW()
FROM
    tmp_report_tracks rt
    JOIN tmp_users u ON u.rn = MOD(rt.seq - 1, @user_count) + 1;

INSERT INTO
    report_comments (
        report_id,
        user_id,
        content,
        like_count,
        created_at,
        updated_at
    )
SELECT r.id, u.id, CONCAT('很棒的徒步报告！评论 #', rt.seq), 0, NOW(), NOW()
FROM
    hiking_reports r
    JOIN tmp_report_tracks rt ON rt.track_id = r.track_id
    JOIN tmp_users2 u ON u.rn = MOD(rt.seq, @user_count) + 1;

-- 追加聊天消息：每个会话再补 50 条
INSERT INTO
    messages (
        conversation_id,
        sender_id,
        content,
        content_type,
        created_at
    )
SELECT
    c.id,
    CASE
        WHEN MOD(n.n, 2) = 1 THEN c.user_id1
        ELSE c.user_id2
    END,
    CONCAT(
        '增量聊天消息 #',
        n.n,
        ' - ',
        u1.nickname,
        ' & ',
        u2.nickname
    ),
    'text',
    DATE_SUB(
        NOW(),
        INTERVAL(50 - n.n) MINUTE
    )
FROM
    conversations c
    JOIN users u1 ON u1.id = c.user_id1
    JOIN users u2 ON u2.id = c.user_id2
    JOIN tmp_nums n ON n.n <= 50;

-- 路线细分：标签、途径点、风险点、收藏
DROP TEMPORARY TABLE IF EXISTS tmp_recent_routes;

CREATE TEMPORARY TABLE tmp_recent_routes AS
SELECT id, ROW_NUMBER() OVER (
        ORDER BY id DESC
    ) AS seq
FROM routes
ORDER BY id DESC
LIMIT 10;

INSERT INTO
    route_tags (
        id,
        route_id,
        tag_name,
        created_at
    )
SELECT
    UUID(),
    r.id,
    CASE MOD(n.n, 3)
        WHEN 1 THEN '风景'
        WHEN 2 THEN '打卡'
        ELSE '轻松'
    END,
    NOW()
FROM
    tmp_recent_routes r
    JOIN tmp_nums n ON n.n <= 3;

INSERT INTO
    route_waypoints (
        id,
        route_id,
        name,
        description,
        location,
        elevation,
        order_index,
        waypoint_type,
        estimated_arrival_time,
        distance_from_start,
        photos,
        tips,
        created_at,
        updated_at
    )
SELECT
    UUID(),
    r.id,
    CONCAT('途径点 ', n.n),
    '示例途径点说明',
    ST_GeomFromText(
        CONCAT(
            'POINT(',
            116.30 + r.seq * 0.01 + n.n * 0.001,
            ' ',
            39.90 + r.seq * 0.01 + n.n * 0.001,
            ')'
        )
    ),
    500 + n.n * 10,
    n.n,
    CASE n.n
        WHEN 1 THEN 'start'
        WHEN 5 THEN 'end'
        ELSE 'checkpoint'
    END,
    n.n * 20,
    n.n * 2.5,
    NULL,
    '注意补给与防晒',
    NOW(),
    NOW()
FROM
    tmp_recent_routes r
    JOIN tmp_nums n ON n.n <= 5;

INSERT INTO
    route_risk_points (
        id,
        route_id,
        location,
        name,
        risk_type,
        risk_level,
        description,
        mitigation,
        active_seasons,
        created_at,
        updated_at
    )
SELECT
    UUID(),
    r.id,
    ST_GeomFromText(
        CONCAT(
            'POINT(',
            116.32 + r.seq * 0.01 + n.n * 0.001,
            ' ',
            39.92 + r.seq * 0.01 + n.n * 0.001,
            ')'
        )
    ),
    CONCAT('风险点 ', n.n),
    CASE n.n
        WHEN 1 THEN 'steep_slope'
        ELSE 'weather'
    END,
    CASE n.n
        WHEN 1 THEN 'medium'
        ELSE 'low'
    END,
    '注意路滑或天气变化',
    '结伴而行并注意装备',
    '春夏秋',
    NOW(),
    NOW()
FROM
    tmp_recent_routes r
    JOIN tmp_nums n ON n.n <= 2;

INSERT INTO
    route_favorites (
        id,
        route_id,
        user_id,
        created_at
    )
SELECT UUID(), r.id, u.id, NOW()
FROM
    tmp_recent_routes r
    JOIN tmp_users u ON u.rn = MOD(r.seq + u.rn, @user_count) + 1
LIMIT 30;

-- 轨迹细分：追加更多轨迹点（每条 10 个）
INSERT INTO
    track_points (
        track_id,
        location,
        altitude,
        accuracy,
        speed,
        heading,
        recorded_at,
        heart_rate
    )
SELECT
    tr.id,
    ST_GeomFromText(
        CONCAT(
            'POINT(',
            116.35 + tr.seq * 0.002 + p.n * 0.0002,
            ' ',
            39.95 + tr.seq * 0.002 + p.n * 0.0002,
            ')'
        )
    ),
    600 + p.n * 4,
    6 + p.n,
    3 + p.n * 0.3,
    80 + p.n * 4,
    DATE_ADD(
        tr.start_time,
        INTERVAL(p.n + 5) * 8 MINUTE
    ),
    85 + p.n * 2
FROM
    tmp_recent_tracks tr
    JOIN tmp_nums p ON p.n <= 10;

-- 评论细分：每条徒步报告再补 2 条评论
INSERT INTO
    report_comments (
        report_id,
        user_id,
        content,
        like_count,
        created_at,
        updated_at
    )
SELECT r.id, u.id, CONCAT(
        '补充评论 #', n.n, ' 给报告 ', rt.seq
    ), 0, NOW(), NOW()
FROM
    hiking_reports r
    JOIN tmp_report_tracks rt ON rt.track_id = r.track_id
    JOIN tmp_nums n ON n.n <= 2
    JOIN tmp_users2 u ON u.rn = MOD(rt.seq + n.n, @user_count) + 1;

-- 更新会话最后一条消息（含新增消息）
UPDATE conversations c
JOIN (
    SELECT
        m.conversation_id,
        m.id AS last_id,
        m.created_at AS last_at,
        m.content AS last_content
    FROM messages m
        JOIN (
            SELECT conversation_id, MAX(created_at) AS max_time
            FROM messages
            GROUP BY
                conversation_id
        ) t ON t.conversation_id = m.conversation_id
        AND t.max_time = m.created_at
) lm ON lm.conversation_id = c.id
SET
    c.last_message_id = lm.last_id,
    c.last_message_at = lm.last_at,
    c.last_message_content = LEFT(lm.last_content, 255),
    c.user1_unread_count = 0,
    c.user2_unread_count = 0;

COMMIT;
