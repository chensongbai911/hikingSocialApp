"use strict";
// 格式化工具函数
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDate = formatDate;
exports.formatFileSize = formatFileSize;
exports.formatCurrency = formatCurrency;
exports.generateRandomString = generateRandomString;
exports.generateUniqueId = generateUniqueId;
exports.slugify = slugify;
exports.truncate = truncate;
exports.deepClone = deepClone;
exports.sleep = sleep;
exports.retry = retry;
/**
 * 格式化日期为字符串
 */
function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return format
        .replace('YYYY', String(year))
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
}
/**
 * 格式化文件大小
 */
function formatFileSize(bytes) {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
/**
 * 格式化数字为货币
 */
function formatCurrency(amount, currency = 'CNY') {
    return new Intl.NumberFormat('zh-CN', {
        style: 'currency',
        currency,
    }).format(amount);
}
/**
 * 生成随机字符串
 */
function generateRandomString(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
/**
 * 生成唯一 ID
 */
function generateUniqueId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
/**
 * 将字符串转换为 slug
 */
function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
}
/**
 * 截断字符串
 */
function truncate(str, length, suffix = '...') {
    if (str.length <= length) {
        return str;
    }
    return str.substring(0, length) + suffix;
}
/**
 * 深度克隆对象
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    if (obj instanceof Array) {
        const clonedArr = [];
        obj.forEach((item) => {
            clonedArr.push(deepClone(item));
        });
        return clonedArr;
    }
    if (obj instanceof Object) {
        const clonedObj = {};
        Object.keys(obj).forEach((key) => {
            clonedObj[key] = deepClone(obj[key]);
        });
        return clonedObj;
    }
    return obj;
}
/**
 * 延迟执行
 */
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
/**
 * 重试函数
 */
async function retry(fn, retries = 3, delay = 1000) {
    try {
        return await fn();
    }
    catch (error) {
        if (retries <= 0) {
            throw error;
        }
        await sleep(delay);
        return retry(fn, retries - 1, delay);
    }
}
//# sourceMappingURL=helpers.js.map