# vNext PRD 全面分析与实现方案

**日期**: 2026-01-19
**涵盖**: 两份 PRD 融合 + 架构设计 + 任务拆分 + 工期评估

---

## 📋 Part 1: 两份 PRD 对比分析

### 1.1 核心定位一致性

| 维度       | PRD 1                            | PRD 2 Lynx/AMap                      | 结论            |
| ---------- | -------------------------------- | ------------------------------------ | --------------- |
| 核心目标   | 路线前中后闭环 + 队伍协同 + 安全 | 同上 + 高德地图 + 和风天气 + Lynx 端 | ✅ 方向一致     |
| 目标用户   | 新手/进阶徒步用户 + 领队         | 同上                                 | ✅ 一致         |
| P0 范围    | 6 大功能                         | 同 6 项 + 地图/天气集成              | ✅ 功能层面一致 |
| 差异化优势 | 新手智能准备助手                 | 更强调 Lynx + AMap + QWeather        | ⚠️ PRD2 更激进  |

**结论**: 两份 PRD 是**演进关系**，不是冲突。可统一为：**基础版 (PRD1) + 增强版 (PRD2)**。

### 1.2 功能模块对齐

```
Core P0 (6 个核心模块):
├── 1. Route Guide + Waypoints (路书与关键点) ✅
├── 2. Track Recording (轨迹记录) ✅
├── 3. Team Coordination (队伍协同) ✅
├── 4. Safety System (安全闭环) ✅
├── 5. AAR + Share Card (复盘与分享) ✅
└── 6. Preparation Assistant (P1→可纳入 P0) ⚠️

增强集成 (PRD2 特有):
├── 高德 AMap (地图服务) ✅
├── 和风天气 QWeather (风险预警) ✅
├── Lynx 框架 (跨端适配) ✅
└── 离线能力规划 (P1/P2)
```

### 1.3 两个 PRD 的优先级建议调整

**建议合并方案**:

- **短期 P0** (4 周): 路线 + 轨迹 + 队伍协同 + 安全 (面向 Web 版，为 Lynx 做准备)
- **短期 P0.5** (2 周): 高德 AMap + 和风 QWeather 集成 (关键差异化)
- **中期 P1** (3 周): Lynx 跨端适配 + 后台定位 + 离线能力
- **中期 P1+** (2 周): 新手准备助手 + 复盘优化

---

## 🎯 Part 2: 当前代码现状分析 + 优化机会

### 2.1 前端代码质量问题速览

#### 问题 1: 大量 console.log 留存（开发态痕迹）

```
发现数量: 28 处 console.log
影响范围:
  - Message.ts: getConversations, sendMessage, getUnreadCount
  - UserProfile.vue, MyHiking.vue, PrivacySettings.vue
  - HTTP 拦截器 (http.ts)
  - WebSocket (websocket.ts)
  - Socket service (socket.ts)

风险: 生产版本会暴露内部调试信息
```

#### 问题 2: 类型安全不足（TypeScript strict 未全覆盖）

```
发现问题:
  - any 类型滥用: ≥15 处 (as any, <any>, Promise<any>)
  - unknown 使用不当: imageUpload.ts 的类型转换
  - 缺少通用类型定义: API 响应层层包装

示例 - http.ts 第 58 行:
  async (error: AxiosError<any>) => {  // ❌ 应替换为具体类型
```

#### 问题 3: API 响应处理混乱

```
当前状态:
  1. message.ts 第 29 行
     const conversation = payload.data?.conversation || payload.conversation || payload.data || payload
     ⚠️ 容错过度，说明后端返回结构不规范

  2. http.ts 响应拦截器返回 response.data
     但 message.ts 又在做二次解包 (response.data?.data)
     ⚠️ 数据结构文档缺失，前后端没对齐

根本原因: 缺少 API 规范文档
```

#### 问题 4: 缓存策略不统一

```
当前状态:
  ✅ cache.ts 已有 LRU 缓存管理器
  ✅ 已支持 TTL 过期机制
  ❌ 但使用不广泛 (仅在 user.ts 用过)
  ❌ 其他 API 请求完全无缓存

机会: 可建立"缓存中间件"自动管理热点 API
```

#### 问题 5: 没有 API 请求层统一封装

```
当前问题:
  - 每个 api/*.ts 都直接调 request.get/post
  - 没有 retry/error-handling/loading 统一逻辑
  - 如果服务端接口改动，需要 N 个文件改动

建议方案:
  ├── api/base/request.ts (核心 HTTP 实例 ✅ 已有)
  ├── api/base/apiService.ts (新增: 通用请求包装)
  ├── api/base/types.ts (新增: API 通用类型)
  └── api/modules/  (新增: 模块化 API，支持重试/缓存/速率限制)
```

### 2.2 后端代码质量问题速览

#### 问题 1: TypeScript strict 模式未全启用

```
backend/tsconfig.json:
  "strict": false  ⚠️ 关键问题！

因此:
  - 30+ 处 as any 使用
  - Promise<any> 遍布服务层
  - 没有类型推导

建议: 改为 "strict": true (分阶段迁移)
```

#### 问题 2: 数据库查询 N+1 问题（未来隐患）

