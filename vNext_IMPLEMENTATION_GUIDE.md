# vNext 需求实施完整指南

**日期**: 2026-01-19
**目的**: 为 PM/Tech Lead 提供可行的实施路线图
**阶段**: 从需求确认 → 开发执行 → 上线验收

---

## 📋 第 0 阶段: 需求确认 (1 周内完成)

### 检查清单 (必须全部确认后才能启动开发)

#### ✅ 产品决策 (3 个关键问题)

**1. 路线数据来源**

```
[ ] A. 平台精选为主
[ ] B. 用户创建为主
[ ] C. 支持 GPX 导入
[ ] D. 混合模式 (推荐)

选择: ___________
理由: ___________
```

**2. 地图与离线方案**

```
[ ] A. 高德 AMap Web SDK (完整)
[ ] B. 开源 Leaflet (简化)
[ ] C. 先 Web 占位，后升级

选择: ___________
备注: Lynx 端是否需要离线地图？___________
```

**3. SOS 外联方案**

```
[ ] A. 仅站内 + 救援卡片
[ ] B. 短信网关 (成本 ~0.1 元/条)
[ ] C. 第三方救援服务 (成本 ~1000/月)

选择: ___________
预算: ___________
```

#### ✅ 技术确认

| 项目                          | 当前状态 | 确认 |
| ----------------------------- | -------- | ---- |
| 高德 AMap Key 是否已购        | ❓       | [ ]  |
| 和风 QWeather API Key         | ❓       | [ ]  |
| Redis 生产环境可用            | ❓       | [ ]  |
| Lynx 框架版本 & 能力          | ❓       | [ ]  |
| iOS APNs / Android FCM 已配置 | ❓       | [ ]  |
| MySQL 版本 >= 5.7             | ✅       | [✅] |

#### ✅ 业务确认

| 问题                       | 决策     | 备注 |
| -------------------------- | -------- | ---- |
| 新手准备助手纳入 P0 吗？   | 否 (P1)  | [ ]  |
| 离线能力首发包括吗？       | 否 (P1)  | [ ]  |
| 轨迹数据默认公开还是私密？ | 私密     | [ ]  |
| 队伍最大人数限制           | <= 20 人 | [ ]  |
| 轨迹点采样频率             | 10 秒/点 | [ ]  |

#### ✅ 人力与时间

```
前端人数: ___ 人 (建议 3-4 人)
后端人数: ___ 人 (建议 3-4 人)
设计人数: ___ 人 (建议 1-2 人)
QA 人数:  ___ 人 (建议 1 人)

上线目标: __________
MVP 范围: __________
```

### 产品设计交付物检查

所有设计稿必须包含以下页面:

- [ ] 路线列表 (搜索、过滤、排序)
- [ ] 路线详情 (关键点、天气、准备清单占位)
- [ ] 关键点编辑表单
- [ ] 行进模式主屏幕 (地图、下一关键点、控制按钮)
- [ ] 队伍成员卡片 (实时位置、距离、最后更新)
- [ ] SOS 确认模态框
- [ ] 复盘报告页
- [ ] 分享卡片模板

---

## 🏗️ 第 1 阶段: 代码优化准备 (1-2 周)

**目的**: 在启动 vNext 前，提升代码基线质量

### 并行执行的优化任务

#### 任务 1: 清理 console.log (前端 2 人天 + 后端 1 人天)

**执行清单**:

```bash
# 第 1 天: 扫描并分类
grep -r "console\\.log\\|console\\.warn\\|console\\.error" \
  frontend/src backend/src \
  --include="*.ts" --include="*.vue" --include="*.js" \
  > console-cleanup-list.txt

# 第 2 天: 逐个审核与删除
# 保留的迁移到 logger
# 删除的直接清理

# 第 3 天: 添加 ESLint rule
# .eslintrc.json: "no-console": ["error", { allow: ["error", "warn"] }]
```

**验收**:

```
- [ ] 无非 logger 的 console.log
- [ ] ESLint 检查通过
- [ ] git log 显示清理 commit
```

---

#### 任务 2: 启用 TypeScript strict (后端 4-5 人天)

**阶段 1 (第 1 天)**: 启用并评估

