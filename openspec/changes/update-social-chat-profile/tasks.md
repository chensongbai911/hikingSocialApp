# Tasks: Update social/chat/profile flow closure

## 1. Analysis

- [ ] 梳理现有好友/关注/聊天/资料页面与 API 数据流
- [ ] 明确字段映射与兼容层策略（snake/camel）

## 2. Social Graph (Friend/Follow)

- [ ] 关系状态统一模型与 UI 文案
- [ ] AddFriend 与 UserProfile 交互闭环（关注/加好友/私信）
- [ ] 后端接口补齐必要字段或聚合输出

## 3. Messaging

- [ ] 统一消息列表与对话列表 UI 风格
- [ ] 撤回/举报交互补齐确认与状态展示
- [ ] WebSocket 事件与列表状态同步

## 4. Profile

- [ ] 查看/编辑/保存交互一致性
- [ ] 偏好/相册/头像字段完整性校验与兜底
- [ ] 错误提示与空状态优化

## 5. Validation

- [ ] 更新变更说明与测试清单
- [ ] 运行相关页面的手动回归检查
