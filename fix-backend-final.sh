#!/bin/bash

# ===================================================================
# 🔧 终极修复后端模块导入问题
# ===================================================================

SERVER_IP="${1:-115.190.252.62}"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   🔧 终极修复后端模块导入问题                              ║"
echo "║   服务器: $SERVER_IP"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

ssh root@$SERVER_IP << 'FINAL_FIX'

cd /var/www/hikingSocialApp/backend

echo "🎯 终极修复后端模块导入问题..."
echo ""

# 步骤1: 停止当前服务
echo "1️⃣ 停止当前服务..."
pm2 stop hiking-app-backend || true
pm2 delete hiking-app-backend || true

# 步骤2: 检查构建文件
echo ""
echo "2️⃣ 检查构建文件..."
ls -la dist/ 2>/dev/null || echo "dist目录不存在"

# 步骤3: 使用 ts-node 直接运行 TypeScript
echo ""
echo "3️⃣ 安装运行时依赖..."

# 安装必要的运行时依赖
npm install ts-node typescript @types/node --save-dev

# 步骤4: 创建可靠的启动脚本
echo ""
echo "4️⃣ 创建可靠的启动配置..."

# 创建 ecosystem 配置文件
cat > ecosystem.config.cjs << 'ECOSYSTEM_CONFIG'
module.exports = {
  apps: [{
    name: 'hiking-app-backend',
    script: './src/server.ts',
    interpreter: 'node',
    interpreter_args: '--loader ts-node/esm',
    env: {
      NODE_ENV: 'production',
      USE_API_PREFIX: 'false',
      DATABASE_HOST: 'localhost',
      DATABASE_NAME: 'hiking_social_db',
      DATABASE_USER: 'hiking_user',
      DATABASE_PASSWORD: 'senbochen',
      PORT: '3000',
      API_VERSION: 'v1'
    },
    watch: false,
    instances: 1,
    exec_mode: 'cluster',
    max_memory_restart: '200M',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
ECOSYSTEM_CONFIG

echo "   ✅ ecosystem.config.cjs 已创建"

# 步骤5: 创建 TypeScript 配置
echo ""
echo "5️⃣ 确保 TypeScript 配置..."

# 确保有 tsconfig.json
if [ ! -f "tsconfig.json" ]; then
  cat > tsconfig.json << 'TSCONFIG'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "strict": false,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "resolveJsonModule": true,
    "declaration": false,
    "removeComments": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "forceConsistentCasingInFileNames": true,
    "lib": ["ES2020"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
TSCONFIG
  echo "   ✅ tsconfig.json 已创建"
fi

# 步骤6: 创建日志目录
echo ""
echo "6️⃣ 创建日志目录..."
mkdir -p logs
echo "   ✅ 日志目录已创建"

# 步骤7: 使用新配置启动服务
echo ""
echo "7️⃣ 使用新配置启动服务..."

pm2 start ecosystem.config.cjs
sleep 5

# 检查状态
pm2 list
echo ""

# 步骤8: 验证启动日志
echo ""
echo "8️⃣ 验证启动日志..."
pm2 logs hiking-app-backend --lines 20 --nostream
echo ""

# 步骤9: 测试服务
echo ""
echo "9️⃣ 测试服务..."

# 等待服务完全启动
sleep 10

echo "   测试健康检查..."
HEALTH_RESPONSE=$(curl -s http://localhost:3000/health 2>/dev/null || echo "failed")
if echo "$HEALTH_RESPONSE" | grep -q '"status":"ok"'; then
    echo "   ✅ 后端健康检查正常"
    echo "   响应: $HEALTH_RESPONSE"

    # 测试路由
    echo ""
    echo "   测试路由..."

    # 测试消息路由（无前缀）
    MSG_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/messages/conversations 2>/dev/null)
    echo "   消息路由 (无前缀): $MSG_RESPONSE"

    # 测试用户路由（无前缀）
    USER_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/users/test/detail 2>/dev/null)
    echo "   用户路由 (无前缀): $USER_RESPONSE"

    # 通过 Nginx 测试
    echo ""
    echo "   通过 Nginx 测试..."

    NGINX_MSG=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/v1/messages/conversations 2>/dev/null)
    echo "   Nginx -> 消息接口: $NGINX_MSG"

    NGINX_USER=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/v1/users/test/detail 2>/dev/null)
    echo "   Nginx -> 用户接口: $NGINX_USER"

    # 判断修复状态
    echo ""
    if [ "$NGINX_MSG" = "401" ] && [ "$NGINX_USER" = "401" ]; then
        echo "🎉 修复成功！API路由正常工作 (返回401表示需要认证，路由正确)"
    elif [ "$NGINX_MSG" = "200" ] && [ "$NGINX_USER" = "200" ]; then
        echo "🎉 修复成功！API路由正常工作"
    elif [ "$NGINX_MSG" = "404" ] || [ "$NGINX_USER" = "404" ]; then
        echo "⚠️ 仍有404问题，需要进一步检查"
    else
        echo "ℹ️ API返回状态: 消息=$NGINX_MSG, 用户=$NGINX_USER"
    fi

else
    echo "   ❌ 后端健康检查失败"
    echo "   响应: $HEALTH_RESPONSE"
    echo ""
    echo "   查看错误日志:"
    pm2 logs hiking-app-backend --lines 30 --nostream | tail -20
fi

echo ""
echo "🔟 最终状态报告..."
echo ""
echo "📊 服务状态:"
echo "   - PM2: $(pm2 list | grep hiking-app-backend | awk '{print $10}' | head -1)"
echo "   - 端口: $(netstat -tlnp | grep :3000 | wc -l) 个进程监听3000端口"
echo ""
echo "📊 接口测试结果:"
echo "   - 后端健康检查: $(echo "$HEALTH_RESPONSE" | grep -o '"status":"[^"]*"' 2>/dev/null || echo 'failed')"
echo "   - Nginx -> 消息接口: HTTP $NGINX_MSG"
echo "   - Nginx -> 用户接口: HTTP $NGINX_USER"
echo ""
echo "📋 如需进一步检查:"
echo "   - 查看日志: pm2 logs hiking-app-backend"
echo "   - 查看进程: pm2 monit"
echo "   - 重启服务: pm2 restart hiking-app-backend"
echo ""

FINAL_FIX

echo ""
echo "✅ 终极修复完成！"
echo ""
