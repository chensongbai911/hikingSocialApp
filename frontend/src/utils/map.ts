/**
 * 高德地图工具封装
 * 创建日期: 2026-01-19
 */

/// <reference types="@amap/amap-jsapi-types" />

declare const AMap: any

/**
 * 加载高德地图 SDK
 */
export const loadAMapScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof AMap !== 'undefined') {
      resolve()
      return
    }

    const script = document.createElement('script')
    const key = import.meta.env.VITE_AMAP_KEY

    if (!key) {
      reject(new Error('AMap key not configured'))
      return
    }

    script.src = `https://webapi.amap.com/maps?v=2.0&key=${key}&plugin=AMap.Geolocation,AMap.Geocoder,AMap.Walking,AMap.Driving`
    script.async = true

    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load AMap SDK'))

    document.head.appendChild(script)
  })
}

/**
 * 创建地图实例
 */
export const createMap = (
  container: string | HTMLElement,
  options?: any
): Promise<any> => {
  return loadAMapScript().then(() => {
    const defaultOptions = {
      zoom: 12,
      center: [
        import.meta.env.VITE_MAP_CENTER_LNG || 116.4074,
        import.meta.env.VITE_MAP_CENTER_LAT || 39.9042,
      ],
      viewMode: '3D',
      pitch: 0,
    }

    return new AMap.Map(container, {
      ...defaultOptions,
      ...options,
    })
  })
}

/**
 * 添加标记点
 */
export const addMarker = (
  map: any,
  position: [number, number],
  options?: any
) => {
  return new AMap.Marker({
    position,
    ...options,
    map,
  })
}

/**
 * 添加多个标记点
 */
export const addMarkers = (
  map: any,
  positions: Array<{ lng: number; lat: number;[key: string]: any }>
) => {
  return positions.map((pos) =>
    addMarker(map, [pos.lng, pos.lat], pos)
  )
}

/**
 * 绘制路线
 */
export const drawPolyline = (
  map: any,
  path: Array<[number, number]>,
  options?: any
) => {
  return new AMap.Polyline({
    path,
    strokeColor: '#3b82f6',
    strokeWeight: 4,
    strokeOpacity: 0.8,
    ...options,
    map,
  })
}

/**
 * 绘制轨迹线
 */
export const drawTrackLine = (
  map: any,
  points: Array<{ lng: number; lat: number }>
) => {
  const path = points.map((p) => [p.lng, p.lat])
  return drawPolyline(map, path as Array<[number, number]>, {
    strokeColor: '#ef4444',
    strokeWeight: 3,
    isOutline: true,
    outlineColor: '#ffffff',
    borderWeight: 1,
  })
}

/**
 * 自动适应视野
 */
export const fitView = (map: any, overlays?: any[]) => {
  if (overlays && overlays.length > 0) {
    map.setFitView(overlays)
  } else {
    map.setFitView()
  }
}

/**
 * 获取当前位置
 */
export const getCurrentPosition = (): Promise<{
  lng: number
  lat: number
  accuracy: number
}> => {
  return loadAMapScript().then(
    () =>
      new Promise((resolve, reject) => {
        const geolocation = new AMap.Geolocation({
          enableHighAccuracy: true,
          timeout: 10000,
        })

        geolocation.getCurrentPosition((status: string, result: any) => {
          if (status === 'complete') {
            resolve({
              lng: result.position.lng,
              lat: result.position.lat,
              accuracy: result.accuracy,
            })
          } else {
            reject(new Error('定位失败'))
          }
        })
      })
  )
}

/**
 * 地理编码（地址 -> 坐标）
 */
export const geocode = (address: string): Promise<{
  lng: number
  lat: number
  formattedAddress: string
}> => {
  return loadAMapScript().then(
    () =>
      new Promise((resolve, reject) => {
        const geocoder = new AMap.Geocoder()

        geocoder.getLocation(address, (status: string, result: any) => {
          if (status === 'complete' && result.geocodes.length) {
            const location = result.geocodes[0].location
            resolve({
              lng: location.lng,
              lat: location.lat,
              formattedAddress: result.geocodes[0].formattedAddress,
            })
          } else {
            reject(new Error('地理编码失败'))
          }
        })
      })
  )
}

/**
 * 逆地理编码（坐标 -> 地址）
 */
export const regeocode = (
  lng: number,
  lat: number
): Promise<string> => {
  return loadAMapScript().then(
    () =>
      new Promise((resolve, reject) => {
        const geocoder = new AMap.Geocoder()

        geocoder.getAddress([lng, lat], (status: string, result: any) => {
          if (status === 'complete' && result.regeocode) {
            resolve(result.regeocode.formattedAddress)
          } else {
            reject(new Error('逆地理编码失败'))
          }
        })
      })
  )
}

/**
 * 计算两点间距离（米）
 */
export const calculateDistance = (
  point1: { lng: number; lat: number },
  point2: { lng: number; lat: number }
): number => {
  if (typeof AMap === 'undefined') {
    throw new Error('AMap SDK not loaded')
  }

  const lngLat1 = new AMap.LngLat(point1.lng, point1.lat)
  const lngLat2 = new AMap.LngLat(point2.lng, point2.lat)

  return lngLat1.distance(lngLat2)
}

/**
 * 计算路线总距离（米）
 */
export const calculateRouteDistance = (
  points: Array<{ lng: number; lat: number }>
): number => {
  if (points.length < 2) {
    return 0
  }

  let totalDistance = 0
  for (let i = 0; i < points.length - 1; i++) {
    totalDistance += calculateDistance(points[i], points[i + 1])
  }

  return totalDistance
}

/**
 * 步行路线规划
 */
export const planWalkingRoute = (
  origin: [number, number],
  destination: [number, number]
): Promise<any> => {
  return loadAMapScript().then(
    () =>
      new Promise((resolve, reject) => {
        const walking = new AMap.Walking()

        walking.search(origin, destination, (status: string, result: any) => {
          if (status === 'complete') {
            resolve(result)
          } else {
            reject(new Error('路线规划失败'))
          }
        })
      })
  )
}

/**
 * 格式化距离
 */
export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)}米`
  }
  return `${(meters / 1000).toFixed(1)}公里`
}

/**
 * 格式化时长
 */
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}小时${minutes}分钟`
  }
  return `${minutes}分钟`
}

/**
 * 创建信息窗体
 */
export const createInfoWindow = (
  content: string | HTMLElement,
  options?: any
) => {
  return new AMap.InfoWindow({
    content,
    ...options,
  })
}

/**
 * 在地图上显示信息窗体
 */
export const showInfoWindow = (
  map: any,
  infoWindow: any,
  position: [number, number]
) => {
  infoWindow.open(map, position)
}

export default {
  loadAMapScript,
  createMap,
  addMarker,
  addMarkers,
  drawPolyline,
  drawTrackLine,
  fitView,
  getCurrentPosition,
  geocode,
  regeocode,
  calculateDistance,
  calculateRouteDistance,
  planWalkingRoute,
  formatDistance,
  formatDuration,
  createInfoWindow,
  showInfoWindow,
}