```bash
# backend/tsconfig.json
"strict": true

# 扫描错误
npm run build 2>&1 | tee ts-errors.log
# 预期: ~100 个错误
```

**阶段 2 (第 2-3 天)**: 修复核心错误

```typescript
// 优先级排序:
1. src/types/* 文件 (定义清晰的类型)
2. src/middleware/* (认证、错误处理)
3. src/services/* (业务逻辑)
4. src/controllers/* (API 端点)

// 修复模式:
❌ const result = query(...) as any
✅ const [rows] = await query<User[]>(...)
```

**阶段 3 (第 4-5 天)**: 回归测试与微调

```bash
npm run test
npm run build
npm run start:dev
# 手动烟雾测试关键流程
```

**验收**:

```
- [ ] tsc --noEmit 零错误
- [ ] 单测通过 > 90%
- [ ] 应用启动无告警
```

---

#### 任务 3: 统一 API 响应格式 (后端 2 人天 + 前端 1.5 人天)

**后端实施**:

```typescript
// backend/src/utils/apiResponse.ts (新建)
export const createSuccessResponse = <T>(
  data: T,
  message = 'Success',
  code = 0,
  pagination?: Pagination
): ApiResponse<T> => ({
  code,
  message,
  data,
  timestamp: new Date().toISOString(),
  pagination
})

export const createErrorResponse = (
  message: string,
  code: number,
  details?: any
): ApiResponse<null> => ({
  code,
  message,
  data: null,
  timestamp: new Date().toISOString(),
  details
})

// 所有 controller 使用这个工具函数
export const getConversations = asyncHandler(async (req, res) => {
  const conversations = await MessageService.getConversations(...)
  res.json(createSuccessResponse(conversations, '对话列表获取成功'))
})
```

**前端改造**:

```typescript
// frontend/src/api/base/types.ts
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp?: string
  pagination?: {
    page: number
    limit: number
    total: number
  }
}

// 改造 http.ts 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // ✅ 返回原始响应对象，让业务层决定如何处理
    return response.data as ApiResponse
  },
  (error: AxiosError) => {
    // 错误处理逻辑...
    return Promise.reject(error)
  }
)
```

**验收**:

```
- [ ] 所有 API 返回格式符合 ApiResponse
- [ ] 前端 message.ts 改造完毕 (示范)
- [ ] 没有二次解包 (response.data?.data)
```

---

#### 任务 4: Socket.io 安全加固 (后端 1.5 人天)

**实施**:

```typescript
// backend/src/realtime/socket.ts
import * as Joi from 'joi'

// 消息验证 schema
const typingSchema = Joi.object({
  conversationId: Joi.string().uuid().required(),
  isTyping: Joi.boolean().required(),
})

const statusReportSchema = Joi.object({
  activityId: Joi.string().uuid().required(),
  status: Joi.string().valid('ok', 'rest', 'injured', 'separated').required(),
  note: Joi.string().optional().max(500),
})

io.on('connection', (socket) => {
  // 类型化的 socket 用户信息
  const user = (socket.handshake.auth as AuthPayload).user

  socket.on('typing', (payload) => {
    // 1. 验证格式
    const { error, value } = typingSchema.validate(payload)
    if (error) {
      socket.emit('error', { message: 'Invalid payload' })
      return
    }

    // 2. 权限检查
    const conversation = await ConversationService.getById(value.conversationId)
    if (!conversation.members.includes(user.id)) {
      console.warn(`[Socket] Unauthorized: ${user.id} typing on ${value.conversationId}`)
      return
    }

    // 3. 广播
    socket.to(value.conversationId).emit('userTyping', {
      userId: user.id,
      isTyping: value.isTyping,
    })
  })
})
```

**验收**:

```
- [ ] 所有 Socket 事件都有验证
- [ ] 权限检查完备
- [ ] 无数据泄露风险
```

---

### 优化成果验收 (整体)

完成上述 4 个任务后，代码质量应达到:

