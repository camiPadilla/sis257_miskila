import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SancionModelo } from '../database/entities/sancion.entity.js';

@Injectable()
export class SancionesService {
  constructor(@InjectRepository(SancionModelo) private readonly sanciones: Repository<SancionModelo>) {}
  list() { return this.sanciones.find({ relations: { usuario: true, administrador: true } }); }
}
