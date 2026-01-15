import http from './http'

export interface Destination {
  id: number
  name: string
  description?: string
  area: string
  district?: string
  latitude: number
  longitude: number
  difficulty: 'easy' | 'moderate' | 'hard'
  distance?: number
  elevation_gain?: number
  cover_image?: string
  photos?: string[]
  popularity_score: number
  visit_count: number
  activity_count: number
  rating: number
  tags?: string
  address?: string
  best_season?: string
  user_distance?: number
  is_favorited?: boolean
}

export interface DestinationFilters {
  keyword?: string
  area?: string
  difficulty?: string
  minDistance?: number
  maxDistance?: number
  sortBy?: 'distance' | 'popularity' | 'rating' | 'activity_count'
  latitude?: number
  longitude?: number
  page?: number
  pageSize?: number
}

export const destinationApi = {
  // 获取目的地列表
  getDestinations: (filters?: DestinationFilters) => {
    return http.get<{
      destinations: Destination[]
      pagination: {
        page: number
        pageSize: number
        total: number
        totalPages: number
      }
    }>('/destinations', { params: filters })
  },

  // 获取目的地详情
  getDestinationById: (id: number) => {
    return http.get<Destination>(`/destinations/${id}`)
  },

  // 获取热门目的地
  getPopularDestinations: (limit?: number) => {
    return http.get<Destination[]>('/destinations/popular', { params: { limit } })
  },

  // 获取附近目的地
  getNearbyDestinations: (latitude: number, longitude: number, radius?: number, limit?: number) => {
    return http.get<Destination[]>('/destinations/nearby', {
      params: { latitude, longitude, radius, limit }
    })
  },

  // 记录搜索
  recordSearch: (keyword?: string, destinationId?: number) => {
    return http.post('/destinations/search/record', { keyword, destinationId })
  },

  // 获取搜索历史
  getSearchHistory: (limit?: number) => {
    return http.get<string[]>('/destinations/search/history', { params: { limit } })
  },

  // 收藏/取消收藏
  toggleFavorite: (id: number) => {
    return http.post<{ isFavorited: boolean }>(`/destinations/${id}/favorite`)
  },

  // 获取收藏列表
  getFavorites: () => {
    return http.get<Destination[]>('/destinations/favorites/list')
  }
}
