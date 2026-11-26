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
    { path: '/carrito', name: 'carrito', component: () => import('../views/CarritoView.vue'), meta: { requiresAuth: true } },
    { path: '/pago/:id', name: 'pago', component: () => import('../views/PagoView.vue'), meta: { requiresAuth: true } },
    { path: '/mis-pedidos', name: 'mis-pedidos', component: () => import('../views/MisPedidosView.vue'), meta: { requiresAuth: true } },
    { path: '/mis-pedidos/:id', name: 'pedido-detalle', component: () => import('../views/PedidoDetalleView.vue'), meta: { requiresAuth: true } },
    { path: '/cuenta-suspendida', name: 'cuenta-suspendida', component: () => import('../views/CuentaSuspendidaView.vue'), meta: { requiresAuth: true } },
    { path: '/panel', name: 'panel', component: () => import('../views/PanelPedidosView.vue'), meta: { requiresAuth: true, roles: ['empleado', 'administrador'] } },
    { path: '/panel/personalizado', name: 'pedido-personalizado', component: () => import('../views/PedidoPersonalizadoView.vue'), meta: { requiresAuth: true, roles: ['empleado', 'administrador'] } },
    { path: '/panel/puntos', name: 'puntos-dia', component: () => import('../views/CapacidadView.vue'), meta: { requiresAuth: true, roles: ['empleado', 'administrador'] } },
    { path: '/admin/pedidos/:id/pago', name: 'verificacion-pago', component: () => import('../views/VerificacionPagoView.vue'), meta: { requiresAuth: true, roles: ['administrador'] } },
    { path: '/admin/reembolsos', name: 'admin-reembolsos', component: () => import('../views/ReembolsosView.vue'), meta: { requiresAuth: true, roles: ['administrador'] } },
    { path: '/admin/productos', name: 'admin-productos', component: () => import('../views/ProductosAdminCrudView.vue'), meta: { requiresAuth: true, roles: ['administrador'] } },
    { path: '/admin/capacidad', name: 'admin-capacidad', component: () => import('../views/CapacidadView.vue'), meta: { requiresAuth: true, roles: ['administrador'] } },
    { path: '/admin/clientes', name: 'admin-clientes', component: () => import('../views/ClientesView.vue'), meta: { requiresAuth: true, roles: ['administrador'] } },
    { path: '/admin/reportes', name: 'admin-reportes', component: () => import('../views/ReportesView.vue'), meta: { requiresAuth: true, roles: ['administrador'] } },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) return { name: 'login' }
  const rutasSuspendido = ['cuenta-suspendida', 'mis-pedidos', 'pedido-detalle']
  if (auth.user?.estado === 'suspendido' && !rutasSuspendido.includes(String(to.name))) return { name: 'cuenta-suspendida' }
  if (auth.user?.estado === 'baneado' && to.name !== 'cuenta-suspendida') return { name: 'cuenta-suspendida' }
  const roles = to.meta.roles as string[] | undefined
  if (roles && (!auth.user || !roles.includes(auth.user.rol))) return { name: 'inicio' }
  if ((to.name === 'login' || to.name === 'registro') && auth.isAuthenticated) {
    return auth.user?.nombreCompleto ? { name: 'inicio' } : { name: 'completar-nombre' }
  }
})

export default router
