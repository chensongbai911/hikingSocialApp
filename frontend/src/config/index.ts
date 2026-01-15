// 应用配置
export const config = {
  // API 基础URL
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',

  // 上传文件的基础URL（用于拼接图片路径）
  uploadBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',

  // 获取完整的图片URL
  getImageUrl: (path: string | undefined | null): string => {
    if (!path) return ''
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path
    }
    return `${config.uploadBaseUrl}${path.startsWith('/') ? '' : '/'}${path}`
  }
}
