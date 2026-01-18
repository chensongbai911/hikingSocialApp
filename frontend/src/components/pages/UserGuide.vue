<template>
  <div class="user-guide min-h-screen flex flex-col bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 relative overflow-hidden">
    <!-- 动态背景装饰 -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-0 left-0 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute bottom-0 right-0 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 2s"></div>
      <div class="absolute top-1/2 left-1/2 w-72 h-72 bg-cyan-200/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 4s"></div>
    </div>

    <!-- 内容层 -->
    <div class="relative z-10 flex flex-col flex-1">
      <!-- 标题 -->
      <div class="px-6 pt-8 pb-2 text-center">
        <div class="flex items-center justify-center gap-2 mb-3">
          <svg class="w-8 h-8 text-teal-500 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10.666A1 1 0 018 18.57V13H4a1 1 0 01-.82-1.573l7-10.666a1 1 0 011.12-.26z" clip-rule="evenodd" />
          </svg>
          <h1 class="text-3xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
            欢迎加入
          </h1>
        </div>
        <p class="text-gray-600 text-base">完善你的信息，开启徒步之旅</p>
      </div>

      <!-- 步骤指示器 -->
      <div class="flex justify-between px-6 py-4">
        <div v-for="(step, index) in steps" :key="index" class="flex flex-col items-center flex-1">
          <div
            :class="[
              'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all',
              currentStep === index
                ? 'bg-teal-500 text-white scale-110 shadow-lg'
                : currentStep > index
                ? 'bg-teal-200 text-teal-700'
                : 'bg-gray-200 text-gray-500'
            ]"
          >
            {{ index + 1 }}
          </div>
          <p class="text-xs text-center mt-2 text-gray-700">{{ step.label }}</p>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="flex-1 px-6 py-4 overflow-y-auto">
        <!-- 步骤 1: 基本信息 -->
        <div v-if="currentStep === 0" class="space-y-4 animate-fade-in">
          <div class="text-center mb-6">
            <div class="text-5xl mb-3">👤</div>
            <h2 class="text-2xl font-bold text-gray-800">基本信息</h2>
            <p class="text-sm text-gray-600 mt-2">让我们了解一下你</p>
          </div>

          <!-- 昵称 -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">昵称 *</label>
            <input
              v-model="formData.nickname"
              type="text"
              placeholder="输入你的昵称"
              maxlength="20"
              class="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-teal-500 text-base transition"
            />
            <p class="text-xs text-gray-500 mt-1">{{ formData.nickname.length }}/20</p>
          </div>

          <!-- 年龄 -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">年龄 *</label>
              <select
                v-model="formData.age"
                class="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-teal-500 text-base transition"
              >
                <option value="">选择年龄</option>
                <option v-for="age in 70" :key="age" :value="age">{{ age + 18 }}岁</option>
              </select>
            </div>

            <!-- 性别 -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">性别 *</label>
              <select
                v-model="formData.gender"
                class="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-teal-500 text-base transition"
              >
                <option value="">选择性别</option>
                <option value="male">男</option>
                <option value="female">女</option>
                <option value="other">其他</option>
              </select>
            </div>
          </div>

          <!-- 简介 -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">个人简介</label>
            <textarea
              v-model="formData.bio"
              placeholder="分享一些关于你自己的信息..."
              maxlength="100"
              class="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-teal-500 text-base transition resize-none"
              rows="3"
            ></textarea>
            <p class="text-xs text-gray-500 mt-1">{{ formData.bio.length }}/100</p>
          </div>
        </div>

        <!-- 步骤 2: 头像上传 -->
        <div v-if="currentStep === 1" class="space-y-4 animate-fade-in">
          <div class="text-center mb-6">
            <div class="text-5xl mb-3">📷</div>
            <h2 class="text-2xl font-bold text-gray-800">上传头像</h2>
            <p class="text-sm text-gray-600 mt-2">让大家认识你</p>
          </div>

          <!-- 头像预览 -->
          <div class="flex justify-center mb-6">
            <div class="relative">
              <div class="w-32 h-32 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-full flex items-center justify-center overflow-hidden border-4 border-teal-500 shadow-xl">
                <img
                  v-if="formData.avatar"
                  :src="formData.avatar"
                  alt="头像预览"
                  class="w-full h-full object-cover"
                />
                <span v-else class="text-5xl">👤</span>
              </div>
              <!-- 上传指示器 -->
              <div class="absolute bottom-0 right-0 bg-teal-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-lg cursor-pointer hover:bg-teal-600 transition">
                +
              </div>
            </div>
          </div>

          <!-- 上传输入（隐藏） -->
          <input
            ref="avatarInput"
            type="file"
            accept="image/*"
            @change="handleAvatarUpload"
            class="hidden"
          />

          <!-- 上传按钮 -->
          <button
            @click="avatarInput?.click()"
            class="w-full py-3 bg-white border-2 border-dashed border-teal-300 rounded-2xl text-teal-600 font-semibold hover:border-teal-500 hover:bg-teal-50 transition"
          >
            📁 选择图片
          </button>

          <!-- 提示 -->
          <div class="bg-teal-50 rounded-xl p-3 border border-teal-200">
            <p class="text-xs text-teal-700">💡 选择一张清晰的照片，最好是最近的证件照或自拍</p>
          </div>
        </div>

        <!-- 步骤 3: 兴趣爱好 -->
        <div v-if="currentStep === 2" class="space-y-4 animate-fade-in">
          <div class="text-center mb-6">
            <div class="text-5xl mb-3">🏔️</div>
            <h2 class="text-2xl font-bold text-gray-800">徒步偏好</h2>
            <p class="text-sm text-gray-600 mt-2">选择你感兴趣的徒步类型</p>
          </div>

          <!-- 难度等级 -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-3">难度偏好</label>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="level in ['入门', '中等', '困难']"
                :key="level"
                @click="togglePreference(level)"
                :class="[
                  'py-3 rounded-xl font-semibold transition-all',
                  formData.preferences.includes(level)
                    ? level === '入门'
                      ? 'bg-green-500 text-white shadow-lg'
                      : level === '中等'
                      ? 'bg-yellow-500 text-white shadow-lg'
                      : 'bg-red-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                ]"
              >
                {{ level }}
              </button>
            </div>
          </div>

          <!-- 兴趣标签 -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-3">兴趣标签 (选择 2-5 个)</label>
            <div class="flex gap-2 flex-wrap">
              <button
                v-for="tag in availableTags"
                :key="tag"
                @click="togglePreference(tag)"
                :class="[
                  'px-4 py-2 rounded-full font-medium transition-all text-sm',
                  formData.preferences.includes(tag)
                    ? 'bg-teal-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                ]"
              >
                {{ tag }}
              </button>
            </div>
          </div>

          <!-- 验证提示 -->
          <div v-if="formData.preferences.length < 2" class="bg-amber-50 rounded-xl p-3 border border-amber-200">
            <p class="text-xs text-amber-700">⚠️ 请至少选择 2 个偏好</p>
          </div>
        </div>

        <!-- 步骤 4: 完成 -->
        <div v-if="currentStep === 3" class="space-y-4 animate-fade-in text-center">
          <div class="pt-8">
            <div class="text-6xl mb-4 animate-bounce">🎉</div>
            <h2 class="text-3xl font-bold text-gray-800 mb-2">准备好了！</h2>
            <p class="text-gray-600 mb-6">你的信息已完善，现在可以开启徒步之旅了</p>

            <!-- 信息摘要 -->
            <div class="bg-white rounded-2xl p-6 mb-6 space-y-3 text-left border border-gray-200">
              <div class="flex items-center justify-between">
                <span class="text-gray-600">昵称：</span>
                <span class="font-semibold text-gray-800">{{ formData.nickname }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-600">年龄：</span>
                <span class="font-semibold text-gray-800">{{ formData.age }}岁</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-600">性别：</span>
                <span class="font-semibold text-gray-800">
                  {{ formData.gender === 'male' ? '男' : formData.gender === 'female' ? '女' : '其他' }}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-600">偏好：</span>
                <span class="font-semibold text-gray-800">{{ formData.preferences.join('、') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="px-6 pb-6 pt-4 space-y-3 bg-gradient-to-t from-white to-transparent">
        <!-- 上一步按钮 -->
        <button
          v-if="currentStep > 0"
          @click="previousStep"
          class="w-full py-3 bg-gray-100 text-gray-700 rounded-2xl font-semibold hover:bg-gray-200 transition"
        >
          上一步
        </button>

        <!-- 下一步/完成按钮 -->
        <button
          @click="nextStep"
          :disabled="!canProceed"
          :class="[
            'w-full py-4 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2',
            canProceed
              ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600 shadow-lg hover:shadow-xl'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          ]"
        >
          {{ currentStep === 3 ? '✓ 完成' : '继续 →' }}
        </button>

        <!-- 跳过按钮 -->
        <button
          v-if="currentStep < 3"
          @click="skipGuide"
          class="w-full py-2 text-gray-600 text-sm hover:text-gray-800 transition font-medium"
        >
          跳过引导
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import toast from '@/utils/toast'

const router = useRouter()
const userStore = useUserStore()
const avatarInput = ref<HTMLInputElement | null>(null)

const currentStep = ref(0)
const steps = [
  { label: '基本信息' },
  { label: '头像' },
  { label: '偏好' },
  { label: '完成' }
]

const availableTags = [
  '周末出发', '高海拔', '自然风景', '历史文化',
  '温泉', '徒步', '露营', '摄影', '团队', '亲子'
]

const formData = ref({
  nickname: '',
  age: '',
  gender: '',
  bio: '',
  avatar: '',
  preferences: [] as string[]
})

// 计算是否可以进行下一步
const canProceed = computed(() => {
  switch (currentStep.value) {
    case 0:
      return formData.value.nickname && formData.value.age && formData.value.gender
    case 1:
      return true // 头像可选
    case 2:
      return formData.value.preferences.length >= 2
    case 3:
      return true
    default:
      return false
  }
})

// 切换偏好
const togglePreference = (preference: string) => {
  const index = formData.value.preferences.indexOf(preference)
  if (index > -1) {
    formData.value.preferences.splice(index, 1)
  } else {
    if (formData.value.preferences.length < 5) {
      formData.value.preferences.push(preference)
    } else {
      toast.warning('最多选择 5 个偏好')
    }
  }
}

// 处理头像上传
const handleAvatarUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  // 验证文件大小 (最大 5MB)
  if (file.size > 5 * 1024 * 1024) {
    toast.error('图片大小不能超过 5MB')
    return
  }

  // 读取文件为 Data URL
  const reader = new FileReader()
  reader.onload = (e) => {
    formData.value.avatar = e.target?.result as string
    toast.success('头像已选择')
  }
  reader.readAsDataURL(file)
}

// 下一步
const nextStep = async () => {
  if (!canProceed.value) return

  if (currentStep.value === 3) {
    // 完成引导 - 保存用户信息
    await completeGuide()
  } else {
    currentStep.value++
  }
}

// 上一步
const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

// 完成引导
const completeGuide = async () => {
  try {
    // 这里可以调用后端 API 更新用户信息
    // 例如: await userApi.updateProfile({ nickname, age, gender, bio, avatar, preferences })
    // const response = await userApi.updateProfile(updateData)

    // 临时保存到本地用户信息
    const user = userStore.currentUser
    if (user) {
      user.nickname = formData.value.nickname
      user.age = Number(formData.value.age)
      user.bio = formData.value.bio
      // 注意:gender 和 preferences 的类型需要根据后端定义调整
      // user.gender = formData.value.gender
      // user.preferences = formData.value.preferences
    }

    toast.success('✓ 引导完成！')

    // 延迟跳转到首页
    setTimeout(() => {
      router.push('/discover')
    }, 500)
  } catch (error) {
    console.error('Error completing guide:', error)
    toast.error('保存信息失败')
  }
}

// 跳过引导
const skipGuide = async () => {
  toast.info('已跳过引导')
  setTimeout(() => {
    router.push('/discover')
  }, 300)
}
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.5s ease-out;
}
</style>
