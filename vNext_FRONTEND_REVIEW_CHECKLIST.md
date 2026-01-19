# vNext 前端架构评审清单

**日期**: 2026-01-19
**评审人**: Tech Lead (Frontend) / 前端架构师
**预计时间**: 1 小时
**优先级**: 🔴 高

---

## 📋 评审目标

确认前端架构设计的:

1. ✅ API 层重构方案 (apiService.ts)
2. ✅ useApiRequest Hook 设计
3. ✅ 缓存策略完整性
4. ✅ 地图组件框架可行性
5. ✅ 实时通信架构 (WebSocket/Socket.io)

---

## 🏗️ Part 1: API 层架构设计评审

### 1.1 新架构概览

```
frontend/src/api/
├── base/
│   ├── request.ts       (现有 HTTP 实例 ✅)
│   ├── apiService.ts    (新增: 统一 API 封装)
│   ├── types.ts         (新增: 通用类型定义)
│   └── interceptors.ts  (新增: 拦截器管理)
├── hooks/
│   ├── useApiRequest.ts (新增: 通用请求 Hook)
│   ├── useCache.ts      (新增: 缓存 Hook)
│   └── useWebSocket.ts  (新增: 实时通信 Hook)
└── modules/
    ├── route.ts         (新增: 路线 API)
    ├── track.ts         (新增: 轨迹 API)
    ├── team.ts          (新增: 队伍 API)
    ├── safety.ts        (新增: 安全 API)
    ├── user.ts          (重构: 用户 API)
    └── message.ts       (重构: 消息 API)
```

### 1.2 apiService.ts 设计评审

#### 核心代码 (简化版)

```typescript
// api/base/apiService.ts
import { request } from './request'
import { ApiResponse, ApiOptions } from './types'

class ApiService {
  async get<T>(url: string, options?: ApiOptions): Promise<T> {
    const { cache, retry, timeout } = options || {}
    // 1. 检查缓存
    // 2. 发送请求
    // 3. 错误重试
    // 4. 更新缓存
    return response.data
  }

  async post<T>(url: string, data: any, options?: ApiOptions): Promise<T> {
    // 类似逻辑
  }

  // put, delete, patch...
}

export const apiService = new ApiService()
```

#### 评审检查清单

```
☐ 统一响应格式处理
  现状: 后端返回 { code, data, message }
  问题: 前端需要解包 response.data.data
  建议: apiService 自动解包,直接返回 data

☐ 错误处理统一化
  ☐ 401 → 自动跳转登录
  ☐ 403 → 提示无权限
  ☐ 500 → 显示友好错误
  ☐ Network Error → 提示网络问题

☐ 重试机制
  ☐ 支持自动重试 (GET 请求)
  ☐ 重试次数可配置 (默认 2 次)
  ☐ 指数退避 (1s → 2s → 4s)

☐ 超时控制
  ☐ 默认超时 10 秒
  ☐ 上传接口超时 60 秒
  ☐ 可配置

☐ 并发控制
  ☐ 防止重复请求 (pendingRequests Map)
  ☐ 请求取消 (AbortController)
```

### 您的评审意见

```
✍️ 整体设计: ☐ 通过 ☐ 需调整 ☐ 重新设计

需要调整:
__________________________________________________

补充功能:
__________________________________________________
```

---

## 🪝 Part 2: useApiRequest Hook 评审

### 2.1 Hook 设计

```typescript
// api/hooks/useApiRequest.ts
export function useApiRequest<T>(
  apiFunc: () => Promise<T>,
  options?: {
    manual?: boolean // 手动触发
    cacheKey?: string // 缓存键
    cacheTTL?: number // 缓存时长
    onSuccess?: (data: T) => void
    onError?: (error: Error) => void
  }
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const run = async () => {
    setLoading(true)
    try {
      const result = await apiFunc()
      setData(result)
      options?.onSuccess?.(result)
    } catch (e) {
      setError(e as Error)
      options?.onError?.(e as Error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!options?.manual) run()
  }, [])

  return { data, loading, error, run, mutate: setData }
}
```

