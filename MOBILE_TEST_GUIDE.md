# 📱 手机测试指南 - iOS/Android Web 版本

**生成时间**: 2026-01-15
**适用版本**: v1.1.0 (Web 版本)

---

## 🎯 快速开始：在 iPhone 上测试

### 步骤 1: 启动应用

```bash
# 1. 启动后端服务
cd backend
npm run dev
# 后端运行在 http://localhost:3000

# 2. 启动前端服务 (已配置外部访问)
cd frontend
npm run dev
# 前端运行在 http://0.0.0.0:5173
```

### 步骤 2: 查找电脑 IP 地址

#### Windows PowerShell
```powershell
ipconfig

# 查找输出中的 "IPv4 地址"
# 示例输出：
#   无线局域网适配器 WLAN:
#      IPv4 地址 . . . . . . . . : 192.168.1.100
```

#### Mac/Linux
```bash
ifconfig | grep inet

# 或者
ip addr show
```

**记住这个 IP 地址**，例如: `192.168.1.100`

### 步骤 3: 连接同一 WiFi

确保：
- ✅ 电脑连接到 WiFi (例如: "家庭WiFi")
- ✅ iPhone 连接到**同一个** WiFi
- ✅ 两者在同一局域网内

### 步骤 4: iPhone 访问应用

1. 打开 iPhone 的 **Safari 浏览器**
2. 在地址栏输入:
   ```
   http://192.168.1.100:5173
   ```
   (替换为你的实际 IP 地址)

3. 点击访问

**🎉 成功！** 你现在可以在 iPhone 上测试应用了

---

## 📱 添加到主屏幕 (可选)

### iOS Safari 添加到主屏幕

1. 在 Safari 中打开应用
2. 点击底部的 **分享** 按钮 (方框+向上箭头)
3. 向下滑动，选择 **"添加到主屏幕"**
4. 输入应用名称，例如 "徒步社交"
5. 点击 **"添加"**

**效果**:
- ✅ 桌面上出现应用图标
- ✅ 点击图标直接打开应用
- ✅ 全屏显示 (无浏览器地址栏)
- ⚠️ 本质仍是 Web 应用，但体验更接近原生

### Android Chrome 添加到主屏幕

1. 在 Chrome 中打开应用
2. 点击右上角 **菜单** (三个点)
3. 选择 **"添加到主屏幕"**
4. 输入应用名称
5. 点击 **"添加"**

---

## 🐛 常见问题排查

### 问题 1: 无法访问 - 连接超时

**可能原因**:
- 手机和电脑不在同一 WiFi
- 防火墙阻止了端口 5173
- IP 地址错误

**解决方案**:

#### 检查 WiFi 连接
```
手机和电脑必须连接同一个 WiFi！
不能是:
- 电脑连有线，手机连 WiFi
- 电脑连 WiFi A，手机连 WiFi B
- 手机使用移动数据
```

#### 关闭 Windows 防火墙 (临时)
```powershell
# 打开 PowerShell (管理员)
# 允许 5173 端口
New-NetFirewallRule -DisplayName "Vite Dev Server" -Direction Inbound -Protocol TCP -LocalPort 5173 -Action Allow
```

#### 或者手动配置防火墙
1. 搜索 "Windows Defender 防火墙"
2. 点击 "允许应用通过防火墙"
3. 找到 "Node.js" 或 "vite"
4. 勾选 "专用" 和 "公用"

#### 验证 IP 地址
```powershell
# 确认你的 IP
ipconfig

# 测试电脑本身能否访问
curl http://localhost:5173
```

### 问题 2: 可以访问，但接口报错

**现象**:
- 页面能打开
- 但登录/加载数据失败
- 控制台显示 API 错误

**原因**:
- 前端配置的 API 地址是 `localhost:3000`
- 手机无法访问电脑的 `localhost`

**解决方案**:

#### 方法 1: 修改后端允许跨域 (推荐)

```typescript
// backend/src/server.ts
app.use(cors({
  origin: '*', // 允许所有来源 (仅开发环境)
  credentials: true
}))
```

后端 API 会通过 Vite 代理自动转发，无需额外配置。

#### 方法 2: 修改前端 API 配置 (备选)

```typescript
// frontend/.env.development
VITE_API_BASE_URL=http://192.168.1.100:3000
```

```typescript
// frontend/src/api/index.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
```

**注意**: 这样会绕过 Vite 代理，需要后端配置 CORS。

