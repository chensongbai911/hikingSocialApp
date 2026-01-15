import { Friendship } from '../models/Friendship';
import { User } from '../models/User';
import { UserPreference } from '../models/UserPreference';
import { BusinessError, BusinessErrorCode } from '../utils/errors';
import { Op } from 'sequelize';
export class FriendService {
    /**
     * 发送好友请求
     */
    async sendFriendRequest(userId, friendId, message) {
        if (userId === friendId) {
            throw new BusinessError(BusinessErrorCode.INVALID_REQUEST, '不能添加自己为好友');
        }
        // 检查对方用户是否存在
        const friendUser = await User.findByPk(friendId);
        if (!friendUser) {
            throw new BusinessError(BusinessErrorCode.USER_NOT_FOUND, '用户不存在');
        }
        // 检查是否已经是好友或有待处理的请求
        const existingFriendship = await Friendship.findOne({
            where: {
                [Op.or]: [
                    { userId, friendId },
                    { userId: friendId, friendId: userId },
                ],
            },
        });
        if (existingFriendship) {
            if (existingFriendship.status === 'accepted') {
                throw new BusinessError(BusinessErrorCode.ALREADY_FRIENDS, '你们已经是好友了');
            }
            if (existingFriendship.status === 'pending') {
                throw new BusinessError(BusinessErrorCode.FRIEND_REQUEST_PENDING, '好友请求待处理');
            }
            if (existingFriendship.status === 'blocked') {
                throw new BusinessError(BusinessErrorCode.USER_BLOCKED, '无法添加该用户为好友');
            }
        }
        // 创建好友请求(双向记录)
        const friendship1 = await Friendship.create({
            userId,
            friendId,
            status: 'pending',
            initiatedBy: userId,
            message: message || null,
        });
        // 创建反向记录
        await Friendship.create({
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
        const friendship = await Friendship.findOne({
            where: { userId, friendId, status: 'pending' },
        });
        if (!friendship) {
            throw new BusinessError(BusinessErrorCode.FRIEND_REQUEST_NOT_FOUND, '好友请求不存在');
        }
        // 只有接收方可以接受请求
        if (friendship.initiatedBy === userId) {
            throw new BusinessError(BusinessErrorCode.PERMISSION_DENIED, '不能接受自己发送的好友请求');
        }
        // 更新两条记录的状态
        await Friendship.update({
            status: 'accepted',
            acceptedAt: new Date(),
        }, {
            where: {
                [Op.or]: [
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
        const friendship = await Friendship.findOne({
            where: { userId, friendId, status: 'pending' },
        });
        if (!friendship) {
            throw new BusinessError(BusinessErrorCode.FRIEND_REQUEST_NOT_FOUND, '好友请求不存在');
        }
        if (friendship.initiatedBy === userId) {
            throw new BusinessError(BusinessErrorCode.PERMISSION_DENIED, '不能拒绝自己发送的好友请求');
        }
        // 更新两条记录的状态
        await Friendship.update({ status: 'rejected' }, {
            where: {
                [Op.or]: [
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
        await Friendship.destroy({
            where: {
                [Op.or]: [
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
        const friendships = await Friendship.findAll({
            where: {
                userId,
                status: 'accepted',
            },
            include: [
                {
                    model: User,
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
        const friendships = await Friendship.findAll({
            where: {
                userId,
                status: 'pending',
                initiatedBy: { [Op.ne]: userId }, // 不是自己发起的
            },
            include: [
                {
                    model: User,
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
        const users = await User.findAll({
            where: {
                id: { [Op.ne]: currentUserId },
                [Op.or]: [
                    { nickname: { [Op.like]: `%${keyword}%` } },
                    { email: { [Op.like]: `%${keyword}%` } },
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
        const userPreference = await UserPreference.findOne({ where: { userId } });
        // 获取已经是好友的用户ID
        const friendships = await Friendship.findAll({
            where: { userId, status: 'accepted' },
            attributes: ['friendId'],
        });
        const friendIds = friendships.map((f) => f.friendId);
        // 查找相似偏好的用户
        const recommendedUsers = await User.findAll({
            where: {
                id: {
                    [Op.notIn]: [userId, ...friendIds],
                },
            },
            include: [
                {
                    model: UserPreference,
                    where: userPreference
                        ? {
                            [Op.or]: [
                                { preferredDifficultyLevels: { [Op.like]: `%${userPreference.preferredDifficultyLevels}%` } },
                                { activityTypes: { [Op.like]: `%${userPreference.activityTypes}%` } },
                            ],
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
        const friendship = await Friendship.findOne({
            where: { userId, friendId },
        });
        return friendship ? friendship.status : null;
    }
}
export default new FriendService();
//# sourceMappingURL=FriendService.js.map