<template>
  <div class="fixed inset-0 bg-white flex flex-col z-40">
    <!-- 顶部导航栏 -->
    <div class="bg-white border-b border-gray-100 p-4 flex items-center space-x-3 flex-shrink-0">
      <button @click="router.back()" class="p-2 -ml-2">
        <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>
      <img
        :src="chatUser.avatar"
        :alt="chatUser.name"
        class="w-10 h-10 rounded-full object-cover"
      />
      <div class="flex-1">
        <h2 class="font-medium text-gray-800">{{ chatUser.name }}</h2>
        <p class="text-xs text-gray-500">{{ chatUser.isOnline ? '在线' : '离线' }}</p>
      </div>
    </div>

    <!-- 消息列表 -->
    <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
      <div
        v-for="message in messages"
        :key="message.id"
        :class="['flex', message.isOwn ? 'justify-end' : 'justify-start']"
      >
        <div :class="['flex', message.isOwn ? 'flex-row-reverse' : 'flex-row', 'items-end space-x-2']">
          <!-- 头像 -->
          <img
            v-if="!message.isOwn"
            :src="chatUser.avatar"
            :alt="chatUser.name"
            class="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />

          <!-- 消息气泡 -->
          <div :class="['max-w-[70%]', message.isOwn ? 'mr-2' : 'ml-2']">
            <!-- 文字消息 -->
            <div
              v-if="message.type === 'text'"
              :class="[
                'px-4 py-2 rounded-2xl',
                message.isOwn
                  ? 'bg-teal-500 text-white rounded-br-sm'
                  : 'bg-white text-gray-800 rounded-bl-sm'
              ]"
            >
              <p class="break-words">{{ message.content }}</p>
            </div>

            <!-- 图片消息 -->
            <div
              v-else-if="message.type === 'image'"
              class="rounded-2xl overflow-hidden"
            >
              <img
                :src="message.content"
                alt="图片"
                class="max-w-full h-auto cursor-pointer"
                @click="previewImage(message.content)"
              />
            </div>

            <!-- 语音消息 -->
            <div
              v-else-if="message.type === 'voice'"
              :class="[
                'px-4 py-3 rounded-2xl flex items-center space-x-3 cursor-pointer',
                message.isOwn
                  ? 'bg-teal-500 text-white'
                  : 'bg-white text-gray-800'
              ]"
              @click="playVoice(message)"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
              <div class="flex-1">
                <div class="flex items-center space-x-1">
                  <div class="w-1 h-3 bg-current rounded-full"></div>
                  <div class="w-1 h-4 bg-current rounded-full"></div>
                  <div class="w-1 h-2 bg-current rounded-full"></div>
                  <div class="w-1 h-5 bg-current rounded-full"></div>
                  <div class="w-1 h-3 bg-current rounded-full"></div>
                </div>
              </div>
              <span class="text-sm">{{ message.duration }}''</span>
            </div>

            <!-- 时间 -->
            <p
              :class="[
                'text-xs mt-1',
                message.isOwn ? 'text-right text-gray-400' : 'text-left text-gray-400'
              ]"
            >
              {{ formatTime(message.timestamp) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="bg-white border-t border-gray-100 p-4 flex-shrink-0">
      <!-- Emoji 选择器 -->
      <div
        v-if="showEmojiPicker"
        class="mb-3 p-3 bg-gray-50 rounded-2xl grid grid-cols-8 gap-2 max-h-48 overflow-y-auto"
      >
        <button
          v-for="emoji in emojis"
          :key="emoji"
          @click="insertEmoji(emoji)"
          class="text-2xl hover:scale-125 transition-transform"
        >
          {{ emoji }}
        </button>
      </div>

      <!-- 输入栏 -->
      <div class="flex items-end space-x-1.5">
        <!-- 语音按钮 -->
        <button
          @mousedown="startRecording"
          @mouseup="stopRecording"
          @mouseleave="cancelRecording"
          @touchstart.prevent="startRecording"
          @touchend.prevent="stopRecording"
          @touchcancel.prevent="cancelRecording"
          :class="[
            'p-2.5 rounded-full transition-all duration-200 flex-shrink-0',
            isRecording ? 'bg-red-500 text-white scale-110' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          ]"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
          </svg>
        </button>

        <!-- 文本输入框 -->
        <div class="flex-1 bg-gray-50 rounded-2xl flex items-center min-w-0">
          <textarea
            ref="textInput"
            v-model="messageInput"
            placeholder="输入消息..."
            rows="1"
            class="flex-1 bg-transparent px-3 py-2.5 focus:outline-none resize-none max-h-32 overflow-y-auto text-sm"
            @input="adjustTextareaHeight"
            @keydown.enter.exact.prevent="handleSendMessage()"
            @focus="showEmojiPicker = false"
          ></textarea>

          <!-- Emoji按钮 -->
          <button
            @click.stop="toggleEmojiPicker"
            :class="[
              'p-2 transition-colors flex-shrink-0',
              showEmojiPicker ? 'text-teal-500' : 'text-gray-600'
            ]"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </button>

          <!-- 图片按钮 -->
          <button
            @click="triggerImageUpload"
            class="p-2 text-gray-600 hover:text-teal-500 transition-colors flex-shrink-0"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </button>
          <input
            ref="imageInput"
            type="file"
            accept="image/*"
            multiple
            class="hidden"
            @change="handleImageUpload"
          />
        </div>

        <!-- 发送按钮 -->
        <button
          @click="handleSendMessage()"
          :disabled="!messageInput.trim()"
          :class="[
            'p-2.5 rounded-full transition-all duration-200 flex-shrink-0',
            messageInput.trim()
              ? 'bg-teal-500 text-white hover:bg-teal-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          ]"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
          </svg>
        </button>
      </div>

      <!-- 录音提示 -->
      <div
        v-if="isRecording"
        class="mt-3 text-center"
      >
        <div class="inline-flex items-center space-x-2 bg-red-50 text-red-600 px-4 py-2 rounded-full">
          <div class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span class="text-sm font-medium">正在录音 {{ recordingDuration }}"</span>
        </div>
        <p class="text-xs text-gray-500 mt-2">松开发送，滑出取消</p>
      </div>
    </div>

    <!-- 图片预览模态框 -->
    <div
      v-if="previewImageUrl"
      @click="previewImageUrl = null"
      class="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
    >
      <img
        :src="previewImageUrl"
        alt="预览"
        class="max-w-full max-h-full object-contain"
      />
      <button
        @click="previewImageUrl = null"
        class="absolute top-4 right-4 p-2 bg-white/20 rounded-full text-white"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const messageInput = ref('')
