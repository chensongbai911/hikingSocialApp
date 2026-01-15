-- ========================================
-- 徒步社交App - 测试数据脚本
-- 版本: v1.0
-- 创建时间: 2026-01-14
-- 说明: 包含用户、活动、参与关系、偏好、相册等测试数据
-- ========================================

USE hiking_app;

-- 清空现有数据（谨慎使用！）
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE messages;
TRUNCATE TABLE conversations;
TRUNCATE TABLE participations;
TRUNCATE TABLE activities;
TRUNCATE TABLE user_photos;
TRUNCATE TABLE user_preferences;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- ========================================
-- 1. 插入测试用户 (10个用户)
-- ========================================

INSERT INTO users (id, email, password_hash, nickname, avatar_url, gender, age, bio, hiking_level, is_active, is_verified, created_at) VALUES
-- 密码都是: password123 的bcrypt哈希值
('user-001', 'zhangsan@test.com', '$2b$10$rZ9V8h6qNzK5YmD4xJ3yYOu8yqF3fX2wL1pQ5tR6vN7cM9eG4hK8m', '山间清风', 'https://via.placeholder.com/200/14b8a6/ffffff?text=User1', 'male', 28, '热爱户外，享受自然。喜欢在徒步中放空自己，感受大自然的美好。希望能结识更多志同道合的朋友，一起探索未知的风景。', 'intermediate', TRUE, TRUE, '2025-12-01 10:00:00'),

('user-002', 'lisi@test.com', '$2b$10$rZ9V8h6qNzK5YmD4xJ3yYOu8yqF3fX2wL1pQ5tR6vN7cM9eG4hK8m', '徒步达人', 'https://via.placeholder.com/200/0ea5e9/ffffff?text=User2', 'female', 25, '资深徒步爱好者，走过国内外30+条经典路线。喜欢分享徒步经验，带领新手入门。周末经常组织活动。', 'advanced', TRUE, TRUE, '2025-12-02 11:00:00'),

('user-003', 'wangwu@test.com', '$2b$10$rZ9V8h6qNzK5YmD4xJ3yYOu8yqF3fX2wL1pQ5tR6vN7cM9eG4hK8m', '户外小白', 'https://via.placeholder.com/200/f59e0b/ffffff?text=User3', 'male', 22, '刚开始接触徒步运动，希望能跟着大家一起学习，感受大自然的魅力。喜欢轻松的短途徒步。', 'beginner', TRUE, FALSE, '2025-12-03 12:00:00'),

('user-004', 'zhaoliu@test.com', '$2b$10$rZ9V8h6qNzK5YmD4xJ3yYOu8yqF3fX2wL1pQ5tR6vN7cM9eG4hK8m', '风景摄影师', 'https://via.placeholder.com/200/ec4899/ffffff?text=User4', 'female', 30, '专业摄影师，热爱户外风景拍摄。徒步的同时记录美丽瞬间。欢迎爱摄影的朋友一起交流。', 'intermediate', TRUE, TRUE, '2025-12-04 13:00:00'),

('user-005', 'sunqi@test.com', '$2b$10$rZ9V8h6qNzK5YmD4xJ3yYOu8yqF3fX2wL1pQ5tR6vN7cM9eG4hK8m', '周末探险家', 'https://via.placeholder.com/200/8b5cf6/ffffff?text=User5', 'male', 32, '上班族，只有周末有时间。喜欢探索城市周边的徒步路线，享受周末的户外时光。', 'intermediate', TRUE, TRUE, '2025-12-05 14:00:00'),

('user-006', 'qianba@test.com', '$2b$10$rZ9V8h6qNzK5YmD4xJ3yYOu8yqF3fX2wL1pQ5tR6vN7cM9eG4hK8m', '爱宠人士', 'https://via.placeholder.com/200/10b981/ffffff?text=User6', 'female', 27, '铲屎官一枚，喜欢带着狗狗一起徒步。希望找到更多宠物友好的户外路线和同好。', 'beginner', TRUE, FALSE, '2025-12-06 15:00:00'),

