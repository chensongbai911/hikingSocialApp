<template>
  <div class="create-activity-page min-h-screen bg-gray-50 pb-32 flex flex-col overflow-hidden">
    <!-- 顶部导航栏 -->
    <div class="bg-white border-b border-gray-100 sticky top-0 z-10 flex-shrink-0">
      <div class="flex items-center justify-center relative px-4 py-4">
        <button @click="goBack" class="absolute left-4 w-10 h-10 flex items-center justify-center">
          <span class="text-2xl">←</span>
        </button>
        <h1 class="text-lg font-bold text-gray-800">
          {{ isEditMode ? '编辑活动' : '创建徒步活动' }}
        </h1>
      </div>
    </div>

    <!-- 表单内容 -->
    <div class="flex-1 overflow-y-auto px-4 py-6 space-y-4">
      <!-- 活动名称 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">活动名称</label>
        <input
          v-model="form.title"
          type="text"
          placeholder="请输入活动名称"
          class="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
      </div>

      <!-- 目的地点 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">目的地点</label>
        <div class="relative">
          <input
            v-model="form.destination"
            type="text"
            placeholder="搜索或输入地点"
            readonly
            @click="showDestinationPicker = true"
            class="w-full px-4 py-3 pr-12 bg-white border border-gray-200 rounded-2xl focus:outline-none cursor-pointer"
          />
          <button
            @click="showDestinationPicker = true"
            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-teal-500 text-xl"
          >
            🔍
          </button>
        </div>
      </div>

      <!-- 日期和时间 -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">日期</label>
          <div
            @click="showDatePicker = true"
            class="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-2xl cursor-pointer"
          >
            <span :class="form.date ? 'text-gray-800' : 'text-gray-400'">
              {{ form.date || '选择日期' }}
            </span>
            <span class="text-teal-500 text-xl">📅</span>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">时间</label>
          <div
            @click="showTimePicker = true"
            class="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-2xl cursor-pointer"
          >
            <span :class="form.time ? 'text-gray-800' : 'text-gray-400'">
              {{ form.time || '选择时间' }}
            </span>
            <span class="text-teal-500 text-xl">🕐</span>
          </div>
        </div>
      </div>

      <!-- 集合地点 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">集合地点</label>
        <div
          @click="showMeetingPointPicker = true"
          class="bg-white border border-gray-200 rounded-2xl p-4 cursor-pointer hover:border-teal-500 transition"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h3 class="font-semibold text-gray-800 mb-1">
                {{ form.meetingPoint || '点击选择集合地点' }}
              </h3>
              <p class="text-sm text-gray-500">
                {{ form.meetingAddress || '选择活动集合的具体位置' }}
              </p>
            </div>
            <button class="ml-3 text-teal-500 text-2xl">📍</button>
          </div>
        </div>
      </div>

      <!-- 难度等级 -->
      <div class="bg-white border border-gray-200 rounded-2xl p-4">
        <label class="block text-sm font-medium text-gray-700 mb-3">难度等级</label>
        <div class="flex gap-3">
          <button
            v-for="level in difficultyLevels"
            :key="level.value"
            @click="form.difficulty = level.value"
            type="button"
            :class="[
              'flex-1 py-3 rounded-full font-medium text-base transition',
              form.difficulty === level.value
                ? 'bg-teal-500 text-white'
                : 'bg-gray-100 text-gray-700',
            ]"
          >
            {{ level.label }}
          </button>
        </div>

        <!-- 所需人数 -->
        <div class="mt-6">
          <label class="block text-sm font-medium text-gray-700 mb-3">所需人数</label>
          <div class="flex items-center justify-center gap-6">
            <button
              @click="decreaseParticipants"
              type="button"
              class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl text-gray-600 hover:bg-gray-200 transition"
            >
              −
            </button>
            <span class="text-3xl font-bold text-gray-800">{{ form.maxParticipants }}人</span>
            <button
              @click="increaseParticipants"
              type="button"
              class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl text-teal-500 hover:bg-teal-50 transition"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <!-- 活动描述 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">活动描述</label>
        <textarea
          v-model="form.description"
          placeholder="简单介绍一下活动吧..."
          class="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent min-h-[120px] resize-none"
        ></textarea>
      </div>

      <!-- 上传照片 -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="block text-sm font-medium text-gray-700">上传照片</label>
          <span class="text-xs text-gray-500">{{ uploadedPhotos.length }}/6张 · 第一张为封面</span>
        </div>
        <div class="flex gap-3 flex-wrap">
          <!-- 已上传的照片 -->
          <div
            v-for="(photo, index) in uploadedPhotos"
            :key="index"
            class="relative w-24 h-24 rounded-2xl overflow-hidden group"
          >
            <img :src="photo" alt="Uploaded" class="w-full h-full object-cover" />
            <!-- 封面标签 -->
            <div
              v-if="index === 0"
              class="absolute top-1 left-1 bg-teal-500 text-white text-xs px-2 py-0.5 rounded-full"
            >
              封面
            </div>
            <!-- 删除按钮 -->
            <button
              @click="removePhoto(index)"
              class="absolute top-1 right-1 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
          </div>

          <!-- 添加照片按钮 -->
          <label
            v-if="uploadedPhotos.length < 6"
            class="w-24 h-24 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-teal-500 hover:bg-teal-50 transition"
          >
            <input
              type="file"
              accept="image/*"
              multiple
              @change="handlePhotoUpload"
              class="hidden"
            />
            <span class="text-3xl text-teal-500">🖼️</span>
            <span class="text-xs text-gray-500 mt-1">添加照片</span>
          </label>
        </div>
        <p class="text-xs text-gray-400 mt-2">
          支持 JPG、PNG 格式，最多 6 张，第一张将作为活动封面
        </p>
      </div>
    </div>

    <!-- 底部操作按钮 -->
    <div
      class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 pt-4 pb-6 z-40 shadow-top"
      style="padding-bottom: max(24px, env(safe-area-inset-bottom));"
    >
      <div class="flex gap-3">
        <button
          v-if="isEditMode"
          @click="handleCancel"
          class="flex-1 py-4 bg-gray-200 text-gray-700 rounded-2xl font-bold text-lg hover:bg-gray-300 transition shadow-lg"
        >
          取消
        </button>
        <button
          @click="handleSubmit"
          :disabled="loading"
          :class="[
            'py-4 rounded-2xl font-bold text-lg transition shadow-lg',
            isEditMode
              ? 'flex-1 bg-teal-500 text-white hover:bg-teal-600'
              : 'w-full bg-teal-500 text-white hover:bg-teal-600',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          ]"
        >
          {{ loading ? '处理中...' : isEditMode ? '保存修改' : '发布活动' }}
        </button>
      </div>
    </div>

    <!-- 日期选择器弹窗 -->
    <div
      v-if="showDatePicker"
      class="fixed inset-0 bg-black/50 z-50 flex items-end"
      @click.self="showDatePicker = false"
    >
      <div class="bg-white rounded-t-3xl w-full pb-safe animate-slide-up">
        <div class="p-4 border-b border-gray-100">
          <div class="flex items-center justify-between mb-4">
            <button @click="previousMonth" class="text-teal-500 text-xl">←</button>
            <h3 class="text-lg font-bold text-gray-800">选择活动日期</h3>
            <button @click="nextMonth" class="text-teal-500 text-xl">→</button>
          </div>
          <div class="text-center text-gray-600 mb-2">{{ currentYear }}年{{ currentMonth }}月</div>
        </div>

        <!-- 日历 -->
        <div class="p-4">
          <!-- 星期标题 -->
          <div class="grid grid-cols-7 gap-2 mb-2">
            <div v-for="day in weekDays" :key="day" class="text-center text-sm text-gray-500 py-2">
              {{ day }}
            </div>
          </div>

          <!-- 日期网格 -->
          <div class="grid grid-cols-7 gap-2">
            <button
              v-for="date in calendarDates"
              :key="date.key"
              @click="selectDate(date)"
              :disabled="date.disabled || date.isPast"
              :class="[
                'aspect-square flex items-center justify-center rounded-full text-base transition',
                date.isCurrentMonth ? 'text-gray-800' : 'text-gray-300',
                date.isSelected ? 'bg-teal-500 text-white font-bold' : '',
                !date.isSelected && date.isCurrentMonth && !date.disabled && !date.isPast
                  ? 'hover:bg-gray-100'
                  : '',
                date.disabled || date.isPast ? 'opacity-30 cursor-not-allowed' : '',
              ]"
            >
              {{ date.day }}
            </button>
          </div>
        </div>

        <!-- 确认按钮 -->
        <div class="px-4 pb-4">
          <button
            @click="confirmDate"
            class="w-full py-4 bg-teal-500 text-white rounded-2xl font-bold text-base hover:bg-teal-600 transition"
          >
            确定日期{{ selectedDateStr ? ` (${selectedDateStr})` : '' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 时间选择器弹窗 -->
    <div
      v-if="showTimePicker"
      class="fixed inset-0 bg-black/50 z-50 flex items-end"
      @click.self="showTimePicker = false"
    >
      <div class="bg-white rounded-t-3xl w-full pb-safe animate-slide-up">
        <div class="p-4 border-b border-gray-100">
          <h3 class="text-lg font-bold text-gray-800 text-center">选择时间</h3>
        </div>

        <div class="p-6 flex justify-center items-center gap-4">
          <!-- 小时选择 -->
          <select
            v-model="selectedHour"
            class="text-3xl font-bold text-gray-800 bg-transparent border-b-2 border-teal-500 px-4 py-2 focus:outline-none"
          >
            <option v-for="hour in 24" :key="hour" :value="String(hour - 1).padStart(2, '0')">
              {{ String(hour - 1).padStart(2, '0') }}
            </option>
          </select>
          <span class="text-3xl font-bold text-gray-800">:</span>
          <!-- 分钟选择 -->
          <select
            v-model="selectedMinute"
            class="text-3xl font-bold text-gray-800 bg-transparent border-b-2 border-teal-500 px-4 py-2 focus:outline-none"
          >
            <option v-for="minute in 60" :key="minute" :value="String(minute - 1).padStart(2, '0')">
              {{ String(minute - 1).padStart(2, '0') }}
            </option>
          </select>
        </div>

        <!-- 确认按钮 -->
        <div class="px-4 pb-4">
          <button
            @click="confirmTime"
            class="w-full py-4 bg-teal-500 text-white rounded-2xl font-bold text-base hover:bg-teal-600 transition"
          >
            确定时间 ({{ selectedHour }}:{{ selectedMinute }})
          </button>
        </div>
      </div>
    </div>

    <!-- 目的地选择器 -->
    <DestinationPicker
      v-if="showDestinationPicker"
      @close="showDestinationPicker = false"
      @select="handleDestinationSelect"
    />

    <!-- 集合地点选择 - 真实地图 -->
    <MapPicker
      v-if="showMeetingPointPicker"
      @close="showMeetingPointPicker = false"
      @confirm="handleMapConfirm"
    />

    <!-- 旧的模拟地图界面 (已弃用) -->
    <div v-if="false" class="fixed inset-0 bg-white z-50">
      <!-- 地图区域 (模拟) -->
      <div class="relative h-full bg-gradient-to-br from-teal-100 via-blue-100 to-green-100">
        <!-- 返回按钮 -->
        <button
          @click="showMeetingPointPicker = false"
          class="absolute top-6 left-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center z-10"
        >
          <span class="text-2xl text-gray-700">←</span>
        </button>

        <!-- 图层按钮 -->
        <div class="absolute top-6 right-4 space-y-3 z-10">
          <button
            class="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center"
          >
            <span class="text-2xl text-teal-500">🎯</span>
          </button>
          <button
            class="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center"
          >
            <span class="text-2xl text-gray-600">📚</span>
          </button>
        </div>

        <!-- 中心位置标记 -->
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full z-10">
          <div class="relative">
            <!-- 大标记点 (背景) -->
            <div
              class="w-24 h-24 bg-yellow-400 rounded-full opacity-30 absolute -top-12 -left-12"
            ></div>
            <!-- 主标记点 -->
            <div
              class="w-16 h-16 bg-yellow-400 rounded-full shadow-xl border-4 border-white absolute -top-8 -left-8"
            ></div>
          </div>
        </div>

        <!-- 提示气泡 -->
        <div
          class="absolute top-1/3 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl px-4 py-2 shadow-lg flex items-center gap-2"
        >
          <span class="text-sm font-medium text-gray-800">在此设置集合点</span>
          <span class="text-teal-500">✏️</span>
        </div>

        <!-- 位置信息卡片 -->
        <div class="absolute bottom-24 left-0 right-0 px-4 z-20">
          <div class="bg-white rounded-3xl shadow-2xl p-4">
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <h3 class="text-lg font-bold text-gray-800 mb-1">
                  {{ selectedMeetingPoint.name || '松林坡停车场入口' }}
                </h3>
                <p class="text-sm text-gray-500">
                  {{ selectedMeetingPoint.address || '北京市昌平区十三陵镇十三陵水库路 168 号院' }}
                </p>
              </div>
              <button @click.stop="toggleFavoriteMeetingPoint" class="ml-3 text-3xl flex-shrink-0">
                {{ isMeetingPointFavorited ? '⭐' : '☆' }}
              </button>
            </div>

            <!-- 操作按钮 -->
            <div class="flex gap-3 mb-4">
              <button
                @click="showMeetingPointSearch = true"
                class="flex-1 py-3 bg-gray-100 rounded-2xl font-medium text-gray-700 hover:bg-gray-200 transition flex items-center justify-center gap-2"
              >
                <span class="text-xl">🔍</span>
                <span>搜索地点</span>
              </button>
              <button
                @click="showFavoriteMeetingPoints = true"
                class="flex-1 py-3 bg-gray-100 rounded-2xl font-medium text-gray-700 hover:bg-gray-200 transition flex items-center justify-center gap-2"
              >
                <span class="text-xl">🔖</span>
                <span>我的收藏</span>
              </button>
            </div>

            <!-- 确认按钮 -->
            <button
              @click="confirmMeetingPoint"
              class="w-full py-4 bg-teal-500 text-white rounded-2xl font-bold text-base hover:bg-teal-600 transition shadow-lg"
            >
              确认选择此位置
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索地点页面 -->
    <div v-if="showMeetingPointSearch" class="fixed inset-0 bg-white z-[60]">
      <div class="h-full flex flex-col">
        <!-- 顶部搜索栏 -->
        <div class="bg-white border-b border-gray-100 p-4">
          <div class="flex items-center gap-3">
            <button @click="showMeetingPointSearch = false" class="text-2xl text-gray-700">
              ←
            </button>
            <div class="flex-1 relative">
              <span class="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl">🔍</span>
              <input
                v-model="meetingPointSearchQuery"
                type="text"
                placeholder="搜索集合地点"
                class="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                autofocus
              />
            </div>
          </div>
        </div>

        <!-- 搜索结果 -->
        <div class="flex-1 overflow-y-auto p-4">
          <div
            v-if="filteredMeetingPointSearchResults.length === 0"
            class="text-center py-12 text-gray-400"
          >
            <div class="text-5xl mb-3">🔍</div>
            <p>{{ meetingPointSearchQuery ? '未找到相关地点' : '输入关键词搜索地点' }}</p>
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="location in filteredMeetingPointSearchResults"
              :key="location.id"
              @click="selectSearchedMeetingPoint(location)"
              class="bg-white border border-gray-200 rounded-2xl p-4 hover:border-teal-500 hover:shadow-md transition cursor-pointer"
            >
              <div class="flex items-start gap-3">
                <div
                  class="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center flex-shrink-0"
                >
                  <span class="text-xl">📍</span>
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="font-semibold text-gray-800 mb-1">{{ location.name }}</h4>
                  <p class="text-sm text-gray-500 truncate">{{ location.address }}</p>
                  <div class="flex items-center gap-2 text-xs text-gray-400 mt-1">
                    <span>{{ location.distance }}</span>
                    <span v-if="location.category">• {{ location.category }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 我的收藏页面 -->
    <div v-if="showFavoriteMeetingPoints" class="fixed inset-0 bg-white z-[60]">
      <div class="h-full flex flex-col">
        <!-- 顶部标题栏 -->
        <div class="bg-white border-b border-gray-100">
          <div class="flex items-center justify-center relative px-4 py-4">
            <button
              @click="showFavoriteMeetingPoints = false"
              class="absolute left-4 text-2xl text-gray-700"
            >
              ←
            </button>
            <h2 class="text-lg font-bold text-gray-800">我的收藏</h2>
          </div>
        </div>

        <!-- 收藏列表 -->
        <div class="flex-1 overflow-y-auto p-4">
          <div v-if="favoriteMeetingPoints.length === 0" class="text-center py-12 text-gray-400">
            <div class="text-5xl mb-3">📑</div>
            <p class="text-base">暂无收藏地点</p>
            <p class="text-sm mt-2">点击地点右上角星标即可收藏</p>
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="location in favoriteMeetingPoints"
              :key="location.id"
              @click="selectFavoriteMeetingPoint(location)"
              class="bg-white border border-gray-200 rounded-2xl p-4 hover:border-teal-500 hover:shadow-md transition cursor-pointer"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-start gap-3 flex-1 min-w-0">
                  <div
                    class="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0"
                  >
                    <span class="text-2xl">📍</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="font-semibold text-gray-800 mb-1">{{ location.name }}</h4>
                    <p class="text-sm text-gray-500">{{ location.address }}</p>
                    <div class="flex items-center gap-2 text-xs text-gray-400 mt-2">
                      <span>{{ location.distance }}</span>
                      <span v-if="location.category">• {{ location.category }}</span>
                    </div>
                  </div>
                </div>
                <button
                  @click.stop="removeFavoriteMeetingPoint(location.id)"
                  class="text-2xl flex-shrink-0"
                >
                  ⭐
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 取消确认对话框 -->
    <div
      v-if="showCancelConfirm"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
      @click.self="showCancelConfirm = false"
    >
      <div class="bg-white rounded-3xl w-full max-w-sm p-6 animate-scale-in">
        <div class="text-center mb-6">
          <div class="text-5xl mb-4">⚠️</div>
          <h3 class="text-xl font-bold text-gray-800 mb-2">确定放弃修改吗？</h3>
          <p class="text-gray-500 text-sm">已修改的内容将不会保存</p>
        </div>
        <div class="flex gap-3">
          <button
            @click="showCancelConfirm = false"
            class="flex-1 py-3 bg-gray-100 text-gray-700 rounded-2xl font-medium hover:bg-gray-200 transition"
          >
            继续编辑
          </button>
          <button
            @click="confirmCancel"
            class="flex-1 py-3 bg-red-500 text-white rounded-2xl font-medium hover:bg-red-600 transition"
          >
            放弃修改
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useActivityStore } from '@/stores/activity'
import type { CreateActivityData } from '@/types'
import MapPicker from '../MapPicker.vue'
import DestinationPicker from '../features/DestinationPicker.vue'
import toast from '@/utils/toast'

const router = useRouter()
const route = useRoute()
const activityStore = useActivityStore()
const loading = computed(() => activityStore.loading)

// 编辑模式
const isEditMode = ref(false)
const activityId = ref<string | null>(null)

// 表单数据
const form = ref({
  title: '',
  destination: '',
  date: '',
  time: '',
  meetingPoint: '奥林匹克森林公园南门',
  meetingAddress: '北京市朝阳区科荟路33号',
  difficulty: 'easy',
  maxParticipants: 4,
  description: '',
})

// 加载活动数据（编辑模式）
const loadActivityData = async (id: string) => {
  try {
    const activity = await activityStore.getActivityById(id)
    if (!activity) {
      toast.error('活动不存在')
      goBack()
      return
    }

    // 检查是否为创建者（通过isOrganizer标志）
    if (!activity.isOrganizer) {
      toast.error('只有活动创建者可以编辑')
      goBack()
      return
    }

    // 检查活动状态
    if (activity.status === 'completed' || activity.status === 'cancelled') {
      toast.error('已结束或已取消的活动无法编辑')
      goBack()
      return
    }

    // 回显数据
    form.value.title = activity.title
    form.value.destination = activity.location
    form.value.difficulty = activity.difficulty || 'easy'
    form.value.maxParticipants = activity.max_participants || 4
    form.value.description = activity.description || ''

    // 解析日期和时间
    if (activity.start_time) {
      const startDate = new Date(activity.start_time)
      const year = startDate.getFullYear()
      const month = String(startDate.getMonth() + 1).padStart(2, '0')
      const day = String(startDate.getDate()).padStart(2, '0')
      const hours = String(startDate.getHours()).padStart(2, '0')
      const minutes = String(startDate.getMinutes()).padStart(2, '0')

      form.value.date = `${year}-${month}-${day}`
      form.value.time = `${hours}:${minutes}`
      selectedDate.value = startDate
      selectedHour.value = hours
      selectedMinute.value = minutes
    }

    // 加载照片数组（如果有多张）
    if (activity.photos && activity.photos.length > 0) {
      uploadedPhotos.value = activity.photos
    } else if (activity.cover_image_url) {
      // 兼容旧数据，只有封面图的情况
      uploadedPhotos.value = [activity.cover_image_url]
    }

    toast.success('活动数据加载成功')
  } catch (error) {
    console.error('加载活动数据失败:', error)
    toast.error('加载活动数据失败')
    goBack()
    router.back()
  }
}

// 页面挂载时检查是否为编辑模式
onMounted(async () => {
  const id = route.query.id as string
  if (id && id !== 'NaN') {
    isEditMode.value = true
    activityId.value = id
    await loadActivityData(id)
  }
})

// 难度选项
const difficultyLevels = [
  { value: 'easy', label: '简单' },
  { value: 'moderate', label: '中等' },
  { value: 'hard', label: '困难' },
]

// 照片上传（最多6张）
const uploadedPhotos = ref<string[]>([])

const handlePhotoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files) {
    const remainingSlots = 6 - uploadedPhotos.value.length
    const filesToUpload = Array.from(files).slice(0, remainingSlots)

    filesToUpload.forEach((file) => {
      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        toast.warning('请上传图片文件')
        return
      }

      // 验证文件大小（最多5MB）
      if (file.size > 5 * 1024 * 1024) {
        toast.warning('图片大小不能超过 5MB')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result && uploadedPhotos.value.length < 6) {
          uploadedPhotos.value.push(e.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    })

    // 清空 input，允许重复上传同一文件
    target.value = ''
  }
}

const removePhoto = (index: number) => {
  uploadedPhotos.value.splice(index, 1)
}

// 人数调整
const decreaseParticipants = () => {
  if (form.value.maxParticipants > 1) {
    form.value.maxParticipants--
  }
}

const increaseParticipants = () => {
  if (form.value.maxParticipants < 99) {
    form.value.maxParticipants++
  }
}

// 日期选择器
const showDatePicker = ref(false)
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth() + 1)
const selectedDate = ref<Date | null>(null)
const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const selectedDateStr = computed(() => {
  if (!selectedDate.value) return ''
  const month = String(selectedDate.value.getMonth() + 1).padStart(2, '0')
  const day = String(selectedDate.value.getDate()).padStart(2, '0')
  return `${month}-${day}`
})

