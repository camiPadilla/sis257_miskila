import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { UsuarioModelo } from '../database/entities/usuario.entity.js';
import { UsuariosService } from './usuarios.service.js';
import { UsuariosAdminService } from './usuarios-admin.service.js';
import { UsuariosController } from './usuarios.controller.js';
import { PedidoModelo } from '../database/entities/pedido.entity.js';
import { SancionModelo } from '../database/entities/sancion.entity.js';

@Module({ imports: [ConfigModule, JwtModule.registerAsync({ imports: [ConfigModule], inject: [ConfigService], useFactory: (config: ConfigService) => ({ secret: config.getOrThrow<string>('JWT_SECRET') }) }), TypeOrmModule.forFeature([UsuarioModelo, PedidoModelo, SancionModelo])], controllers: [UsuariosController], providers: [UsuariosService, UsuariosAdminService, JwtAuthGuard, RolesGuard], exports: [UsuariosService] })
export class UsuariosModule {}
