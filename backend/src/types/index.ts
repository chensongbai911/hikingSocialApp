// 后端 TypeScript 类型定义

export interface UserAttributes {
  id: number
  email: string
  passwordHash: string
  nickname: string
  avatarUrl?: string
  gender?: 'male' | 'female' | 'other'
  age?: number
  bio?: string
  hikingLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  isActive: boolean
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

export interface ActivityAttributes {
  id: number
  creatorId: number
  title: string
  description: string
  coverImageUrl?: string
  location: string
  latitude?: number
  longitude?: number
  startTime: Date
  endTime: Date
  distance?: number
  difficulty: 'easy' | 'moderate' | 'hard'
  type?: string
  status: 'pending' | 'approved' | 'ongoing' | 'completed' | 'cancelled'
  routeDescription?: string
  equipmentRequired?: string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

export interface ParticipationAttributes {
  id: number
  userId: number
  activityId: number
  status: 'joined' | 'completed' | 'cancelled'
  joinedAt: Date
  completedAt?: Date
  cancelledAt?: Date
  feedback?: string
  rating?: number
  createdAt: Date
  updatedAt: Date
}

export interface UserPreferenceAttributes {
  id: number
  userId: number
  preferenceType: 'time' | 'type' | 'special' | 'distance' | 'interest'
  preferenceValue: string
  createdAt: Date
  updatedAt: Date
}

export interface UserPhotoAttributes {
  id: number
  userId: number
  photoUrl: string
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

export interface JWTPayload {
  userId: number
  email: string
  iat?: number
  exp?: number
}

export interface ApiResponse<T = any> {
  code: number
  message: string
  data?: T
}

export interface PaginatedResponse<T> {
  total: number
  page: number
  pageSize: number
  totalPages: number
  data: T[]
}

export interface RegisterDTO {
  email: string
  nickname: string
  password: string
}

export interface LoginDTO {
  email: string
  password: string
}

export interface CreateActivityDTO {
  title: string
  description: string
  location: string
  startTime: Date
  endTime: Date
  difficulty: 'easy' | 'moderate' | 'hard'
  distance?: number
  type?: string
  routeDescription?: string
  equipmentRequired?: string
  coverImageUrl?: string
}

export interface UpdateActivityDTO {
  title?: string
  description?: string
  location?: string
  startTime?: Date
  endTime?: Date
  difficulty?: 'easy' | 'moderate' | 'hard'
  distance?: number
  type?: string
  routeDescription?: string
  equipmentRequired?: string
  coverImageUrl?: string
  status?: 'pending' | 'approved' | 'ongoing' | 'completed' | 'cancelled'
}

export interface UpdateUserDTO {
  nickname?: string
  avatarUrl?: string
  gender?: 'male' | 'female' | 'other'
  age?: number
  bio?: string
  hikingLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
}

export interface QueryOptions {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
}

export interface ActivityQueryOptions extends QueryOptions {
  difficulty?: string
  status?: string
  searchQuery?: string
  creatorId?: number
  startDate?: Date
  endDate?: Date
}

export interface ErrorResponse {
  statusCode: number
  message: string
  errors?: string[]
}

declare global {
  namespace Express {
    interface Request {
      userId?: number
      user?: UserAttributes
    }
  }
}
