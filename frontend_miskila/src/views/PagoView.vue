<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const mensaje = computed(() => String(route.query.mensaje || 'Realiza tu pago lo antes posible. Tienes 8 horas desde tu pedido para pagar, cancelar o solicitar reembolso.'))
</script>

<template>
  <section class="container py-5"><div class="row justify-content-center"><div class="col-12 col-md-8 col-lg-6"><div class="card border-0 shadow-sm text-center"><div class="card-body p-4 p-md-5">
    <p class="text-uppercase fw-semibold miskila-accent mb-2">Pedido #{{ route.params.id }}</p><h1 class="h3 fw-bold">Pedido registrado</h1>
    <p class="text-secondary">{{ mensaje }}</p>
    <div class="qr-placeholder my-4"><img src="/images/qr-miskila.png" alt="Código QR de pago de Miskila" /><p class="small text-secondary mb-0">Escanea el QR para realizar tu pago.</p></div>
    <p class="small mb-4">El comprobante por WhatsApp es opcional. Lo importante es que el pago llegue a la cuenta de Miskila.</p>
    <a class="btn btn-outline-primary" href="https://wa.link/m0juem" target="_blank" rel="noreferrer">Contactar por WhatsApp</a>
  </div></div></div></div></section>
</template>