('user-007', 'zhoujiu@test.com', '$2b$10$rZ9V8h6qNzK5YmD4xJ3yYOu8yqF3fX2wL1pQ5tR6vN7cM9eG4hK8m', '长距离挑战者', 'https://via.placeholder.com/200/f97316/ffffff?text=User7', 'male', 35, '热爱长距离徒步，参加过多次50km+的徒步活动。享受挑战自我极限的过程。', 'advanced', TRUE, TRUE, '2025-12-07 16:00:00'),

('user-008', 'wushi@test.com', '$2b$10$rZ9V8h6qNzK5YmD4xJ3yYOu8yqF3fX2wL1pQ5tR6vN7cM9eG4hK8m', '轻松休闲派', 'https://via.placeholder.com/200/6366f1/ffffff?text=User8', 'female', 24, '不追求高难度，只想轻松地走走看看。喜欢5-10公里的休闲路线，边走边聊。', 'beginner', TRUE, FALSE, '2025-12-08 17:00:00'),

('user-009', 'zhengshiyi@test.com', '$2b$10$rZ9V8h6qNzK5YmD4xJ3yYOu8yqF3fX2wL1pQ5tR6vN7cM9eG4hK8m', '露营爱好者', 'https://via.placeholder.com/200/14b8a6/ffffff?text=User9', 'male', 29, '热爱重装露营徒步，喜欢在山野间过夜的感觉。装备党，欢迎交流装备心得。', 'advanced', TRUE, TRUE, '2025-12-09 18:00:00'),

('user-010', 'wangshier@test.com', '$2b$10$rZ9V8h6qNzK5YmD4xJ3yYOu8yqF3fX2wL1pQ5tR6vN7cM9eG4hK8m', '社交达人', 'https://via.placeholder.com/200/0ea5e9/ffffff?text=User10', 'female', 26, '外向活泼，喜欢认识新朋友。徒步对我来说是社交的好方式，结交志同道合的伙伴。', 'beginner', TRUE, TRUE, '2025-12-10 19:00:00');

-- ========================================
-- 2. 插入用户偏好 (每个用户5-8个偏好)
-- ========================================

INSERT INTO user_preferences (id, user_id, preference_type, preference_value, created_at) VALUES
-- user-001 的偏好
('pref-001-01', 'user-001', 'time', '周末出发', NOW()),
('pref-001-02', 'user-001', 'type', '休闲徒步', NOW()),
('pref-001-03', 'user-001', 'special', '宠物友好', NOW()),
('pref-001-04', 'user-001', 'distance', '5-10km', NOW()),
('pref-001-05', 'user-001', 'interest', '爱看风景', NOW()),

-- user-002 的偏好
('pref-002-01', 'user-002', 'time', '周末出发', NOW()),
('pref-002-02', 'user-002', 'type', '挑战路线', NOW()),
('pref-002-03', 'user-002', 'distance', '20km+', NOW()),
('pref-002-04', 'user-002', 'interest', '团队协作', NOW()),
('pref-002-05', 'user-002', 'special', '高难度爬升', NOW()),

-- user-003 的偏好
('pref-003-01', 'user-003', 'time', '周末出发', NOW()),
('pref-003-02', 'user-003', 'type', '休闲徒步', NOW()),
('pref-003-03', 'user-003', 'distance', '5-10km', NOW()),
('pref-003-04', 'user-003', 'interest', '爱看风景', NOW()),

-- user-004 的偏好
('pref-004-01', 'user-004', 'time', '周末出发', NOW()),
('pref-004-02', 'user-004', 'type', '休闲徒步', NOW()),
('pref-004-03', 'user-004', 'distance', '10-20km', NOW()),
('pref-004-04', 'user-004', 'interest', '风景摄影', NOW()),
('pref-004-05', 'user-004', 'interest', '爱看风景', NOW()),

-- user-005 的偏好
('pref-005-01', 'user-005', 'time', '周末出发', NOW()),
('pref-005-02', 'user-005', 'type', '休闲徒步', NOW()),
('pref-005-03', 'user-005', 'distance', '5-10km', NOW()),
('pref-005-04', 'user-005', 'distance', '10-20km', NOW()),

-- user-006 的偏好
('pref-006-01', 'user-006', 'time', '周末出发', NOW()),
('pref-006-02', 'user-006', 'type', '休闲徒步', NOW()),
('pref-006-03', 'user-006', 'special', '宠物友好', NOW()),
('pref-006-04', 'user-006', 'distance', '5-10km', NOW()),

