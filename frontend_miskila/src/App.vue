<script setup lang="ts">
import { onMounted, ref } from 'vue'
import api from './services/api'

interface Categoria {
  id: number
  nombre: string
  orden: number
  activa: boolean
}

const categorias = ref<Categoria[]>([])
const cargando = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const response = await api.get<Categoria[]>('/categorias')
    categorias.value = response.data.filter((categoria) => categoria.activa)
  } catch (cause) {
    console.error('No se pudieron cargar las categorías.', cause)
    error.value = 'No pudimos cargar el catálogo. Inténtalo nuevamente más tarde.'
  } finally {
    cargando.value = false
  }
})
</script>

<template>
  <header class="border-bottom bg-white">
    <nav class="navbar container py-3" aria-label="Navegación principal">
      <a class="navbar-brand miskila-brand fw-bold fs-3" href="#">Miskila</a>
      <span class="text-secondary">Pastelería por pedido en Sucre</span>
    </nav>
  </header>

  <main>
    <section class="container py-5">
      <div class="hero-panel p-4 p-md-5">
        <p class="text-uppercase fw-semibold miskila-accent mb-2">Un detalle dulce</p>
        <h1 class="display-5 fw-bold mb-3">Hecho con cariño, pedido en línea.</h1>
        <p class="lead mb-4">
          Explora el catálogo de Miskila y encuentra algo rico para compartir.
        </p>
        <a class="btn btn-primary px-4" href="#catalogo">Ver categorías</a>
      </div>
    </section>

    <section id="catalogo" class="container pb-5">
      <div class="mb-4">
        <h2 class="h3 fw-bold">Nuestro catálogo</h2>
        <p class="text-secondary mb-0">Elige una categoría para descubrir nuestros productos.</p>
      </div>

      <p v-if="cargando" class="text-secondary" role="status">Cargando categorías...</p>
      <div v-else-if="error" class="alert alert-warning" role="alert">{{ error }}</div>
      <div v-else-if="categorias.length === 0" class="alert alert-light border" role="status">
        Pronto encontrarás aquí las categorías de nuestros postres.
      </div>
      <div v-else class="row g-3">
        <div v-for="categoria in categorias" :key="categoria.id" class="col-sm-6 col-lg-4">
          <article class="card h-100 border-0 shadow-sm">
            <div class="card-body">
              <h3 class="card-title h5 fw-semibold">{{ categoria.nombre }}</h3>
              <p class="card-text text-secondary mb-0">Descubre los productos de esta categoría.</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  </main>

  <footer class="border-top bg-white py-3">
    <p class="container text-secondary small mb-0">Miskila · Pedidos en Sucre, Bolivia</p>
  </footer>
</template>
