<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import api from '../plugins/axios'
import type { PedidoCliente } from '../models/pedido'

const route = useRoute()
const router = useRouter()
const pedido = ref<PedidoCliente | null>(null)
const cargando = ref(true)
const error = ref('')
const procesando = ref(false)
const mensaje = ref('')
const etiquetas: Record<string, string> = { pendiente_pago: 'Pendiente', pagado: 'Pagado', no_pagado: 'No pagado', cancelado: 'Cancelado', reembolso_solicitado: 'Reembolso solicitado', reembolsado: 'Reembolsado', entregado: 'Entregado' }
const puedeCancelar = computed(() => pedido.value?.estado === 'pendiente_pago')
const puedeReembolsar = computed(() => pedido.value?.estado === 'pagado')

function formatoBs(valor: string) { return `${Number(valor).toFixed(2)} Bs` }
function mostrarError(exception: unknown) { return axios.isAxiosError(exception) ? exception.response?.data?.message ?? 'No se pudo completar la acción.' : 'No se pudo completar la acción.' }

async function cargar() {
  try { const { data } = await api.get<PedidoCliente>(`/pedidos/mis/${route.params.id}`); pedido.value = data } catch (exception) { error.value = mostrarError(exception) } finally { cargando.value = false }
}
async function cancelar() {
  if (!pedido.value || !confirm('¿Deseas cancelar este pedido?')) return
  procesando.value = true; mensaje.value = ''; error.value = ''
  try { await api.post(`/pedidos/${pedido.value.idPedido}/cancelar`); mensaje.value = 'Tu pedido fue cancelado y los puntos fueron liberados.'; await cargar() } catch (exception) { error.value = mostrarError(exception) } finally { procesando.value = false }
}
async function solicitarReembolso() {
  if (!pedido.value || !confirm('¿Deseas solicitar el reembolso de este pedido?')) return
  procesando.value = true; mensaje.value = ''; error.value = ''
  try { const { data } = await api.post(`/pedidos/${pedido.value.idPedido}/reembolso`); mensaje.value = data.aviso ?? 'Tu solicitud de reembolso fue registrada.'; await cargar() } catch (exception) { error.value = mostrarError(exception) } finally { procesando.value = false }
}
onMounted(cargar)
</script>

<template>
  <section class="container py-5"><div v-if="cargando" class="text-center text-secondary">Cargando pedido…</div><div v-else-if="error && !pedido" class="alert alert-danger">{{ error }}</div><div v-else-if="pedido" class="row justify-content-center"><div class="col-12 col-lg-8">
    <RouterLink class="text-decoration-none" to="/mis-pedidos">← Volver a mis pedidos</RouterLink><div class="card border-0 shadow-sm mt-3"><div class="card-body p-4">
      <div class="d-flex justify-content-between gap-3 mb-3"><div><p class="text-uppercase fw-semibold miskila-accent mb-1">Detalle</p><h1 class="h3 fw-bold">Pedido #{{ pedido.idPedido }}</h1></div><span class="badge text-bg-primary align-self-start">{{ etiquetas[pedido.estado] }}</span></div>
      <p>{{ pedido.mensajeTiempo }}</p><p class="mb-1"><strong>Entrega:</strong> {{ pedido.fechaEntrega }} a las {{ pedido.horaEntrega }}</p><p class="mb-1"><strong>Modalidad:</strong> {{ pedido.modalidad === 'domicilio' ? 'Domicilio' : 'Retiro en Miskila' }}</p><p v-if="pedido.direccionEntrega" class="mb-3"><strong>Dirección:</strong> {{ pedido.direccionEntrega }}</p>
      <h2 class="h5 mt-4">Productos</h2><div v-if="pedido.detalles?.length" class="list-group mb-3"><div v-for="detalle in pedido.detalles" :key="detalle.idDetalle" class="list-group-item d-flex justify-content-between"><span>{{ detalle.cantidad }} × {{ detalle.nombrePresentacion }}<small v-if="detalle.descripcionPersonalizada" class="d-block text-secondary">{{ detalle.descripcionPersonalizada }}</small></span><strong>{{ formatoBs(detalle.subtotal) }}</strong></div></div><p v-else class="text-secondary">El detalle de productos aún no está disponible.</p>
      <div class="d-flex justify-content-between"><span>Domicilio</span><strong>{{ formatoBs(pedido.costoDomicilio) }}</strong></div><div class="d-flex justify-content-between fs-5 mt-2"><span>Total</span><strong>{{ formatoBs(pedido.total) }}</strong></div>
      <div v-if="mensaje" class="alert alert-success mt-4">{{ mensaje }}</div><div v-if="error" class="alert alert-danger mt-4">{{ error }}</div>
      <div class="d-flex flex-wrap gap-2 mt-4"><button v-if="puedeCancelar" class="btn btn-outline-danger" type="button" :disabled="procesando" @click="cancelar">Cancelar pedido</button><button v-if="puedeReembolsar" class="btn btn-outline-primary" type="button" :disabled="procesando" @click="solicitarReembolso">Solicitar reembolso</button><button v-if="pedido.estado === 'pendiente_pago'" class="btn btn-primary" type="button" @click="router.push({ name: 'pago', params: { id: pedido.idPedido } })">Ver pago</button></div>
    </div></div>
  </div></div></section>
</template>
