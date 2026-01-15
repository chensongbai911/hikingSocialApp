// TypeScript 接口定义

// 后端API响应格式
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp: number
}

export interface PaginatedData<T> {
  items: T[]
  pagination: {
    page: number
    page_size: number
    total: number
    total_pages: number
  }
}

// 用户相关
export interface User {
  id: string
  email: string
  nickname: string
  avatar_url?: string
  gender?: 'male' | 'female' | 'other'
  age?: number
  bio?: string
  hiking_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  is_verified?: boolean
  created_at?: string
  updated_at?: string
  preferences?: UserPreference[]
  photos?: UserPhoto[]
}

export interface UserPreference {
  id: string
  user_id: string
  preference_type: 'hiking_time' | 'activity_type' | 'special_interest' | 'distance_preference' | 'other'
  preference_value: string
  created_at?: string
}

export interface UserPhoto {
  id: string
  user_id: string
  photo_url: string
  thumbnail_url?: string
  display_order: number
  created_at?: string
}

// 活动相关
export interface Activity {
  id: string
  creator_id: string
  title: string
  description: string
  cover_image_url?: string
  photos?: string[] // 照片数组，最多6张
  location: string
  latitude?: number
  longitude?: number
  start_time: string
  end_time: string
  distance?: number
  difficulty: 'easy' | 'moderate' | 'hard'
  activity_type?: string
  status: 'pending' | 'approved' | 'ongoing' | 'completed' | 'cancelled'
  max_participants?: number
  current_participants?: number
  route_description?: string
  equipment_required?: string
  notes?: string
  creator?: User
  participant_count?: number
  is_joined?: boolean
export interface Participant {
  id: string
  user_id: string
  nickname: string
  avatar_url?: string
  hiking_level?: string
  status: 'joined' | 'completed' | 'cancelled'
  joined_at?: string
  rating?: number
  feedback?: string
}

export interface Participation {
  id: string
  user_id: string
  activity_id: string
  status: 'joined' | 'completed' | 'cancelled'
  joined_at: string
  completed_at?: string
  cancelled_at?: string
  feedback?: string
  rating?: number
}

export interface UserPreference {
  id: string
  user_id: string
  preference_type: 'hiking_time' | 'activity_type' | 'special_interest' | 'distance_preference' | 'other'
  preference_value: string
  created_at?: string
}

export interface UserPhoto {
  id: string
  user_id: string
  photo_url: string
  thumbnail_url?: string
  display_order: number
  created_at?: string
} feedback ?: string
rating ?: number
}

export interface UserPreference {
  id: number
  userId: number
  preferenceType: 'time' | 'type' | 'special' | 'distance' | 'interest'
  preferenceValue: string
}

export interface UserPhoto {
  id: number
  userId: number
  photoUrl: string
  sortOrder: number
}
// 消息相关
export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  is_read: boolean
  created_at: string
}

export interface Conversation {
  id: string
  name: string
  avatar_url: string
  last_message: string
  last_message_time: string
  unread_count?: number
}

// 报名申请相关
export interface Application {
  application_id: string
  user_id: string
  activity_id: string
  status: 'pending' | 'approved' | 'rejected'
  message?: string
  reviewed_at?: string
  reviewed_by?: string
  created_at: string
  applicant?: User
  activity?: Activity
  reviewer?: User
}

export interface CreateApplicationData {
  activity_id: string
  message?: string
}

export interface ReviewApplicationData {
  action: 'approve' | 'reject'
}

// 好友系统相关
export interface Friendship {
  friendship_id: string
  user_id: string
  friend_id: string
  status: 'pending' | 'accepted' | 'rejected' | 'blocked'
  initiated_by: string
  message?: string
  accepted_at?: string
  created_at: string
  friend?: User
}

export interface FriendRequest {
  friendship_id: string
  user_id: string
  nickname: string
  avatar_url?: string
  bio?: string
  hiking_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  message?: string
  created_at: string
}

export interface SendFriendRequestData {
  friend_id: string
  message?: string
}

export interface RecommendedUser {
  user_id: string
  nickname: string
  avatar_url?: string
  bio?: string
  hiking_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  common_preferences?: string[]
  mutual_friends_count?: number
}

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp: number
}

export interface PaginatedData<T> {
  items: T[]
  pagination: {
    page: number
    page_size: number
    total: number
// 请求数据类型
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  nickname: string
  password: string
  gender?: 'male' | 'female' | 'other'
  age?: number
  hiking_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
}

export interface CreateActivityData {
  title: string
  description: string
  location: string
  start_time: string
  end_time?: string
  difficulty: 'easy' | 'moderate' | 'hard'
  distance?: number
  activity_type?: string
  max_participants?: number
  route_description?: string
  equipment_required?: string
  notes?: string
  cover_image_url?: string
  photos?: string[] // 照片数组，最多6张
}

export interface UpdateActivityData {
  title?: string
  description?: string
  location?: string
  start_time?: string
  end_time?: string
  difficulty?: 'easy' | 'moderate' | 'hard'
  status?: 'pending' | 'approved' | 'ongoing' | 'completed' | 'cancelled'
  max_participants?: number
  cover_image_url?: string
  photos?: string[] // 照片数组，最多6张
}

// 过滤和查询选项
export interface FilterOptions {
  page?: number
  page_size?: number
  difficulty?: 'easy' | 'moderate' | 'hard'
  status?: 'pending' | 'approved' | 'ongoing' | 'completed' | 'cancelled'
  keyword?: string
  location?: string
  start_date?: string
  end_date?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface DiscoveryFilters {
  page?: number
  page_size?: number
  keyword?: string
  difficulty?: string
  location?: string
  gender?: 'male' | 'female' | 'other'
  hiking_level?: string
}
cover_image_url ?: string
}

export interface UpdateProfileData {
  nickname?: string
  gender?: 'male' | 'female' | 'other'
  age?: number
  hiking_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  bio?: string
  avatar_url?: string
}

export interface UpdatePreferencesData {
  preferences: Array<{
    type: string
    value: string
  }>
}

export interface FilterOptions {
  page?: number
  limit?: number
  difficulty?: string
  status?: string
  searchQuery?: string
  sortBy?: string
}
