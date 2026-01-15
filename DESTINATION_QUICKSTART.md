# 目的地选择功能 - 快速启动指南

## 🚀 快速开始

### 第一步：初始化数据库

```bash
# 进入后端目录
cd backend

# 运行初始化脚本（自动创建表和插入数据）
npx tsx src/scripts/initDestinations.ts
```

**预期输出：**

```
========================================
初始化目的地数据库
========================================

✓ 数据库连接成功
✓ SQL文件读取成功
共 12 条SQL语句

✓ [1/12] CREATE destinations
✓ [2/12] INSERT destinations
✓ [3/12] INSERT destinations
...
✓ 数据库初始化完成！
```

### 第二步：启动后端服务

```bash
# 在backend目录下
npm run dev
```

**验证后端：**

```bash
# 测试API
curl http://localhost:3000/api/v1/destinations/popular

# 应该返回8个目的地的JSON数据
```

### 第三步：启动前端服务

```bash
# 进入前端目录
cd ../frontend

# 启动开发服务器
npm run dev
```

**访问：** http://localhost:5173

---

## 🧪 功能测试

### 1. 测试目的地选择器

1. 打开浏览器访问 http://localhost:5173
2. 登录账号（或注册新账号）
3. 点击底部导航栏的 **"创建"** 按钮
4. 在创建活动页面，点击 **"目的地点"** 输入框
5. 目的地选择器打开

**验证功能：**

- ✅ 显示搜索框
- ✅ 显示"地图找山"入口卡片
- ✅ 显示最近搜索记录（第一次为空）
- ✅ 显示热门推荐列表（8 个目的地）

### 2. 测试搜索功能

1. 在搜索框输入 **"香山"**
2. 列表应该实时过滤，只显示包含"香山"的目的地

**验证：**

- ✅ 实时搜索过滤
- ✅ 搜索防抖（输入后 300ms 才发送请求）

### 3. 测试选择功能

1. 点击任意目的地卡片（如"香山公园"）
2. 选择器关闭
3. 目的地输入框显示选中的名称

**验证：**

- ✅ 点击后自动关闭
- ✅ 表单正确填充
- ✅ 搜索历史已记录

### 4. 测试地图模式

1. 点击 **"地图找山"** 卡片
2. 切换到地图模式（目前为模拟地图）

**验证：**

- ✅ 显示地图占位符
- ✅ 显示山峰标记点（按难度着色）
- ✅ 底部显示搜索栏和控制按钮
- ✅ 显示难度图例（绿/黄/红）

### 5. 测试详情窗口

1. 在地图模式下点击任意山峰图标
2. 从底部弹出详情悬浮窗

**验证：**

- ✅ 显示目的地封面图
- ✅ 显示名称、地区、距离
- ✅ 显示难度和人气标签
- ✅ 显示"选择此目的地"按钮
- ✅ 点击 ✕ 或外部可关闭

---

## 📡 API 测试

### 使用 Postman 或 curl 测试

#### 1. 获取热门目的地

```bash
curl http://localhost:3000/api/v1/destinations/popular
```

#### 2. 搜索目的地

```bash
curl "http://localhost:3000/api/v1/destinations?keyword=香山"
```

#### 3. 获取附近目的地

```bash
# 北京天安门附近
curl "http://localhost:3000/api/v1/destinations/nearby?latitude=39.9042&longitude=116.4074&radius=50"
```

#### 4. 按距离排序

```bash
curl "http://localhost:3000/api/v1/destinations?sortBy=distance&latitude=39.9042&longitude=116.4074"
```

#### 5. 按人气排序

```bash
curl "http://localhost:3000/api/v1/destinations?sortBy=popularity"
```

#### 6. 难度过滤

```bash
# 只显示入门级目的地
curl "http://localhost:3000/api/v1/destinations?difficulty=easy"
```

---

## 🎯 预期结果

### 数据库应该包含

- ✅ 8 个北京地区目的地
- ✅ 包含经纬度坐标
- ✅ 包含难度分级
- ✅ 包含封面图和实景图
- ✅ 包含人气数据

### API 应该返回

```json
{
  "code": 200,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "name": "香山公园",
      "area": "海淀区",
      "latitude": 39.9959,
      "longitude": 116.1863,
      "difficulty": "easy",
      "distance": 12.4,
      "cover_image": "https://...",
      "photos": ["..."],
      "popularity_score": 1200,
      "visit_count": 4800,
      "rating": 4.8,
      "is_favorited": false
    }
  ]
}
```

---

## 🐛 常见问题

### 1. 数据库初始化失败

**错误：** `Error: ER_BAD_DB_ERROR: Unknown database 'hiking_app'`

**解决：**

```bash
# 先创建数据库
mysql -u root -p
CREATE DATABASE hiking_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit

# 然后再运行初始化脚本
npx tsx src/scripts/initDestinations.ts
```

### 2. 后端无法连接数据库

**检查 `.env` 文件：**

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hiking_app
DB_PORT=3306
```

### 3. 前端显示"获取位置失败"

**原因：** 浏览器需要 HTTPS 或 localhost 才能使用 GPS

**解决：** 使用 localhost 访问，或者会自动使用默认位置（北京）

### 4. 搜索历史不显示

**原因：** 未登录用户使用本地存储

**解决：** 登录后搜索历史会同步到服务器

---

## ✅ 测试清单

- [ ] 数据库初始化成功
- [ ] 后端服务启动正常
- [ ] 前端服务启动正常
- [ ] 可以打开目的地选择器
- [ ] 显示热门推荐列表
- [ ] 搜索功能正常
- [ ] 选择目的地后正确填充
- [ ] 搜索历史记录功能
- [ ] 地图模式切换
- [ ] 难度颜色编码正确
- [ ] 距离计算准确
- [ ] API 接口响应正常

---

## 📝 下一步

功能已完整实现，可以：

1. **测试完整流程** - 从选择目的地到创建活动
2. **集成高德地图** - 替换模拟地图为真实地图
3. **添加更多数据** - 扩展到其他城市
4. **优化用户体验** - 添加加载动画、错误提示等

**祝测试顺利！** 🎉
