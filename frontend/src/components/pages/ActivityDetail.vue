<template>
  <div class="fixed inset-0 bg-white flex flex-col z-40 overflow-hidden">
    <!-- 顶部导航栏 -->
    <div class="flex-shrink-0 bg-white border-b border-gray-100">
      <div class="flex items-center justify-between px-4 py-3">
        <button @click="goBack" class="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h1 class="text-lg font-semibold">活动详情</h1>
        <button @click="handleShare" class="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="flex-1 overflow-y-auto pb-24 min-h-0">
      <!-- 活动封面图 -->
      <div class="relative">
        <img :src="activity.coverImage" :alt="activity.title" class="w-full h-64 object-cover" />
        <!-- 活动状态标签 -->
        <div class="absolute top-4 left-4">
          <span
            :class="[
              'px-3 py-1 rounded-full text-xs font-semibold text-white',
              activity.status === '招募中'
                ? 'bg-teal-500'
                : activity.status === '进行中'
                ? 'bg-orange-500'
                : activity.status === '已结束'
                ? 'bg-gray-400'
                : 'bg-teal-500',
            ]"
          >
            {{ activity.status }}
          </span>
        </div>
        <!-- 难度标签 -->
        <div class="absolute top-4 right-4">
          <span class="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
            难度 {{ activity.difficulty }}
          </span>
        </div>
      </div>

      <div class="px-4 py-6 space-y-6">
        <!-- 活动标题 -->
        <div>
          <h2 class="text-xl font-bold text-gray-900 mb-4">{{ activity.title }}</h2>
        </div>

        <!-- 路线详情卡片 -->
        <div class="bg-white rounded-2xl border border-gray-100 p-4">
          <div class="flex items-center mb-4">
            <svg
              class="w-5 h-5 text-teal-500 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
            <span class="font-semibold text-gray-900">路线详情</span>
            <span class="ml-auto text-sm text-gray-500">全程 {{ activity.distance }}km</span>
          </div>

          <!-- 爬升/下降数据 -->
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div class="bg-gray-50 rounded-xl p-3">
              <div class="flex items-center text-gray-500 text-xs mb-1">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
                累计爬升
              </div>
              <div class="text-2xl font-bold text-teal-500">
                {{ activity.elevationGain }}<span class="text-sm text-gray-400 ml-1">m</span>
              </div>
            </div>
            <div class="bg-gray-50 rounded-xl p-3">
              <div class="flex items-center text-gray-500 text-xs mb-1">
                <svg
                  class="w-4 h-4 mr-1 rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
                累计下降
              </div>
              <div class="text-2xl font-bold text-teal-500">
                {{ activity.elevationLoss }}<span class="text-sm text-gray-400 ml-1">m</span>
              </div>
            </div>
          </div>

          <!-- 海拔图表 -->
          <div
            class="relative bg-gradient-to-b from-teal-50 to-white rounded-xl p-4 overflow-hidden"
          >
            <!-- 图表标题 -->
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs text-gray-500">海拔 (m)</span>
              <span class="text-xs text-teal-500 font-semibold">● 曲线</span>
            </div>

            <!-- SVG 海拔图 -->
            <svg :viewBox="`0 0 ${chartWidth} ${chartHeight}`" class="w-full h-32">
              <!-- 背景网格 -->
              <line
                v-for="i in 4"
                :key="'grid-' + i"
                :x1="0"
                :y1="(i * chartHeight) / 4"
                :x2="chartWidth"
                :y2="(i * chartHeight) / 4"
                stroke="#e5e7eb"
                stroke-width="0.5"
              />

              <!-- 填充区域 -->
              <path :d="elevationAreaPath" fill="url(#gradient)" opacity="0.3" />

              <!-- 海拔曲线 -->
              <path :d="elevationPath" stroke="#14b8a6" stroke-width="2" fill="none" />

              <!-- 最高点标注 -->
              <circle :cx="maxElevationPoint.x" :cy="maxElevationPoint.y" r="4" fill="#14b8a6" />
              <text
                :x="maxElevationPoint.x"
                :y="maxElevationPoint.y - 10"
                text-anchor="middle"
                font-size="10"
                fill="#14b8a6"
                font-weight="bold"
              >
                Max {{ activity.maxElevation }}m
              </text>

              <!-- 最低点标注 -->
              <circle :cx="minElevationPoint.x" :cy="minElevationPoint.y" r="4" fill="#94a3b8" />
              <text
                :x="minElevationPoint.x"
                :y="minElevationPoint.y + 20"
                text-anchor="middle"
                font-size="10"
                fill="#64748b"
                font-weight="bold"
              >
                Min {{ activity.minElevation }}m
              </text>

              <!-- 渐变定义 -->
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style="stop-color: #14b8a6; stop-opacity: 0.5;" />
                  <stop offset="100%" style="stop-color: #14b8a6; stop-opacity: 0.05;" />
                </linearGradient>
              </defs>
            </svg>

            <!-- X轴距离标注 -->
            <div class="flex justify-between text-xs text-gray-400 mt-1">
              <span>0km</span>
              <span>{{ (activity.distance / 3).toFixed(1) }}km</span>
              <span>{{ ((activity.distance / 3) * 2).toFixed(1) }}km</span>
              <span>{{ activity.distance }}km</span>
            </div>
          </div>
        </div>

        <!-- 日程安排卡片 -->
        <div class="bg-white rounded-2xl border border-gray-100 p-4">
          <div class="flex items-center mb-4">
            <svg
              class="w-5 h-5 text-teal-500 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span class="font-semibold text-gray-900">日程安排</span>
          </div>

          <!-- 日期和时间 -->
          <div class="bg-teal-50 rounded-xl p-4 mb-3">
            <div class="flex items-center text-sm text-gray-700 mb-2">
              <svg class="w-4 h-4 mr-2 text-teal-500" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"
                />
              </svg>
              <span class="font-semibold">{{ formatDate(activity.startTime) }}</span>
            </div>
            <div class="text-sm text-gray-600 ml-6">
              {{ formatTime(activity.startTime) }} 准时出发
            </div>
            <div v-if="activity.endTime" class="text-sm text-gray-600 ml-6 mt-1">
              {{ formatTime(activity.endTime) }} 预计结束
            </div>
          </div>

          <!-- 名额与参与情况 -->
          <div class="bg-gray-50 rounded-xl p-4 mb-3">
            <div class="flex items-center justify-between text-sm text-gray-700">
              <span>名额</span>
              <span class="font-semibold">
                {{ activity.participantCount }}/{{ activity.maxParticipants || '不限' }}
              </span>
            </div>
            <div v-if="activity.maxParticipants" class="mt-2">
              <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  class="h-2 bg-teal-500"
                  :style="{ width: `${Math.min(100, (activity.participantCount / activity.maxParticipants) * 100)}%` }"
                ></div>
              </div>
              <div class="text-xs text-gray-500 mt-2">
                剩余 {{ Math.max(0, activity.maxParticipants - activity.participantCount) }} 个名额
              </div>
            </div>
          </div>

          <!-- 集合地点 -->
          <div class="flex items-start">
            <svg
              class="w-5 h-5 text-teal-500 mr-3 mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
              />
            </svg>
            <div class="flex-1">
              <div class="font-semibold text-gray-900 mb-1">{{ activity.meetingPoint }}</div>
              <div class="text-sm text-gray-500">请自行前往集合地点</div>
            </div>
          </div>
        </div>

        <!-- 活动简介 -->
        <div class="bg-white rounded-2xl border border-gray-100 p-4" v-if="activity.description">
          <h3 class="font-semibold text-gray-900 mb-3">📝 活动简介</h3>
          <p class="text-sm text-gray-600 leading-relaxed">{{ activity.description }}</p>
        </div>

        <!-- 路线描述 -->
        <div class="bg-white rounded-2xl border border-gray-100 p-4" v-if="activity.routeDescription">
          <h3 class="font-semibold text-gray-900 mb-3">🗺️ 路线描述</h3>
          <p class="text-sm text-gray-600 leading-relaxed">{{ activity.routeDescription }}</p>
        </div>

        <!-- 装备要求 -->
        <div class="bg-white rounded-2xl border border-gray-100 p-4" v-if="activity.equipmentRequired">
          <h3 class="font-semibold text-gray-900 mb-3">🎒 装备要求</h3>
          <p class="text-sm text-gray-600 leading-relaxed">{{ activity.equipmentRequired }}</p>
        </div>

        <!-- 活动亮点 -->
        <div class="bg-white rounded-2xl border border-gray-100 p-4" v-if="activity.highlights">
          <h3 class="font-semibold text-gray-900 mb-3">✨ 活动亮点</h3>
          <p class="text-sm text-gray-600 leading-relaxed">{{ activity.highlights }}</p>
        </div>

        <!-- 注意事项 -->
        <div class="bg-white rounded-2xl border border-gray-100 p-4" v-if="activity.precautions">
          <h3 class="font-semibold text-gray-900 mb-3">⚠️ 注意事项</h3>
          <p class="text-sm text-gray-600 leading-relaxed">{{ activity.precautions }}</p>
        </div>

        <!-- 最佳季节 -->
        <div class="bg-white rounded-2xl border border-gray-100 p-4" v-if="activity.bestSeason || activity.weatherTips">
          <h3 class="font-semibold text-gray-900 mb-3">🌤️ 天气建议</h3>
          <div class="space-y-2 text-sm text-gray-600">
            <p v-if="activity.bestSeason"><span class="font-medium">最佳季节：</span>{{ activity.bestSeason }}</p>
            <p v-if="activity.weatherTips"><span class="font-medium">温馨提示：</span>{{ activity.weatherTips }}</p>
          </div>
        </div>

        <!-- 参与者 -->
        <div class="bg-white rounded-2xl border border-gray-100 p-4" v-if="activity.participantCount > 0">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-gray-900">👥 参与者</h3>
            <span class="text-sm text-gray-500">{{ activity.participantCount }}人已报名</span>
          </div>
          <div v-if="activity.participants && activity.participants.length > 0" class="flex -space-x-2">
            <img
              v-for="(participant, index) in activity.participants.slice(0, 5)"
              :key="index"
              :src="participant.avatar_url || '/default-avatar.png'"
              :alt="participant.nickname"
              class="w-10 h-10 rounded-full border-2 border-white object-cover"
            />
            <div
              v-if="activity.participants.length > 5"
              class="w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs text-gray-600 font-semibold"
            >
              +{{ activity.participants.length - 5 }}
            </div>
          </div>
          <div v-else class="text-sm text-gray-500">
            已有 {{ activity.participantCount }} 人报名
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="flex-shrink-0 bg-white border-t border-gray-100 p-4">
      <div class="flex items-center space-x-3">
        <!-- 收藏按钮 -->
        <button
          v-if="!activity.isPending"
          @click="toggleFavorite"
          :class="[
            'p-3 rounded-full border transition-all',
            activity.isFavorite
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 hover:border-gray-400',
          ]"
        >
          <svg
            class="w-6 h-6"
            :class="activity.isFavorite ? 'text-red-500' : 'text-gray-400'"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            />
          </svg>
        </button>

        <!-- 联系组织者按钮 -->
        <button
          v-if="!activity.isOrganizer && !activity.isPending"
          @click="contactOrganizer"
          class="p-3 rounded-full border border-gray-300 hover:border-gray-400 transition-all"
        >
          <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>

        <!-- 管理申请按钮(仅组织者、已发布可见) -->
        <button
          v-if="activity.isOrganizer && !activity.isPending"
          @click="viewApplications"
          class="p-3 rounded-full border border-orange-300 hover:border-orange-400 bg-orange-50 transition-all"
        >
          <svg
            class="w-6 h-6 text-orange-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
        </button>

        <!-- 待发布状态：显示发布按钮 -->
        <button
          v-if="activity.isPending && activity.isOrganizer"
          @click="handlePublish"
          class="flex-1 py-3 rounded-full font-semibold text-white transition-all bg-teal-500 hover:bg-teal-600"
        >
          发布活动
        </button>

        <!-- 已发布状态：显示报名按钮 -->
        <button
          v-else-if="!activity.isOrganizer && activity.id"
          @click="handleJoinActivity"
          :disabled="joinDisabled"
          :class="[
            'flex-1 py-3 rounded-full font-semibold text-white transition-all',
            joinDisabled
              ? 'bg-gray-300 cursor-not-allowed'
              : activity.isJoined
              ? 'bg-gray-400 hover:bg-gray-500'
              : 'bg-teal-500 hover:bg-teal-600',
          ]"
        >
          {{ joinButtonText }}
        </button>

        <!-- 组织者已发布状态：显示编辑按钮 -->
        <button
          v-else-if="activity.isOrganizer && !activity.isPending"
          @click="handleEdit"
          class="flex-1 py-3 rounded-full font-semibold text-white transition-all bg-teal-500 hover:bg-teal-600"
        >
          编辑活动
        </button>
      </div>
    </div>

    <!-- 申请管理弹窗 -->
    <div
      v-if="showApplications"
      @click="showApplications = false"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div @click.stop class="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div class="flex items-center justify-between p-4 border-b">
          <h3 class="text-lg font-semibold">申请管理</h3>
          <button @click="showApplications = false" class="p-2 hover:bg-gray-100 rounded-full">
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
        <div class="overflow-y-auto max-h-[calc(80vh-80px)]">
          <ApplicationList :activity-id="String(route.params.id)" :show-participants="true" />
        </div>
      </div>
    </div>

    <!-- 分享弹窗 -->
    <div
      v-if="showShareModal"
      @click="showShareModal = false"
      class="fixed inset-0 bg-black/50 flex items-end justify-center z-50"
    >
      <div @click.stop class="bg-white rounded-t-3xl w-full p-6 animate-slide-up">
        <h3 class="text-lg font-semibold text-center mb-6">分享活动</h3>
        <div class="grid grid-cols-4 gap-6 mb-6">
          <button @click="shareToWeChat" class="flex flex-col items-center space-y-2">
            <div class="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center">
              <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M8.5 5C4.9 5 2 7.5 2 10.6c0 1.8 1 3.5 2.6 4.5l-.6 2 2.2-1.1c.8.2 1.6.3 2.4.3 3.6 0 6.5-2.5 6.5-5.6S12.1 5 8.5 5zM7 11.5c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm3 0c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z"
                />
              </svg>
            </div>
            <span class="text-xs text-gray-600">微信</span>
          </button>
          <button @click="shareToPyq" class="flex flex-col items-center space-y-2">
            <div class="w-14 h-14 rounded-full bg-green-600 flex items-center justify-center">
              <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="2" />
                <circle cx="6" cy="6" r="2" />
                <circle cx="18" cy="6" r="2" />
                <circle cx="6" cy="18" r="2" />
                <circle cx="18" cy="18" r="2" />
              </svg>
            </div>
            <span class="text-xs text-gray-600">朋友圈</span>
          </button>
          <button @click="copyLink" class="flex flex-col items-center space-y-2">
            <div class="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center">
              <svg
                class="w-8 h-8 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <span class="text-xs text-gray-600">复制链接</span>
          </button>
          <button @click="saveImage" class="flex flex-col items-center space-y-2">
            <div class="w-14 h-14 rounded-full bg-purple-500 flex items-center justify-center">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <span class="text-xs text-gray-600">生成图片</span>
          </button>
        </div>
        <button
          @click="showShareModal = false"
          class="w-full py-3 bg-gray-100 rounded-full text-gray-700 font-semibold"
        >
          取消
        </button>
      </div>
    </div>

    <!-- 发布确认弹窗 -->
    <div
      v-if="showPublishConfirm"
      @click="showPublishConfirm = false"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div @click.stop class="bg-white rounded-3xl w-full max-w-sm p-6 animate-scale-in">
        <div class="text-center mb-6">
          <div
            class="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <svg
              class="w-8 h-8 text-teal-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">确认发布活动？</h3>
          <p class="text-gray-600 text-sm">
            发布后将开始招募参与者，其他用户可以看到并报名参加此活动。
          </p>
        </div>
        <div class="flex gap-3">
          <button
            @click="showPublishConfirm = false"
            class="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
          >
            取消
          </button>
          <button
            @click="confirmPublish"
            class="flex-1 py-3 rounded-xl bg-teal-500 text-white font-semibold hover:bg-teal-600 transition"
          >
            确认发布
          </button>
        </div>
      </div>
    </div>

    <!-- 取消报名确认弹窗 -->
    <div
      v-if="showCancelJoinConfirm"
      @click="showCancelJoinConfirm = false"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div @click.stop class="bg-white rounded-3xl w-full max-w-sm p-6 animate-scale-in">
        <div class="text-center mb-6">
          <div
            class="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <svg
              class="w-8 h-8 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">确认取消报名？</h3>
          <p class="text-gray-600 text-sm">取消后需要重新申请才能参加此活动。</p>
        </div>
        <div class="flex gap-3">
          <button
            @click="showCancelJoinConfirm = false"
            class="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
          >
            我再想想
          </button>
          <button
            @click="confirmCancelJoin"
            class="flex-1 py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 transition"
          >
            确认取消
          </button>
        </div>
      </div>
    </div>

    <!-- 申请留言弹窗 -->
    <div
      v-if="showApplyMessageDialog"
      @click="showApplyMessageDialog = false"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div @click.stop class="bg-white rounded-3xl w-full max-w-sm p-6 animate-scale-in">
        <div class="mb-6">
          <h3 class="text-xl font-bold text-gray-900 mb-2 text-center">申请加入活动</h3>
          <p class="text-gray-600 text-sm text-center">请输入申请留言（可选）</p>
        </div>
        <textarea
          v-model="applyMessage"
          placeholder="向组织者介绍一下自己吧..."
          rows="4"
          class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
        ></textarea>
        <div class="flex gap-3 mt-4">
          <button
            @click="showApplyMessageDialog = false"
            class="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
          >
            取消
          </button>
          <button
            @click="confirmApply"
            class="flex-1 py-3 rounded-xl bg-teal-500 text-white font-semibold hover:bg-teal-600 transition"
          >
            提交申请
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useActivityStore } from '../../stores/activity'
import { useApplicationStore } from '../../stores/applicationStore'
import { useUserStore } from '../../stores/user'
import toast from '../../utils/toast'
import ApplicationList from '../features/ApplicationList.vue'
import html2canvas from 'html2canvas'

