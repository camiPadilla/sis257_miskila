import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module.js';
import { CapacidadModule } from '../capacidad/capacidad.module.js';
import { PedidoModelo } from '../database/entities/pedido.entity.js';
import { ReembolsoModelo } from '../database/entities/reembolso.entity.js';
import { ReembolsosController } from './reembolsos.controller.js';
import { ReembolsosService } from './reembolsos.service.js';

@Module({ imports: [AuthModule, CapacidadModule, TypeOrmModule.forFeature([PedidoModelo, ReembolsoModelo])], controllers: [ReembolsosController], providers: [ReembolsosService], exports: [ReembolsosService] })
export class ReembolsosModule {}
