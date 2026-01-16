const fs = require('fs');
const filePath = './backend/src/controllers/MessageController.ts';

let content = fs.readFileSync(filePath, 'utf8');

// 修复所有的 AppError
content = content.replace(/throw new AppError\([^)]+401\)/g, "return businessError(res, BusinessErrorCode.UNAUTHORIZED, '未授权访问')");
content = content.replace(/throw new AppError\('缺少目标用户ID', 400\)/g, "return validationError(res, '缺少目标用户ID')");
content = content.replace(/throw new AppError\('不能与自己创建对话', 400\)/g, "return validationError(res, '不能与自己创建对话')");
content = content.replace(/throw new AppError\('无效的对话ID', 400\)/g, "return validationError(res, '无效的对话ID')");
content = content.replace(/throw new AppError\('消息内容不能为空', 400\)/g, "return validationError(res, '消息内容不能为空')");
content = content.replace(/throw new AppError\('无效的消息类型', 400\)/g, "return validationError(res, '无效的消息类型')");
content = content.replace(/throw new AppError\('文本消息长度不能超过5000字符', 400\)/g, "return validationError(res, '文本消息长度不能超过5000字符')");
content = content.replace(/throw new AppError\('无效的消息ID', 400\)/g, "return validationError(res, '无效的消息ID')");
content = content.replace(/throw new AppError\('缺少搜索关键词', 400\)/g, "return validationError(res, '缺少搜索关键词')");
content = content.replace(/throw new AppError\('搜索关键词长度不能超过100个字符', 400\)/g, "return validationError(res, '搜索关键词长度不能超过100个字符')");

fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ MessageController 已修复完成');

// 验证
const remaining = (content.match(/AppError/g) || []).length;
console.log(`剩余 AppError 引用: ${remaining} 处`);
