import { defineStore } from 'pinia'
import { getStoredUser, getTokenFromLocalStorage } from '../helpers'
import api from '../plugins/axios'
import type { AuthResponse, Usuario } from '../models/usuario'
import type { ItemCarrito } from '../models/producto'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: getStoredUser<Usuario>(),
    token: getTokenFromLocalStorage(),
    loading: false,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token && state.user),
    isStaff: (state) => state.user?.rol === 'empleado' || state.user?.rol === 'administrador',
  },
  actions: {
    async login(celular: string, contrasena: string) {
      this.loading = true
      try {
        const { data } = await api.post<AuthResponse>('/auth/login', { celular, contrasena })
        this.setSession(data)
        return data.usuario
      } finally {
        this.loading = false
      }
    },
    async register(celular: string, contrasena: string) {
      this.loading = true
      try {
        const { data } = await api.post<Usuario>('/auth/register', { celular, contrasena })
        return data
      } finally {
        this.loading = false
      }
    },
    async completeName(nombreCompleto: string) {
      this.loading = true
      try {
        const { data } = await api.patch<Usuario>('/auth/nombre', { nombreCompleto })
        this.user = data
        localStorage.setItem('miskilaUser', JSON.stringify(data))
        return data
      } finally {
        this.loading = false
      }
    },
    setSession(data: AuthResponse) {
      this.token = data.accessToken
      this.user = data.usuario
      localStorage.setItem('miskilaAccessToken', data.accessToken)
      localStorage.setItem('miskilaUser', JSON.stringify(data.usuario))
    },
    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('miskilaAccessToken')
      localStorage.removeItem('miskilaUser')
    },
    async loadProfile() {
      if (!this.token) return null
      const { data } = await api.get<Usuario>('/auth/me')
      this.user = data
      localStorage.setItem('miskilaUser', JSON.stringify(data))
      return data
    },
  },
})

function leerCarrito() {
  const value = localStorage.getItem('miskilaCart')
  if (!value) return [] as ItemCarrito[]
  try { return JSON.parse(value) as ItemCarrito[] } catch { return [] as ItemCarrito[] }
}

export const useCartStore = defineStore('cart', {
  state: () => ({ items: leerCarrito() }),
  getters: {
    totalItems: (state) => state.items.reduce((total, item) => total + item.cantidad, 0),
    subtotal: (state) => state.items.reduce((total, item) => total + (item.precio ?? 0) * item.cantidad, 0),
  },
  actions: {
    save() { localStorage.setItem('miskilaCart', JSON.stringify(this.items)) },
    add(item: Omit<ItemCarrito, 'cantidad'>) {
      const existing = this.items.find((current) => current.idPresentacion === item.idPresentacion)
      if (existing) existing.cantidad += 1
      else this.items.push({ ...item, cantidad: 1 })
      this.save()
    },
    increase(idPresentacion: number) { const item = this.items.find((current) => current.idPresentacion === idPresentacion); if (item) item.cantidad += 1; this.save() },
    decrease(idPresentacion: number) { const item = this.items.find((current) => current.idPresentacion === idPresentacion); if (!item) return; item.cantidad -= 1; if (item.cantidad <= 0) this.remove(idPresentacion); else this.save() },
    remove(idPresentacion: number) { this.items = this.items.filter((item) => item.idPresentacion !== idPresentacion); this.save() },
    clear() { this.items = []; this.save() },
  },
})
