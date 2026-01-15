import express from 'express';
import { MessageController } from '../controllers/MessageController';
import { authMiddleware } from '../middleware/authMiddleware';
const router = express.Router();
/**
 * 消息/对话相关的路由
 * 所有路由都需要身份验证
 */
// 获取对话列表
router.get('/conversations', authMiddleware, MessageController.getConversations);
// 获取或创建对话
router.post('/conversations', authMiddleware, MessageController.createConversation);
// 获取对话的消息列表
router.get('/conversations/:conversationId', authMiddleware, MessageController.getMessages);
// 标记对话的所有消息为已读
router.put('/conversations/:conversationId/read-all', authMiddleware, MessageController.markConversationAsRead);
// 搜索对话中的消息
router.get('/conversations/:conversationId/search', authMiddleware, MessageController.searchMessages);
// 发送消息
router.post('/conversations/:conversationId/messages', authMiddleware, MessageController.sendMessage);
// 标记单条消息为已读
router.put('/:messageId/read', authMiddleware, MessageController.markAsRead);
// 删除消息
router.delete('/:messageId', authMiddleware, MessageController.deleteMessage);
// 获取未读消息数
router.get('/unread-count', authMiddleware, MessageController.getUnreadCount);
// 获取消息统计信息
router.get('/stats', authMiddleware, MessageController.getStats);
export default router;
//# sourceMappingURL=messageRoutes.js.map