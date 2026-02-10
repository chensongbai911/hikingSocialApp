# 测试数据生成脚本说明

## 文件位置

`d:\coze\scripts\seed_remote_test_data.sql`

## 数据概览

### 用户数据

- **6个测试用户** (user-003 ~ user-008)
- 完整的个人资料:昵称、头像、性别、年龄、简介、地区、徒步等级
- 每用户 **3张照片** (user_photos)
- 每用户 **5个偏好设置** (user_preferences)
- **互相关注**: 所有用户互相关注 (30条follows + 30条followers + 15条friendships)

### 社交数据

- **15个会话** (conversations)
- **1695条聊天消息** (messages) - 每个会话约113条消息
- 消息内容包含用户昵称和测试场景

### 活动数据

- **86个活动** (activities)
- **62条报名** (applications)
- **160个徒步报告** (hiking_reports)
- **200条报告评论** (report_comments)

### 路线与轨迹

- **10条路线** (routes)
  - **30个路线标签** (route_tags)
  - **50个途径点** (route_waypoints)
  - **20个风险点** (route_risk_points)
  - **30个收藏** (route_favorites)
- **50条轨迹** (tracks)
  - **1250个轨迹点** (track_points) - 每条25个点
  - **100个点赞** (track_likes)

## 图片URL说明

所有图片URL已更新为可访问的稳定服务:

### 使用的图片服务

- **picsum.photos** - Lorem Picsum 提供稳定的占位图片服务
  - 用户头像: `https://picsum.photos/300/300?random={id}`
  - 用户照片: `https://picsum.photos/800/600?random={id}`
  - 活动封面: `https://picsum.photos/800/600?random=activity{seq}`
  - 路线封面: `https://picsum.photos/800/600?random=route{seq}`
  - 报告封面: `https://picsum.photos/800/600?random=report{seq}`

### 涉及的数据表字段

1. **users.avatar_url** - 用户头像
2. **user_photos.photo_url** - 用户相册照片
3. **activities.cover_image_url** - 活动封面
4. **hiking_reports.cover_image_url** - 徒步报告封面
5. **routes.cover_image** - 路线封面

## 推荐功能说明

### 推荐活动 (Discovery Activities)

- 接口: `GET /api/v1/discovery/activities`
- 实现方式: 基于算法动态查询
- 推荐逻辑:
  - 排除用户已创建的活动
  - 排除用户已加入的活动
  - 只显示待审批和已审批的活动
  - 按开始时间倒序
  - 可基于用户偏好进一步优化

### 推荐用户 (Discovery Users)

- 接口: `GET /api/v1/discovery/users`
- 实现方式: 基于算法动态查询
- 推荐逻辑:
  - 排除当前用户自己
  - 按共同偏好数量排序
  - 根据徒步等级匹配
  - 显示用户照片数量

**注意**: 推荐功能无需额外测试数据,基于现有的 `activities` 和 `users` 表动态生成。

## 执行方法

### 方法1: MySQL命令行

```bash
mysql -h 115.190.252.62 -P 3306 -u hiking_user -psenbochen -D hiking_app --default-character-set=utf8mb4 < d:\coze\scripts\seed_remote_test_data.sql
```

### 方法2: PowerShell

```powershell
cd d:\coze\scripts
Get-Content seed_remote_test_data.sql | mysql -h 115.190.252.62 -P 3306 -u hiking_user -psenbochen -D hiking_app --default-character-set=utf8mb4
```

### 方法3: 数据库客户端

1. 连接到数据库: 115.190.252.62:3306
2. 选择数据库: hiking_app
3. 打开 `seed_remote_test_data.sql` 文件
4. 执行完整脚本

## 重要提示

### ⚠️ 数据重复警告

此脚本**不是幂等的**,多次执行会累积数据:

- 活动/报告/路线/轨迹会重复插入
- 消息会大量增加
- 建议执行前清空相关表或使用新数据库

### 🔧 清空数据方法

如需重新生成干净的测试数据:

```sql
-- 清空社交数据
DELETE FROM messages;
DELETE FROM conversations;
DELETE FROM friendships;
DELETE FROM user_follows;
DELETE FROM user_followers;

-- 清空活动数据
DELETE FROM report_comments;
DELETE FROM hiking_reports;
DELETE FROM applications;
DELETE FROM activities;

-- 清空路线轨迹
DELETE FROM track_likes;
DELETE FROM track_points;
DELETE FROM tracks;
DELETE FROM route_favorites;
DELETE FROM route_risk_points;
DELETE FROM route_waypoints;
DELETE FROM route_tags;
DELETE FROM routes;

-- 清空用户扩展数据
DELETE FROM user_preferences;
DELETE FROM user_photos;

-- 重置用户基础信息
UPDATE users SET
  avatar_url = NULL,
  gender = NULL,
  age = NULL,
  bio = NULL,
  province = NULL,
  city = NULL,
  region = NULL,
  hiking_level = NULL
WHERE id IN ('user-003', 'user-004', 'user-005', 'user-006', 'user-007', 'user-008');
```

### ✅ 数据验证查询

执行后验证数据:

```sql
-- 统计各表数据量
SELECT 'users' AS table_name, COUNT(*) AS count FROM users WHERE deleted_at IS NULL
UNION ALL
SELECT 'user_photos', COUNT(*) FROM user_photos
UNION ALL
SELECT 'conversations', COUNT(*) FROM conversations
UNION ALL
SELECT 'messages', COUNT(*) FROM messages
UNION ALL
SELECT 'activities', COUNT(*) FROM activities
UNION ALL
SELECT 'routes', COUNT(*) FROM routes
UNION ALL
SELECT 'tracks', COUNT(*) FROM tracks
UNION ALL
SELECT 'hiking_reports', COUNT(*) FROM hiking_reports;
```

## 技术细节

### 事务管理

- 使用 `START TRANSACTION` 和 `COMMIT` 确保原子性
- 如执行失败,数据会自动回滚

### 临时表

脚本使用多个临时表优化性能:

- `tmp_users` - 用户列表
- `tmp_users2` - 用户列表副本(避免MySQL临时表重复引用限制)
- `tmp_nums` - 数字序列(1-100)
- `tmp_new_activities` - 新活动临时数据
- `tmp_new_routes` - 新路线临时数据
- `tmp_recent_tracks` - 最近轨迹

### 字符集

- 脚本开头设置 `SET NAMES utf8mb4`
- 执行命令需加 `--default-character-set=utf8mb4`
- 确保中文内容正确存储

## 测试账号

| 用户ID   | 昵称  | 密码 | 徒步等级     | 城市 |
| -------- | ----- | ---- | ------------ | ---- |
| user-003 | 用户3 | -    | beginner     | 北京 |
| user-004 | 用户4 | -    | intermediate | 上海 |
| user-005 | 用户5 | -    | advanced     | 广州 |
| user-006 | 用户6 | -    | beginner     | 北京 |
| user-007 | 用户7 | -    | intermediate | 上海 |
| user-008 | 用户8 | -    | advanced     | 广州 |

## 相关文档

- 前端运行: 参考 `APP_RUNNING_SUCCESSFULLY.md`
- API文档: 参考 `API_FIX_SUMMARY_2026_01_17.md`
- 部署指南: 参考 `DEPLOYMENT_GUIDE.md`
