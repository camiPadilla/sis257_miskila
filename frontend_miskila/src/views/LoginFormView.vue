<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '../stores'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const celular = ref('')
const contrasena = ref('')
const error = ref('')
const registrado = ref(route.query.registrado === '1')

function mensajeError(exception: unknown) {
  if (axios.isAxiosError(exception)) return exception.response?.data?.message ?? 'Celular o contraseña incorrectos.'
  return 'No se pudo iniciar sesión.'
}

async function iniciarSesion() {
  error.value = ''
  try {
    const usuario = await auth.login(celular.value, contrasena.value)
    await router.push(usuario.nombreCompleto ? { name: 'inicio' } : { name: 'completar-nombre' })
  } catch (exception) {
    error.value = mensajeError(exception)
  }
}
</script>

<template>
  <section class="container py-5">
    <div class="row justify-content-center">
      <div class="col-12 col-md-6 col-lg-4">
        <div class="card border-0 shadow-sm">
          <div class="card-body p-4">
            <h1 class="h3 fw-bold mb-2">Iniciar sesión</h1>
            <p class="text-secondary mb-4">Ingresa para realizar y consultar tus pedidos.</p>
            <div v-if="registrado" class="alert alert-success" role="alert">Tu cuenta fue creada. Ahora inicia sesión.</div>
            <div v-if="error" class="alert alert-danger" role="alert">{{ error }}</div>
            <form novalidate @submit.prevent="iniciarSesion">
              <div class="mb-3">
                <label class="form-label" for="login-celular">Número de celular</label>
                <input id="login-celular" v-model.trim="celular" class="form-control" inputmode="numeric" maxlength="8" required />
              </div>
              <div class="mb-4">
                <label class="form-label" for="login-contrasena">Contraseña</label>
                <input id="login-contrasena" v-model="contrasena" class="form-control" type="password" required />
              </div>
              <button class="btn btn-primary w-100" type="submit" :disabled="auth.loading">
                {{ auth.loading ? 'Ingresando…' : 'Iniciar sesión' }}
              </button>
            </form>
            <p class="text-center mt-4 mb-0">¿No tienes una cuenta? <RouterLink to="/registro">Regístrate</RouterLink></p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
