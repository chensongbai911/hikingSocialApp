"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendService = void 0;
const Friendship_1 = require("../models/Friendship");
const User_1 = require("../models/User");
const UserPreference_1 = require("../models/UserPreference");
const errors_1 = require("../utils/errors");
const sequelize_1 = require("sequelize");
class FriendService {
    /**
     * 发送好友请求
     */
    async sendFriendRequest(userId, friendId, message) {
        if (userId === friendId) {
            throw new errors_1.BusinessError(errors_1.BusinessErrorCode.INVALID_REQUEST, '不能添加自己为好友');
        }
        // 检查对方用户是否存在
        const friendUser = await User_1.User.findByPk(friendId);
        if (!friendUser) {
            throw new errors_1.BusinessError(errors_1.BusinessErrorCode.USER_NOT_FOUND, '用户不存在');
        }
        // 检查是否已经是好友或有待处理的请求
        const existingFriendship = await Friendship_1.Friendship.findOne({
            where: {
                [sequelize_1.Op.or]: [
                    { userId, friendId },
                    { userId: friendId, friendId: userId },
                ],
            },
        });
        if (existingFriendship) {
            if (existingFriendship.status === 'accepted') {
                throw new errors_1.BusinessError(errors_1.BusinessErrorCode.ALREADY_FRIENDS, '你们已经是好友了');
            }
            if (existingFriendship.status === 'pending') {
                throw new errors_1.BusinessError(errors_1.BusinessErrorCode.FRIEND_REQUEST_PENDING, '好友请求待处理');
            }
            if (existingFriendship.status === 'blocked') {
                throw new errors_1.BusinessError(errors_1.BusinessErrorCode.USER_BLOCKED, '无法添加该用户为好友');
            }
        }
        // 创建好友请求(双向记录)
        const friendship1 = await Friendship_1.Friendship.create({
            userId,
            friendId,
            status: 'pending',
            initiatedBy: userId,
            message: message || null,
        });
        // 创建反向记录
        await Friendship_1.Friendship.create({
            userId: friendId,
            friendId: userId,
            status: 'pending',
            initiatedBy: userId,
            message: message || null,
        });
        return friendship1;
    }
    /**
     * 接受好友请求
     */
    async acceptFriendRequest(userId, friendId) {
        const friendship = await Friendship_1.Friendship.findOne({
            where: { userId, friendId, status: 'pending' },
        });
        if (!friendship) {
            throw new errors_1.BusinessError(errors_1.BusinessErrorCode.FRIEND_REQUEST_NOT_FOUND, '好友请求不存在');
        }
        // 只有接收方可以接受请求
        if (friendship.initiatedBy === userId) {
            throw new errors_1.BusinessError(errors_1.BusinessErrorCode.PERMISSION_DENIED, '不能接受自己发送的好友请求');
        }
        // 更新两条记录的状态
        await Friendship_1.Friendship.update({
            status: 'accepted',
            acceptedAt: new Date(),
        }, {
            where: {
                [sequelize_1.Op.or]: [
                    { userId, friendId },
                    { userId: friendId, friendId: userId },
                ],
            },
        });
    }
    /**
     * 拒绝好友请求
     */
    async rejectFriendRequest(userId, friendId) {
        const friendship = await Friendship_1.Friendship.findOne({
            where: { userId, friendId, status: 'pending' },
        });
        if (!friendship) {
            throw new errors_1.BusinessError(errors_1.BusinessErrorCode.FRIEND_REQUEST_NOT_FOUND, '好友请求不存在');
        }
        if (friendship.initiatedBy === userId) {
            throw new errors_1.BusinessError(errors_1.BusinessErrorCode.PERMISSION_DENIED, '不能拒绝自己发送的好友请求');
        }
        // 更新两条记录的状态
        await Friendship_1.Friendship.update({ status: 'rejected' }, {
            where: {
                [sequelize_1.Op.or]: [
                    { userId, friendId },
                    { userId: friendId, friendId: userId },
                ],
            },
        });
    }
    /**
     * 删除好友
     */
    async removeFriend(userId, friendId) {
        await Friendship_1.Friendship.destroy({
            where: {
                [sequelize_1.Op.or]: [
                    { userId, friendId },
                    { userId: friendId, friendId: userId },
                ],
            },
        });
    }
    /**
     * 获取好友列表
     */
    async getFriends(userId) {
        const friendships = await Friendship_1.Friendship.findAll({
            where: {
                userId,
                status: 'accepted',
            },
            include: [
                {
                    model: User_1.User,
                    as: 'friend',
                    attributes: ['id', 'nickname', 'avatarUrl', 'age', 'gender', 'hikingLevel', 'bio'],
                },
            ],
            order: [['acceptedAt', 'DESC']],
        });
        return friendships.map((f) => f.get('friend'));
    }
    /**
     * 获取待处理的好友请求
     */
    async getPendingRequests(userId) {
        const friendships = await Friendship_1.Friendship.findAll({
            where: {
                userId,
                status: 'pending',
                initiatedBy: { [sequelize_1.Op.ne]: userId }, // 不是自己发起的
            },
            include: [
                {
                    model: User_1.User,
                    as: 'friend',
                    attributes: ['id', 'nickname', 'avatarUrl', 'age', 'gender', 'hikingLevel', 'bio'],
                },
            ],
            order: [['createdAt', 'DESC']],
        });
        return friendships;
    }
    /**
     * 搜索用户(按昵称或手机号)
     */
    async searchUsers(keyword, currentUserId) {
        const users = await User_1.User.findAll({
            where: {
                id: { [sequelize_1.Op.ne]: currentUserId },
                [sequelize_1.Op.or]: [
                    { nickname: { [sequelize_1.Op.like]: `%${keyword}%` } },
                    { email: { [sequelize_1.Op.like]: `%${keyword}%` } },
                ],
            },
            attributes: ['id', 'nickname', 'avatarUrl', 'age', 'gender', 'hikingLevel', 'bio'],
            limit: 20,
        });
        return users;
    }
    /**
     * 推荐可能感兴趣的人
     */
    async getRecommendedUsers(userId, limit = 10) {
        // 获取当前用户的偏好
        const userPreference = await UserPreference_1.UserPreference.findOne({ where: { userId } });
        // 获取已经是好友的用户ID
        const friendships = await Friendship_1.Friendship.findAll({
            where: { userId, status: 'accepted' },
            attributes: ['friendId'],
        });
        const friendIds = friendships.map((f) => f.friendId);
        // 查找相似偏好的用户
        const recommendedUsers = await User_1.User.findAll({
            where: {
                id: {
                    [sequelize_1.Op.notIn]: [userId, ...friendIds],
                },
            },
            include: [
                {
                    model: UserPreference_1.UserPreference,
                    where: userPreference
                        ? {
                            preferenceValue: { [sequelize_1.Op.like]: `%${userPreference.preferenceValue}%` },
                        }
                        : {},
                    required: false,
                },
            ],
            attributes: ['id', 'nickname', 'avatarUrl', 'age', 'gender', 'hikingLevel', 'bio'],
            limit,
        });
        return recommendedUsers;
    }
    /**
     * 检查好友关系状态
     */
    async getFriendshipStatus(userId, friendId) {
        const friendship = await Friendship_1.Friendship.findOne({
            where: { userId, friendId },
        });
        return friendship ? friendship.status : null;
    }
}
exports.FriendService = FriendService;
exports.default = new FriendService();
//# sourceMappingURL=FriendService.js.map