# 目的地选择器功能优化文档

## 功能概述

根据设计图优化了目的地选择功能，新增**地图找山模式**，提供更直观的目的地发现体验。

---

## 一、核心功能特性

### 1. 双模式切换

#### 列表模式（默认）

- 搜索框支持山峰、路线、景区搜索
- 最近搜索记录（最多3条）
- 热门推荐列表（带实景图、距离、难度标签）
- **地图找山入口**：醒目的青色卡片，引导用户进入地图模式

#### 地图模式

- 全屏地图界面（可集成高德地图API）
- 山峰图标按难度分色显示
- 点击图标弹出详情悬浮窗
- 底部搜索栏支持区域内搜索
- 一键定位到当前位置
- 图层切换按钮（卫星图、路况等）

---

## 二、地图模式 - 山峰图标颜色规则

根据难度等级使用不同颜色区分，方便用户快速识别：

| 难度等级  | 图标背景色 | Tailwind类名    | 说明             |
| --------- | ---------- | --------------- | ---------------- |
| 简单/入门 | 🟢 绿色    | `bg-green-500`  | 适合新手，强度低 |
| 中等      | 🟡 黄色    | `bg-yellow-500` | 有一定挑战性     |
| 困难      | 🔴 红色    | `bg-red-500`    | 高难度，需经验   |

### 图例展示

地图底部显示颜色图例，帮助用户理解：

```
🟢 简单  🟡 中等  🔴 困难
```

---

## 三、UI 组件结构

### 文件位置

```
frontend/src/components/features/DestinationPicker.vue
```

### 组件架构

```
DestinationPicker
├── 顶部导航栏
│   ├── 返回按钮
│   ├── 标题
│   └── 搜索框
├── 列表模式
│   ├── 地图找山入口（🗺️ 卡片）
│   ├── 最近搜索
│   └── 热门推荐列表
└── 地图模式
    ├── 地图容器
    │   └── 山峰标记点（按难度着色）
    ├── 底部搜索栏
    │   ├── 搜索输入框
    │   ├── 定位按钮 📍
    │   ├── 图层按钮 📋
    │   └── 难度图例
    ├── 返回列表按钮
    └── 目的地详情悬浮窗
        ├── 封面图
        ├── 名称 + 地区
        ├── 难度标签
        ├── 人气数据
        ├── 实景照片轮播
        └── 选择按钮
```

---

## 四、关键交互流程

### 4.1 列表模式选择流程

```
1. 用户点击"目的地点"输入框
2. 打开 DestinationPicker（列表模式）
3. 用户可以：
   - 直接点击热门推荐
   - 点击最近搜索
   - 在搜索框输入关键词过滤
   - 点击"地图找山"进入地图模式
4. 选择后自动关闭，填充表单
```

### 4.2 地图模式选择流程

```
1. 用户点击"地图找山"卡片
2. 切换到全屏地图视图
3. 地图上显示各山峰图标（颜色区分难度）
4. 用户点击感兴趣的山峰图标
5. 从底部弹出详情悬浮窗：
   - 展示封面大图
   - 显示地区、距离信息
   - 显示难度、人气标签
   - 展示实景照片（可左右滑动）
6. 用户点击"选择此目的地"按钮确认
7. 关闭选择器，填充表单
```

---

## 五、数据结构

### Destination 类型定义

```typescript
interface Destination {
  name: string // 目的地名称
  image: string // 封面图 URL
  distance: string // 距离（如"12.4 km"）
  area: string // 所属地区（如"海淀区"）
  visitors: string // 访问人数（如"1.2k+"）
  difficulty: string // 难度等级（"入门"/"中等"/"困难"）
  badge?: string // 特殊标签（如"人气榜 Top1"）
  photos?: string[] // 实景图数组
}
```

### 示例数据

```javascript
{
  name: '香山公园',
  image: 'https://example.com/xiangshan.jpg',
  distance: '12.4 km',
  area: '海淀区',
  visitors: '1.2k+',
  difficulty: '入门',
  badge: '人气榜 Top1',
  photos: [
    'https://example.com/photo1.jpg',
    'https://example.com/photo2.jpg',
    'https://example.com/photo3.jpg'
  ]
}
```

---

## 六、地图集成建议（TODO）

### 6.1 高德地图 Web API 集成

#### 安装依赖

```bash
npm install @amap/amap-jsapi-loader
```

#### 地图初始化代码示例

```typescript
import AMapLoader from '@amap/amap-jsapi-loader'

const initMap = async () => {
  const AMap = await AMapLoader.load({
    key: 'YOUR_AMAP_KEY',
    version: '2.0',
    plugins: ['AMap.Marker', 'AMap.Geolocation'],
  })

  const map = new AMap.Map('map-container', {
    zoom: 11,
    center: [116.397428, 39.90923],
  })

  // 添加山峰标记
  destinations.forEach((dest) => {
    const marker = new AMap.Marker({
      position: [dest.lng, dest.lat],
      icon: createDifficultyIcon(dest.difficulty),
      title: dest.name,
    })
    marker.on('click', () => showDestinationDetail(dest))
    map.add(marker)
  })
}
```

#### 自定义图标函数

