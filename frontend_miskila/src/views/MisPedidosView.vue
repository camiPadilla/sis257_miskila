<script setup lang="ts">
import { onMounted, ref } from 'vue'
import axios from 'axios'
import api from '../plugins/axios'
import type { PedidoCliente } from '../models/pedido'

const pedidos = ref<PedidoCliente[]>([])
const cargando = ref(true)
const error = ref('')

const etiquetas: Record<string, string> = { pendiente_pago: 'Pendiente', pagado: 'Pagado', no_pagado: 'No pagado', cancelado: 'Cancelado', reembolso_solicitado: 'Reembolso solicitado', reembolsado: 'Reembolsado', entregado: 'Entregado' }

function formatoBs(valor: string) { return `${Number(valor).toFixed(2)} Bs` }
function etiqueta(estado: string) { return etiquetas[estado] ?? estado }
function claseEstado(estado: string) { return ['pagado', 'entregado'].includes(estado) ? 'text-bg-success' : ['cancelado', 'no_pagado'].includes(estado) ? 'text-bg-secondary' : 'text-bg-warning' }

onMounted(async () => {
  try {
    const { data } = await api.get<PedidoCliente[]>('/pedidos/mis')
    pedidos.value = data
  } catch (exception) {
    error.value = axios.isAxiosError(exception) ? exception.response?.data?.message ?? 'No se pudieron cargar tus pedidos.' : 'No se pudieron cargar tus pedidos.'
  } finally { cargando.value = false }
})
</script>

<template>
  <section class="container py-5">
    <div class="d-flex justify-content-between align-items-center gap-3 mb-4"><div><p class="text-uppercase fw-semibold miskila-accent mb-1">Mi cuenta</p><h1 class="h2 fw-bold mb-0">Mis pedidos</h1></div><RouterLink class="btn btn-primary" to="/">Nuevo pedido</RouterLink></div>
    <div v-if="cargando" class="text-center py-5 text-secondary">Cargando tus pedidos…</div>
    <div v-else-if="error" class="alert alert-danger" role="alert">{{ error }}</div>
    <div v-else-if="!pedidos.length" class="alert alert-info">Todavía no tienes pedidos registrados.</div>
    <div v-else class="row g-3">
      <div v-for="pedido in pedidos" :key="pedido.idPedido" class="col-12 col-md-6 col-xl-4"><article class="card h-100 border-0 shadow-sm"><div class="card-body">
        <div class="d-flex justify-content-between gap-2 mb-3"><h2 class="h5 mb-0">Pedido #{{ pedido.idPedido }}</h2><span class="badge" :class="claseEstado(pedido.estado)">{{ etiqueta(pedido.estado) }}</span></div>
        <p class="small text-secondary mb-2">Entrega: {{ pedido.fechaEntrega }} · {{ pedido.horaEntrega }}</p><p class="mb-2">{{ pedido.modalidad === 'domicilio' ? 'Domicilio' : 'Retiro en Miskila' }}</p><p class="fw-bold mb-3">{{ formatoBs(pedido.total) }}</p>
        <p class="small text-secondary">{{ pedido.mensajeTiempo }}</p><RouterLink class="btn btn-outline-primary btn-sm" :to="{ name: 'pedido-detalle', params: { id: pedido.idPedido } }">Ver detalle</RouterLink>
      </div></article></div>
    </div>
  </section>
</template>
