# 徒步社交应用 - 前端功能实现总结

## 📱 已完成的前端页面组件

### 1. RouteList.vue (路线列表页面)

**位置**: `frontend/src/components/pages/RouteList.vue`

**功能特性**:

- ✅ 路线网格展示（响应式卡片布局，最小300px）
- ✅ 搜索功能（路线名称）
- ✅ 难度等级过滤（简单/中等/困难/专家）
- ✅ 路线卡片信息展示：
  - 封面图片
  - 难度徽章（颜色编码）
  - 基本统计（距离、爬升、预计时长）
  - 标签显示
  - 评分星数
- ✅ 点击卡片导航到详情页
- ✅ API 集成：`routeApi.getRoutes()` 和 `routeApi.getRouteTags()`

**技术栈**:

- Vue 3 Composition API
- TypeScript
- SCSS 样式表
- 响应式设计 (网格布局 auto-fill)

---

### 2. TrackRecorder.vue (轨迹记录页面)

**位置**: `frontend/src/components/pages/TrackRecorder.vue`

**功能特性**:

- ✅ 实时 GPS 位置记录（使用 Geolocation API）
- ✅ 地图集成（显示实时轨迹）
- ✅ 实时数据面板：
  - 总距离 (km)
  - 记录时长 (h:m:s)
  - 平均速度 (km/h)
  - 爬升高度 (m)
- ✅ 徒步信息编辑：
  - 徒步名称（输入框）
  - 路线关联（下拉选择）
  - 徒步描述（文本域）
- ✅ 轨迹点列表预览（显示最后5个）
- ✅ 操作按钮：
  - 开始记录
  - 暂停/继续
  - 停止记录
  - 完成徒步（需要轨迹点和名称）
  - 放弃记录
- ✅ API 集成：
  - `trackApi.createTrack()` - 创建轨迹
  - `trackApi.uploadTrackPoints()` - 上传轨迹点
  - `trackApi.completeTrack()` - 完成轨迹
  - `routeApi.getRoutes()` - 获取路线列表

**技术栈**:

- Vue 3 Composition API + TypeScript
- useTrackRecorder composable（GPS录制）
- createMap utility（地图集成）
- 响应式网格布局

---

### 3. RouteDetail.vue (路线详情页面)

**位置**: `frontend/src/components/pages/RouteDetail.vue`

**功能特性**:

- ✅ 路线基本信息展示
- ✅ 返回按钮导航
- ✅ 路线统计数据（距离、爬升、时长等）
- ✅ 开始徒步按钮（导航到 TrackRecorder）
- ✅ API 集成：`routeApi.getDetail(routeId)`

**注**: 当前为简化版本，完整版将包含：

- 路线详细描述
- 风险提示
- 评价列表（带头像、评分、日期）
- 路线要点展示
- 用户上传的照片库

---

### 4. UserProfile.vue / Profile.vue (用户资料页面)

**位置**: `frontend/src/components/pages/UserProfile.vue`

**功能特性**:

- ✅ 用户头像和封面
- ✅ 用户信息展示（昵称、简介、加入日期）
- ✅ 统计数据：
  - 完成徒步数
  - 累计公里数
  - 粉丝数
  - 关注数
- ✅ 标签页切换：
  - 徒步记录
  - 喜欢的路线
  - 成就
  - 设置（仅自己可见）
- ✅ 社交功能：
  - 关注/取消关注
  - 编辑个人资料
  - 登出
- ✅ 徒步记录展示（卡片网格）
- ✅ 喜欢的路线展示（带难度标记）
- ✅ 成就系统展示（图标+说明）
- ✅ 个人设置（复选框）
- ✅ API 集成：
  - `userApi.getUserDetail()`
  - `userApi.followUser()`
  - `userApi.unfollowUser()`
  - `userApi.updateProfile()`
  - `trackApi.getUserTracks()`
  - `routeApi.getUserFavoriteRoutes()`

---

## 🔄 路由配置

已更新 `frontend/src/router/index.ts`，添加以下新路由：

