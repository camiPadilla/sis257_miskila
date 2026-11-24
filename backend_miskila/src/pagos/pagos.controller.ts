import { Body, Controller, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { RolUsuario } from '../database/entities/usuario.entity.js';
import { PagosService } from './pagos.service.js';

class VerificarPagoDto { @IsOptional() @IsBoolean() comprobanteRecibido?: boolean; @IsOptional() @IsString() observacion?: string; }

@Controller('pedidos')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.ADMINISTRADOR)
export class PagosController {
  constructor(private readonly pagos: PagosService) {}
  @Post(':id/pago/verificar') verify(@Req() request: { user: { sub: number } }, @Param('id', ParseIntPipe) id: number, @Body() body: VerificarPagoDto) { return this.pagos.verify(id, request.user.sub, body); }
  @Post(':id/pago/no-llego') noPayment(@Req() request: { user: { sub: number } }, @Param('id', ParseIntPipe) id: number) { return this.pagos.noPayment(id, request.user.sub); }
  @Post(':id/reactivar') reactivate(@Req() request: { user: { sub: number } }, @Param('id', ParseIntPipe) id: number) { return this.pagos.reactivate(id, request.user.sub); }
}
