# 🚀 用户详情 API - 快速参考指南

## 📋 5 分钟快速入门

### 1️⃣ 获取用户详情

```javascript
const response = await fetch('/api/v1/users/:userId/detail', {
  headers: { Authorization: 'Bearer ' + token },
})
const userData = await response.json()

// 使用数据
console.log(userData.data.followers_count) // 关注者数
console.log(userData.data.activities_count) // 徒步次数
```

### 2️⃣ 关注用户

```javascript
await fetch(`/api/v1/users/${userId}/follow`, {
  method: 'POST',
  headers: { Authorization: 'Bearer ' + token },
})
```

### 3️⃣ 取消关注

```javascript
await fetch(`/api/v1/users/${userId}/follow`, {
  method: 'DELETE',
  headers: { Authorization: 'Bearer ' + token },
})
```

### 4️⃣ 查询关注状态

```javascript
const { data } = await fetch(`/api/v1/users/${userId}/follow-status`, {
  headers: { Authorization: 'Bearer ' + token },
}).then((r) => r.json())

console.log(data.is_following) // true 或 false
```

---

## 🎯 前端集成示例

```vue
<template>
  <div class="user-profile">
    <!-- 用户统计 -->
    <div class="stats">
      <div>
        <strong>{{ user.activities_count }}</strong>
        <p>徒步次数</p>
      </div>
      <div>
        <strong>{{ user.followers_count }}</strong>
        <p>关注者</p>
      </div>
    </div>

    <!-- 关注按钮 -->
    <button v-if="!isFollowing" @click="follow">+ 关注</button>
    <button v-else @click="unfollow">已关注 ✓</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { userApi } from '@/api'
import { useRoute } from 'vue-router'

const route = useRoute()
const user = ref(null)
const isFollowing = ref(false)

onMounted(async () => {
  // 获取用户详情
  const res = await userApi.getUserDetail(route.params.userId)
  user.value = res.data

  // 获取关注状态
  const status = await userApi.getFollowStatus(route.params.userId)
  isFollowing.value = status.data.is_following
})

const follow = async () => {
  await userApi.followUser(route.params.userId)
  isFollowing.value = true
}

const unfollow = async () => {
  await userApi.unfollowUser(route.params.userId)
  isFollowing.value = false
}
</script>
```

---

## 🔧 API 端点速查

| 方法   | 端点                           | 功能         |
| ------ | ------------------------------ | ------------ |
| GET    | `/users/:userId/detail`        | 获取用户详情 |
| POST   | `/users/:userId/follow`        | 关注用户     |
| DELETE | `/users/:userId/follow`        | 取消关注     |
| GET    | `/users/:userId/follow-status` | 查询关注状态 |

---

## 📊 响应格式

### 成功响应 (200)

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    // 响应数据
  }
}
```

### 错误响应 (4xx/5xx)

```json
{
  "code": 400,
  "message": "错误信息"
}
```

---

## 🗄️ 数据库表

### user_followers

```sql
CREATE TABLE user_followers (
  id VARCHAR(36) PRIMARY KEY,
  follower_id VARCHAR(36),         -- 粉丝 ID
  following_id VARCHAR(36),        -- 被关注人 ID
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_follow (follower_id, following_id)
);
```

---

## 💾 数据库查询示例

### 获取用户的粉丝列表

```sql
SELECT u.* FROM users u
JOIN user_followers uf ON u.id = uf.follower_id
WHERE uf.following_id = 'USER_ID';
```

### 获取用户正在关注的人

```sql
SELECT u.* FROM users u
JOIN user_followers uf ON u.id = uf.following_id
WHERE uf.follower_id = 'USER_ID';
```

### 获取用户的关注者数

```sql
SELECT COUNT(*) as followers_count
FROM user_followers
WHERE following_id = 'USER_ID';
```

### 获取用户的徒步次数

```sql
SELECT COUNT(*) as activities_count
FROM activities
WHERE creator_id = 'USER_ID';
```

---

## ⚙️ 环境配置

```env
# .env (后端)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=hiking_app
PORT=3000
JWT_SECRET=your-secret

