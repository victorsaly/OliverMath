<template>
  <ion-app>
    <!-- Offline Banner -->
    <div v-if="!isOnline" class="offline-banner" role="alert">
      <ion-icon :icon="cloudOfflineOutline" aria-hidden="true"></ion-icon>
      <span>You're offline. Some features may be limited.</span>
    </div>
    
    <!-- Update Available Banner -->
    <div v-if="needsUpdate" class="update-banner" role="alert">
      <span>A new version is available!</span>
      <ion-button size="small" fill="solid" color="light" @click="updateApp">
        Update Now
      </ion-button>
    </div>
    
    <!-- Install PWA Prompt (for first-time mobile users) -->
    <div v-if="canInstall && showInstallPrompt" class="install-banner">
      <div class="install-content">
        <ion-icon :icon="downloadOutline" aria-hidden="true"></ion-icon>
        <span>Install Oliver Math for a better experience!</span>
      </div>
      <div class="install-actions">
        <ion-button size="small" fill="outline" color="light" @click="dismissInstallPrompt">
          Later
        </ion-button>
        <ion-button size="small" fill="solid" color="light" @click="handleInstall">
          Install
        </ion-button>
      </div>
    </div>
    
    <ion-router-outlet />
  </ion-app>
</template>

<script>
import { IonApp, IonRouterOutlet, IonIcon, IonButton } from '@ionic/vue';
import { defineComponent, ref, onMounted } from 'vue';
import { cloudOfflineOutline, downloadOutline } from 'ionicons/icons';
import { usePWA } from '@/composables/usePWA';

export default defineComponent({
  name: 'App',
  components: {
    IonApp,
    IonRouterOutlet,
    IonIcon,
    IonButton
  },
  setup() {
    const { isOnline, canInstall, isInstalled, needsUpdate, installApp, updateApp } = usePWA();
    const showInstallPrompt = ref(false);
    
    // Check if we should show install prompt (not dismissed recently)
    onMounted(() => {
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      const dismissedTime = dismissed ? parseInt(dismissed, 10) : 0;
      const oneWeek = 7 * 24 * 60 * 60 * 1000;
      
      // Show prompt if not dismissed in the last week
      if (!dismissed || Date.now() - dismissedTime > oneWeek) {
        // Delay showing prompt for better UX
        setTimeout(() => {
          if (canInstall.value && !isInstalled.value) {
            showInstallPrompt.value = true;
          }
        }, 3000);
      }
    });
    
    const dismissInstallPrompt = () => {
      showInstallPrompt.value = false;
      localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    };
    
    const handleInstall = async () => {
      const installed = await installApp();
      if (installed) {
        showInstallPrompt.value = false;
      }
    };
    
    return {
      isOnline,
      canInstall,
      needsUpdate,
      showInstallPrompt,
      installApp,
      updateApp,
      dismissInstallPrompt,
      handleInstall,
      cloudOfflineOutline,
      downloadOutline
    };
  }
});
</script>

<style scoped>
.offline-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: var(--ion-color-warning);
  color: var(--ion-color-warning-contrast);
  padding: 8px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  z-index: 99999;
  font-size: 14px;
  font-weight: 500;
}

.update-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: var(--ion-color-primary);
  color: var(--ion-color-primary-contrast);
  padding: 8px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  z-index: 99999;
  font-size: 14px;
  font-weight: 500;
}

.install-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--ion-color-primary);
  color: var(--ion-color-primary-contrast);
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 99999;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.2);
}

.install-content {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
}

.install-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

@media (min-width: 576px) {
  .install-banner {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}
</style>