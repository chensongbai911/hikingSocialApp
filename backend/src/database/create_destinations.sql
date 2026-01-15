-- 创建目的地表
CREATE TABLE IF NOT EXISTS destinations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL COMMENT '目的地名称',
  description TEXT COMMENT '描述',
  area VARCHAR(50) NOT NULL COMMENT '所属地区',
  district VARCHAR(50) COMMENT '所属区县',
  latitude DECIMAL(10, 8) NOT NULL COMMENT '纬度',
  longitude DECIMAL(11, 8) NOT NULL COMMENT '经度',
  difficulty ENUM('easy', 'moderate', 'hard') NOT NULL DEFAULT 'moderate' COMMENT '难度等级',
  distance DECIMAL(6, 2) COMMENT '徒步距离(km)',
  elevation_gain INT COMMENT '累计爬升(m)',
  cover_image VARCHAR(500) COMMENT '封面图',
  photos TEXT COMMENT '实景照片JSON数组',
  popularity_score INT DEFAULT 0 COMMENT '人气分数',
  visit_count INT DEFAULT 0 COMMENT '访问次数',
  activity_count INT DEFAULT 0 COMMENT '相关活动数',
  rating DECIMAL(3, 2) DEFAULT 0.00 COMMENT '评分',
  tags VARCHAR(200) COMMENT '标签,逗号分隔',
  facilities TEXT COMMENT '设施信息',
  opening_hours VARCHAR(100) COMMENT '开放时间',
  ticket_price DECIMAL(6, 2) DEFAULT 0.00 COMMENT '门票价格',
  contact_phone VARCHAR(20) COMMENT '联系电话',
  address VARCHAR(200) COMMENT '详细地址',
  transportation TEXT COMMENT '交通信息',
  tips TEXT COMMENT '游玩提示',
  best_season VARCHAR(50) COMMENT '最佳季节',
  status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '状态',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_area (area),
  INDEX idx_difficulty (difficulty),
  INDEX idx_popularity (popularity_score DESC),
  INDEX idx_location (latitude, longitude),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='徒步目的地表';

-- 插入示例数据
INSERT INTO destinations (name, description, area, district, latitude, longitude, difficulty, distance, elevation_gain, cover_image, photos, popularity_score, visit_count, activity_count, rating, tags, address, best_season, status) VALUES
('香山公园', '北京著名的登山胜地，秋季红叶闻名遐迩。山势险峻秀丽，泉沛林茂，古迹遍布。', '海淀区', '海淀区', 39.9959, 116.1863, 'easy', 12.4, 642, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
'["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400","https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=400","https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400"]',
1200, 4800, 156, 4.8, '红叶,登山,景区', '北京市海淀区买卖街40号', '秋季', 'active'),

('凤凰岭自然风景区', '集自然景观与人文景观于一体的大型风景名胜区，有"京西小黄山"之美誉。', '海淀区', '海淀区', 40.0742, 116.0892, 'moderate', 35.2, 1280, 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800',
'["https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=400","https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400"]',
890, 3200, 87, 4.6, '高难度,野山,峡谷', '北京市海淀区苏家坨镇凤凰岭路19号', '春秋', 'active'),

('灵山', '北京第一高峰，海拔2303米，素有"京西珠峰"之称。山顶气候多变，景色壮美。', '门头沟区', '门头沟区', 40.0586, 115.4975, 'hard', 28.0, 1850, 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800',
'["https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400"]',
650, 2100, 45, 4.7, '高山,挑战,雪景', '北京市门头沟区清水镇灵山景区', '夏季', 'active'),

('百花山', '北京市五大自然保护区之一，植被垂直分布明显，有"天然植物园"之称。', '门头沟区', '门头沟区', 39.8336, 115.5844, 'moderate', 22.5, 1120, 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800',
'["https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400","https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400"]',
720, 2500, 62, 4.5, '自然保护区,花海,徒步', '北京市门头沟区清水镇百花山自然保护区', '夏季', 'active'),

('云蒙山', '被称为"小黄山"，奇峰异石多姿，飞瀑流泉遍布，森林覆盖率达90%以上。', '怀柔区', '怀柔区', 40.5864, 116.5825, 'moderate', 18.6, 980, 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800',
'["https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400","https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=400"]',
950, 3800, 98, 4.7, '云海,瀑布,森林', '北京市怀柔区琉璃庙镇后山铺村', '春夏', 'active'),

('八达岭长城', '明长城最具代表性的一段，世界文化遗产，中国古代伟大的防御工程。', '延庆区', '延庆区', 40.3592, 116.0154, 'moderate', 8.5, 520, 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800',
'["https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400","https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=400"]',
2500, 12500, 235, 4.9, '历史名胜,长城,世界遗产', '北京市延庆区G6京藏高速58号出口', '四季', 'active'),

('妙峰山', '以"古刹"、"奇松"、"怪石"、"异卉"而闻名，有"华北第一仙山"之称。', '门头沟区', '门头沟区', 39.9833, 116.0711, 'moderate', 15.8, 850, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
'["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400"]',
680, 2300, 58, 4.4, '寺庙,玫瑰,祈福', '北京市门头沟区妙峰山镇涧沟村', '春夏', 'active'),

('奥林匹克森林公园', '北京最大的城市公园，环境优美，设施完善，适合休闲健身。', '朝阳区', '朝阳区', 40.0181, 116.3969, 'easy', 10.0, 50, 'https://images.unsplash.com/photo-1541523569583-dc3ff52663f6?w=800',
'["https://images.unsplash.com/photo-1541523569583-dc3ff52663f6?w=400","https://images.unsplash.com/photo-1587502537147-2ba64a117568?w=400"]',
1500, 8500, 189, 4.6, '城市公园,跑步,健身', '北京市朝阳区科荟路33号', '四季', 'active');

-- 创建用户搜索历史表
CREATE TABLE IF NOT EXISTS destination_search_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户UUID',
  destination_id INT,
  search_keyword VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  INDEX idx_destination (destination_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='目的地搜索历史表';

-- 创建用户收藏目的地表
CREATE TABLE IF NOT EXISTS destination_favorites (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户UUID',
  destination_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_destination (user_id, destination_id),
  INDEX idx_user (user_id),
  INDEX idx_destination (destination_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户收藏目的地表';
