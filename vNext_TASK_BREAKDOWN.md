# vNext 迭代任务拆分计划

**项目**: 徒步社交 App vNext 版本
**日期**: 2026-01-19
**工期**: 14 周 (2 周代码优化 + 12 周功能开发)
**团队配置**: 后端 3-4 人 + 前端 3-4 人 + 设计 1-2 人 + QA 1 人

---

## 📋 总体规划

### 迭代目标

实现徒步社交 App 的核心差异化功能:

- ✅ 智能路线系统 (路书 + 关键点)
- ✅ 实时轨迹记录 + 复盘报告
- ✅ 队伍协同 + 位置共享
- ✅ 安全闭环 (SOS + 自动风险检测)
- ✅ 地图集成 (高德 AMap)
- ✅ 天气集成 (和风天气)

### 技术栈清单

**前端**:

- Vue 3 + TypeScript + Vite
- 高德地图 AMap SDK
- IndexedDB (离线轨迹缓存)
- Socket.io Client (实时通信)

**后端**:

- Node.js + Express + TypeScript
- MySQL 5.7+ (数据持久化)
- Redis (缓存 + 实时数据)
- Socket.io Server (WebSocket)

**第三方服务**:

- 高德地图 Web API
- 和风天气 API
- 推送服务 (APNs/FCM)

---

## 🏗️ 阶段 0: 代码质量优化 (2 周)

> **目的**: 为 vNext 开发打好基础，提升代码质量基线

### 后端优化任务 (8 人天)

#### T0.1 启用 TypeScript strict 模式 (4 人天)

- **负责人**: 后端 Senior
- **优先级**: P0
- **任务内容**:
  - [ ] tsconfig.json 启用 strict: true
  - [ ] 修复 src/types/\* 类型定义
  - [ ] 修复 src/middleware/\* (auth, errorHandler)
  - [ ] 修复 src/services/\* 核心服务
  - [ ] 修复 src/controllers/\* API 端点
  - [ ] 移除所有 `as any`，改用明确类型
- **验收标准**:
  - `tsc --noEmit` 零错误
  - 单元测试通过率 > 90%

#### T0.2 统一 API 响应格式 (2 人天)

- **负责人**: 后端 Mid
- **优先级**: P0
- **任务内容**:
  - [ ] 创建 `utils/apiResponse.ts` 工具函数
  - [ ] 定义统一响应格式:
    ```typescript
    {
      code: number,
      message: string,
      data: T | null,
      timestamp: number,
      requestId?: string
    }
    ```
  - [ ] 改造所有 controller 使用统一响应
  - [ ] 更新 API 文档
- **验收标准**: 所有 API 返回格式一致

#### T0.3 清理 console.log (1 人天)

- **负责人**: 后端 Junior
- **优先级**: P0
- **任务内容**:
  - [ ] 扫描所有 console.log/warn/error
  - [ ] 迁移到 logger (winston/pino)
  - [ ] 添加 ESLint rule: `no-console`
- **验收标准**: 无非 logger 的 console 语句

#### T0.4 Socket.io 安全加固 (1 人天)

- **负责人**: 后端 Senior
- **优先级**: P0
- **任务内容**:
  - [ ] 添加消息验证 schema (Joi)
  - [ ] 权限检查中间件
  - [ ] 心跳检测机制
  - [ ] 限流保护
- **验收标准**: 所有 Socket 事件有验证

---

### 前端优化任务 (7 人天)

#### T0.5 清理 console.log (2 人天)

- **负责人**: 前端 Junior
- **优先级**: P0
- **任务内容**:
  - [ ] 扫描 frontend/src 所有 console
  - [ ] 保留关键错误日志
  - [ ] 添加 ESLint rule
- **验收标准**: ESLint 检查通过

#### T0.6 前端 API 数据层重构 (5 人天)

- **负责人**: 前端 Senior
- **优先级**: P0
- **任务内容**:
  - [ ] 创建 `api/base/apiService.ts` (统一请求封装)
  - [ ] 创建 `api/hooks/useApiRequest.ts` (通用请求 Hook)
  - [ ] 创建 `api/base/types.ts` (类型定义)
  - [ ] 改造 `api/modules/message.ts` (示范案例)
  - [ ] 更新 HTTP 拦截器 (统一错误处理)
- **验收标准**:
  - message.ts 改造完成
  - 无二次解包 `response.data?.data`

---

## 🚀 Sprint 1: 路线系统 + 基础设施 (3 周)

### 数据库任务 (3 人天)

#### T1.1 路线相关表设计 (3 人天)

- **负责人**: 后端 架构师/Senior
- **优先级**: P0
- **任务内容**:
  - [ ] 创建迁移脚本 `migrations/001_create_route_tables.sql`
  - [ ] 建表:
    - `routes` (路线基础信息)
    - `route_waypoints` (关键点)
    - `route_risk_points` (风险点)
    - `route_tags` (标签)
  - [ ] 创建索引:
    ```sql
    CREATE INDEX idx_routes_difficulty ON routes(difficulty);
    CREATE INDEX idx_routes_distance ON routes(distance);
    CREATE INDEX idx_route_waypoints_route_id ON route_waypoints(route_id);
    CREATE SPATIAL INDEX idx_routes_start_point ON routes(start_point);
    ```
  - [ ] 添加种子数据 (10-20 条精选路线)
- **验收标准**:
  - 迁移脚本可执行
  - 种子数据插入成功

**表结构参考**:

