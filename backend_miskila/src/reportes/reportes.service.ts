import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { EstadoPedido, PedidoModelo } from '../database/entities/pedido.entity.js';
import { EstadoReembolso, ReembolsoModelo } from '../database/entities/reembolso.entity.js';

@Injectable()
export class ReportesService {
  constructor(@InjectRepository(PedidoModelo) private readonly pedidos: Repository<PedidoModelo>, @InjectRepository(ReembolsoModelo) private readonly reembolsos: Repository<ReembolsoModelo>) {}
  private range(desde?: string, hasta?: string) { return [new Date(`${desde ?? '1970-01-01'}T00:00:00`), new Date(`${hasta ?? '2999-12-31'}T23:59:59.999`)]; }
  async sales(desde?: string, hasta?: string) { const [from, to] = this.range(desde, hasta); const paid = await this.pedidos.find({ where: { fechaCompra: Between(from, to), estado: [EstadoPedido.PAGADO, EstadoPedido.ENTREGADO, EstadoPedido.REEMBOLSO_SOLICITADO, EstadoPedido.REEMBOLSADO] as never } }); const refunds = await this.reembolsos.find({ where: { fechaRealizado: Between(from, to), estado: EstadoReembolso.REALIZADO } }); const totalCobrado = paid.reduce((sum, row) => sum + Number(row.total), 0); const totalReembolsos = refunds.reduce((sum, row) => sum + Number(row.monto), 0); return { totalCobrado: totalCobrado.toFixed(2), totalReembolsos: totalReembolsos.toFixed(2), neto: (totalCobrado - totalReembolsos).toFixed(2) }; }
  detail(desde?: string, hasta?: string, estado?: string, idCliente?: number) { const [from, to] = this.range(desde, hasta); return this.pedidos.find({ where: { fechaCompra: Between(from, to), ...(estado ? { estado: estado as EstadoPedido } : {}), ...(idCliente ? { cliente: { idUsuario: idCliente } } : {}) }, relations: { cliente: true, detalles: { presentacion: true }, reembolso: true }, order: { fechaCompra: 'DESC' } }); }
}
