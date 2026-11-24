import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CapacidadDiaModelo } from '../database/entities/capacidad-dia.entity.js';
import { NEGOCIO_CONFIG } from '../common/config/negocio.config.js';

@Injectable()
export class CapacidadService {
  constructor(@InjectRepository(CapacidadDiaModelo) private readonly repository: Repository<CapacidadDiaModelo>) {}

  async getOrCreate(fecha: string, manager = this.repository.manager) {
    let capacidad = await manager.findOne(CapacidadDiaModelo, { where: { fecha }, lock: { mode: 'pessimistic_write' } });
    if (!capacidad) {
      capacidad = manager.create(CapacidadDiaModelo, { fecha, puntosLimite: NEGOCIO_CONFIG.puntosLimitePorDefecto, puntosUsados: 0 });
      capacidad = await manager.save(CapacidadDiaModelo, capacidad);
    }
    return capacidad;
  }

  private dates(desde?: string, hasta?: string) {
    const inicio = new Date(`${desde ?? new Date().toISOString().slice(0, 10)}T00:00:00Z`);
    const fin = new Date(`${hasta ?? desde ?? new Date().toISOString().slice(0, 10)}T00:00:00Z`);
    const dates: string[] = [];
    for (const date = new Date(inicio); date <= fin; date.setUTCDate(date.getUTCDate() + 1)) dates.push(date.toISOString().slice(0, 10));
    return dates;
  }

  async availability(desde?: string, hasta?: string) {
    const dates = this.dates(desde, hasta);
    const rows = await this.repository.findBy({ fecha: In(dates) });
    const byDate = new Map(rows.map((row) => [row.fecha, row]));
    return dates.map((fecha) => ({ fecha, disponible: (byDate.get(fecha)?.puntosUsados ?? 0) < (byDate.get(fecha)?.puntosLimite ?? NEGOCIO_CONFIG.puntosLimitePorDefecto) }));
  }

  async list(desde?: string, hasta?: string) {
    const dates = this.dates(desde, hasta);
    const rows = await this.repository.findBy({ fecha: In(dates) });
    const byDate = new Map(rows.map((row) => [row.fecha, row]));
    return dates.map((fecha) => { const row = byDate.get(fecha); return { fecha, puntosLimite: row?.puntosLimite ?? NEGOCIO_CONFIG.puntosLimitePorDefecto, puntosUsados: row?.puntosUsados ?? 0, puntosDisponibles: (row?.puntosLimite ?? NEGOCIO_CONFIG.puntosLimitePorDefecto) - (row?.puntosUsados ?? 0) }; });
  }

  async update(fecha: string, puntosLimite: number) {
    if (!Number.isInteger(puntosLimite) || puntosLimite < 0) throw new Error('puntosLimite debe ser un entero mayor o igual a 0');
    const row = await this.getOrCreate(fecha);
    if (puntosLimite < row.puntosUsados) throw new Error('El límite no puede ser menor que los puntos usados.');
    row.puntosLimite = puntosLimite;
    return this.repository.save(row);
  }
}
