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
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #00bfa5 0%, #26a69a 100%);
}

.login-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}
</style>
