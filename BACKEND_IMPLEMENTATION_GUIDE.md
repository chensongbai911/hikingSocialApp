# 🔧 后端实现指南 - UserGuide/Profile 集成

> **状态**: 前端已完成，后端需要实现此指南中的所有内容
> **优先级**: 🔴 高 - 阻止新用户完成引导流程

---

## 📋 后端需要实现的内容

### 1️⃣ 数据库模式扩展

#### A. User 表扩展

**新增字段**:
```sql
ALTER TABLE users ADD COLUMN (
  age INT(3) COMMENT '年龄',
  gender ENUM('male', 'female', 'other') DEFAULT NULL COMMENT '性别',
  bio TEXT COMMENT '个人简介',
  avatar_url VARCHAR(512) COMMENT '头像URL',
  onboarding_completed BOOLEAN DEFAULT FALSE COMMENT '是否完成新用户引导',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**备注**:
- `age`: 18-88 岁
- `gender`: 可选 (male, female, other)
- `bio`: 最多 500 字符
- `avatar_url`: S3 或本地存储 URL
- `onboarding_completed`: 新用户引导完成标记

#### B. UserPreference 表 (新建)

```sql
CREATE TABLE user_preferences (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  difficulty_level ENUM('easy', 'medium', 'hard') COMMENT '难度等级',
  tags JSON COMMENT '活动标签 (JSON数组)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**备注**:
- `difficulty_level`: easy, medium, hard
- `tags`: JSON 数组，例如 `["户外徒步", "自然风景", "摄影"]`

---

### 2️⃣ API 端点实现

#### 端点 1: POST `/api/user/profile`

**功能**: 保存新用户引导信息（步骤1和3）

**请求体**:
```typescript
{
  nickname: string;      // 必需，1-20字符
  age: number;          // 必需，18-88
  gender: string;       // 必需，'male'|'female'|'other'
  bio?: string;         // 可选，最多500字符
  difficulty_level?: string;  // 可选，'easy'|'medium'|'hard'
  tags?: string[];      // 可选，标签数组
}
```

**响应**:
```typescript
{
  success: true,
  message: "Profile updated successfully",
  data: {
    id: number;
    nickname: string;
    age: number;
    gender: string;
    bio: string;
    avatar_url: string;
  }
}
```

**实现要点**:
- ✅ 需要认证 (JWT token)
- ✅ 验证所有必需字段
- ✅ 验证字段格式和长度
- ✅ 更新 User 表
- ✅ 创建/更新 UserPreference 表
- ✅ 返回更新后的用户信息

**错误处理**:
```typescript
{
  success: false,
  message: "Validation failed",
  errors: {
    nickname: "Nickname must be 1-20 characters",
    age: "Age must be between 18 and 88"
  }
}
```

#### 端点 2: POST `/api/user/avatar`

**功能**: 处理头像上传（步骤2）

**请求**:
- 类型: `multipart/form-data`
- 字段: `avatar` (file)

**响应**:
```typescript
{
  success: true,
  message: "Avatar uploaded successfully",
  data: {
    avatar_url: string;  // 新头像URL
    size: number;        // 文件大小(字节)
    format: string;      // 文件格式 (jpeg, png等)
  }
}
```

**实现要点**:
- ✅ 需要认证 (JWT token)
- ✅ 支持格式: JPEG, PNG, WebP (最大5MB)
- ✅ 验证图片尺寸和质量
- ✅ 存储到 S3 或本地 `/uploads/avatars/`
- ✅ 更新 User 表 avatar_url
- ✅ 返回新的 avatar_url

**错误处理**:
```typescript
{
  success: false,
  message: "Upload failed",
  error: "File size exceeds 5MB"
}
```

#### 端点 3: GET `/api/user/profile`

**功能**: 获取当前用户完整信息（调试用）

**响应**:
```typescript
{
  success: true,
  data: {
    id: number;
    email: string;
    nickname: string;
    age: number;
    gender: string;
    bio: string;
    avatar_url: string;
    onboarding_completed: boolean;
    preferences: {
      difficulty_level: string;
      tags: string[];
    }
  }
}
```

#### 端点 4: PUT `/api/user/onboarding-complete`

**功能**: 标记新用户引导完成

**请求体**:
```typescript
{}
```

**响应**:
```typescript
{
  success: true,
  message: "Onboarding marked as complete",
  data: {
    onboarding_completed: true
  }
}
```

---

### 3️⃣ 验证规则

#### 昵称 (Nickname)
```
- 长度: 1-20 字符
- 允许字符: 中文、英文、数字、下划线、中划线
- 不允许: 特殊符号、空格、emoji
- 唯一性: 建议检查唯一性 (可选)
```

#### 年龄 (Age)
```
- 范围: 18-88
- 格式: 整数
- 必需: 是
```

#### 性别 (Gender)
```
- 值: 'male', 'female', 'other'
- 必需: 是
- 大小写: 敏感 (小写)
```

#### 简介 (Bio)
```
- 长度: 0-500 字符
- 必需: 否
- 允许字符: 所有 UTF-8
```

#### 难度等级 (Difficulty Level)
```
- 值: 'easy', 'medium', 'hard'
- 必需: 否
- 大小写: 敏感 (小写)
```

#### 标签 (Tags)
```
- 格式: 字符串数组
- 最大标签数: 10
- 每个标签长度: 1-20 字符
- 必需: 否
```

---

### 4️⃣ 文件存储

#### 头像存储方案

**选项 A: 本地存储**
```
目录: /var/www/hikingSocialApp/uploads/avatars/
URL: http://[server]/api/uploads/avatars/{userId}/{filename}
格式: {userId}_{timestamp}.{extension}
示例: 123_1705585200000.jpg
```

**选项 B: AWS S3**
```
Bucket: hiking-app-avatars
Key: avatars/{userId}/{timestamp}.{extension}
URL: https://[bucket].s3.amazonaws.com/...
访问: 公开读取、认证写入
```

**选项 C: CDN**
```
上传到本地 → 同步到 CDN
CDN URL: https://cdn.example.com/avatars/{userId}/{filename}
缓存策略: 1年过期
```

**建议**: 使用本地存储 + Nginx 反向代理（简单快速）

---

### 5️⃣ TypeScript 类型定义

```typescript
// 前端发送的类型
interface UserGuideFormData {
  // 步骤 1
  nickname: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  bio: string;

  // 步骤 2
  avatar: File; // 或 avatar_url: string

  // 步骤 3
  difficulty_level: 'easy' | 'medium' | 'hard';
  tags: string[];
}

// 后端返回的类型
interface UserProfile {
  id: number;
  email: string;
  nickname: string;
  age: number;
  gender: string;
  bio: string;
  avatar_url: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
  preferences: UserPreference;
}

interface UserPreference {
  id: number;
  user_id: number;
  difficulty_level: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}
```

---

### 6️⃣ 实现清单

#### 数据库
- [ ] 创建数据库迁移文件
- [ ] 执行 User 表字段扩展
- [ ] 创建 UserPreference 表
- [ ] 创建索引 (user_id, email等)
- [ ] 验证表结构

#### 模型/实体
- [ ] 创建/更新 User 实体
- [ ] 创建 UserPreference 实体
- [ ] 定义 DTO (Data Transfer Objects)
- [ ] 定义 API 响应类型
- [ ] 添加验证注解

#### 服务层
- [ ] 创建 UserProfileService
- [ ] 实现 updateUserProfile()
- [ ] 实现 uploadAvatar()
- [ ] 实现 getUserProfile()
- [ ] 实现 completeOnboarding()
- [ ] 添加错误处理
- [ ] 添加日志记录

#### 控制器
- [ ] 创建/更新 UserProfileController
- [ ] 实现 POST `/api/user/profile`
- [ ] 实现 POST `/api/user/avatar`
- [ ] 实现 GET `/api/user/profile`
- [ ] 实现 PUT `/api/user/onboarding-complete`
- [ ] 添加认证中间件
- [ ] 添加错误响应处理

#### 测试
- [ ] 单元测试 (Service 层)
- [ ] 集成测试 (API 端点)
- [ ] 错误场景测试
- [ ] 文件上传测试
- [ ] 数据验证测试

#### 部署
- [ ] 数据库迁移到生产环境
- [ ] 部署后端代码
- [ ] 配置文件存储
- [ ] 验证 API 可达性
- [ ] 检查错误日志

---

### 7️⃣ 前端 API 调用示例

这是前端期望调用的方式：

```typescript
// 步骤 1 & 3: 保存基本信息和偏好
const response = await fetch('/api/user/profile', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    nickname: 'Alice',
    age: 28,
    gender: 'female',
    bio: '热爱户外',
    difficulty_level: 'medium',
    tags: ['自然风景', '摄影']
  })
});

// 步骤 2: 上传头像
const formData = new FormData();
formData.append('avatar', avatarFile);

const avatarResponse = await fetch('/api/user/avatar', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

// 步骤 4: 完成引导
const completeResponse = await fetch('/api/user/onboarding-complete', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: '{}'
});
```

---

### 8️⃣ 时间估计

| 任务 | 估计时间 | 难度 |
|------|---------|------|
| 数据库迁移 | 1小时 | ⭐ 简单 |
| 模型和 DTO | 2小时 | ⭐ 简单 |
| Service 实现 | 4小时 | ⭐⭐ 中等 |
| 控制器实现 | 3小时 | ⭐⭐ 中等 |
| 文件存储配置 | 2小时 | ⭐⭐ 中等 |
| 测试和调试 | 4小时 | ⭐⭐⭐ 复杂 |
| 部署和验证 | 2小时 | ⭐ 简单 |
| **总计** | **18小时** | - |

**建议工作量**: 2-3 天，根据团队人数调整

---

### 9️⃣ 常见问题 & 解决方案

#### Q1: 前端如何判断用户是否已完成引导？
**A**: 检查 `user.onboarding_completed` 字段
```typescript
if (user.onboarding_completed) {
  // 已完成，跳过引导页
  router.push('/discover');
} else {
  // 未完成，进入引导页
  router.push('/user-guide');
}
```

#### Q2: 如何处理头像上传的大文件？
**A**: 在后端验证并压缩
```typescript
// 检查文件大小 (最大 5MB)
if (file.size > 5 * 1024 * 1024) {
  throw new Error('File too large');
}

// 使用 sharp 或 ImageMagick 压缩
const compressed = await sharp(file)
  .resize(300, 300, { fit: 'cover' })
  .webp({ quality: 80 })
  .toBuffer();
```

#### Q3: 用户修改信息后如何处理？
**A**: 在 UserProfile 页面提供编辑端点
```
PUT /api/user/profile - 更新已有信息
PUT /api/user/avatar - 更新头像
PUT /api/user/preferences - 更新偏好
```

#### Q4: 如何防止昵称重复？
**A**: 检查唯一性 (可选)
```sql
SELECT * FROM users WHERE nickname = ? AND id != ?;
```

---

### 🔟 后端团队 Checklist

```
后端实现 Checklist
==================

□ 1. 数据库表结构设计
  □ 分析现有 User 表
  □ 规划新增字段
  □ 创建 UserPreference 表
  □ 创建迁移脚本

□ 2. 项目基础设置
  □ 确认技术栈和框架
  □ 设置构建工具和依赖
  □ 配置数据库连接

□ 3. 数据模型开发
  □ 创建 User 实体类
  □ 创建 UserPreference 实体类
  □ 创建请求/响应 DTO
  □ 添加数据验证注解

□ 4. Service 层实现
  □ 实现 UserProfileService
  □ 实现 UserPreferenceService
  □ 添加业务逻辑验证
  □ 添加错误处理

□ 5. 控制器层实现
  □ 创建 UserProfileController
  □ 实现所有 API 端点
  □ 添加请求验证
  □ 添加异常处理

□ 6. 文件上传处理
  □ 配置文件存储目录
  □ 实现文件上传逻辑
  □ 实现文件验证和压缩
  □ 实现文件 URL 生成

□ 7. 测试和验证
  □ 编写单元测试
  □ 编写集成测试
  □ 手动 API 测试
  □ 使用 Postman 验证

□ 8. 部署和优化
  □ 执行数据库迁移
  □ 部署后端代码
  □ 验证 API 可用性
  □ 监控日志和性能
```

---

## 🚀 启动指南

### 第 1 步: 检查前端
```bash
# 前端已经准备好
cd frontend
npm run build
# 输出应该在 dist/ 目录
```

### 第 2 步: 后端开发
```bash
# 按上述清单逐项实现
# 优先级: 数据库 > Service > Controller > 测试
```

### 第 3 步: API 集成测试
```bash
# 使用 TESTING_AND_VERIFICATION_GUIDE.md 中的测试场景
# 验证所有 API 端点功能正确
```

### 第 4 步: 端到端测试
```bash
# 运行新用户完整流程
# 从注册 → 登录 → 引导 → 发现页面
# 验证所有数据正确保存到数据库
```

---

## 📞 技术支持

### 前端联系方式
- 📧 Email: [前端开发者邮箱]
- 💬 Slack: #frontend-dev
- 📱 Phone: [电话]

### 文档参考
- [TESTING_AND_VERIFICATION_GUIDE.md](TESTING_AND_VERIFICATION_GUIDE.md) - 完整测试指南
- [USER_FLOW_UPDATE_2026-01-18.md](USER_FLOW_UPDATE_2026-01-18.md) - 流程详解
- [API_Documentation.md](API_Documentation.md) - API 规范（如果有）

---

## 📝 注意事项

1. ⚠️ **认证**: 所有端点都需要有效的 JWT token
2. ⚠️ **CORS**: 配置允许前端域名访问
3. ⚠️ **速率限制**: 建议添加 API 速率限制
4. ⚠️ **日志**: 记录所有用户操作便于调试
5. ⚠️ **备份**: 部署前备份现有数据库

---

**准备就绪！** 🎉
后端团队可以开始实现了。有任何问题请参考文档或联系前端团队。
