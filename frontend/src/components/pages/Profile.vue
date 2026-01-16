<template>
  <div class="profile-page">
    <!-- 页面头部 -->
    <div class="sticky top-0 z-10 bg-white border-b border-gray-200">
      <div class="flex items-center justify-between px-4 py-4">
        <button @click="goBack" class="p-2">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>
        <h1 class="text-xl font-bold text-gray-800">个人资料</h1>
        <button @click="goToSettings" class="p-2">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="px-4 py-6 pb-20">
      <!-- 头像和基本信息 -->
      <div class="flex flex-col items-center mb-6">
        <div class="relative mb-4">
          <img
            :src="(userProfile.avatar || defaultAvatar) + '?t=' + avatarTimestamp"
            :alt="userProfile.nickname"
            class="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg cursor-pointer hover:opacity-80 transition-opacity"
            @click="openAvatarUpload"
          />
          <div class="absolute bottom-0 right-0 w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center border-4 border-white cursor-pointer hover:bg-teal-600 transition-colors" @click="openAvatarUpload">
            <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9.5A1.5 1.5 0 004.5 8h15A1.5 1.5 0 0121 9.5v9a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 18.5v-9zm9-2a4 4 0 110 8 4 4 0 010-8z" fill="currentColor"/>
            </svg>
          </div>
        </div>

        <div class="flex items-center gap-2 mb-1">
          <h2 class="text-2xl font-bold text-gray-800">{{ userProfile.nickname }}</h2>
          <svg v-if="userProfile.gender === 'male'" class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 9c0-1.65 1.35-3 3-3s3 1.35 3 3-1.35 3-3 3-3-1.35-3-3zm0 8c0 1.93 2.69 3 6 3s6-1.07 6-3v-1H9v1z"/>
            <path d="M17.5 3h-3v1.5H16v1.59c-.74-.27-1.54-.43-2.38-.43C10.07 5.66 7 8.73 7 12.5S10.07 19.34 13.62 19.34c2.14 0 4.04-1.04 5.22-2.63l1.42 1.42 1.06-1.06-1.42-1.42C20.7 14.48 21 13.46 21 12.5c0-2.36-1.23-4.43-3.09-5.61V5.5h1.5V4h-1.91V3zm-3.88 14.84c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
          </svg>
          <span class="px-3 py-1 bg-blue-50 text-blue-600 text-sm font-semibold rounded-full">
            {{ userProfile.age }}
          </span>
        </div>
      </div>

      <!-- 关于我 -->
      <div class="bg-white rounded-2xl shadow-sm p-5 mb-4">
        <h3 class="text-sm font-semibold text-gray-500 mb-3">关于我</h3>
        <p class="text-gray-700 leading-relaxed">
          {{ userProfile.bio }}
        </p>
      </div>

      <!-- 地区信息 -->
      <div class="bg-white rounded-2xl shadow-sm p-5 mb-4">
        <h3 class="text-sm font-semibold text-gray-500 mb-3">所在地</h3>
        <div class="flex items-center gap-2 text-gray-700">
          <svg class="w-5 h-5 text-teal-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          <span>
            {{ getLocationText() }}
          </span>
        </div>
      </div>

      <!-- 徒步偏好 -->
      <div class="bg-white rounded-2xl shadow-sm p-5 mb-4">
        <h3 class="text-sm font-semibold text-gray-500 mb-3">我的徒步偏好</h3>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="(tag, index) in userProfile.preferences"
            :key="index"
            class="px-4 py-2 bg-teal-50 text-teal-600 rounded-full text-sm font-medium"
          >
            {{ tag }}
          </span>
        </div>
      </div>

      <!-- 生活相册 -->
      <div class="bg-white rounded-2xl shadow-sm p-5 mb-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-semibold text-gray-500">生活相册</h3>
          <span class="text-xs text-gray-400">{{ userProfile.photos.length }}/9</span>
        </div>
        <div class="grid grid-cols-3 gap-3">
          <div
            v-for="(photo, index) in userProfile.photos"
            :key="photo.id"
            class="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 group"
          >
            <img
              :src="photo.photo_url"
              :alt="'photo-' + index"
              class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              @click="previewPhoto(index)"
            />
            <!-- 删除按钮 -->
            <button
              @click.stop="deletePhoto(photo.id)"
              class="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
            >
              <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
          <!-- 添加照片按钮 -->
          <div
            v-if="userProfile.photos.length < 9"
            class="aspect-square rounded-2xl overflow-hidden bg-gray-50 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 hover:border-teal-400 transition-all"
            @click="addPhoto"
          >
            <svg class="w-8 h-8 text-teal-400 mb-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 7v2.99s-1.99.01-2 0V7h-3s.01-1.99 0-2h3V2h2v3h3v2h-3zm-3 4V8h-3V5H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8h-3zM5 19l3-4 2 3 3-4 4 5H5z"/>
            </svg>
            <span class="text-xs text-teal-500 font-medium">添加照片</span>
          </div>
        </div>
      </div>

      <!-- 编辑资料按钮 -->
      <button
        @click="editProfile"
        class="w-full py-4 bg-teal-500 text-white rounded-2xl font-semibold text-lg hover:bg-teal-600 transition-colors mb-4 shadow-sm"
      >
        编辑资料
      </button>

      <!-- 隐私设置入口 -->
      <button
        @click="goToPrivacySettings"
        class="w-full flex items-center justify-between bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
      >
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center">
            <svg class="w-5 h-5 text-teal-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
            </svg>
          </div>
          <span class="text-gray-800 font-medium">隐私设置</span>
        </div>
        <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
        </svg>
      </button>
    </div>

    <!-- 照片预览弹窗 -->
    <div
      v-if="showPreview"
      class="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
      @click="closePreview"
    >
      <div class="relative w-full h-full flex items-center justify-center p-4">
        <!-- 关闭按钮 -->
        <button
          @click="closePreview"
          class="absolute top-4 right-4 w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all z-10"
        >
          <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>

        <!-- 上一张按钮 -->
        <button
          v-if="currentPreviewIndex > 0"
          @click.stop="prevPhoto"
          class="absolute left-4 w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all z-10"
        >
          <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>

        <!-- 照片 -->
        <img
          :src="userProfile.photos[currentPreviewIndex]?.photo_url"
          :alt="'preview-' + currentPreviewIndex"
          class="max-w-full max-h-full object-contain"
          @click.stop
        />

        <!-- 下一张按钮 -->
        <button
          v-if="currentPreviewIndex < userProfile.photos.length - 1"
          @click.stop="nextPhoto"
          class="absolute right-4 w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all z-10"
        >
          <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
          </svg>
        </button>

        <!-- 照片索引 -->
        <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-white bg-opacity-20 rounded-full text-white text-sm">
          {{ currentPreviewIndex + 1 }} / {{ userProfile.photos.length }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { uploadPhotos, compressImage } from '@/utils/imageUpload';
import toast from '@/utils/toast';

const router = useRouter();
const userStore = useUserStore();

// 默认头像
const defaultAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default';
const showAvatarUpload = ref(false);
const avatarFile = ref<File | null>(null);
const avatarTimestamp = ref(Date.now());

// 照片预览相关状态
const showPreview = ref(false);
const currentPreviewIndex = ref(0);

// 从store获取用户数据
const currentUser = computed(() => userStore.currentUser);

// 用户资料数据 - 使用computed从store映射
const userProfile = computed(() => {
  if (!currentUser.value) {
    return {
      avatar: 'https://via.placeholder.com/112',
      nickname: '加载中...',
      gender: 'other',
      age: 0,
      bio: '',
      preferences: [],
      photos: []
    };
  }

  // 提取偏好标签的显示文本
  const preferenceLabels = (currentUser.value.preferences || []).map(p => p.preference_value);
  // 提取照片数据（包含id和url）
  const photos = (currentUser.value.photos || []).map(p => ({
    id: p.id,
    photo_url: p.photo_url
  }));

  return {
    avatar: currentUser.value.avatar_url || 'https://via.placeholder.com/112',
    nickname: currentUser.value.nickname,
    gender: currentUser.value.gender,
    age: currentUser.value.age || 0,
    bio: currentUser.value.bio || '这个人很懒，什么都没写...',
    province: currentUser.value.province || '',
    city: currentUser.value.city || '',
    region: currentUser.value.region || '',
    preferences: preferenceLabels,
    photos: photos
  };
});

// 返回上一页
const goBack = () => {
  router.back();
};

// 前往设置页面
const goToSettings = () => {
  // TODO: 实现设置页面路由
  console.log('前往设置页面');
};

// 编辑资料
const editProfile = () => {
  router.push('/edit-profile');
};

// 添加照片
const addPhoto = () => {
  // 创建隐藏的 input 元素
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.multiple = true // 支持多选
  input.onchange = async (e: Event) => {
    const target = e.target as HTMLInputElement
    const files = target.files
    if (files && files.length > 0) {
      try {
        // 检查照片数量（最多9张）
        const currentPhotoCount = userProfile.value.photos.length
        if (currentPhotoCount + files.length > 9) {
          toast.warning(`最多只能上传9张照片，当前已有${currentPhotoCount}张`)
          return
        }

        toast.info(`正在上传${files.length}张照片...`)

        // 上传所有照片
        const fileArray = Array.from(files)
        const newPhotos = await uploadPhotos(fileArray)

        // 立即添加到本地显示
        newPhotos.forEach(photo => {
          userStore.addLocalPhoto(photo)
        })

        toast.success('照片上传成功')
      } catch (error) {
        console.error('上传照片失败:', error)
        toast.error('上传失败，请重试')
      }
    }
  }
  input.click()
};

// 删除照片
const deletePhoto = async (photoId: string) => {
  try {
    // 确认删除
    if (!confirm('确定要删除这张照片吗？')) {
      return
    }

    toast.info('正在删除照片...')

    // 调用API删除
    const success = await userStore.deletePhoto(photoId)

    if (success) {
      toast.success('照片已删除')
    }
  } catch (error) {
    console.error('删除照片失败:', error)
    toast.error('删除失败，请重试')
  }
};

// 预览照片
const previewPhoto = (index: number) => {
  currentPreviewIndex.value = index;
  showPreview.value = true;
};

// 关闭预览
const closePreview = () => {
  showPreview.value = false;
};

// 上一张照片
const prevPhoto = () => {
  if (currentPreviewIndex.value > 0) {
    currentPreviewIndex.value--;
  }
};

// 下一张照片
const nextPhoto = () => {
  if (currentPreviewIndex.value < userProfile.value.photos.length - 1) {
    currentPreviewIndex.value++;
  }
};

// 前往隐私设置
const goToPrivacySettings = () => {
  router.push('/privacy-settings');
};

// 打开头像上传
const openAvatarUpload = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      try {
        avatarFile.value = file;
        await uploadAndUpdateAvatar(file);
      } catch (error) {
        console.error('头像上传失败:', error);
        toast.error('头像上传失败，请重试');
      }
    }
  };
  input.click();
};

// 上传并更新头像
const uploadAndUpdateAvatar = async (file: File) => {
  try {
    toast.info('正在上传头像...');

    // 调用 userStore 中的头像上传方法
    const newAvatarUrl = await userStore.uploadAvatar(file);

    if (newAvatarUrl) {
      toast.success('头像已更新');
      // 重新加载用户信息
      await userStore.fetchCurrentUser();
      // 更新时间戳强制刷新图片
      avatarTimestamp.value = Date.now();
    } else {
      toast.error('头像上传失败');
    }
  } catch (error) {
    console.error('更新头像失败:', error);
    throw error;
  }
};

// 获取地区文本
const getLocationText = () => {
  const { region, province, city } = userProfile.value;
  if (region) return region;
  const location = [province, city].filter(Boolean).join(' ');
  return location || '未设置';
};

// 加载用户资料
const loadUserProfile = async () => {
  try {
    if (!currentUser.value) {
      await userStore.fetchCurrentUser();
    }
    console.log('用户资料加载成功');
  } catch (error) {
    console.error('加载用户资料失败:', error);
  }
};

onMounted(() => {
  loadUserProfile();
});
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f0fdfa 0%, #ffffff 100%);
}
</style>
