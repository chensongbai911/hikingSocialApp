/**
 * 移动端工具函数
 */

// 检测是否为移动设备
export function isMobile () {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

// 检测是否为 iOS
export function isIOS () {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

// 检测是否为 Android
export function isAndroid () {
  return /Android/i.test(navigator.userAgent);
}

// 禁用双击缩放
export function disableDoubleTapZoom () {
  let lastTouchEnd = 0;
  document.addEventListener(
    'touchend',
    (event) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    },
    { passive: false }
  );
}

// 防止滚动穿透
export function preventScrollThrough (element) {
  let startY = 0;

  element.addEventListener('touchstart', (e) => {
    startY = e.touches[0].pageY;
  });

  element.addEventListener('touchmove', (e) => {
    const currentY = e.touches[0].pageY;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight;
    const clientHeight = element.clientHeight;

    // 滚动到顶部时继续向下拖动
    if (scrollTop === 0 && currentY > startY) {
      e.preventDefault();
    }

    // 滚动到底部时继续向上拖动
    if (scrollTop + clientHeight >= scrollHeight && currentY < startY) {
      e.preventDefault();
    }
  }, { passive: false });
}

// 获取安全区域边距
export function getSafeAreaInsets () {
  const root = document.documentElement;
  return {
    top: parseInt(getComputedStyle(root).getPropertyValue('--safe-area-inset-top') || '0'),
    right: parseInt(getComputedStyle(root).getPropertyValue('--safe-area-inset-right') || '0'),
    bottom: parseInt(getComputedStyle(root).getPropertyValue('--safe-area-inset-bottom') || '0'),
    left: parseInt(getComputedStyle(root).getPropertyValue('--safe-area-inset-left') || '0')
  };
}

// 触觉反馈（仅支持部分浏览器）
export function hapticFeedback (style = 'medium') {
  if ('vibrate' in navigator) {
    switch (style) {
      case 'light':
        navigator.vibrate(10);
        break;
      case 'medium':
        navigator.vibrate(20);
        break;
      case 'heavy':
        navigator.vibrate(30);
        break;
      case 'success':
        navigator.vibrate([10, 50, 10]);
        break;
      case 'warning':
        navigator.vibrate([10, 100, 10, 100, 10]);
        break;
      case 'error':
        navigator.vibrate([100, 50, 100]);
        break;
    }
  }
}

// 获取设备方向
export function getDeviceOrientation () {
  if (window.orientation !== undefined) {
    // iOS
    return Math.abs(window.orientation) === 90 ? 'landscape' : 'portrait';
  } else if (window.screen && window.screen.orientation) {
    // 现代浏览器
    return window.screen.orientation.type.includes('landscape') ? 'landscape' : 'portrait';
  }
  // 通过尺寸判断
  return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
}

// 监听方向变化
export function onOrientationChange (callback) {
  const handleChange = () => {
    callback(getDeviceOrientation());
  };

  if (window.screen && window.screen.orientation) {
    window.screen.orientation.addEventListener('change', handleChange);
    return () => window.screen.orientation.removeEventListener('change', handleChange);
  } else {
    window.addEventListener('orientationchange', handleChange);
    return () => window.removeEventListener('orientationchange', handleChange);
  }
}

// 获取网络状态
export function getNetworkInfo () {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

  if (!connection) {
    return {
      online: navigator.onLine,
      effectiveType: 'unknown',
      downlink: null,
      rtt: null
    };
  }

  return {
    online: navigator.onLine,
    effectiveType: connection.effectiveType, // 4g, 3g, 2g, slow-2g
    downlink: connection.downlink, // Mbps
    rtt: connection.rtt, // ms
    saveData: connection.saveData // 省流量模式
  };
}

// 监听网络状态变化
export function onNetworkChange (callback) {
  const handleOnline = () => callback({ online: true });
  const handleOffline = () => callback({ online: false });

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (connection) {
    connection.addEventListener('change', () => callback(getNetworkInfo()));
  }

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
    if (connection) {
      connection.removeEventListener('change', () => callback(getNetworkInfo()));
    }
  };
}

// 全屏显示
export function enterFullscreen (element = document.documentElement) {
  if (element.requestFullscreen) {
    return element.requestFullscreen();
  } else if (element.webkitRequestFullscreen) {
    return element.webkitRequestFullscreen();
  } else if (element.mozRequestFullScreen) {
    return element.mozRequestFullScreen();
  } else if (element.msRequestFullscreen) {
    return element.msRequestFullscreen();
  }
  return Promise.reject(new Error('Fullscreen not supported'));
}

// 退出全屏
export function exitFullscreen () {
  if (document.exitFullscreen) {
    return document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    return document.webkitExitFullscreen();
  } else if (document.mozCancelFullScreen) {
    return document.mozCancelFullScreen();
  } else if (document.msExitFullscreen) {
    return document.msExitFullscreen();
  }
  return Promise.reject(new Error('Exit fullscreen not supported'));
}

// 分享内容（Web Share API）
export async function shareContent (data) {
  if (!navigator.share) {
    throw new Error('Web Share API not supported');
  }

  try {
    await navigator.share(data);
    return true;
  } catch (error) {
    if (error.name === 'AbortError') {
      // 用户取消分享
      return false;
    }
    throw error;
  }
}

// 复制到剪贴板
export async function copyToClipboard (text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  // 降级方案
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  document.body.appendChild(textArea);
  textArea.select();

  try {
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return true;
  } catch (error) {
    document.body.removeChild(textArea);
    throw error;
  }
}
