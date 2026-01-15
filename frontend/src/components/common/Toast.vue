<template>
  <Teleport to="body">
    <Transition name="toast-fade">
      <div v-if="visible" class="toast-container" :class="[`toast-${type}`, position]">
        <div class="toast-content">
          <div class="toast-icon">
            <svg v-if="type === 'success'" class="icon" viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2"/>
            </svg>
            <svg v-else-if="type === 'error'" class="icon" viewBox="0 0 24 24" fill="none">
              <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2"/>
            </svg>
            <svg v-else-if="type === 'warning'" class="icon" viewBox="0 0 24 24" fill="none">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" stroke-width="2"/>
            </svg>
            <svg v-else class="icon" viewBox="0 0 24 24" fill="none">
              <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="toast-message">{{ message }}</div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const props = defineProps<{
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  position?: 'top' | 'center' | 'bottom'
}>()

const emit = defineEmits<{
  close: []
}>()

const visible = ref(false)
let timer: NodeJS.Timeout | null = null

onMounted(() => {
  visible.value = true
  startTimer()
})

const startTimer = () => {
  if (timer) clearTimeout(timer)
  const duration = props.duration || 3000
  timer = setTimeout(() => {
    visible.value = false
    setTimeout(() => emit('close'), 300)
  }, duration)
}

watch(() => props.message, () => {
  startTimer()
})
</script>

<style scoped>
.toast-container {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  pointer-events: none;
}

.toast-container.top {
  top: 20px;
}

.toast-container.center {
  top: 50%;
  transform: translate(-50%, -50%);
}

.toast-container.bottom {
  bottom: 80px;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 280px;
  max-width: 90vw;
  padding: 14px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  pointer-events: auto;
}

.toast-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
}

.icon {
  width: 100%;
  height: 100%;
}

.toast-success .icon {
  color: #10b981;
}

.toast-error .icon {
  color: #ef4444;
}

.toast-warning .icon {
  color: #f59e0b;
}

.toast-info .icon {
  color: #3b82f6;
}

.toast-message {
  flex: 1;
  font-size: 14px;
  color: #1f2937;
  line-height: 1.5;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.3s ease;
}

.toast-fade-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

.toast-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

.toast-container.center.toast-fade-enter-from {
  transform: translate(-50%, -50%) scale(0.9);
}

.toast-container.center.toast-fade-leave-to {
  transform: translate(-50%, -50%) scale(0.9);
}
</style>
