# 高德地图集成配置指南 ✅ 已完成配置

## 🎉 API 密钥已配置

本项目已成功配置高德地图 API：

- **Key**: `b92a734708f227d392015c74eb075ac6`
- **安全密钥**: `edae25d7aec90d6c2d6eb0d3f6c7f680`
- **状态**: ✅ 可直接使用

## 1. 配置详情

### index.html 配置

已在 `frontend/index.html` 中配置：

```html
<script type="text/javascript">
  window._AMapSecurityConfig = {
    securityJsCode: 'edae25d7aec90d6c2d6eb0d3f6c7f680',
  }
</script>
<script src="https://webapi.amap.com/maps?v=2.0&key=b92a734708f227d392015c74eb075ac6&plugin=AMap.PlaceSearch,AMap.Geocoder,AMap.Geolocation"></script>
```

### .env 配置

已创建 `frontend/.env` 文件：

```env
VITE_AMAP_KEY=b92a734708f227d392015c74eb075ac6
VITE_AMAP_SECRET=edae25d7aec90d6c2d6eb0d3f6c7f680
```

## 2. 组件说明

### MapPicker 组件 (src/components/MapPicker.vue)

真实地图选点组件，提供完整的地图交互功能：

**核心功能：**

- ✅ 高德地图真实显示
- ✅ 拖动地图选择位置
- ✅ 实时地址搜索（PlaceSearch）
- ✅ 地理编码/逆地理编码（Geocoder）
- ✅ 浏览器定位（Geolocation）
- ✅ 中心点标记显示
- ✅ 位置信息卡片
- ✅ 确认选择并返回数据

**数据返回格式：**

```typescript
interface Location {
  name: string // 地点名称
  address: string // 详细地址
  lat: number // 纬度
  lng: number // 经度
}
```

## 3. 集成到创建活动页面

已在 `CreateActivity.vue` 中完成集成：

```vue
<MapPicker
  v-if="showMeetingPointPicker"
  @close="showMeetingPointPicker = false"
  @confirm="handleMapConfirm"
/>
```

**使用流程：**

1. 用户点击"集合地点"卡片
2. 打开全屏地图选择器
3. 拖动地图或搜索地点选择位置
4. 点击"确认位置"按钮
5. 自动更新表单的集合地点信息

- 搜索关键词是否正确
- city 参数设置（默认为"北京"）
- API Key 是否有搜索权限

## 6. 进阶配置

### 自定义地图样式

在 `MapPicker.vue` 中修改：

```javascript
map = new window.AMap.Map(mapContainer.value, {
  zoom: 15,
  center: [116.397428, 39.90923],
  viewMode: '3D',
  pitch: 0,
  mapStyle: 'amap://styles/normal', // 可选: dark, light, fresh, grey等
})
```

### 修改默认城市

修改搜索和地理编码的城市参数：

```javascript
geocoder = new window.AMap.Geocoder({
  city: '上海', // 改为你的城市
})

placeSearch = new window.AMap.PlaceSearch({
  city: '上海', // 改为你的城市
  pageSize: 10,
})
```

## 7. 参考文档

- [高德地图 JS API 文档](https://lbs.amap.com/api/javascript-api-v2/summary)
- [地点搜索服务](https://lbs.amap.com/api/javascript-api-v2/guide/services/place-search)
- [地理编码服务](https://lbs.amap.com/api/javascript-api-v2/guide/services/geocoder)
