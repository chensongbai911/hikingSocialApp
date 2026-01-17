# 🚀 快速修复指南 - 生产环境 API 404

## 问题
生产环境消息和用户接口返回 404

## 根本原因
1. ❌ 生产环境用 `DB_HOST=115.190.252.62` 连接数据库失败
2. ❌ Nginx 代理导致双重路径前缀

## 💨 快速修复 (2 分钟)

### 方式 A: 自动脚本 (推荐)
```bash
# 在本地运行
./fix-production-apis.sh

# 或指定服务器
./fix-production-apis.sh 115.190.252.62
```

### 方式 B: 手动修复

#### Step 1: SSH 登录
```bash
ssh root@115.190.252.62
```

#### Step 2: 修复环境变量 (关键!)
```bash
cd /var/www/hikingSocialApp/backend

# 把 DB_HOST 改为 localhost
sed -i 's/DB_HOST=.*/DB_HOST=localhost/g' .env

# 验证修改
grep DB_HOST .env
# 应该显示: DB_HOST=localhost
```

#### Step 3: 修复 Nginx
```bash
# 修改 proxy_pass 配置
sudo sed -i 's|proxy_pass http://localhost:3000/api/v1/;|proxy_pass http://localhost:3000/;|g' \
  /etc/nginx/sites-available/default

# 验证 Nginx 配置
sudo nginx -t
# 应该显示: successful

# 重新加载 Nginx
sudo systemctl reload nginx
```

#### Step 4: 重新启动后端
```bash
pm2 restart hiking-app-backend
sleep 3

# 查看是否启动成功
pm2 logs hiking-app-backend --lines 30 --nostream
```

## ✅ 验证修复成功

```bash
# 1. 检查后端是否运行
pm2 list | grep hiking-app-backend
# 应该显示 online 状态

# 2. 测试健康检查
curl http://localhost:3000/health
# 应该返回: {"status":"ok",...}

# 3. 测试 Nginx 代理
curl http://115.190.252.62/health
# 应该返回: {"status":"ok",...}

# 4. 测试 API 端点
curl http://115.190.252.62/api/v1/
# 应该返回: {"message":"Hiking Social App API",...}
```

## 📋 关键信息

| 配置项 | 原值 | 新值 | 说明 |
|------|------|------|------|
| DB_HOST | 115.190.252.62 | localhost | 数据库本地连接 |
| Nginx proxy_pass | .../api/v1/ | .../ | 去掉前缀 |
| USE_API_PREFIX | N/A | false | Express 不添加前缀 |

## 🔍 如果还是不行

### 检查 1: 数据库连接
```bash
mysql -h localhost -u hiking_user -psenbochen
SELECT 1;
exit;
```

### 检查 2: 后端日志
```bash
pm2 logs hiking-app-backend --lines 100 --nostream
# 查找 "error" 或 "failed" 关键字
```

### 检查 3: Nginx 日志
```bash
sudo tail -50 /var/log/nginx/error.log
```

### 检查 4: 端口监听
```bash
netstat -tlnp | grep 3000
# 应该显示 Node.js 监听 3000
```

## 💡 预期结果

修复完成后：
- ✅ `/api/v1/messages/conversations` 返回 200 OK
- ✅ `/api/v1/users/user-007/detail` 返回 200 OK
- ✅ 前端可以正常加载消息
- ✅ WebSocket 连接正常

---

**文档**: PRODUCTION_API_FIX_SUMMARY_2026_01_17.md
**脚本**: fix-production-apis.sh

