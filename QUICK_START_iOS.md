# 🚀 快速启动指南 - iOS 手机版

## 🎯 一分钟开始使用

### Windows 电脑操作

打开 PowerShell，运行以下命令：

```powershell
# 1. 启动后端
cd d:\coze\backend
npm start

# 2. 打开新窗口，启动前端
cd d:\coze\frontend
npm run dev
```

**记住显示的 IP 地址**，例如：`http://192.168.1.100:5173`

### iPhone 操作

1. **连接与电脑相同的 WiFi**
2. **打开 Safari**
3. **输入刚才的 IP 地址**
4. **点击分享按钮 → 添加到主屏幕**
5. **完成！打开主屏幕上的应用**

---

## 📱 应用功能

✅ 浏览附近徒步活动
✅ 查看活动详情和路线
✅ 加入感兴趣的活动
✅ 查看地图位置
✅ 拍照上传分享
✅ 离线浏览已加载内容

---

## 🔍 技术细节

### PWA 特性

- ✅ Service Worker 缓存
- ✅ 离线功能
- ✅ 主屏幕图标
- ✅ 全屏显示
- ✅ 自动更新

### Web API

- 📍 定位：Geolocation API
- 📷 相机：File Input API
- 💾 存储：LocalStorage + IndexedDB
- 🗺️ 地图：高德地图 Web SDK
- 🔔 通知：Notification API

---

## ⚠️ 常见问题

**Q: 必须用 Safari 吗？**
A: 是的，只有 Safari 支持 iOS 上的 PWA 功能。

**Q: 能离线使用吗？**
A: 可以浏览已加载的内容，新数据需要网络。

**Q: 和原生 App 有什么区别？**
A: PWA 功能相似，但无需 App Store，不需要 macOS 开发。

**Q: 如何更新应用？**
A: 自动更新，无需手动操作。

---

## 📞 需要帮助？

详细文档：`iOS_USER_GUIDE.md`

---

**现在就在 iOS 手机上体验徒步社交应用吧！** 🏔️✨
