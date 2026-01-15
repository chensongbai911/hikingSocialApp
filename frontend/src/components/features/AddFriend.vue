<template>
  <div class="add-friend">
    <!-- 搜索框 -->
    <div class="search-section">
      <div class="search-box">
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="搜索用户昵称或邮箱"
          class="search-input"
          @input="handleSearchInput"
          @keyup.enter="handleSearch"
        />
        <button class="search-btn" @click="handleSearch" :disabled="loading">
          <span v-if="loading">搜索中...</span>
          <span v-else>🔍 搜索</span>
        </button>
      </div>
    </div>

    <!-- 骨架屏 -->
    <Skeleton v-if="loading && !searchResults.length && !recommendedUsers.length" type="list" :count="5" />

    <!-- 搜索结果 -->
    <div v-if="searchResults.length > 0" class="section">
      <h3 class="section-title">搜索结果</h3>
      <div class="user-list">
        <div v-for="user in searchResults" :key="user.user_id" class="user-card">
          <img
            :src="user.avatar_url || '/default-avatar.png'"
            :alt="user.nickname"
            class="avatar"
          />
          <div class="user-info">
            <h4 class="nickname">{{ user.nickname }}</h4>
            <p v-if="user.bio" class="bio">{{ user.bio }}</p>
            <div class="meta">
              <span class="level" :class="`level-${user.hiking_level}`">
                {{ hikingLevelText(user.hiking_level) }}
              </span>
              <span v-if="user.gender" class="gender">{{ genderText(user.gender) }}</span>
            </div>
          </div>
          <button
            class="btn-add"
            @click="handleSendRequest(user.user_id)"
            :disabled="sendingTo === user.user_id"
          >
            <span v-if="sendingTo === user.user_id">发送中...</span>
            <span v-else>+ 添加</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 推荐用户 -->
    <div v-if="recommendedUsers.length > 0" class="section">
      <h3 class="section-title">
        <span>可能认识的人</span>
        <button class="refresh-btn" @click="loadRecommendations" :disabled="loading">
          🔄 刷新
        </button>
      </h3>
      <div class="user-list">
        <div v-for="user in recommendedUsers" :key="user.user_id" class="user-card">
          <img
            :src="user.avatar_url || '/default-avatar.png'"
            :alt="user.nickname"
            class="avatar"
          />
          <div class="user-info">
            <h4 class="nickname">{{ user.nickname }}</h4>
            <p v-if="user.bio" class="bio">{{ user.bio }}</p>
            <div class="tags" v-if="user.common_preferences && user.common_preferences.length > 0">
              <span v-for="tag in user.common_preferences.slice(0, 3)" :key="tag" class="tag">
                {{ tag }}
              </span>
            </div>
            <div class="meta">
              <span class="level" :class="`level-${user.hiking_level}`">
                {{ hikingLevelText(user.hiking_level) }}
              </span>
              <span v-if="user.mutual_friends_count" class="mutual">
                {{ user.mutual_friends_count }}个共同好友
              </span>
            </div>
          </div>
          <button
            class="btn-add"
            @click="handleSendRequest(user.user_id)"
            :disabled="sendingTo === user.user_id"
          >
            <span v-if="sendingTo === user.user_id">发送中...</span>
            <span v-else>+ 添加</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 好友请求 -->
    <div v-if="pendingRequests.length > 0" class="section">
      <h3 class="section-title">好友请求 ({{ pendingRequests.length }})</h3>
      <div class="request-list">
        <div v-for="request in pendingRequests" :key="request.friendship_id" class="request-card">
          <img
            :src="request.avatar_url || '/default-avatar.png'"
            :alt="request.nickname"
            class="avatar"
          />
          <div class="request-info">
            <h4 class="nickname">{{ request.nickname }}</h4>
            <p v-if="request.message" class="message">{{ request.message }}</p>
            <div class="meta">
              <span class="level" :class="`level-${request.hiking_level}`">
                {{ hikingLevelText(request.hiking_level) }}
              </span>
              <span class="time">{{ formatTime(request.created_at) }}</span>
            </div>
          </div>
          <div class="request-actions">
            <button
              class="btn btn-accept"
              @click="handleAccept(request.user_id)"
              :disabled="processing === request.user_id"
            >
              ✓ 接受
            </button>
            <button
              class="btn btn-reject"
              @click="handleReject(request.user_id)"
              :disabled="processing === request.user_id"
            >
              ✗ 拒绝
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 我的好友 -->
    <div v-if="friends.length > 0" class="section">
      <h3 class="section-title">我的好友 ({{ friendCount }})</h3>
      <div class="friend-grid">
        <div v-for="friend in friends" :key="friend.id" class="friend-card">
          <img
            :src="friend.avatar_url || '/default-avatar.png'"
            :alt="friend.nickname"
            class="avatar"
          />
          <h4 class="nickname">{{ friend.nickname }}</h4>
          <span class="level" :class="`level-${friend.hiking_level}`">
            {{ hikingLevelText(friend.hiking_level) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useFriendStore } from '../../stores/friendStore'
import { storeToRefs } from 'pinia'
import toast from '../../utils/toast'
import { debounce, cache } from '../../utils/helpers'
import Skeleton from '../common/Skeleton.vue'

const friendStore = useFriendStore()
const {
  friends,
  friendCount,
  pendingRequests,
  searchResults,
  recommendedUsers,
  loading
} = storeToRefs(friendStore)

const searchKeyword = ref('')
const sendingTo = ref<string | null>(null)
const processing = ref<string | null>(null)

// 加载数据
onMounted(async () => {
  // 先从缓存加载好友列表
  const cachedFriends = cache.get<any[]>('cached_friends')
  if (cachedFriends) {
    friends.value = cachedFriends
  }

  await Promise.all([
    friendStore.fetchFriends(),
    friendStore.fetchPendingRequests(),
    loadRecommendations()
  ])

  // 更新缓存
  cache.set('cached_friends', friends.value, 5 * 60 * 1000) // 5分钟过期
})

// 防抖搜索
const debouncedSearch = debounce(async (keyword: string) => {
  if (!keyword.trim()) return
  await friendStore.searchUsers(keyword.trim())
}, 300)

// 搜索输入
const handleSearchInput = () => {
  debouncedSearch(searchKeyword.value)
}

// 搜索用户
const handleSearch = async () => {
  if (!searchKeyword.value.trim()) return
  await friendStore.searchUsers(searchKeyword.value.trim())
}

// 加载推荐用户
const loadRecommendations = async () => {
  await friendStore.fetchRecommendedUsers(10)
}

// 发送好友请求
const handleSendRequest = async (friendId: string) => {
  try {
    sendingTo.value = friendId
    await friendStore.sendFriendRequest(friendId)
    toast.success('好友请求已发送')
    // 从搜索结果或推荐列表中移除
    friendStore.clearSearchResults()
    await loadRecommendations()
  } catch (error: any) {
    toast.error(error.message || '发送失败')
  } finally {
    sendingTo.value = null
  }
}

// 接受好友请求
const handleAccept = async (friendId: string) => {
  try {
    processing.value = friendId
    await friendStore.acceptFriendRequest(friendId)
    toast.success('已接受好友请求')
  } catch (error: any) {
    toast.error(error.message || '接受失败')
  } finally {
    processing.value = null
  }
}

// 拒绝好友请求
const handleReject = async (friendId: string) => {
  try {
    processing.value = friendId
    await friendStore.rejectFriendRequest(friendId)
    toast.info('已拒绝好友请求')
  } catch (error: any) {
    toast.error(error.message || '拒绝失败')
  } finally {
    processing.value = null
  }
}

// 格式化时间
const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`

  return date.toLocaleDateString('zh-CN')
}

// 徒步等级文本
const hikingLevelText = (level?: string) => {
  const levels: Record<string, string> = {
    beginner: '入门',
    intermediate: '进阶',
    advanced: '高级',
    expert: '专家'
  }
  return levels[level || 'beginner'] || '入门'
}

// 性别文本
const genderText = (gender?: string) => {
  const genders: Record<string, string> = {
    male: '男',
    female: '女',
    other: '其他'
  }
  return genders[gender || ''] || ''
}
</script>

<style scoped>
.add-friend {
  padding: 16px;
  max-width: 800px;
  margin: 0 auto;
}

/* 搜索框 */
.search-section {
  margin-bottom: 24px;
}

.search-box {
  display: flex;
  gap: 8px;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 24px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s;
}

.search-input:focus {
  border-color: #ff6b00;
}

.search-btn {
  padding: 12px 24px;
  background: #ff6b00;
  color: white;
  border: none;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
  white-space: nowrap;
}

.search-btn:not(:disabled):hover {
  background: #e55a00;
}

.search-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 分组 */
.section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.refresh-btn {
  padding: 6px 12px;
  background: #f5f5f5;
  border: none;
  border-radius: 16px;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  transition: background 0.3s;
}

.refresh-btn:not(:disabled):hover {
  background: #e0e0e0;
}

/* 用户列表 */
.user-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-card {
  display: flex;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.3s;
}

.user-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 12px;
}

.user-info {
  flex: 1;
}

.nickname {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.bio {
  font-size: 13px;
  color: #666;
  margin: 4px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tags {
  display: flex;
  gap: 6px;
  margin: 6px 0;
  flex-wrap: wrap;
}

.tag {
  padding: 2px 8px;
  background: #fff3e0;
  color: #e65100;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  font-size: 12px;
  color: #666;
}

.level {
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.level-beginner {
  background: #e8f5e9;
  color: #2e7d32;
}

.level-intermediate {
  background: #fff3e0;
  color: #e65100;
}

.level-advanced {
  background: #e3f2fd;
  color: #1565c0;
}

.level-expert {
  background: #f3e5f5;
  color: #6a1b9a;
}

.mutual {
  color: #ff6b00;
}

.btn-add {
  padding: 8px 20px;
  background: #ff6b00;
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
  white-space: nowrap;
}

.btn-add:not(:disabled):hover {
  background: #e55a00;
}

.btn-add:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 好友请求 */
.request-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.request-card {
  display: flex;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-left: 3px solid #ff6b00;
}

.request-info {
  flex: 1;
  margin-right: 12px;
}

.message {
  font-size: 13px;
  color: #666;
  margin: 6px 0;
  line-height: 1.4;
}

.time {
  color: #999;
}

.request-actions {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-accept {
  background: #4caf50;
  color: white;
}

.btn-accept:not(:disabled):hover {
  background: #45a049;
}

.btn-reject {
  background: #f44336;
  color: white;
}

.btn-reject:not(:disabled):hover {
  background: #da190b;
}

/* 好友网格 */
.friend-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
}

.friend-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  text-align: center;
  transition: transform 0.3s;
}

.friend-card:hover {
  transform: translateY(-4px);
}

.friend-card .avatar {
  width: 64px;
  height: 64px;
  margin: 0 0 8px 0;
}

.friend-card .nickname {
  font-size: 14px;
  margin-bottom: 4px;
}

.friend-card .level {
  font-size: 11px;
}
</style>
