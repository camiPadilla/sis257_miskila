<script setup lang="ts">
import { useAuthStore } from '../stores'

const auth = useAuthStore()
</script>

<template>
  <header class="border-bottom bg-white">
    <nav class="navbar navbar-expand-lg container py-3" aria-label="Navegación principal">
      <RouterLink class="navbar-brand miskila-brand fw-bold fs-3" to="/">Miskila</RouterLink>
      <div class="d-flex align-items-center gap-3 ms-auto">
        <RouterLink class="link-secondary text-decoration-none" to="/">Inicio</RouterLink>
        <span v-if="auth.user" class="small text-secondary">{{ auth.user.nombreCompleto || auth.user.celular }}</span>
        <RouterLink v-if="!auth.isAuthenticated" class="btn btn-primary btn-sm" to="/login">Iniciar sesión</RouterLink>
        <button v-else class="btn btn-outline-secondary btn-sm" type="button" @click="auth.logout">Cerrar sesión</button>
      </div>
    </nav>
  </header>
</template>