```typescript
{
  path: '/routes',
  name: 'RouteList',
  component: () => import('@/components/pages/RouteList.vue'),
  meta: { requiresAuth: true },
},
{
  path: '/route/:id',
  name: 'RouteDetail',
  component: () => import('@/components/pages/RouteDetail.vue'),
  meta: { requiresAuth: true },
},
{
  path: '/track-recorder',
  name: 'TrackRecorder',
  component: () => import('@/components/pages/TrackRecorder.vue'),
  meta: { requiresAuth: true },
},
{
  path: '/track/:id',
  name: 'TrackDetail',
  component: () => import('@/components/pages/MyHiking.vue'),
  meta: { requiresAuth: true },
},
```

---

## 📚 前端工具库 (Utilities)

### 1. useAuth (认证管理)

**位置**: `frontend/src/utils/auth.ts`

- `currentUser` - 响应式用户信息
- `login(email, password)` - 登录
- `register(email, password, name)` - 注册
- `logout()` - 登出
- `refreshUserInfo()` - 刷新用户信息
- `getAuthHeader()` - 获取认证 header

### 2. createMap (地图集成)

**位置**: `frontend/src/utils/map.ts`

- `createMap(containerId)` - 初始化地图
- `addMarker(lat, lng, title)` - 添加标记
- `getCurrentPosition()` - 获取当前位置
- `geocode(address)` - 地址编码
- `planWalkingRoute(start, end)` - 规划徒步路线
- 支持高德地图 API

### 3. useTrackRecorder (GPS 轨迹记录)

**位置**: `frontend/src/utils/trackRecorder.ts`

```typescript
const {
  isRecording,        // 是否正在记录
  stats,              // 统计数据对象
  points,             // 记录的轨迹点数组
  start(),            // 开始记录
  stop(),             // 停止记录
  pause(),            // 暂停记录
  resume()            // 继续记录
} = useTrackRecorder({
  minDistance: 5,     // 最小距离差 (米)
  minInterval: 3000   // 最小时间间隔 (毫秒)
})
```

功能：

- ✅ 浏览器 Geolocation API 集成
- ✅ 智能点过滤（距离和时间）
- ✅ 自动统计计算（距离、爬升、速度）
- ✅ 暂停/恢复功能

---

## 🔌 API 模块

### 1. routeApi

**位置**: `frontend/src/api/modules/route.ts`

```typescript
// 获取所有路线（分页）
getList(params?: RouteListParams): Promise<ApiResponseWithPagination<Route[]>>

// 获取单个路线详情
getDetail(id: string): Promise<Route>

// 获取路由标签
getRouteTags(): Promise<string[]>

// 获取用户收藏的路线
getUserFavoriteRoutes(userId: string): Promise<Route[]>

// 收藏路线
favorite(routeId: string): Promise<void>

// 取消收藏
unfavorite(routeId: string): Promise<void>

// 附近路线搜索
searchNearby(lat: number, lng: number, radius?: number): Promise<Route[]>
```

### 2. trackApi

**位置**: `frontend/src/api/modules/track.ts`

```typescript
// 创建新的轨迹记录
createTrack(data: CreateTrackDTO): Promise<Track>

// 上传轨迹点
uploadTrackPoints(trackId: string, points: TrackPoint[]): Promise<void>

// 完成轨迹记录
completeTrack(trackId: string): Promise<Track>

// 获取用户的轨迹记录
getUserTracks(userId: string): Promise<Track[]>

// 获取单个轨迹详情
getTrackDetail(trackId: string): Promise<Track>

// 删除轨迹
deleteTrack(trackId: string): Promise<void>
```

### 3. userApi

**位置**: `frontend/src/api/modules/user.ts`

```typescript
// 获取用户详情
getUserDetail(userId: string): Promise<User>

// 更新用户资料
updateProfile(data: UpdateProfileDTO): Promise<User>

// 关注用户
followUser(userId: string): Promise<void>

// 取消关注
unfollowUser(userId: string): Promise<void>

// 获取用户粉丝列表
getFollowers(userId: string): Promise<User[]>

// 获取用户关注列表
getFollowing(userId: string): Promise<User[]>
```

