<template>
  <div class="image-upload">
    <!-- 上传按钮 -->
    <div
      v-if="!preview"
      class="upload-area"
      :class="{ 'is-dragging': isDragging }"
      @click="handleClick"
      @drop.prevent="handleDrop"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
    >
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        :multiple="multiple"
        @change="handleFileChange"
        style="display: none"
      />

      <div class="upload-icon">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="currentColor">
          <path d="M24 14v20M14 24h20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <rect x="8" y="8" width="32" height="32" rx="4" fill="none" stroke="currentColor" stroke-width="2"/>
        </svg>
      </div>

      <div class="upload-text">
        <p class="main-text">{{ text || '点击或拖拽上传图片' }}</p>
        <p class="sub-text">支持 JPG、PNG、GIF 格式，{{ maxSizeMB }}MB以内</p>
      </div>
    </div>

    <!-- 预览区域 -->
    <div v-else class="preview-area">
      <!-- 单图预览 -->
      <div v-if="!multiple" class="preview-single">
        <img :src="preview" :alt="fileName" />
        <div class="preview-mask">
          <button @click="handleRemove" class="remove-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- 多图预览 -->
      <div v-else class="preview-grid">
        <div v-for="(img, index) in previewList" :key="index" class="preview-item">
          <img :src="img" :alt="`图片${index + 1}`" />
          <button @click="handleRemoveAt(index)" class="remove-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <!-- 继续添加按钮 -->
        <div v-if="previewList.length < maxCount" class="add-more" @click="handleClick">
          <svg width="32" height="32" viewBox="0 0 48 48" fill="currentColor">
            <path d="M24 14v20M14 24h20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- 上传进度 -->
    <div v-if="uploading" class="upload-progress">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${uploadProgress}%` }"></div>
      </div>
      <p class="progress-text">上传中 {{ uploadProgress }}%</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import toast from '../../utils/toast'

interface Props {
  modelValue?: string | string[]
  text?: string
  maxSize?: number // 单位：MB
  maxCount?: number // 最多上传数量
  multiple?: boolean
  compress?: boolean // 是否压缩
}

const props = withDefaults(defineProps<Props>(), {
  maxSize: 5,
  maxCount: 9,
  multiple: false,
  compress: true
})

const emit = defineEmits<{
  'update:modelValue': [value: string | string[]]
  'change': [files: File[]]
}>()

const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)
const files = ref<File[]>([])

const maxSizeMB = computed(() => props.maxSize)

const preview = computed(() => {
  if (!props.multiple && typeof props.modelValue === 'string') {
    return props.modelValue
  }
  return null
})

const previewList = computed(() => {
  if (props.multiple && Array.isArray(props.modelValue)) {
    return props.modelValue
  }
  return []
})

const fileName = computed(() => {
  return files.value[0]?.name || ''
})

/**
 * 点击上传
 */
function handleClick() {
  fileInput.value?.click()
}

/**
 * 文件选择
 */
function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  const selectedFiles = Array.from(target.files || [])
  handleFiles(selectedFiles)
}

/**
 * 拖拽上传
 */
function handleDrop(e: DragEvent) {
  isDragging.value = false
  const selectedFiles = Array.from(e.dataTransfer?.files || [])
  handleFiles(selectedFiles)
}

/**
 * 处理文件
 */
async function handleFiles(selectedFiles: File[]) {
  if (selectedFiles.length === 0) return

  // 过滤图片文件
  const imageFiles = selectedFiles.filter(file => file.type.startsWith('image/'))

  if (imageFiles.length === 0) {
    toast.error('请选择图片文件')
    return
  }

  // 检查数量
  if (props.multiple && files.value.length + imageFiles.length > props.maxCount) {
    toast.error(`最多上传${props.maxCount}张图片`)
    return
  }

  // 检查大小
  const oversizeFiles = imageFiles.filter(file => file.size > props.maxSize * 1024 * 1024)
  if (oversizeFiles.length > 0) {
    toast.error(`图片大小不能超过${props.maxSize}MB`)
    return
  }

  // 保存文件
  if (props.multiple) {
    files.value.push(...imageFiles)
  } else {
    files.value = [imageFiles[0]]
  }

  // 生成预览
  const previews = await Promise.all(
    imageFiles.map(file => readFileAsDataURL(file))
  )

  // 更新值
  if (props.multiple) {
    const newList = [...previewList.value, ...previews]
    emit('update:modelValue', newList)
  } else {
    emit('update:modelValue', previews[0])
  }

  emit('change', files.value)
}

/**
 * 读取文件为DataURL
 */
function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * 移除图片
 */
function handleRemove() {
  files.value = []
  emit('update:modelValue', '')
}

/**
 * 移除指定图片
 */
function handleRemoveAt(index: number) {
  files.value.splice(index, 1)
  const newList = previewList.value.filter((_, i) => i !== index)
  emit('update:modelValue', newList)
}

defineExpose({
  files
})
</script>

<style scoped>
.image-upload {
  width: 100%;
}

.upload-area {
  width: 100%;
  min-height: 200px;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #f9fafb;
}

.upload-area:hover {
  border-color: #10b981;
  background-color: #f0fdf4;
}

.upload-area.is-dragging {
  border-color: #10b981;
  background-color: #d1fae5;
  transform: scale(1.02);
}

.upload-icon {
  color: #9ca3af;
  margin-bottom: 16px;
}

.upload-text .main-text {
  font-size: 16px;
  color: #374151;
  margin-bottom: 8px;
}

.upload-text .sub-text {
  font-size: 14px;
  color: #9ca3af;
}

.preview-area {
  width: 100%;
}

.preview-single {
  position: relative;
  width: 100%;
  height: 300px;
  border-radius: 12px;
  overflow: hidden;
}

.preview-single img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.preview-single:hover .preview-mask {
  opacity: 1;
}

.remove-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.9);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}

.remove-btn:hover {
  transform: scale(1.1);
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.preview-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
}

.preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-item .remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
}

.add-more {
  aspect-ratio: 1;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: #f9fafb;
  transition: all 0.3s;
  color: #9ca3af;
}

.add-more:hover {
  border-color: #10b981;
  background-color: #f0fdf4;
  color: #10b981;
}

.upload-progress {
  margin-top: 16px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(to right, #10b981, #059669);
  transition: width 0.3s;
}

.progress-text {
  font-size: 14px;
  color: #6b7280;
  text-align: center;
  margin-top: 8px;
}
</style>
