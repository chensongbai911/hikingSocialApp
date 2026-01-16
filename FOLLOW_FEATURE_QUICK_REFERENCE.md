# ⚡ 关注功能快速参考指南

## 🎯 功能概述

**关注系统** 允许用户关注其他用户，查看关注者数，并在发现页面快速关注。

---

## 🚀 快速开始

### 启动应用

```bash
# 启动后端
cd backend
npm run dev

# 启动前端（新终端）
cd frontend
npm run dev
```

### 测试关注功能

```bash
# 运行完整测试
cd d:\coze
node test-follow-feature.js

# 预期输出: 🎉 所有测试通过！
```

---

## 📱 使用流程

### 方式 1: 个人主页关注

```
1. 点击"发现"页面任意用户卡片
   ↓
2. 进入 UserProfile 个人主页
   ↓
3. 点击底部"+ 关注"按钮
   ↓
4. 按钮变为"已关注"，关注者数 +1
   ↓
5. 点击"已关注"可取消关注
```

### 方式 2: 快速关注（Discover）

```
1. 在"发现"页面查看用户卡片
   ↓
2. 点击卡片顶部的"关注"按钮
   ↓
3. 无需进入详情页，直接关注/取消
   ↓
4. 按钮实时显示关注状态
```

---

## 🔧 API 端点

### 获取用户详情

```typescript
GET /api/v1/users/:userId/detail
Headers: { Authorization: `Bearer ${token}` }

Response: {
  code: 200,
  data: {
    id: "user-007",
    nickname: "用户名",
    followers_count: 10,
    activities_count: 5,
    ...
  }
}
```

### 获取关注状态

```typescript
GET /api/v1/users/:userId/follow-status
Headers: { Authorization: `Bearer ${token}` }

Response: {
  code: 200,
  data: {
    is_following: true  // 或 false
  }
}
```

### 关注用户

```typescript
POST /api/v1/users/:userId/follow
Headers: {
  Authorization: `Bearer ${token}`,
  Content-Type: "application/json"
}

Response: {
  code: 200,
  message: "关注成功"
}
```

### 取消关注

```typescript
DELETE /api/v1/users/:userId/follow
Headers: { Authorization: `Bearer ${token}` }

Response: {
  code: 200,
  message: "取消关注成功"
}
```

---

## 💻 代码示例

### 在组件中使用

```typescript
import { userApi } from '@/api'
import toast from '@/utils/toast'

// 关注用户
async function followUser(userId: string) {
  try {
    const res = await userApi.followUser(userId)
    if (res.code === 200) {
      toast.success('关注成功')
      // 更新 UI
      isFollowing.value = true
    }
  } catch (error) {
    toast.error('关注失败')
  }
}

// 取消关注
async function unfollowUser(userId: string) {
  try {
    const res = await userApi.unfollowUser(userId)
    if (res.code === 200) {
      toast.success('已取消关注')
      isFollowing.value = false
    }
  } catch (error) {
    toast.error('取消关注失败')
  }
}

// 获取关注状态
async function checkFollowStatus(userId: string) {
  try {
    const res = await userApi.getFollowStatus(userId)
    if (res.code === 200) {
      isFollowing.value = res.data.is_following
    }
  } catch (error) {
    console.error('获取关注状态失败:', error)
  }
}
```

---

## 🗂️ 文件结构

### 后端

```
backend/
├── src/
│   ├── controllers/
│   │   └── UserDetailController.ts        ← 关注相关端点
│   ├── services/
│   │   └── UserDetailService.ts           ← 关注业务逻辑
│   ├── routes/
│   │   └── userRoutes.ts                  ← 路由配置
│   └── database/
│       └── migrations/
│           └── create_user_followers.ts   ← 数据库表
```

### 前端

```
frontend/
├── src/
│   ├── api/
│   │   └── user.ts                        ← API 方法
│   ├── components/
│   │   └── pages/
│   │       ├── UserProfile.vue            ← 个人主页
│   │       └── Discover.vue               ← 发现页面
│   └── types/
│       └── index.ts                       ← 类型定义
```

---

## 📊 数据库结构

### user_followers 表

```sql
CREATE TABLE user_followers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  follower_id VARCHAR(50) NOT NULL,      -- 关注者ID
  following_id VARCHAR(50) NOT NULL,     -- 被关注者ID
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE KEY (follower_id, following_id),
  FOREIGN KEY (follower_id) REFERENCES users(id),
  FOREIGN KEY (following_id) REFERENCES users(id)
);
```

### 查询示例

```sql
-- 查询用户的关注者数
SELECT COUNT(*) as followers_count
FROM user_followers
WHERE following_id = ?;

-- 查询是否已关注
SELECT EXISTS(
  SELECT 1 FROM user_followers
  WHERE follower_id = ? AND following_id = ?
) as is_following;

-- 查询用户关注的所有人
SELECT uf.following_id, u.nickname, u.avatar_url
FROM user_followers uf
JOIN users u ON uf.following_id = u.id
WHERE uf.follower_id = ?
ORDER BY uf.created_at DESC;
```

