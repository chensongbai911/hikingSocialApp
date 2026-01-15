<template>
  <div class="application-list">
    <!-- 标题栏 -->
    <div class="header">
      <h2 class="title">报名申请管理</h2>
      <span class="count">待审核 {{ pendingApplications.length }} 人</span>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <span>加载中...</span>
    </div>

    <!-- 申请列表 -->
    <div v-else-if="pendingApplications.length > 0" class="applications">
      <div v-for="app in pendingApplications" :key="app.application_id" class="application-card">
        <!-- 用户信息 -->
        <div class="user-info">
          <img
            :src="app.applicant?.avatar_url || '/default-avatar.png'"
            :alt="app.applicant?.nickname"
            class="avatar"
          />
          <div class="info">
            <h3 class="nickname">{{ app.applicant?.nickname }}</h3>
            <div class="meta">
              <span class="level" :class="`level-${app.applicant?.hiking_level}`">
                {{ hikingLevelText(app.applicant?.hiking_level) }}
              </span>
              <span class="gender">{{ genderText(app.applicant?.gender) }}</span>
              <span v-if="app.applicant?.age" class="age">{{ app.applicant.age }}岁</span>
            </div>
          </div>
        </div>

        <!-- 申请留言 -->
        <div v-if="app.message" class="message">
          <p class="message-label">申请留言:</p>
          <p class="message-content">{{ app.message }}</p>
        </div>

        <!-- 用户简介 -->
        <div v-if="app.applicant?.bio" class="bio">
          <p class="bio-content">{{ app.applicant.bio }}</p>
        </div>

        <!-- 申请时间 -->
        <div class="time">
          申请时间: {{ formatTime(app.created_at) }}
        </div>

        <!-- 操作按钮 -->
        <div class="actions">
          <button
            class="btn btn-approve"
            :disabled="reviewing === app.application_id"
            @click="handleApprove(app.application_id)"
          >
            <span v-if="reviewing === app.application_id">处理中...</span>
            <span v-else>✓ 通过</span>
          </button>
          <button
            class="btn btn-reject"
            :disabled="reviewing === app.application_id"
            @click="handleReject(app.application_id)"
          >
            <span v-if="reviewing === app.application_id">处理中...</span>
            <span v-else>✗ 拒绝</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty">
      <div class="empty-icon">📋</div>
      <p>暂无待审核申请</p>
    </div>

    <!-- 已通过成员列表 -->
    <div v-if="showParticipants && approvedParticipants.length > 0" class="participants-section">
      <h3 class="section-title">已通过成员 ({{ participantCount }})</h3>
      <div class="participants-list">
        <div v-for="user in approvedParticipants" :key="user.id" class="participant-item">
          <img
            :src="user.avatar_url || '/default-avatar.png'"
            :alt="user.nickname"
            class="small-avatar"
          />
          <span class="participant-name">{{ user.nickname }}</span>
          <span class="participant-level" :class="`level-${user.hiking_level}`">
            {{ hikingLevelText(user.hiking_level) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useApplicationStore } from '../../stores/applicationStore'
import { storeToRefs } from 'pinia'

const props = defineProps<{
  activityId: string
  showParticipants?: boolean // 是否显示已通过成员列表
}>()

const applicationStore = useApplicationStore()
const { pendingApplications, approvedParticipants, participantCount, loading } = storeToRefs(applicationStore)
import toast from '../../utils/toast'

const reviewing = ref<string | null>(null)

// 加载数据
onMounted(async () => {
  await applicationStore.fetchPendingApplications(props.activityId)
  if (props.showParticipants) {
    await applicationStore.fetchApprovedParticipants(props.activityId)
  }
})

// 通过申请
const handleApprove = async (applicationId: string) => {
  try {
    reviewing.value = applicationId
    await applicationStore.reviewApplication(applicationId, 'approve')
    toast.success('已通过申请')
    // 成功后刷新成员列表
    if (props.showParticipants) {
      await applicationStore.fetchApprovedParticipants(props.activityId)
    }
  } catch (error: any) {
    toast.error(error.message || '审核失败')
  } finally {
    reviewing.value = null
  }
}

// 拒绝申请
const handleReject = async (applicationId: string) => {
  // TODO: 后续可以改为自定义确认对话框
  if (!confirm('确定要拒绝此申请吗?')) return

  try {
    reviewing.value = applicationId
    await applicationStore.reviewApplication(applicationId, 'reject')
    toast.info('已拒绝申请')
  } catch (error: any) {
    toast.error(error.message || '审核失败')
  } finally {
    reviewing.value = null
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
.application-list {
  padding: 16px;
  max-width: 800px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
}

.count {
  font-size: 14px;
  color: #ff6b00;
  font-weight: 500;
}

/* 加载状态 */
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #666;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #ff6b00;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 申请卡片 */
.applications {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.application-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.3s;
}

.application-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

/* 用户信息 */
.user-info {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 12px;
}

.info {
  flex: 1;
}

.nickname {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.meta {
  display: flex;
  align-items: center;
  gap: 8px;
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

/* 留言 */
.message {
  margin: 12px 0;
  padding: 12px;
  background: #f8f8f8;
  border-radius: 8px;
}

.message-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.message-content {
  font-size: 14px;
  color: #333;
  line-height: 1.6;
}

/* 简介 */
.bio {
  margin: 12px 0;
}

.bio-content {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}

/* 时间 */
.time {
  font-size: 12px;
  color: #999;
  margin: 12px 0;
}

/* 操作按钮 */
.actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-approve {
  background: #4caf50;
  color: white;
}

.btn-approve:not(:disabled):hover {
  background: #45a049;
}

.btn-reject {
  background: #f44336;
  color: white;
}

.btn-reject:not(:disabled):hover {
  background: #da190b;
}

/* 空状态 */
.empty {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

/* 成员列表 */
.participants-section {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e0e0e0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 16px;
}

.participants-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.participant-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #f8f8f8;
  border-radius: 8px;
}

.small-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 12px;
}

.participant-name {
  flex: 1;
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.participant-level {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}
</style>
