import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { RolUsuario } from '../database/entities/usuario.entity.js';
import { CreatePedidoDto, CreatePedidoPersonalizadoDto } from './dto/create-pedido.dto.js';
import { PedidosService } from './pedidos.service.js';

@Controller('pedidos')
@UseGuards(JwtAuthGuard)
export class PedidosController {
  constructor(private readonly pedidos: PedidosService) {}

  @Post()
  @Roles(RolUsuario.CLIENTE)
  create(@Req() request: { user: { sub: number } }, @Body() body: CreatePedidoDto) { return this.pedidos.create(request.user.sub, body); }

  @Get('mis')
  mine(@Req() request: { user: { sub: number } }) { return this.pedidos.mine(request.user.sub); }

  @Get('mis/:id')
  mineOne(@Req() request: { user: { sub: number } }, @Param('id', ParseIntPipe) id: number) { return this.pedidos.mineOne(request.user.sub, id); }

  @Post(':id/cancelar')
  @Roles(RolUsuario.CLIENTE)
  cancel(@Req() request: { user: { sub: number } }, @Param('id', ParseIntPipe) id: number) { return this.pedidos.cancel(request.user.sub, id); }

  @Post(':id/reembolso')
  @Roles(RolUsuario.CLIENTE)
  refund(@Req() request: { user: { sub: number } }, @Param('id', ParseIntPipe) id: number) { return this.pedidos.requestRefund(request.user.sub, id); }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.EMPLEADO, RolUsuario.ADMINISTRADOR)
  list(@Query('fechaEntrega') fechaEntrega?: string, @Query('estado') estado?: string) { return this.pedidos.list(fechaEntrega, estado); }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.EMPLEADO, RolUsuario.ADMINISTRADOR)
  one(@Param('id', ParseIntPipe) id: number) { return this.pedidos.one(id); }

  @Post('personalizado')
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.EMPLEADO, RolUsuario.ADMINISTRADOR)
  personalized(@Req() request: { user: { sub: number } }, @Body() body: CreatePedidoPersonalizadoDto) { return this.pedidos.createPersonalized(request.user.sub, body); }

  @Patch(':id/listo')
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.EMPLEADO, RolUsuario.ADMINISTRADOR)
  ready(@Param('id', ParseIntPipe) id: number) { return this.pedidos.markReady(id); }

  @Patch(':id/entregado')
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.EMPLEADO, RolUsuario.ADMINISTRADOR)
  delivered(@Param('id', ParseIntPipe) id: number) { return this.pedidos.markDelivered(id); }
}
