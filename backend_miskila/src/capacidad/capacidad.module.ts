import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module.js';
import { CapacidadDiaModelo } from '../database/entities/capacidad-dia.entity.js';
import { CapacidadController } from './capacidad.controller.js';
import { CapacidadService } from './capacidad.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([CapacidadDiaModelo]), AuthModule],
  controllers: [CapacidadController],
  providers: [CapacidadService],
  exports: [CapacidadService],
})
export class CapacidadModule {}
