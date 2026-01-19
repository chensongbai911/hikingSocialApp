<template>
  <div class="routes-container">
    <div class="routes-header">
      <h1>精选路线</h1>
      <div class="header-actions">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索路线..."
          class="search-input"
        />
        <select v-model="filterDifficulty" class="filter-select">
          <option value="">所有难度</option>
          <option value="easy">简单</option>
          <option value="moderate">中等</option>
          <option value="hard">困难</option>
          <option value="expert">专家</option>
        </select>
      </div>
    </div>

    <div class="routes-list">
      <div
        v-if="loading"
        class="loading"
      >
        加载中...
      </div>

      <div
        v-else-if="filteredRoutes.length === 0"
        class="empty-state"
      >
        没有找到匹配的路线
      </div>

      <div
        v-else
        v-for="route in filteredRoutes"
        :key="route.id"
        class="route-card"
        @click="goToDetail(route.id)"
      >
        <div class="route-image">
          <img
            :src="route.cover_image || '/default-route.jpg'"
            :alt="route.name"
            class="image"
          />
          <div class="difficulty-badge" :class="route.difficulty">
            {{ getDifficultyLabel(route.difficulty) }}
          </div>
        </div>

        <div class="route-info">
          <h3>{{ route.name }}</h3>
          <p class="description">{{ route.description }}</p>

          <div class="stats">
            <div class="stat">
              <span class="label">距离</span>
              <span class="value">{{ route.distance }} km</span>
            </div>
            <div class="stat">
              <span class="label">爬升</span>
              <span class="value">{{ route.elevation_gain }} m</span>
            </div>
            <div class="stat">
              <span class="label">耗时</span>
              <span class="value">{{ Math.floor(route.estimated_duration / 60) }}h</span>
            </div>
          </div>

          <div class="tags">
            <span
              v-for="tag in getRouteTags(route.id)"
              :key="tag"
              class="tag"
            >
              {{ tag }}
            </span>
          </div>

          <div class="footer">
            <div class="rating">
              <span class="stars">★</span>
              <span class="rating-text">
                {{ route.rating_avg.toFixed(1) }} ({{ route.rating_count }})
              </span>
            </div>
            <button class="btn-primary">查看详情</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { routeApi } from '@/api/modules/route'

interface Route {
  id: string
  name: string
  description: string
  difficulty: string
  distance: number
  elevation_gain: number
  estimated_duration: number
  cover_image: string
  rating_avg: number
  rating_count: number
}

interface RouteTag {
  route_id: string
  tag_name: string
}

const router = useRouter()
const routes = ref<Route[]>([])
const tags = ref<RouteTag[]>([])
const loading = ref(true)
const searchQuery = ref('')
const filterDifficulty = ref('')

const filteredRoutes = computed(() => {
  return routes.value.filter(route => {
    const matchesSearch = route.name.includes(searchQuery.value) ||
                         route.description.includes(searchQuery.value)
    const matchesDifficulty = !filterDifficulty.value ||
                             route.difficulty === filterDifficulty.value
    return matchesSearch && matchesDifficulty
  })
})

const getDifficultyLabel = (difficulty: string): string => {
  const labels: Record<string, string> = {
    easy: '简单',
    moderate: '中等',
    hard: '困难',
    expert: '专家'
  }
  return labels[difficulty] || difficulty
}

const getRouteTags = (routeId: string): string[] => {
  return tags.value
    .filter(tag => tag.route_id === routeId)
    .map(tag => tag.tag_name)
    .slice(0, 3)
}

const goToDetail = (routeId: string) => {
  router.push({ name: 'RouteDetail', params: { id: routeId } })
}

onMounted(async () => {
  try {
    loading.value = true
    const [routesData, tagsData] = await Promise.all([
      routeApi.getRoutes(),
      routeApi.getRouteTags()
    ])
    routes.value = routesData
    tags.value = tagsData
  } catch (error) {
    console.error('Failed to load routes:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
.routes-container {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

.routes-header {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  h1 {
    margin: 0 0 15px 0;
    font-size: 28px;
    color: #333;
  }
}

.header-actions {
  display: flex;
  gap: 10px;

  .search-input,
  .filter-select {
    padding: 10px 15px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;

    &:focus {
      outline: none;
      border-color: #4CAF50;
    }
  }

  .search-input {
    flex: 1;
  }
}

.routes-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.loading,
.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-size: 16px;
}

.route-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
}

.route-image {
  position: relative;
  height: 200px;
  overflow: hidden;

  .image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .difficulty-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: bold;
    color: white;

    &.easy {
      background: #4CAF50;
    }

    &.moderate {
      background: #FF9800;
    }

    &.hard {
      background: #F44336;
    }

    &.expert {
      background: #9C27B0;
    }
  }
}

.route-info {
  padding: 15px;

  h3 {
    margin: 0 0 8px 0;
    font-size: 18px;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .description {
    margin: 0 0 12px 0;
    font-size: 13px;
    color: #666;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

.stats {
  display: flex;
  gap: 15px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;

  .stat {
    flex: 1;
    text-align: center;

    .label {
      display: block;
      font-size: 12px;
      color: #999;
      margin-bottom: 4px;
    }

    .value {
      display: block;
      font-size: 14px;
      font-weight: bold;
      color: #333;
    }
  }
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;

  .tag {
    display: inline-block;
    padding: 4px 10px;
    background: #f0f0f0;
    border-radius: 12px;
    font-size: 12px;
    color: #666;
  }
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .rating {
    display: flex;
    align-items: center;
    gap: 6px;

    .stars {
      color: #FFB800;
      font-size: 14px;
    }

    .rating-text {
      font-size: 12px;
      color: #666;
    }
  }

  .btn-primary {
    padding: 8px 16px;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    transition: background 0.3s;

    &:hover {
      background: #45a049;
    }
  }
}
</style>