-- user-007 的偏好
('pref-007-01', 'user-007', 'type', '挑战路线', NOW()),
('pref-007-02', 'user-007', 'distance', '20km+', NOW()),
('pref-007-03', 'user-007', 'special', '高难度爬升', NOW()),
('pref-007-04', 'user-007', 'special', '重装露营', NOW()),

-- user-008 的偏好
('pref-008-01', 'user-008', 'time', '周末出发', NOW()),
('pref-008-02', 'user-008', 'type', '休闲徒步', NOW()),
('pref-008-03', 'user-008', 'distance', '5-10km', NOW()),
('pref-008-04', 'user-008', 'interest', '单身交友', NOW()),

-- user-009 的偏好
('pref-009-01', 'user-009', 'type', '挑战路线', NOW()),
('pref-009-02', 'user-009', 'distance', '20km+', NOW()),
('pref-009-03', 'user-009', 'special', '重装露营', NOW()),
('pref-009-04', 'user-009', 'interest', '户外烹饪', NOW()),

-- user-010 的偏好
('pref-010-01', 'user-010', 'time', '周末出发', NOW()),
('pref-010-02', 'user-010', 'type', '休闲徒步', NOW()),
('pref-010-03', 'user-010', 'distance', '5-10km', NOW()),
('pref-010-04', 'user-010', 'interest', '单身交友', NOW());

-- ========================================
-- 3. 插入用户相册照片 (每个用户3-5张)
-- ========================================

INSERT INTO user_photos (id, user_id, photo_url, sort_order, created_at) VALUES
-- user-001 的照片
('photo-001-01', 'user-001', 'https://via.placeholder.com/400/14b8a6/ffffff?text=Photo1', 1, NOW()),
('photo-001-02', 'user-001', 'https://via.placeholder.com/400/0ea5e9/ffffff?text=Photo2', 2, NOW()),
('photo-001-03', 'user-001', 'https://via.placeholder.com/400/f59e0b/ffffff?text=Photo3', 3, NOW()),
('photo-001-04', 'user-001', 'https://via.placeholder.com/400/ec4899/ffffff?text=Photo4', 4, NOW()),

-- user-002 的照片
('photo-002-01', 'user-002', 'https://via.placeholder.com/400/8b5cf6/ffffff?text=Photo1', 1, NOW()),
('photo-002-02', 'user-002', 'https://via.placeholder.com/400/10b981/ffffff?text=Photo2', 2, NOW()),
('photo-002-03', 'user-002', 'https://via.placeholder.com/400/f97316/ffffff?text=Photo3', 3, NOW()),
('photo-002-04', 'user-002', 'https://via.placeholder.com/400/6366f1/ffffff?text=Photo4', 4, NOW()),
('photo-002-05', 'user-002', 'https://via.placeholder.com/400/14b8a6/ffffff?text=Photo5', 5, NOW()),

-- user-003 的照片
('photo-003-01', 'user-003', 'https://via.placeholder.com/400/0ea5e9/ffffff?text=Photo1', 1, NOW()),
('photo-003-02', 'user-003', 'https://via.placeholder.com/400/f59e0b/ffffff?text=Photo2', 2, NOW()),
('photo-003-03', 'user-003', 'https://via.placeholder.com/400/ec4899/ffffff?text=Photo3', 3, NOW()),

-- user-004 的照片
('photo-004-01', 'user-004', 'https://via.placeholder.com/400/8b5cf6/ffffff?text=Photo1', 1, NOW()),
('photo-004-02', 'user-004', 'https://via.placeholder.com/400/10b981/ffffff?text=Photo2', 2, NOW()),
('photo-004-03', 'user-004', 'https://via.placeholder.com/400/f97316/ffffff?text=Photo3', 3, NOW()),
('photo-004-04', 'user-004', 'https://via.placeholder.com/400/6366f1/ffffff?text=Photo4', 4, NOW()),

-- user-005 的照片
('photo-005-01', 'user-005', 'https://via.placeholder.com/400/14b8a6/ffffff?text=Photo1', 1, NOW()),
('photo-005-02', 'user-005', 'https://via.placeholder.com/400/0ea5e9/ffffff?text=Photo2', 2, NOW()),
('photo-005-03', 'user-005', 'https://via.placeholder.com/400/f59e0b/ffffff?text=Photo3', 3, NOW());

