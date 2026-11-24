import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PresentacionModelo } from '../database/entities/presentacion.entity.js';
import { ProductoModelo } from '../database/entities/producto.entity.js';

@Injectable()
export class ProductosService {
  constructor(@InjectRepository(ProductoModelo) private readonly productos: Repository<ProductoModelo>, @InjectRepository(PresentacionModelo) private readonly presentaciones: Repository<PresentacionModelo>) {}
  list(categoria?: string) { return this.productos.find({ where: categoria ? { categoria } : {}, relations: { } as never }); }
  async findOne(idProducto: number) { const producto = await this.productos.findOneBy({ idProducto }); if (!producto) throw new NotFoundException('El producto no existe.'); return producto; }
  create(data: Partial<ProductoModelo>) { return this.productos.save(this.productos.create(data)); }
  async update(idProducto: number, data: Partial<ProductoModelo>) { const producto = await this.findOne(idProducto); Object.assign(producto, data); return this.productos.save(producto); }
  async listPresentaciones(idProducto: number) { await this.findOne(idProducto); return this.presentaciones.find({ where: { producto: { idProducto } }, relations: { producto: true } }); }
  async createPresentacion(idProducto: number, data: Partial<PresentacionModelo>) { const producto = await this.findOne(idProducto); return this.presentaciones.save(this.presentaciones.create({ ...data, producto })); }
  async updatePresentacion(idPresentacion: number, data: Partial<PresentacionModelo>) { const item = await this.presentaciones.findOneBy({ idPresentacion }); if (!item) throw new NotFoundException('La presentación no existe.'); Object.assign(item, data); return this.presentaciones.save(item); }
}
