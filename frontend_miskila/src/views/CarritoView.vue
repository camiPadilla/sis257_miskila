<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import api from '../plugins/axios'
import { useCartStore } from '../stores'

const router = useRouter()
const cart = useCartStore()
const modalidad = ref<'domicilio' | 'retiro'>('retiro')
const direccionEntrega = ref('')
const fechaEntrega = ref('')
const horaEntrega = ref('10:00')
const error = ref('')
const enviando = ref(false)

const ahora = new Date()
const fechaMinima = new Date(ahora.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
const fechaMaxima = new Date(ahora.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
const costoDomicilio = computed(() => modalidad.value === 'domicilio' ? 13 : 0)
const total = computed(() => cart.subtotal + costoDomicilio.value)

function formatoBs(valor: number) { return `${valor.toFixed(2)} Bs` }

async function comprar() {
  error.value = ''
  if (!cart.items.length) return void (error.value = 'Tu carrito está vacío.')
  if (modalidad.value === 'domicilio' && !direccionEntrega.value.trim()) return void (error.value = 'La dirección es obligatoria para el domicilio.')
  if (!fechaEntrega.value || !horaEntrega.value) return void (error.value = 'Selecciona la fecha y hora de entrega.')
  enviando.value = true
  try {
    const { data } = await api.post<{ pedido: { idPedido: number }; mensaje: string }>('/pedidos', {
      modalidad: modalidad.value,
      direccionEntrega: modalidad.value === 'domicilio' ? direccionEntrega.value : undefined,
      fechaEntrega: fechaEntrega.value,
      horaEntrega: horaEntrega.value,
      detalles: cart.items.map((item) => ({ idPresentacion: item.idPresentacion, cantidad: item.cantidad })),
    })
    cart.clear()
    await router.push({ name: 'pago', params: { id: data.pedido.idPedido }, query: { mensaje: data.mensaje } })
  } catch (exception) {
    error.value = axios.isAxiosError(exception) ? exception.response?.data?.message ?? 'No se pudo registrar el pedido.' : 'No se pudo registrar el pedido.'
  } finally {
    enviando.value = false
  }
}
</script>

<template>
  <section class="container py-5">
    <h1 class="h2 fw-bold mb-4">Tu carrito</h1>
    <div v-if="!cart.items.length" class="alert alert-info">Tu carrito está vacío. <RouterLink to="/">Ver catálogo</RouterLink></div>
    <div v-else class="row g-4">
      <div class="col-12 col-lg-7">
        <div class="card border-0 shadow-sm"><div class="card-body">
          <div v-for="item in cart.items" :key="item.idPresentacion" class="d-flex justify-content-between align-items-center gap-3 border-bottom py-3">
            <div><h2 class="h6 mb-1">{{ item.nombreProducto }} · {{ item.nombrePresentacion }}</h2><span class="small text-secondary">{{ item.precio === null ? 'Precio a coordinar' : formatoBs(item.precio) }}</span></div>
            <div class="d-flex align-items-center gap-2"><button class="btn btn-sm btn-outline-secondary" type="button" @click="cart.decrease(item.idPresentacion)">−</button><span>{{ item.cantidad }}</span><button class="btn btn-sm btn-outline-secondary" type="button" @click="cart.increase(item.idPresentacion)">+</button><button class="btn btn-sm btn-outline-danger" type="button" @click="cart.remove(item.idPresentacion)">Quitar</button></div>
          </div>
        </div></div>
      </div>
      <div class="col-12 col-lg-5"><div class="card border-0 shadow-sm"><div class="card-body">
        <h2 class="h5 fw-bold">Datos de entrega</h2>
        <div v-if="error" class="alert alert-danger" role="alert">{{ error }}</div>
        <div class="mb-3"><label class="form-label">Modalidad</label><select v-model="modalidad" class="form-select"><option value="retiro">Retiro en Miskila (0 Bs)</option><option value="domicilio">Domicilio (13 Bs)</option></select></div>
        <div v-if="modalidad === 'domicilio'" class="mb-3"><label class="form-label" for="direccion">Dirección de entrega</label><input id="direccion" v-model.trim="direccionEntrega" class="form-control" maxlength="255" /></div>
        <div class="row g-2 mb-3"><div class="col-7"><label class="form-label" for="fecha">Fecha</label><input id="fecha" v-model="fechaEntrega" class="form-control" type="date" :min="fechaMinima" :max="fechaMaxima" /></div><div class="col-5"><label class="form-label" for="hora">Hora</label><input id="hora" v-model="horaEntrega" class="form-control" type="time" min="07:00" max="20:00" /></div></div>
        <div class="d-flex justify-content-between"><span>Subtotal</span><strong>{{ formatoBs(cart.subtotal) }}</strong></div><div class="d-flex justify-content-between"><span>Domicilio</span><strong>{{ formatoBs(costoDomicilio) }}</strong></div><hr /><div class="d-flex justify-content-between fs-5"><span>Total</span><strong>{{ formatoBs(total) }}</strong></div>
        <button class="btn btn-primary w-100 mt-3" type="button" :disabled="enviando" @click="comprar">{{ enviando ? 'Registrando pedido…' : 'Comprar' }}</button>
      </div></div></div>
    </div>
  </section>
</template>
