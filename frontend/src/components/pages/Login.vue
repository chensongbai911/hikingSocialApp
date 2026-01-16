<template>
  <div class="login-container">
    <div class="login-card">
      <h1 class="text-2xl font-bold mb-6 text-center">登录</h1>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div v-if="errorMsg" class="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {{ errorMsg }}
        </div>

        <div>
          <label for="email" class="block text-sm font-medium mb-2">邮箱</label>
          <input
            v-model="form.email"
            type="email"
            id="email"
            placeholder="请输入邮箱"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
            required
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium mb-2">密码</label>
          <input
            v-model="form.password"
            type="password"
            id="password"
            placeholder="请输入密码"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
            required
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-primary text-white py-2 rounded-lg hover:bg-secondary disabled:opacity-50"
        >
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>

      <p class="text-center mt-4">
        没有账号？
        <router-link to="/register" class="text-primary hover:underline">
          立即注册
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { initWebSocket } from '@/utils/websocket'
import toast from '@/utils/toast'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const loading = ref(false)
const errorMsg = ref('')
const form = ref({
  email: '',
  password: '',
})

// 从注册页面跳转过来时自动填充表单
onMounted(() => {
  if (route.query.email) {
    form.value.email = route.query.email as string
  }
  if (route.query.password) {
    form.value.password = route.query.password as string
  }
})

const handleLogin = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const success = await userStore.login(form.value)

    if (success) {
      // 初始化WebSocket连接
      initWebSocket()
      toast.success('登录成功')
      router.push('/discover')
    } else {
      errorMsg.value = userStore.error || '登录失败，请检查邮箱和密码'
      toast.error(errorMsg.value)
    }
  } catch (error) {
    console.error('登录失败:', error)
    errorMsg.value = '登录失败，请重试'
    toast.error(errorMsg.value)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%);
  overflow: hidden;
}

.login-container::before {
  content: '';
  position: absolute;
  width: 200%;
  height: 200%;
  background:
    radial-gradient(circle at 20% 50%, rgba(14, 165, 233, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.15) 0%, transparent 50%),
    url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  animation: drift 60s linear infinite;
}

@keyframes drift {
  0% { transform: translate(0, 0); }
  100% { transform: translate(-50%, -50%); }
}

.login-card {
  position: relative;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  padding: 40px;
  border-radius: 24px;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  width: 100%;
  max-width: 420px;
  transform: translateY(0);
  transition: all 0.3s ease;
}

.login-card:hover {
  transform: translateY(-5px);
  box-shadow:
    0 30px 80px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
}
</style>
