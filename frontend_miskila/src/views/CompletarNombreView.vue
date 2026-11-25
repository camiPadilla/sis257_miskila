<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '../stores'

const router = useRouter()
const auth = useAuthStore()
const nombreCompleto = ref('')
const error = ref('')

async function guardarNombre() {
  error.value = ''
  if (nombreCompleto.value.trim().length < 2) return void (error.value = 'Escribe tu nombre completo.')
  try {
    await auth.completeName(nombreCompleto.value)
    await router.push({ name: 'inicio' })
  } catch (exception) {
    error.value = axios.isAxiosError(exception) ? exception.response?.data?.message ?? 'No se pudo guardar tu nombre.' : 'No se pudo guardar tu nombre.'
  }
}
</script>

<template>
  <section class="container py-5"><div class="row justify-content-center"><div class="col-12 col-md-7 col-lg-5"><div class="card border-0 shadow-sm"><div class="card-body p-4 p-md-5">
    <h1 class="h3 fw-bold mb-2">Completa tu registro</h1>
    <p class="text-secondary mb-4">Antes de realizar tu primer pedido necesitamos tu nombre completo.</p>
    <div v-if="error" class="alert alert-danger" role="alert">{{ error }}</div>
    <form @submit.prevent="guardarNombre"><label class="form-label" for="nombre-completo">Nombre completo</label><input id="nombre-completo" v-model.trim="nombreCompleto" class="form-control mb-4" maxlength="100" required /><button class="btn btn-primary w-100" type="submit" :disabled="auth.loading">{{ auth.loading ? 'Guardando…' : 'Continuar' }}</button></form>
  </div></div></div></div></section>
</template>
