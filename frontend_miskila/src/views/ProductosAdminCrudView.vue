<script setup lang="ts">
import { onMounted, ref } from 'vue'
import axios from 'axios'
import api from '../plugins/axios'

const productos = ref<any[]>([])
const productoSeleccionado = ref<any | null>(null)
const presentaciones = ref<any[]>([])
const error = ref('')
const mensaje = ref('')
const editando = ref<number | null>(null)
const formulario = ref({ nombre: '', cantidadPersonas: '', precio: '', puntos: '0', activa: true })

function mostrarError(exception: unknown) { return axios.isAxiosError(exception) ? exception.response?.data?.message ?? 'No se pudo completar la operación.' : 'No se pudo completar la operación.' }
async function cargarProductos() { try { productos.value = (await api.get('/productos')).data } catch (exception) { error.value = mostrarError(exception) } }
async function seleccionar(producto: any) { productoSeleccionado.value = producto; try { presentaciones.value = (await api.get(`/productos/${producto.idProducto}/presentaciones`)).data } catch (exception) { error.value = mostrarError(exception) } }
function nuevaPresentacion() { editando.value = null; formulario.value = { nombre: '', cantidadPersonas: '', precio: '', puntos: '0', activa: true } }
function editar(item: any) { editando.value = item.idPresentacion; formulario.value = { nombre: item.nombre, cantidadPersonas: item.cantidadPersonas?.toString() ?? '', precio: item.precio ?? '', puntos: String(item.puntos), activa: item.activa } }
async function guardar() {
  if (!productoSeleccionado.value) return
  const body = { nombre: formulario.value.nombre, cantidadPersonas: formulario.value.cantidadPersonas ? Number(formulario.value.cantidadPersonas) : undefined, precio: formulario.value.precio === '' ? null : Number(formulario.value.precio), puntos: Number(formulario.value.puntos), activa: formulario.value.activa }
  try { if (editando.value) await api.patch(`/productos/presentaciones/${editando.value}`, body); else await api.post(`/productos/${productoSeleccionado.value.idProducto}/presentaciones`, body); mensaje.value = 'Presentación guardada.'; await seleccionar(productoSeleccionado.value); nuevaPresentacion() } catch (exception) { error.value = mostrarError(exception) }
}
async function cambiarEstado(item: any) { try { await api.patch(`/productos/presentaciones/${item.idPresentacion}`, { activa: !item.activa }); await seleccionar(productoSeleccionado.value) } catch (exception) { error.value = mostrarError(exception) } }
onMounted(cargarProductos)
</script>

<template>
  <section class="container py-5"><h1 class="h2 fw-bold mb-4">Productos y presentaciones</h1><div v-if="error" class="alert alert-danger">{{ error }}</div><div v-if="mensaje" class="alert alert-success">{{ mensaje }}</div>
    <div class="row g-4"><div class="col-12 col-lg-4"><div class="list-group shadow-sm"><button v-for="producto in productos" :key="producto.idProducto" class="list-group-item list-group-item-action d-flex justify-content-between" :class="{ active: productoSeleccionado?.idProducto === producto.idProducto }" type="button" @click="seleccionar(producto)"><span>{{ producto.nombre }}</span><span class="badge text-bg-light">{{ producto.categoria }}</span></button></div></div>
      <div class="col-12 col-lg-8"><div v-if="!productoSeleccionado" class="alert alert-info">Selecciona un producto para administrar sus presentaciones.</div><template v-else><div class="d-flex justify-content-between align-items-center mb-3"><div><h2 class="h4 mb-1">{{ productoSeleccionado.nombre }}</h2><span class="text-secondary">Presentaciones disponibles</span></div><button class="btn btn-primary" type="button" @click="nuevaPresentacion">Nueva presentación</button></div><div class="table-responsive mb-4"><table class="table align-middle"><thead><tr><th>Nombre</th><th>Personas</th><th>Precio</th><th>Puntos</th><th>Estado</th><th></th></tr></thead><tbody><tr v-for="item in presentaciones" :key="item.idPresentacion"><td>{{ item.nombre }}</td><td>{{ item.cantidadPersonas || '—' }}</td><td>{{ item.precio === null ? 'A coordinar' : `${Number(item.precio).toFixed(2)} Bs` }}</td><td>{{ item.puntos }}</td><td>{{ item.activa ? 'Activa' : 'Inactiva' }}</td><td class="text-nowrap"><button class="btn btn-sm btn-outline-primary me-1" type="button" @click="editar(item)">Editar</button><button class="btn btn-sm btn-outline-secondary" type="button" @click="cambiarEstado(item)">{{ item.activa ? 'Desactivar' : 'Activar' }}</button></td></tr></tbody></table></div><div class="card border-0 shadow-sm"><div class="card-body"><h3 class="h5">{{ editando ? 'Editar presentación' : 'Nueva presentación' }}</h3><div class="row g-2"><div class="col-md-6"><label class="form-label">Nombre</label><input v-model="formulario.nombre" class="form-control" /></div><div class="col-md-6"><label class="form-label">Cantidad de personas</label><input v-model="formulario.cantidadPersonas" class="form-control" type="number" min="1" /></div><div class="col-md-4"><label class="form-label">Precio</label><input v-model="formulario.precio" class="form-control" type="number" min="0" step="0.01" placeholder="Vacío si se coordina" /></div><div class="col-md-4"><label class="form-label">Puntos</label><input v-model="formulario.puntos" class="form-control" type="number" min="0" /></div><div class="col-md-4 d-flex align-items-end"><div class="form-check"><input id="activa" v-model="formulario.activa" class="form-check-input" type="checkbox" /><label class="form-check-label" for="activa">Activa</label></div></div></div><button class="btn btn-primary mt-3" type="button" @click="guardar">Guardar presentación</button></div></div></template></div>
    </div>
  </section>
</template>
