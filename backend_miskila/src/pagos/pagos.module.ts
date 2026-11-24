import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module.js';
import { CapacidadModule } from '../capacidad/capacidad.module.js';
import { PagoModelo } from '../database/entities/pago.entity.js';
import { PedidoModelo } from '../database/entities/pedido.entity.js';
import { SancionModelo } from '../database/entities/sancion.entity.js';
import { UsuarioModelo } from '../database/entities/usuario.entity.js';
import { PagosController } from './pagos.controller.js';
import { PagosService } from './pagos.service.js';

@Module({ imports: [AuthModule, CapacidadModule, TypeOrmModule.forFeature([PagoModelo, PedidoModelo, SancionModelo, UsuarioModelo])], controllers: [PagosController], providers: [PagosService] })
export class PagosModule {}
