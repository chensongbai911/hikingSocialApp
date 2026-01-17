/**
 * URL 工具函数
 */
/**
 * 将相对路径转换为完整URL
 * @param path 文件路径（可能是相对路径或完整URL）
 * @returns 完整URL或null
 */
export declare function getFullUrl(path: string | null | undefined): string | null;
/**
 * 批量处理URL数组
 * @param items 包含URL字段的对象数组
 * @param urlField URL字段名
 * @returns 处理后的数组
 */
export declare function processUrls<T extends Record<string, any>>(items: T[], urlField: keyof T): T[];
//# sourceMappingURL=urlHelper.d.ts.map