const messagesContainer = ref<HTMLDivElement>()
const imageInput = ref<HTMLInputElement>()
const textInput = ref<HTMLTextAreaElement>()
const showEmojiPicker = ref(false)
const isRecording = ref(false)
const recordingDuration = ref(0)
const previewImageUrl = ref<string | null>(null)

let recordingTimer: number | null = null
let recordingStartTime: number = 0

interface Message {
  id: string
  type: 'text' | 'image' | 'voice'
  content: string
  isOwn: boolean
  timestamp: Date
  duration?: number
}

// 聊天用户信息（根据路由参数动态获取）
const chatUser = ref({
  id: route.params.id as string,
  name: '李华 (徒步达人)',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
  isOnline: true
})

// 根据用户ID设置不同的聊天对象
const setChatUser = () => {
  const userId = route.params.id as string
  const users: Record<string, any> = {
    '1': {
      id: '1',
      name: '李华 (徒步达人)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      isOnline: true
    },
    '2': {
      id: '2',
      name: '小美',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      isOnline: false
    },
    '3': {
      id: '3',
      name: '张三-领队',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      isOnline: false
    },
    '4': {
      id: '4',
      name: '王五',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
      isOnline: false
    }
  }
  chatUser.value = users[userId] || users['1']
}

// 消息列表
const messages = ref<Message[]>([
  {
    id: '1',
    type: 'text',
    content: '你好！周六的香山徒步活动确定了吗？',
    isOwn: false,
    timestamp: new Date(Date.now() - 3600000)
  },
  {
    id: '2',
    type: 'text',
    content: '确定了！我们早上8点在南门集合',
    isOwn: true,
    timestamp: new Date(Date.now() - 3000000)
  },
  {
    id: '3',
    type: 'image',
    content: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    isOwn: false,
    timestamp: new Date(Date.now() - 1800000)
  },
  {
    id: '4',
    type: 'text',
    content: '看这里的风景多美！😊',
    isOwn: false,
    timestamp: new Date(Date.now() - 1800000)
  }
])

