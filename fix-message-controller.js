const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'backend', 'src', 'controllers', 'MessageController.ts');

// 读取文件
let content = fs.readFileSync(filePath, 'utf-8');

// 替换所有的 throw new AppError
content = content.replace(/throw new AppError\('([^']+)', 401\)/g, "return businessError(res, BusinessErrorCode.UNAUTHORIZED, '$1')");
content = content.replace(/throw new AppError\('([^']+)', 400\)/g, "return validationError(res, '$1')");

// 写回文件
fs.writeFileSync(filePath, content, 'utf-8');

console.log('✅ 已修复所有 AppError 引用');
