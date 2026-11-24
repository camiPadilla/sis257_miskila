import { Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { RolUsuario } from '../database/entities/usuario.entity.js';
import { ReembolsosService } from './reembolsos.service.js';

@Controller('reembolsos')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.ADMINISTRADOR)
export class ReembolsosController {
  constructor(private readonly reembolsos: ReembolsosService) {}
  @Get() list() { return this.reembolsos.list(); }
  @Post(':id/realizar') realize(@Req() request: { user: { sub: number } }, @Param('id', ParseIntPipe) id: number) { return this.reembolsos.realize(id, request.user.sub); }
}
