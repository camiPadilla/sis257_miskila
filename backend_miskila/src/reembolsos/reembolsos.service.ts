import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ReglaNegocioException } from '../common/errors/regla-negocio.exception.js';
import { EstadoPedido, PedidoModelo } from '../database/entities/pedido.entity.js';
import { EstadoReembolso, ReembolsoModelo } from '../database/entities/reembolso.entity.js';
import { UsuarioModelo } from '../database/entities/usuario.entity.js';
import { NEGOCIO_CONFIG } from '../common/config/negocio.config.js';

@Injectable()
export class ReembolsosService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource, @InjectRepository(ReembolsoModelo) private readonly reembolsos: Repository<ReembolsoModelo>) {}
  private fail(codigo: string, message: string): never { throw new ReglaNegocioException(codigo, message); }
  async request(idCliente: number, idPedido: number) { return this.dataSource.transaction(async (manager) => { const pedido = await manager.findOne(PedidoModelo, { where: { idPedido, cliente: { idUsuario: idCliente } }, relations: { cliente: true, capacidadDia: true, pago: true, reembolso: true } }); if (!pedido) throw new NotFoundException('El pedido no existe.'); if (pedido.estado !== EstadoPedido.PAGADO || !pedido.pago || pedido.reembolso || new Date() > pedido.limitePago) this.fail('PLAZO_VENCIDO', 'Ya pasaron 8 horas desde tu compra, por lo que no se puede cancelar ni solicitar reembolso.'); pedido.estado = EstadoPedido.REEMBOLSO_SOLICITADO; pedido.capacidadDia.puntosUsados -= pedido.puntosTotal; const refund = manager.create(ReembolsoModelo, { pedido, monto: pedido.total, estado: EstadoReembolso.SOLICITADO, fechaSolicitud: new Date(), fechaRealizado: null, gestor: null, observacion: null }); await manager.save([pedido, pedido.capacidadDia]); await manager.save(ReembolsoModelo, refund); return { pedido, aviso: this.isRefundHours() ? undefined : 'Tu solicitud se atenderá a primera hora del día siguiente.' }; }); }
  private isRefundHours() { const p = new Intl.DateTimeFormat('en-US', { timeZone: NEGOCIO_CONFIG.zonaHoraria, hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date()); const hour = Number(p.find((x) => x.type === 'hour')?.value); return hour >= 9 && hour < 18; }
  list(estado?: string) { return this.reembolsos.find({ where: estado ? { estado: estado as EstadoReembolso } : {}, relations: { pedido: { cliente: true } }, order: { fechaSolicitud: 'ASC' } }); }
  async realize(idReembolso: number, idGestor: number) { const refund = await this.reembolsos.findOne({ where: { idReembolso }, relations: { pedido: true } }); if (!refund) throw new NotFoundException('El reembolso no existe.'); if (refund.estado !== EstadoReembolso.SOLICITADO) this.fail('ESTADO_INVALIDO', 'Esta acción no está permitida para el estado actual del pedido.'); refund.estado = EstadoReembolso.REALIZADO; refund.fechaRealizado = new Date(); refund.gestor = await this.dataSource.getRepository(UsuarioModelo).findOneByOrFail({ idUsuario: idGestor }); refund.pedido.estado = EstadoPedido.REEMBOLSADO; await this.reembolsos.save(refund); return this.dataSource.getRepository(PedidoModelo).save(refund.pedido); }
}
