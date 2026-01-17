<template>
  <div class="fixed inset-0 bg-white flex flex-col z-50" style="max-height: 100vh; max-height: 100dvh;">
    <div class="bg-white border-b border-gray-100 p-4 flex items-center space-x-3 flex-shrink-0">
      <button @click="handleBack" class="p-2 -ml-2">
        <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <div class="relative flex-shrink-0">
        <img
          :src="chatUser.avatar || 'https://placehold.co/48x48'"
          :alt="chatUser.name"
          class="w-10 h-10 rounded-full object-cover"
        />
        <div
          v-if="!isBlacklisted"
          :class="[
            'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white',
            chatUser.isOnline ? 'bg-green-500' : 'bg-gray-400'
          ]"
        ></div>
      </div>
      <div class="flex-1 min-w-0">
        <h2 class="font-semibold text-gray-900 truncate text-base">{{ chatUser.name || '对方' }}</h2>
        <p class="text-xs truncate flex items-center space-x-1">
          <span v-if="isBlacklisted" class="text-red-500">已被对方拉黑</span>
          <span v-else :class="chatUser.isOnline ? 'text-green-600' : 'text-gray-500'">
            {{ chatUser.isOnline ? '在线' : '离线' }}
          </span>
        </p>
      </div>
      <div class="flex items-center space-x-2" v-if="isLimited">
        <span class="text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded-full"
          >剩余 {{ remainingMessages ?? 0 }} / 3</span
        >
      </div>
      <button @click="handleClear" class="p-2 text-gray-500 hover:text-red-500" title="清空对话">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>

    <div v-if="loadError" class="bg-red-50 text-red-600 text-sm px-4 py-2">
      {{ loadError }}
    </div>
    <div v-else-if="isBlacklisted" class="bg-red-50 text-red-600 text-sm px-4 py-2">
      对方已将你拉黑，无法发送消息
    </div>
    <div v-else-if="isLimited" class="bg-amber-50 text-amber-700 text-sm px-4 py-2">
      未互关，仅可再发送 {{ remainingMessages ?? 0 }} 条消息
    </div>

    <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" @scroll="handleScroll">
      <div v-if="loading" class="text-center text-gray-400 py-8">加载中...</div>
      <div v-else-if="!messages.length" class="flex flex-col items-center justify-center py-16">
        <svg class="w-20 h-20 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
        </svg>
        <p class="text-gray-400 text-center mb-2">暂时没有消息</p>
        <p class="text-gray-400 text-sm text-center">开始你们的第一次对话吧～</p>
      </div>
      <div
        v-for="message in messages"
        :key="message.id"
        :class="['flex', message.senderId === userStore.userId ? 'justify-end' : 'justify-start']"
      >
        <div
          :class="[
            'flex',
            message.senderId === userStore.userId ? 'flex-row-reverse' : 'flex-row',
            'items-end space-x-2',
          ]"
        >
          <img
            v-if="message.senderId !== userStore.userId"
            :src="message.sender?.avatarUrl || chatUser.avatar || 'https://placehold.co/48x48'"
            :alt="message.sender?.nickname || chatUser.name"
            class="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />

          <div :class="['max-w-[70%]', message.senderId === userStore.userId ? 'mr-2' : 'ml-2']">
            <div
              v-if="message.contentType === 'text' && !message.isRecalled"
              :class="[
                'px-4 py-2 rounded-2xl',
                message.senderId === userStore.userId
                  ? 'bg-teal-500 text-white rounded-br-sm'
                  : 'bg-white text-gray-800 rounded-bl-sm',
              ]"
            >
              <p class="break-words">{{ message.content }}</p>
            </div>

            <div
              v-else-if="message.contentType === 'image' && !message.isRecalled"
              class="rounded-2xl overflow-hidden"
            >
              <img
                :src="message.imageUrl || message.content"
                alt="图片"
                class="max-w-full h-auto cursor-pointer"
                @click="previewImage(message.imageUrl || message.content)"
              />
            </div>

            <div v-else class="text-xs text-gray-400 px-3 py-2">消息已撤回</div>

            <div class="mt-1 text-xs text-gray-400">
              <div class="flex items-center justify-between">
                <span>{{ formatTime(new Date(message.createdAt)) }}</span>
                <button
                  v-if="message.senderId === userStore.userId && !message.isRecalled"
                  class="hover:text-red-500 ml-3"
                  @click="handleRecall(message.id)"
                >
                  撤回
                </button>
                <button
                  v-else-if="!message.isRecalled"
                  class="hover:text-amber-600 ml-3"
                  @click="handleReport(message.id)"
                >
                  举报
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="typingUsers.size > 0" class="text-xs text-gray-500 mt-2">对方正在输入...</div>
    </div>

    <div class="bg-white border-t border-gray-100 p-4 flex-shrink-0 pb-6">
      <div
        v-if="showEmojiPicker"
        class="mb-3 p-3 bg-gray-50 rounded-2xl grid grid-cols-8 gap-2 max-h-48 overflow-y-auto"
        @click.stop
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

      <div class="flex items-end space-x-1.5">
        <button
          @mousedown="startRecording"
          @mouseup="stopRecording"
          @mouseleave="cancelRecording"
          @touchstart.prevent="startRecording"
          @touchend.prevent="stopRecording"
          @touchcancel.prevent="cancelRecording"
          :class="[
            'p-2.5 rounded-full transition-all duration-200 flex-shrink-0',
            isRecording
              ? 'bg-red-500 text-white scale-110'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
          ]"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path
              d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"
            />
            <path
              d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"
            />
          </svg>
        </button>

        <div class="flex-1 bg-gray-50 rounded-2xl flex items-center min-w-0">
          <textarea
            ref="textInput"
            v-model="messageInput"
            placeholder="输入消息..."
            rows="1"
            class="flex-1 bg-transparent px-3 py-2.5 focus:outline-none resize-none max-h-32 overflow-y-auto text-sm"
            @input="handleInputChange"
            @keydown.enter.exact.prevent="handleSendMessage()"
            @focus="showEmojiPicker = false"
          ></textarea>

          <button
            @click.stop="toggleEmojiPicker"
            :class="[
              'p-2 transition-colors flex-shrink-0',
              showEmojiPicker ? 'text-teal-500' : 'text-gray-600',
            ]"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>

          <button
            @click="triggerImageUpload"
            class="p-2 text-gray-600 hover:text-teal-500 transition-colors flex-shrink-0"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </button>
          <input
            ref="imageInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleImageUpload"
          />
        </div>

        <button
          @click="handleSendMessage()"
          :disabled="sendDisabled"
          :class="[
            'p-2.5 rounded-full transition-all duration-200 flex-shrink-0',
            !sendDisabled
              ? 'bg-teal-500 text-white hover:bg-teal-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed',
          ]"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </div>

      <div v-if="isRecording" class="mt-3 text-center">
        <div
          class="inline-flex items-center space-x-2 bg-red-50 text-red-600 px-4 py-2 rounded-full"
        >
          <div class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span class="text-sm font-medium">正在录音 {{ recordingDuration }}"</span>
        </div>
        <p class="text-xs text-gray-500 mt-2">松开发送，滑出取消</p>
      </div>
    </div>

    <div
      v-if="previewImageUrl"
      @click="previewImageUrl = null"
      class="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
    >
      <img :src="previewImageUrl" alt="预览" class="max-w-full max-h-full object-contain" />
      <button
        @click.stop="previewImageUrl = null"
        class="absolute top-4 right-4 p-2 bg-white/20 rounded-full text-white"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  sendMessage,
  getMessages,
  recallMessage,
  reportMessage,
  clearConversation,
  getConversationInfo,
  markConversationAsRead,
} from '@/api/message'
import { userApi } from '@/api/user'
import { uploadApi } from '@/api/upload'
import { socketService } from '@/services/socket'
import { useUserStore } from '@/stores/user'
import toast from '@/utils/toast'

