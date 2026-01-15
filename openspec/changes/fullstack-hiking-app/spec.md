# Requirements Specification: 徒步社交 App

## 业务需求规范

### 1. 认证与用户管理

#### Requirement: 用户注册

```
ID: AUTH-001
Title: 用户注册功能
Priority: HIGH
Status: NEW
```

**Description:**
用户可以通过邮箱和密码进行注册，成为应用的新用户。

**Acceptance Criteria:**

- [ ] 用户输入邮箱、密码、确认密码、昵称进行注册
- [ ] 邮箱格式验证
- [ ] 密码长度 ≥ 8 字符，包含大小写字母和数字
- [ ] 邮箱不重复 (唯一性检查)
- [ ] 注册成功后自动登录
- [ ] 密码采用 Bcrypt 加密存储
- [ ] 返回 JWT Token

**Scenario 1: 成功注册**

```gherkin
Given 用户在注册页面
When 输入有效的邮箱和密码并提交
Then 注册成功，自动登录，跳转到首页
And Token 存储到本地存储
```

**Scenario 2: 邮箱已存在**

```gherkin
Given 邮箱已在系统中注册
When 用户尝试使用该邮箱注册
Then 显示错误信息："邮箱已被注册"
```

**Scenario 3: 密码不符合要求**

```gherkin
Given 用户输入的密码长度 < 8 字符
When 提交注册表单
Then 显示错误信息："密码长度至少8字符，需包含大小写字母和数字"
```

---

#### Requirement: 用户登录

```
ID: AUTH-002
Title: 用户登录功能
Priority: HIGH
Status: NEW
```

**Description:**
用户使用邮箱和密码登录应用。

**Acceptance Criteria:**

- [ ] 用户输入邮箱和密码
- [ ] 密码验证 (与数据库存储的 hash 比对)
- [ ] 登录成功生成 JWT Token (过期时间: 24 小时)
- [ ] Token 存储到本地存储
- [ ] 登录失败显示错误提示
- [ ] 跳转到首页

**Scenario 1: 成功登录**

```gherkin
Given 用户已注册
When 输入正确的邮箱和密码
Then 登录成功，获得 Token，跳转到首页
```

**Scenario 2: 密码错误**

```gherkin
When 用户输入错误的密码
Then 显示错误信息："邮箱或密码错误"
```

---

#### Requirement: 令牌管理

```
ID: AUTH-003
Title: JWT Token 管理
Priority: HIGH
Status: NEW
```

**Description:**
后端管理 JWT Token 的生成、验证和刷新。

**Acceptance Criteria:**

- [ ] Token 包含 user_id、email 等基本信息
- [ ] Token 过期时间: 24 小时
- [ ] 提供 refresh-token 接口刷新 Token (过期前刷新)
- [ ] 所有需要认证的 API 验证 Token 有效性
- [ ] Token 过期返回 401 Unauthorized
- [ ] 支持 Token 从 Authorization header 读取 (Bearer scheme)

---

### 2. 用户资料管理

#### Requirement: 查看和编辑个人资料

```
ID: USER-001
Title: 个人资料管理
Priority: HIGH
Status: NEW
```

**Description:**
用户可以查看和编辑自己的个人资料。

**Acceptance Criteria:**

- [ ] 显示用户头像、昵称、性别、年龄
- [ ] 显示"关于我"文本 (最多 200 字)
- [ ] 编辑时验证字数限制
- [ ] 保存更改后更新 UI

**Scenario: 编辑个人资料**

```gherkin
Given 用户在个人资料页面
When 点击编辑按钮
Then 显示编辑表单，用户可修改信息
When 点击保存
Then 信息同步到后端，UI更新
```

---

#### Requirement: 头像管理

```
ID: USER-002
Title: 用户头像上传和编辑
Priority: MEDIUM
Status: NEW
```

**Description:**
用户可以上传和编辑自己的头像。

**Acceptance Criteria:**

- [ ] 支持图片上传 (JPEG, PNG)
- [ ] 图片裁剪功能
- [ ] 图片压缩 (优化文件大小)
- [ ] 头像预览
- [ ] 保存后更新用户界面的头像显示

**Scenario: 上传头像**