# .env (前端)
VITE_API_URL=http://localhost:3000/api/v1
```

---

## 🧪 测试命令

```bash
# 路由测试（验证所有端点已加载）
node test-routes.js

# API 功能测试
node test-user-detail-api.js

# 完整流程测试
node test-user-detail-full.js
```

---

## 🚨 常见错误

| 错误             | 原因           | 解决方案                              |
| ---------------- | -------------- | ------------------------------------- |
| 401 缺少认证令牌 | 没有传入 token | 确保已登录，header 中有 Authorization |
| 不能关注自己     | 尝试关注自己   | 选择其他用户关注                      |
| 用户不存在       | userId 无效    | 检查 userId 是否正确                  |
| 500 服务器错误   | 服务器异常     | 查看后端日志                          |

---

## 📚 相关文件

- 📄 `USER_DETAIL_API_FINAL_REPORT.md` - 完整项目报告
- 📄 `USER_DETAIL_API_COMPLETION_REPORT.md` - 实现细节
- 📄 `USER_DETAIL_API_CHECKLIST.md` - 完成清单
- 🔧 `backend/src/services/UserDetailService.ts` - 服务实现
- 🔧 `backend/src/controllers/UserDetailController.ts` - 控制器实现
- 🔧 `frontend/src/api/user.ts` - 前端 API 客户端

---

## 🎓 架构设计图

```
┌──────────────────────────────────┐
│      Vue 3 Component             │
│    (UserProfile.vue)             │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│    API Client (user.ts)          │
│  getUserDetail()                 │
│  followUser()                    │
│  unfollowUser()                  │
│  getFollowStatus()               │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│   HTTP Request (Express)         │
│  GET/POST/DELETE /users/...      │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│   Controller (Request Handler)   │
│  UserDetailController            │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│   Service (Business Logic)       │
│  UserDetailService               │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│   Database (MySQL)               │
│  users | user_followers |        │
│  activities | preferences        │
└──────────────────────────────────┘
```

---

## 🔑 关键文件速查

### 后端路由

**文件**: `backend/src/routes/userRoutes.ts`

```typescript
// 获取用户详情
router.get('/:userId/detail', authMiddleware, UserDetailController.getUserDetail)

// 关注用户
router.post('/:userId/follow', authMiddleware, UserDetailController.followUser)

// 取消关注
router.delete('/:userId/follow', authMiddleware, UserDetailController.unfollowUser)

// 关注状态
router.get('/:userId/follow-status', authMiddleware, UserDetailController.getFollowStatus)
```

### 前端 API 调用

**文件**: `frontend/src/api/user.ts`

```typescript
// 获取用户详情
getUserDetail(userId): Promise<ApiResponse<UserDetail>>

// 关注用户
followUser(userId): Promise<ApiResponse<{ message: string }>>

// 取消关注
unfollowUser(userId): Promise<ApiResponse<{ message: string }>>

// 关注状态
getFollowStatus(userId): Promise<ApiResponse<{ is_following: boolean }>>
```

---

## 📞 支持

### 需要帮助？

1. 查看 `USER_DETAIL_API_FINAL_REPORT.md` 获取完整文档
2. 查看 `USER_DETAIL_API_CHECKLIST.md` 验证实现
3. 运行 `test-*.js` 测试脚本进行诊断
4. 检查后端日志: `npx tsx src/server.ts`

### 系统要求

- Node.js >= 18.0
- MySQL >= 5.7
- npm >= 8.0

---

## ✅ 部署检查清单

- [ ] 数据库迁移已执行
- [ ] 后端已编译 (`npm run build`)
- [ ] 前端已编译 (`npm run build`)
- [ ] 环境变量已配置
- [ ] 服务器已启动
- [ ] 健康检查通过
- [ ] 路由测试通过
- [ ] API 功能测试通过

---

**最后更新**: 2026-01-16 | **状态**: ✅ 生产就绪
