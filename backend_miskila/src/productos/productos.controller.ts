import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { AuthPublic } from '../auth/decorators/auth-public.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { RolUsuario } from '../database/entities/usuario.entity.js';
import { ProductosService } from './productos.service.js';

class ProductoDto { @IsString() @MaxLength(100) nombre!: string; @IsOptional() @IsString() @MaxLength(255) descripcion?: string; @IsString() @MaxLength(50) categoria!: string; @IsOptional() @IsString() @MaxLength(255) imagen?: string; @IsOptional() @IsBoolean() pausado?: boolean; }
class PresentacionDto { @IsString() @MaxLength(50) nombre!: string; @IsOptional() @IsInt() @Min(1) cantidadPersonas?: number; @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) precio?: number | null; @IsInt() @Min(0) puntos!: number; @IsOptional() @IsBoolean() activa?: boolean; }

@Controller('productos')
export class ProductosController {
  constructor(private readonly service: ProductosService) {}
  @Get() @AuthPublic() list(@Query('categoria') categoria?: string) { return this.service.list(categoria); }
  @Get(':id') @AuthPublic() one(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }
  @Get(':id/presentaciones') @AuthPublic() presentations(@Param('id', ParseIntPipe) id: number) { return this.service.listPresentaciones(id); }
  @Post() @UseGuards(JwtAuthGuard, RolesGuard) @Roles(RolUsuario.ADMINISTRADOR) create(@Body() body: ProductoDto) { return this.service.create(body); }
  @Patch(':id') @UseGuards(JwtAuthGuard, RolesGuard) @Roles(RolUsuario.ADMINISTRADOR) update(@Param('id', ParseIntPipe) id: number, @Body() body: Partial<ProductoDto>) { return this.service.update(id, body); }
  @Patch(':id/pausar') @UseGuards(JwtAuthGuard, RolesGuard) @Roles(RolUsuario.ADMINISTRADOR) pause(@Param('id', ParseIntPipe) id: number) { return this.service.update(id, { pausado: true }); }
  @Patch(':id/reactivar') @UseGuards(JwtAuthGuard, RolesGuard) @Roles(RolUsuario.ADMINISTRADOR) activate(@Param('id', ParseIntPipe) id: number) { return this.service.update(id, { pausado: false }); }
  @Post(':id/presentaciones') @UseGuards(JwtAuthGuard, RolesGuard) @Roles(RolUsuario.ADMINISTRADOR) createPresentation(@Param('id', ParseIntPipe) id: number, @Body() body: PresentacionDto) { return this.service.createPresentacion(id, Object.assign({}, body, { precio: body.precio == null ? body.precio : body.precio.toFixed(2) })); }
  @Patch('/presentaciones/:id') @UseGuards(JwtAuthGuard, RolesGuard) @Roles(RolUsuario.ADMINISTRADOR) updatePresentation(@Param('id', ParseIntPipe) id: number, @Body() body: Partial<PresentacionDto>) { return this.service.updatePresentacion(id, Object.assign({}, body, { precio: body.precio == null ? body.precio : body.precio.toFixed(2) })); }
}
