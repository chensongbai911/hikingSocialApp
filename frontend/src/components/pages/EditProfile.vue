<template>
  <div class="edit-profile-page">
    <!-- 页面头部 -->
    <div class="sticky top-0 z-10 bg-white border-b border-gray-200">
      <div class="flex items-center justify-between px-4 py-4">
        <button @click="goBack" class="p-2">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>
        <h1 class="text-xl font-bold text-gray-800">编辑资料</h1>
        <button @click="saveProfile" class="text-teal-500 font-semibold">
          保存
        </button>
      </div>
    </div>

    <div class="px-4 py-6 pb-20">
      <!-- 头像上传 -->
      <div class="flex flex-col items-center mb-6">
        <div class="relative mb-2">
          <img
            :src="formData.avatar_url || 'https://via.placeholder.com/112'"
            alt="avatar"
            class="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
          />
          <button
            @click="uploadAvatar"
            class="absolute bottom-0 right-0 w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center border-4 border-white hover:bg-teal-600 transition-colors"
          >
            <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 4V1h2v3h3v2H5v3H3V6H0V4h3zm3 6V7h3V4h7l1.83 2H21c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V10h3zm7 9c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-3.2-5c0 1.77 1.43 3.2 3.2 3.2s3.2-1.43 3.2-3.2-1.43-3.2-3.2-3.2-3.2 1.43-3.2 3.2z"/>
            </svg>
          </button>
        </div>
        <p class="text-sm text-gray-500">点击修改头像</p>
      </div>

      <!-- 昵称 -->
      <div class="bg-white rounded-2xl shadow-sm p-5 mb-4">
        <label class="block text-sm font-semibold text-gray-500 mb-3">昵称</label>
        <input
          v-model="formData.nickname"
          type="text"
          placeholder="请输入昵称"
          class="w-full px-4 py-3 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-teal-500 outline-none text-gray-800"
        />
      </div>

      <!-- 性别和年龄 -->
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div class="bg-white rounded-2xl shadow-sm p-5">
          <label class="block text-sm font-semibold text-gray-500 mb-3">性别</label>
          <select
            v-model="formData.gender"
            class="w-full px-4 py-3 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-teal-500 outline-none text-gray-800"
          >
            <option value="male">男</option>
            <option value="female">女</option>
            <option value="other">其他</option>
          </select>
        </div>
        <div class="bg-white rounded-2xl shadow-sm p-5">
          <label class="block text-sm font-semibold text-gray-500 mb-3">年龄</label>
          <input
            v-model.number="formData.age"
            type="number"
            placeholder="请输入年龄"
            class="w-full px-4 py-3 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-teal-500 outline-none text-gray-800"
          />
        </div>
      </div>

      <!-- 地区选择 -->
      <div class="bg-white rounded-2xl shadow-sm p-5 mb-4">
        <label class="block text-sm font-semibold text-gray-500 mb-3">所在地区</label>
        <div class="grid grid-cols-2 gap-3">
          <select
            v-model="formData.province"
            @change="onProvinceChange"
            class="px-4 py-3 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-teal-500 outline-none text-gray-800"
          >
            <option value="">请选择省份</option>
            <option v-for="province in provinces" :key="province" :value="province">
              {{ province }}
            </option>
          </select>
          <select
            v-model="formData.city"
            :disabled="!formData.province"
            class="px-4 py-3 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-teal-500 outline-none text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">请选择城市</option>
            <option v-for="city in cities" :key="city" :value="city">
              {{ city }}
            </option>
          </select>
        </div>
      </div>

      <!-- 关于我 -->
      <div class="bg-white rounded-2xl shadow-sm p-5 mb-4">
        <div class="flex items-center justify-between mb-3">
          <label class="text-sm font-semibold text-gray-500">关于我</label>
          <span class="text-sm text-gray-400">{{ (formData.bio || '').length }}/100</span>
        </div>
        <textarea
          v-model="formData.bio"
          placeholder="介绍一下自己吧..."
          maxlength="100"
          rows="4"
          class="w-full px-4 py-3 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-teal-500 outline-none text-gray-800 resize-none"
        ></textarea>
      </div>

      <!-- 徒步偏好 -->
      <div class="bg-white rounded-2xl shadow-sm p-5 mb-4">
        <label class="block text-sm font-semibold text-gray-500 mb-3">徒步偏好</label>

        <!-- 已选偏好 -->
        <div class="flex flex-wrap gap-2 mb-4" v-if="formData.preferences.length > 0">
          <div
            v-for="(tag, index) in formData.preferences"
            :key="index"
            class="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-600 rounded-full text-sm font-medium"
          >
            <span>{{ tag }}</span>
            <button @click="removePreference(index)" class="hover:text-teal-800">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- 添加偏好按钮 -->
        <button
          @click="showSuggestedTags = !showSuggestedTags"
          class="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-teal-300 text-teal-500 rounded-full text-sm font-medium hover:bg-teal-50 transition-colors"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          <span>添加偏好</span>
        </button>

        <!-- 推荐标签 -->
        <div v-if="showSuggestedTags" class="mt-4 pt-4 border-t border-gray-100">
          <p class="text-sm text-gray-500 mb-3">推荐标签</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="(tag, index) in suggestedTags"
              :key="index"
              @click="addPreference(tag)"
              :disabled="formData.preferences.includes(tag)"
              :class="[
                'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                formData.preferences.includes(tag)
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-600 hover:bg-teal-50 hover:text-teal-600'
              ]"
            >
              {{ tag }}
            </button>
          </div>
        </div>
      </div>

      <!-- 保存按钮 -->
      <button
        @click="saveProfile"
        class="w-full py-4 bg-teal-500 text-white rounded-2xl font-semibold text-lg hover:bg-teal-600 transition-colors shadow-sm"
      >
        保存修改
      </button>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import type { UpdateProfileData } from '@/types';
