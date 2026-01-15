# 数据库字段命名规范文档

**版本**: v1.0
**更新时间**: 2026-01-14
**状态**: 已确认

---

## 🎯 命名规范原则

### 1. 基础规则

- **命名风格**: snake_case（下划线分隔）
- **语言**: 英文
- **大小写**: 全小写
- **可读性**: 名称应清晰表达字段含义

### 2. 禁止事项

- ❌ 不使用缩写（除非是通用缩写如URL、ID）
- ❌ 不使用数字开头
- ❌ 不使用MySQL保留字
- ❌ 不使用特殊字符（除下划线）

---

## 📋 标准字段命名

### 主键与外键

```sql
-- 主键统一使用 id
id VARCHAR(36) PRIMARY KEY

-- 外键使用 {表名}_id 格式
user_id VARCHAR(36)        -- 用户ID
activity_id VARCHAR(36)    -- 活动ID
creator_id VARCHAR(36)     -- 创建者ID
conversation_id INT        -- 对话ID
```

### 时间字段

```sql
-- 标准时间戳字段（所有表必备）
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP           -- 创建时间
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP  -- 更新时间
deleted_at TIMESTAMP NULL                                -- 删除时间（软删除）

-- 业务时间字段
start_time DATETIME        -- 开始时间
end_time DATETIME          -- 结束时间
joined_at TIMESTAMP        -- 加入时间
completed_at TIMESTAMP     -- 完成时间
cancelled_at TIMESTAMP     -- 取消时间
read_at TIMESTAMP          -- 阅读时间
last_message_at TIMESTAMP  -- 最后消息时间
```

### URL字段

```sql
-- 所有URL字段统一使用 {对象}_url 格式
avatar_url VARCHAR(500)         -- 头像URL
photo_url VARCHAR(500)          -- 照片URL
cover_image_url VARCHAR(500)    -- 封面图URL
image_url VARCHAR(500)          -- 图片URL
file_url VARCHAR(500)           -- 文件URL
```

### 布尔字段

```sql
-- 布尔字段统一使用 is_{状态} 格式
is_active BOOLEAN DEFAULT TRUE     -- 是否活跃
is_verified BOOLEAN DEFAULT FALSE  -- 是否验证
is_read BOOLEAN DEFAULT FALSE      -- 是否已读
```

### 计数字段

```sql
-- 计数字段统一使用 {对象}_count 格式
user1_unread_count INT DEFAULT 0   -- 用户1未读消息数
user2_unread_count INT DEFAULT 0   -- 用户2未读消息数
sort_order INT DEFAULT 0           -- 排序序号
```

### 枚举字段

```sql
-- 枚举字段使用有意义的单词
gender ENUM('male', 'female', 'other')
hiking_level ENUM('beginner', 'intermediate', 'advanced')
difficulty ENUM('easy', 'moderate', 'hard')
status ENUM('pending', 'approved', 'ongoing', 'completed', 'cancelled')
content_type ENUM('text', 'image', 'file')
```

---

## 📊 完整字段清单

### users 表

| 字段名        | 类型         | 说明     | 规范          |
| ------------- | ------------ | -------- | ------------- |
| id            | VARCHAR(36)  | 用户UUID | ✅ 主键统一   |
| email         | VARCHAR(255) | 邮箱     | ✅ 业务字段   |
| password_hash | VARCHAR(255) | 密码哈希 | ✅ 带后缀说明 |
| nickname      | VARCHAR(100) | 昵称     | ✅ 业务字段   |
| avatar_url    | VARCHAR(500) | 头像URL  | ✅ URL后缀    |
| gender        | ENUM         | 性别     | ✅ 枚举规范   |
| age           | INT          | 年龄     | ✅ 业务字段   |
| bio           | TEXT         | 关于我   | ✅ 简洁命名   |
| hiking_level  | ENUM         | 徒步等级 | ✅ 下划线分隔 |
| is_active     | BOOLEAN      | 是否活跃 | ✅ is\_前缀   |
| is_verified   | BOOLEAN      | 是否验证 | ✅ is\_前缀   |
| created_at    | TIMESTAMP    | 创建时间 | ✅ 时间戳规范 |
| updated_at    | TIMESTAMP    | 更新时间 | ✅ 时间戳规范 |
| deleted_at    | TIMESTAMP    | 删除时间 | ✅ 软删除规范 |

