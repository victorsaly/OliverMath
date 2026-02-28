import { ref, onMounted, onUnmounted } from 'vue';

// PWA Install Prompt and Offline Detection Composable
export function usePWA() {
  const isOnline = ref(navigator.onLine);
  const canInstall = ref(false);
  const isInstalled = ref(false);
  const needsUpdate = ref(false);
  
  let deferredPrompt = null;
  let swRegistration = null;

  // Check if app is already installed
  const checkInstallStatus = () => {
    // Check if running in standalone mode (installed PWA)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      isInstalled.value = true;
    }
    // iOS check
    if (window.navigator.standalone === true) {
      isInstalled.value = true;
    }
  };

  // Handle install prompt
  const handleBeforeInstallPrompt = (e) => {
    e.preventDefault();
    deferredPrompt = e;
    canInstall.value = true;
  };

  // Handle app installed event
  const handleAppInstalled = () => {
    deferredPrompt = null;
    canInstall.value = false;
    isInstalled.value = true;
    console.log('PWA was installed');
  };

  // Trigger install prompt
  const installApp = async () => {
    if (!deferredPrompt) {
      console.log('Install prompt not available');
      return false;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      deferredPrompt = null;
      canInstall.value = false;
      return true;
    } else {
      console.log('User dismissed the install prompt');
      return false;
    }
  };

  // Handle online/offline status
  const handleOnline = () => {
    isOnline.value = true;
  };

  const handleOffline = () => {
    isOnline.value = false;
  };

  // Service Worker update handling
  const handleServiceWorkerUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        swRegistration = registration;
        
        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000); // Check every hour

        // Listen for new service worker
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                needsUpdate.value = true;
              }
            });
          }
        });
      });

      // Listen for controller change
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  };

  // Force update the service worker
  const updateApp = () => {
    if (swRegistration && swRegistration.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  // Clear cache and reload
  const clearCacheAndReload = async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
    window.location.reload(true);
  };

  onMounted(() => {
    checkInstallStatus();
    
    // Install prompt events
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    
    // Online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Service worker updates
    handleServiceWorkerUpdate();
  });

  onUnmounted(() => {
    window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.removeEventListener('appinstalled', handleAppInstalled);
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  });

  return {
    isOnline,
    canInstall,
    isInstalled,
    needsUpdate,
    installApp,
    updateApp,
    clearCacheAndReload
  };
}

export default usePWA;
