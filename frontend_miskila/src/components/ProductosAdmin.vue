<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
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
  foto: string | null
  categoria: Categoria
  precioBs: string
  puntos: number
  disponible: boolean
  esPersonalizada: boolean
  orden: number
}

const categorias = ref<Categoria[]>([])
const productos = ref<Producto[]>([])
const cargando = ref(true)
const guardando = ref(false)
const productoEditandoId = ref<number | null>(null)
const categoriaOriginalId = ref<number | null>(null)
const operacionProductoId = ref<number | null>(null)
const error = ref('')
const mensaje = ref('')

const formulario = reactive({
  categoriaId: null as number | null,
  nombre: '',
  descripcion: '',
  foto: '',
  precioBs: 0,
  puntos: 1,
  esPersonalizada: false,
  orden: 0,
})

const categoriasParaFormulario = computed(() => {
  const activas = categorias.value.filter((categoria) => categoria.activa)
  const categoriaActual = categorias.value.find(
    (categoria) => categoria.id === formulario.categoriaId,
  )

  if (categoriaActual && !categoriaActual.activa) {
    return [...activas, categoriaActual]
  }
  return activas
})

async function cargarDatos() {
  cargando.value = true
  error.value = ''

  try {
    const [respuestaCategorias, respuestaProductos] = await Promise.all([
      api.get<Categoria[]>('/categorias'),
      api.get<Producto[]>('/productos'),
    ])
    categorias.value = respuestaCategorias.data
    productos.value = respuestaProductos.data
  } catch (cause) {
    console.error('No se pudieron cargar los datos de productos.', cause)
    error.value = 'No pudimos cargar productos y categorías. Inténtalo nuevamente.'
  } finally {
    cargando.value = false
  }
}

function limpiarFormulario() {
  productoEditandoId.value = null
  categoriaOriginalId.value = null
  formulario.categoriaId = null
  formulario.nombre = ''
  formulario.descripcion = ''
  formulario.foto = ''
  formulario.precioBs = 0
  formulario.puntos = 1
  formulario.esPersonalizada = false
  formulario.orden = 0
}

function comenzarEdicion(producto: Producto) {
  productoEditandoId.value = producto.id
  categoriaOriginalId.value = producto.categoria.id
  formulario.categoriaId = producto.categoria.id
  formulario.nombre = producto.nombre
  formulario.descripcion = producto.descripcion ?? ''
  formulario.foto = producto.foto ?? ''
  formulario.precioBs = Number(producto.precioBs)
  formulario.puntos = producto.puntos
  formulario.esPersonalizada = producto.esPersonalizada
  formulario.orden = producto.orden
  error.value = ''
  mensaje.value = ''
}

async function guardarProducto() {
  if (formulario.categoriaId === null) {
    error.value = 'Selecciona una categoría activa.'
    return
  }

  guardando.value = true
  error.value = ''
  mensaje.value = ''

  const productoId = productoEditandoId.value
  const campos = {
    nombre: formulario.nombre.trim(),
    descripcion: formulario.descripcion.trim() || null,
    foto: formulario.foto.trim() || null,
    precioBs: formulario.precioBs,
    puntos: formulario.puntos,
    esPersonalizada: formulario.esPersonalizada,
    orden: formulario.orden,
  }

  try {
    if (productoId === null) {
      await api.post('/productos', {
        ...campos,
        categoriaId: formulario.categoriaId,
        disponible: true,
      })
      mensaje.value = 'El producto se creó correctamente.'
    } else {
      const datosActualizacion =
        formulario.categoriaId === categoriaOriginalId.value
          ? campos
          : { ...campos, categoriaId: formulario.categoriaId }
      await api.patch(`/productos/${productoId}`, datosActualizacion)
      mensaje.value = 'El producto se actualizó correctamente.'
    }

    limpiarFormulario()
    await cargarDatos()
  } catch (cause) {
    console.error('No se pudo guardar el producto.', cause)
    error.value =
      axios.isAxiosError(cause) &&
      [400, 404].includes(cause.response?.status ?? 0)
        ? 'La categoría seleccionada ya no está disponible. Actualiza la lista.'
        : 'No se pudo guardar el producto. Verifica los datos e inténtalo nuevamente.'
  } finally {
    guardando.value = false
  }
}