-- ========================================
-- 4. 插入活动数据 (15个活动，不同状态)
-- ========================================

INSERT INTO activities (id, creator_id, title, description, cover_image_url, location, latitude, longitude, start_time, end_time, difficulty, max_participants, status, route_description, equipment_required, created_at) VALUES

-- 已批准的活动 (approved)
('act-001', 'user-001', '螺髻山国家森林公园徒步', '探索螺髻山的原始森林，欣赏高山草甸和瀑布景观。适合中级徒步爱好者。', 'https://via.placeholder.com/800x400/14b8a6/ffffff?text=Activity1', '四川省凉山州西昌市', 27.6547, 102.1891, '2026-01-20 08:00:00', '2026-01-20 17:00:00', 'moderate', 15, 'approved', '从游客中心出发，沿森林步道上山，途经3个观景台，往返约12公里。', '登山鞋、登山杖、防晒用品、充足的水和食物', '2026-01-10 10:00:00'),

('act-002', 'user-002', '香山红叶登山活动', '秋季赏红叶，登香山赏美景。轻松休闲的周末活动，适合新手参加。', 'https://via.placeholder.com/800x400/f59e0b/ffffff?text=Activity2', '北京市海淀区香山', 39.9900, 116.1911, '2026-01-18 09:00:00', '2026-01-18 15:00:00', 'easy', 20, 'approved', '从香山公园东门出发，沿香炉峰步道登顶，往返约8公里。', '运动鞋、轻便背包、水壶', '2026-01-11 11:00:00'),

('act-003', 'user-002', '百望山森林氧吧徒步', '城市绿肺，轻松徒步。适合下午茶后的轻量运动，家庭友好。', 'https://via.placeholder.com/800x400/10b981/ffffff?text=Activity3', '北京市海淀区百望山', 40.0500, 116.2100, '2026-01-25 14:00:00', '2026-01-25 17:00:00', 'easy', 25, 'approved', '从百望山南门进入，环山步道徒步，全程约5公里。', '运动鞋、水壶、防晒帽', '2026-01-12 12:00:00'),

('act-004', 'user-004', '黄山经典路线两日游', '登黄山，观日出云海，拍摄最美风景。需要一定体力，适合摄影爱好者。', 'https://via.placeholder.com/800x400/ec4899/ffffff?text=Activity4', '安徽省黄山市黄山区', 30.1333, 118.1667, '2026-02-01 06:00:00', '2026-02-02 18:00:00', 'hard', 12, 'approved', '第一天从慈光阁上山，经玉屏楼到光明顶，住宿山顶；第二天观日出后，经始信峰、白鹅岭下山。', '登山鞋、登山杖、保暖衣物、头灯、睡袋（山顶住宿）', '2026-01-13 13:00:00'),

('act-005', 'user-005', '周末爬长城', '徒步慕田峪长城，感受古代建筑的雄伟。适合周末休闲，可带家人。', 'https://via.placeholder.com/800x400/6366f1/ffffff?text=Activity5', '北京市怀柔区慕田峪', 40.4319, 116.5658, '2026-01-19 08:30:00', '2026-01-19 16:00:00', 'moderate', 18, 'approved', '从慕田峪长城景区入口开始，徒步至第20号敌楼，往返约10公里。', '运动鞋、防风外套、水和零食', '2026-01-14 14:00:00'),

-- 进行中的活动 (ongoing)
('act-006', 'user-007', '太行山大峡谷穿越', '挑战性路线，穿越太行山大峡谷，体验悬崖峭壁的壮观景色。仅限资深徒步者。', 'https://via.placeholder.com/800x400/f97316/ffffff?text=Activity6', '河北省邯郸市涉县', 36.5825, 113.7010, '2026-01-15 07:00:00', '2026-01-16 19:00:00', 'hard', 10, 'ongoing', '两天穿越行程，第一天从井底村出发，穿越峡谷到达营地；第二天继续穿越至终点王莽岭。全程约35公里。', '专业登山鞋、登山杖、帐篷、睡袋、GPS、急救包、充足食物和水', '2026-01-08 15:00:00'),