// Emoji列表
const emojis = [
  '😊', '😂', '❤️', '👍', '🙏', '😍', '😭', '🤔',
  '👏', '🎉', '🔥', '💪', '🌟', '✨', '🌈', '🌸',
  '🌺', '🌻', '🌞', '🌙', '⭐', '💫', '✅', '❌'
]

onMounted(() => {
  setChatUser()
  scrollToBottom()

  // 点击外部关闭emoji选择器
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  if (recordingTimer) {
    clearInterval(recordingTimer)
  }
  document.removeEventListener('click', handleClickOutside)
})

const handleClickOutside = () => {
  if (showEmojiPicker.value) {
    showEmojiPicker.value = false
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const formatTime = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
}

const adjustTextareaHeight = () => {
  if (textInput.value) {
    textInput.value.style.height = 'auto'
    const newHeight = Math.min(textInput.value.scrollHeight, 128)
    textInput.value.style.height = `${newHeight}px`
  }
}

const handleSendMessage = () => {
  if (!messageInput.value.trim()) return

  const newMessage: Message = {
    id: Date.now().toString(),
    type: 'text',
    content: messageInput.value.trim(),
    isOwn: true,
    timestamp: new Date()
  }

  messages.value.push(newMessage)
  messageInput.value = ''
  showEmojiPicker.value = false

  // 重置textarea高度
  if (textInput.value) {
    textInput.value.style.height = 'auto'
  }

  scrollToBottom()

  // 模拟对方回复
  setTimeout(() => {
    const autoReply: Message = {
      id: (Date.now() + 1).toString(),
      type: 'text',
      content: '收到！👍',
      isOwn: false,
      timestamp: new Date()
    }
    messages.value.push(autoReply)
    scrollToBottom()
  }, 1000)
}

const toggleEmojiPicker = (e: Event) => {
  e.stopPropagation()
  showEmojiPicker.value = !showEmojiPicker.value
}

const insertEmoji = (emoji: string) => {
  messageInput.value += emoji
  textInput.value?.focus()
}

const triggerImageUpload = () => {
  showEmojiPicker.value = false
  imageInput.value?.click()
}

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files

  if (files && files.length > 0) {
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const newMessage: Message = {
          id: Date.now().toString() + Math.random(),
          type: 'image',
          content: e.target?.result as string,
          isOwn: true,
          timestamp: new Date()
        }
        messages.value.push(newMessage)
        scrollToBottom()
      }
      reader.readAsDataURL(file)
    })

    // 重置input
    target.value = ''
  }
}

const startRecording = () => {
  if (isRecording.value) return

  isRecording.value = true
  recordingDuration.value = 0
  recordingStartTime = Date.now()

  recordingTimer = window.setInterval(() => {
    recordingDuration.value = Math.floor((Date.now() - recordingStartTime) / 1000)

    // 最多录60秒
    if (recordingDuration.value >= 60) {
      stopRecording()
    }
  }, 100)
}

const stopRecording = () => {
  if (!isRecording.value) return

  if (recordingTimer) {
    clearInterval(recordingTimer)
    recordingTimer = null
  }

  // 至少录制1秒才发送
  if (recordingDuration.value >= 1) {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'voice',
      content: 'voice_message',
      isOwn: true,
      timestamp: new Date(),
      duration: recordingDuration.value
    }
    messages.value.push(newMessage)
    scrollToBottom()
  }

  isRecording.value = false
  recordingDuration.value = 0
}

const cancelRecording = () => {
  if (recordingTimer) {
    clearInterval(recordingTimer)
    recordingTimer = null
  }

  isRecording.value = false
  recordingDuration.value = 0
}

const playVoice = (message: Message) => {
  // 模拟播放语音
  console.log('播放语音消息:', message.id, '时长:', message.duration)
  // 这里可以集成真实的音频播放功能
}

const previewImage = (url: string) => {
  previewImageUrl.value = url
}
</script>