```
当前模式 (后端服务层):
  1. 获取用户列表: SELECT * FROM users LIMIT 10
  2. 遍历用户:
     for (const user of users) {
       const photos = await query(`SELECT * FROM user_photos WHERE user_id = ${user.id}`)
     }
  ⚠️ 1 + N 查询，当 N=1000 时灾难

当前虽未发现，但以下文件高风险:
  - AuthService.ts (fetchCurrentUser: 可能有多次数据库查询)
  - UserService.ts (getUserDetail: 需要关联表)
  - ActivityService.ts (列表查询 + 参与者)
```

#### 问题 3: Socket.io 消息处理缺少验证

```
realtime/socket.ts 第 51 行:
  const { conversationId, isTyping } = payload || ({} as any)

问题:
  ❌ 没有 payload 验证
  ❌ 没有权限检查 (是否真的在此对话?)
  ❌ 广播可能被滥用 (spam/dos)
```

#### 问题 4: 错误处理不统一

```
当前状态:
  ✅ 有 errorHandler 中间件 + BusinessErrorCode 枚举
  ❌ 但业务层 throw 的错误类型不规范
  ❌ 缺少 retry 机制 (数据库连接临时异常)

示例 - AuthService.ts:
  如果 photo 上传失败，没有 fallback 处理
```

#### 问题 5: 数据库连接管理不够强健

```
backend/config/database.ts:
  connectionLimit: 10  ⚠️ 生产可能不够
  enableKeepAlive: true  ✅ 好

missing:
  - 连接池监控 (当前空闲连接数?)
  - 查询超时控制
  - 慢查询日志
```

### 2.3 架构层面的优化机会

#### 机会 1: 缺少 API 版本控制规范

```
当前:
  /api/v1/* 固定

问题:
  - 如果未来要改 Track 数据结构，无法向后兼容
  - 前端无法指定 API 版本

建议:
  Accept-Version: v1.1 (header 级别版本)
  或 /api/v1.1/* (路由级别)
```

#### 机会 2: 缺少请求幂等性保证

```
新增功能风险:
  - 创建路线时网络超时，用户重试
  - 可能创建 N 个重复路线

建议:
  - 添加 Idempotency-Key header
  - 后端去重逻辑 (在 middleware 或 service)
```

#### 机会 3: 缺少速率限制

```
现状:
  - API 没有限流
  - 恶意用户可以穷举用户ID、轨迹等

建议:
  - 全局 RateLimit middleware
  - 按 endpoint + user_id 限流
  - Redis 作为限流存储 (可后续加)
```

---

## 🏗️ Part 3: 新需求的技术架构设计

### 3.1 数据库设计 (DDL)

#### 新增核心表

