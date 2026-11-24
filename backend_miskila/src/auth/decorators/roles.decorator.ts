import { SetMetadata } from '@nestjs/common';
import { RolUsuario } from '../../database/entities/usuario.entity.js';
export const ROLES = 'roles';
export const Roles = (...roles: RolUsuario[]) => SetMetadata(ROLES, roles);
