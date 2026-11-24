import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { RolUsuario } from '../database/entities/usuario.entity.js';
import { ReportesService } from './reportes.service.js';

@Controller('reportes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.ADMINISTRADOR)
export class ReportesController {
  constructor(private readonly reportes: ReportesService) {}
  @Get('ventas') sales(@Query('desde') desde: string, @Query('hasta') hasta: string) { return this.reportes.sales(desde, hasta); }
  @Get('ventas/detalle') detail(@Query('desde') desde: string, @Query('hasta') hasta: string, @Query('estado') estado?: string, @Query('idCliente') idCliente?: string) { return this.reportes.detail(desde, hasta, estado, idCliente ? Number(idCliente) : undefined); }
}