### user_preferences 表

| 字段名           | 类型         | 说明     | 规范          |
| ---------------- | ------------ | -------- | ------------- |
| id               | VARCHAR(36)  | 记录ID   | ✅ 主键统一   |
| user_id          | VARCHAR(36)  | 用户ID   | ✅ 外键规范   |
| preference_type  | ENUM         | 偏好类型 | ✅ 下划线分隔 |
| preference_value | VARCHAR(100) | 偏好值   | ✅ 下划线分隔 |
| created_at       | TIMESTAMP    | 创建时间 | ✅ 时间戳规范 |

### user_photos 表

| 字段名     | 类型         | 说明     | 规范          |
| ---------- | ------------ | -------- | ------------- |
| id         | VARCHAR(36)  | 照片ID   | ✅ 主键统一   |
| user_id    | VARCHAR(36)  | 用户ID   | ✅ 外键规范   |
| photo_url  | VARCHAR(500) | 照片URL  | ✅ URL后缀    |
| sort_order | INT          | 排序     | ✅ 计数规范   |
| created_at | TIMESTAMP    | 创建时间 | ✅ 时间戳规范 |

### activities 表

| 字段名             | 类型          | 说明         | 规范          |
| ------------------ | ------------- | ------------ | ------------- |
| id                 | VARCHAR(36)   | 活动ID       | ✅ 主键统一   |
| creator_id         | VARCHAR(36)   | 创建者ID     | ✅ 外键规范   |
| title              | VARCHAR(255)  | 活动标题     | ✅ 业务字段   |
| description        | TEXT          | 活动描述     | ✅ 业务字段   |
| cover_image_url    | VARCHAR(500)  | 封面图URL    | ✅ URL后缀    |
| location           | VARCHAR(255)  | 地点名称     | ✅ 业务字段   |
| latitude           | DECIMAL(10,8) | 纬度         | ✅ 业务字段   |
| longitude          | DECIMAL(11,8) | 经度         | ✅ 业务字段   |
| start_time         | DATETIME      | 开始时间     | ✅ 时间规范   |
| end_time           | DATETIME      | 结束时间     | ✅ 时间规范   |
| difficulty         | ENUM          | 难度         | ✅ 枚举规范   |
| max_participants   | INT           | 最大参与人数 | ✅ 下划线分隔 |
| status             | ENUM          | 活动状态     | ✅ 枚举规范   |
| route_description  | TEXT          | 路线描述     | ✅ 下划线分隔 |
| equipment_required | TEXT          | 装备要求     | ✅ 下划线分隔 |
| created_at         | TIMESTAMP     | 创建时间     | ✅ 时间戳规范 |
| updated_at         | TIMESTAMP     | 更新时间     | ✅ 时间戳规范 |
| deleted_at         | TIMESTAMP     | 删除时间     | ✅ 软删除规范 |

### participations 表

| 字段名       | 类型        | 说明       | 规范          |
| ------------ | ----------- | ---------- | ------------- |
| id           | VARCHAR(36) | 参与记录ID | ✅ 主键统一   |
| user_id      | VARCHAR(36) | 用户ID     | ✅ 外键规范   |
| activity_id  | VARCHAR(36) | 活动ID     | ✅ 外键规范   |
| status       | ENUM        | 参与状态   | ✅ 枚举规范   |
| joined_at    | TIMESTAMP   | 加入时间   | ✅ 时间规范   |
| completed_at | TIMESTAMP   | 完成时间   | ✅ 时间规范   |
| cancelled_at | TIMESTAMP   | 取消时间   | ✅ 时间规范   |
| feedback     | TEXT        | 活动反馈   | ✅ 业务字段   |
| rating       | INT         | 活动评分   | ✅ 业务字段   |
| created_at   | TIMESTAMP   | 创建时间   | ✅ 时间戳规范 |

### conversations 表