const route = useRoute()
const router = useRouter()
const activityStore = useActivityStore()
const applicationStore = useApplicationStore()
const userStore = useUserStore()

const showShareModal = ref(false)
const showApplications = ref(false)
const showPublishConfirm = ref(false)
const showCancelJoinConfirm = ref(false)
const showApplyMessageDialog = ref(false)
const applyMessage = ref('')
const loading = computed(() => activityStore.loading)

const isPresetActivityId = (activityId: string) => {
  return typeof activityId === 'string' && activityId.startsWith('preset-activity-')
}

// 从 store 获取当前活动
const activity = computed(() => {
  const current = activityStore.currentActivity
  if (!current) {
    return {
      id: '',
      title: '',
      coverImage: '',
      status: '',
      difficulty: 'moderate',
      distance: 0,
      elevationGain: 0,
      elevationLoss: 0,
      maxElevation: 0,
      minElevation: 0,
      startTime: new Date().toISOString(),
      meetingPoint: '',
      description: '',
      participants: [],
      isJoined: false,
      isOrganizer: false,
      isFavorite: false,
      isPending: false,
      elevationData: [],
    }
  }

  // 处理状态
  let statusText = '招募中'
  let isPending = false
  if (current.status === 'pending') {
    statusText = '待发布'
    isPending = true
  } else if (current.status === 'approved' || current.status === 'recruiting') {
    statusText = '招募中'
  } else if (current.status === 'ongoing') {
    statusText = '进行中'
  } else if (current.status === 'completed') {
    statusText = '已结束'
  } else if (current.status === 'cancelled') {
    statusText = '已取消'
  }

  // 处理海拔数据
  let elevationData = []
  if (current.elevation_data && Array.isArray(current.elevation_data)) {
    elevationData = current.elevation_data
  } else if (current.min_elevation && current.max_elevation) {
    // 如果没有完整的海拔数据，生成模拟数据
    const min = current.min_elevation
    const max = current.max_elevation
    const points = 20
    elevationData = Array.from({ length: points }, (_, i) => {
      const progress = i / (points - 1)
      // 生成符合实际的爬升曲线
      const height = min + (max - min) * Math.sin(progress * Math.PI)
      return Math.round(height)
    })
  }

  const maxParticipants = current.max_participants || null
  const participantCount = current.participant_count || 0

  return {
    id: current.id,
    title: current.title || '未命名活动',
    coverImage: current.cover_image_url || 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800',
    status: statusText,
    difficulty: current.difficulty || 'moderate',
    distance: current.distance || 0,
    elevationGain: current.elevation_gain || 0,
    elevationLoss: current.elevation_loss || 0,
    maxElevation: current.max_elevation || 0,
    minElevation: current.min_elevation || 0,
    startTime: current.start_time,
    endTime: current.end_time || null,
    location: current.location || '',
    meetingPoint: current.meeting_point || current.location || '待确定',
    description: current.description || '',
    routeDescription: current.route_description || '',
    equipmentRequired: current.equipment_required || '',
    highlights: current.highlights || '',
    precautions: current.precautions || '',
    weatherTips: current.weather_tips || '',
    bestSeason: current.best_season || '',
    participants: current.participants || [],
    isJoined: current.is_joined || false,
    isOrganizer: current.creator_id === userStore.currentUser?.id,
    isFavorite: false,
    isPending: isPending,
    elevationData: elevationData,
    creator: current.creator || { nickname: '未知用户', avatar_url: '' },
    participantCount,
    maxParticipants,
    rawStatus: current.status,
  }
})

