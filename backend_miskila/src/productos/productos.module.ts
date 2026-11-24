import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { PresentacionModelo } from '../database/entities/presentacion.entity.js';
import { ProductoModelo } from '../database/entities/producto.entity.js';
import { ProductosController } from './productos.controller.js';
import { ProductosService } from './productos.service.js';

@Module({ imports: [ConfigModule, TypeOrmModule.forFeature([ProductoModelo, PresentacionModelo]), JwtModule.registerAsync({ imports: [ConfigModule], inject: [ConfigService], useFactory: (config: ConfigService) => ({ secret: config.getOrThrow<string>('JWT_SECRET') }) })], controllers: [ProductosController], providers: [ProductosService, RolesGuard, JwtAuthGuard] })
export class ProductosModule {}