```sql
-- 1. 路线系统
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

-- 2. 关键点 (Waypoints)
CREATE TABLE route_waypoints (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  route_id BIGINT NOT NULL,
  type ENUM('start', 'assembly', 'scenic', 'break', 'supply', 'risk', 'retreat', 'end') COMMENT '类型',
  lat DECIMAL(10,8) NOT NULL COMMENT '纬度',
  lng DECIMAL(11,8) NOT NULL COMMENT '经度',
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

-- 3. 轨迹数据
CREATE TABLE tracks (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  activity_id BIGINT COMMENT '关联活动',
  route_id BIGINT COMMENT '关联路线',
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  distance_km DECIMAL(10,2),
  moving_time_sec INT COMMENT '运动时长',
  total_time_sec INT COMMENT '总耗时',
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

-- 4. 轨迹点 (高频写入，考虑分表)
CREATE TABLE track_points (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  track_id BIGINT NOT NULL,
  ts BIGINT COMMENT 'unix 时间戳 ms',
  lat DECIMAL(10,8),
  lng DECIMAL(11,8),
  altitude INT COMMENT '海拔',
  speed DECIMAL(5,2) COMMENT '速度 km/h',
  accuracy INT COMMENT 'GPS 精度',

  FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE,
  INDEX idx_track_ts (track_id, ts)
  -- 考虑分区: PARTITION BY RANGE (ts) 按时间分区
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. 队伍房间
CREATE TABLE team_rooms (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  activity_id BIGINT NOT NULL UNIQUE,
  status ENUM('active', 'archived') DEFAULT 'active',
  leader_id BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
  FOREIGN KEY (leader_id) REFERENCES users(id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. 位置共享 (实时表，考虑 Redis 替代)
CREATE TABLE team_location_shares (
  user_id BIGINT,
  activity_id BIGINT,
  share_mode ENUM('leader_only', 'team', 'friends', 'disabled') DEFAULT 'team',
  last_update_time TIMESTAMP,
  lat DECIMAL(10,8),
  lng DECIMAL(11,8),

  PRIMARY KEY (user_id, activity_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (activity_id) REFERENCES activities(id),
  INDEX idx_activity_updated (activity_id, last_update_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. 队伍状态上报
CREATE TABLE team_status_reports (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  activity_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  status ENUM('ok', 'rest_needed', 'injured', 'separated', 'waypoint_reached') DEFAULT 'ok',
  note VARCHAR(500),
  ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (activity_id) REFERENCES activities(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_activity_user_time (activity_id, user_id, ts DESC),
  INDEX idx_activity_time (activity_id, ts DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. 紧急联系人
CREATE TABLE emergency_contacts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  name VARCHAR(255),
  phone VARCHAR(20),
  relationship VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. SOS 事件
CREATE TABLE sos_events (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  activity_id BIGINT,
  route_id BIGINT,
  lat DECIMAL(10,8),
  lng DECIMAL(11,8),
  ts TIMESTAMP,
  type ENUM('manual', 'auto_offline', 'auto_offroute', 'auto_stationary') DEFAULT 'manual',
  reason VARCHAR(500),
  status ENUM('open', 'resolved', 'false_alarm') DEFAULT 'open',
  resolved_at TIMESTAMP NULL,
  resolved_by BIGINT COMMENT '解决人',

  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (activity_id) REFERENCES activities(id),
  FOREIGN KEY (route_id) REFERENCES routes(id),
  INDEX idx_user_time (user_id, ts DESC),
  INDEX idx_status (status),
  INDEX idx_activity (activity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. 安全设置
CREATE TABLE safety_settings (
  user_id BIGINT PRIMARY KEY,
  offline_alert_minutes INT DEFAULT 10 COMMENT '失联多少分钟后提醒',
  offroute_distance_m INT DEFAULT 300 COMMENT '偏离路线多少米告警',
  offroute_duration_min INT DEFAULT 5 COMMENT '持续偏离多少分钟告警',
  stationary_duration_min INT DEFAULT 15 COMMENT '静止多少分钟告警',
  location_share_default_mode ENUM('disabled', 'team', 'leader_only') DEFAULT 'disabled',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. 登山报告 (AAR: After Action Report)
CREATE TABLE hike_reports (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  track_id BIGINT UNIQUE,
  activity_id BIGINT,
  route_id BIGINT,
  title VARCHAR(255),
  summary JSON COMMENT '{distance, time, pace, waypoints_reached, ...}',
  note TEXT COMMENT '用户感受',
  photos JSON COMMENT '[{url, order}, ...]',
  shared BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (track_id) REFERENCES tracks(id),
  FOREIGN KEY (activity_id) REFERENCES activities(id),
  FOREIGN KEY (route_id) REFERENCES routes(id),
  INDEX idx_user_time (user_id, created_at DESC),
  INDEX idx_activity (activity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. 路线评价
CREATE TABLE route_reviews (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  route_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  tags JSON COMMENT '[\'风景好\', \'难度高\', ...]',
  content TEXT,
  helpful_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE KEY uk_user_route (route_id, user_id),
  INDEX idx_route_rating (route_id, rating DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### 索引优化策略

```
关键查询模式识别:
1. 获取路线详情 + 关键点
   WHERE routes.id = ?
   + JOIN route_waypoints WHERE route_id = ? ORDER BY order_index
   → 复合索引: (route_id, order_index)

2. 用户的所有轨迹
   WHERE tracks.user_id = ? AND start_time > ? ORDER BY start_time DESC
   → 复合索引: (user_id, start_time DESC)
   → 分页优化: LIMIT 20 OFFSET 100 → 使用 WHERE id > last_id

3. 队伍成员实时位置
   WHERE team_location_shares.activity_id = ?
   → 简单索引: (activity_id)

4. SOS 事件查询
   WHERE sos_events.activity_id = ? AND status = 'open'
   → 复合索引: (activity_id, status)

5. 高频写入表 (track_points)
   → 考虑分库分表 (sharding by track_id)
   或 时间分区 (PARTITION BY RANGE)
```

### 3.2 API 接口规范 (后端)

#### 新增路由定义

```typescript
// backend/src/routes/routeRoutes.ts
├── POST   /api/v1/routes              创建路线
├── GET    /api/v1/routes/:id          获取路线详情 + 关键点
├── PUT    /api/v1/routes/:id          编辑路线
├── DELETE /api/v1/routes/:id          删除路线
├── GET    /api/v1/routes              列出路线 (分页, 过滤)
├── GET    /api/v1/routes/:id/reviews  获取路线评价

// backend/src/routes/waypointRoutes.ts (可内聚在 routeRoutes)
├── POST   /api/v1/routes/:routeId/waypoints
├── PUT    /api/v1/routes/:routeId/waypoints/:wpId
├── DELETE /api/v1/routes/:routeId/waypoints/:wpId

// backend/src/routes/trackRoutes.ts
├── POST   /api/v1/tracks              创建轨迹记录 (开始)
├── PUT    /api/v1/tracks/:id          结束轨迹 + 轨迹点上传
├── POST   /api/v1/tracks/:id/points   批量上传轨迹点 (支持离线缓存)
├── GET    /api/v1/tracks              获取我的轨迹列表
├── GET    /api/v1/tracks/:id          获取轨迹详情 + 复盘

// backend/src/routes/teamRoutes.ts (队伍协同)
├── POST   /api/v1/activities/:activityId/team/rooms   创建/加入房间
├── GET    /api/v1/activities/:activityId/team/members 获取队伍成员
├── POST   /api/v1/activities/:activityId/team/location 上报位置
├── POST   /api/v1/activities/:activityId/team/status   上报状态
├── POST   /api/v1/activities/:activityId/team/announce 领队广播 (仅领队)

