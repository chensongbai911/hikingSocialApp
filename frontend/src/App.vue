<template>
  <div id="app" class="app pb-20">
    <!-- 路由视图 -->
    <RouterView />
    <!-- 底部导航栏 -->
    <TabBar />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useUserStore } from '@/stores/user'
import TabBar from '@/components/common/TabBar.vue'

const userStore = useUserStore()

onMounted(() => {
  // 从 localStorage 恢复用户会话
  userStore.initUser()
})
</script>

<style scoped>
#app {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
}
</style>