const router = useRouter()
const route = useRoute()
const fromState = route?.state as any
const userStore = useUserStore()

const conversationId = ref<string>(route.params.id as string)
const messageInput = ref('')
const messagesContainer = ref<HTMLDivElement>()
const imageInput = ref<HTMLInputElement>()
const textInput = ref<HTMLTextAreaElement>()
const showEmojiPicker = ref(false)
const isRecording = ref(false)
const recordingDuration = ref(0)
const previewImageUrl = ref<string | null>(null)
const isLimited = ref(false)
const remainingMessages = ref<number | undefined>(undefined)
const isBlacklisted = ref(false)
const typingUsers = ref<Set<string>>(new Set())

let typingTimeout: number | null = null
let recordingTimer: number | null = null
let recordingStartTime = 0

interface ChatMessage {
  id: string
  content: string
  contentType: 'text' | 'image' | 'file'
  senderId: string
  createdAt: string
  isRecalled?: boolean
  imageUrl?: string
  fileUrl?: string
  sender?: {
    id: string
    nickname: string
    avatarUrl?: string
  }
}

const messages = ref<ChatMessage[]>([])
const currentPage = ref(1)
const totalPages = ref(1)
const isLoadingMore = ref(false)

const loading = ref(true)
const loadError = ref('')