// backend/src/routes/safetyRoutes.ts
├── POST   /api/v1/safety/sos          触发 SOS
├── GET    /api/v1/safety/settings     获取安全设置
├── PUT    /api/v1/safety/settings     更新安全设置
├── POST   /api/v1/safety/contacts     管理紧急联系人
├── GET    /api/v1/safety/events       查看 SOS 历史

// backend/src/routes/reportRoutes.ts
├── GET    /api/v1/reports/:trackId    获取复盘报告
├── POST   /api/v1/reports/:trackId/share   生成分享卡
├── POST   /api/v1/routes/:routeId/reviews  提交路线评价
```

#### API 响应规范 (统一格式)

```typescript
// 统一的 API 响应 (已有 BaseResponse，优化其使用)
interface ApiResponse<T = any> {
  code: number                // 业务码 (0 成功, 1xxx 认证, 2xxx 业务, 5xxx 系统)
  message: string             // 错误/成功消息
  data: T | null              // 业务数据
  timestamp: string           // ISO 时间
  requestId?: string          // 追踪链路 (可选)
  pagination?: {              // 分页信息 (如有)
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// 规范化路由处理 (middleware + controller 标准模板)
export const createRoute = asyncHandler(async (req, res) => {
  const { title, distance_km } = req.body
  // 输入验证
  const validator = /* joi schema */
  const { error, value } = validator.validate(req.body)
  if (error) throw new BusinessError(ErrorCode.INVALID_INPUT, error.message)

  // 业务处理
  const route = await RouteService.create(value, req.user.id)

  // 统一响应
  res.success(route, '路线创建成功', 201)
})
```

### 3.3 前端数据层架构优化

#### 建议的模块化结构

```
frontend/src/
├── api/
│   ├── base/
│   │   ├── request.ts           (核心 HTTP 实例 ✅ 已有)
│   │   ├── apiService.ts        (新增: 通用请求包装，支持重试/缓存)
│   │   ├── types.ts             (新增: API 通用类型 + 错误码)
│   │   └── constants.ts         (新增: API 端点常量)
│   ├── modules/
│   │   ├── route.ts             (新增: 路线 API)
│   │   ├── track.ts             (新增: 轨迹 API)
│   │   ├── team.ts              (新增: 队伍协同 API)
│   │   ├── safety.ts            (新增: 安全 API)
│   │   ├── report.ts            (新增: 复盘报告 API)
│   │   └── message.ts           (既有: 聊天 API, 需改造)
│   └── hooks/                   (新增: API 相关 composable)
│       ├── useApiRequest.ts      (通用 API 请求 hook)
│       ├── useRoute.ts           (路线相关 hook)
│       ├── useTrack.ts           (轨迹相关 hook)
│       └── useTeam.ts            (队伍相关 hook)
├── stores/
│   ├── route.ts                 (新增: 路线 store)
│   ├── track.ts                 (新增: 轨迹 store)
│   ├── team.ts                  (新增: 队伍协同 store)
│   ├── safety.ts                (新增: 安全 store)
│   └── message.ts               (既有: 聊天 store)
└── components/
    ├── Route/                   (新增: 路线相关组件)
    ├── Track/                   (新增: 轨迹/地图相关组件)
    ├── Team/                    (新增: 队伍协同组件)
    └── Safety/                  (新增: 安全相关组件)
```

#### 新增 useApiRequest Hook 范例

```typescript
// frontend/src/api/hooks/useApiRequest.ts
export interface UseApiRequestOptions {
  cache?: boolean | number // true = 使用默认 TTL, 数字 = 毫秒
  retry?: number // 重试次数
  onError?: (error: Error) => void
  timeout?: number
}

export const useApiRequest = <T = any>(
  apiCall: () => Promise<T>,
  options: UseApiRequestOptions = {}
) => {
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const data = ref<T | null>(null)
  const cacheKey = ref<string>('')

  const execute = async (forceRefresh = false) => {
    // 1. 检查缓存
    if (options.cache && !forceRefresh && cacheKey.value) {
      const cached = cacheManager.get<T>(cacheKey.value)
      if (cached) {
        data.value = cached
        return cached
      }
    }

    // 2. 执行请求 + 重试
    loading.value = true
    error.value = null
    let lastError: Error | null = null

    for (let i = 0; i <= (options.retry ?? 0); i++) {
      try {
        const result = await apiCall()

        // 3. 缓存结果
        if (options.cache && cacheKey.value) {
          const ttl = typeof options.cache === 'number' ? options.cache : CACHE_TTL.DEFAULT
          cacheManager.set(cacheKey.value, result, ttl)
        }

        data.value = result
        loading.value = false
        return result
      } catch (e) {
        lastError = e as Error
        if (i < (options.retry ?? 0)) {
          await new Promise((r) => setTimeout(r, Math.pow(2, i) * 1000))
        }
      }
    }

    error.value = lastError || new Error('Unknown error')
    options.onError?.(error.value)
    loading.value = false
    throw error.value
  }

  return { loading, error, data, execute }
}

// 使用示例
const {
  data: route,
  loading,
  execute,
} = useApiRequest(() => routeApi.getRoute(routeId), { cache: CACHE_TTL.ROUTE, retry: 2 })
onMounted(() => execute())
```

#### 改造 message.ts (举例)

```typescript
// frontend/src/api/modules/message.ts (新结构)
import { useApiRequest } from '../hooks/useApiRequest'

// 内聚 API 定义
const messageApi = {
  async getConversations(page = 1, limit = 20) {
    return request.get('/messages/conversations', { params: { page, limit } })
  },

  async sendMessage(conversationId: string, content: string, type = 'text', payload?: any) {
    return request.post(`/messages/conversations/${conversationId}/messages`, {
      content,
      type,
      ...payload,
    })
  },
  // ... 其他方法
}

// 导出使用 hook
export const useMessage = () => {
  const conversations = ref([])

  const {
    data: convList,
    loading,
    execute,
  } = useApiRequest(() => messageApi.getConversations(), { cache: CACHE_TTL.MESSAGE })

  return {
    conversations: convList,
    loading,
    refreshConversations: () => execute(true),
  }
}

export default messageApi
```

---

## 📊 Part 4: 任务拆分与工期评估

### 4.1 Sprint 规划 (4 个 Sprint, 12 周)

#### Sprint 1: 基础设施 + 路线系统 (3 周)

**后端任务** (30 人天)

- [ ] 数据库建表 + 迁移脚本 (3 人天)

  - routes, route_waypoints, track, track_points 基础建表
  - 创建迁移脚本 (`backend/src/database/migrations/`)

- [ ] 路线 API 开发 (8 人天)

  - RouteController: CRUD 操作
  - RouteService: 业务逻辑 (地理距离计算、关键点排序)
  - 路线关键点管理 API
  - 输入验证 + 错误处理

- [ ] 数据库连接池 + 性能优化 (4 人天)

  - 优化 pool 配置 (connectionLimit 评估)
  - 添加慢查询日志
  - 索引验证与优化

- [ ] 后端代码优化 (8 人天)

  - 启用 TypeScript strict 模式 (分阶段)
  - 统一 API 响应格式
  - 添加 RequestId 追踪链路

- [ ] 集成测试 (7 人天)
  - 单元测试 (RouteService)
  - 集成测试 (API 端到端)

**前端任务** (25 人天)

- [ ] 前端数据层架构重构 (8 人天)

  - 创建 api/base/apiService.ts
  - 创建 api/hooks/useApiRequest.ts
  - 建立 api/modules 目录结构

- [ ] 路线页面开发 (10 人天)

  - RouteList.vue (列表、搜索、过滤)
  - RouteDetail.vue (详情 + 关键点展示)
  - RouteForm.vue (创建/编辑路线)
  - 关键点管理子组件

- [ ] 地图组件集成 (高德 AMap 准备) (5 人天)

  - 创建 MapComponent.vue (基础地图显示)
  - Polyline 绘制准备
  - 关键点标记准备

- [ ] 消息 API 改造示范 (2 人天)
  - 展示如何从 message.ts 迁移到新架构

**UI/UX 设计输出**

- [ ] 路线列表/详情页 wireframe + 高保真
- [ ] 关键点编辑 UI 规范
- [ ] 路线风险标签 icon 设计

**验收标准**

- ✅ 可创建、编辑、删除路线
- ✅ 路线详情展示 ≥ 5 个关键点
- ✅ 地图可展示路线 polyline (简单版)
- ✅ API 性能: 路线列表查询 < 200ms (10000 条记录)
- ✅ 前端代码质量: TypeScript strict 覆盖 > 80%

---

#### Sprint 2: 轨迹记录 + 复盘报告 (3 周)

**后端任务** (28 人天)

- [ ] 轨迹 API 开发 (10 人天)

  - TrackController: 创建、结束、查询
  - 支持批量上传轨迹点 (离线缓存补传)
  - 轨迹点去重 + 异常检测
  - 配速、爬升等统计计算

- [ ] 复盘报告生成 (8 人天)

  - HikeReportService: 自动生成复盘数据
  - 与轨迹关联、计算总结数据
  - 照片关联逻辑

- [ ] 偏航检测 (规则版) (5 人天)

  - 计算轨迹与路线的距离 (Haversine 公式)
  - 持续时间判定
  - 推送通知服务集成 (Websocket)

- [ ] 分享卡片后端支持 (5 人天)
  - 生成分享图片信息 (坐标、统计数据)
  - 可选: 调用第三方 html2canvas API (或由前端生成)

**前端任务** (27 人天)

- [ ] 行进模式页面 (12 人天)

  - HikeMode.vue: 主屏幕，展示下一关键点、剩余距离
  - 实时位置更新 (模拟 GPS)
  - 关键点到达提醒 (距离 < 100m)
  - 暂停/结束按钮

- [ ] 轨迹点采集与缓存 (8 人天)

  - useTrack.ts hook: 轨迹数据管理
  - 本地 IndexedDB 缓存轨迹点 (离线支持)
  - 自动上传机制 (网络恢复时)

- [ ] 复盘页面 (5 人天)

  - HikeReport.vue: 统计数据展示
  - 时间轴: 关键点到达记录
  - 照片墙

- [ ] 分享卡片生成 (2 人天)
  - ShareCard.vue: 使用 html2canvas 生成图片
  - 保存/分享按钮

**UI/UX 设计输出**

- [ ] 行进模式 UI (大字号、易操作设计)
- [ ] 复盘报告 UI + 分享卡片模板

**验收标准**

- ✅ 能记录轨迹点，结束生成报告
- ✅ 离线 50 个轨迹点，网络恢复后全部上传
- ✅ 复盘页展示 ≥ 6 个数据项
- ✅ 分享卡片可导出 PNG，文件 < 500KB

---

#### Sprint 3: 队伍协同 + 实时通信 (2 周)

**后端任务** (20 人天)

- [ ] 队伍房间 API (8 人天)

  - TeamController: 创建房间、获取成员、广播
  - 权限控制 (仅参与者可见、仅领队可广播)

- [ ] 位置共享服务 (6 人天)

  - 位置上报接口 (POST /api/v1/activities/:id/team/location)
  - 实时推送队员列表
  - 位置共享隐私设置存储

- [ ] Socket.io 增强 (6 人天)
  - 验证消息权限 (防止跨房间消息)
  - 心跳检测 (检查断线)
  - 消息队列 (可选, 防止丢失)

**前端任务** (22 人天)

- [ ] 队伍房间 UI (8 人天)

  - TeamRoom.vue: 成员列表、位置分布
  - 位置共享开关
  - 实时更新指示器 (最后同步时间)

- [ ] 状态上报组件 (5 人天)

  - StatusReport.vue: 4 个按钮 (OK/Rest/Injured/Separated)
  - 自动保存状态

- [ ] 实时位置同步 (7 人天)

  - 集成地理定位 API (Geolocation)
  - 定时上报 (可配置频率: 10s/30s/1min)
  - 队伍成员地图展示
  - 处理网络抖动 (断线重连后同步)

- [ ] Socket.io 前端增强 (2 人天)
  - 自动重连逻辑
  - 消息确认机制

**UI/UX 设计输出**

- [ ] 队伍成员卡片设计 (显示距离、最后更新)
- [ ] 地图布局 (4-6 人分布)

**验收标准**

- ✅ 多用户同一活动可进入同一房间
- ✅ 位置实时更新，延迟 < 5 秒
- ✅ 领队广播消息所有队员即时收到
- ✅ 网络断线重连后位置恢复同步

---

#### Sprint 4: 安全闭环 + 生产优化 (4 周)

**后端任务** (32 人天)

- [ ] SOS 系统 (10 人天)

  - SOSController: 触发 SOS、查询历史
  - 救援卡片生成 (位置、紧急联系人)
  - 权限验证 (仅用户自己 + 队伍领队可操作)

- [ ] 自动风险触发 (12 人天)

  - SafetyService: 监听位置更新
  - 失联检测 (距离上次更新 > N 分钟)
  - 异常停止检测 (速度 < 0.5 km/h 且持续 > 15 min)
  - 偏航检测优化 (计算与路线走廊距离)
  - 触发时 emit Socket 事件 + 推送通知

- [ ] 紧急联系人管理 (5 人天)

  - EmergencyContactController: CRUD
  - 脱敏显示 (电话号码隐藏部分)

- [ ] 性能测试 + 监控 (5 人天)
  - 位置更新性能测试 (1000+ qps)
  - 轨迹点查询性能优化
  - 添加关键指标 APM (Application Performance Monitoring)

**前端任务** (28 人天)

- [ ] SOS 页面 (6 人天)

  - SOSModal.vue: 倒计时确认、取消
  - 救援卡片展示 (位置、时间、路线、队伍)
  - 分享/复制功能

- [ ] 安全设置页 (5 人天)

  - SafetySettings.vue: 阈值调整
  - 失联告警分钟数
  - 偏离距离
  - 保存设置

- [ ] 紧急联系人管理 (5 人天)

  - EmergencyContacts.vue: 列表、添加、编辑、删除
  - 电话脱敏显示

- [ ] 风险提示与通知 (8 人天)

  - 实时通知 (Websocket 收到风险事件)
  - 本地通知 (Notification API)
  - 在线/离线 UI 状态
  - SOS 事件历史 UI

- [ ] 生产优化 (4 人天)
  - console.log 清理 (全量扫描移除)
  - 代码压缩与代码分割优化
  - 性能监控集成 (可选)

**集成与测试任务** (15 人天)

- [ ] 端到端测试 (8 人天)

  - 完整闭环测试: 创建路线 → 出发 → 记录 → 复盘
  - 队伍协同测试 (3 人模拟)
  - SOS 触发测试 (验证通知)

- [ ] 压力测试 (4 人天)

  - 1000 并发位置更新
  - 轨迹点批量上传
  - Socket.io 消息吞吐

- [ ] UAT (用户验收测试) (3 人天)
  - 真实场景跋山涉水测试 (户外验证)
  - 网络弱覆盖场景 (4G 降速)

**UI/UX 设计输出**

- [ ] SOS 确认模态框
- [ ] 通知样式 (风险告警、队伍消息)
- [ ] 安全设置表单

**验收标准**

- ✅ SOS 触发后队伍即时可见
- ✅ 失联规则自动触发并提醒 (≥ 1 种场景)
- ✅ 紧急联系人可管理、信息脱敏
- ✅ 所有 console.log 清理完毕
- ✅ TypeScript 严格模式 > 95% 覆盖
- ✅ 性能: API 99th percentile < 500ms

---

### 4.2 资源分配表

```
总工期: 12 周 (3 个月)
总工作量: ~200 人天

人力配置建议:
├── 后端团队 (3-4 人)
│   ├── 1 人 (资深): 架构 + 核心服务 (路线、轨迹、队伍)
│   ├── 1 人 (中级): 安全系统 + 风险触发
│   ├── 1 人 (初级): 数据库、迁移脚本、测试
│   └── 1 人 (可选): DevOps、性能优化、监控
│
├── 前端团队 (3-4 人)
│   ├── 1 人 (资深): UI 架构 + 地图/实时通信集成
│   ├── 1 人 (中级): 页面开发 (路线、行进、队伍)
│   ├── 1 人 (初级): UI 组件、样式、测试
│   └── 1 人 (可选): 性能优化、PWA 离线、监控
│
├── 设计团队 (1-2 人)
│   ├── 1 人: UI/UX 设计 (wireframe + 高保真)
│   └── 1 人 (可选): 动效设计、用户研究
│
└── QA 团队 (1-2 人)
    ├── 1 人: 功能测试 + 自动化测试
    └── 1 人 (可选): 性能、安全、压力测试
```

### 4.3 关键路径与风险

```
关键路径 (Critical Path):
Sprint 1:
  数据库表 → 后端 API → 前端 API 层 → 路线页面
  (必须完成才能进入 Sprint 2)

Sprint 2:
  轨迹 API + 地理计算 → 行进模式 UI → 复盘
  (地理计算复杂度高，需要数学验证)

Sprint 3:
  Socket.io 增强 → 位置共享 + 实时 UI
  (网络稳定性关键)

Sprint 4:
  风险检测算法 → 自动触发 + 通知
  (算法逻辑必须严谨，防止误触发)

高风险项:
1. 高德 AMap 集成 (SDK 版本兼容、网络加载)
   缓解: 提前 2 周开始集成, 有降级方案 (静态地图)

2. GPS 定位精度 (城市峡谷、地下室)
   缓解: 建立 GPS 异常处理机制, 用户可手动修正

3. 位置共享隐私合规 (涉及数据安全)
   缓解: 法务审查, 位置共享默认关闭, 明确 T&C

4. 大规模轨迹点查询性能 (track_points 表分页)
   缓解: 分区表设计, 索引优化, 缓存策略

5. Socket.io 消息丢失 (网络抖动)
   缓解: 客户端消息队列 + 服务端消息持久化

6. 天气和风 QWeather API 调用频率限制
   缓解: 后端缓存结果 (redis), 提前 1 小时更新
```

---

## 🎯 Part 5: 需要你提供的信息清单

### 5.1 产品决策 (来自 PRD 的 3 个问题)

**问题 1: 路线数据来源首发**

```
选项:
A) 平台精选为主 (由后台管理员精选路线)
B) 用户创建为主 (UGC 社区驱动)
C) 支持 GPX 导入 (专业用户友好)
D) 混合 (平台 + 用户 + 导入)

