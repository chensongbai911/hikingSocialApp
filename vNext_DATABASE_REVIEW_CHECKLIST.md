# vNext 后端数据库设计评审清单

**日期**: 2026-01-19
**评审人**: Tech Lead (Backend) / 数据库工程师
**预计时间**: 2 小时
**优先级**: 🔴 最高 (阻塞开发)

---

## 📋 使用指南

### 评审目的

本次评审需要确认:

1. ✅ 12 张新表的 DDL 设计是否合理
2. ✅ 索引策略是否高效
3. ✅ 数据类型选择是否恰当
4. ✅ 外键约束是否正确
5. ✅ 分区/分表方案是否可行
6. ✅ 性能隐患识别
7. ✅ 扩展性预留

### 准备工作

评审前请阅读:

- **vNext_PRD_ANALYSIS_COMPREHENSIVE.md** Part 3.1 (完整 DDL)
- **两份原始 PRD** (了解业务场景)
- **当前数据库 schema** (backend/database/schema.sql)

---

## 🗄️ 表 1: routes (路线表)

### DDL 概览

```sql
CREATE TABLE routes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL COMMENT '创建者',
  title VARCHAR(255) NOT NULL COMMENT '路线名称',
  cover_url VARCHAR(500) COMMENT '封面图',
  distance_km DECIMAL(10,2) COMMENT '总距离',
  elevation_gain_m INT COMMENT '累计爬升',
  duration_min INT COMMENT '预计用时(分钟)',
  difficulty VARCHAR(50) COMMENT '难度: easy/moderate/hard',
  description TEXT,
  risk_tags JSON COMMENT '[\'高温\', \'涉水\', ...]',
  season_tags JSON COMMENT '[\'春\', \'夏\', ...]',
  visibility ENUM('public', 'private', 'friends') DEFAULT 'private',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL COMMENT '软删除',

  UNIQUE KEY uk_user_title (user_id, title),
  INDEX idx_visibility (visibility),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 评审检查清单

#### 字段设计

```
☐ user_id BIGINT - 是否需要外键? (FOREIGN KEY ... REFERENCES users(id))
☐ title VARCHAR(255) - 长度是否合理? 考虑多语言?
☐ difficulty VARCHAR(50) - 为何不用 ENUM? (easy/moderate/hard/expert)
☐ risk_tags/season_tags JSON - MySQL版本 >= 5.7? JSON 索引需求?
☐ visibility ENUM - 是否需要增加 'unlisted' (不公开但可分享)?
☐ deleted_at - 软删除策略,是否需要 INDEX?

建议调整:
  1. difficulty 改为 ENUM('easy','moderate','hard','expert')
  2. 添加外键: FOREIGN KEY (user_id) REFERENCES users(id)
  3. 添加索引: INDEX idx_deleted_visibility (deleted_at, visibility)
     → 查询公开路线时过滤软删除
```

#### 索引策略

```
现有索引:
  ✅ UNIQUE (user_id, title) - 防止同一用户重复路线名
  ✅ INDEX (visibility) - 支持公开/私密查询
  ✅ INDEX (created_at) - 支持最新路线排序

缺失索引 (建议添加):
  ☐ INDEX idx_difficulty (difficulty) - 按难度筛选
  ☐ INDEX idx_distance (distance_km) - 按距离筛选
  ☐ INDEX idx_user_created (user_id, created_at DESC) - 用户路线列表
  ☐ INDEX idx_public_popular (visibility, created_at DESC) WHERE visibility='public'
     → 部分索引 (如果 MySQL 8.0+)
```

#### 性能考虑

```
☐ TEXT 字段 description - 是否需要全文索引? (FULLTEXT INDEX)
☐ JSON 字段查询频率? 如果高频,考虑虚拟列:
   ALTER TABLE routes ADD COLUMN has_risk_高温 BOOLEAN
   AS (JSON_CONTAINS(risk_tags, '"高温"')) STORED;
☐ 软删除查询性能? 建议: INDEX idx_active (deleted_at IS NULL, visibility)
```

#### 业务逻辑验证

```
☐ 同一路线是否允许多版本? (title 约束是否合理?)
☐ 路线删除策略? 软删除 vs 硬删除? 关联数据如何处理?
☐ 封面图 cover_url - 是否需要多张? 考虑 JSON 存储?
```

### 您的评审意见

```
✍️ 整体评价: ☐ 通过 ☐ 需调整 ☐ 重大问题

需要调整的地方:
__________________________________________________
__________________________________________________