```sql
CREATE TABLE routes (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  difficulty ENUM('easy', 'moderate', 'hard', 'expert'),
  distance DECIMAL(6,2),
  elevation_gain DECIMAL(6,2),
  estimated_duration INT,
  season VARCHAR(50),
  start_point POINT NOT NULL,
  end_point POINT,
  creator_id VARCHAR(36),
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  privacy ENUM('public', 'private', 'friends_only') DEFAULT 'public',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  SPATIAL INDEX(start_point)
);

CREATE TABLE route_waypoints (
  id VARCHAR(36) PRIMARY KEY,
  route_id VARCHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  location POINT NOT NULL,
  elevation DECIMAL(6,2),
  order_index INT NOT NULL,
  waypoint_type ENUM('start', 'checkpoint', 'rest', 'viewpoint', 'end'),
  estimated_arrival_time INT,
  photos JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
  INDEX idx_route_waypoints_route_id (route_id),
  INDEX idx_route_waypoints_order (route_id, order_index)
);
```

---

### 后端 API 开发 (15 人天)

#### T1.2 路线 CRUD API (8 人天)

- **负责人**: 后端 Senior + Mid
- **优先级**: P0
- **任务内容**:
  - [ ] RouteController 实现:
    - `POST /api/v1/routes` (创建路线)
    - `GET /api/v1/routes` (列表 + 搜索 + 过滤)
    - `GET /api/v1/routes/:id` (详情)
    - `PUT /api/v1/routes/:id` (更新)
    - `DELETE /api/v1/routes/:id` (删除)
  - [ ] RouteService 业务逻辑:
    - 距离计算 (Haversine 公式)
    - 爬升计算 (关键点海拔差)
    - 预计时长计算
  - [ ] 输入验证 (Joi schema)
  - [ ] 权限控制 (仅创建者可编辑)
- **验收标准**:
  - API 单元测试覆盖率 > 80%
  - 列表查询性能 < 200ms (10000 条数据)

#### T1.3 关键点管理 API (4 人天)

- **负责人**: 后端 Mid
- **优先级**: P0
- **任务内容**:
  - [ ] WaypointController:
    - `POST /api/v1/routes/:routeId/waypoints` (添加关键点)
    - `PUT /api/v1/routes/:routeId/waypoints/:id` (更新)
    - `DELETE /api/v1/routes/:routeId/waypoints/:id` (删除)
    - `PUT /api/v1/routes/:routeId/waypoints/reorder` (批量排序)
  - [ ] 自动计算到达时间 (基于距离和难度)
- **验收标准**: 可添加 ≥ 10 个关键点

#### T1.4 路线搜索与过滤 (3 人天)

- **负责人**: 后端 Mid
- **优先级**: P1
- **任务内容**:
  - [ ] 实现过滤参数:
    - 难度 (difficulty)
    - 距离范围 (minDistance, maxDistance)
    - 爬升范围 (minElevation, maxElevation)
    - 季节 (season)
    - 附近路线 (lat, lng, radius)
  - [ ] 全文搜索 (name, description)
  - [ ] 分页优化
- **验收标准**:
  - 支持多条件组合查询
  - 响应时间 < 300ms

---

### 前端开发 (20 人天)

#### T1.5 API 层重构 (3 人天)

- **负责人**: 前端 Senior
- **优先级**: P0
- **任务内容**:
  - [ ] 创建 `api/modules/route.ts`:
    ```typescript
    export const routeApi = {
      getList(params: RouteListParams) { ... },
      getDetail(id: string) { ... },
      create(data: RouteCreateDto) { ... },
      update(id: string, data: RouteUpdateDto) { ... },
      delete(id: string) { ... }
    }
    ```
  - [ ] 类型定义 `types/route.ts`
- **验收标准**: 所有路线 API 调用通过新架构

#### T1.6 路线列表页 (6 人天)

- **负责人**: 前端 Mid × 2
- **优先级**: P0
- **任务内容**:
  - [ ] RouteList.vue:
    - 路线卡片列表 (封面图、名称、难度、距离、爬升)
    - 搜索框 (实时搜索)
    - 过滤面板 (难度、距离、爬升、季节)
    - 无限滚动 (虚拟列表优化)
  - [ ] 使用 `useApiRequest` Hook
  - [ ] 缓存列表数据 (5 分钟 TTL)
- **参考设计**: `design_images/路线列表页/`
- **验收标准**:
  - 列表流畅渲染 1000+ 条
  - 搜索响应 < 100ms

#### T1.7 路线详情页 (5 人天)

- **负责人**: 前端 Mid
- **优先级**: P0
- **任务内容**:
  - [ ] RouteDetail.vue:
    - 基础信息展示 (名称、难度、距离、爬升、时长、季节)
    - 路线描述 (展开/收起)
    - 关键点时间线 (时间轴样式)
    - 地图预览 (路线轨迹 + 关键点标记)
    - 操作按钮 (收藏、分享、开始徒步)
  - [ ] 关键点详情弹窗
- **参考设计**: `design_images/路线详情页/`
- **验收标准**:
  - 展示 ≥ 5 个关键点
  - 地图可缩放拖动

#### T1.8 路线创建/编辑表单 (6 人天)

- **负责人**: 前端 Senior
- **优先级**: P0
- **任务内容**:
  - [ ] RouteForm.vue (3 步表单):
    - 第 1 步: 基础信息 (名称、描述、难度、季节)
    - 第 2 步: 地图标记关键点 (拖拽排序)
    - 第 3 步: 预览并发布
  - [ ] 表单验证 (Vuelidate)
  - [ ] 草稿保存 (localStorage)
