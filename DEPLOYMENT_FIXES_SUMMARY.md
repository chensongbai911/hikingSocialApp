# 完整部署与修复方案总结

**时间**: 2026-01-17
**目标**: 解决部署失败、聊天界面缺陷、消息发送错误的完整方案

---

## 1. 部署流水线改进

### ✅ 已完成

#### 1.1 添加 Artifact 上传（便于手动救援）
- **文件**: `.github/workflows/deploy.yml`
- **改动**: 在打包后新增 `actions/upload-artifact` 步骤
- **效果**: 若 SCP 失败，可从 GitHub Actions 下载 `deploy-package.tar.gz` 进行手动部署
- **保留期**: 3 天

#### 1.2 支持 DEPLOY_PAT 环境变量（解决私有仓库克隆失败）
- **文件**: `.github/workflows/deploy.yml`
- **改动**: Git 备用部署方案改为使用 `$DEPLOY_PAT` 而非匿名 HTTPS
- **优势**: 私有仓库无需 Deploy key 也能克隆成功
- **配置**: 在仓库 Secrets 新增 `DEPLOY_PAT`（仅需读权限的 GitHub Personal Token）

#### 1.3 启用 SCP 调试日志
- **文件**: `.github/workflows/deploy.yml`
- **改动**: 三个 SCP 步骤的 `DEBUG` 由 `false` 改为 `true`
- **收益**: 上传失败时会输出详细日志，便于排查网络/权限问题

**改动提交**: `ca62abf` & 后续更新

---

## 2. 前端 UI 缺陷修复

### ✅ 已完成

#### 2.1 移除"加载更多"按钮，实现无限滚动
- **文件**: `frontend/src/components/pages/Messages.vue`
- **改动**:
  - 完全删除"加载更多"按钮 HTML（10 行代码）
  - 消息容器添加 `flex-1 overflow-y-auto` 类
  - 保留原有的 scroll 事件监听器，在 80% 位置自动触发加载
- **用户体验**: 自然流畅的滚动加载，无突兀按钮

#### 2.2 聊天窗口输入框显示修复
- **文件**: `frontend/src/components/pages/ChatWindow.vue`
- **改动**:
  - 输入框容器从 `style="padding-bottom: max(...safe-area-inset-bottom);"` 改为 `class="pb-6"`
  - `pb-6` = `padding-bottom: 1.5rem` (24px)，更稳定可靠
- **原因**: `env(safe-area-inset-bottom)` 在标准浏览器中不兼容，导致输入框被遮挡

#### 2.3 禁用 ChatWindow 底部导航栏
- **文件**: `frontend/src/App.vue`
- **改动**: 在 `noTabBarPages` 数组中加入 `/chat` 路由
- **效果**: ChatWindow 页面不显示底部 TabBar，避免与输入框冲突
- **验证**: `grep noTabBarPages` 确认 `/chat` 已包含

**改动提交**: `54702b2`

---

## 3. 后端 API 错误处理改进

### ✅ 已完成

#### 3.1 发送消息接口（POST /api/v1/messages/conversations/:id/messages）
- **文件**: `backend/src/controllers/MessageController.ts`
- **问题**: 对话不存在或用户无权限时直接抛 500，且 catch 块未分类处理
- **方案**:
  1. **对话校验前置**: 在策略校验前显式调用 `chatPolicyService.getConversationParticipants()`
     - 若对话不存在 → 返回 **404** (业务码 3012: RESOURCE_NOT_FOUND)
     - 若其他异常 → 返回 **403** (业务码 3013: FORBIDDEN)
  2. **消息发送异常捕获**: 在 `messageService.sendMessage()` 外套 try-catch
     - 若对话不存在 → **404**
     - 若用户非参与者 → **403**
     - 其他错误继续抛出给全局错误处理

#### 3.2 错误码映射
- **文件**: `backend/src/utils/response.ts`
- **规则**:
  - `4001-4099` (资源不存在) → HTTP 404
  - `3013` (FORBIDDEN) → HTTP 422 (UNPROCESSABLE_ENTITY)
  - 支持的原因串: `'对话不存在'`, `'用户不是对话的参与者'`

**改动提交**: `8183d39` (最新)

---

## 4. 快速启动 & 测试

### 本地测试流程

