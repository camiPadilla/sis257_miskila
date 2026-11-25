export interface Producto {
  idProducto: number
  nombre: string
  descripcion: string | null
  categoria: string
  imagen: string | null
  pausado: boolean
  presentaciones?: Presentacion[]
}

export interface Presentacion {
  idPresentacion: number
  nombre: string
  cantidadPersonas: number | null
  precio: string | null
  puntos?: number
  activa: boolean
}