- **参考设计**: `design_images/路线创建/编辑表单/`
- **验收标准**:
  - 可添加 ≥ 10 个关键点
  - 表单验证完整

---

### 地图集成 (8 人天)

#### T1.9 高德地图 SDK 集成 (5 人天)

- **负责人**: 前端 Senior
- **优先级**: P0
- **任务内容**:
  - [ ] 申请高德地图 API Key
  - [ ] 创建 `components/Map/BaseMap.vue`
  - [ ] 创建 `components/Map/RouteLayer.vue` (路线绘制)
  - [ ] 创建 `components/Map/WaypointMarker.vue` (关键点标记)
  - [ ] 地图事件处理 (点击添加关键点)
- **验收标准**:
  - 地图正常渲染
  - 可绘制路线和标记

#### T1.10 地图工具类 (3 人天)

- **负责人**: 前端 Mid
- **优先级**: P1
- **任务内容**:
  - [ ] `utils/map.ts`:
    - Haversine 距离计算
    - 坐标转换 (WGS84 ↔ GCJ02)
    - 路线简化算法 (Douglas-Peucker)
  - [ ] 单元测试
- **验收标准**: 距离计算误差 < 10 米

---

### Redis 缓存设计 (2 人天)

#### T1.11 Redis 缓存策略 (2 人天)

- **负责人**: 后端 Senior
- **优先级**: P1
- **任务内容**:
  - [ ] 缓存热门路线列表:
    ```
    Key: routes:hot
    Value: JSON Array
    TTL: 300s
    ```
  - [ ] 缓存路线详情:
    ```
    Key: route:{id}
    Value: JSON Object
    TTL: 600s
    ```
  - [ ] 缓存用户搜索历史:
    ```
    Key: user:{userId}:search_history
    Value: List
    ```
  - [ ] 实现缓存失效策略 (创建/更新/删除时清除)
- **验收标准**:
  - 路线详情查询命中率 > 80%
  - 响应时间降低 50%+

---

### UI/UX 设计交付 (Week 1-2)

#### T1.12 设计稿输出

- **负责人**: UI 设计师
- **优先级**: P0
- **交付内容**:
  - [ ] 路线列表页 (Wireframe + 高保真)
  - [ ] 路线详情页 (Wireframe + 高保真)
  - [ ] 路线创建表单 (3 步流程设计)
  - [ ] 关键点时间线样式
  - [ ] 地图标记 icon 设计
  - [ ] 难度标签/风险标签设计
- **参考资料**: `design_images/` 文件夹
- **验收标准**: Figma 交付 + 切图资源

---

### Sprint 1 验收标准

**功能验收**:

- ✅ 可创建包含 ≥ 5 个关键点的路线
- ✅ 路线列表支持搜索和过滤
- ✅ 地图展示路线轨迹和关键点
- ✅ 路线详情完整展示

**性能验收**:

- ✅ 路线列表查询 < 200ms
- ✅ 路线详情查询 < 150ms (缓存命中)
- ✅ 地图加载 < 2s

**质量验收**:

- ✅ 后端单元测试覆盖率 > 80%
- ✅ 前端 TypeScript strict 覆盖 > 80%
- ✅ 无 console.log

---

## 🏃 Sprint 2: 轨迹记录 + 复盘报告 (3 周)

### 数据库任务 (2 人天)

#### T2.1 轨迹相关表设计 (2 人天)

- **负责人**: 后端 Senior
- **优先级**: P0
- **任务内容**:
  - [ ] 创建迁移脚本 `migrations/002_create_track_tables.sql`
  - [ ] 建表:
    - `tracks` (轨迹主表)
    - `track_points` (轨迹点 - 使用分区表)
    - `hike_reports` (复盘报告)
  - [ ] 创建索引和分区:
    ```sql
    CREATE TABLE track_points (
      id BIGINT AUTO_INCREMENT,
      track_id VARCHAR(36) NOT NULL,
      latitude DECIMAL(10,8) NOT NULL,
      longitude DECIMAL(11,8) NOT NULL,
      elevation DECIMAL(6,2),
      accuracy DECIMAL(5,2),
      speed DECIMAL(5,2),
      timestamp BIGINT NOT NULL,
      recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id, recorded_at),
      INDEX idx_track_points_track_id (track_id),
      INDEX idx_track_points_timestamp (timestamp)
    ) PARTITION BY RANGE (YEAR(recorded_at)) (
      PARTITION p2026 VALUES LESS THAN (2027),
      PARTITION p2027 VALUES LESS THAN (2028),
      PARTITION p2028 VALUES LESS THAN (2029)
    );
    ```
- **验收标准**:
  - 分区表创建成功
  - 可插入百万级轨迹点

---

### 后端 API 开发 (18 人天)

#### T2.2 轨迹记录 API (8 人天)

- **负责人**: 后端 Senior + Mid
- **优先级**: P0
- **任务内容**:
  - [ ] TrackController:
    - `POST /api/v1/tracks/start` (开始记录)
    - `POST /api/v1/tracks/:id/points` (批量上传轨迹点)
    - `POST /api/v1/tracks/:id/stop` (结束记录)
    - `GET /api/v1/tracks/:id` (查询轨迹)
  - [ ] TrackService:
    - 批量插入优化 (一次 100-500 个点)
    - 轨迹点去重 (基于 timestamp)
    - 异常点过滤 (速度 > 50 km/h 的点)
  - [ ] 统计计算:
    - 总距离 (累加每两点距离)
    - 总爬升 (累加海拔上升)
    - 平均配速
    - 最高/最低海拔
