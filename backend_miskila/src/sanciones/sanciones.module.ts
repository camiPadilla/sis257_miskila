import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SancionModelo } from '../database/entities/sancion.entity.js';
import { SancionesService } from './sanciones.service.js';

@Module({ imports: [TypeOrmModule.forFeature([SancionModelo])], providers: [SancionesService], exports: [SancionesService] })
export class SancionesModule {}