const messageExists = (id: string) => messages.value.some((m) => m.id === id)

const chatUser = ref({
  id: '',
  name: '对方',
  avatar: '',
  isOnline: true,
})

const emojis = [
  '😊',
  '😂',
  '❤️',
  '👍',
  '🙏',
  '😍',
  '😭',
  '🤔',
  '👏',
  '🎉',
  '🔥',
  '💪',
  '🌟',
  '✨',
  '🌈',
  '🌸',
  '🌺',
  '🌻',
  '🌞',
  '🌙',
  '⭐',
  '💫',
  '✅',
  '❌',
]

const loadConversation = async () => {
  const id = route.params.id as string
  conversationId.value = id
  if (!conversationId.value) {
    toast.error('无效的对话')
    router.push({ name: 'Messages' })
    return
  }
  try {
    loading.value = true
    loadError.value = ''

    console.log('[ChatWindow] 开始加载对话，ID:', id)

    // 获取对话信息
    let info: any = {}
    try {
      info = await getConversationInfo(id)
      console.log('[ChatWindow] 获取对话信息成功:', info)
    } catch (e: any) {
      console.error('[ChatWindow] 获取对话信息失败，继续加载消息:', e)
      // 继续加载消息，即使对话信息失败
    }

    const { otherUserId, isLimited: limited, remainingMessages: remain, isBlacklisted: black } = info || {}

    const targetUserId = otherUserId || id
    chatUser.value.id = targetUserId

    // 拉取对方用户信息填充头像和昵称
    try {
      console.log('[ChatWindow] 获取用户资料:', targetUserId)
      const profile = await userApi.getUserProfile(targetUserId)
      console.log('[ChatWindow] 用户资料响应:', profile)

      const user = profile?.data?.data || profile?.data || profile
      if (user) {
        chatUser.value.name = user.nickname || user.name || user.email || `用户${targetUserId.slice(-4)}`
        chatUser.value.avatar = user.avatar_url || user.avatar || chatUser.value.avatar
        chatUser.value.isOnline = user.is_online ?? user.isOnline ?? false
        console.log('[ChatWindow] 用户信息已设置:', chatUser.value)
      } else {
        console.warn('[ChatWindow] 用户数据为空，使用默认值')
        chatUser.value.name = `用户${targetUserId.slice(-4)}`
      }
    } catch (e: any) {
      console.error('[ChatWindow] 获取对方资料失败:', e)
      // 即使失败也显示一个友好的名字
      chatUser.value.name = `用户${targetUserId.slice(-4)}`
      // 如果是404错误，不影响继续使用
      if (e?.code !== 4001 && e?.code !== 404) {
        console.warn('[ChatWindow] 忽略用户资料获取错误，继续加载消息')
      }
    }

    isLimited.value = !!limited
    remainingMessages.value = remain
    isBlacklisted.value = !!black
    console.log('[ChatWindow] 对话限制信息:', { isLimited: isLimited.value, remainingMessages: remainingMessages.value, isBlacklisted: isBlacklisted.value })

    // 加载消息列表
    console.log('[ChatWindow] 开始加载消息列表，conversationId:', id)
    const list = await getMessages(id)
    console.log('[ChatWindow] getMessages 返回值:', list)

    const rawMessages = (list?.messages || list || []) as any[]
    console.log('[ChatWindow] 获取消息列表:', { total: list?.total, count: rawMessages.length, rawMessages })

    // 从后端响应中获取分页信息
    if (list?.pagination) {
      totalPages.value = list.pagination.totalPages || 1
    } else if (list?.totalPages) {
      totalPages.value = list.totalPages
    }
    currentPage.value = 1

    messages.value = rawMessages.map((m: any) => ({
      id: String(m.id),
      content: m.content || m.imageUrl || m.image_url || m.fileUrl || m.file_url || '',
      contentType: (m.contentType || m.content_type || 'text') as 'text' | 'image' | 'file',
      senderId: String(m.senderId || m.sender_id),
      createdAt: m.createdAt || m.created_at,
      isRecalled: m.isRecalled || m.is_recalled,
      imageUrl: m.imageUrl || m.image_url,
      fileUrl: m.fileUrl || m.file_url,
      sender: m.sender ? {
        id: String(m.sender.id),
        nickname: m.sender.nickname || m.sender.name || '用户',
        avatarUrl: m.sender.avatarUrl || m.sender.avatar_url
      } : undefined
    }))
    console.log('[ChatWindow] 转换后的消息数组，长度:', messages.value.length, '内容:', messages.value)
    await markConversationAsRead(conversationId.value)
    scrollToBottom()
  } catch (err: any) {
    console.error('[ChatWindow] 加载对话异常:', err)
    loadError.value = err?.message || '加载失败'
    toast.error(loadError.value)
  }
  finally {
    loading.value = false
    console.log('[ChatWindow] 加载完成，messages.length:', messages.value.length, 'loading:', loading.value)
  }
}

