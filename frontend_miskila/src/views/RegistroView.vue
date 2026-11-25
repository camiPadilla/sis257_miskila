<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '../stores'

const router = useRouter()
const auth = useAuthStore()
const celular = ref('')
const contrasena = ref('')
const confirmarContrasena = ref('')
const error = ref('')
const registrado = ref(false)

function mensajeError(exception: unknown) {
  if (axios.isAxiosError(exception)) return exception.response?.data?.message ?? 'No se pudo completar el registro.'
  return 'No se pudo completar el registro.'
}

async function registrar() {
  error.value = ''
  if (!/^[67]\d{7}$/.test(celular.value)) return void (error.value = 'El celular debe tener 8 dígitos y comenzar con 6 o 7.')
  if (contrasena.value.length < 8) return void (error.value = 'La contraseña debe tener al menos 8 caracteres.')
  if (contrasena.value !== confirmarContrasena.value) return void (error.value = 'Las contraseñas no coinciden.')
  try {
    await auth.register(celular.value, contrasena.value)
    registrado.value = true
    setTimeout(() => router.push({ name: 'login', query: { registrado: '1' } }), 1200)
  } catch (exception) {
    error.value = mensajeError(exception)
  }
}
</script>

<template>
  <section class="container py-5">
    <div class="row justify-content-center"><div class="col-12 col-md-7 col-lg-5"><div class="card border-0 shadow-sm"><div class="card-body p-4 p-md-5">
      <h1 class="h3 fw-bold mb-2">Crear cuenta</h1>
      <p class="text-secondary mb-4">Regístrate para realizar tus pedidos en Miskila.</p>
      <div v-if="error" class="alert alert-danger" role="alert">{{ error }}</div>
      <div v-if="registrado" class="alert alert-success" role="alert">Cuenta creada. Te enviaremos al inicio de sesión.</div>
      <form novalidate @submit.prevent="registrar">
        <div class="mb-3"><label class="form-label" for="registro-celular">Número de celular</label><input id="registro-celular" v-model.trim="celular" class="form-control" inputmode="numeric" maxlength="8" required /></div>
        <div class="mb-3"><label class="form-label" for="registro-contrasena">Contraseña</label><input id="registro-contrasena" v-model="contrasena" class="form-control" type="password" minlength="8" required /></div>
        <div class="mb-4"><label class="form-label" for="registro-confirmacion">Repetir contraseña</label><input id="registro-confirmacion" v-model="confirmarContrasena" class="form-control" type="password" minlength="8" required /></div>
        <button class="btn btn-primary w-100" type="submit" :disabled="auth.loading || registrado">{{ auth.loading ? 'Registrando…' : 'Registrarme' }}</button>
      </form>
      <p class="text-center mt-4 mb-0">¿Ya tienes una cuenta? <RouterLink to="/login">Inicia sesión</RouterLink></p>
    </div></div></div></div>
  </section>
</template>