('act-007', 'user-002', '泰山日出登山', '夜爬泰山，观日出东方。经典路线，感受"五岳独尊"的魅力。', 'https://via.placeholder.com/800x400/8b5cf6/ffffff?text=Activity7', '山东省泰安市泰山区', 36.2544, 117.1007, '2026-01-17 22:00:00', '2026-01-18 12:00:00', 'moderate', 20, 'ongoing', '晚上10点从红门出发，沿中天门、十八盘登顶，凌晨5点观日出，上午下山。', '登山鞋、登山杖、头灯、保暖衣物、手套、口罩', '2026-01-09 16:00:00'),

-- 待审核的活动 (pending)
('act-008', 'user-003', '颐和园环湖徒步', '绕颐和园昆明湖徒步一圈，轻松休闲，适合初学者和家庭活动。', 'https://via.placeholder.com/800x400/14b8a6/ffffff?text=Activity8', '北京市海淀区颐和园', 39.9995, 116.2750, '2026-01-22 10:00:00', '2026-01-22 14:00:00', 'easy', 30, 'pending', '从东宫门进入，沿昆明湖环湖步道徒步，全程约6公里。', '运动鞋、遮阳帽、水壶', '2026-01-14 17:00:00'),

('act-009', 'user-006', '宠物友好森林徒步', '带上你的毛孩子一起徒步！探索北京周边宠物友好的森林步道。', 'https://via.placeholder.com/800x400/0ea5e9/ffffff?text=Activity9', '北京市门头沟区妙峰山', 40.0500, 116.0100, '2026-01-26 09:00:00', '2026-01-26 16:00:00', 'easy', 15, 'pending', '从妙峰山景区入口出发，沿宠物友好步道徒步，全程约7公里。', '宠物牵引绳、宠物水壶、运动鞋、水和零食', '2026-01-14 18:00:00'),

('act-010', 'user-009', '露营徒步两日行', '重装徒步+野外露营，体验户外生活。需要露营经验，装备齐全。', 'https://via.placeholder.com/800x400/f59e0b/ffffff?text=Activity10', '河北省承德市围场县', 41.9500, 117.7600, '2026-02-08 08:00:00', '2026-02-09 17:00:00', 'hard', 8, 'pending', '第一天徒步15公里到达营地，搭建帐篷，野炊；第二天早餐后拔营，徒步12公里返回。', '帐篷、睡袋、防潮垫、炉具、食材、登山鞋、登山杖、GPS', '2026-01-14 19:00:00'),

-- 已完成的活动 (completed)
('act-011', 'user-001', '八达岭长城徒步', '经典长城徒步路线，感受历史文化。已成功举办，参与者反响热烈。', 'https://via.placeholder.com/800x400/ec4899/ffffff?text=Activity11', '北京市延庆区八达岭', 40.3570, 116.0152, '2025-12-28 08:00:00', '2025-12-28 16:00:00', 'moderate', 20, 'completed', '从八达岭长城北门出发，徒步至南门，往返约12公里。', '登山鞋、防风外套、水和食物', '2025-12-20 10:00:00'),

('act-012', 'user-005', '奥林匹克森林公园跑步', '轻松跑步+徒步活动，适合运动爱好者。已成功完成。', 'https://via.placeholder.com/800x400/10b981/ffffff?text=Activity12', '北京市朝阳区奥森公园', 40.0100, 116.3900, '2026-01-05 07:00:00', '2026-01-05 09:00:00', 'easy', 25, 'completed', '从南门进入，沿主园路跑步+快走，全程约8公里。', '跑鞋、运动服、水壶', '2025-12-28 15:00:00'),

('act-013', 'user-004', '天坛公园摄影徒步', '边走边拍，记录天坛的四季之美。摄影爱好者的聚会活动。', 'https://via.placeholder.com/800x400/8b5cf6/ffffff?text=Activity13', '北京市东城区天坛', 39.8825, 116.4072, '2026-01-08 14:00:00', '2026-01-08 17:00:00', 'easy', 15, 'completed', '从天坛南门进入，环绕祈年殿、回音壁等景点徒步摄影，全程约5公里。', '相机、运动鞋、遮阳帽', '2026-01-02 16:00:00'),