```
质量指标:
  ✅ TypeScript: strict 模式启用，零 error
  ✅ 代码风格: ESLint 检查通过
  ✅ 单元测试: > 70% 覆盖率
  ✅ API 规范: 100% 遵循 ApiResponse
  ✅ 安全: Socket.io 完全验证

性能基准:
  ✅ 首屏加载: < 3s (无缓存)
  ✅ API 响应: p99 < 500ms
  ✅ 内存占用: < 200MB (后端)

代码审查清单:
  ✅ 无 as any 或有明确注释
  ✅ 无日志泄露
  ✅ 所有错误有处理
  ✅ 分页查询都有索引
```

---

## 🚀 第 2-5 阶段: vNext 开发 (12 周)

参考《vNext_PRD_ANALYSIS_COMPREHENSIVE.md》的 Sprint 规划部分。

### 快速概览

| Sprint | 周期 | 重点                         | 交付物                |
| ------ | ---- | ---------------------------- | --------------------- |
| 1      | 3 周 | 数据库 + 路线 API + 前端架构 | 路线列表/详情 + 地图  |
| 2      | 3 周 | 轨迹记录 + 复盘报告          | 行进模式 + 复盘页     |
| 3      | 2 周 | 队伍协同 + 实时通信          | 队伍房间 + 位置共享   |
| 4      | 4 周 | 安全闭环 + 生产优化          | SOS + 自动触发 + 测试 |

**总交付**:

- [ ] P0 功能 100% 完成
- [ ] TypeScript 严格模式 100%
- [ ] 单元测试 > 80%
- [ ] 端到端测试 (UAT)
- [ ] 性能 benchmark
- [ ] API 文档完整
- [ ] 部署脚本完善

---

## 📊 风险与缓解方案

### 高风险项

| 风险                   | 影响           | 缓解方案                              | 责任人        |
| ---------------------- | -------------- | ------------------------------------- | ------------- |
| 高德 AMap SDK 集成失败 | 地图功能不可用 | 提前 2 周调研，有降级方案（静态地图） | FE_Lead       |
| GPS 定位精度差         | 队伍协同体验差 | 异常检测 + 用户可手动修正             | FE_Dev + 测试 |
| Socket.io 消息丢失     | 实时通信不可靠 | 客户端队列 + 服务端持久化             | BE_Senior     |
| 轨迹点查询性能低       | 大数据量查询慢 | 分区表 + 缓存策略                     | BE_Senior     |
| 和风 QWeather 限流     | API 调用超限   | 后端缓存 + 提前预加载                 | BE_Mid        |

### 依赖关键路径

```
Sprint 1 完成 (3 周)
  ↓
Sprint 2 & 3 并行 (5 周)
  ↓
Sprint 4 完成 (4 周)
  ↓
UAT + 优化 (1 周)
  ↓
上线 (2026-03-30)
```

任何 Sprint 1 的延期会直接影响整体上线时间。

---

## ✅ 上线前验收清单

### 功能完整性

- [ ] 路线创建、编辑、删除、查询
- [ ] 关键点管理（≥ 6 种类型）
- [ ] 轨迹记录与上报（支持离线缓存）
- [ ] 轨迹与路线对比（偏航检测）
- [ ] 复盘报告自动生成
- [ ] 分享卡片生成与导出
- [ ] 队伍房间与成员管理
- [ ] 位置共享（隐私可控）
- [ ] 状态上报（4 种状态）
- [ ] SOS 手动触发
- [ ] 自动失联检测
- [ ] 紧急联系人管理

### 质量指标

- [ ] 功能测试覆盖 > 95%
- [ ] 性能基准达成（API < 500ms, FCP < 3s）
- [ ] 内存泄漏零发现（Chrome DevTools）
- [ ] 网络异常处理完善
- [ ] 错误日志零敏感信息泄露
- [ ] TypeScript strict 100%
- [ ] 代码注释完整率 > 80%

### 安全检查

- [ ] 认证 & 授权覆盖所有 API
- [ ] SQL 注入防护 (Prepared Statements)
- [ ] CSRF token 验证
- [ ] 速率限制已启用
- [ ] 位置数据加密存储
- [ ] 用户隐私设置生效
- [ ] 敏感数据脱敏展示

### 文档完整性

- [ ] API 文档 (Swagger)
- [ ] 数据库 ER 图
- [ ] 部署指南
- [ ] 故障排查手册
- [ ] 用户帮助文档
- [ ] 开发者贡献指南