```gherkin
Given 用户在头像编辑页面
When 选择本地图片
And 进行裁剪和调整
And 点击保存
Then 头像上传到服务器，本地UI更新
```

---

#### Requirement: 生活相册管理

```
ID: USER-003
Title: 生活相册管理
Priority: MEDIUM
Status: NEW
```

**Description:**
用户可以上传和管理生活相册照片，最多 9 张。

**Acceptance Criteria:**

- [ ] 九宫格显示照片
- [ ] 支持上传新照片
- [ ] 支持删除照片
- [ ] 最多 9 张限制
- [ ] 支持拖拽排序 (可选)

**Scenario: 上传相册照片**

```gherkin
Given 用户的相册中有5张照片
When 点击添加照片
And 选择新照片
Then 照片添加到相册，更新九宫格显示
And 相册总数变为6张
```

---

#### Requirement: 徒步偏好标签

```
ID: USER-004
Title: 用户徒步偏好设置
Priority: MEDIUM
Status: NEW
```

**Description:**
用户可以设置徒步偏好标签，用于个性化推荐。

**Acceptance Criteria:**

- [ ] 标签类型: 出行时间、徒步类型、特殊偏好、距离范围、兴趣点
- [ ] 支持多选
- [ ] 可编辑和删除标签
- [ ] 标签更新后保存到后端

**Scenario: 设置偏好标签**

```gherkin
Given 用户在编辑资料页面
When 选择"周末出发"、"休闲徒步"、"宠物友好"标签
And 点击保存
Then 偏好标签保存到后端，用于推荐和匹配
```

---

### 3. 活动管理

#### Requirement: 创建活动

```
ID: ACTIVITY-001
Title: 创建徒步活动
Priority: HIGH
Status: NEW
```

**Description:**
用户可以创建新的徒步活动。

**Acceptance Criteria:**

- [ ] 必填字段: 标题、时间、地点、封面图
- [ ] 可选字段: 描述、难度、最大参与人数、装备要求、路线描述
- [ ] 地点选择需关联地图选择 (经纬度)
- [ ] 创建后进入【待审核】状态
- [ ] 不可报名，仅创建者可编辑/取消
- [ ] 发布时生成唯一的 Activity ID

**Scenario: 创建活动**

```gherkin
Given 用户在创建活动页面
When 填写活动信息并上传封面图
And 选择地点
And 点击发布
Then 活动保存到数据库，状态为【待审核】
And 显示"活动已发布，等待审核"提示
```

**Scenario: 编辑待审核的活动**

```gherkin
Given 活动状态为【待审核】
When 点击编辑按钮
Then 显示活动编辑表单，用户可修改所有字段
When 点击保存
Then 活动信息更新，状态仍为【待审核】
```

---

#### Requirement: 活动列表查询

```
ID: ACTIVITY-002
Title: 获取活动列表
Priority: HIGH
Status: NEW
```

**Description:**
用户可以查看自己加入和发布的活动。

**Acceptance Criteria:**

- [ ] 我加入的: 显示用户报名参加的活动
- [ ] 我发布的: 显示用户创建发布的活动
- [ ] 每个标签页都支持分页
- [ ] 每页显示 10 条记录
- [ ] 支持下拉刷新和加载更多

**Scenario: 查看我加入的活动**

```gherkin
Given 用户在"我的徒步"页面
When 点击"我加入的" Tab
Then 显示用户已报名的活动列表
And 显示活动状态标签（即将开始、已完成）
```

---

#### Requirement: 活动详情展示

```
ID: ACTIVITY-003
Title: 活动详情页
Priority: HIGH
Status: NEW
```

**Description:**
用户可以查看活动的完整信息。

**Acceptance Criteria:**

- [ ] 显示活动封面、标题、时间、地点、难度
- [ ] 显示活动描述、路线、装备要求
- [ ] 显示参与人数和人员列表 (部分)
- [ ] 显示活动状态（待审核、进行中、已完成）
- [ ] 根据用户身份显示不同的操作按钮 (参加、取消、编辑、删除)

---

#### Requirement: 参加和退出活动

```
ID: ACTIVITY-004
Title: 参与活动
Priority: HIGH
Status: NEW
```

