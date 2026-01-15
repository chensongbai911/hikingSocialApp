<template>
  <div class="register-container">
    <div class="register-card">
      <h1 class="text-2xl font-bold mb-6 text-center">注册</h1>

      <form @submit.prevent="handleRegister" class="space-y-4">
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
            class="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>

        <div>
          <label for="nickname" class="block text-sm font-medium mb-2">昵称</label>
          <input
            v-model="form.nickname"
            type="text"
            id="nickname"
            placeholder="请输入昵称"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium mb-2">密码 (至少8个字符)</label>
          <input
            v-model="form.password"
            type="password"
            id="password"
            placeholder="请输入密码"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
            minlength="8"
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-primary text-white py-2 rounded-lg hover:bg-secondary disabled:opacity-50"
        >
          {{ loading ? '注册中...' : '注册' }}
        </button>
      </form>

      <p class="text-center mt-4">
        已有账号？
        <router-link to="/login" class="text-primary hover:underline">
          立即登录
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import toast from '@/utils/toast'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const errorMsg = ref('')
const form = ref({
  email: '',
  nickname: '',
  password: '',
})

const handleRegister = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const result = await userStore.register({
      email: form.value.email,
      nickname: form.value.nickname,
      password: form.value.password
    })

    if (result.success) {
      toast.success('注册成功！即将跳转到登录页面', 2000)
      // 延迟跳转，让用户看到成功提示
      setTimeout(() => {
        router.push({
          path: '/login',
          query: {
            email: form.value.email,
            password: form.value.password
          }
        })
      }, 1500)
    } else {
      errorMsg.value = result.error || '注册失败，请重试'
      toast.error(errorMsg.value)
    }
  } catch (error) {
    console.error('注册失败:', error)
    errorMsg.value = '注册失败，请重试'
    toast.error(errorMsg.value)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #00bfa5 0%, #26a69a 100%);
}

.register-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}
</style>
