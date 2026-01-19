# Git 提交规范指南

**项目**: 徒步社交 App vNext
**更新日期**: 2026-01-19

---

## 📋 Commit Message 格式

```
<type>: [TaskID] <subject>

<body>

<footer>
```

### Type (必填)

| Type       | 说明          | 示例                                 |
| ---------- | ------------- | ------------------------------------ |
| `feat`     | 新功能        | feat: [T1.2] 添加路线列表 API        |
| `fix`      | Bug 修复      | fix: [T2.3] 修复轨迹点上传失败问题   |
| `refactor` | 代码重构      | refactor: [T0.5] 重构前端 API 数据层 |
| `style`    | 代码格式调整  | style: 统一代码缩进为 2 空格         |
| `docs`     | 文档更新      | docs: 更新 API 文档                  |
| `test`     | 测试相关      | test: 添加路线 API 单元测试          |
| `chore`    | 构建/工具变更 | chore: 升级 TypeScript 到 5.3        |
| `perf`     | 性能优化      | perf: [T4.10] 优化路线列表查询性能   |

### TaskID (推荐)

任务编号，格式: `[T0.1]`, `[T1.2]`, `[T2.3]` 等

### Subject (必填)

- 简短描述 (不超过 50 字符)
- 使用动词开头 (添加、修复、重构等)
- 不要以句号结尾

### Body (可选)

- 详细描述改动内容
- 说明为什么做这个改动
- 如何解决的问题

### Footer (可选)

- 关闭的 Issue: `Closes #123`
- 破坏性变更: `BREAKING CHANGE: 说明`

---

## ✅ 好的示例

```bash
feat: [T1.2] 添加路线 CRUD API

实现了路线的创建、读取、更新、删除接口:
- POST /api/v1/routes - 创建路线
- GET /api/v1/routes - 获取路线列表
- GET /api/v1/routes/:id - 获取路线详情
- PUT /api/v1/routes/:id - 更新路线
- DELETE /api/v1/routes/:id - 删除路线

包含输入验证、权限控制和错误处理。
```

```bash
fix: [T2.3] 修复轨迹点批量上传失败问题

问题: 当轨迹点数量超过 100 时，请求超时
解决: 将批量上传改为分批上传，每批 50 个点
性能: 上传 500 个点从 30s 降低到 5s
```

```bash
refactor: [T0.5] 重构前端 API 数据层

创建了统一的 API 服务层:
- api/base/apiService.ts: 封装所有 HTTP 请求
- api/hooks/useApiRequest.ts: 通用请求 Hook
- api/modules/route.ts: 路线相关 API

优势:
- 统一错误处理
- 自动缓存管理
- 请求重试机制
```

---

## ❌ 不好的示例

```bash
# ❌ 太简短，没有上下文
fix: bug

# ❌ 没有 type
修复了一个 bug

# ❌ 描述不清楚
feat: update code

# ❌ 包含多个不相关改动
feat: 添加路线 API 和修复用户登录问题

# ❌ 使用了句号结尾
feat: 添加路线列表。
```

---

## 🌿 分支命名规范

### 格式

```
<type>/<task-id>-<brief-description>
```

### 示例

```bash
feature/T1.2-route-crud-api
feature/T1.6-route-list-page
fix/T2.3-track-upload-timeout
refactor/T0.5-frontend-api-layer
chore/upgrade-typescript
```

### Type 说明

- `feature/` - 新功能分支
- `fix/` - Bug 修复分支
- `refactor/` - 重构分支
- `hotfix/` - 紧急修复分支
- `release/` - 发布分支
- `chore/` - 构建/工具分支

---

## 🔄 Git 工作流

### 1. 创建功能分支

```bash
# 从 master 创建分支
git checkout master
git pull origin master
git checkout -b feature/T1.2-route-crud-api
```

### 2. 开发与提交

```bash
# 添加改动
git add .

# 提交 (遵循 Commit 规范)
git commit -m "feat: [T1.2] 添加路线 CRUD API"

# 如果需要更详细的描述，使用编辑器
git commit
```

### 3. 推送到远程

```bash
git push origin feature/T1.2-route-crud-api
```

### 4. 创建 Pull Request

- 访问 GitHub/GitLab
- 创建 PR: `feature/T1.2-route-crud-api` → `master`
- 填写 PR 描述
- 指定 Reviewer
- 关联相关 Issue

### 5. Code Review

- Reviewer 审查代码
- 提出修改意见
- 开发者修改并推送

### 6. 合并

- Reviewer 批准后合并
- 删除远程分支
- 删除本地分支

```bash
# 切换回 master
git checkout master
git pull origin master

# 删除本地分支
git branch -d feature/T1.2-route-crud-api
```

---

## 📝 Pull Request 模板

```markdown
## 📋 改动说明

[简要描述这个 PR 做了什么]

## 🎯 关联任务

- TaskID: T1.2
- 文档: vNext_TASK_BREAKDOWN.md

## ✅ 改动清单

- [ ] 添加路线 CRUD API
- [ ] 添加单元测试
- [ ] 更新 API 文档

## 🧪 测试

- [ ] 单元测试通过
- [ ] 集成测试通过
- [ ] 手动测试通过

## 📸 截图 (如适用)

[粘贴截图]

## 🔗 相关链接

- API 文档: [链接]
- 设计稿: [Figma 链接]

## 📝 备注

[其他需要说明的内容]
```

---

## 🚀 快速命令

### 日常提交

```bash
# 查看改动
git status
git diff

# 添加文件
git add <file>
# 或添加所有改动
git add .

# 提交
git commit -m "feat: [T1.2] 简短描述"

# 推送
git push
```

### 查看历史

```bash
# 查看提交历史
git log --oneline --graph --all

# 查看某个文件的历史
git log --follow <file>

# 查看某次提交的详情
git show <commit-hash>
```

### 撤销操作

```bash
# 撤销未暂存的改动
git checkout -- <file>

# 撤销已暂存的改动
git reset HEAD <file>

# 修改最后一次提交
git commit --amend

# 撤销最后一次提交 (保留改动)
git reset --soft HEAD~1

# 撤销最后一次提交 (不保留改动)
git reset --hard HEAD~1
```

---

## ✅ 提交前检查清单

- [ ] 代码编译通过 (`npm run build`)
- [ ] ESLint 检查通过 (`npm run lint`)
- [ ] 单元测试通过 (`npm test`)
- [ ] 代码已格式化 (Prettier)
- [ ] 没有 console.log
- [ ] 没有调试代码
- [ ] Commit message 符合规范
- [ ] 分支名称符合规范

---

## 📚 参考资源

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Angular Commit Guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md)
- [Git Best Practices](https://git-scm.com/book/en/v2)

---

**遵循这些规范，让我们的 Git 历史清晰易读！**
