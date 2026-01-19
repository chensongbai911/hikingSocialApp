# 🚀 v1.4.0 核心功能快速部署指南

## 📋 部署前检查

- [ ] 确认数据库正常运行
- [ ] 确认后端服务已停止
- [ ] 备份当前数据库

---

## 1️⃣ 数据库迁移 (必须)

### Windows PowerShell

```powershell
# 进入项目目录
cd d:\coze

# 执行数据库迁移脚本
mysql -u root -p hiking_app < backend\src\database\add_pending_status.sql

# 验证迁移成功
mysql -u root -p -e "USE hiking_app; SHOW COLUMNS FROM participations LIKE 'status';"
```

**预期输出**:

```
Field: status
Type: enum('pending','joined','completed','cancelled','rejected')
```

---

## 2️⃣ 后端更新

### 编译 TypeScript

```powershell
cd backend
npm run build
```

**预期输出**:

```
✓ Successfully compiled X files
```

### 启动服务

**开发模式**:

```powershell
npm run dev
```

**生产模式**:

```powershell
npm start
# 或使用 PM2
npm run start:pm2
```

### 验证后端

访问健康检查端点:

```powershell
curl http://localhost:3000/health
```

**预期响应**:

```json
{
  "status": "ok",
  "timestamp": "..."
}
```

---

## 3️⃣ 前端更新

### 安装依赖 (如果需要)

```powershell
cd d:\coze\frontend
npm install
```

### 启动开发服务器

```powershell
npm run dev
```

**预期输出**:

```
VITE ready in XXX ms
➜  Local:   http://localhost:5173/
```

### 构建生产版本 (可选)

```powershell
npm run build
```

---

## 4️⃣ 功能测试清单

### ✅ 活动编辑功能

1. 登录系统
2. 进入"我的徒步" → "我发布的"
3. 找到任意活动,点击"编辑"按钮
4. 验证:
   - [ ] 所有字段正确回显
   - [ ] 可以修改信息
   - [ ] 保存后跳转到"我的徒步"
   - [ ] 修改成功提示

### ✅ 申请审核流程

**步骤 1: 创建测试活动**

```
用户A:
1. 登录
2. 创建新活动
3. 记录活动ID
```

**步骤 2: 申请参加**

```
用户B:
1. 登录
2. 查看活动详情
3. 点击"报名参加"
4. 验证申请成功提示
```

**步骤 3: 查看申请者**

```
用户A:
1. 进入"我的徒步" → "我发布的"
2. 找到刚创建的活动
3. 点击"查看申请"按钮
4. 验证:
   - [ ] 能看到用户B的申请
   - [ ] 显示"待审核"状态
   - [ ] 有"同意"和"拒绝"按钮
```

**步骤 4: 审核申请**

```
用户A:
1. 点击"同意"按钮
2. 验证:
   - [ ] 提示"已同意申请"
   - [ ] 状态变为"已加入"
   - [ ] 按钮消失
```

### ✅ 数据显示测试

```
1. 进入"我的徒步" → "我加入的"
2. 验证:
   - [ ] 显示参与者头像
   - [ ] 显示"X人参加"
   - [ ] 不是空数组

3. 进入"我的徒步" → "我发布的"
2. 验证:
   - [ ] 显示申请人数
   - [ ] 显示"X人已报名" 或 "暂无报名"
```

---

## 5️⃣ API 测试 (可选)

### 使用 cURL 测试

**获取 Token**:

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**获取申请者列表**:

```bash
curl -X GET http://localhost:3000/api/v1/activities/act-001/applicants \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**同意申请**:

```bash
curl -X POST http://localhost:3000/api/v1/activities/act-001/approve \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"user-001"}'
```

**拒绝申请**:

```bash
curl -X POST http://localhost:3000/api/v1/activities/act-001/reject \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"user-002"}'
```

---

## 6️⃣ 常见问题排查

### 问题 1: 数据库迁移失败

**错误**: `Unknown column 'status'`

**解决**:

```sql
-- 手动检查字段
SHOW COLUMNS FROM participations;

-- 如果缺少字段,手动执行
ALTER TABLE participations
MODIFY COLUMN status ENUM('pending', 'joined', 'completed', 'cancelled', 'rejected')
DEFAULT 'pending';
```

### 问题 2: 后端编译失败

**错误**: `Cannot find module`

**解决**:

```powershell
# 清理并重新安装
rm -rf node_modules
rm package-lock.json
npm install
npm run build
```

### 问题 3: 前端路由404

**错误**: 访问 `/activity/xxx/applicants` 显示 404

**解决**:

```powershell
# 重启开发服务器
npm run dev
```

### 问题 4: API 返回 403

**错误**: `只有活动创建者才能查看申请者列表`

**原因**: 当前用户不是活动创建者

**解决**: 使用创建者账号登录

---

## 7️⃣ 回滚方案

如果部署后出现严重问题,可以回滚:

### 数据库回滚

```sql
-- 恢复旧状态 ENUM
ALTER TABLE participations
MODIFY COLUMN status ENUM('joined', 'completed', 'cancelled')
DEFAULT 'joined';

-- 删除新增字段
ALTER TABLE participations DROP COLUMN applied_at;
ALTER TABLE participations DROP COLUMN approved_at;
ALTER TABLE participations DROP COLUMN rejected_at;
```

### 代码回滚

```powershell
# 回退到上一个 commit
git reset --hard HEAD~1

# 重新编译
cd backend
npm run build
npm run start
```

---

## 8️⃣ 性能监控

部署后监控以下指标:

- [ ] API 响应时间 < 200ms
- [ ] 数据库查询时间 < 100ms
- [ ] 前端页面加载时间 < 2s
- [ ] 内存使用 < 500MB

---

## 📞 支持

如遇到问题:

1. 查看日志:

   ```powershell
   # 后端日志
   tail -f backend/logs/app.log

   # PM2 日志
   pm2 logs hiking-app-backend
   ```

2. 检查数据库:

   ```sql
   SELECT * FROM participations WHERE status = 'pending' LIMIT 5;
   ```

3. 查看详细报告: `CORE_FEATURES_COMPLETION_REPORT_v1.4.0.md`

---

**祝部署顺利! 🎉**
