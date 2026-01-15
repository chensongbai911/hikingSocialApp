<template>
  <div class="filter-bar bg-white p-4 rounded-lg shadow-sm sticky top-0 z-10">
    <!-- 搜索框 -->
    <div class="mb-4">
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="placeholder"
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
        @input="$emit('search', searchQuery)"
      />
    </div>

    <!-- 筛选标签 -->
    <div v-if="filters && filters.length" class="flex gap-2 overflow-x-auto pb-2">
      <button
        @click="clearFilters"
        :class="['px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition', activeFilters.length === 0 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300']"
      >
        全部
      </button>

      <button
        v-for="filter in filters"
        :key="filter"
        @click="toggleFilter(filter)"
        :class="['px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition', activeFilters.includes(filter) ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300']"
      >
        {{ filter }}
      </button>
    </div>

    <!-- 排序选项 -->
    <div v-if="sortOptions && sortOptions.length" class="flex gap-2 mt-3">
      <select
        :value="sortBy"
        @change="$emit('sort', ($event.target as HTMLSelectElement).value)"
        class="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary"
      >
        <option value="">排序方式</option>
        <option v-for="option in sortOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface SortOption {
  value: string
  label: string
}

const props = withDefaults(
  defineProps<{
    placeholder?: string
    filters?: string[]
    sortOptions?: SortOption[]
    sortBy?: string
  }>(),
  {
    placeholder: '搜索...',
    filters: () => [],
    sortOptions: () => [],
    sortBy: '',
  }
)

const emit = defineEmits<{
  search: [query: string]
  filter: [filters: string[]]
  sort: [sortBy: string]
}>()

const searchQuery = ref('')
const activeFilters = ref<string[]>([])

const toggleFilter = (filter: string) => {
  const index = activeFilters.value.indexOf(filter)
  if (index > -1) {
    activeFilters.value.splice(index, 1)
  } else {
    activeFilters.value.push(filter)
  }
  emit('filter', activeFilters.value)
}

const clearFilters = () => {
  activeFilters.value = []
  emit('filter', [])
}
</script>

<style scoped>
.filter-bar {
  background: white;
}

/* 隐藏滚动条样式 */
::-webkit-scrollbar {
  height: 4px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}
</style>