建议: D (混合)
  理由:
  - 短期依靠平台精选吸引尝鲜用户 (快速冷启动)
  - 长期依靠 UGC 形成路线库 (网络效应)
  - 支持 GPX 导入满足专业用户 (黏性)

工期影响: +1 人周 (GPX 解析库)
```

**问题 2: 地图服务与离线支持**

```
选项:
A) 高德 AMap Web SDK (完整功能，需要 Key)
B) 开源 Leaflet + 免费瓦片 (简化，功能受限)
C) 先 Web 地图占位，后续升级

建议: A + C (并行)
  理由:
  - Web: 使用高德 AMap (业界标准，覆盖好)
  - Lynx: 使用高德 Native API (高德支持 iOS/Android)
  - 占位: 功能完整但可降级到静态地图

关键集成点:
  ├── 后端: /api/v1/routes/:id/polyline (返回坐标数组)
  └── 前端: 高德 Map SDK 绘制 + 标记

工期: +2 人周 (SDK 集成)
```

**问题 3: SOS 外联方案**

```
选项:
A) 仅站内消息 + 救援卡片 (最简，可行)
B) 短信网关 (成本 ~0.1 元/条，需要与第三方合作)
C) 第三方救援服务 (成本 ~1000/月，需要资质)

建议: A + 预留接口
  理由:
  - MVP: 站内 + 救援卡片分享到微信/QQ (无成本)
  - 下期: 短信网关 (需要评估成本效益)
  - 后期: 专业救援合作 (2+ 版本后)

