// 路由配置
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/discover',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/components/pages/Login.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/components/pages/Register.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/discover',
    name: 'Discover',
    component: () => import('@/components/pages/Discover.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/my-hiking',
    name: 'MyHiking',
    component: () => import('@/components/pages/MyHiking.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/components/pages/Profile.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/edit-profile',
    name: 'EditProfile',
    component: () => import('@/components/pages/EditProfile.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/privacy-settings',
    name: 'PrivacySettings',
    component: () => import('@/components/pages/PrivacySettings.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/activity/:id',
    name: 'ActivityDetail',
    component: () => import('@/components/pages/ActivityDetail.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/create-activity',
    name: 'CreateActivity',
    component: () => import('@/components/pages/CreateActivity.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/user/:id',
    name: 'user-profile',
    component: () => import('@/components/pages/UserProfile.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/messages',
    name: 'Messages',
    component: () => import('@/components/pages/Messages.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/messages/system',
    name: 'SystemNotifications',
    component: () => import('@/components/pages/SystemNotifications.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/messages/activity',
    name: 'ActivityNotifications',
    component: () => import('@/components/pages/ActivityNotifications.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/chat/:id',
    name: 'ChatWindow',
    component: () => import('@/components/pages/ChatWindow.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/friends',
    name: 'AddFriend',
    component: () => import('@/components/features/AddFriend.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/message-center',
    name: 'MessageCenter',
    component: () => import('@/components/features/MessageCenter.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/user-guide',
    name: 'UserGuide',
    component: () => import('@/components/pages/UserGuide.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/hiking-mode',
    name: 'HikingMode',
    component: () => import('@/components/pages/HikingMode.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/hiking-report/:id',
    name: 'HikingReport',
    component: () => import('@/components/pages/HikingReport.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/route-creator',
    name: 'RouteCreator',
    component: () => import('@/components/pages/RouteCreator.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/offline-map',
    name: 'OfflineMap',
    component: () => import('@/components/pages/OfflineMap.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/routes',
    name: 'RouteList',
    component: () => import('@/components/pages/RouteList.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/route/:id',
    name: 'RouteDetail',
    component: () => import('@/components/pages/RouteDetail.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/track-recorder',
    name: 'TrackRecorder',
    component: () => import('@/components/pages/TrackRecorder.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/track/:id',
    name: 'TrackDetail',
    component: () => import('@/components/pages/TrackDetail.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/hiking-report',
    name: 'HikingReport',
    component: () => import('@/components/pages/HikingReport.vue'),
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory((import.meta as any).env.BASE_URL),
  routes,
})

// 导航守卫
router.beforeEach(async (to, _from, next) => {
  const userStore = useUserStore()
  const requiresAuth = to.meta.requiresAuth !== false // 默认需要登录

  console.log(`Navigating to: ${to.path}, requires auth: ${requiresAuth}, logged in: ${userStore.isLoggedIn}`)

  // 未登录且需要认证的路由，重定向到登录页
  if (requiresAuth && !userStore.isLoggedIn) {
    console.log('Redirecting to login')
    next('/login')
  }
  // 已登录访问登录/注册页，重定向到发现页
  else if ((to.path === '/login' || to.path === '/register') && userStore.isLoggedIn) {
    console.log('Already logged in, redirecting to discover')
    next('/discover')
  }
  else {
    console.log('Navigation allowed')
    next()
  }
})

export default router