const joinDisabledReason = computed(() => {
  if (!activity.value.id) return '活动不存在'
  if (isPresetActivityId(activity.value.id)) return '预设活动不可加入'
  if (activity.value.isOrganizer) return '你是组织者'
  if (activity.value.rawStatus === 'cancelled') return '活动已取消'
  if (activity.value.rawStatus === 'completed') return '活动已结束'
  if (activity.value.rawStatus === 'pending') return '活动待发布'
  if (activity.value.isJoined) return '已报名'
  if (activity.value.maxParticipants && activity.value.participantCount >= activity.value.maxParticipants) {
    return '人数已满'
  }
  return ''
})

const joinDisabled = computed(() => {
  return loading.value || joinDisabledReason.value !== ''
})

const joinButtonText = computed(() => {
  if (loading.value) return '处理中...'
  return joinDisabledReason.value || '立即报名'
})

// 图表尺寸
const chartWidth = 500
const chartHeight = 120

// 计算海拔曲线路径
const elevationPath = computed(() => {
  const data = activity.value.elevationData
  const maxElev = Math.max(...data)
  const minElev = Math.min(...data)
  const range = maxElev - minElev

  const points = data.map((elevation, index) => {
    const x = (index / (data.length - 1)) * chartWidth
    const y = chartHeight - ((elevation - minElev) / range) * (chartHeight - 20) - 10
    return `${x},${y}`
  })

  return `M ${points.join(' L ')}`
})