工期: A 基础方案 0 额外工期, B 短信网关 +1 人周
```

### 5.2 技术选型确认

| **项目**  | **推荐方案**                     | **确认?**                |
| --------- | -------------------------------- | ------------------------ |
| 端框架    | Lynx (iOS/Android native)        | ❓ 已有框架? 新建?       |
| 地图服务  | 高德 AMap                        | ❓ 已购买 Key?           |
| 天气 API  | 和风天气 QWeather                | ❓ 已购买 Key? 调用额度? |
| 位置缓存  | Redis (后续) 或 MySQL (MVP)      | ❓ 现有 Redis?           |
| WebSocket | Socket.io (已有) + 增强          | ✅                       |
| 离线数据  | IndexedDB (前端) + SQLite (Lynx) | ❓ Lynx 支持?            |
| 通知服务  | 推送平台 (iOS/Android)           | ❓ 已接入?               |

### 5.3 外部依赖明确

```
需要确认的库/服务:

前端:
  ├── html2canvas (分享卡片) ✅ 已有
  ├── 高德 AMap SDK (@amap/amap-jsapi-loader) ❓
  ├── Geolocation API (浏览器原生) ✅
  └── IndexedDB (浏览器原生) ✅

后端:
  ├── geolib 或 turf.js (地理计算) ❓
  ├── QWeather API (和风) ❓ 已购买?
  ├── Redis (缓存位置) ❓ 生产环境可用?
  └── pm2 或 systemd (进程管理) ✅ 已有