---

## 🐛 常见问题解决

### Q1: 关注按钮不显示

**原因**: API 未加载用户关注状态

**解决**:

```typescript
// 确保在 onMounted 中加载状态
onMounted(async () => {
  for (const user of users.value) {
    await loadFollowStatus(user.id)
  }
})
```

### Q2: 关注后页面不刷新

**原因**: 未更新本地状态

**解决**:

```typescript
// 更新关注状态和关注者数
isFollowing.value = !isFollowing.value
followers_count.value += isFollowing.value ? 1 : -1
```

### Q3: "处理中..."一直显示

**原因**: 未正确设置加载状态

**解决**:

```typescript
try {
  followLoading.value = true
  // 执行操作
} finally {
  followLoading.value = false // 必须设置
}
```

### Q4: 快速点击导致多次请求

**原因**: 未防止重复操作

**解决**:

```typescript
// 使用 disabled 属性
:disabled="followLoading"

// 在方法开头检查
if (followLoading.value) return
```

---

## 🧪 测试命令

```bash
# 完整测试
node test-follow-feature.js

# 单个 API 测试
node -e "
fetch('http://localhost:3000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: '123456'
  })
}).then(r => r.json()).then(console.log)
"
```

---

## 📈 性能优化建议

### 1. 批量加载关注状态

```typescript
// 不好: 逐个加载
for (const user of users.value) {
  await loadFollowStatus(user.id)
}

// 更好: 批量 API
const followStatuses = await userApi.getFollowStatusBatch(userIds)
```

### 2. 缓存关注状态

```typescript
// 缓存 30 分钟
const cache = new Map()
const TTL = 30 * 60 * 1000

async function loadFollowStatus(userId) {
  const cached = cache.get(userId)
  if (cached && Date.now() - cached.time < TTL) {
    return cached.value
  }

  const result = await userApi.getFollowStatus(userId)
  cache.set(userId, { value: result, time: Date.now() })
  return result
}
```

### 3. 防止重复请求

```typescript
// 记录正在进行的请求
const pendingRequests = new Set()

async function followUser(userId) {
  if (pendingRequests.has(userId)) return
  pendingRequests.add(userId)

  try {
    await userApi.followUser(userId)
  } finally {
    pendingRequests.delete(userId)
  }
}
```

---

## 🔒 安全最佳实践

### 1. 验证权限

```typescript
// 后端检查
if (currentUserId === targetUserId) {
  return error('不能关注自己')
}
```

### 2. 速率限制

```typescript
// 前端防护
const lastFollowTime = ref(0)
const FOLLOW_COOLDOWN = 1000 // 1 秒

async function followUser(userId) {
  if (Date.now() - lastFollowTime.value < FOLLOW_COOLDOWN) {
    toast.warning('操作过于频繁，请稍后再试')
    return
  }

  // 执行关注
  lastFollowTime.value = Date.now()
}
```

### 3. 错误处理

```typescript
async function followUser(userId) {
  try {
    const res = await userApi.followUser(userId)

    // 检查响应
    if (res.code !== 200) {
      // 不暴露敏感信息
      throw new Error(res.message || '操作失败')
    }
  } catch (error) {
    // 记录日志但不暴露给用户
    console.error('Follow error:', error)
    toast.error('操作失败，请重试')
  }
}
```

---

## 📚 参考资源

### 主要文档

- `FOLLOW_FEATURE_COMPLETION_REPORT.md` - 功能完成报告
- `FOLLOW_FEATURE_TEST_REPORT.md` - 测试报告
- `FOLLOW_FEATURE_FINAL_REPORT.md` - 最终总结
- `TASK_COMPLETION_SUMMARY.md` - 任务完成总结

### 测试脚本

- `test-follow-feature.js` - 完整功能测试
- `test-comprehensive-api.js` - 综合 API 测试

### 代码参考

- `backend/src/controllers/UserDetailController.ts`
- `frontend/src/components/pages/UserProfile.vue`
- `frontend/src/components/pages/Discover.vue`
- `frontend/src/api/user.ts`

---

## 🎯 下一步建议

### 立即可做 (P0)

- [ ] 实现"我的粉丝"列表页面
- [ ] 实现"我关注的人"列表页面
- [ ] 粉丝通知功能

### 本周计划 (P1)

- [ ] 关注推荐算法
- [ ] 相互关注检测（显示 "相互关注" 标签）
- [ ] 关注列表搜索功能

### 本月计划 (P2)

- [ ] VIP 用户认证标签
- [ ] 关注分组管理
- [ ] 关注统计图表

---

## 💬 联系方式

如有问题或建议：

1. 查看本文档的常见问题部分
2. 参考相关的功能报告
3. 查看测试脚本了解 API 用法
4. 检查代码注释获取更详细的实现细节

---

**最后更新**: 2025-01-16
**版本**: v1.2.0
**作者**: AI Assistant
**状态**: ✅ 完成