### 2.2 使用示例

```typescript
// 页面组件中
const {
  data: routes,
  loading,
  error,
  run: refreshRoutes,
} = useApiRequest(() => routeApi.getList({ page: 1, size: 20 }), {
  cacheKey: 'routes_list',
  cacheTTL: 300000,
})

if (loading) return <Loading />
if (error) return <Error message={error.message} />
return <RouteList routes={routes} onRefresh={refreshRoutes} />
```

### 评审检查清单

```
☐ 功能完整性
  ☐ loading/error/data 状态管理 ✅
  ☐ 手动/自动触发 ✅
  ☐ 缓存支持 ✅
  ☐ 乐观更新 (mutate)
  ☐ 轮询支持 (polling)
  ☐ 依赖刷新 (依赖变化时重新请求)

☐ 性能优化
  ☐ 防抖 (debounce) 支持
  ☐ 请求取消 (组件卸载时)
  ☐ 缓存失效策略

☐ TypeScript 类型安全
  ☐ 泛型支持 ✅
  ☐ 返回值类型推导 ✅
  ☐ 参数类型检查
```

### 您的评审意见

```
✍️ Hook 设计: ☐ 优秀 ☐ 良好 ☐ 需改进

建议:
__________________________________________________
```

---

## 💾 Part 3: 缓存策略评审

### 3.1 当前缓存现状

```typescript
// utils/cache.ts (现有)
class LRUCache {
  private cache = new Map<string, CacheItem>()
  private maxSize = 100

  set(key: string, value: any, ttl?: number) {
    /* ... */
  }
  get(key: string) {
    /* ... */
  }
}

export const cache = new LRUCache()
```

### 3.2 新缓存策略

```
缓存层级:
  L1: 内存缓存 (LRUCache) - 快速访问
  L2: LocalStorage - 持久化
  L3: IndexedDB - 大数据 (地图切片/轨迹)

缓存策略:
  ☐ 热数据缓存 (用户信息/路线列表) → L1 + L2
  ☐ 大数据缓存 (地图切片/轨迹点) → L3
  ☐ 实时数据 (位置共享) → 不缓存
  ☐ 静态资源 (图片) → Service Worker
```

### 评审检查清单

```
☐ 缓存失效策略
  ☐ TTL 过期 ✅
  ☐ 手动失效 (更新后清除)
  ☐ 版本号失效 (API 版本变化)

☐ 缓存大小管理
  ☐ LRU 淘汰 ✅
  ☐ 总大小限制 (如 50MB)
  ☐ 用户可清理

☐ 缓存穿透保护
  ☐ 空值缓存 (防止重复请求不存在的数据)
  ☐ 布隆过滤器 (可选)
```

### 您的评审意见

```
✍️ 缓存策略: ☐ 完善 ☐ 基本可行 ☐ 需加强

建议:
__________________________________________________
```

---

## 🗺️ Part 4: 地图组件架构评审

### 4.1 地图框架选择

```
选项 A: 高德地图 AMap SDK (推荐)
  ✅ 功能完整
  ✅ 国内最佳体验
  ❌ 依赖外部服务
  ❌ 有成本

选项 B: Leaflet + OpenStreetMap
  ✅ 开源免费
  ✅ 灵活可控
  ❌ 国内数据不准
  ❌ 功能有限
```

### 4.2 组件架构

```typescript
// components/Map/
├── BaseMap.vue          (地图容器)
├── RouteLayer.vue       (路线图层)
├── WaypointMarker.vue   (关键点标记)
├── TrackLayer.vue       (轨迹图层)
├── LocationMarker.vue   (用户位置)
├── TeamMarkers.vue      (队伍成员)
└── MapControls.vue      (地图控件)

// 使用方式
<BaseMap :center="[lat, lng]" :zoom="15">
  <RouteLayer :route="routeData" />
  <TrackLayer :points="trackPoints" />
  <TeamMarkers :members="teamMembers" />
</BaseMap>
```

