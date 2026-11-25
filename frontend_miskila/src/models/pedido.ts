export type EstadoPedido = 'pendiente_pago' | 'pagado' | 'no_pagado' | 'cancelado' | 'reembolso_solicitado' | 'reembolsado' | 'entregado'

export interface DetallePedido {
  idDetalle: number
  nombrePresentacion?: string
  cantidadPersonas?: number | null
  cantidad: number
  precioUnitario: string
  subtotal: string
  descripcionPersonalizada?: string | null
}

export interface PedidoCliente {
  idPedido: number
  fechaCompra: string
  fechaEntrega: string
  horaEntrega: string
  modalidad: 'domicilio' | 'retiro'
  direccionEntrega: string | null
  costoDomicilio: string
  total: string
  estado: EstadoPedido
  detalles?: DetallePedido[]
  mensajeTiempo: string
  reembolso?: { estado: 'solicitado' | 'realizado'; monto: string; fechaSolicitud: string; fechaRealizado: string | null } | null
}
