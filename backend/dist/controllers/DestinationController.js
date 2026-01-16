import DestinationService from '../services/DestinationService';
export class DestinationController {
    // 获取目的地列表
    async getDestinations(req, res) {
        try {
            const userId = req.user?.id;
            const { keyword, area, difficulty, minDistance, maxDistance, sortBy, latitude, longitude, page = 1, pageSize = 20, } = req.query;
            const filters = {
                keyword: keyword,
                area: area,
                difficulty: difficulty,
                minDistance: minDistance ? Number(minDistance) : undefined,
                maxDistance: maxDistance ? Number(maxDistance) : undefined,
                sortBy: sortBy,
                latitude: latitude ? Number(latitude) : undefined,
                longitude: longitude ? Number(longitude) : undefined,
                limit: Number(pageSize),
                offset: (Number(page) - 1) * Number(pageSize),
            };
            const { destinations, total } = await DestinationService.getDestinations(filters, userId);
            res.json({
                code: 200,
                message: 'Success',
                data: {
                    destinations,
                    pagination: {
                        page: Number(page),
                        pageSize: Number(pageSize),
                        total,
                        totalPages: Math.ceil(total / Number(pageSize)),
                    },
                },
            });
        }
        catch (error) {
            console.error('Error in getDestinations:', error);
            res.status(500).json({
                code: 500,
                message: '获取目的地列表失败',
                error: error.message,
            });
        }
    }
    // 获取目的地详情
    async getDestinationById(req, res) {
        try {
            const userId = req.user?.id;
            const { id } = req.params;
            const destination = await DestinationService.getDestinationById(Number(id), userId);
            if (!destination) {
                return res.status(404).json({
                    code: 404,
                    message: '目的地不存在',
                });
            }
            res.json({
                code: 200,
                message: 'Success',
                data: destination,
            });
        }
        catch (error) {
            console.error('Error in getDestinationById:', error);
            res.status(500).json({
                code: 500,
                message: '获取目的地详情失败',
                error: error.message,
            });
        }
    }
    // 获取热门目的地
    async getPopularDestinations(req, res) {
        try {
            const userId = req.user?.id;
            const { limit = 10 } = req.query;
            const destinations = await DestinationService.getPopularDestinations(Number(limit), userId);
            res.json({
                code: 200,
                message: 'Success',
                data: destinations,
            });
        }
        catch (error) {
            console.error('Error in getPopularDestinations:', error);
            res.status(500).json({
                code: 500,
                message: '获取热门目的地失败',
                error: error.message,
            });
        }
    }
    // 获取附近目的地
    async getNearbyDestinations(req, res) {
        try {
            const userId = req.user?.id;
            const { latitude, longitude, radius = 50, limit = 10 } = req.query;
            if (!latitude || !longitude) {
                return res.status(400).json({
                    code: 400,
                    message: '缺少位置参数',
                });
            }
            const destinations = await DestinationService.getNearbyDestinations(Number(latitude), Number(longitude), Number(radius), Number(limit), userId);
            res.json({
                code: 200,
                message: 'Success',
                data: destinations,
            });
        }
        catch (error) {
            console.error('Error in getNearbyDestinations:', error);
            res.status(500).json({
                code: 500,
                message: '获取附近目的地失败',
                error: error.message,
            });
        }
    }
    // 记录搜索
    async recordSearch(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    code: 401,
                    message: '未登录',
                });
            }
            const { keyword, destinationId } = req.body;
            await DestinationService.addSearchHistory(userId, keyword, destinationId);
            res.json({
                code: 200,
                message: 'Success',
            });
        }
        catch (error) {
            console.error('Error in recordSearch:', error);
            res.status(500).json({
                code: 500,
                message: '记录搜索失败',
                error: error.message,
            });
        }
    }
    // 获取搜索历史
    async getSearchHistory(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    code: 401,
                    message: '未登录',
                });
            }
            const { limit = 10 } = req.query;
            const history = await DestinationService.getSearchHistory(userId, Number(limit));
            res.json({
                code: 200,
                message: 'Success',
                data: history,
            });
        }
        catch (error) {
            console.error('Error in getSearchHistory:', error);
            res.status(500).json({
                code: 500,
                message: '获取搜索历史失败',
                error: error.message,
            });
        }
    }
    // 收藏/取消收藏
    async toggleFavorite(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    code: 401,
                    message: '未登录',
                });
            }
            const { id } = req.params;
            const isFavorited = await DestinationService.toggleFavorite(userId, Number(id));
            res.json({
                code: 200,
                message: isFavorited ? '收藏成功' : '取消收藏成功',
                data: { isFavorited },
            });
        }
        catch (error) {
            console.error('Error in toggleFavorite:', error);
            res.status(500).json({
                code: 500,
                message: '操作失败',
                error: error.message,
            });
        }
    }
    // 获取收藏列表
    async getFavorites(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    code: 401,
                    message: '未登录',
                });
            }
            const destinations = await DestinationService.getFavoriteDestinations(userId);
            res.json({
                code: 200,
                message: 'Success',
                data: destinations,
            });
        }
        catch (error) {
            console.error('Error in getFavorites:', error);
            res.status(500).json({
                code: 500,
                message: '获取收藏列表失败',
                error: error.message,
            });
        }
    }
}
export default new DestinationController();
//# sourceMappingURL=DestinationController.js.map