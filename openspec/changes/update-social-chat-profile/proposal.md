# Change: Update social/chat/profile flow closure

## Why

当前“好友/关注/聊天/个人资料”存在交互割裂、数据字段不一致与 UI 体验不统一的问题，导致用户流程不闭环（关注后不清楚如何加好友、聊天权限/状态提示不明确、举报/撤回缺少清晰反馈）。

## What Changes

- 统一社交关系状态展示（关注/互关/好友/待处理）与按钮文案，补齐“添加好友/关注/私信”的闭环路径。
- 明确聊天权限与提示：基于关注/互关状态的限制展示、剩余消息数提示、撤回/举报交互与确认。
- 标准化前端数据字段映射（snake/camel 兼容）与缺省值兜底，减少字段不完整导致的 UI 异常。
- 优化消息界面与交互风格（消息列表、气泡、状态提示、空状态），与全局设计保持一致。
- 优化个人资料“查看/编辑/保存”交互反馈，补齐偏好、相册、头像等状态一致性。

## Impact

- Affected specs: `social-graph`, `messaging`, `profile`
- Affected code: `backend/src/controllers/*`, `backend/src/services/*`, `backend/src/routes/*`, `frontend/src/components/pages/*`, `frontend/src/components/features/*`, `frontend/src/api/*`, `frontend/src/stores/*`

## Open Questions

1. 好友与关注的关系：是否需要“接受好友请求后自动互相关注”？
2. 聊天权限：是否以“互关”作为默认门槛，还是“好友关系”作为门槛？
3. 举报原因：是否提供用户可选原因列表（如垃圾信息/骚扰/违规内容）？
