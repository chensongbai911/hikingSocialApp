const fs = require('fs');
const filePath = './backend/src/controllers/MessageController.ts';

let content = fs.readFileSync(filePath, 'utf8');

// 分行处理
const lines = content.split('\n');
const fixed = lines.map(line => {
  if (line.includes('throw new AppError')) {
    // 提取消息内容（在单引号之间）
    const match = line.match(/throw new AppError\('([^']+)'/);
    if (match) {
      const message = match[1];
      // 根据不同的错误类型进行替换
      if (line.includes('401')) {
        return line.replace(/throw new AppError\([^)]+\)/, "return businessError(res, BusinessErrorCode.UNAUTHORIZED, '未授权访问')");
      } else if (line.includes('400')) {
        return line.replace(/throw new AppError\([^)]+\)/, `return validationError(res, '${message}')`);
      }
    }
  }
  return line;
});

const newContent = fixed.join('\n');
fs.writeFileSync(filePath, newContent, 'utf8');

console.log('✅ 所有 AppError 已修复');

// 验证
const remaining = (newContent.match(/throw new AppError/g) || []).length;
console.log(`剩余 throw new AppError: ${remaining} 处`);
