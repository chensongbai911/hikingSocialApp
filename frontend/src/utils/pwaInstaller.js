/**
 * PWA 安装提示工具
 */

let deferredPrompt = null;

// 监听安装提示事件
export function initPWAInstaller () {
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('[PWA] Install prompt available');
    // 阻止默认提示
    e.preventDefault();
    // 保存事件供后续使用
    deferredPrompt = e;
    // 显示自定义安装按钮
    showInstallButton();
  });

  // 监听安装完成事件
  window.addEventListener('appinstalled', () => {
    console.log('[PWA] App installed successfully');
    deferredPrompt = null;
    hideInstallButton();
  });
}

// 触发安装提示
export async function promptInstall () {
  if (!deferredPrompt) {
    console.log('[PWA] Install prompt not available');
    return false;
  }

  // 显示安装提示
  deferredPrompt.prompt();

  // 等待用户响应
  const { outcome } = await deferredPrompt.userChoice;
  console.log(`[PWA] User response: ${outcome}`);

  // 清除已使用的提示
  deferredPrompt = null;

  return outcome === 'accepted';
}

// 检查是否已安装
export function isInstalled () {
  // iOS Safari 检测
  if (window.navigator.standalone) {
    return true;
  }

  // Android Chrome 检测
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }

  return false;
}

// 检查是否为 iOS 设备
export function isIOS () {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

// 检查是否为 iOS Safari
export function isIOSSafari () {
  const ua = navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  const webkit = /WebKit/.test(ua);
  const iOSSafari = iOS && webkit && !/CriOS|FxiOS|OPiOS|mercury/.test(ua);
  return iOSSafari;
}

// 显示安装按钮
function showInstallButton () {
  const event = new CustomEvent('pwa-install-available');
  window.dispatchEvent(event);
}

// 隐藏安装按钮
function hideInstallButton () {
  const event = new CustomEvent('pwa-install-completed');
  window.dispatchEvent(event);
}

// 注册 Service Worker
export async function registerServiceWorker () {
  if (!('serviceWorker' in navigator)) {
    console.log('[PWA] Service Worker not supported');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });

    console.log('[PWA] Service Worker registered:', registration.scope);

    // 监听更新
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      console.log('[PWA] New Service Worker found');

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          console.log('[PWA] New content available, please refresh');
          // 通知用户有新版本
          const event = new CustomEvent('pwa-update-available');
          window.dispatchEvent(event);
        }
      });
    });

    return true;
  } catch (error) {
    console.error('[PWA] Service Worker registration failed:', error);
    return false;
  }
}

// 请求通知权限
export async function requestNotificationPermission () {
  if (!('Notification' in window)) {
    console.log('[PWA] Notifications not supported');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

// 发送本地通知
export function sendNotification (title, options = {}) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const defaultOptions = {
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    ...options
  };

  return new Notification(title, defaultOptions);
}

// 获取设备信息
export function getDeviceInfo () {
  return {
    isIOS: isIOS(),
    isIOSSafari: isIOSSafari(),
    isInstalled: isInstalled(),
    standalone: window.navigator.standalone,
    displayMode: window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser',
    userAgent: navigator.userAgent
  };
}