- **验收标准**:
  - 批量插入 500 点 < 500ms
  - 统计数据误差 < 5%

#### T2.3 复盘报告生成 (6 人天)

- **负责人**: 后端 Mid
- **优先级**: P0
- **任务内容**:
  - [ ] HikeReportService:
    - 自动生成报告 (轨迹结束时触发)
    - 关联路线信息
    - 关联关键点到达记录
    - 生成总结数据 (亮点、建议、成就徽章)
  - [ ] ReportController:
    - `GET /api/v1/reports/:id` (查询报告)
    - `PUT /api/v1/reports/:id` (编辑报告)
  - [ ] 照片关联逻辑 (关键点照片上传)
- **验收标准**:
  - 报告生成时间 < 3s
  - 包含 ≥ 6 个数据项

#### T2.4 偏航检测服务 (4 人天)

- **负责人**: 后端 Senior
- **优先级**: P1
- **任务内容**:
  - [ ] DeviationService:
    - 计算轨迹点到路线的垂直距离
    - 判定偏航: 距离 > 100m 且持续 > 5 分钟
    - 推送告警 (Socket.io emit)
  - [ ] 配置化阈值 (用户可设置)
- **验收标准**:
  - 检测延迟 < 10s
  - 准确率 > 90%

---

### 前端开发 (25 人天)

#### T2.5 行进模式页面 (10 人天)

- **负责人**: 前端 Senior + Mid
- **优先级**: P0
- **任务内容**:
  - [ ] HikingMode.vue:
    - 地图区域 (占 60% 屏幕)
    - 用户位置实时标记 (呼吸动画)
    - 路线轨迹绘制
    - 关键点标记 + 进度指示
  - [ ] 顶部卡片 (悬浮):
    - 下一个关键点名称
    - 剩余距离
    - 预计到达时间
  - [ ] 底部数据面板:
    - 已走距离/总距离
    - 当前配速
    - 总爬升
    - 已用时间
  - [ ] 控制按钮:
    - 暂停/继续
    - 结束徒步
    - SOS (醒目红色按钮)
  - [ ] 关键点到达提醒 (距离 < 100m 时振动 + 弹窗)
- **参考设计**: `design_images/行进模式主屏/`
- **验收标准**:
  - 实时位置更新流畅 (1s 刷新)
  - 地图跟随模式正常

#### T2.6 轨迹采集与缓存 (8 人天)

- **负责人**: 前端 Senior
- **优先级**: P0
- **任务内容**:
  - [ ] `hooks/useTrack.ts`:
    - 定时采集位置 (10s/次)
    - 本地 IndexedDB 缓存
    - 批量上传机制 (50 个点/次 或 5 分钟/次)
    - 网络恢复时自动同步
  - [ ] 离线能力:
    - 离线时继续记录
    - 网络恢复后补传
  - [ ] 性能优化:
    - 防抖处理
    - 后台运行 (Web Worker)
- **验收标准**:
  - 离线记录 100 个点不丢失
  - 网络恢复后全部上传成功

#### T2.7 复盘报告页 (5 人天)

- **负责人**: 前端 Mid
- **优先级**: P0
- **任务内容**:
  - [ ] HikeReport.vue:
    - Tab 切换 (统计/分析/分享)
    - 统计 Tab: 6+ 数据项展示
    - 分析 Tab: 海拔图表 (SVG/ECharts)、配速曲线
    - 分享 Tab: 4 种分享卡片模板
  - [ ] 关键点时间轴 (到达时间记录)
  - [ ] 照片墙 (关键点照片)
  - [ ] 亮点/建议/徽章展示
- **参考设计**: `design_images/复盘报告页/`
- **验收标准**:
  - 报告加载 < 2s
  - 海拔图表流畅

#### T2.8 分享卡片生成 (2 人天)

- **负责人**: 前端 Mid
- **优先级**: P1
- **任务内容**:
  - [ ] ShareCard.vue:
    - 使用 html2canvas 生成图片
    - 4 种模板 (简约/活力/专业/文艺)
    - 保存到相册/分享到社交平台
  - [ ] 图片优化 (压缩到 < 500KB)
- **参考设计**: `design_images/分享卡片模板/`
- **验收标准**:
  - 生成时间 < 3s
  - 图片清晰度合格

---

### Redis 实时数据 (2 人天)

#### T2.9 轨迹实时缓存 (2 人天)

- **负责人**: 后端 Mid
- **优先级**: P1
- **任务内容**:
  - [ ] 缓存进行中的轨迹:
    ```
    Key: track:active:{trackId}
    Value: Hash {
      start_time, last_update, point_count, distance, elevation_gain
    }
    TTL: 86400s (24h)
    ```
  - [ ] 缓存最新 10 个轨迹点 (用于实时展示):
    ```
    Key: track:points:{trackId}
    Value: List [Point...]
    ```
  - [ ] 轨迹结束时持久化到 MySQL
- **验收标准**:
  - 实时数据查询 < 10ms
  - 数据一致性 100%

---

### Sprint 2 验收标准

**功能验收**:

- ✅ 可完整记录一次徒步 (开始 → 记录 → 结束)
- ✅ 离线记录 ≥ 50 个轨迹点，网络恢复后上传成功
- ✅ 复盘报告自动生成，包含 ≥ 6 个数据项
- ✅ 分享卡片可导出 PNG

**性能验收**:

