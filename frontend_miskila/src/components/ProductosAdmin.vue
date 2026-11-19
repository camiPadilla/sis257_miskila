<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import axios from 'axios'
import api from '../services/api'

interface Categoria {
  id: number
  nombre: string
  activa: boolean
}

interface Producto {
  id: number
  nombre: string
  descripcion: string | null
  categoria: Categoria
  precioBs: string
  puntos: number
  disponible: boolean
  esPersonalizada: boolean
}

const categorias = ref<Categoria[]>([])
const productos = ref<Producto[]>([])
const cargando = ref(true)
const guardando = ref(false)
const error = ref('')
const mensaje = ref('')

const formulario = reactive({
  categoriaId: null as number | null,
  nombre: '',
  descripcion: '',
  foto: '',
  precioBs: 0,
  puntos: 1,
  disponible: true,
  esPersonalizada: false,
  orden: 0,
})

async function cargarDatos() {
  cargando.value = true
  error.value = ''

  try {
    const [respuestaCategorias, respuestaProductos] = await Promise.all([
      api.get<Categoria[]>('/categorias'),
      api.get<Producto[]>('/productos'),
    ])
    categorias.value = respuestaCategorias.data.filter((categoria) => categoria.activa)
    productos.value = respuestaProductos.data
  } catch (cause) {
    console.error('No se pudieron cargar los datos de productos.', cause)
    error.value = 'No pudimos cargar productos y categorías. Inténtalo nuevamente.'
  } finally {
    cargando.value = false
  }
}

async function crearProducto() {
  guardando.value = true
  error.value = ''
  mensaje.value = ''

  try {
    await api.post('/productos', {
      ...formulario,
      nombre: formulario.nombre.trim(),
      descripcion: formulario.descripcion.trim() || null,
      foto: formulario.foto.trim() || null,
    })
    formulario.nombre = ''
    formulario.descripcion = ''
    formulario.foto = ''
    formulario.precioBs = 0
    formulario.puntos = 1
    mensaje.value = 'El producto se creó correctamente.'
    await cargarDatos()
  } catch (cause) {
    console.error('No se pudo crear el producto.', cause)
    error.value =
      axios.isAxiosError(cause) && cause.response?.status === 404
        ? 'La categoría seleccionada ya no está disponible. Actualiza la lista.'
        : 'No se pudo guardar el producto. Verifica los datos e inténtalo nuevamente.'
  } finally {
    guardando.value = false
  }
}

onMounted(cargarDatos)
</script>

<template>
  <section id="productos" class="container pb-5">
    <div class="mb-4">
      <h2 class="h3 fw-bold">Productos</h2>
      <p class="text-secondary mb-0">
        Registra postres y asígnalos a una categoría activa. Si acabas de crear una categoría,
        actualiza las listas para usarla.
      </p>
    </div>

    <div v-if="error" class="alert alert-danger" role="alert">{{ error }}</div>
    <div v-if="mensaje" class="alert alert-success" role="status">{{ mensaje }}</div>

    <div class="row g-4">
      <div class="col-lg-5">
        <form class="card border-0 shadow-sm" @submit.prevent="crearProducto">
          <div class="card-body p-4">
            <h3 class="h4 fw-bold mb-3">Nuevo producto</h3>

            <div class="mb-3">
              <label for="categoria-producto" class="form-label">Categoría</label>
              <select
                id="categoria-producto"
                v-model.number="formulario.categoriaId"
                class="form-select"
                required
                :disabled="cargando || categorias.length === 0"
              >
                <option :value="null" disabled>
                  {{ categorias.length === 0 ? 'Primero crea una categoría' : 'Selecciona una categoría' }}
                </option>
                <option v-for="categoria in categorias" :key="categoria.id" :value="categoria.id">
                  {{ categoria.nombre }}
                </option>
              </select>
            </div>

            <div class="mb-3">
              <label for="nombre-producto" class="form-label">Nombre</label>
              <input
                id="nombre-producto"
                v-model="formulario.nombre"
                class="form-control"
                type="text"
                maxlength="120"
                placeholder="Ej. Torta de chocolate"
                required
              />
            </div>

            <div class="mb-3">
              <label for="descripcion-producto" class="form-label">Descripción</label>
              <textarea
                id="descripcion-producto"
                v-model="formulario.descripcion"
                class="form-control"
                rows="2"
                maxlength="5000"
              ></textarea>
            </div>

            <div class="mb-3">
              <label for="foto-producto" class="form-label">Enlace de la foto (opcional)</label>
              <input
                id="foto-producto"
                v-model="formulario.foto"
                class="form-control"
                type="text"
                maxlength="500"
              />
            </div>

            <div class="row">
              <div class="col-sm-6 mb-3">
                <label for="precio-producto" class="form-label">Precio (Bs)</label>
                <input
                  id="precio-producto"
                  v-model.number="formulario.precioBs"
                  class="form-control"
                  type="number"
                  min="0.01"
                  max="99999999.99"
                  step="0.01"
                  required
                />
              </div>
              <div class="col-sm-6 mb-3">
                <label for="puntos-producto" class="form-label">Puntos</label>
                <input
                  id="puntos-producto"
                  v-model.number="formulario.puntos"
                  class="form-control"
                  type="number"
                  min="1"
                  step="1"
                  required
                />
              </div>
            </div>

            <div class="form-check mb-3">
              <input
                id="producto-personalizado"
                v-model="formulario.esPersonalizada"
                class="form-check-input"
                type="checkbox"
              />
              <label class="form-check-label" for="producto-personalizado">
                Se cotiza como producto personalizado
              </label>
            </div>

            <button
              class="btn btn-primary w-100"
              type="submit"
              :disabled="guardando || cargando || categorias.length === 0"
            >
              {{ guardando ? 'Guardando...' : 'Crear producto' }}
            </button>
          </div>
        </form>
      </div>

      <div class="col-lg-7">
        <div class="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h3 class="h4 fw-bold mb-1">Productos registrados</h3>
            <p class="text-secondary mb-0">Precios y puntos por unidad.</p>
          </div>
          <button
            class="btn btn-outline-secondary btn-sm"
            type="button"
            :disabled="cargando"
            @click="cargarDatos"
          >
            Actualizar listas
          </button>
        </div>

        <p v-if="cargando" class="text-secondary" role="status">Cargando productos...</p>
        <div v-else-if="productos.length === 0" class="alert alert-light border" role="status">
          Todavía no hay productos registrados.
        </div>
        <div v-else class="list-group shadow-sm">
          <article
            v-for="producto in productos"
            :key="producto.id"
            class="list-group-item p-3"
          >
            <div class="d-flex justify-content-between gap-3">
              <div>
                <h4 class="h6 fw-semibold mb-1">{{ producto.nombre }}</h4>
                <p class="small text-secondary mb-1">
                  {{ producto.categoria.nombre }} · {{ producto.puntos }} puntos
                </p>
                <p v-if="producto.descripcion" class="small mb-0">
                  {{ producto.descripcion }}
                </p>
              </div>
              <div class="text-end">
                <span class="fw-semibold">Bs {{ Number(producto.precioBs).toFixed(2) }}</span>
                <div>
                  <span
                    class="badge mt-1"
                    :class="producto.disponible ? 'text-bg-success' : 'text-bg-secondary'"
                  >
                    {{ producto.disponible ? 'Disponible' : 'Pausado' }}
                  </span>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>