// 计算填充区域路径
const elevationAreaPath = computed(() => {
  return `${elevationPath.value} L ${chartWidth},${chartHeight} L 0,${chartHeight} Z`
})

// 计算最高点和最低点坐标
const maxElevationPoint = computed(() => {
  const data = activity.value.elevationData
  const maxElev = Math.max(...data)
  const minElev = Math.min(...data)
  const range = maxElev - minElev
  const maxIndex = data.indexOf(maxElev)

  return {
    x: (maxIndex / (data.length - 1)) * chartWidth,
    y: chartHeight - ((maxElev - minElev) / range) * (chartHeight - 20) - 10,
  }
})

const minElevationPoint = computed(() => {
  const data = activity.value.elevationData
  const maxElev = Math.max(...data)
  const minElev = Math.min(...data)
  const range = maxElev - minElev
  const minIndex = data.indexOf(minElev)

  return {
    x: (minIndex / (data.length - 1)) * chartWidth,
    y: chartHeight - ((minElev - minElev) / range) * (chartHeight - 20) - 10,
  }
})

// 格式化日期
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekday = weekdays[date.getDay()]
  return `${year}-${month.toString().padStart(2, '0')}-${day
    .toString()
    .padStart(2, '0')} (${weekday})`
}

// 格式化时间
const formatTime = (dateStr: string) => {
  const date = new Date(dateStr)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 分享功能
const handleShare = () => {
  showShareModal.value = true
}

const shareToWeChat = () => {
  // 检测是否在微信环境中
  const isWeChat = /MicroMessenger/i.test(navigator.userAgent)

  if (isWeChat) {
    // 在微信中，提示用户点击右上角分享按钮
    toast.info('请点击右上角 "···" 按钮分享给朋友')
  } else {
    // 不在微信中，复制链接并提示
    const link = window.location.href
    navigator.clipboard
      .writeText(link)
      .then(() => {
        toast.success('链接已复制，请在微信中打开并分享')
      })
      .catch(() => {
        toast.error('复制失败，请手动复制链接')
      })
  }

  showShareModal.value = false
}

const shareToPyq = () => {
  // 检测是否在微信环境中
  const isWeChat = /MicroMessenger/i.test(navigator.userAgent)

  if (isWeChat) {
    // 在微信中，提示用户点击右上角分享按钮
    toast.info('请点击右上角 "···" 按钮分享到朋友圈')
  } else {
    // 不在微信中，复制链接并提示
    const link = window.location.href
    navigator.clipboard
      .writeText(link)
      .then(() => {
        toast.success('链接已复制，请在微信中打开并分享到朋友圈')
      })
      .catch(() => {
        toast.error('复制失败，请手动复制链接')
      })
  }

  showShareModal.value = false
}

const copyLink = () => {
  const link = window.location.href
  navigator.clipboard.writeText(link).then(() => {
    toast.success('链接已复制')
    showShareModal.value = false
  })
}

const saveImage = async () => {
  showShareModal.value = false

  try {
    toast.info('正在生成图片...')

    // 创建一个用于生成图片的容器
    const shareCard = document.createElement('div')
    shareCard.style.cssText = `
      position: fixed;
      left: -9999px;
      top: 0;
      width: 375px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 24px;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    `

    shareCard.innerHTML = `
      <div style="background: white; border-radius: 12px; overflow: hidden;">
        <img src="${activity.value.coverImage}" style="width: 100%; height: 200px; object-fit: cover;" />
        <div style="padding: 20px;">
          <h2 style="font-size: 20px; font-weight: bold; color: #1a202c; margin-bottom: 16px;">${activity.value.title}</h2>
          <div style="display: flex; align-items: center; margin-bottom: 12px;">
            <svg style="width: 16px; height: 16px; color: #14b8a6; margin-right: 8px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <span style="color: #6b7280; font-size: 14px;">${activity.value.location || activity.value.meetingPoint}</span>
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 12px;">
            <svg style="width: 16px; height: 16px; color: #14b8a6; margin-right: 8px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <span style="color: #6b7280; font-size: 14px;">${formatDate(activity.value.startTime)}</span>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
            <div style="text-align: center;">
              <div style="color: #14b8a6; font-weight: bold; font-size: 18px;">${activity.value.distance}km</div>
              <div style="color: #9ca3af; font-size: 12px; margin-top: 4px;">距离</div>
            </div>
            <div style="text-align: center;">
              <div style="color: #14b8a6; font-weight: bold; font-size: 18px;">${activity.value.elevationGain}m</div>
              <div style="color: #9ca3af; font-size: 12px; margin-top: 4px;">爬升</div>
            </div>
            <div style="text-align: center;">
              <div style="color: #14b8a6; font-weight: bold; font-size: 18px;">${activity.value.difficulty}</div>
              <div style="color: #9ca3af; font-size: 12px; margin-top: 4px;">难度</div>
            </div>
          </div>
        </div>
      </div>
      <div style="text-align: center; margin-top: 16px; color: white; font-size: 12px;">
        长按图片保存分享
      </div>
    `

    document.body.appendChild(shareCard)

    // 使用 html2canvas 生成图片
    const canvas = await html2canvas(shareCard, {
      backgroundColor: null,
      scale: 2, // 提高清晰度
      logging: false,
      useCORS: true, // 允许跨域图片
      allowTaint: true,
    })

    // 移除临时元素
    document.body.removeChild(shareCard)

    // 将 canvas 转为图片
    canvas.toBlob((blob) => {
      if (blob) {
        // 创建下载链接
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${activity.value.title}-分享图.png`
        link.click()
        URL.revokeObjectURL(url)

        toast.success('图片已生成，请查看下载文件夹')
      }
    }, 'image/png')
  } catch (error) {
    console.error('生成图片失败:', error)
    toast.error('生成图片失败，请重试')
  }
}

// 收藏功能
const toggleFavorite = () => {
  activity.value.isFavorite = !activity.value.isFavorite
}

// 联系组织者
const contactOrganizer = () => {
  router.push('/chat/organizer')
}

// 申请加入活动
const handleJoinActivity = async () => {
  const activityId = route.params.id as string

  if (joinDisabled.value) {
    toast.error(joinDisabledReason.value || '当前不可报名')
    return
  }

  if (activity.value.isJoined) {
    showCancelJoinConfirm.value = true
  } else {
    // 直接加入活动
    try {
      await activityStore.joinActivity(activityId)
      toast.success('成功加入活动！')
      // 重新加载活动详情
      await activityStore.fetchActivityDetail(activityId)
    } catch (error: any) {
      console.error('加入活动失败:', error)
      toast.error('加入活动失败: ' + (error.message || '请重试'))
    }
  }
}

// 确认申请
const confirmApply = async () => {
  const activityId = route.params.id as string
  showApplyMessageDialog.value = false

  try {
    await applicationStore.applyToActivity(activityId, applyMessage.value || undefined)
    toast.success('申请已提交，请等待组织者审核')
    // 重新加载活动详情
    await activityStore.fetchActivityDetail(activityId)
  } catch (error) {
    console.error('申请失败:', error)
    toast.error('申请失败: ' + (error.message || '请重试'))
  }
}

const confirmCancelJoin = async () => {
  showCancelJoinConfirm.value = false
  const activityId = route.params.id as string

  try {
    const success = await activityStore.leaveActivity(activityId)
    if (success) {
      toast.success('已取消报名')
      // 重新加载活动详情
      await activityStore.fetchActivityDetail(activityId)
    } else {
      toast.error('取消报名失败: ' + activityStore.error)
    }
  } catch (error) {
    console.error('取消报名失败:', error)
    toast.error('取消报名失败')
  }
}

// 查看申请管理
const viewApplications = () => {
  showApplications.value = true
}

// 发布活动（从待发布改为招募中）
const handlePublish = () => {
  showPublishConfirm.value = true
}

const confirmPublish = async () => {
  showPublishConfirm.value = false

  const activityId = route.params.id as string
  try {
    // 调用更新接口，将状态改为 recruiting
    const success = await activityStore.updateActivity(activityId, { status: 'recruiting' })
    if (success) {
      toast.success('活动已发布，开始招募！')
      // 重新加载活动详情
      await activityStore.fetchActivityDetail(activityId)
    } else {
      toast.error('发布失败: ' + activityStore.error)
    }
  } catch (error) {
    console.error('发布活动失败:', error)
    toast.error('发布活动失败')
  }
}

// 编辑活动
const handleEdit = () => {
  const activityId = route.params.id as string
  router.push(`/create-activity?id=${activityId}`)
}

// 根据路由参数加载活动数据
onMounted(async () => {
  const activityId = route.params.id as string
  try {
    await activityStore.fetchActivityDetail(activityId)
    console.log('加载活动详情成功:', activityId)
  } catch (error) {
    console.error('加载活动详情失败:', error)
  }
})
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

@keyframes scale-in {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}

.animate-scale-in {
  animation: scale-in 0.2s ease-out;
}
</style>