const handleBack = () => {
  if (fromState?.from === 'messages') {
    router.push({ name: 'Messages' })
  } else {
    router.back()
  }
}

const handleSendMessage = async (
  contentType: 'text' | 'image' = 'text',
  payload?: { imageUrl?: string }
) => {
  if (isBlacklisted.value) {
    toast.warning('你已被对方拉黑，无法发送')
    return
  }
  if (isLimited.value && remainingMessages.value !== undefined && remainingMessages.value <= 0) {
    toast.warning('未互关仅可发送3条消息，已达上限')
    return
  }
  const trimmed = messageInput.value.trim()
  if (contentType === 'text' && !trimmed) return

  try {
    const res = await sendMessage(
      conversationId.value,
      contentType === 'text' ? trimmed : '',
      contentType,
      payload?.imageUrl,
      undefined
    )
    console.log('[ChatWindow] 发送消息响应:', res)
    const sent = res?.message || res?.data?.message || res
    console.log('[ChatWindow] 提取的消息对象:', sent)

    if (sent && !messageExists(String(sent.id))) {
      // 支持驼峰和下划线两种命名
      const newMessage = {
        id: String(sent.id),
        content: sent.content || sent.imageUrl || sent.image_url || sent.fileUrl || sent.file_url || '',
        contentType: (sent.contentType || sent.content_type || contentType) as 'text' | 'image' | 'file',
        senderId: String(sent.senderId || sent.sender_id || userStore.userId),
        createdAt: sent.createdAt || sent.created_at || new Date().toISOString(),
        isRecalled: sent.isRecalled || sent.is_recalled || false,
        imageUrl: sent.imageUrl || sent.image_url,
        fileUrl: sent.fileUrl || sent.file_url,
        sender: sent.sender ? {
          id: String(sent.sender.id),
          nickname: sent.sender.nickname || userStore.currentUser?.nickname || '我',
          avatarUrl: sent.sender.avatarUrl || sent.sender.avatar_url || userStore.currentUser?.avatarUrl
        } : {
          id: String(userStore.userId),
          nickname: userStore.currentUser?.nickname || '我',
          avatarUrl: userStore.currentUser?.avatarUrl
        }
      }
      console.log('[ChatWindow] 添加新消息到列表:', newMessage)
      messages.value.push(newMessage)
    }
    // 同步剩余消息数
    if (res?.remainingMessages !== undefined) {
      remainingMessages.value = res.remainingMessages
      console.log('[ChatWindow] 更新剩余消息数:', remainingMessages.value)
    }
    if (contentType === 'text') messageInput.value = ''
    adjustTextareaHeight()
    await nextTick()
    scrollToBottom()
  } catch (err) {
    console.error('[ChatWindow] 发送消息失败:', err)
    toast.error(err?.message || '发送失败')
  }
}