- ✅ 轨迹点批量插入 500 点 < 500ms
- ✅ 复盘报告生成 < 3s
- ✅ 分享卡片生成 < 3s

**质量验收**:

- ✅ IndexedDB 缓存可靠性 > 99%
- ✅ 轨迹点上传成功率 > 99.5%

---

## 👥 Sprint 3: 队伍协同 + 实时通信 (2 周)

### 数据库任务 (1 人天)

#### T3.1 队伍协同表设计 (1 人天)

- **负责人**: 后端 Senior
- **优先级**: P0
- **任务内容**:
  - [ ] 创建迁移脚本 `migrations/003_create_team_tables.sql`
  - [ ] 建表:
    - `team_rooms` (队伍房间)
    - `team_members` (成员列表)
    - `team_location_shares` (位置共享记录)
  - [ ] 创建索引:
    ```sql
    CREATE INDEX idx_team_members_activity_id ON team_members(activity_id);
    CREATE INDEX idx_team_members_user_id ON team_members(user_id);
    ```
- **验收标准**: 迁移脚本可执行

---

### 后端 API 开发 (12 人天)

#### T3.2 队伍房间 API (6 人天)

- **负责人**: 后端 Mid
- **优先级**: P0
- **任务内容**:
  - [ ] TeamController:
    - `POST /api/v1/activities/:id/team` (创建队伍房间)
    - `GET /api/v1/activities/:id/team` (获取房间信息)
    - `POST /api/v1/activities/:id/team/members` (邀请成员)
    - `DELETE /api/v1/activities/:id/team/members/:userId` (移除成员)
    - `POST /api/v1/activities/:id/team/broadcast` (领队广播)
  - [ ] 权限控制:
    - 仅活动参与者可进入房间
    - 仅领队可广播/移除成员
- **验收标准**:
  - 房间可容纳 ≤ 20 人
  - 权限控制完整

#### T3.3 位置共享服务 (6 人天)

- **负责人**: 后端 Senior
- **优先级**: P0
- **任务内容**:
  - [ ] LocationShareService:
    - `POST /api/v1/activities/:id/team/location` (上报位置)
    - `GET /api/v1/activities/:id/team/locations` (获取所有成员位置)
  - [ ] Redis 实时存储:
    ```
    Key: team:{activityId}:locations
    Value: Hash {
      userId: {lat, lng, accuracy, timestamp, status}
    }
    TTL: 3600s
    ```
  - [ ] Socket.io 实时推送:
    - 位置更新广播给房间所有成员
    - 成员状态变化通知
  - [ ] 隐私设置 (用户可关闭位置共享)
- **验收标准**:
  - 位置更新延迟 < 3s
  - 支持 ≥ 10 人同时共享

---

### Socket.io 增强 (4 人天)

#### T3.4 Socket.io 安全与性能优化 (4 人天)

- **负责人**: 后端 Senior
- **优先级**: P0
- **任务内容**:
  - [ ] 消息验证:
    - 验证用户是否在房间内
    - 验证消息格式 (Joi schema)
  - [ ] 心跳检测:
    - 客户端每 30s 发送 ping
    - 服务端 90s 无响应标记离线
  - [ ] 限流保护:
    - 位置上报频率限制 (最快 5s/次)
    - 广播消息限制 (1 次/5s)
  - [ ] 消息队列 (可选):
    - 离线消息存储 (Redis List)
    - 重连后推送
- **验收标准**:
  - 防止跨房间消息泄露
  - 心跳检测准确率 > 95%

---

### 前端开发 (18 人天)

#### T3.5 队伍房间页面 (8 人天)

- **负责人**: 前端 Senior
- **优先级**: P0
- **任务内容**:
  - [ ] TeamRoom.vue:
    - 成员列表 (侧边栏/抽屉)
    - 成员卡片:
      - 头像、昵称
      - 距离我的距离
      - 最后更新时间
      - 状态 (正常/休息/受伤/失联)
    - 地图展示所有成员位置
    - 位置共享开关
    - 领队广播输入框
  - [ ] 实时更新指示器 (最后同步时间)
  - [ ] 成员详情弹窗 (点击成员卡片)
- **参考设计**: `design_images/队伍成员卡片/`
- **验收标准**:
  - 成员列表实时更新
  - 地图流畅展示 ≤ 20 人

#### T3.6 状态上报组件 (4 人天)

- **负责人**: 前端 Mid
- **优先级**: P0
- **任务内容**:
  - [ ] StatusReport.vue:
    - 4 个状态按钮 (OK/Rest/Injured/Separated)
    - 可选备注输入
    - 自动保存状态
  - [ ] 状态广播 (Socket.io emit)
  - [ ] 状态历史记录
- **验收标准**:
  - 状态切换即时生效
  - 所有成员收到通知

#### T3.7 实时位置同步 (6 人天)

- **负责人**: 前端 Senior
- **优先级**: P0
- **任务内容**:
  - [ ] `hooks/useLocationShare.ts`:
    - 集成 Geolocation API
    - 定时上报位置 (可配置: 10s/30s/1min)
    - Socket.io 监听成员位置更新
    - 处理网络抖动 (断线重连)
  - [ ] 地图成员标记:
    - 动态更新成员位置
    - 成员状态颜色编码
    - 距离计算与显示
  - [ ] 隐私控制 (用户可关闭位置共享)
- **验收标准**:
  - 位置更新延迟 < 5s
  - 断线重连后位置恢复

---

### Redis 队伍数据 (1 人天)

#### T3.8 队伍实时数据缓存 (1 人天)