基础设施:
  ├── MySQL 版本 (需要 JSON 支持, >= 5.7) ✅
  ├── 数据库连接池大小 (当前 10, 可能需提升) ❓
  └── 推送平台 (iOS APNs, Android FCM) ❓
```

### 5.4 业务需求明确

```
1. 新手智能准备助手 (目前列在 P1)
   问题: 是否纳入 Sprint 1 P0 范围?
   影响工期: +2 人周
   建议: 留在 P1 (后 4 周), 因为路线/轨迹更核心

2. 离线能力优先级
   问题: MVP 需要离线吗? (下载路线/地图/轨迹点缓存)
   影响工期: +3 人周 (如纳入 P0)
   建议: P1 (后续优化), MVP 优先保证在线体验稳定

3. 路线/轨迹数据公开政策
   问题: 用户轨迹默认私密还是可分享?
   隐私影响: 需要用户授权页面
   建议: 默认私密, 用户可选择分享 (朋友圈 like)

4. 队伍规模限制
   问题: 单个队伍最大人数 (影响 Socket 消息吞吐)
   建议: MVP 限制 <= 20 人 (可扩展)

5. 轨迹点采样频率
   问题: 多少秒采一个点? (精度 vs 流量)
   建议: MVP 10 秒一个点 (精度 ≈ 30m @3km/h)
