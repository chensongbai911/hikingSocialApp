import { createApp, h } from 'vue'
import Toast from '../components/common/Toast.vue'

interface ToastOptions {
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  position?: 'top' | 'center' | 'bottom'
}

const createToast = (options: ToastOptions) => {
  const container = document.createElement('div')
  document.body.appendChild(container)

  const instance = createApp({
    render() {
      return h(Toast, {
        ...options,
        onClose: () => {
          instance.unmount()
          document.body.removeChild(container)
        }
      })
    }
  })

  instance.mount(container)
}

export const toast = {
  success: (message: string, duration?: number) => {
    createToast({ message, type: 'success', duration, position: 'top' })
  },
  error: (message: string, duration?: number) => {
    createToast({ message, type: 'error', duration, position: 'top' })
  },
  warning: (message: string, duration?: number) => {
    createToast({ message, type: 'warning', duration, position: 'top' })
  },
  info: (message: string, duration?: number) => {
    createToast({ message, type: 'info', duration, position: 'top' })
  },
  show: (options: ToastOptions) => {
    createToast(options)
  }
}

export default toast