- **负责人**: 后端 Mid
- **优先级**: P1
- **任务内容**:
  - [ ] 缓存房间成员列表:
    ```
    Key: team:{activityId}:members
    Value: Set [userId1, userId2...]
    TTL: 86400s
    ```
  - [ ] 缓存成员在线状态:
    ```
    Key: team:{activityId}:online
    Value: Set [userId1, userId2...]
    TTL: 300s
    ```
  - [ ] 定时清理离线用户
- **验收标准**:
  - 成员列表查询 < 10ms
  - 在线状态准确率 > 95%

---

### Sprint 3 验收标准

**功能验收**:

- ✅ 多用户可进入同一队伍房间
- ✅ 位置实时共享，延迟 < 5s
- ✅ 领队广播消息所有成员即时收到
- ✅ 网络断线重连后位置恢复同步

**性能验收**:

- ✅ 位置更新 QPS > 100
- ✅ Socket.io 消息延迟 < 500ms
- ✅ 房间可容纳 20 人并发

**质量验收**:

- ✅ 无跨房间消息泄露
- ✅ 心跳检测准确率 > 95%

---

## 🚨 Sprint 4: 安全闭环 + 生产优化 (4 周)

### 数据库任务 (2 人天)

#### T4.1 安全相关表设计 (2 人天)

- **负责人**: 后端 Senior
- **优先级**: P0
- **任务内容**:
  - [ ] 创建迁移脚本 `migrations/004_create_safety_tables.sql`
  - [ ] 建表:
    - `sos_events` (SOS 事件记录)
    - `emergency_contacts` (紧急联系人)
    - `safety_alerts` (自动风险告警)
  - [ ] 创建索引:
    ```sql
    CREATE INDEX idx_sos_events_user_id ON sos_events(user_id);
    CREATE INDEX idx_sos_events_activity_id ON sos_events(activity_id);
    CREATE INDEX idx_safety_alerts_created_at ON safety_alerts(created_at);
    ```
- **验收标准**: 迁移脚本可执行

---

### 后端 API 开发 (25 人天)

#### T4.2 SOS 系统 (10 人天)

- **负责人**: 后端 Senior + Mid
- **优先级**: P0
- **任务内容**:
  - [ ] SOSController:
    - `POST /api/v1/sos/trigger` (触发 SOS)
    - `POST /api/v1/sos/:id/cancel` (取消 SOS)
    - `GET /api/v1/sos/history` (查询历史)
  - [ ] SOSService:
    - 生成救援卡片 (位置、时间、路线、队伍信息)
    - 广播 SOS 事件 (Socket.io)
    - 推送通知给队伍成员
    - 通知紧急联系人 (站内消息)
  - [ ] 权限控制:
    - 仅用户自己可触发
    - 队伍领队可查看
  - [ ] 可选: 短信网关集成 (发送给紧急联系人)
- **验收标准**:
  - SOS 触发后 3s 内所有成员收到通知
  - 救援卡片包含完整信息

#### T4.3 自动风险检测服务 (12 人天)

- **负责人**: 后端 Senior
- **优先级**: P0
- **任务内容**:
  - [ ] SafetyService:
    - 失联检测:
      - 监听位置更新
      - 超过 N 分钟无更新 → 触发告警
      - 可配置阈值 (默认 15 分钟)
    - 异常停止检测:
      - 速度 < 0.5 km/h 且持续 > 15 分钟
      - 排除休息点 (关键点附近)
    - 偏航检测 (优化):
      - 距离路线 > 100m 且持续 > 5 分钟
      - 考虑路线宽度 (主路 vs 小径)
    - 天气风险检测 (集成和风天气):
      - 查询当前位置天气
      - 检测恶劣天气 (暴雨/大风/雷电)
      - 推送预警
  - [ ] 告警推送:
    - Socket.io emit 给用户和队伍
    - 推送通知 (APNs/FCM)
    - 站内消息
  - [ ] Redis 任务队列:
    - 定时检测任务 (每 30s)
    - 使用 Bull Queue
- **验收标准**:
  - 失联检测延迟 < 1 分钟
  - 误报率 < 5%

#### T4.4 紧急联系人管理 (3 人天)

- **负责人**: 后端 Mid
- **优先级**: P0
- **任务内容**:
  - [ ] EmergencyContactController:
    - `GET /api/v1/emergency-contacts` (列表)
    - `POST /api/v1/emergency-contacts` (添加)
    - `PUT /api/v1/emergency-contacts/:id` (更新)
    - `DELETE /api/v1/emergency-contacts/:id` (删除)
  - [ ] 脱敏处理 (电话号码隐藏中间 4 位)
  - [ ] 最多 5 个联系人限制
- **验收标准**:
  - CRUD 完整
  - 脱敏显示正确

---

### 前端开发 (20 人天)

#### T4.5 SOS 页面 (6 人天)

- **负责人**: 前端 Mid
- **优先级**: P0
- **任务内容**:
  - [ ] SOSModal.vue:
    - 倒计时确认 (5 秒)
    - 可取消按钮
    - 确认后显示救援卡片
  - [ ] 救援卡片展示:
    - 当前位置 (经纬度 + 地址)
    - 当前时间
    - 路线信息
    - 队伍成员列表
    - 紧急联系人
  - [ ] 分享/复制功能
  - [ ] SOS 历史记录
- **参考设计**: `design_images/SOS 确认模态框/`
- **验收标准**:
  - 倒计时准确
  - 救援卡片信息完整

#### T4.6 安全设置页 (4 人天)

