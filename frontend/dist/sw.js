// Service Worker for PWA
const CACHE_NAME = 'hiking-social-v1.0.0';
const RUNTIME_CACHE = 'hiking-social-runtime';

// 需要缓存的静态资源
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// 安装事件 - 缓存静态资源
self.addEventListener('install', (event) => {
  console.log('[SW] Install event');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // 强制激活新的 Service Worker
  self.skipWaiting();
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  // 立即控制所有页面
  return self.clients.claim();
});

// 请求拦截 - 网络优先策略（API请求）+ 缓存优先策略（静态资源）
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API 请求：网络优先
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // 克隆响应并缓存
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // 网络失败时使用缓存
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // 返回离线提示
            return new Response(
              JSON.stringify({
                code: 503,
                message: '网络连接失败，请检查网络设置'
              }),
              {
                headers: { 'Content-Type': 'application/json' },
                status: 503
              }
            );
          });
        })
    );
    return;
  }

  // 静态资源：缓存优先
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((response) => {
        // 只缓存成功的 GET 请求
        if (
          !response ||
          response.status !== 200 ||
          request.method !== 'GET'
        ) {
          return response;
        }

        const responseClone = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(request, responseClone);
        });

        return response;
      });
    })
  );
});

// 后台同步（可选）
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-activities') {
    event.waitUntil(syncActivities());
  }
});

async function syncActivities () {
  try {
    // 同步离线期间创建的活动
    const offlineData = await getOfflineData();
    if (offlineData.length > 0) {
      for (const data of offlineData) {
        await fetch('/api/v1/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      }
      await clearOfflineData();
    }
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}

async function getOfflineData () {
  // 从 IndexedDB 获取离线数据（简化版本）
  return [];
}

async function clearOfflineData () {
  // 清空 IndexedDB 离线数据（简化版本）
}

// 推送通知（可选）
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : '有新的徒步活动！',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    tag: 'hiking-notification',
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification('徒步社交', options)
  );
});

// 通知点击事件
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
