<script setup lang="ts">
import { onMounted, ref } from 'vue'
import axios from 'axios'
import api from './services/api'
import ProductosAdmin from './components/ProductosAdmin.vue'

interface Categoria {
  id: number
  nombre: string
  orden: number
  activa: boolean
}

const categorias = ref<Categoria[]>([])
const cargando = ref(true)
const guardando = ref(false)
const nombre = ref('')
const orden = ref(0)
const categoriaEditandoId = ref<number | null>(null)
const nombreEdicion = ref('')
const ordenEdicion = ref(0)
const operacionId = ref<number | null>(null)
const error = ref('')
const mensaje = ref('')

async function cargarCategorias() {
  cargando.value = true
  error.value = ''
  try {
    const response = await api.get<Categoria[]>('/categorias')
    categorias.value = response.data
  } catch (cause) {
    console.error('No se pudieron cargar las categorías.', cause)
    error.value = 'No pudimos cargar el catálogo. Inténtalo nuevamente más tarde.'
  } finally {
    cargando.value = false
  }
}

async function crearCategoria() {
  guardando.value = true
  error.value = ''
  mensaje.value = ''

  try {
    await api.post('/categorias', {
      nombre: nombre.value.trim(),
      orden: orden.value,
    })
    nombre.value = ''
    orden.value = 0
    mensaje.value = 'La categoría se creó correctamente.'
    await cargarCategorias()
  } catch (cause) {
    console.error('No se pudo crear la categoría.', cause)
    error.value = axios.isAxiosError(cause) && cause.response?.status === 409
      ? 'Ya existe una categoría con ese nombre.'
      : 'No se pudo guardar la categoría. Verifica los datos e inténtalo nuevamente.'
  } finally {
    guardando.value = false
  }
}

function comenzarEdicion(categoria: Categoria) {
  categoriaEditandoId.value = categoria.id
  nombreEdicion.value = categoria.nombre
  ordenEdicion.value = categoria.orden
  error.value = ''
  mensaje.value = ''
}

function cancelarEdicion() {
  categoriaEditandoId.value = null
  nombreEdicion.value = ''
  ordenEdicion.value = 0
}

async function actualizarCategoria(id: number) {
  operacionId.value = id
  error.value = ''
  mensaje.value = ''

  try {
    await api.patch(`/categorias/${id}`, {
      nombre: nombreEdicion.value.trim(),
      orden: ordenEdicion.value,
    })
    cancelarEdicion()
    mensaje.value = 'La categoría se actualizó correctamente.'
    await cargarCategorias()
  } catch (cause) {
    console.error('No se pudo actualizar la categoría.', cause)
    error.value = axios.isAxiosError(cause) && cause.response?.status === 409
      ? 'Ya existe una categoría con ese nombre.'
      : 'No se pudo actualizar la categoría. Verifica los datos e inténtalo nuevamente.'
  } finally {
    operacionId.value = null
  }
}

async function cambiarEstadoCategoria(categoria: Categoria) {
  if (
    categoria.activa &&
    !window.confirm(`¿Quieres desactivar la categoría "${categoria.nombre}"?`)
  ) {
    return
  }

  operacionId.value = categoria.id
  error.value = ''
  mensaje.value = ''

  try {
    if (categoria.activa) {
      await api.delete(`/categorias/${categoria.id}`)
      mensaje.value = 'La categoría se desactivó correctamente.'
    } else {
      await api.patch(`/categorias/${categoria.id}`, { activa: true })
      mensaje.value = 'La categoría se reactivó correctamente.'
    }
    await cargarCategorias()
  } catch (cause) {
    console.error('No se pudo cambiar el estado de la categoría.', cause)
    error.value = 'No se pudo cambiar el estado de la categoría. Inténtalo nuevamente.'
  } finally {
    operacionId.value = null
  }
}

onMounted(cargarCategorias)
</script>

