export type RolUsuario = 'cliente' | 'empleado' | 'administrador'
export type EstadoUsuario = 'activo' | 'suspendido' | 'baneado'

export interface Usuario {
  idUsuario: number
  celular: string
  nombreCompleto: string | null
  rol: RolUsuario
  estado: EstadoUsuario
}

export interface AuthResponse {
  accessToken: string
  usuario: Usuario
}
