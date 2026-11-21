import { createApp } from 'vue'
import App from './App.vue'
import router from './router';

import { IonicVue } from '@ionic/vue';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/* Ionic 8+ Palette */
import '@ionic/vue/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

const app = createApp(App)
  .use(IonicVue)
  .use(router);
  
// A link straight to a page inside the game (or an old link from before the
// game moved to play/) has no file behind it, so the host answers with
// 404.html. That page remembers the address and sends the visitor here.
try {
  const wanted = window.sessionStorage.getItem('oliver-redirect');
  if (wanted) {
    window.sessionStorage.removeItem('oliver-redirect');
    if (wanted !== '/') router.replace(wanted);
  }
} catch {
  // No session storage: the game opens on its home screen.
}

router.isReady().then(() => {
  app.mount('#app');
});

// PWA service worker is now registered by vite-plugin-pwa automatically