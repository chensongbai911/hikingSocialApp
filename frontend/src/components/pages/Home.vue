<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-primary mb-4">Home - 首页</h1>
    <p class="text-gray-600">推荐活动和内容展示区域（未来实现）</p>
    <div class="mt-6">
      <router-link to="/discover" class="btn btn-primary">
        发现更多
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<style scoped>
.container {
  max-width: 1200px;
}

.btn {
  display: inline-block;
  padding: 10px 20px;
  border-radius: 8px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #00bfa5;
  color: white;
}

.btn-primary:hover {
  background-color: #26a69a;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 191, 165, 0.3);
}
</style>
