<template>
  <div
    id="app"
    class="app h-full flex flex-col overflow-hidden"
    :class="{ 'pb-20': shouldShowTabBar, 'pt-safe': true }"
  >
    <!-- 路由视图 -->
    <div class="flex-1 min-h-0 overflow-y-auto app-scroll">
      <RouterView />
    </div>
    <!-- 底部导航栏 - 只在特定页面显示 -->
    <TabBar v-if="shouldShowTabBar" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import TabBar from '@/components/common/TabBar.vue'

const userStore = useUserStore()
const route = useRoute()

// 不需要显示TabBar的页面列表
const noTabBarPages = ['/login', '/register', '/chat', '/create-activity']

// 判断是否应该显示TabBar
const shouldShowTabBar = computed(() => {
  return !noTabBarPages.includes(route.path)
})

onMounted(() => {
  // 从 localStorage 恢复用户会话
  userStore.initUser()
})
</script>

<style scoped>
#app {
  width: 100%;
  height: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
}
</style>
