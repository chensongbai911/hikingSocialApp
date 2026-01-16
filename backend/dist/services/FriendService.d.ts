import { Friendship } from '../models/Friendship';
import { User } from '../models/User';
export declare class FriendService {
    /**
     * 发送好友请求
     */
    sendFriendRequest(userId: number, friendId: number, message?: string): Promise<Friendship>;
    /**
     * 接受好友请求
     */
    acceptFriendRequest(userId: number, friendId: number): Promise<void>;
    /**
     * 拒绝好友请求
     */
    rejectFriendRequest(userId: number, friendId: number): Promise<void>;
    /**
     * 删除好友
     */
    removeFriend(userId: number, friendId: number): Promise<void>;
    /**
     * 获取好友列表
     */
    getFriends(userId: number): Promise<unknown[]>;
    /**
     * 获取待处理的好友请求
     */
    getPendingRequests(userId: number): Promise<Friendship[]>;
    /**
     * 搜索用户(按昵称或手机号)
     */
    searchUsers(keyword: string, currentUserId: number): Promise<User[]>;
    /**
     * 推荐可能感兴趣的人
     */
    getRecommendedUsers(userId: number, limit?: number): Promise<User[]>;
    /**
     * 检查好友关系状态
     */
    getFriendshipStatus(userId: number, friendId: number): Promise<string | null>;
}
declare const _default: FriendService;
export default _default;
//# sourceMappingURL=FriendService.d.ts.map