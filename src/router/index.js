import { createRouter, createWebHistory } from '@ionic/vue-router';
import Home from '../views/Home.vue'

const Assistant = () => import('../views/Assistant.vue');

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
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
