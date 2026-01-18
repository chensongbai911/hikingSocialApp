"use strict";
// 验证工具函数
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = void 0;
exports.validateEmail = validateEmail;
exports.validatePassword = validatePassword;
exports.validateNickname = validateNickname;
exports.validateAge = validateAge;
exports.validatePhoneNumber = validatePhoneNumber;
exports.validateDateRange = validateDateRange;
exports.sanitizeHtml = sanitizeHtml;
exports.validateCoordinates = validateCoordinates;
exports.validateRating = validateRating;
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
/**
 * 验证邮箱格式
 */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
/**
 * 验证密码强度
 */
function validatePassword(password) {
    if (password.length < 8) {
        return { valid: false, message: '密码长度至少为8位' };
    }
    if (!/[a-zA-Z]/.test(password)) {
        return { valid: false, message: '密码必须包含字母' };
    }
    if (!/\d/.test(password)) {
        return { valid: false, message: '密码必须包含数字' };
    }
    return { valid: true };
}
/**
 * 验证昵称
 */
function validateNickname(nickname) {
    return nickname.length >= 2 && nickname.length <= 20;
}
/**
 * 验证年龄
 */
function validateAge(age) {
    return age >= 18 && age <= 100;
}
/**
 * 验证手机号（中国大陆）
 */
function validatePhoneNumber(phone) {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
}
/**
 * 验证日期范围
 */
function validateDateRange(startDate, endDate) {
    return startDate < endDate;
}
/**
 * 清理和转义 HTML
 */
function sanitizeHtml(html) {
    return html
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}
/**
 * 验证经纬度
 */
function validateCoordinates(latitude, longitude) {
    return (latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180);
}
/**
 * 验证评分
 */
function validateRating(rating) {
    return rating >= 0 && rating <= 5;
}
//# sourceMappingURL=validation.js.map