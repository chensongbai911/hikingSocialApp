// 上传相关 API
import request from './http'
import type { ApiResponse } from '../types'

interface UploadImageResponse {
  url: string
  thumbnail: string
  width: number
  height: number
  size: number
}

interface UploadAvatarResponse {
  avatar_url: string
  thumbnail_url: string
  width: number
  height: number
}

interface UploadPhotosResponse {
  uploaded: number
  photos: Array<{
    id: string
    photo_url: string
    thumbnail_url: string
    display_order: number
  }>
}

export const uploadApi = {
  /**
   * 上传通用图片
   * POST /upload/image
   */
  async uploadImage(file: File): Promise<ApiResponse<UploadImageResponse>> {
    const formData = new FormData()
    formData.append('image', file)

    return request.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  /**
   * 上传并更新头像
   * POST /upload/avatar
   */
  async uploadAvatar(file: File): Promise<ApiResponse<UploadAvatarResponse>> {
    const formData = new FormData()
    formData.append('avatar', file)

    return request.post('/upload/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  /**
   * 批量上传照片
   * POST /upload/photos
   */
  async uploadPhotos(files: File[]): Promise<ApiResponse<UploadPhotosResponse>> {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('photos', file)
    })

    return request.post('/upload/photos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  /**
   * 上传活动封面
   */
  async uploadActivityCover(file: File): Promise<ApiResponse<UploadImageResponse>> {
    const formData = new FormData()
    formData.append('cover', file)

    return request.post('/upload/activity-cover', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  /**
   * 上传消息图片
   */
  async uploadMessageImage(file: File): Promise<ApiResponse<UploadImageResponse>> {
    const formData = new FormData()
    formData.append('image', file)

    return request.post('/upload/message-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}

export default uploadApi