**Description:**
用户可以报名参加活动或退出活动。

**Acceptance Criteria:**

- [ ] 点击"参加"按钮报名活动
- [ ] 参加前验证活动是否未满员
- [ ] 参加后记录参与关系
- [ ] 用户只能参加一次同一活动
- [ ] 支持取消参加 (在活动开始前)
- [ ] 取消后删除参与关系

**Scenario: 参加活动**

```gherkin
Given 用户查看活动详情
When 点击"参加"按钮
Then 验证活动未满员
And 创建参与记录
And 按钮变为"已参加"或"取消参加"
```

---

#### Requirement: 活动状态管理

```
ID: ACTIVITY-005
Title: 活动状态流转
Priority: HIGH
Status: NEW
```

**Description:**
活动在其生命周期中转换状态。

**Acceptance Criteria:**

- [ ] 新创建活动: 待审核
- [ ] 待审核 → 即将开始 (管理员审核通过后，或在设定时间自动转换)
- [ ] 即将开始 → 进行中 (活动开始时间到达)
- [ ] 进行中 → 已完成 (活动结束时间到达)
- [ ] 活动可被创建者取消 (在待审核和即将开始时)
- [ ] 取消后状态为【已取消】

**Status Enum:**

```
待审核 (pending)
即将开始 (approved)
进行中 (ongoing)
已完成 (completed)
已取消 (cancelled)
```

---

### 4. 发现与社交功能

#### Requirement: 用户搜索

```
ID: DISCOVERY-001
Title: 用户搜索功能
Priority: MEDIUM
Status: NEW
```

**Description:**
用户可以搜索其他用户，发现潜在的徒步伙伴。

**Acceptance Criteria:**

- [ ] 支持按昵称搜索
- [ ] 支持按兴趣关键词搜索
- [ ] 搜索实时返回结果 (debounce 优化)
- [ ] 显示搜索用户卡片

**Scenario: 搜索用户**

```gherkin
Given 用户在发现页面
When 输入搜索关键词"张三"
Then 显示匹配的用户列表
And 显示用户头像、昵称、等级、活动摘要
```

---

#### Requirement: 用户筛选

```
ID: DISCOVERY-002
Title: 用户筛选功能
Priority: MEDIUM
Status: NEW
```

**Description:**
用户可以多维度筛选发现用户。

**Acceptance Criteria:**

- [ ] 性别筛选: 男、女、其他
- [ ] 年龄区间筛选: 可设置最小和最大年龄
- [ ] 徒步等级筛选: 新手、中级、资深
- [ ] 活动偏好筛选: 多选 (周末出发、强度等)
- [ ] 支持重置和应用筛选条件
- [ ] 筛选结果实时更新

**Scenario: 使用多条件筛选**

```gherkin
Given 用户在筛选页面
When 选择"女性"、"25-35岁"、"中级"、"周末出发"
And 点击应用
Then 返回符合所有条件的用户列表
```

---

#### Requirement: 用户推荐

```
ID: DISCOVERY-003
Title: 用户推荐
Priority: LOW
Status: NEW
```

**Description:**
系统基于用户偏好推荐合适的徒步伙伴。

**Acceptance Criteria:**

- [ ] 推荐算法考虑用户的徒步偏好标签
- [ ] 推荐算法考虑年龄和性别匹配度
- [ ] 推荐算法考虑共同参加的活动
- [ ] 每次加载发现页面更新推荐列表

---

### 5. 非功能性需求

#### Requirement: 性能要求

```
ID: NFR-001
Title: 性能指标
Priority: HIGH
Status: NEW
```

**Acceptance Criteria:**

- [ ] 页面加载时间 < 3 秒
- [ ] API 响应时间 < 500ms
- [ ] 图片懒加载，优化首屏体验
- [ ] 页面滚动帧率 ≥ 60fps
- [ ] 支持离线浏览 (缓存)

---

#### Requirement: 安全性要求

```
ID: NFR-002
Title: 安全性保障
Priority: HIGH
Status: NEW
```

**Acceptance Criteria:**

