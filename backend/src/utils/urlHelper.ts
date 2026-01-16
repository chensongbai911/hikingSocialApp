/**
 * URL 工具函数
 */

/**
 * 将相对路径转换为完整URL
 * @param path 文件路径（可能是相对路径或完整URL）
 * @returns 完整URL或null
 */
export function getFullUrl(path: string | null | undefined): string | null {
  if (!path) return null;

  // 如果已经是完整URL，直接返回
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // 获取基础URL
  const baseUrl = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;

  // 确保路径以 / 开头
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
}

/**
 * 批量处理URL数组
 * @param items 包含URL字段的对象数组
 * @param urlField URL字段名
 * @returns 处理后的数组
 */
export function processUrls<T extends Record<string, any>>(
  items: T[],
  urlField: keyof T
): T[] {
  return items.map(item => ({
    ...item,
    [urlField]: getFullUrl(item[urlField] as string)
  }));
}