---

## 🎨 设计系统

### 颜色方案

- 主色: `#667eea` (紫蓝色)
- 辅助色: `#764ba2` (深紫色)
- 成功色: `#4CAF50` (绿色)
- 警告色: `#FF9800` (橙色)
- 危险色: `#F44336` (红色)
- 背景色: `#f5f5f5` (浅灰色)
- 文字色: `#333` (深灰色)

### 响应式断点

- 桌面: `> 768px` - 完整布局
- 平板/手机: `< 768px` - 单列/两列布局

### 组件尺寸

- 网格卡片最小宽: 250px - 300px
- 间距: 15px - 20px
- 圆角: 4px - 8px
- 卡片阴影: `0 2px 4px rgba(0,0,0,0.1)`

---

## ✅ 功能测试清单

### RouteList 页面

- [ ] 页面正确加载并显示路由列表
- [ ] 搜索框可输入并过滤结果
- [ ] 难度过滤下拉框工作正常
- [ ] 点击卡片导航到 RouteDetail
- [ ] 响应式设计在不同屏幕尺寸下正常

### TrackRecorder 页面

- [ ] 点击"开始记录"触发 GPS 权限
- [ ] 实时数据面板正确显示
- [ ] 暂停/继续功能可用
- [ ] 停止后可编辑徒步信息
- [ ] 完成后创建新轨迹并上传点
- [ ] 导航到 TrackDetail 展示保存结果

### RouteDetail 页面

- [ ] 路线信息正确加载和显示
- [ ] "开始徒步"按钮导航到 TrackRecorder
- [ ] "查看地图"模态框打开地图
- [ ] 返回按钮工作正常

### UserProfile 页面

- [ ] 加载当前用户信息
- [ ] 标签页切换功能正常
- [ ] 关注/取消关注功能
- [ ] 编辑资料对话框
- [ ] 登出功能

---

## 🚀 下一步开发计划

### 短期 (Sprint 2)

1. 补全 RouteDetail 详情页面（评价、照片、要点）
2. 创建 TrackDetail 页面（查看已完成的徒步）
3. 创建 HikingReport 页面（生成徒步报告）
4. 集成支付/订阅系统

### 中期 (Sprint 3-4)

1. 实现评论系统（路线、徒步、活动）
2. 添加文件上传（头像、照片）
3. 实现实时聊天功能
4. 团队/小组功能

### 长期 (Sprint 5+)

1. 离线地图支持
2. SOS 紧急求助
3. 社交分享功能
4. 数据分析和报表

---

## 📝 开发约定

### 命名规范

- 组件文件: PascalCase (e.g., `RouteList.vue`)
- 工具函数: camelCase (e.g., `createMap()`)
- 常量: UPPER_SNAKE_CASE
- API 方法: camelCase + 动词 (e.g., `getRoutes()`, `createTrack()`)

### 文件组织

```
frontend/src/
├── api/modules/          # API 模块
│   ├── user.ts
│   ├── track.ts
│   └── route.ts
├── components/
│   └── pages/            # 页面组件
│       ├── RouteList.vue
│       ├── RouteDetail.vue
│       ├── TrackRecorder.vue
│       └── ...
├── utils/                # 工具库
│   ├── auth.ts
│   ├── map.ts
│   └── trackRecorder.ts
├── stores/               # 状态管理 (Pinia)
└── router/               # 路由配置
```

### 异步处理

- 所有 API 调用使用 `async/await`
- 使用 try/catch 处理错误
- 显示加载状态和错误消息

### TypeScript

- 为所有函数参数和返回值添加类型
- 使用 interface 定义数据结构
- 避免使用 `any` 类型

---

## 📞 技术支持

如有问题或需要修改，请参考：

1. API 文档: `backend/API_ROUTES.md`
2. 数据库架构: `migrations/*.sql`
3. 环境配置: `frontend/.env.example`

---

**更新时间**: 2024年1月
**前端框架**: Vue 3 + TypeScript + Vite
**UI 框架**: 纯 CSS/SCSS (自定义设计)
**地图库**: 高德地图 SDK