性能隐患:
__________________________________________________
```

---

## 📍 表 2: route_waypoints (关键点表)

### DDL 概览

```sql
CREATE TABLE route_waypoints (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  route_id BIGINT NOT NULL,
  type ENUM('start','assembly','scenic','break','supply','risk','retreat','end'),
  lat DECIMAL(10,8) NOT NULL,
  lng DECIMAL(11,8) NOT NULL,
  name VARCHAR(255),
  description TEXT,
  altitude_m INT COMMENT '海拔',
  stay_min INT COMMENT '建议停留(分钟)',
  images JSON COMMENT '[{url, caption}, ...]',
  order_index INT NOT NULL COMMENT '序号',

  FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
  UNIQUE KEY uk_route_order (route_id, order_index),
  INDEX idx_route (route_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 评审检查清单

#### 字段设计

```
☐ lat/lng DECIMAL(10,8) - 精度是否足够? (约 1.11 米)
☐ type ENUM - 是否缺少类型? (如 'water_source', 'viewpoint', 'camping')
☐ order_index INT - 是否需要支持插入? (1,2,3 → 插入 2.5?)
☐ images JSON - 单个关键点图片数量限制? 存储大小?
☐ altitude_m INT - 海拔范围? 珠峰 8848m, 死海 -430m

建议调整:
  1. order_index 改为 DECIMAL(10,2) 支持插入 (或用链表结构)
  2. 添加字段: distance_from_start_km (从起点距离)
  3. 添加字段: created_at, updated_at
```

#### 索引策略

```
现有索引:
  ✅ UNIQUE (route_id, order_index) - 防止重复序号
  ✅ INDEX (route_id) - 查询某路线的所有关键点
  ✅ 外键索引 (自动创建)

缺失索引:
  ☐ INDEX idx_route_type (route_id, type) - 查询特定类型关键点
  ☐ INDEX idx_type (type) - 全局查询某类关键点 (如所有补给点)
  ☐ SPATIAL INDEX idx_location (lat, lng) - 地理位置查询
     → 需要改用 POINT 类型:
       ALTER TABLE ADD COLUMN location POINT NOT NULL;
       SPATIAL INDEX (location);
```

#### 性能考虑

```
☐ 单路线关键点数量上限? (建议 <= 50 个)
☐ 级联删除 ON DELETE CASCADE - 性能影响? 需要监控
☐ JSON 字段 images - 如果图片多,考虑拆分表 route_waypoint_images
```

#### 业务逻辑验证

```
☐ 起点和终点是否必须? (必须有 type='start' 和 'end'?)
☐ 关键点重新排序的频率? 如果高,考虑用链表而非 order_index
☐ 关键点共享? (多条路线引用同一关键点?) 当前设计不支持
```

### 您的评审意见

```
✍️ 整体评价: ☐ 通过 ☐ 需调整 ☐ 重大问题

需要调整的地方:
__________________________________________________

性能隐患:
__________________________________________________
```

---

## 🛤️ 表 3: tracks (轨迹表)

### DDL 概览

```sql
CREATE TABLE tracks (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  activity_id BIGINT COMMENT '关联活动',
  route_id BIGINT COMMENT '关联路线',
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  distance_km DECIMAL(10,2),
  moving_time_sec INT,
  total_time_sec INT,
  avg_pace DECIMAL(5,2) COMMENT '平均配速 min/km',
  max_alt INT,
  min_alt INT,
  elevation_gain INT,

  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (activity_id) REFERENCES activities(id),
  FOREIGN KEY (route_id) REFERENCES routes(id),
  INDEX idx_user_time (user_id, start_time DESC),
  INDEX idx_activity (activity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 评审检查清单

#### 字段设计

```
☐ activity_id/route_id - 可为 NULL? 业务含义? (自由记录 vs 活动记录)
☐ avg_pace DECIMAL(5,2) - 范围? (慢走 15 min/km, 跑步 4 min/km)
☐ moving_time_sec vs total_time_sec - 如何区分? 暂停逻辑?
☐ 缺少字段: privacy (public/private/friends)
☐ 缺少字段: gpx_file_url (原始 GPX 文件)
☐ 缺少字段: created_at, updated_at

建议调整:
  1. 添加: privacy ENUM('public','private','friends') DEFAULT 'private'
  2. 添加: status ENUM('recording','paused','completed','error')
  3. 添加: device_info JSON (设备型号, GPS精度)
```

#### 索引策略

```
现有索引:
  ✅ INDEX (user_id, start_time DESC) - 用户轨迹列表
  ✅ INDEX (activity_id) - 活动关联轨迹

缺失索引:
  ☐ INDEX idx_route (route_id) - 某路线的所有轨迹
  ☐ INDEX idx_user_route (user_id, route_id) - 用户在某路线的记录
  ☐ INDEX idx_time_range (start_time, end_time) - 时间范围查询
```

#### 性能考虑

```
☐ 轨迹数据增长速度? (假设每天 1000 条 → 365k/年)
☐ 是否需要分区? PARTITION BY RANGE (YEAR(start_time))
☐ 与 track_points 的查询性能? (JOIN 性能)
```

### 您的评审意见

```
✍️ 整体评价: ☐ 通过 ☐ 需调整 ☐ 重大问题

需要调整的地方:
__________________________________________________
```

---

## 🗺️ 表 4: track_points (轨迹点表) ⚠️ **高频写入**

### DDL 概览

```sql
CREATE TABLE track_points (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  track_id BIGINT NOT NULL,
  ts BIGINT COMMENT 'unix 时间戳 ms',
  lat DECIMAL(10,8),
  lng DECIMAL(11,8),
  altitude INT,
  speed DECIMAL(5,2),
  accuracy INT,

  FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE,
  INDEX idx_track_ts (track_id, ts)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### ⚠️ **关键性能问题评审**

#### 写入压力估算

```
假设:
  - 采样频率: 10 秒/点
  - 平均徒步: 4 小时
  - 并发用户: 100 人同时记录

写入量:
  4 小时 × 360 点/小时 = 1440 点/次
  100 用户 × 1440 点 = 144,000 点/4小时
  = 10 点/秒平均, 峰值可能 50-100 点/秒

⚠️ **这是高频写入表,需要特殊优化!**
```

#### 评审检查清单

```
☐ 主键策略 - AUTO_INCREMENT 是否会成为瓶颈?
  建议: 改用 UUID 或雪花 ID (分布式友好)

☐ 外键 - ON DELETE CASCADE 会锁表吗?
  建议: 考虑异步删除 (标记删除 + 定时清理)

☐ 索引 - 单列索引 vs 复合索引?
  现有: INDEX (track_id, ts) ✅ 好
  建议: 考虑覆盖索引 ADD INDEX idx_track_location (track_id, ts, lat, lng)

☐ 分区策略 - 是否必须?
  建议: 按时间分区 PARTITION BY RANGE (ts)
    PARTITION p202601 VALUES LESS THAN (UNIX_TIMESTAMP('2026-02-01')),
    PARTITION p202602 VALUES LESS THAN (UNIX_TIMESTAMP('2026-03-01')),
    ...
  好处: 删除旧数据快 (DROP PARTITION), 查询范围小

☐ 数据类型优化
  - ts BIGINT → INT (如果只存秒, 2038年问题?)
  - lat/lng DECIMAL(10,8) → FLOAT? (精度 vs 存储)
  - altitude INT → SMALLINT? (-32768 to 32767)
  - accuracy INT → SMALLINT?

☐ 存储引擎考虑
  InnoDB ✅ - 事务支持
  TokuDB? - 压缩比高 (适合时序数据)
  ClickHouse? - 专业时序数据库 (需要额外部署)
```

#### 替代方案评估

```
方案 A: MySQL + 分区 (当前方案)
  ✅ 简单, 无额外依赖
  ❌ 写入性能有限 (单机 ~10k/s)

方案 B: MySQL + 时序表优化
  - 去掉外键 (业务层保证一致性)
  - 批量插入 (INSERT INTO ... VALUES (...), (...), ...)
  - 定期归档 (> 6个月 → 压缩表)
  ✅ 性能提升 2-3 倍
  ❌ 需要额外开发

方案 C: InfluxDB / TimescaleDB (时序数据库)
  ✅ 专业时序存储, 性能强
  ❌ 增加架构复杂度
  ❌ 需要额外学习成本

方案 D: Redis + 定期落库
  实时数据 → Redis (快速)
  轨迹结束 → 批量写 MySQL
  ✅ 写入极快
  ❌ 数据丢失风险 (需要 AOF)

建议: 首发用方案 A (MySQL + 分区), 后续优化用方案 B/D
```

### 您的评审意见

```
✍️ 整体评价: ☐ 通过 ☐ 需调整 ☐ 重大问题

选择的方案: ☐ A ☐ B ☐ C ☐ D

性能优化建议:
__________________________________________________
__________________________________________________

是否需要压测: ☐ 是 ☐ 否
```

---

## 👥 表 5-7: 队伍协同 (team_rooms, team_location_shares, team_status_reports)

### 简化评审 (3 表一起)

#### 核心问题

```
☐ team_location_shares - 是否应该用 Redis?
  原因: 位置数据高频更新 (1-10 秒)
  MySQL: 大量 UPDATE
  Redis: SET user:123:location {lat, lng, ts}

☐ team_status_reports - 保留多久?
  建议: 活动结束后 7 天归档

☐ team_rooms - 是否需要成员表?
  当前缺失: team_members (room_id, user_id, role)
```

### 您的评审意见

```
✍️ team_location_shares 用 Redis? ☐ 是 ☐ 否 (MySQL足够)
✍️ 需要新增 team_members 表? ☐ 是 ☐ 否

其他建议:
__________________________________________________
```

---

## 🚨 表 8-10: 安全系统 (emergency_contacts, sos_events, safety_settings)

### 评审重点

#### 字段完整性

```
☐ emergency_contacts - 手机号加密存储?
  建议: phone_encrypted VARCHAR(500)

☐ sos_events - 是否需要位置历史?
  当前只存一个点, 如果需要轨迹 → 关联 track_id

☐ safety_settings - 默认值是否合理?
  offline_alert_minutes = 10 → 太短? (信号波动)
  建议: 15-20 分钟
```

### 您的评审意见

```
✍️ 整体评价: ☐ 通过 ☐ 需调整 ☐ 重大问题

安全性建议:
__________________________________________________
```

---

## 📊 表 11-12: 复盘与评价 (hike_reports, route_reviews)

### 评审重点

#### hike_reports

```
☐ summary JSON - 内容结构?
  建议明确: {distance_km, time_sec, pace, waypoints: [...]}

☐ photos JSON - 是否需要单独表?
  如果用户上传多张 (10-50), 考虑:
    hike_report_photos (id, report_id, url, order, caption)
```

#### route_reviews

```
☐ helpful_count - 如何防止刷?
  建议: 新增表 review_helpful_users (review_id, user_id)

☐ tags JSON - 如何聚合统计?
  建议: 虚拟列或单独表 review_tags
```

### 您的评审意见

```
✍️ 整体评价: ☐ 通过 ☐ 需调整 ☐ 重大问题
```

---

## 📊 综合评审总结

### 整体架构评价

```
☐ 表结构设计合理性: ☐ 优秀 ☐ 良好 ☐ 需改进
☐ 索引策略完整性: ☐ 优秀 ☐ 良好 ☐ 需改进
☐ 性能优化预留: ☐ 优秀 ☐ 良好 ☐ 需改进
☐ 扩展性: ☐ 优秀 ☐ 良好 ☐ 需改进
```

### 高优先级调整建议 (Top 5)

```
1. __________________________________________________
2. __________________________________________________
3. __________________________________________________
4. __________________________________________________
5. __________________________________________________
```

### 性能隐患识别 (Top 3)

```
1. __________________________________________________
2. __________________________________________________
3. __________________________________________________
```

### 需要补充的表/字段

```
缺失的表:
☐ team_members (队伍成员表)
☐ route_waypoint_images (关键点图片表, 如果需要)
☐ track_simplification_cache (轨迹简化缓存)
☐ 其他: ______________

缺失的字段:
☐ routes 表: 缺少 view_count, like_count, fork_count
☐ tracks 表: 缺少 privacy, status, gpx_file_url
☐ 其他: ______________
```

### 数据库配置建议

```
☐ MySQL版本要求: >= 5.7 (JSON 支持)
☐ InnoDB 配置:
  innodb_buffer_pool_size = ___ GB (建议总内存 50-70%)
  innodb_log_file_size = 512M
  innodb_flush_log_at_trx_commit = 2 (高性能)

☐ 连接池:
  max_connections = 200-500 (根据并发)
  connection_timeout = 10s

☐ 慢查询日志:
  slow_query_log = 1
  long_query_time = 1 (> 1秒记录)
```

---

## ✅ 评审结论

### 最终决策

```
☐ 通过,可以开始开发
☐ 小幅调整后通过 (预计 ___ 天)
☐ 重大调整,需要重新设计 (预计 ___ 周)
```

### 下一步行动

```
☐ 1. 根据评审意见调整 DDL
☐ 2. 编写数据库迁移脚本 (migrations)
☐ 3. 创建测试数据生成脚本
☐ 4. 执行性能压测 (track_points 表)
☐ 5. 更新 API 接口文档
☐ 6. 安排前后端联调时间
```

### 评审签字

```
评审人: ___________________
职位: ___________________
日期: 2026-01-___

团队讨论时间: 2026-01-___ (如需要)
最终确认时间: 2026-01-___
```

---

## 📎 参考资料

- **vNext_PRD_ANALYSIS_COMPREHENSIVE.md** Part 3.1 (完整 DDL)
- **backend/database/schema.sql** (当前数据库结构)
- **MySQL 官方文档** (索引优化, 分区表)
- **高性能 MySQL** (O'Reilly 图书)

---

✨ **完成评审后,数据库设计就可以锁定并开始开发了!** 🎉
