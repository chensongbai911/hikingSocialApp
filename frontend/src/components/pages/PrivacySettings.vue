<template>
  <div class="privacy-settings-page h-screen flex flex-col overflow-hidden">
    <!-- 页面头部 -->
    <div class="sticky top-0 z-10 bg-white border-b border-gray-200 flex-shrink-0">
      <div class="flex items-center justify-between px-4 py-4">
        <button @click="goBack" class="p-2">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>
        <h1 class="text-xl font-bold text-gray-800">隐私设置</h1>
        <div class="w-10"></div>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto px-4 py-6 pb-20">
      <!-- 隐私说明 -->
      <div class="bg-teal-50 rounded-2xl p-4 mb-6">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-teal-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
            </svg>
          </div>
          <div>
            <h3 class="text-sm font-semibold text-teal-800 mb-1">保护您的隐私</h3>
            <p class="text-xs text-teal-700 leading-relaxed">
              您可以控制其他用户查看您的个人信息和活动记录的权限。调整以下设置来保护您的隐私。
            </p>
          </div>
        </div>
      </div>

      <!-- 隐私选项 -->
      <div class="bg-white rounded-2xl shadow-sm divide-y divide-gray-100">
        <!-- 隐藏真实姓名 -->
        <div class="p-5">
          <div class="flex items-center justify-between">
            <div class="flex-1 pr-4">
              <h3 class="text-base font-semibold text-gray-800 mb-1">隐藏真实姓名</h3>
              <p class="text-sm text-gray-500">其他用户只能看到您的昵称</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                v-model="privacySettings.hideRealName"
                class="sr-only peer"
                @change="updateSettings"
              />
              <div class="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-100 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-teal-500"></div>
            </label>
          </div>
        </div>

        <!-- 隐藏准确年龄 -->
        <div class="p-5">
          <div class="flex items-center justify-between">
            <div class="flex-1 pr-4">
              <h3 class="text-base font-semibold text-gray-800 mb-1">隐藏准确年龄</h3>
              <p class="text-sm text-gray-500">显示年龄范围而非精确年龄</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                v-model="privacySettings.hideExactAge"
                class="sr-only peer"
                @change="updateSettings"
              />
              <div class="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-100 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-teal-500"></div>
            </label>
          </div>
        </div>

        <!-- 仅好友可查看徒步记录 -->
        <div class="p-5">
          <div class="flex items-center justify-between">
            <div class="flex-1 pr-4">
              <h3 class="text-base font-semibold text-gray-800 mb-1">仅好友可查看徒步记录</h3>
              <p class="text-sm text-gray-500">其他用户无法查看您的活动历史</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                v-model="privacySettings.friendsOnlyActivities"
                class="sr-only peer"
                @change="updateSettings"
              />
              <div class="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-100 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-teal-500"></div>
            </label>
          </div>
        </div>

        <!-- 向非好友隐藏位置 -->
        <div class="p-5">
          <div class="flex items-center justify-between">
            <div class="flex-1 pr-4">
              <h3 class="text-base font-semibold text-gray-800 mb-1">向非好友隐藏位置</h3>
              <p class="text-sm text-gray-500">仅好友可查看您的实时位置</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                v-model="privacySettings.hideLocationFromNonFriends"
                class="sr-only peer"
                @change="updateSettings"
              />
              <div class="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-100 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-teal-500"></div>
            </label>
          </div>
        </div>
      </div>

      <!-- 黑名单管理 -->
      <button
        @click="goToBlockList"
        class="w-full mt-6 flex items-center justify-between bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
      >
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <svg class="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31C15.55 19.37 13.85 20 12 20zm6.31-3.1L7.1 5.69C8.45 4.63 10.15 4 12 4c4.42 0 8 3.58 8 8 0 1.85-.63 3.55-1.69 4.9z"/>
            </svg>
          </div>
          <div class="text-left">
            <h3 class="text-base font-semibold text-gray-800">黑名单管理</h3>
            <p class="text-sm text-gray-500">管理已屏蔽的用户</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-teal-500 font-medium">{{ blockListCount }}</span>
          <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
          </svg>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 隐私设置
const privacySettings = ref({
  hideRealName: false,
  hideExactAge: false,
  friendsOnlyActivities: false,
  hideLocationFromNonFriends: false
});

// 黑名单数量
const blockListCount = ref(0);

// 返回上一页
const goBack = () => {
  router.back();
};

// 前往黑名单管理
const goToBlockList = () => {
  // TODO: 实现黑名单管理页面路由
  console.log('前往黑名单管理');
};

// 更新设置
const updateSettings = async () => {
  try {
    // TODO: 调用API保存隐私设置
    // await userStore.updatePrivacySettings(privacySettings.value);

    console.log('隐私设置已更新:', privacySettings.value);
  } catch (error) {
    console.error('更新隐私设置失败:', error);
  }
};

// 加载隐私设置
const loadPrivacySettings = async () => {
  try {
    // TODO: 从API获取隐私设置
    // const response = await userStore.getPrivacySettings();
    // privacySettings.value = response.data;

    // 临时使用默认数据
    privacySettings.value = {
      hideRealName: true,
      hideExactAge: false,
      friendsOnlyActivities: false,
      hideLocationFromNonFriends: true
    };

    // TODO: 从API获取黑名单数量
    // const blockListResponse = await userStore.getBlockList();
    // blockListCount.value = blockListResponse.data.length;
    blockListCount.value = 3;

    console.log('隐私设置加载成功');
  } catch (error) {
    console.error('加载隐私设置失败:', error);
  }
};

onMounted(() => {
  loadPrivacySettings();
});
</script>

<style scoped>
.privacy-settings-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f0fdfa 0%, #ffffff 100%);
}

/* 隐藏checkbox的原生样式 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