- **负责人**: 前端 Mid
- **优先级**: P0
- **任务内容**:
  - [ ] SafetySettings.vue:
    - 失联告警阈值 (分钟数)
    - 偏离距离阈值 (米)
    - 异常停止时长 (分钟)
    - 位置上报频率
    - 保存设置按钮
  - [ ] 表单验证
- **验收标准**:
  - 设置可持久化
  - 实时生效

#### T4.7 紧急联系人管理 (4 人天)

- **负责人**: 前端 Junior
- **优先级**: P0
- **任务内容**:
  - [ ] EmergencyContacts.vue:
    - 联系人列表 (姓名、关系、电话)
    - 添加联系人表单
    - 编辑/删除操作
    - 电话脱敏显示
  - [ ] 最多 5 个联系人限制
- **验收标准**:
  - CRUD 完整
  - 交互流畅

#### T4.8 风险提示与通知 (6 人天)

- **负责人**: 前端 Senior
- **优先级**: P0
- **任务内容**:
  - [ ] `hooks/useNotification.ts`:
    - Socket.io 监听风险事件
    - 浏览器通知 (Notification API)
    - 应用内弹窗提示
  - [ ] 通知类型:
    - 失联告警
    - 偏航告警
    - 异常停止告警
    - 天气预警
    - SOS 事件
  - [ ] 通知历史记录
  - [ ] 通知权限请求
- **验收标准**:
  - 通知即时显示
  - 权限请求友好

---

### 天气集成 (3 人天)

#### T4.9 和风天气 API 集成 (3 人天)

- **负责人**: 后端 Mid
- **优先级**: P1
- **任务内容**:
  - [ ] WeatherService:
    - 获取实时天气 (温度、天气状况、风力)
    - 获取天气预警 (暴雨/大风/雷电)
    - 缓存天气数据 (Redis, TTL 30 分钟)
  - [ ] WeatherController:
    - `GET /api/v1/weather/current?lat=&lng=` (实时天气)
    - `GET /api/v1/weather/alerts?lat=&lng=` (天气预警)
  - [ ] 在路线详情页展示天气信息
- **验收标准**:
  - 天气数据准确
  - API 调用成本可控 (< 1000 次/天)

---

### 生产优化 (10 人天)

#### T4.10 性能测试与优化 (5 人天)

- **负责人**: 后端 Senior + QA
- **优先级**: P0
- **任务内容**:
  - [ ] 压力测试:
    - 位置更新 1000 QPS
    - 轨迹点批量插入
    - Socket.io 并发连接 500+
  - [ ] 数据库优化:
    - 慢查询分析
    - 索引优化
    - 连接池调优
  - [ ] Redis 优化:
    - 内存使用分析
    - 键过期策略优化
  - [ ] APM 集成 (可选):
    - New Relic / Datadog / 阿里云 ARMS
- **验收标准**:
  - P99 响应时间 < 500ms
  - QPS > 500

#### T4.11 前端性能优化 (3 人天)

- **负责人**: 前端 Senior
- **优先级**: P1
- **任务内容**:
  - [ ] 代码分割:
    - 路由懒加载
    - 组件懒加载
  - [ ] 资源优化:
    - 图片压缩 (TinyPNG)
    - 图片懒加载
  - [ ] 缓存策略:
    - Service Worker (PWA)
    - HTTP 缓存优化
  - [ ] 性能监控:
    - Web Vitals 集成
    - 上报性能指标
- **验收标准**:
  - 首屏加载 < 3s
  - Lighthouse 分数 > 90

#### T4.12 代码清理与规范 (2 人天)

- **负责人**: 全员
- **优先级**: P0
- **任务内容**:
  - [ ] 清理所有 console.log (前后端)
  - [ ] 清理未使用的代码
  - [ ] 统一代码格式 (Prettier)
  - [ ] ESLint 检查通过
  - [ ] 更新 README 和 API 文档
- **验收标准**:
  - ESLint 零警告
  - 代码覆盖率 > 80%

---

### 集成测试 (12 人天)

#### T4.13 端到端测试 (8 人天)

- **负责人**: QA + 前后端各 1 人
- **优先级**: P0
- **任务内容**:
  - [ ] 完整闭环测试:
    - 创建路线 → 邀请队伍 → 开始徒步 → 记录轨迹 → 复盘报告
  - [ ] 队伍协同测试 (3 人模拟):
    - 位置共享
    - 状态更新
    - 领队广播
  - [ ] SOS 触发测试:
    - 手动触发
    - 自动风险检测触发
    - 通知验证
  - [ ] 离线场景测试:
    - 断网记录轨迹
    - 网络恢复后同步
  - [ ] 使用 Cypress / Playwright
- **验收标准**:
  - 核心流程测试覆盖率 100%
  - 关键路径无阻塞性 bug

#### T4.14 压力测试 (4 人天)

- **负责人**: 后端 Senior + QA
- **优先级**: P0
- **任务内容**:
  - [ ] 1000 并发位置更新
  - [ ] 轨迹点批量上传 (10000 点/次)
  - [ ] Socket.io 消息吞吐 (500+ 连接)
  - [ ] 使用 Apache JMeter / Artillery
- **验收标准**:
  - 系统稳定性 > 99.9%
  - 无内存泄漏

---

### Sprint 4 验收标准

**功能验收**:

- ✅ SOS 系统完整可用
- ✅ 自动风险检测准确触发
- ✅ 紧急联系人管理完整
- ✅ 天气集成正常

**性能验收**:

- ✅ P99 响应时间 < 500ms
- ✅ QPS > 500
- ✅ 首屏加载 < 3s

**质量验收**:

- ✅ 端到端测试覆盖率 100%
- ✅ 压力测试通过
- ✅ 无 P0/P1 bug

---

## 📊 资源分配总览

### 人力配置

| 角色               | 人数 | 工作内容                        |
| ------------------ | ---- | ------------------------------- |
| 后端 Senior        | 2    | 架构设计、核心服务、性能优化    |
| 后端 Mid           | 2    | API 开发、业务逻辑、集成测试    |
| 后端 Junior        | 0-1  | 数据库脚本、辅助开发            |
| 前端 Senior        | 2    | 架构设计、复杂页面、性能优化    |
| 前端 Mid           | 2    | 页面开发、组件封装、集成测试    |
| 前端 Junior        | 0-1  | 简单页面、UI 调整               |
| UI/UX 设计师       | 1-2  | 设计稿、交互设计、切图          |
| QA                 | 1    | 测试计划、自动化测试、性能测试  |
| 架构师 (Tech Lead) | 1    | 整体架构、技术选型、code review |

### 工期里程碑

| 时间节点   | 里程碑        | 交付物              |
| ---------- | ------------- | ------------------- |
| Week 1-2   | 代码优化完成  | 优化后的代码基线    |
| Week 3-5   | Sprint 1 完成 | 路线系统 + 地图集成 |
| Week 6-8   | Sprint 2 完成 | 轨迹记录 + 复盘报告 |
| Week 9-10  | Sprint 3 完成 | 队伍协同 + 实时通信 |
| Week 11-14 | Sprint 4 完成 | 安全闭环 + 生产优化 |
| Week 14 末 | 上线准备      | 完整验收 + 部署文档 |

---

## 🎯 关键路径分析

### 核心依赖链

```
代码优化 (Week 1-2)
    ↓
数据库设计 (Sprint 1, Day 1-3)
    ↓
路线 API 开发 (Sprint 1, Day 4-11)
    ↓ (可并行)
├─ 轨迹 API 开发 (Sprint 2)
├─ 队伍 API 开发 (Sprint 3)
└─ SOS API 开发 (Sprint 4)
```

### 阻塞风险

| 任务                | 阻塞影响         | 缓解措施                   |
| ------------------- | ---------------- | -------------------------- |
| 数据库设计延迟      | 所有后续开发     | 提前 code review, 快速迭代 |
| 高德地图 API 申请慢 | 地图功能无法开发 | 提前申请, 准备备选方案     |
| TypeScript strict   | 后端开发效率降低 | 分阶段启用, 优先核心模块   |
| Socket.io 性能问题  | 实时功能不稳定   | 提前压测, 准备降级方案     |

---

## 📝 交付物清单

### 代码交付

- [ ] 前端代码 (frontend/)
  - [ ] 所有页面组件
  - [ ] API 层重构
  - [ ] 地图组件
  - [ ] 实时通信 hooks
- [ ] 后端代码 (backend/)
  - [ ] 所有 API 端点
  - [ ] 业务服务层
  - [ ] Socket.io 服务
  - [ ] 数据库迁移脚本
- [ ] 测试代码
  - [ ] 单元测试
  - [ ] 集成测试
  - [ ] E2E 测试

### 文档交付

- [ ] API 文档 (Swagger/Postman)
- [ ] 数据库设计文档
- [ ] 部署文档
- [ ] 用户手册
- [ ] 开发者文档

### 设计交付

- [ ] 所有页面设计稿 (Figma)
- [ ] 组件库规范
- [ ] 切图资源

---

## ✅ 上线前检查清单

### 功能完整性

- [ ] 路线系统 (创建/编辑/搜索/详情)
- [ ] 轨迹记录 (开始/记录/结束/复盘)
- [ ] 队伍协同 (房间/位置共享/状态上报)
- [ ] 安全闭环 (SOS/自动检测/紧急联系人)
- [ ] 地图集成 (路线展示/实时位置/成员分布)
- [ ] 天气集成 (实时天气/预警)

### 性能指标

- [ ] API P99 < 500ms
- [ ] 前端首屏 < 3s
- [ ] Socket.io 延迟 < 500ms
- [ ] 数据库查询 < 200ms
- [ ] Redis 命中率 > 80%

### 安全检查

- [ ] 所有 API 有权限验证
- [ ] Socket.io 消息验证
- [ ] SQL 注入防护
- [ ] XSS 防护
- [ ] CSRF 防护
- [ ] 敏感数据加密

### 质量标准

- [ ] 代码覆盖率 > 80%
- [ ] TypeScript strict 100%
- [ ] ESLint 零警告
- [ ] 无 console.log
- [ ] 无 P0/P1 bug

### 运维准备

- [ ] 部署文档完整
- [ ] 监控告警配置
- [ ] 备份策略制定
- [ ] 回滚预案准备
- [ ] 应急响应流程

---

## 🚀 后续迭代规划 (P1/P2)

### P1 功能 (上线后 1-2 个月)

- [ ] 离线地图下载
- [ ] 新手准备助手
- [ ] Lynx 跨端适配
- [ ] GPX 文件导入
- [ ] 语音通话 (队伍内)

### P2 功能 (上线后 3-6 个月)

- [ ] AI 路线推荐
- [ ] 社区动态
- [ ] 装备租赁
- [ ] 户外保险对接
- [ ] 数据分析看板

---

**文档版本**: v1.0
**最后更新**: 2026-01-19
**维护人**: 项目经理 / Tech Lead
