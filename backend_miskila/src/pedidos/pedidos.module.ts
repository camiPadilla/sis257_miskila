import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module.js';
import { CapacidadModule } from '../capacidad/capacidad.module.js';
import { DetallePedidoModelo } from '../database/entities/detalle-pedido.entity.js';
import { PagoModelo } from '../database/entities/pago.entity.js';
import { PedidoModelo } from '../database/entities/pedido.entity.js';
import { PresentacionModelo } from '../database/entities/presentacion.entity.js';
import { UsuarioModelo } from '../database/entities/usuario.entity.js';
import { PedidosController } from './pedidos.controller.js';
import { PedidosService } from './pedidos.service.js';
import { ReembolsosModule } from '../reembolsos/reembolsos.module.js';

@Module({
  imports: [AuthModule, CapacidadModule, ReembolsosModule, TypeOrmModule.forFeature([PedidoModelo, DetallePedidoModelo, PagoModelo, PresentacionModelo, UsuarioModelo])],
  controllers: [PedidosController],
  providers: [PedidosService],
  exports: [PedidosService],
})
export class PedidosModule {}