-- 已取消的活动 (cancelled)
('act-014', 'user-008', '雨天取消-植物园徒步', '原定活动因天气原因取消。', 'https://via.placeholder.com/800x400/6366f1/ffffff?text=Activity14', '北京市海淀区植物园', 40.0050, 116.2000, '2026-01-12 10:00:00', '2026-01-12 14:00:00', 'easy', 20, 'cancelled', '从植物园南门进入，环游园区，全程约6公里。', '运动鞋、雨具（备用）', '2026-01-10 17:00:00'),

('act-015', 'user-010', '临时取消-圆明园徒步', '因组织者个人原因临时取消。', 'https://via.placeholder.com/800x400/14b8a6/ffffff?text=Activity15', '北京市海淀区圆明园', 40.0072, 116.3000, '2026-01-16 09:00:00', '2026-01-16 13:00:00', 'easy', 18, 'cancelled', '从圆明园南门进入，参观遗址，徒步游览，全程约7公里。', '运动鞋、相机、水壶', '2026-01-13 18:00:00');

-- ========================================
-- 5. 插入参与关系数据
-- ========================================

INSERT INTO participations (id, user_id, activity_id, status, joined_at, completed_at, feedback, rating, created_at) VALUES
-- act-001 的参与者 (已批准，即将开始)
('part-001-01', 'user-002', 'act-001', 'joined', '2026-01-10 12:00:00', NULL, NULL, NULL, '2026-01-10 12:00:00'),
('part-001-02', 'user-003', 'act-001', 'joined', '2026-01-10 14:00:00', NULL, NULL, NULL, '2026-01-10 14:00:00'),
('part-001-03', 'user-004', 'act-001', 'joined', '2026-01-11 09:00:00', NULL, NULL, NULL, '2026-01-11 09:00:00'),
('part-001-04', 'user-005', 'act-001', 'joined', '2026-01-11 15:00:00', NULL, NULL, NULL, '2026-01-11 15:00:00'),

-- act-002 的参与者
('part-002-01', 'user-001', 'act-002', 'joined', '2026-01-11 13:00:00', NULL, NULL, NULL, '2026-01-11 13:00:00'),
('part-002-02', 'user-003', 'act-002', 'joined', '2026-01-11 16:00:00', NULL, NULL, NULL, '2026-01-11 16:00:00'),
('part-002-03', 'user-008', 'act-002', 'joined', '2026-01-12 10:00:00', NULL, NULL, NULL, '2026-01-12 10:00:00'),
('part-002-04', 'user-010', 'act-002', 'joined', '2026-01-12 11:00:00', NULL, NULL, NULL, '2026-01-12 11:00:00'),
('part-002-05', 'user-006', 'act-002', 'joined', '2026-01-12 14:00:00', NULL, NULL, NULL, '2026-01-12 14:00:00'),

-- act-003 的参与者
('part-003-01', 'user-001', 'act-003', 'joined', '2026-01-12 15:00:00', NULL, NULL, NULL, '2026-01-12 15:00:00'),
('part-003-02', 'user-006', 'act-003', 'joined', '2026-01-12 16:00:00', NULL, NULL, NULL, '2026-01-12 16:00:00'),
('part-003-03', 'user-008', 'act-003', 'joined', '2026-01-13 09:00:00', NULL, NULL, NULL, '2026-01-13 09:00:00'),

-- act-004 的参与者
('part-004-01', 'user-002', 'act-004', 'joined', '2026-01-13 11:00:00', NULL, NULL, NULL, '2026-01-13 11:00:00'),
('part-004-02', 'user-005', 'act-004', 'joined', '2026-01-13 14:00:00', NULL, NULL, NULL, '2026-01-13 14:00:00'),
('part-004-03', 'user-007', 'act-004', 'joined', '2026-01-13 16:00:00', NULL, NULL, NULL, '2026-01-13 16:00:00'),

-- act-005 的参与者
('part-005-01', 'user-001', 'act-005', 'joined', '2026-01-14 10:00:00', NULL, NULL, NULL, '2026-01-14 10:00:00'),
('part-005-02', 'user-003', 'act-005', 'joined', '2026-01-14 11:00:00', NULL, NULL, NULL, '2026-01-14 11:00:00'),
('part-005-03', 'user-006', 'act-005', 'joined', '2026-01-14 12:00:00', NULL, NULL, NULL, '2026-01-14 12:00:00'),
('part-005-04', 'user-010', 'act-005', 'joined', '2026-01-14 13:00:00', NULL, NULL, NULL, '2026-01-14 13:00:00'),

