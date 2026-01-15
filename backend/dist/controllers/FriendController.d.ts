import { Request, Response } from 'express';
export declare class FriendController {
    /**
     * 发送好友请求
     * POST /api/v1/friends/request
     */
    sendFriendRequest: (req: Request, res: Response, next: import("express").NextFunction) => void;
    /**
     * 接受好友请求
     * PUT /api/v1/friends/:friendId/accept
     */
    acceptFriendRequest: (req: Request, res: Response, next: import("express").NextFunction) => void;
    /**
     * 拒绝好友请求
     * PUT /api/v1/friends/:friendId/reject
     */
    rejectFriendRequest: (req: Request, res: Response, next: import("express").NextFunction) => void;
    /**
     * 删除好友
     * DELETE /api/v1/friends/:friendId
     */
    removeFriend: (req: Request, res: Response, next: import("express").NextFunction) => void;
    /**
     * 获取好友列表
     * GET /api/v1/friends
     */
    getFriends: (req: Request, res: Response, next: import("express").NextFunction) => void;
    /**
     * 获取待处理的好友请求
     * GET /api/v1/friends/requests/pending
     */
    getPendingRequests: (req: Request, res: Response, next: import("express").NextFunction) => void;
    /**
     * 搜索用户
     * GET /api/v1/friends/search
     */
    searchUsers: (req: Request, res: Response, next: import("express").NextFunction) => void;
    /**
     * 获取推荐用户
     * GET /api/v1/friends/recommendations
     */
    getRecommendedUsers: (req: Request, res: Response, next: import("express").NextFunction) => void;
    /**
     * 检查好友关系状态
     * GET /api/v1/friends/:friendId/status
     */
    getFriendshipStatus: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
declare const _default: FriendController;
export default _default;
//# sourceMappingURL=FriendController.d.ts.map