import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { IsIn, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { RolUsuario } from '../database/entities/usuario.entity.js';
import { UsuariosAdminService } from './usuarios-admin.service.js';

class CuentaStaffDto { @Matches(/^[67]\d{7}$/) celular!: string; @IsString() contrasena!: string; @IsIn([RolUsuario.EMPLEADO, RolUsuario.ADMINISTRADOR]) rol!: RolUsuario; }
class MotivoDto { @IsString() @MaxLength(200) motivo!: string; @IsOptional() idPedido?: number; }

@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.ADMINISTRADOR)
export class UsuariosController {
  constructor(private readonly service: UsuariosAdminService) {}
  @Get() list(@Query('buscar') buscar?: string, @Query('rol') rol?: RolUsuario) { return this.service.list(buscar, rol); }
  @Get(':id') one(@Param('id', ParseIntPipe) id: number) { return this.service.one(id); }
  @Get(':id/pedidos') orders(@Param('id', ParseIntPipe) id: number) { return this.service.orders(id); }
  @Post() create(@Body() body: CuentaStaffDto) { return this.service.create(body); }
  @Post(':id/suspender') suspend(@Req() req: { user: { sub: number } }, @Param('id', ParseIntPipe) id: number, @Body() body: MotivoDto) { return this.service.suspend(id, body.motivo, req.user.sub); }
  @Post(':id/banear') ban(@Req() req: { user: { sub: number } }, @Param('id', ParseIntPipe) id: number, @Body() body: MotivoDto) { return this.service.ban(id, body.motivo, req.user.sub, body.idPedido); }
  @Post(':id/levantar-suspension') lift(@Param('id', ParseIntPipe) id: number) { return this.service.lift(id); }
}
