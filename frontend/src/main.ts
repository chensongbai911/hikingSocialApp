// 前端主应用入口
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './styles/index.css'
import { registerServiceWorker, initPWAInstaller } from './utils/pwaInstaller'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

// 注册 Service Worker 和 PWA 安装功能
if (import.meta.env.PROD) {
  registerServiceWorker().then((registered) => {
    if (registered) {
      console.log('[PWA] Service Worker registered successfully')
      initPWAInstaller()
    }
  })
} else {
  console.log('[PWA] Service Worker disabled in development mode')
}
