#!/bin/bash

# 添加.js扩展名到所有TypeScript导入中
cd /var/www/hikingSocialApp/backend/src

echo "🔧 修复所有TypeScript导入中的.js扩展名..."

# 为所有.ts/.tsx文件添加.js扩展名到导入中
find . -name "*.ts" -type f | while read file; do
  sed -i "s|from '\([^']*\)'\([^.]\)|from '\1.js'\2|g" "$file"
  sed -i 's|from "\([^"]*\)"\([^.]\)|from "\1.js"\2|g' "$file"
  sed -i "s|import '\([^']*\)'$|import '\1.js'|g" "$file"
  sed -i 's|import "\([^"]*\)"$|import "\1.js"|g' "$file"
done

echo "✅ 已修复所有导入"

echo ""
echo "重新构建..."
npm run build

echo ""
echo "✅ 完成！"
