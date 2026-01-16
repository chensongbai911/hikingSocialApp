/**
 * 格式化日期为字符串
 */
export declare function formatDate(date: Date, format?: string): string;
/**
 * 格式化文件大小
 */
export declare function formatFileSize(bytes: number): string;
/**
 * 格式化数字为货币
 */
export declare function formatCurrency(amount: number, currency?: string): string;
/**
 * 生成随机字符串
 */
export declare function generateRandomString(length?: number): string;
/**
 * 生成唯一 ID
 */
export declare function generateUniqueId(): string;
/**
 * 将字符串转换为 slug
 */
export declare function slugify(text: string): string;
/**
 * 截断字符串
 */
export declare function truncate(str: string, length: number, suffix?: string): string;
/**
 * 深度克隆对象
 */
export declare function deepClone<T>(obj: T): T;
/**
 * 延迟执行
 */
export declare function sleep(ms: number): Promise<void>;
/**
 * 重试函数
 */
export declare function retry<T>(fn: () => Promise<T>, retries?: number, delay?: number): Promise<T>;
//# sourceMappingURL=helpers.d.ts.map