async function cambiarDisponibilidad(producto: Producto) {
  if (
    producto.disponible &&
    !window.confirm(
      `¿Eliminar "${producto.nombre}" del catálogo? Se conservará su registro para el historial.`,
    )
  ) {
    return
  }

  operacionProductoId.value = producto.id
  error.value = ''
  mensaje.value = ''

  try {
    if (producto.disponible) {
      await api.delete(`/productos/${producto.id}`)
      mensaje.value = 'El producto se retiró del catálogo; su registro se conservó.'
    } else {
      await api.patch(`/productos/${producto.id}`, { disponible: true })
      mensaje.value = 'El producto volvió a estar disponible.'
    }
    await cargarDatos()
  } catch (cause) {
    console.error('No se pudo cambiar la disponibilidad del producto.', cause)
    error.value = 'No se pudo cambiar el estado del producto. Inténtalo nuevamente.'
  } finally {
    operacionProductoId.value = null
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
        <form class="card border-0 shadow-sm" @submit.prevent="guardarProducto">
          <div class="card-body p-4">
            <h3 class="h4 fw-bold mb-3">
              {{ productoEditandoId === null ? 'Nuevo producto' : 'Editar producto' }}
            </h3>

            <div class="mb-3">
              <label for="categoria-producto" class="form-label">Categoría</label>
              <select
                id="categoria-producto"
                v-model.number="formulario.categoriaId"
                class="form-select"
                required
                :disabled="cargando || categoriasParaFormulario.length === 0"
              >
                <option :value="null" disabled>
                  {{
                    categoriasParaFormulario.length === 0
                      ? 'Primero crea una categoría'
                      : 'Selecciona una categoría'
                  }}
                </option>
                <option
                  v-for="categoria in categoriasParaFormulario"
                  :key="categoria.id"
                  :value="categoria.id"
                >
                  {{ categoria.nombre }}{{ categoria.activa ? '' : ' (inactiva)' }}
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
              :disabled="guardando || cargando || categoriasParaFormulario.length === 0"
            >
              {{
                guardando
                  ? 'Guardando...'
                  : productoEditandoId === null
                    ? 'Crear producto'
                    : 'Guardar cambios'
              }}
            </button>
            <button
              v-if="productoEditandoId !== null"
              class="btn btn-outline-secondary w-100 mt-2"
              type="button"
              :disabled="guardando"
              @click="limpiarFormulario"
            >
              Cancelar edición
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
                <span v-if="producto.esPersonalizada" class="badge text-bg-info mt-2">
                  Personalizado
                </span>
              </div>
              <div class="text-end">
                <span class="fw-semibold">Bs {{ Number(producto.precioBs).toFixed(2) }}</span>
                <div>
                  <span
                    class="badge mt-1"
                    :class="producto.disponible ? 'text-bg-success' : 'text-bg-secondary'"
                  >
                    {{ producto.disponible ? 'Disponible' : 'Retirado' }}
                  </span>
                  <div class="d-flex justify-content-end gap-2 mt-2">
                    <button
                      class="btn btn-outline-primary btn-sm"
                      type="button"
                      :disabled="operacionProductoId !== null"
                      @click="comenzarEdicion(producto)"
                    >
                      Editar
                    </button>
                    <button
                      class="btn btn-outline-secondary btn-sm"
                      type="button"
                      :disabled="operacionProductoId !== null"
                      @click="cambiarDisponibilidad(producto)"
                    >
                      {{ producto.disponible ? 'Eliminar' : 'Restaurar' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>
