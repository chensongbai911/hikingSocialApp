<template>
  <div class="avatar-upload">
    <!-- 头像展示 -->
    <div class="avatar-container">
      <img :src="previewUrl || avatarUrl" :alt="nickname" class="avatar-image" />
      <label class="upload-overlay" @click="triggerFileInput">
        <svg class="camera-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
          <path d="M12 8c2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4 1.79-4 4-4z" />
        </svg>
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          @change="handleFileSelect"
          style="display: none"
        />
      </label>
    </div>

    <!-- 上传按钮 -->
    <div v-if="isEditing" class="action-buttons mt-4 space-y-2">
      <button
        @click="handleUpload"
        :disabled="!selectedFile || isUploading"
        class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
      >
        {{ isUploading ? '上传中...' : '上传头像' }}
      </button>
      <button
        @click="cancelUpload"
        class="w-full bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
      >
        取消
      </button>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="mt-2 p-2 bg-red-100 text-red-700 rounded">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { uploadApi } from '@/api'
import { useUserStore } from '@/stores/user'

interface Props {
  avatarUrl?: string
  nickname?: string
  editable?: boolean
  onUploadSuccess?: (newAvatarUrl: string) => void
}

const props = withDefaults(defineProps<Props>(), {
  editable: false,
})

const fileInput = ref<HTMLInputElement>()
const selectedFile = ref<File>()
const previewUrl = ref('')
const isUploading = ref(false)
const isEditing = ref(false)
const error = ref('')

const userStore = useUserStore()

/**
 * 触发文件选择
 */
const triggerFileInput = () => {
  if (props.editable) {
    isEditing.value = true
    fileInput.value?.click()
  }
}

/**
 * 处理文件选择
 */
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // 验证文件类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    error.value = '请选择支持的图片格式（JPEG, PNG, WebP, GIF）'
    return
  }

  // 验证文件大小 (5MB)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    error.value = '文件过大，最大支持 5MB'
    return
  }

  error.value = ''
  selectedFile.value = file

  // 显示预览
  const reader = new FileReader()
  reader.onload = (e) => {
    previewUrl.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

/**
 * 上传头像
 */
const handleUpload = async () => {
  if (!selectedFile.value) return

  try {
    isUploading.value = true
    error.value = ''

    const result = await uploadApi.uploadAvatar(selectedFile.value)

    // 更新用户存储
    if (userStore.currentUser) {
      userStore.currentUser.avatarUrl = result.avatarUrl
    }

    // 调用回调
    if (props.onUploadSuccess) {
      props.onUploadSuccess(result.avatarUrl)
    }

    // 重置
    previewUrl.value = ''
    selectedFile.value = undefined
    isEditing.value = false
  } catch (err: any) {
    error.value = err.message || '上传失败，请重试'
  } finally {
    isUploading.value = false
  }
}

/**
 * 取消上传
 */
const cancelUpload = () => {
  previewUrl.value = ''
  selectedFile.value = undefined
  isEditing.value = false
  error.value = ''
}
</script>

<style scoped>
.avatar-upload {
  text-align: center;
}

.avatar-container {
  position: relative;
  display: inline-block;
}

.avatar-image {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e5e7eb;
}

.upload-overlay {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 40px;
  height: 40px;
  background: #3b82f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0.9;
  transition: opacity 0.3s;
}

.upload-overlay:hover {
  opacity: 1;
}

.camera-icon {
  width: 20px;
  height: 20px;
  color: white;
}

.action-buttons button {
  transition: background-color 0.3s;
}
</style>