### 问题 3: 地图不显示

**原因**:
- 高德地图 API Key 有域名限制
- IP 地址未在白名单中

**解决方案**:

#### 方法 1: 使用 localhost 测试
- 在电脑浏览器测试地图功能
- 手机端暂时跳过地图相关功能

#### 方法 2: 配置高德地图白名单
1. 登录 [高德开放平台](https://console.amap.com/)
2. 进入 "应用管理" → "我的应用"
3. 找到对应的 Key
4. 在 "安全设置" 中添加:
   ```
   192.168.1.100:5173
   ```

#### 方法 3: 部署到测试域名
- 使用 Vercel/Netlify 部署
- 获得 https 域名
- 配置高德地图白名单

### 问题 4: 上传图片失败

**原因**:
- 后端使用 `localhost:3000` 接收文件
- 手机无法上传到 `localhost`

**解决方案**:

后端已配置，无需修改。确保：
1. 后端正在运行: `cd backend && npm run dev`
2. 前端代理已配置 (已完成)
3. 上传时使用相对路径 `/api/users/photos`

### 问题 5: Socket.io 实时消息不工作

**原因**:
- WebSocket 连接使用 `localhost:3000`
- 手机无法连接到 `localhost`

**解决方案**:

#### 修改 Socket 连接配置

```typescript
// frontend/src/services/socketService.ts
const socket = io(
  import.meta.env.DEV 
    ? `http://${window.location.hostname}:3000` // 开发环境使用当前主机名
    : window.location.origin, // 生产环境使用当前域名
  {
    withCredentials: true,
    transports: ['websocket', 'polling']
  }
)
```

这样：
- 电脑访问 `localhost:5173` → 连接 `localhost:3000`
- 手机访问 `192.168.1.100:5173` → 连接 `192.168.1.100:3000`

---

## 🧪 功能测试清单

### 基础功能

- [ ] 页面加载正常
- [ ] TabBar 导航切换流畅
- [ ] 页面滚动顺畅
- [ ] 图片加载显示正常
- [ ] 按钮点击反馈正常

### 用户功能

- [ ] 登录/注册
- [ ] 查看个人资料
- [ ] 编辑个人信息
- [ ] 上传头像
- [ ] 上传相册照片

### 活动功能

- [ ] 创建活动
- [ ] 查看活动列表
- [ ] 查看活动详情
- [ ] 加入活动
- [ ] 我的活动 (创建/参加)

### 发现功能

- [ ] 推荐目的地列表
- [ ] 热门目的地
- [ ] 推荐用户
- [ ] 点击用户卡片查看详情

### 消息功能

- [ ] 查看会话列表
- [ ] 打开聊天窗口
- [ ] 发送文字消息
- [ ] 发送图片
- [ ] 实时接收消息

### 地图功能 (可能受限)

- [ ] 地图加载
- [ ] 定位当前位置
- [ ] 搜索目的地
- [ ] 地图标记显示

---

## 📊 移动端体验测试

### 性能测试

| 指标             | 目标   | 实际 | 备注               |
| ---------------- | ------ | ---- | ------------------ |
| 首屏加载时间     | < 3s   |      | WiFi 环境          |
| 页面切换速度     | < 500ms |      | Tab 切换           |
| 图片加载时间     | < 2s   |      | 单张图片           |
| 滚动流畅度       | 60fps  |      | 列表滚动           |
| 点击响应时间     | < 100ms |      | 按钮点击           |

### 兼容性测试

| 功能         | iOS Safari | Android Chrome | 备注           |
| ------------ | ---------- | -------------- | -------------- |
| 基础布局     | ✅         | ✅             | 响应式设计     |
| 触摸事件     | ✅         | ✅             | 点击/滑动      |
| 图片上传     | ✅         | ✅             | 相册/相机      |
| GPS 定位     | ⚠️         | ⚠️             | 需用户授权     |
| WebSocket    | ✅         | ✅             | 实时消息       |
| 本地存储     | ✅         | ✅             | localStorage   |

### 用户体验

- [ ] 文字大小合适，易读
- [ ] 按钮足够大，易点击 (最小 44x44px)
- [ ] 输入框弹出键盘正常
- [ ] 页面缩放合适，不需要手动缩放
- [ ] 横屏显示正常 (可选)
- [ ] 下拉刷新体验好 (如果有)

---

## 🚀 高级测试：部署到公网

### 方案 1: Vercel (推荐，免费)

#### 安装 Vercel CLI
```bash
npm install -g vercel
```

#### 部署前端
```bash
cd frontend
vercel