| 字段名               | 类型         | 说明            | 规范          |
| -------------------- | ------------ | --------------- | ------------- |
| id                   | INT          | 对话ID          | ✅ 主键统一   |
| user_id1             | VARCHAR(36)  | 参与者1ID       | ✅ 外键规范   |
| user_id2             | VARCHAR(36)  | 参与者2ID       | ✅ 外键规范   |
| last_message_id      | INT          | 最后一条消息ID  | ✅ 外键规范   |
| last_message_at      | TIMESTAMP    | 最后消息时间    | ✅ 时间规范   |
| last_message_content | VARCHAR(255) | 最后消息内容    | ✅ 下划线分隔 |
| user1_unread_count   | INT          | 用户1未读消息数 | ✅ 计数规范   |
| user2_unread_count   | INT          | 用户2未读消息数 | ✅ 计数规范   |
| created_at           | TIMESTAMP    | 创建时间        | ✅ 时间戳规范 |
| updated_at           | TIMESTAMP    | 更新时间        | ✅ 时间戳规范 |
| deleted_at           | TIMESTAMP    | 删除时间        | ✅ 软删除规范 |

### messages 表

| 字段名          | 类型         | 说明     | 规范          |
| --------------- | ------------ | -------- | ------------- |
| id              | INT          | 消息ID   | ✅ 主键统一   |
| conversation_id | INT          | 对话ID   | ✅ 外键规范   |
| sender_id       | VARCHAR(36)  | 发送者ID | ✅ 外键规范   |
| content         | TEXT         | 消息内容 | ✅ 业务字段   |
| content_type    | ENUM         | 消息类型 | ✅ 枚举规范   |
| image_url       | VARCHAR(500) | 图片URL  | ✅ URL后缀    |
| file_url        | VARCHAR(500) | 文件URL  | ✅ URL后缀    |
| is_read         | BOOLEAN      | 是否已读 | ✅ is\_前缀   |
| read_at         | TIMESTAMP    | 阅读时间 | ✅ 时间规范   |
| created_at      | TIMESTAMP    | 创建时间 | ✅ 时间戳规范 |
| updated_at      | TIMESTAMP    | 更新时间 | ✅ 时间戳规范 |
| deleted_at      | TIMESTAMP    | 删除时间 | ✅ 软删除规范 |

---

## 🔒 枚举值规范

### gender (性别)

- `male` - 男性
- `female` - 女性
- `other` - 其他

### hiking_level (徒步等级)

- `beginner` - 初级
- `intermediate` - 中级
- `advanced` - 高级

### difficulty (活动难度)

- `easy` - 简单
- `moderate` - 中等
- `hard` - 困难

### activity status (活动状态)

- `pending` - 待审核
- `approved` - 已批准
- `ongoing` - 进行中
- `completed` - 已完成
- `cancelled` - 已取消

### participation status (参与状态)

- `joined` - 已加入
- `completed` - 已完成
- `cancelled` - 已取消

### content_type (消息类型)

- `text` - 文本
- `image` - 图片
- `file` - 文件

### preference_type (偏好类型)

- `time` - 时间偏好（如"周末出发"）
- `type` - 类型偏好（如"休闲徒步"）
- `special` - 特殊偏好（如"宠物友好"）
- `distance` - 距离偏好（如"5-10km"）
- `interest` - 兴趣偏好（如"爱看风景"）

---

## 📐 数据类型规范

### 字符串类型

- **VARCHAR(36)**: UUID字符串
- **VARCHAR(100)**: 短文本（昵称等）
- **VARCHAR(255)**: 中等文本（标题、地址等）
- **VARCHAR(500)**: URL字段
- **TEXT**: 长文本（描述、反馈等）

### 数字类型

- **INT**: 整数（计数、年龄等）
- **DECIMAL(10,8)**: 纬度
- **DECIMAL(11,8)**: 经度

### 时间类型

- **TIMESTAMP**: 时间戳（created_at, updated_at等）
- **DATETIME**: 业务时间（start_time, end_time等）

### 布尔类型

- **BOOLEAN**: 是/否状态

---

## ✅ 验证检查清单

- [x] 所有表都有 id 主键
- [x] 所有表都有 created_at, updated_at, deleted_at
- [x] 所有外键字段使用 {表名}\_id 格式
- [x] 所有URL字段使用 {对象}\_url 格式
- [x] 所有布尔字段使用 is\_{状态} 格式
- [x] 所有时间字段使用 {动作}\_at 或 {动作}\_time 格式
- [x] 所有枚举字段使用小写英文单词
- [x] 所有计数字段使用 {对象}\_count 格式
- [x] 所有外键约束正确设置
- [x] 所有必要索引已创建

---

**状态**: ✅ 当前数据库结构完全符合规范
**下一步**: 创建测试数据SQL脚本
