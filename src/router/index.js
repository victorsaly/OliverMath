import { createRouter, createWebHistory } from '@ionic/vue-router';
import Home from '../views/Home.vue'

const Assistant = () => import('../views/Assistant.vue');
const Stats = () => import('../views/Stats.vue');

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/assistant',
    name: 'Assistant',
    component: Assistant
  },
  {
    path: '/stats',
    name: 'Stats',
    component: Stats
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
