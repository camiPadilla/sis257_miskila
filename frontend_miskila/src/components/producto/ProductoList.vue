<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import api from '../../plugins/axios'
import type { Presentacion, Producto } from '../../models/producto'

const productos = ref<Producto[]>([])
const categoriaSeleccionada = ref('Todas')
const cargando = ref(true)
const error = ref('')
const categorias = ['Todas', 'Masitas', 'Rollos', 'Empanadas', 'Pays', 'Cupcakes', 'Tortas']

const productosVisibles = computed(() => categoriaSeleccionada.value === 'Todas'
  ? productos.value
  : productos.value.filter((producto) => producto.categoria.toLowerCase() === categoriaSeleccionada.value.toLowerCase()))

function precioMinimo(producto: Producto) {
  const precios = producto.presentaciones?.map((item) => Number(item.precio)).filter((precio) => Number.isFinite(precio)) ?? []
  return precios.length ? Math.min(...precios) : null
}

function mostrarPrecio(precio: string | null) {
  return precio === null ? 'Precio a coordinar' : `${Number(precio).toFixed(2)} Bs`
}

async function cargarCatalogo() {
  cargando.value = true
  error.value = ''
  try {
    const { data } = await api.get<Producto[]>('/productos')
    productos.value = await Promise.all(data.map(async (producto) => {
      const respuesta = await api.get<Presentacion[]>(`/productos/${producto.idProducto}/presentaciones`)
      return { ...producto, presentaciones: respuesta.data.filter((item) => item.activa) }
    }))
  } catch {
    error.value = 'No se pudo cargar el catálogo. Intenta nuevamente.'
  } finally {
    cargando.value = false
  }
}

onMounted(cargarCatalogo)
</script>

<template>
  <section class="container py-4" aria-labelledby="catalogo-titulo">
    <div class="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4">
      <div><p class="text-uppercase fw-semibold miskila-accent mb-1">Nuestros productos</p><h1 id="catalogo-titulo" class="h2 fw-bold mb-0">Elige algo dulce para tu día</h1></div>
      <a class="btn btn-outline-primary" href="https://wa.link/m0juem" target="_blank" rel="noreferrer">Consultar por WhatsApp</a>
    </div>
    <div class="d-flex flex-wrap gap-2 mb-4" aria-label="Categorías del catálogo">
      <button v-for="categoria in categorias" :key="categoria" class="btn btn-sm" :class="categoriaSeleccionada === categoria ? 'btn-primary' : 'btn-outline-secondary'" type="button" @click="categoriaSeleccionada = categoria">{{ categoria }}</button>
    </div>
    <div v-if="cargando" class="text-center py-5 text-secondary">Cargando catálogo…</div>
    <div v-else-if="error" class="alert alert-danger" role="alert">{{ error }}</div>
    <div v-else-if="!productosVisibles.length" class="alert alert-info" role="status">No hay productos en esta categoría.</div>
    <div v-else class="row g-4">
      <div v-for="producto in productosVisibles" :key="producto.idProducto" class="col-12 col-md-6 col-xl-4">
        <article class="card h-100 border-0 shadow-sm producto-card">
          <img class="card-img-top producto-imagen" :src="producto.imagen || '/images/placeholder-producto.svg'" :alt="producto.nombre" />
          <div class="card-body d-flex flex-column">
            <div class="d-flex justify-content-between gap-2 mb-2"><h2 class="h5 fw-bold mb-0">{{ producto.nombre }}</h2><span class="badge text-bg-light align-self-start">{{ producto.categoria }}</span></div>
            <p class="text-secondary small flex-grow-1">{{ producto.descripcion || 'Una preparación especial de Miskila.' }}</p>
            <p v-if="producto.pausado" class="alert alert-warning py-2 small mb-3">Producto pausado temporalmente.</p>
            <p v-else-if="precioMinimo(producto) !== null" class="fw-semibold mb-2">Desde {{ precioMinimo(producto)?.toFixed(2) }} Bs</p>
            <p v-else class="fw-semibold mb-2">Precio a coordinar</p>
            <ul class="list-group list-group-flush small rounded mb-3">
              <li v-for="presentacion in producto.presentaciones" :key="presentacion.idPresentacion" class="list-group-item px-0 d-flex justify-content-between gap-2"><span>{{ presentacion.nombre }}<span v-if="presentacion.cantidadPersonas"> · {{ presentacion.cantidadPersonas }} personas</span></span><span class="text-nowrap">{{ mostrarPrecio(presentacion.precio) }}</span></li>
            </ul>
            <button class="btn btn-primary w-100" type="button" disabled>{{ producto.pausado ? 'No disponible' : 'Agregar al carrito próximamente' }}</button>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