const sendDisabled = computed(() => {
  const limitedEmpty =
    isLimited.value && remainingMessages.value !== undefined && remainingMessages.value <= 0
  const noContent = !messageInput.value.trim()
  return isBlacklisted.value || limitedEmpty || noContent
})

const handleImageUpload = async (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (!files || !files.length) return
  const file = files[0]
  if (file.size > 10 * 1024 * 1024) {
    toast.warning('图片大小不能超过10MB')
    ;(e.target as HTMLInputElement).value = ''
    return
  }
  try {
    const uploadRes = await uploadApi.uploadImage(file)
    const url = uploadRes?.data?.url || uploadRes?.url
    if (!url) throw new Error('上传失败')
    await handleSendMessage('image', { imageUrl: url })
  } catch (err) {
    toast.error(err?.message || '上传失败')
  } finally {
    ;(e.target as HTMLInputElement).value = ''
  }
}

const handleRecall = async (messageId: string) => {
  try {
    await recallMessage(messageId)
    messages.value = messages.value.map((m) =>
      m.id === messageId ? { ...m, isRecalled: true } : m
    )
    toast.success('已撤回')
  } catch (err) {
    toast.error(err?.message || '撤回失败')
  }
}

const handleReport = async (messageId: string) => {
  try {
    await reportMessage(messageId, 'inappropriate')
    toast.success('已举报')
  } catch (err) {
    toast.error(err?.message || '举报失败')
  }
}

const handleClear = async () => {
  try {
    await clearConversation(conversationId.value)
    messages.value = []
    toast.success('已清空并归档')
  } catch (err) {
    toast.error(err?.message || '清空失败')
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const loadMoreMessages = async () => {
  if (isLoadingMore.value || currentPage.value >= totalPages.value) {
    return
  }

  try {
    isLoadingMore.value = true
    const nextPage = currentPage.value + 1
    const list = await getMessages(conversationId.value, nextPage)

    if (list?.pagination) {
      totalPages.value = list.pagination.totalPages || 1
    }

    const rawMessages = (list?.messages || list?.items || []) as any[]
    const newMessages = rawMessages.map((m: any) => ({
      id: String(m.id),
      content: m.content || m.imageUrl || m.image_url || m.fileUrl || m.file_url || '',
      contentType: (m.contentType || m.content_type || 'text') as 'text' | 'image' | 'file',
      senderId: String(m.senderId || m.sender_id),
      createdAt: m.createdAt || m.created_at,
      isRecalled: m.isRecalled || m.is_recalled,
      imageUrl: m.imageUrl || m.image_url,
      fileUrl: m.fileUrl || m.file_url,
      sender: m.sender ? {
        id: String(m.sender.id),
        nickname: m.sender.nickname || m.sender.name || '用户',
        avatarUrl: m.sender.avatarUrl || m.sender.avatar_url
      } : undefined
    }))

    // 新消息加到前面（因为是向上滚动加载）
    messages.value.unshift(...newMessages)
    currentPage.value = nextPage
  } catch (err) {
    console.error('[ChatWindow] 加载更多消息失败:', err)
  } finally {
    isLoadingMore.value = false
  }
}

const handleScroll = (e: Event) => {
  const el = e.target as HTMLDivElement
  if (!el) return

  // 当滚动到顶部时，加载更多消息
  if (el.scrollTop < 100 && !isLoadingMore.value && currentPage.value < totalPages.value) {
    loadMoreMessages()
  }
}

const formatTime = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000)
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
}

const adjustTextareaHeight = () => {
  if (textInput.value) {
    textInput.value.style.height = 'auto'
    const newHeight = Math.min(textInput.value.scrollHeight, 128)
    textInput.value.style.height = `${newHeight}px`
  }
}

const handleSendTyping = (typing: boolean) => {
  socketService.sendTyping(conversationId.value, typing)
}