import { compressImage } from '@/utils/imageUpload';
import { getAllProvinces, getCitiesByProvince } from '@/utils/chinaRegions';
import toast from '@/utils/toast';

const router = useRouter();
const userStore = useUserStore();

// 从store获取当前用户
const currentUser = computed(() => userStore.currentUser);

// 表单数据
const formData = ref<UpdateProfileData & { preferences: string[] }>({
  nickname: '',
  gender: 'other',
  age: undefined,
  bio: '',
  avatar_url: '',
  province: '',
  city: '',
  region: '',
  preferences: []
});

// 是否显示推荐标签
const showSuggestedTags = ref(false);

// 地区数据
const provinces = ref<string[]>(getAllProvinces());
const cities = ref<string[]>([]);

// 当省份改变时，更新城市列表
const onProvinceChange = () => {
  const province = formData.value.province;
  if (province) {
    cities.value = getCitiesByProvince(province);
    // 清空城市选择
    formData.value.city = '';
  } else {
    cities.value = [];
    formData.value.city = '';
  }
};

// 推荐标签
const suggestedTags = ref([
  '高难度爬升',
  '重装露营',
  '单身交友',
  '风景摄影',
  '周末出发',
  '休闲徒步',
  '宠物友好',
  '5-10km',
  '10-20km',
  '20km+',
  '爱看风景',
  '挑战自我',
  '团队协作',
  '户外烹饪'
]);

// 返回上一页
const goBack = () => {
  router.back();
};

// 上传头像
const uploadAvatar = () => {
  // 创建隐藏的 input 元素
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async (e: Event) => {
    const target = e.target as HTMLInputElement
    const file = target.files?.[0]
    if (file) {
      try {
        // 检查文件大小（最大5MB）
        if (file.size > 5 * 1024 * 1024) {
          toast.error('图片大小不能超过5MB')
          return
        }

        toast.info('正在上传头像...')

        // 压缩并上传
        const compressedBase64 = await compressImage(file, 400, 400, 0.8)
        formData.value.avatar_url = compressedBase64

        toast.success('头像上传成功，请点击保存')
      } catch (error) {
        console.error('上传头像失败:', error)
        toast.error('上传失败，请重试')
      }
    }
  }
  input.click()
};

// 添加偏好
const addPreference = (tag: string) => {
  if (!formData.value.preferences.includes(tag)) {
    formData.value.preferences.push(tag);
  }
};

// 删除偏好
const removePreference = (index: number) => {
  formData.value.preferences.splice(index, 1);
};

// 保存资料
const saveProfile = async () => {
  try {
    // 根据省份和城市构建完整地区描述
    let regionText = '';
    if (formData.value.province && formData.value.city) {
      regionText = `${formData.value.province} ${formData.value.city}`;
    } else if (formData.value.province) {
      regionText = formData.value.province;
    }

    const updateData: UpdateProfileData = {
      nickname: formData.value.nickname,
      gender: formData.value.gender,
      age: formData.value.age,
      bio: formData.value.bio,
      avatar_url: formData.value.avatar_url,
      province: formData.value.province,
      city: formData.value.city,
      region: regionText
    };

    const success = await userStore.updateProfile(updateData);

    if (success) {
      // 保存偏好
      if (formData.value.preferences.length > 0) {
        await userStore.updatePreferences(formData.value.preferences);
      }

      toast.success('资料保存成功');
      console.log('保存资料成功');
      router.back();
    } else {
      toast.error(userStore.error || '保存失败');
      console.error('保存资料失败:', userStore.error);
    }
  } catch (error) {
    toast.error('保存失败，请重试');
    console.error('保存资料失败:', error);
  }
};

// 加载用户资料
const loadUserProfile = async () => {
  try {
    if (!currentUser.value) {
      await userStore.fetchCurrentUser();
    }

    if (currentUser.value) {
      formData.value = {
        nickname: currentUser.value.nickname,
        gender: currentUser.value.gender,
        age: currentUser.value.age,
        bio: currentUser.value.bio || '',
        avatar_url: currentUser.value.avatar_url || '',
        province: currentUser.value.province || '',
        city: currentUser.value.city || '',
        region: currentUser.value.region || '',
        preferences: (currentUser.value.preferences || []).map(p => p.preference_value)
      };

      // 如果有省份，加载对应的城市列表
      if (formData.value.province) {
        cities.value = getCitiesByProvince(formData.value.province);
      }
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
.edit-profile-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f0fdfa 0%, #ffffff 100%);
}

/* 去除数字输入框的上下箭头 */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}
</style>
