import { defineStore } from 'pinia'
import { getStoredUser, getTokenFromLocalStorage } from '../helpers'
import api from '../plugins/axios'
import type { AuthResponse, Usuario } from '../models/usuario'

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
