export interface SendPrecheckResult {
    canSend: boolean;
    reason?: string;
    remainingMessages?: number;
    receiverId: string;
    isMutualFollow: boolean;
}
export declare class ChatPolicyService {
    private tablesReady;
    private ensureTablesPromise;
    private ensureChatTables;
    ensureTablesReady(): Promise<void>;
    private queryWithAutoMigrate;
    getConversationParticipants(conversationId: number): Promise<{
        user1: string;
        user2: string;
    }>;
    isBlacklisted(userA: string, userB: string): Promise<boolean>;
    getFollowRelation(a: string, b: string): Promise<{
        aFollowB: boolean;
        bFollowA: boolean;
        isMutual: boolean;
    }>;
    getLimitRecord(conversationId: number, senderId: string): Promise<{
        message_count: number;
    } | null>;
    ensureLimitRow(conversationId: number, senderId: string, receiverId: string): Promise<void>;
    incrementLimit(conversationId: number, senderId: string): Promise<void>;
    precheckSend(conversationId: number, senderId: string): Promise<SendPrecheckResult>;
}
export declare const chatPolicyService: ChatPolicyService;
//# sourceMappingURL=ChatPolicyService.d.ts.map