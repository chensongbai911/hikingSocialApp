// 图片上传工具函数
import { userApi } from '@/api'
import type { UserPhoto } from '@/types'

/**
 * 将文件转换为 Base64
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string)
      } else {
        reject(new Error('读取文件失败'))
      }
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * 上传头像
 * @param file 图片文件
 * @returns 上传后的图片URL
 */
export const uploadAvatar = async (file: File): Promise<string> => {
  // 先转换为 Base64 预览
  const base64 = await fileToBase64(file)

  // TODO: 如果需要真实的文件上传，可以使用 FormData
  // const formData = new FormData()
  // formData.append('avatar', file)
  // const response = await userApi.uploadAvatar(formData)
  // return response.data.avatar_url

  // 目前直接返回 Base64，后端支持存储 Base64 格式
  return base64
}

/**
 * 上传照片到相册
 * @param file 图片文件
 * @returns 上传后的照片对象
 */
export const uploadPhoto = async (file: File): Promise<UserPhoto> => {
  // 先转换为 Base64
  const base64 = await fileToBase64(file)

  // 调用API保存到数据库
  const response = await userApi.addPhoto(base64)

  if (response.code === 200 && response.data) {
    return response.data
  }

  throw new Error(response.message || '上传照片失败')
}

/**
 * 批量上传照片
 * @param files 图片文件数组
 * @returns 上传后的照片对象数组
 */
export const uploadPhotos = async (files: File[]): Promise<UserPhoto[]> => {
  const uploadPromises = files.map(file => uploadPhoto(file))
  return Promise.all(uploadPromises)
}

/**
 * 压缩图片
 * @param file 图片文件
 * @param maxWidth 最大宽度
 * @param maxHeight 最大高度
 * @param quality 压缩质量 0-1
 * @returns 压缩后的 Base64
 */
export const compressImage = (
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.8
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // 计算压缩后的尺寸
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = (height * maxWidth) / width
            width = maxWidth
          } else {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)

        // 转换为 Base64
        const compressed = canvas.toDataURL('image/jpeg', quality)
        resolve(compressed)
      }
      img.onerror = reject
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
