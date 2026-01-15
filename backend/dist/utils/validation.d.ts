export declare class ValidationError extends Error {
    constructor(message: string);
}
/**
 * 验证邮箱格式
 */
export declare function validateEmail(email: string): boolean;
/**
 * 验证密码强度
 */
export declare function validatePassword(password: string): {
    valid: boolean;
    message?: string;
};
/**
 * 验证昵称
 */
export declare function validateNickname(nickname: string): boolean;
/**
 * 验证年龄
 */
export declare function validateAge(age: number): boolean;
/**
 * 验证手机号（中国大陆）
 */
export declare function validatePhoneNumber(phone: string): boolean;
/**
 * 验证日期范围
 */
export declare function validateDateRange(startDate: Date, endDate: Date): boolean;
/**
 * 清理和转义 HTML
 */
export declare function sanitizeHtml(html: string): string;
/**
 * 验证经纬度
 */
export declare function validateCoordinates(latitude: number, longitude: number): boolean;
/**
 * 验证评分
 */
export declare function validateRating(rating: number): boolean;
//# sourceMappingURL=validation.d.ts.map