# 首次会要求登录
# 按照提示完成配置
# 获得类似: https://hiking-app-xxx.vercel.app
```

#### 配置环境变量
```bash
# Vercel Dashboard
# 项目设置 → Environment Variables
VITE_API_BASE_URL=https://你的后端地址
```

### 方案 2: Netlify (备选，免费)

```bash
npm install -g netlify-cli

cd frontend
npm run build
netlify deploy --prod --dir=dist
```

### 方案 3: 自己的服务器

```bash
# 构建前端
cd frontend
npm run build

# 上传 dist/ 目录到服务器
scp -r dist/* user@server:/var/www/html/

# 配置 Nginx
server {
  listen 80;
  server_name your-domain.com;
  
  location / {
    root /var/www/html;
    try_files $uri $uri/ /index.html;
  }
  
  location /api {
    proxy_pass http://localhost:3000;
  }
}
```

---

## 📝 测试报告模板

```markdown
# 移动端测试报告

**测试时间**: 2026-01-15
**测试设备**: iPhone 13 Pro / iOS 17.2
**测试网络**: WiFi / 4G

## 测试结果

### ✅ 通过的功能
- 功能 A: 正常
- 功能 B: 正常

### ⚠️ 存在问题的功能
- 功能 C: 偶尔卡顿
- 功能 D: 加载慢

### ❌ 无法使用的功能
- 功能 E: 报错

## 问题详情

### 问题 1: 地图不显示
- **重现步骤**: 打开发现页 → 点击地图
- **错误信息**: Map load error
- **截图**: [附件]

### 问题 2: 上传图片失败
- **重现步骤**: 编辑资料 → 上传头像
- **错误信息**: Network error
- **截图**: [附件]

## 改进建议
1. 优化图片加载速度
2. 增加加载动画
3. 改善错误提示

## 总体评价
- **性能**: 4/5
- **稳定性**: 4/5
- **用户体验**: 4/5
```

---

## 🎯 推荐测试流程

### 第一次测试 (30 分钟)

1. **连接测试** (5 分钟)
   - 配置网络
   - 访问应用
   - 验证页面加载

2. **基础功能** (10 分钟)
   - 登录/注册
   - 浏览各个页面
   - 测试导航切换

3. **核心功能** (15 分钟)
   - 创建活动
   - 查看活动详情
   - 发送消息
   - 上传图片

### 第二次测试 (1 小时)

1. **完整流程** (30 分钟)
   - 注册新用户
   - 完善个人资料
   - 浏览推荐内容
   - 参加活动
   - 与其他用户互动

2. **边界测试** (15 分钟)
   - 弱网环境 (切换到 4G)
   - 离线状态
   - 长时间使用
   - 切换后台再回来

3. **压力测试** (15 分钟)
   - 快速滑动列表
   - 频繁切换页面
   - 同时打开多个聊天
   - 上传大图片

---

## ✨ 小贴士

### 开发者工具

iOS Safari 支持远程调试：

1. **iPhone 设置**
   - 设置 → Safari → 高级
   - 开启 "Web 检查器"

2. **Mac Safari**
   - Safari → 开发 → [你的 iPhone]
   - 选择对应页面
   - 打开开发者工具

### 常用测试技巧

1. **清除缓存**
   - Safari: 设置 → Safari → 清除历史记录和网站数据

2. **查看控制台**
   - 使用 Mac Safari 远程调试
   - 或者使用 [Eruda](https://github.com/liriliri/eruda) 移动端控制台

3. **性能分析**
   - Safari 开发者工具 → 时间线
   - 记录页面加载和交互

4. **网络限速**
   - Safari 开发者工具 → 网络
   - 模拟不同网速 (3G/4G/WiFi)

---

## 📞 获取帮助

### 常见问题文档
- `TROUBLESHOOTING_START_APP.md` - 启动问题排查
- `TESTING_GUIDE_v1.1.0.md` - 功能测试指南
- `LYNX_INTEGRATION_STATUS.md` - Lynx 集成状态

### 技术支持
- 提交 GitHub Issue
- 查看项目 Wiki
- 联系开发团队

---

**准备好了吗？开始在 iPhone 上测试你的徒步社交 App！** 🚀📱