const handleTypingInput = () => {
  handleSendTyping(true)
  if (typingTimeout) window.clearTimeout(typingTimeout)
  typingTimeout = window.setTimeout(() => handleSendTyping(false), 1500)
}

const handleInputChange = () => {
  adjustTextareaHeight()
  handleTypingInput()
}

const handleClickOutside = () => {
  if (showEmojiPicker.value) showEmojiPicker.value = false
}

const triggerImageUpload = () => imageInput.value?.click()

const insertEmoji = (emoji: string) => {
  messageInput.value += emoji
  handleInputChange()
}

const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value
}

const startRecording = () => {
  if (isRecording.value) return
  isRecording.value = true
  recordingStartTime = Date.now()
  recordingDuration.value = 0
  recordingTimer = window.setInterval(() => {
    recordingDuration.value = Math.floor((Date.now() - recordingStartTime) / 1000)
    if (recordingDuration.value >= 60) stopRecording()
  }, 200)
}

const stopRecording = () => {
  if (!isRecording.value) return
  isRecording.value = false
  if (recordingTimer) {
    clearInterval(recordingTimer)
    recordingTimer = null
  }
  recordingDuration.value = 0
}

const cancelRecording = () => {
  if (!isRecording.value) return
  isRecording.value = false
  if (recordingTimer) {
    clearInterval(recordingTimer)
    recordingTimer = null
  }
  recordingDuration.value = 0
}

const previewImage = (url: string) => {
  previewImageUrl.value = url
}

const socketUnsubscribers: Array<() => void> = []

onMounted(async () => {
  await loadConversation()
  scrollToBottom()
  document.addEventListener('click', handleClickOutside)

  socketUnsubscribers.push(
    socketService.onMessageReceived((data: any) => {
      if (String(data.conversationId || data.conversation_id) !== conversationId.value) return
      const incomingId = String(data.id || data.message?.id || Date.now())
      if (messageExists(incomingId)) return
      messages.value.push({
        id: incomingId,
        content:
          data.message?.content || data.content || data.message?.image_url || data.imageUrl || '',
        contentType: (data.message?.content_type || data.contentType || 'text') as
          | 'text'
          | 'image'
          | 'file',
        senderId: String(data.message?.sender_id || data.senderId || data.sender_id),
        createdAt: data.message?.created_at || data.createdAt || new Date().toISOString(),
        isRecalled: data.message?.is_recalled,
        imageUrl: data.message?.image_url || data.imageUrl,
        fileUrl: data.message?.file_url || data.fileUrl,
      })
      if (
        String(data.message?.sender_id || data.senderId || data.sender_id) !==
        String(userStore.userId)
      ) {
        markConversationAsRead(conversationId.value).catch(() => {})
      }
      scrollToBottom()
    })
  )

  socketUnsubscribers.push(
    socketService.onRecall((data: any) => {
      if (String(data.conversationId) !== conversationId.value) return
      messages.value = messages.value.map((m) =>
        m.id === String(data.messageId) ? { ...m, isRecalled: true } : m
      )
    })
  )

  socketUnsubscribers.push(
    socketService.onBlacklist((data: any) => {
      if (
        String(data.targetUserId) === userStore.userId ||
        String(data.userId) === chatUser.value.id
      ) {
        isBlacklisted.value = data.action === 'added'
      }
    })
  )

  socketUnsubscribers.push(
    socketService.onUserTyping((data: any) => {
      if (String(data.conversationId) !== conversationId.value) return
      const set = new Set(typingUsers.value)
      if (data.isTyping && data.fromUserId !== userStore.userId) {
        set.add(String(data.fromUserId))
      } else {
        set.delete(String(data.fromUserId))
      }
      typingUsers.value = set
      if (typingTimeout) window.clearTimeout(typingTimeout)
      typingTimeout = window.setTimeout(() => {
        typingUsers.value = new Set()
      }, 3000)
    })
  )
})

watch(
  () => route.params.id,
  async (newId, oldId) => {
    if (newId && newId !== oldId) {
      await loadConversation()
    }
  }
)

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  socketUnsubscribers.forEach((off) => off())
})
</script>
