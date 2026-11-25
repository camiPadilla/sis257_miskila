import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores'
import CatalogoView from '../views/CatalogoView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'inicio', component: CatalogoView },
    { path: '/login', name: 'login', component: () => import('../views/LoginView.vue') },
    { path: '/registro', name: 'registro', component: () => import('../views/RegistroView.vue') },
    { path: '/completar-nombre', name: 'completar-nombre', component: () => import('../views/CompletarNombreView.vue'), meta: { requiresAuth: true } },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) return { name: 'login' }
  if ((to.name === 'login' || to.name === 'registro') && auth.isAuthenticated) {
    return auth.user?.nombreCompleto ? { name: 'inicio' } : { name: 'completar-nombre' }
  }
})

export default router
