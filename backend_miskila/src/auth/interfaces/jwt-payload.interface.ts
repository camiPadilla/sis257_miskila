import { RolUsuario } from '../../usuarios/entities/usuario.entity.js';

export interface JwtPayload {
  sub: number;
  rol: RolUsuario;
}
