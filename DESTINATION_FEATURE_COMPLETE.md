# 目的地选择功能 - 前后端集成完成

## ✅ 已完成功能

### 后端部分

#### 1. 数据库设计

- ✅ `destinations` 表 - 存储目的地详细信息
- ✅ `destination_search_history` 表 - 记录用户搜索历史
- ✅ `destination_favorites` 表 - 用户收藏的目的地
- ✅ 预置 8 个北京地区热门徒步目的地数据

#### 2. API 接口 (`/api/v1/destinations`)

- ✅ `GET /` - 获取目的地列表（支持搜索、过滤、排序、分页）
- ✅ `GET /popular` - 获取热门目的地
- ✅ `GET /nearby` - 获取附近目的地（基于 GPS 定位）
- ✅ `GET /:id` - 获取目的地详情
- ✅ `POST /search/record` - 记录搜索历史
- ✅ `GET /search/history` - 获取搜索历史
- ✅ `POST /:id/favorite` - 收藏/取消收藏
- ✅ `GET /favorites/list` - 获取收藏列表

#### 3. 核心功能

- ✅ **距离计算** - 基于经纬度计算用户到目的地的实际距离
- ✅ **智能排序** - 支持按距离、人气、评分、活动数排序
- ✅ **搜索过滤** - 关键词、地区、难度、距离范围多维度筛选
- ✅ **访问统计** - 自动记录访问次数
- ✅ **收藏状态** - 查询时返回用户收藏状态

### 前端部分

#### 1. API 客户端 (`api/destination.ts`)

- ✅ 完整的 TypeScript 类型定义
- ✅ 所有 API 接口封装
- ✅ 统一错误处理

#### 2. DestinationPicker 组件优化

- ✅ **数据加载**
  - 自动获取用户 GPS 位置
  - 加载热门目的地
  - 加载附近目的地
  - 加载搜索历史
- ✅ **实时搜索**
  - 搜索防抖（300ms）
  - 关键词过滤
  - 搜索历史记录
- ✅ **用户体验**
  - 加载状态提示
  - 错误处理和降级（使用本地存储）
  - 距离格式化显示
  - 难度中文映射

---

## 📋 数据库结构

### Destinations 表字段说明

| 字段             | 类型          | 说明                       |
| ---------------- | ------------- | -------------------------- |
| id               | INT           | 主键                       |
| name             | VARCHAR(100)  | 目的地名称                 |
| description      | TEXT          | 描述                       |
| area             | VARCHAR(50)   | 所属地区（如"海淀区"）     |
| latitude         | DECIMAL(10,8) | 纬度                       |
| longitude        | DECIMAL(11,8) | 经度                       |
| difficulty       | ENUM          | 难度（easy/moderate/hard） |
| distance         | DECIMAL(6,2)  | 徒步距离(km)               |
| elevation_gain   | INT           | 累计爬升(m)                |
| cover_image      | VARCHAR(500)  | 封面图 URL                 |
| photos           | TEXT          | 实景照片 JSON 数组         |
| popularity_score | INT           | 人气分数                   |
| visit_count      | INT           | 访问次数                   |
| activity_count   | INT           | 相关活动数                 |
| rating           | DECIMAL(3,2)  | 评分                       |
| tags             | VARCHAR(200)  | 标签（逗号分隔）           |
| address          | VARCHAR(200)  | 详细地址                   |
| best_season      | VARCHAR(50)   | 最佳季节                   |
| status           | ENUM          | 状态（active/inactive）    |

### 预置目的地数据

1. **香山公园** - 入门级，人气 Top1
2. **凤凰岭自然风景区** - 中等难度
3. **灵山** - 困难，北京第一高峰
4. **百花山** - 中等难度，天然植物园
5. **云蒙山** - 中等难度，小黄山
6. **八达岭长城** - 中等难度，世界遗产
7. **妙峰山** - 中等难度，华北第一仙山
8. **奥林匹克森林公园** - 入门级，城市公园

---

## 🚀 初始化步骤

### 1. 初始化数据库

```bash
# 方式一：运行初始化脚本
cd backend
npx tsx src/scripts/initDestinations.ts

# 方式二：手动导入SQL
mysql -u root -p hiking_app < src/database/create_destinations.sql
```

### 2. 启动后端服务

```bash
cd backend
npm run dev
```

### 3. 启动前端服务

```bash
cd frontend
npm run dev
```

---

## 📡 API 使用示例

### 获取热门目的地

```http
GET /api/v1/destinations/popular?limit=10
```

**响应:**

```json
{
  "code": 200,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "name": "香山公园",
      "area": "海淀区",
      "difficulty": "easy",
      "cover_image": "...",
      "popularity_score": 1200,
      "rating": 4.8,
      "is_favorited": false
    }
  ]
}
```

### 搜索目的地

```http
GET /api/v1/destinations?keyword=香山&difficulty=easy&sortBy=popularity&page=1&pageSize=20
```

**响应:**

```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "destinations": [...],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 3,
      "totalPages": 1
    }
  }
}
```

### 获取附近目的地

