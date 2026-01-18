"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatPolicyService = exports.ChatPolicyService = void 0;
const database_1 = require("../config/database");
class ChatPolicyService {
    constructor() {
        this.tablesReady = false;
        this.ensureTablesPromise = null;
    }
    async ensureChatTables() {
        if (this.tablesReady)
            return;
        if (this.ensureTablesPromise)
            return this.ensureTablesPromise;
        this.ensureTablesPromise = (async () => {
            // 黑名单表
            await database_1.pool.query(`
        CREATE TABLE IF NOT EXISTS user_blacklist (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id VARCHAR(50) NOT NULL,
          blocked_user_id VARCHAR(50) NOT NULL,
          reason VARCHAR(255) NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY uniq_user_blocked (user_id, blocked_user_id),
          INDEX idx_user (user_id),
          INDEX idx_blocked (blocked_user_id)
        ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
      `);
            // 单向关注限制表
            await database_1.pool.query(`
        CREATE TABLE IF NOT EXISTS message_limits (
          id INT PRIMARY KEY AUTO_INCREMENT,
          conversation_id INT NOT NULL,
          sender_id VARCHAR(50) NOT NULL,
          receiver_id VARCHAR(50) NOT NULL,
          message_count INT DEFAULT 0,
          is_limited BOOLEAN DEFAULT TRUE,
          limit_reason ENUM('not_mutual_follow', 'receiver_not_replied') DEFAULT 'not_mutual_follow',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY unique_sender_receiver (conversation_id, sender_id),
          INDEX idx_conversation (conversation_id)
        ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
      `);
            this.tablesReady = true;
        })();
        try {
            await this.ensureTablesPromise;
        }
        catch (err) {
            this.ensureTablesPromise = null;
            throw err;
        }
    }
    async ensureTablesReady() {
        await this.ensureChatTables();
    }
    async queryWithAutoMigrate(sql, params = []) {
        try {
            return await database_1.pool.query(sql, params);
        }
        catch (err) {
            if (err?.code === 'ER_NO_SUCH_TABLE') {
                await this.ensureChatTables();
                return await database_1.pool.query(sql, params);
            }
            throw err;
        }
    }
    async getConversationParticipants(conversationId) {
        const [rows] = await database_1.pool.query('SELECT user_id1 AS user1, user_id2 AS user2 FROM conversations WHERE id = ? LIMIT 1', [conversationId]);
        if (!rows || rows.length === 0)
            throw new Error('对话不存在');
        return { user1: rows[0].user1, user2: rows[0].user2 };
    }
    async isBlacklisted(userA, userB) {
        const [rows] = await this.queryWithAutoMigrate('SELECT 1 FROM user_blacklist WHERE (user_id = ? AND blocked_user_id = ?) OR (user_id = ? AND blocked_user_id = ?) LIMIT 1', [userA, userB, userB, userA]);
        return rows.length > 0;
    }
    async getFollowRelation(a, b) {
        const [[aRows], [bRows]] = await Promise.all([
            database_1.pool.query('SELECT 1 FROM user_followers WHERE follower_id = ? AND following_id = ? LIMIT 1', [a, b]),
            database_1.pool.query('SELECT 1 FROM user_followers WHERE follower_id = ? AND following_id = ? LIMIT 1', [b, a]),
        ]);
        const aFollowB = aRows.length > 0;
        const bFollowA = bRows.length > 0;
        return { aFollowB, bFollowA, isMutual: aFollowB && bFollowA };
    }
    async getLimitRecord(conversationId, senderId) {
        const [rows] = await this.queryWithAutoMigrate('SELECT message_count FROM message_limits WHERE conversation_id = ? AND sender_id = ? LIMIT 1', [conversationId, senderId]);
        return rows.length ? rows[0] : null;
    }
    async ensureLimitRow(conversationId, senderId, receiverId) {
        await this.queryWithAutoMigrate(`INSERT INTO message_limits (conversation_id, sender_id, receiver_id, message_count, is_limited, limit_reason)
       VALUES (?, ?, ?, 0, TRUE, 'not_mutual_follow')
       ON DUPLICATE KEY UPDATE conversation_id = conversation_id`, [conversationId, senderId, receiverId]);
    }
    async incrementLimit(conversationId, senderId) {
        await this.queryWithAutoMigrate('UPDATE message_limits SET message_count = message_count + 1 WHERE conversation_id = ? AND sender_id = ?', [conversationId, senderId]);
    }
    async precheckSend(conversationId, senderId) {
        const { user1, user2 } = await this.getConversationParticipants(conversationId);
        const receiverId = user1 === senderId ? user2 : user1;
        if (!receiverId)
            throw new Error('无法确定接收方');
        // 黑名单拦截（任一方向）
        if (await this.isBlacklisted(senderId, receiverId)) {
            return { canSend: false, reason: 'blocked_by_recipient', receiverId, isMutualFollow: false };
        }
        // 关注关系
        const rel = await this.getFollowRelation(senderId, receiverId);
        if (rel.isMutual) {
            return { canSend: true, receiverId, isMutualFollow: true };
        }
        if (!rel.aFollowB) {
            // 发送方未关注对方，禁止发送
            return { canSend: false, reason: 'must_follow_to_message', receiverId, isMutualFollow: false };
        }
        // 单向关注：3条限制
        await this.ensureLimitRow(conversationId, senderId, receiverId);
        const record = await this.getLimitRecord(conversationId, senderId);
        const count = record?.message_count ?? 0;
        if (count >= 3) {
            return { canSend: false, reason: 'message_limit_exceeded', remainingMessages: 0, receiverId, isMutualFollow: false };
        }
        return { canSend: true, remainingMessages: 3 - count, receiverId, isMutualFollow: false };
    }
}
exports.ChatPolicyService = ChatPolicyService;
exports.chatPolicyService = new ChatPolicyService();
//# sourceMappingURL=ChatPolicyService.js.map