### 用户体验

- [ ] 新手指引 (Onboarding)
- [ ] 错误提示明确友好
- [ ] 离线 / 低网络体验可接受
- [ ] 实时通知及时稳定
- [ ] 无预期的 UI 闪烁

---

## 🎯 关键成功因素 (CSF)

为了确保项目成功，以下因素最关键:

1. **清晰的需求与设计** (第 0 阶段完成)

   - 产品决策明确 → 减少返工
   - 设计稿完整 → 前后端齐步

2. **强有力的架构** (第 1 阶段完成)

   - 统一的 API 规范 → 减少集成问题
   - 清晰的数据流 → 易于维护

3. **充分的测试** (全程进行)

   - 单元测试 > 80% → 回归更有信心
   - 集成测试 → 发现潜在问题
   - UAT → 验收生产就绪

4. **有效的沟通** (日常进行)

   - 每日站会同步进度
   - 周报评估风险
   - 及时反馈 & 调整

5. **持续优化** (上线后)
   - 监控 APM 指标
   - 收集用户反馈
   - 快速修复 bug

---

## 📞 关键决策者与联系方式

| 角色             | 名字   | 电话   | 邮箱   | 备注               |
| ---------------- | ------ | ------ | ------ | ------------------ |
| PM               | \_\_\_ | \_\_\_ | \_\_\_ | 需求、排期         |
| Tech Lead (后端) | \_\_\_ | \_\_\_ | \_\_\_ | 架构、代码审查     |
| Tech Lead (前端) | \_\_\_ | \_\_\_ | \_\_\_ | UI 架构、集成      |
| 设计负责人       | \_\_\_ | \_\_\_ | \_\_\_ | UI/UX 交付         |
| QA Lead          | \_\_\_ | \_\_\_ | \_\_\_ | 测试计划、质量把控 |

---

## 📅 关键里程碑

```
2026-01-19: 需求分析完成 ✅
2026-01-26: 代码优化完成, 开发环境就绪
2026-02-16: Sprint 1 完成 (路线系统)
2026-03-02: Sprint 2 完成 (轨迹 + 复盘)
2026-03-16: Sprint 3 完成 (队伍协同)
2026-04-06: Sprint 4 完成 (安全闭环)
2026-04-13: UAT & Bug Fix
2026-04-20: 上线 (Production Release)
```

---

## 🎓 培训与交接

### 开发团队培训

在 Sprint 1 启动前，所有开发应完成:

- [ ] vNext 架构讲座 (1 小时)
- [ ] API 规范与最佳实践 (1 小时)
- [ ] 前端数据层新架构 (1.5 小时)
- [ ] 地理计算基础 (1 小时，后端)
- [ ] Socket.io 高级用法 (1 小时)
- [ ] 数据库性能优化 (1 小时)

### 上线前交接

完成 QA 前，确保:

- [ ] Runbook 文档完成 (故障排查)
- [ ] 监控告警规则部署
- [ ] 灾备方案制定
- [ ] 支持团队培训

---

**版本**: v1.0
**最后更新**: 2026-01-19
**状态**: 待确认与启动

---

## 附录: 常见问题 (FAQ)

**Q1: 如果 Sprint 1 延期怎么办？**
A: 后续 Sprint 无法按计划启动。建议在第 2-3 周评估是否需要增加人手。

**Q2: 是否可以同步开发 P0 和 P1？**
A: 不建议。P0 是基础，P1 建立在 P0 之上。优先保证 P0 质量。

**Q3: 如何处理前后端分工的等待时间？**
A: 后端 API 先完成，前端可基于 Swagger 文档和 Mock 数据并行开发。

**Q4: 性能指标达不到怎么办？**
A: 在 Sprint 4 专门安排性能优化周。常见优化: 缓存、索引、查询优化、代码分割。

**Q5: 如何确保测试的有效性？**
A: 编写测试用例时，思考边界情况和异常场景，不只是 happy path。

---

**下一步**:

1. 产品负责人确认需求（第 0 阶段）
2. Tech Lead 评审架构设计
3. 第 1 阶段代码优化同步启动
4. 第 2 周启动 Sprint 1 开发