-- act-006 的参与者 (进行中)
('part-006-01', 'user-002', 'act-006', 'joined', '2026-01-08 16:00:00', NULL, NULL, NULL, '2026-01-08 16:00:00'),
('part-006-02', 'user-009', 'act-006', 'joined', '2026-01-09 10:00:00', NULL, NULL, NULL, '2026-01-09 10:00:00'),

-- act-011 的参与者 (已完成)
('part-011-01', 'user-002', 'act-011', 'completed', '2025-12-20 12:00:00', '2025-12-28 16:30:00', '非常棒的活动！组织有序，路线清晰，景色壮观。', 5, '2025-12-20 12:00:00'),
('part-011-02', 'user-003', 'act-011', 'completed', '2025-12-21 09:00:00', '2025-12-28 16:30:00', '第一次爬长城，虽然累但很开心。领队很负责。', 5, '2025-12-21 09:00:00'),
('part-011-03', 'user-004', 'act-011', 'completed', '2025-12-21 14:00:00', '2025-12-28 16:30:00', '拍到了很多好照片，推荐摄影爱好者参加。', 5, '2025-12-21 14:00:00'),
('part-011-04', 'user-005', 'act-011', 'completed', '2025-12-22 10:00:00', '2025-12-28 16:30:00', '周末放松的好选择，会继续参加类似活动。', 4, '2025-12-22 10:00:00'),
('part-011-05', 'user-006', 'act-011', 'completed', '2025-12-22 15:00:00', '2025-12-28 16:30:00', '很友好的团队，第一次参加户外活动就很愉快。', 5, '2025-12-22 15:00:00'),

-- act-012 的参与者 (已完成)
('part-012-01', 'user-001', 'act-012', 'completed', '2025-12-28 16:00:00', '2026-01-05 09:30:00', '早晨运动很舒服，空气清新，下次还参加。', 5, '2025-12-28 16:00:00'),
('part-012-02', 'user-008', 'act-012', 'completed', '2025-12-29 10:00:00', '2026-01-05 09:30:00', '轻松愉快的跑步活动，适合新手。', 4, '2025-12-29 10:00:00'),
('part-012-03', 'user-010', 'act-012', 'completed', '2025-12-29 14:00:00', '2026-01-05 09:30:00', '认识了几个新朋友，很开心。', 5, '2025-12-29 14:00:00'),

-- act-013 的参与者 (已完成)
('part-013-01', 'user-002', 'act-013', 'completed', '2026-01-02 17:00:00', '2026-01-08 17:30:00', '摄影徒步结合得很好，拍到了满意的作品。', 5, '2026-01-02 17:00:00'),
('part-013-02', 'user-005', 'act-013', 'completed', '2026-01-03 09:00:00', '2026-01-08 17:30:00', '领队讲解很专业，学到了很多摄影技巧。', 5, '2026-01-03 09:00:00');

-- ========================================
-- 6. 验证数据插入
-- ========================================

-- 查看统计信息
SELECT '用户数量' as type, COUNT(*) as count FROM users
UNION ALL
SELECT '偏好数量', COUNT(*) FROM user_preferences
UNION ALL
SELECT '照片数量', COUNT(*) FROM user_photos
UNION ALL
SELECT '活动数量', COUNT(*) FROM activities
UNION ALL
SELECT '参与记录数量', COUNT(*) FROM participations;

-- 查看活动状态分布
SELECT status, COUNT(*) as count
FROM activities
GROUP BY status;

-- 查看每个活动的参与人数
SELECT
  a.id,
  a.title,
  a.status,
  COUNT(p.id) as participant_count,
  a.max_participants
FROM activities a
LEFT JOIN participations p ON a.id = p.activity_id AND p.status != 'cancelled'
GROUP BY a.id, a.title, a.status, a.max_participants
ORDER BY a.created_at DESC;

-- ========================================
-- 完成！测试数据已成功插入
-- ========================================