- [ ] 所有敏感 API 使用 HTTPS
- [ ] 密码采用 Bcrypt 加密，强度 ≥ 10
- [ ] 用户数据严格隔离
- [ ] 实现 CSRF 防护
- [ ] 实现 XSS 防护
- [ ] 实现 SQL 注入防护
- [ ] API 速率限制 (每分钟最多 100 请求)

---

#### Requirement: 兼容性要求

```
ID: NFR-003
Title: 跨端兼容性
Priority: MEDIUM
Status: NEW
```

**Acceptance Criteria:**

- [ ] Vue 3 + Lynx 支持 iOS 13+
- [ ] Vue 3 + Lynx 支持 Android 8+
- [ ] Web 浏览器兼容性: Chrome 90+, Safari 14+, Firefox 88+

---

#### Requirement: 可用性要求

```
ID: NFR-004
Title: 用户体验
Priority: MEDIUM
Status: NEW
```

**Acceptance Criteria:**

- [ ] 清晰的错误提示信息
- [ ] 支持多语言 (中文为主)
- [ ] 无障碍设计 (WCAG AA 标准)
- [ ] 响应式布局 (手机、平板、桌面)

---

## 数据实体定义

### User 用户实体

```typescript
interface User {
  id: string; // UUID
  email: string; // 邮箱，唯一
  password_hash: string; // 密码哈希
  nickname: string; // 昵称
  avatar_url: string; // 头像URL
  gender: "male" | "female" | "other"; // 性别
  age: number; // 年龄
  bio: string; // 关于我
  hiking_level: "beginner" | "intermediate" | "advanced"; // 徒步等级
  preferences: UserPreference[]; // 偏好标签
  photos: UserPhoto[]; // 生活相册
  is_active: boolean; // 是否活跃
  is_verified: boolean; // 是否验证
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}
```

### Activity 活动实体

```typescript
interface Activity {
  id: string; // UUID
  creator_id: string; // 创建者ID
  title: string; // 标题
  description: string; // 描述
  cover_image_url: string; // 封面图URL
  location: string; // 地点名称
  latitude: number; // 纬度
  longitude: number; // 经度
  start_time: Date; // 开始时间
  end_time: Date; // 结束时间
  difficulty: "easy" | "moderate" | "hard"; // 难度
  max_participants: number; // 最大参与人数
  route_description: string; // 路线描述
  equipment_required: string; // 装备要求
  status: "pending" | "approved" | "ongoing" | "completed" | "cancelled";
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}
```

### Participation 参与关系实体

```typescript
interface Participation {
  id: string;
  user_id: string;
  activity_id: string;
  status: "joined" | "completed" | "cancelled";
  joined_at: Date;
  completed_at?: Date;
  cancelled_at?: Date;
  feedback?: string; // 活动反馈
  rating?: number; // 活动评分 (1-5)
}
```

---

## API 响应格式

### 成功响应

```json
{
  "code": 0,
  "message": "success",
  "data": {
    // 具体数据
  }
}
```

### 错误响应

```json
{
  "code": 400,
  "message": "用户邮箱已存在",
  "errors": [
    {
      "field": "email",
      "message": "邮箱已被注册"
    }
  ]
}
```

### 分页响应

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [],
    "total": 100,
    "page": 1,
    "pageSize": 10,
    "hasMore": true
  }
}
```

---

## 业务流程

### 活动参与流程

```
用户浏览发现页
    ↓
搜索/筛选用户
    ↓
查看用户详情
    ↓
浏览用户参加的活动
    ↓
点击活动卡片
    ↓
查看活动详情
    ↓
点击"参加"
    ↓
报名成功，加入参与者列表
    ↓
活动开始时自动转为"进行中"
    ↓
活动结束后自动转为"已完成"
    ↓
用户可在"我的徒步"→"我加入的"中查看
```

### 活动发布流程

```
用户在"我的徒步"点击发布活动
    ↓
填写活动信息（标题、时间、地点等）
    ↓
上传封面图
    ↓
点击发布
    ↓
活动保存到数据库，状态为【待审核】
    ↓
显示"等待审核"标签
    ↓
管理员审核通过后→【即将开始】
    ↓
用户可在"我的徒步"→"我发布的"中查看
    ↓
活动开始时→【进行中】
    ↓
活动结束时→【已完成】
```