const calendarDates = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const daysInMonth = lastDay.getDate()
  const startWeekDay = firstDay.getDay()

  const dates = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // 上个月的日期
  const prevMonthLastDay = new Date(year, month - 1, 0).getDate()
  for (let i = startWeekDay - 1; i >= 0; i--) {
    dates.push({
      day: prevMonthLastDay - i,
      isCurrentMonth: false,
      disabled: true,
      isPast: true,
      key: `prev-${prevMonthLastDay - i}`,
    })
  }

  // 当月日期
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day)
    date.setHours(0, 0, 0, 0)
    const isPast = date < today
    const isSelected = selectedDate.value && date.getTime() === selectedDate.value.getTime()

    dates.push({
      day,
      date,
      isCurrentMonth: true,
      disabled: false,
      isPast,
      isSelected,
      key: `current-${day}`,
    })
  }

  // 下个月的日期
  const remainingDays = 42 - dates.length
  for (let day = 1; day <= remainingDays; day++) {
    dates.push({
      day,
      isCurrentMonth: false,
      disabled: true,
      isPast: false,
      key: `next-${day}`,
    })
  }

  return dates
})

const previousMonth = () => {
  if (currentMonth.value === 1) {
    currentMonth.value = 12
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

const nextMonth = () => {
  if (currentMonth.value === 12) {
    currentMonth.value = 1
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

const selectDate = (date: any) => {
  if (!date.disabled && !date.isPast && date.isCurrentMonth) {
    selectedDate.value = date.date
  }
}

const confirmDate = () => {
  if (selectedDate.value) {
    const year = selectedDate.value.getFullYear()
    const month = String(selectedDate.value.getMonth() + 1).padStart(2, '0')
    const day = String(selectedDate.value.getDate()).padStart(2, '0')
    form.value.date = `${year}-${month}-${day}`
    showDatePicker.value = false
  }
}

// 时间选择器
const showTimePicker = ref(false)
const selectedHour = ref('08')
const selectedMinute = ref('00')

const confirmTime = () => {
  form.value.time = `${selectedHour.value}:${selectedMinute.value}`
  showTimePicker.value = false
}

// 目的地选择
const showDestinationPicker = ref(false)

const handleDestinationSelect = (name: string) => {
  form.value.destination = name
  showDestinationPicker.value = false
}

// 集合地点选择
const showMeetingPointPicker = ref(false)
const showMeetingPointSearch = ref(false)
const showFavoriteMeetingPoints = ref(false)
const meetingPointSearchQuery = ref('')
const showCancelConfirm = ref(false)

interface MeetingPointLocation {
  id: string
  name: string
  address: string
  distance: string
  category?: string
  lat?: number
  lng?: number
}

const selectedMeetingPoint = ref<Partial<MeetingPointLocation>>({
  name: '松林坡停车场入口',
  address: '北京市昌平区十三陵镇十三陵水库路 168 号院',
})

// 模拟搜索结果
const meetingPointSearchResults = ref<MeetingPointLocation[]>([
  {
    id: '1',
    name: '奥林匹克森林公园南门',
    address: '北京市朝阳区科荟路33号',
    distance: '距离 2.5 km',
    category: '公园',
  },
  {
    id: '2',
    name: '松林坡停车场入口',
    address: '北京市昌平区十三陵镇十三陵水库路 168 号院',
    distance: '距离 5.3 km',
    category: '停车场',
  },
  {
    id: '3',
    name: '香山公园东门',
    address: '北京市海淀区买卖街40号',
    distance: '距离 8.7 km',
    category: '公园',
  },
  {
    id: '4',
    name: '颐和园北宫门',
    address: '北京市海淀区新建宫门路19号',
    distance: '距离 6.2 km',
    category: '景区',
  },
  {
    id: '5',
    name: '八达岭长城游客中心',
    address: '北京市延庆区G6京藏高速58号出口',
    distance: '距离 45.8 km',
    category: '景区',
  },
  {
    id: '6',
    name: '百望山森林公园',
    address: '北京市海淀区黑山扈北口19号',
    distance: '距离 7.1 km',
    category: '公园',
  },
])

// 收藏的集合地点
const favoriteMeetingPoints = ref<MeetingPointLocation[]>([
  {
    id: '1',
    name: '奥林匹克森林公园南门',
    address: '北京市朝阳区科荟路33号',
    distance: '距离 2.5 km',
    category: '公园',
  },
  {
    id: '3',
    name: '香山公园东门',
    address: '北京市海淀区买卖街40号',
    distance: '距离 8.7 km',
    category: '公园',
  },
])

// 过滤搜索结果
const filteredMeetingPointSearchResults = computed(() => {
  if (!meetingPointSearchQuery.value.trim()) {
    return meetingPointSearchResults.value
  }
  const query = meetingPointSearchQuery.value.toLowerCase()
  return meetingPointSearchResults.value.filter(
    (location) =>
      location.name.toLowerCase().includes(query) ||
      location.address.toLowerCase().includes(query) ||
      location.category?.toLowerCase().includes(query)
  )
})

// 当前地点是否已收藏
const isMeetingPointFavorited = computed(() => {
  return favoriteMeetingPoints.value.some((loc) => loc.name === selectedMeetingPoint.value.name)
})

// 切换收藏状态
const toggleFavoriteMeetingPoint = () => {
  const current = selectedMeetingPoint.value
  const index = favoriteMeetingPoints.value.findIndex((loc) => loc.name === current.name)

  if (index >= 0) {
    // 取消收藏
    favoriteMeetingPoints.value.splice(index, 1)
  } else {
    // 添加收藏
    favoriteMeetingPoints.value.push({
      id: Date.now().toString(),
      name: current.name || '',
      address: current.address || '',
      distance: '距离 -- km',
      category: '自定义',
    })
  }
}

// 从搜索结果选择地点
const selectSearchedMeetingPoint = (location: MeetingPointLocation) => {
  selectedMeetingPoint.value = {
    name: location.name,
    address: location.address,
  }
  showMeetingPointSearch.value = false
}

// 从收藏列表选择地点
const selectFavoriteMeetingPoint = (location: MeetingPointLocation) => {
  selectedMeetingPoint.value = {
    name: location.name,
    address: location.address,
  }
  showFavoriteMeetingPoints.value = false
}

// 删除收藏
const removeFavoriteMeetingPoint = (id: string) => {
  const index = favoriteMeetingPoints.value.findIndex((loc) => loc.id === id)
  if (index >= 0) {
    favoriteMeetingPoints.value.splice(index, 1)
  }
}

// 确认集合地点
const confirmMeetingPoint = () => {
  form.value.meetingPoint = selectedMeetingPoint.value.name || ''
  form.value.meetingAddress = selectedMeetingPoint.value.address || ''
  showMeetingPointPicker.value = false
}

// 处理地图选择确认
const handleMapConfirm = (location: any) => {
  form.value.meetingPoint = location.name
  form.value.meetingAddress = location.address
  showMeetingPointPicker.value = false
}

// 取消编辑
const handleCancel = () => {
  showCancelConfirm.value = true
}

// 确认取消
const confirmCancel = () => {
  showCancelConfirm.value = false
  router.back()
}

// 表单提交
const handleSubmit = async () => {
  // 验证必填项
  if (!form.value.title) {
    toast.warning('请输入活动名称')
    return
  }
  if (!form.value.destination) {
    toast.warning('请选择目的地点')
    return
  }
  if (!form.value.date) {
    toast.warning('请选择活动日期')
    return
  }
  if (!form.value.time) {
    toast.warning('请选择活动时间')
    return
  }
  if (!form.value.difficulty) {
    toast.warning('请选择难度等级')
    return
  }
  if (!form.value.meetingPoint) {
    toast.warning('请选择集合地点')
    return
  }
  if (!form.value.maxParticipants || form.value.maxParticipants < 2) {
    toast.warning('最少需要 2 人成团')
    return
  }
  if (!form.value.description) {
    toast.warning('请输入活动描述')
    return
  }

  try {
    // 构建活动数据
    const startTime = `${form.value.date}T${form.value.time}:00`

    // 计算结束时间（默认活动持续4小时）
    const startDate = new Date(startTime)
    const endDate = new Date(startDate.getTime() + 4 * 60 * 60 * 1000) // 加4小时

    // 格式化为本地时间字符串 YYYY-MM-DDTHH:mm:ss
    const year = endDate.getFullYear()
    const month = String(endDate.getMonth() + 1).padStart(2, '0')
    const day = String(endDate.getDate()).padStart(2, '0')
    const hours = String(endDate.getHours()).padStart(2, '0')
    const minutes = String(endDate.getMinutes()).padStart(2, '0')
    const seconds = String(endDate.getSeconds()).padStart(2, '0')
    const endTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`

    // 处理照片数组
    const defaultCoverImage =
      'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600&fit=crop'
    const photos = uploadedPhotos.value.length > 0 ? uploadedPhotos.value : [defaultCoverImage]
    const coverImageUrl = photos[0] // 第一张作为封面

    const activityData: CreateActivityData = {
      title: form.value.title,
      description: form.value.description || `${form.value.title} - 欢迎加入!`,
      location: form.value.destination,
      start_time: startTime,
      end_time: endTime,
      difficulty: form.value.difficulty as 'easy' | 'moderate' | 'hard',
      max_participants: form.value.maxParticipants,
      cover_image_url: coverImageUrl,
      photos, // 照片数组
      status: 'recruiting' // 直接发布为招募状态
    }

    let success = false
    if (isEditMode.value && activityId.value) {
      // 编辑模式
      const result = await activityStore.updateActivity(activityId.value, activityData)
      success = !!result
      if (success) {
        toast.success('活动修改成功！')
        router.push('/my-hiking?tab=created')
      } else {
        toast.error('修改失败: ' + activityStore.error)
      }
    } else {
      // 创建模式
      const result = await activityStore.createActivity(activityData)
      success = !!result
      if (success) {
        toast.success('活动发布成功！')
        router.push('/my-hiking?tab=created')
      } else {
        toast.error('发布失败: ' + activityStore.error)
      }
    }
  } catch (error) {
    console.error('提交活动失败:', error)
    toast.error(isEditMode.value ? '修改活动失败' : '发布活动失败')
  }
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
@keyframes slide-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}

.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 16px);
}

.shadow-top {
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.08);
}

@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scale-in {
  animation: scale-in 0.2s ease-out;
}
</style>