<template>
  <header class="border-bottom bg-white">
    <nav class="navbar container py-3" aria-label="Navegación principal">
      <a class="navbar-brand miskila-brand fw-bold fs-3" href="#">Miskila</a>
      <div class="d-flex align-items-center gap-3">
        <a class="link-secondary text-decoration-none" href="#categorias">Categorías</a>
        <a class="link-secondary text-decoration-none" href="#productos">Productos</a>
      </div>
    </nav>
  </header>

  <main>
    <section class="container py-5">
      <div class="hero-panel p-4 p-md-5">
        <p class="text-uppercase fw-semibold miskila-accent mb-2">Panel de catálogo</p>
        <h1 class="display-5 fw-bold mb-3">Organiza las categorías de Miskila.</h1>
        <p class="lead mb-4">
          Agrupa los postres para que tus clientes puedan encontrar lo que buscan.
        </p>
        <a class="btn btn-primary px-4" href="#categorias">Administrar categorías</a>
      </div>
    </section>

    <section id="categorias" class="container pb-5">
      <div class="alert alert-info" role="note">
        Esta pantalla es provisional para desarrollo; todavía no cuenta con inicio de sesión.
      </div>
      <div v-if="error" class="alert alert-danger" role="alert">{{ error }}</div>
      <div v-if="mensaje" class="alert alert-success" role="status">{{ mensaje }}</div>

      <div class="row g-4">
        <div class="col-lg-4">
          <form class="card border-0 shadow-sm" @submit.prevent="crearCategoria">
            <div class="card-body p-4">
              <h2 class="h4 fw-bold mb-3">Nueva categoría</h2>

              <div class="mb-3">
                <label for="nombre-categoria" class="form-label">Nombre</label>
                <input
                  id="nombre-categoria"
                  v-model="nombre"
                  class="form-control"
                  type="text"
                  maxlength="80"
                  placeholder="Ej. Masitas"
                  required
                />
              </div>

              <div class="mb-3">
                <label for="orden-categoria" class="form-label">Orden de presentación</label>
                <input
                  id="orden-categoria"
                  v-model.number="orden"
                  class="form-control"
                  type="number"
                  min="0"
                  step="1"
                  required
                />
              </div>

              <button class="btn btn-primary w-100" type="submit" :disabled="guardando">
                {{ guardando ? 'Guardando...' : 'Crear categoría' }}
              </button>
            </div>
          </form>
        </div>

        <div class="col-lg-8">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <div>
              <h2 class="h4 fw-bold mb-1">Categorías registradas</h2>
              <p class="text-secondary mb-0">Organiza aquí los grupos de productos.</p>
            </div>
            <button
              class="btn btn-outline-secondary btn-sm"
              type="button"
              :disabled="cargando"
              @click="cargarCategorias"
            >
              Actualizar
            </button>
          </div>

          <p v-if="cargando" class="text-secondary" role="status">Cargando categorías...</p>
          <div v-else-if="error && categorias.length === 0" class="alert alert-warning" role="alert">
            {{ error }}
          </div>
          <div v-else-if="categorias.length === 0" class="alert alert-light border" role="status">
            Todavía no hay categorías. Crea la primera con el formulario.
          </div>
          <div v-else class="list-group shadow-sm">
            <article
              v-for="categoria in categorias"
              :key="categoria.id"
              class="list-group-item p-3"
            >
              <form
                v-if="categoriaEditandoId === categoria.id"
                class="row g-2 align-items-end"
                @submit.prevent="actualizarCategoria(categoria.id)"
              >
                <div class="col-md-5">
                  <label :for="`nombre-edicion-${categoria.id}`" class="form-label">Nombre</label>
                  <input
                    :id="`nombre-edicion-${categoria.id}`"
                    v-model="nombreEdicion"
                    class="form-control"
                    type="text"
                    maxlength="80"
                    required
                  />
                </div>
                <div class="col-md-3">
                  <label :for="`orden-edicion-${categoria.id}`" class="form-label">Orden</label>
                  <input
                    :id="`orden-edicion-${categoria.id}`"
                    v-model.number="ordenEdicion"
                    class="form-control"
                    type="number"
                    min="0"
                    step="1"
                    required
                  />
                </div>
                <div class="col-md-4 d-flex gap-2">
                  <button
                    class="btn btn-primary btn-sm"
                    type="submit"
                    :disabled="operacionId === categoria.id"
                  >
                    Guardar
                  </button>
                  <button
                    class="btn btn-outline-secondary btn-sm"
                    type="button"
                    :disabled="operacionId === categoria.id"
                    @click="cancelarEdicion"
                  >
                    Cancelar
                  </button>
                </div>
              </form>

              <div v-else class="d-flex flex-wrap justify-content-between align-items-center gap-3">
                <div>
                  <h3 class="h6 fw-semibold mb-1">{{ categoria.nombre }}</h3>
                  <span class="text-secondary small">Orden: {{ categoria.orden }}</span>
                </div>
                <div class="d-flex align-items-center gap-2">
                  <span
                    class="badge rounded-pill"
                    :class="categoria.activa ? 'text-bg-success' : 'text-bg-secondary'"
                  >
                    {{ categoria.activa ? 'Activa' : 'Inactiva' }}
                  </span>
                  <button
                    class="btn btn-outline-primary btn-sm"
                    type="button"
                    :disabled="operacionId !== null || !categoria.activa"
                    @click="comenzarEdicion(categoria)"
                  >
                    Editar
                  </button>
                  <button
                    class="btn btn-outline-secondary btn-sm"
                    type="button"
                    :disabled="operacionId !== null"
                    @click="cambiarEstadoCategoria(categoria)"
                  >
                    {{ categoria.activa ? 'Desactivar' : 'Reactivar' }}
                  </button>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>

    <ProductosAdmin />
  </main>

  <footer class="border-top bg-white py-3">
    <p class="container text-secondary small mb-0">Miskila · Pedidos en Sucre, Bolivia</p>
  </footer>
</template>