```

---

## 🚀 Part 6: 执行方案与下一步行动

### 6.1 前期准备清单 (1 周)

- [ ] **产品确认** (1-2 天)

  - 上述 5 个业务问题确定
  - 确认 3 个产品决策 (路线、地图、SOS)
  - UI 设计出高保真稿 (至少 3-5 个关键页面)

- [ ] **技术调研** (2-3 天)

  - 高德 AMap SDK 集成可行性 (demo)
  - 和风 QWeather API 接入测试
  - Lynx 框架能力评估 (后台定位、地理定位)
  - Redis/MySQL 性能基准测试

- [ ] **架构设计评审** (1-2 天)

  - 数据库设计走查 (索引、分区)
  - API 契约设计 (swagger/openapi)
  - 前后端数据层协议确认

- [ ] **开发环境准备** (1 天)
  - 创建 feature 分支
  - 初始化新的后端模块 (routes, services)
  - 初始化新的前端数据层目录

### 6.2 第一个 Sprint 详细计划

**周 1-2: 后端基础设施**

- 数据库建表 + 索引 (code review)
- 路线 CRUD API 开发 + 单测
- API 文档生成 (swagger)

**周 2-3: 前端数据层重构** (与后端并行)

- 完成 api/base 重构
- 完成 api/hooks/useApiRequest
- 改造 message.ts 作为示范

**周 3: 集成与页面开发**

- 前端消费路线 API
- 路线列表/详情页开发
- 地图基础组件集成

**周 3 结束: 第一阶段验收**

- [ ] API 自动化测试 > 80% 覆盖
- [ ] 路线增删改查可用
- [ ] 地图展示 ✅
- [ ] 性能基准 < 200ms

---

## 📝 总结: 你需要提供什么

### 必需项 (影响 Sprint 1 启动)

1. **产品确认** (3 个重大决策 + 5 个业务问题)
2. **设计输出** (路线、行进、队伍协同的高保真稿)
3. **技术确认** (是否已有高德 Key、和风 API、Redis 等)
4. **人力分配** (前后端各几人? 设计几人?)
5. **上线目标** (多久上线? MVP vs 完整版?)

### 可选项 (有默认建议)

1. 离线能力优先级 (建议 P1)
2. 新手助手优先级 (建议 P1)
3. 短信 SOS 时间表 (建议 后续迭代)

---

**版本**: v1.0
**最后更新**: 2026-01-19
**状态**: 待产品/技术确认
