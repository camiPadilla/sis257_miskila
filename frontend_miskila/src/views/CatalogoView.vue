<script setup lang="ts">
import ProductoList from '../components/producto/ProductoList.vue'
</script>

<template>
  <section class="container pt-4">
    <div class="hero-panel p-4 p-md-5 mb-4">
      <p class="text-uppercase fw-semibold miskila-accent mb-2">Pastelería Miskila</p>
      <h1 class="display-5 fw-bold mb-3">Pedidos dulces, hechos para ti.</h1>
      <p class="lead mb-3">Elaboramos cada producto bajo pedido para que lo disfrutes fresco.</p>
      <p class="small text-secondary mb-0">Compras: lunes a viernes de 09:00 a 18:00. Entregas y retiros: todos los días de 07:00 a 20:00.</p>
    </div>
  </section>
  <ProductoList />
</template>
