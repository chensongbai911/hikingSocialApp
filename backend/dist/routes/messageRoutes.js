"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const MessageController_1 = require("../controllers/MessageController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
/**
 * 消息/对话相关的路由
 * 所有路由都需要身份验证
 */
// 获取对话列表
router.get('/conversations', authMiddleware_1.authMiddleware, MessageController_1.MessageController.getConversations);
// 获取或创建对话
router.post('/conversations', authMiddleware_1.authMiddleware, MessageController_1.MessageController.createConversation);
// 获取对话的消息列表
router.get('/conversations/:conversationId', authMiddleware_1.authMiddleware, MessageController_1.MessageController.getMessages);
// 获取对话信息（限制/关系/黑名单）
router.get('/conversations/:conversationId/info', authMiddleware_1.authMiddleware, MessageController_1.MessageController.getConversationInfo);
// 清空对话（归档）
router.delete('/conversations/:conversationId', authMiddleware_1.authMiddleware, MessageController_1.MessageController.clearConversation);
// 标记对话的所有消息为已读
router.put('/conversations/:conversationId/read-all', authMiddleware_1.authMiddleware, MessageController_1.MessageController.markConversationAsRead);
// 搜索对话中的消息
router.get('/conversations/:conversationId/search', authMiddleware_1.authMiddleware, MessageController_1.MessageController.searchMessages);
// 发送消息
router.post('/conversations/:conversationId/messages', authMiddleware_1.authMiddleware, MessageController_1.MessageController.sendMessage);
// 撤回消息
router.post('/:messageId/recall', authMiddleware_1.authMiddleware, MessageController_1.MessageController.recallMessage);
// 举报消息
router.post('/:messageId/report', authMiddleware_1.authMiddleware, MessageController_1.MessageController.reportMessage);
// 黑名单管理
router.get('/blacklist', authMiddleware_1.authMiddleware, MessageController_1.MessageController.getBlacklist);
router.post('/blacklist/:targetUserId', authMiddleware_1.authMiddleware, MessageController_1.MessageController.addToBlacklist);
router.delete('/blacklist/:targetUserId', authMiddleware_1.authMiddleware, MessageController_1.MessageController.removeFromBlacklist);
// 标记单条消息为已读
router.put('/:messageId/read', authMiddleware_1.authMiddleware, MessageController_1.MessageController.markAsRead);
// 删除消息
router.delete('/:messageId', authMiddleware_1.authMiddleware, MessageController_1.MessageController.deleteMessage);
// 获取未读消息数
router.get('/unread-count', authMiddleware_1.authMiddleware, MessageController_1.MessageController.getUnreadCount);
// 获取消息统计信息
router.get('/stats', authMiddleware_1.authMiddleware, MessageController_1.MessageController.getStats);
exports.default = router;
//# sourceMappingURL=messageRoutes.js.map