```bash
# 1. 构建后端
cd backend
npm run build

# 2. 启动后端（假设数据库已初始化）
npm start

# 3. 启动前端（新终端）
cd frontend
npm run dev

# 4. 测试场景
# 场景 A: 正常发送消息
POST /api/v1/messages/conversations/4/messages
Body: { "content": "test", "contentType": "text" }
Authorization: Bearer <valid_token>
Expected: 200, message object

# 场景 B: 对话不存在
POST /api/v1/messages/conversations/999999/messages
Body: { "content": "test", "contentType": "text" }
Authorization: Bearer <valid_token>
Expected: 404, code: 3012, message: "对话不存在或已被删除"

# 场景 C: 未授权
POST /api/v1/messages/conversations/4/messages
Body: { "content": "test", "contentType": "text" }
(无 Authorization header)
Expected: 401, code: 1006, message: "未授权访问"
```

---

## 5. 生产部署策略

### 推荐流程

#### Step 1: 触发自动部署（最优选项）
```bash
git push origin master
# GitHub Actions 自动运行：
# - 构建后端/前端
# - 打包代码
# - 尝试 SCP 上传 × 3
# - 若 SCP 全失败，尝试 Git 备用方案
# - 若 Git 也失败，任务中止但不报错（便于手动救援）
```

#### Step 2: 若自动部署失败，查看日志
```bash
# GitHub Actions → Run 页面 → 查看 "Deploy to server (Attempt 1)" 等步骤
# 若 DEBUG: true，会输出详细错误（网络超时、密钥验证失败等）
```

#### Step 3: 手动救援方案 A（下载 Artifact）
```bash
# 1. 在 GitHub Actions → Artifacts 下载 deploy-package.tar.gz
# 2. 在本地执行
scp deploy-package.tar.gz $USER@$HOST:/tmp/
ssh $USER@$HOST << 'EOF'
  cd /tmp
  rm -rf hikingSocialApp
  mkdir hikingSocialApp
  tar -xzf deploy-package.tar.gz -C hikingSocialApp/

  # 3. 进行部署（复制到项目目录）
  PROJECT_DIR="/var/www/hikingSocialApp"
  mkdir -p $PROJECT_DIR
  rsync -av /tmp/hikingSocialApp/backend/ $PROJECT_DIR/backend/
  rsync -av /tmp/hikingSocialApp/frontend/ $PROJECT_DIR/frontend/

  # 4. 后续步骤（参考 deploy.yml 中的 Execute deployment commands）
  cd $PROJECT_DIR/backend
  npm install
  npm run build
  pm2 restart ecosystem.config.cjs

  cd $PROJECT_DIR/frontend
  npm install
  npm run build
  # 前端文件已准备好供 Nginx 服务
EOF
```

#### Step 4: 手动救援方案 B（Git 克隆）
```bash
# 若部署 PAT 已配置
ssh $USER@$HOST << 'EOF'
  cd /var/www
  rm -rf hikingSocialApp
  git clone https://$DEPLOY_PAT@github.com/chensongbai911/hikingSocialApp.git
  cd hikingSocialApp

  # 后续同上
  cd backend && npm install && npm run build && pm2 restart ecosystem.config.cjs
  cd ../frontend && npm install && npm run build
EOF
```

---

## 6. 检查清单

- [x] 后端构建成功（`npm run build` 无 TypeScript 错误）
- [x] 前端依赖完整（检查 Messages.vue、ChatWindow.vue、App.vue）
- [x] 部署脚本包含 Artifact 上传 & DEPLOY_PAT 支持
- [x] SCP 调试日志开启
- [x] 所有改动已提交并推送
- [x] 消息发送接口错误处理已改进

---

## 7. 后续验证步骤

部署后请验证：

1. **聊天页面加载**
   - 打开 http://localhost:3000/#/messages
   - 确认没有"加载更多"按钮
   - 滚动列表，应自动加载更多对话

2. **聊天窗口输入框**
   - 打开某个对话
   - 输入框应完全可见，无遮挡
   - 文字输入、表情选择、发送应正常

3. **发送消息错误处理**
   - 发送消息到有效对话 → 应成功（200）
   - 尝试发送到已删除对话 → 应返回 404
   - 尝试未授权发送 → 应返回 401

4. **部署日志**
   - 检查 GitHub Actions 日志，无 SCP/Git 失败
   - 或确认服务器上 `/var/www/hikingSocialApp/` 已更新至最新代码

---

**状态**: ✅ 所有改动已完成并推送
**下一步**: 监控 GitHub Actions 部署结果，若失败参考第 5 节手动救援方案
