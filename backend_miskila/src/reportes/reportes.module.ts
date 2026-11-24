import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module.js';
import { PedidoModelo } from '../database/entities/pedido.entity.js';
import { ReembolsoModelo } from '../database/entities/reembolso.entity.js';
import { ReportesController } from './reportes.controller.js';
import { ReportesService } from './reportes.service.js';

@Module({ imports: [AuthModule, TypeOrmModule.forFeature([PedidoModelo, ReembolsoModelo])], controllers: [ReportesController], providers: [ReportesService] })
export class ReportesModule {}
