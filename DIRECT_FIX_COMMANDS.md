# 生产环境直接执行修复命令

以下命令可以直接复制粘贴到生产服务器执行，无需任何文件：

## 一行执行（自动修复）

```bash
PROJECT_DIR="/var/www/hikingSocialApp" && NGINX_CONF="/etc/nginx/sites-available/default" && NGINX_BACKUP="/etc/nginx/sites-available/default.backup.$(date +%Y%m%d_%H%M%S)" && echo "备份..." && sudo cp "$NGINX_CONF" "$NGINX_BACKUP" && echo "部署..." && sudo cp "$PROJECT_DIR/nginx/hiking-app-single-server.conf" "$NGINX_CONF" && echo "验证..." && sudo nginx -t && echo "重启..." && sudo systemctl restart nginx && echo "✅ 完成"
```

## 分步执行（推荐）

复制以下命令逐个执行：

```bash
# 第 1 步：备份
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup

echo "✅ 备份完成"
```

```bash
# 第 2 步：部署新配置
sudo cp /var/www/hikingSocialApp/nginx/hiking-app-single-server.conf /etc/nginx/sites-available/default

echo "✅ 配置已部署"
```

```bash
# 第 3 步：验证配置
sudo nginx -t

# 预期输出：nginx: configuration file test is successful
```

```bash
# 第 4 步：重启 Nginx
sudo systemctl restart nginx

echo "✅ Nginx 已重启"
```

```bash
# 第 5 步：验证修复

# 测试后端
echo "测试后端..."
curl http://localhost:3000/health

# 测试代理
echo "测试代理..."
curl http://115.190.252.62/health
```

## 完整自动化脚本（粘贴整个脚本到终端）

```bash
bash << 'SCRIPT'
set -e

PROJECT_DIR="/var/www/hikingSocialApp"
NGINX_CONF="/etc/nginx/sites-available/default"
NGINX_BACKUP="/etc/nginx/sites-available/default.backup.$(date +%Y%m%d_%H%M%S)"

echo "🔧 开始修复..."
echo ""

echo "1️⃣  备份 Nginx 配置..."
sudo cp "$NGINX_CONF" "$NGINX_BACKUP"
echo "✅ 备份完成"

echo ""
echo "2️⃣  部署新配置..."
sudo cp "$PROJECT_DIR/nginx/hiking-app-single-server.conf" "$NGINX_CONF"
echo "✅ 配置已部署"

echo ""
echo "3️⃣  验证配置..."
sudo nginx -t || (echo "❌ 配置错误，恢复备份"; sudo cp "$NGINX_BACKUP" "$NGINX_CONF"; exit 1)
echo "✅ 配置验证成功"

echo ""
echo "4️⃣  重启 Nginx..."
sudo systemctl restart nginx
echo "✅ Nginx 已重启"

echo ""
echo "5️⃣  检查后端..."
if pm2 list 2>/dev/null | grep -q "hiking-app-backend"; then
  echo "✅ 后端已运行"
else
  echo "⚠️  启动后端..."
  cd "$PROJECT_DIR/backend"
  pm2 start ecosystem.config.cjs --env production || true
fi

echo ""
echo "============================================"
echo "✅ 修复完成！"
echo "============================================"
echo ""
echo "验证："
echo "curl http://115.190.252.62/health"

SCRIPT
```

## 如果还有问题

```bash
# 检查 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log

# 检查后端是否运行
pm2 list

# 重启后端
cd /var/www/hikingSocialApp/backend
pm2 restart ecosystem.config.cjs --env production

# 查看 Nginx 配置中的代理设置
sudo grep -A 5 "location /api/v1/" /etc/nginx/sites-available/default
```
