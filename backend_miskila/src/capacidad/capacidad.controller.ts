import { Body, Controller, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { RolUsuario } from '../database/entities/usuario.entity.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CapacidadService } from './capacidad.service.js';

@Controller('capacidad')
export class CapacidadController {
  constructor(private readonly capacidad: CapacidadService) {}

  @Get('disponibilidad')
  @UseGuards(JwtAuthGuard)
  availability(@Query('desde') desde: string, @Query('hasta') hasta: string) {
    return this.capacidad.availability(desde, hasta);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  list(@Query('desde') desde: string, @Query('hasta') hasta: string) {
    return this.capacidad.list(desde, hasta);
  }

  @Put(':fecha')
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.ADMINISTRADOR)
  update(@Param('fecha') fecha: string, @Body() body: { puntosLimite: number }) { return this.capacidad.update(fecha, body.puntosLimite); }
}