```http
GET /api/v1/destinations/nearby?latitude=39.9042&longitude=116.4074&radius=50&limit=10
```

**响应:**

```json
{
  "code": 200,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "name": "香山公园",
      "user_distance": 12.4, // 距离用户的公里数
      "latitude": 39.9959,
      "longitude": 116.1863
    }
  ]
}
```

### 收藏目的地

```http
POST /api/v1/destinations/1/favorite
Authorization: Bearer <token>
```

**响应:**

```json
{
  "code": 200,
  "message": "收藏成功",
  "data": {
    "isFavorited": true
  }
}
```

---

## 🔍 核心功能说明

### 1. 距离计算算法

使用 Haversine 公式计算两点间球面距离：

```typescript
calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // 地球半径（公里）
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
```

### 2. 智能排序

- **按距离排序** - 计算用户位置到每个目的地的实际距离
- **按人气排序** - 根据`popularity_score`和`visit_count`
- **按评分排序** - 根据`rating`和`popularity_score`
- **按活动数排序** - 根据`activity_count`

### 3. 搜索过滤

支持多条件组合：

- 关键词 - 匹配名称、描述、标签、地区
- 地区过滤 - 精确匹配地区
- 难度过滤 - easy/moderate/hard
- 距离范围 - 徒步距离 min-max

### 4. 搜索历史管理

- 自动记录用户搜索
- 最多保留 20 条历史
- 支持清除历史
- 未登录用户使用本地存储

---

## 🎨 前端集成示例

### 在 CreateActivity 中使用

```vue
<template>
  <DestinationPicker
    v-if="showDestinationPicker"
    @close="showDestinationPicker = false"
    @select="handleDestinationSelect"
  />
</template>

<script setup>
import DestinationPicker from '@/components/features/DestinationPicker.vue'

const handleDestinationSelect = (name) => {
  form.value.destination = name
  showDestinationPicker.value = false
}
</script>
```

### 数据流程

1. 用户打开选择器
2. 自动获取 GPS 位置
3. 并行加载：
   - 热门目的地
   - 附近目的地
   - 搜索历史
4. 用户搜索/选择
5. 记录搜索历史
6. 返回选择结果

---

## 🔮 待完成功能

### 高德地图集成

```bash
npm install @amap/amap-jsapi-loader
```

```typescript
import AMapLoader from '@amap/amap-jsapi-loader'

// 初始化地图
const map = await AMapLoader.load({
  key: 'YOUR_AMAP_KEY',
  version: '2.0',
  plugins: ['AMap.Marker', 'AMap.Geolocation'],
})

// 添加标记
const marker = new AMap.Marker({
  position: [longitude, latitude],
  icon: createDifficultyIcon(difficulty),
})
```

### 图片上传集成

- 目的地照片上传到 OSS
- 生成缩略图
- 实景照片管理

### 数据统计

- 热门时段分析
- 用户偏好推荐
- 相似目的地推荐

---

## 🐛 已知问题

1. **地图模式** - 目前使用模拟数据，需要接入高德地图 API
2. **图片 CDN** - 使用 Unsplash 临时图片，需要替换为实际图片
3. **定位权限** - 需要 HTTPS 环境才能使用 GPS 定位

---

## 📝 测试步骤

### 1. 后端测试

```bash
# 测试获取目的地列表
curl http://localhost:3000/api/v1/destinations

# 测试热门目的地
curl http://localhost:3000/api/v1/destinations/popular

# 测试附近目的地
curl "http://localhost:3000/api/v1/destinations/nearby?latitude=39.9042&longitude=116.4074"

# 测试搜索
curl "http://localhost:3000/api/v1/destinations?keyword=香山"
```

### 2. 前端测试

1. 打开创建活动页面
2. 点击"目的地点"输入框
3. 验证功能：
   - ✅ 显示搜索历史
   - ✅ 显示热门推荐
   - ✅ 搜索功能正常
   - ✅ 点击选择后正确填充
   - ✅ 地图模式切换

---

## 📊 性能优化

- ✅ 搜索防抖（300ms）
- ✅ 数据分页加载
- ✅ 距离计算缓存
- ✅ 数据库索引优化
- ✅ 图片懒加载（组件层面）

---

## 🎯 下一步计划

1. **地图功能**

   - 接入高德地图 Web API
   - 实现地图标记点击交互
   - 支持地图搜索

2. **数据增强**

   - 添加更多城市的目的地数据
   - 爬取真实用户评价
   - 集成天气 API 显示实时天气

3. **社交功能**

   - 显示好友去过的地方
   - 目的地打卡功能
   - 用户生成内容（UGC）

4. **智能推荐**
   - 基于用户历史推荐
   - 季节性推荐
   - 个性化排序

---

## ✅ 总结

前后端目的地选择功能已完整实现：

- ✅ 完整的数据库设计和数据
- ✅ RESTful API 接口
- ✅ 智能搜索和排序
- ✅ GPS 定位和距离计算
- ✅ 用户历史和收藏
- ✅ 前端组件集成

现在可以开始测试和使用这个功能了！