```typescript
const createDifficultyIcon = (difficulty: string) => {
  const colors = {
    入门: '#10b981', // green-500
    中等: '#eab308', // yellow-500
    困难: '#ef4444', // red-500
  }

  return new AMap.Icon({
    image: '//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png',
    size: new AMap.Size(48, 48),
    imageSize: new AMap.Size(48, 48),
    style: {
      backgroundColor: colors[difficulty],
      borderRadius: '50%',
    },
  })
}
```

---

## 七、样式亮点

### 7.1 地图找山入口卡片

```css
/* 渐变背景 + 圆形图标 + 悬停效果 */
.map-entry-card {
  background: linear-gradient(to right, #f0fdfa, #d1fae5);
  padding: 1rem;
  border-radius: 1rem;
  cursor: pointer;
  transition: box-shadow 0.3s;
}

.map-entry-card:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}
```

### 7.2 山峰图标样式

```css
/* 根据难度动态着色 */
.mountain-marker {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s;
}

.mountain-marker:hover {
  transform: scale(1.1);
}

/* 颜色变体 */
.marker-easy {
  background-color: #10b981;
}
.marker-moderate {
  background-color: #eab308;
}
.marker-hard {
  background-color: #ef4444;
}
```

### 7.3 详情悬浮窗动画

```css
@keyframes slide-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.detail-drawer {
  animation: slide-up 0.3s ease-out;
  border-radius: 24px 24px 0 0;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
}
```

---

## 八、用户体验优化点

### 8.1 视觉引导

- ✅ "地图找山"卡片使用渐变色突出显示
- ✅ 大号圆形图标（🗺️）增强识别度
- ✅ 副标题"在地图上发现你身边的宝藏徒步点"激发探索欲

### 8.2 色彩系统

- ✅ 绿色（简单）：给新手信心
- ✅ 黄色（中等）：表示适度挑战
- ✅ 红色（困难）：警示高难度

### 8.3 快速操作

- ✅ 最近搜索快速访问
- ✅ 一键定位当前位置
- ✅ 点击山峰图标直接显示详情

### 8.4 信息丰富度

- ✅ 实景照片增强真实感
- ✅ 人气数据提供社交证明
- ✅ 距离信息帮助决策

---

## 九、测试要点

### 9.1 功能测试

- [ ] 列表模式搜索过滤正常
- [ ] 最近搜索记录正确保存
- [ ] 点击"地图找山"切换到地图模式
- [ ] 地图模式下点击山峰显示详情
- [ ] 详情窗口关闭功能正常
- [ ] 选择目的地后正确填充表单

### 9.2 视觉测试

- [ ] 山峰图标颜色与难度匹配
- [ ] 图例显示在地图底部
- [ ] 悬浮窗滑入动画流畅
- [ ] 实景图横向滚动正常

### 9.3 交互测试

- [ ] 搜索框输入响应及时
- [ ] 定位按钮点击有反馈
- [ ] 图层按钮功能预留（待实现）
- [ ] 返回列表按钮正常工作

---

## 十、后续优化方向

### 10.1 地图功能增强

- [ ] 接入高德地图 API
- [ ] 实现真实地理定位
- [ ] 添加路线规划功能
- [ ] 支持地图缩放和拖拽

### 10.2 数据增强

- [ ] 从后端API获取真实目的地数据
- [ ] 支持按距离、人气、难度排序
- [ ] 添加用户评价和照片

### 10.3 社交功能

- [ ] 显示好友去过的地方
- [ ] 推荐附近正在进行的活动
- [ ] 支持收藏目的地

### 10.4 性能优化

- [ ] 地图懒加载
- [ ] 图片懒加载和压缩
- [ ] 搜索防抖优化

---

## 十一、设计参考

### UI参考来源

根据上传的设计图实现，主要特点：

1. **顶部搜索栏**：圆角灰色背景 + 🔍 图标
2. **地图找山卡片**：渐变背景 + 圆形图标 + 右箭头
3. **最近搜索**：青色标题 + 带时钟图标的圆角按钮
4. **热门推荐**：卡片式布局 + 圆角缩略图 + 标签徽章
5. **地图界面**：全屏地图 + 底部搜索栏 + 图例
6. **详情悬浮窗**：从底部滑入 + 大图展示 + 标签 + CTA按钮

---

## 十二、代码示例

### 使用 DestinationPicker 组件

```vue
<template>
  <div>
    <!-- 触发器 -->
    <input v-model="destination" @click="showPicker = true" placeholder="选择目的地" readonly />

    <!-- 目的地选择器 -->
    <DestinationPicker v-if="showPicker" @close="showPicker = false" @select="handleSelect" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import DestinationPicker from '@/components/features/DestinationPicker.vue'

const showPicker = ref(false)
const destination = ref('')

const handleSelect = (name) => {
  destination.value = name
  showPicker.value = false
}
</script>
```

---

## 总结

✅ **已完成**：

- 创建 DestinationPicker 独立组件
- 实现列表模式和地图模式双模式
- 山峰图标按难度着色（绿/黄/红）
- 地图找山入口卡片设计
- 详情悬浮窗动画效果
- 最近搜索、热门推荐功能

🔄 **待集成**：

- 高德地图 API 接入
- 真实地理位置数据
- 后端目的地数据接口

📝 **设计亮点**：

- 直观的颜色编码系统
- 流畅的模式切换动画
- 丰富的目的地信息展示
- "按图索骥"的探索体验
