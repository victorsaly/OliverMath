import { createRouter, createWebHistory } from '@ionic/vue-router';
import Home from '../views/Home.vue'

const Stats = () => import('../views/Stats.vue');

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/stats',
    name: 'Stats',
    component: Stats
  },
  // Anything else goes home. A mistyped or stale link used to show a blank page.
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

// A chat assistant and a robot test page are developer tools, not part of a
// children's app. They are only reachable while developing, and a released
// build does not contain them at all.
if (import.meta.env.DEV) {
  routes.unshift(
    { path: '/assistant', name: 'Assistant', component: () => import('../views/Assistant.vue') },
    { path: '/bot-preview', name: 'BotPreview', component: () => import('../views/BotPreview.vue') }
  );
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