### 评审检查清单

```
☐ 地图性能
  ☐ 大量标记点性能 (聚合/虚拟化)
  ☐ 轨迹点简化 (Douglas-Peucker 算法)
  ☐ 懒加载 (视口外不渲染)

☐ 离线支持
  ☐ 地图切片缓存策略
  ☐ IndexedDB 存储
  ☐ 缓存大小控制

☐ 交互体验
  ☐ 缩放/平移流畅
  ☐ 标记点点击事件
  ☐ 弹窗信息展示
```

### 您的评审意见

```
✍️ 地图方案: ☐ 高德 AMap ☐ Leaflet ☐ 其他 _______

建议:
__________________________________________________
```

---

## 🔌 Part 5: 实时通信架构评审

### 5.1 当前 WebSocket 使用

```typescript
// services/socket.ts (现有)
- Socket.io 客户端连接 ✅
- 消息监听 ✅
- 断线重连 ✅

问题:
- 缺少权限验证
- 缺少消息队列 (离线消息)
- 缺少心跳机制
```

### 5.2 新架构设计

```typescript
// api/hooks/useWebSocket.ts
export function useWebSocket(event: string, handler: (data: any) => void) {
  useEffect(() => {
    socket.on(event, handler)
    return () => socket.off(event, handler)
  }, [event, handler])
}

// 使用
const { data: teamLocations } = useWebSocket('team:location:update', (data) => {
  // 处理位置更新
})
```

### 评审检查清单

```
☐ 连接管理
  ☐ 自动重连 ✅
  ☐ 心跳检测 (30秒)
  ☐ 连接状态提示

☐ 消息可靠性
  ☐ 消息确认机制 (ACK)
  ☐ 离线消息队列
  ☐ 消息去重

☐ 性能优化
  ☐ 消息节流 (位置更新不超过 1 次/秒)
  ☐ 批量处理
```

### 您的评审意见

```
✍️ 实时通信: ☐ 设计完善 ☐ 需加强

建议:
__________________________________________________
```

---

## 📊 综合评审总结

### 整体评价

```
☐ API 层设计: ☐ 优秀 ☐ 良好 ☐ 需改进
☐ Hook 设计: ☐ 优秀 ☐ 良好 ☐ 需改进
☐ 缓存策略: ☐ 优秀 ☐ 良好 ☐ 需改进
☐ 地图架构: ☐ 优秀 ☐ 良好 ☐ 需改进
☐ 实时通信: ☐ 优秀 ☐ 良好 ☐ 需改进
```

### 高优先级调整 (Top 3)

```
1. __________________________________________________
2. __________________________________________________
3. __________________________________________________
```

### 技术选型建议

```
地图方案: ☐ 高德 AMap ☐ Leaflet ☐ 其他
状态管理: ☐ Pinia (现有) ☐ Zustand ☐ 其他
实时通信: ☐ Socket.io (现有) ☐ 原生 WebSocket
```

### 下一步行动

```
☐ 1. 实现 apiService.ts 基础版
☐ 2. 实现 useApiRequest Hook
☐ 3. 重构一个模块作为示范 (如 route.ts)
☐ 4. 编写地图组件 demo
☐ 5. 更新前端开发规范文档
☐ 6. 团队培训 (新架构使用)
```

### 评审结论

```
☐ 通过,可以开始开发
☐ 小幅调整后通过
☐ 需要重大调整

评审人: ___________________
日期: 2026-01-___
```

---

## 📎 参考资料

- **vNext_PRD_ANALYSIS_COMPREHENSIVE.md** Part 3.3
- **CURRENT_CODE_OPTIMIZATION_PLAN.md**
- **frontend/src/api/** (当前代码)
- **Vue 3 组合式 API 文档**
- **Ahooks** (React Hooks 库, 可参考)

---

✨ **完成评审后,前端架构设计就可以锁定了!** 🎉
