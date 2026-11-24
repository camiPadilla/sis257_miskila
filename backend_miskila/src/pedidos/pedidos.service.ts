import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { NEGOCIO_CONFIG } from '../common/config/negocio.config.js';
import { ReglaNegocioException } from '../common/errors/regla-negocio.exception.js';
import { CapacidadDiaModelo } from '../database/entities/capacidad-dia.entity.js';
import { DetallePedidoModelo } from '../database/entities/detalle-pedido.entity.js';
import { EstadoPago, PagoModelo } from '../database/entities/pago.entity.js';
import { EstadoPedido, ModalidadPedido, PedidoModelo, TipoPedido } from '../database/entities/pedido.entity.js';
import { PresentacionModelo } from '../database/entities/presentacion.entity.js';
import { EstadoUsuario, UsuarioModelo } from '../database/entities/usuario.entity.js';
import { CapacidadService } from '../capacidad/capacidad.service.js';
import { CreatePedidoDto, CreatePedidoPersonalizadoDto } from './dto/create-pedido.dto.js';
import { ReembolsosService } from '../reembolsos/reembolsos.service.js';

@Injectable()
export class PedidosService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(PedidoModelo) private readonly pedidos: Repository<PedidoModelo>,
    private readonly capacidad: CapacidadService,
    private readonly reembolsos: ReembolsosService,
  ) {}

  private now() { return new Date(); }
  private businessParts(date: Date) { return new Intl.DateTimeFormat('en-US', { timeZone: NEGOCIO_CONFIG.zonaHoraria, weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(date); }
  private isPurchaseOpen(date: Date) { const p = this.businessParts(date); const day = p.find((x) => x.type === 'weekday')?.value; const hour = Number(p.find((x) => x.type === 'hour')?.value); const minute = Number(p.find((x) => x.type === 'minute')?.value); return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(day ?? '') && (hour < 18 || (hour === 18 && minute === 0)); }
  private fail(codigo: string, message: string): never { throw new ReglaNegocioException(codigo, message); }
  private validateSchedule(fecha: string, hora: string, now: Date) {
    const delivery = new Date(`${fecha}T${hora}:00`);
    if (Number.isNaN(delivery.getTime())) this.fail('FECHA_ENTREGA_INVALIDA', 'La fecha u hora de entrega elegida no es válida.');
    if (delivery.getTime() < now.getTime() + NEGOCIO_CONFIG.anticipacionMinimaHoras * 3600000) this.fail('FECHA_ENTREGA_INVALIDA', 'La fecha u hora de entrega elegida no es válida.');
    const today = new Date(now); today.setHours(0, 0, 0, 0); const max = new Date(today); max.setDate(max.getDate() + NEGOCIO_CONFIG.anticipacionMaximaDias);
    const day = new Date(`${fecha}T00:00:00`); if (day > max || day < today) this.fail('FECHA_ENTREGA_INVALIDA', 'La fecha u hora de entrega elegida no es válida.');
    const [hour, minute] = hora.split(':').map(Number); if (hour < 7 || hour > 20 || (hour === 20 && minute > 0)) this.fail('FECHA_ENTREGA_INVALIDA', 'La fecha u hora de entrega elegida no es válida.');
  }

  private async findClient(manager: import('typeorm').EntityManager, id: number) {
    const user = await manager.findOne(UsuarioModelo, { where: { idUsuario: id } });
    if (!user) throw new NotFoundException('El cliente no existe.');
    if (user.estado !== EstadoUsuario.ACTIVO) this.fail('CUENTA_SUSPENDIDA', 'Tu cuenta está suspendida. Puedes ver tus pedidos anteriores o contactar a soporte.');
    if (!user.nombreCompleto) this.fail('NOMBRE_PENDIENTE', 'Completa tu nombre para continuar.');
    return user;
  }

  async create(idCliente: number, dto: CreatePedidoDto) { return this.createOrder(idCliente, null, TipoPedido.NORMAL, dto, null); }

  async createPersonalized(idCreador: number, dto: CreatePedidoPersonalizadoDto) {
    const idCliente = dto.idCliente ?? (dto.celularCliente ? (await this.pedidos.manager.findOneBy(UsuarioModelo, { celular: dto.celularCliente }))?.idUsuario : undefined);
    if (!idCliente) throw new NotFoundException('El cliente no existe.');
    return this.createOrder(idCliente, idCreador, TipoPedido.PERSONALIZADO, dto, { idPresentacion: dto.idPresentacion, precio: dto.precio, descripcionPersonalizada: dto.descripcionPersonalizada });
  }

  private async createOrder(idCliente: number, idCreador: number | null, tipo: TipoPedido, dto: CreatePedidoDto, custom: { idPresentacion: number; precio: string; descripcionPersonalizada: string } | null) {
    const now = this.now();
    if (!this.isPurchaseOpen(now) && !idCreador) this.fail('FUERA_DE_HORARIO_COMPRA', 'Las compras se realizan de lunes a viernes de 9:00 a 18:00.');
    if (!dto.detalles.length && !custom) this.fail('CARRITO_VACIO', 'El carrito no puede estar vacío.');
    if (dto.modalidad === ModalidadPedido.DOMICILIO && !dto.direccionEntrega?.trim()) this.fail('DIRECCION_REQUERIDA', 'La dirección es obligatoria para el domicilio.');
    this.validateSchedule(dto.fechaEntrega, dto.horaEntrega, now);
    return this.dataSource.transaction(async (manager) => {
      const cliente = await this.findClient(manager, idCliente);
      const items = custom ? [{ idPresentacion: custom.idPresentacion, cantidad: 1, descripcionPersonalizada: custom.descripcionPersonalizada, customPrice: custom.precio }] : dto.detalles;
      const ids = items.map((item) => item.idPresentacion);
      const presentations = await manager.find(PresentacionModelo, { where: ids.map((idPresentacion) => ({ idPresentacion })), relations: { producto: true } });
      const byId = new Map(presentations.map((item) => [item.idPresentacion, item]));
      let total = 0; let points = 0;
      const details: Array<Partial<DetallePedidoModelo> & { presentation: PresentacionModelo; quantity: number }> = [];
      for (const item of items) {
        const presentation = byId.get(item.idPresentacion); if (!presentation || !presentation.activa || presentation.producto.pausado) this.fail('PRODUCTO_NO_DISPONIBLE', 'Este producto no está disponible por ahora.');
        const price = 'customPrice' in item ? Number(item.customPrice) : Number(presentation.precio); if (!Number.isFinite(price)) this.fail('PRECIO_REQUERIDO', 'El precio del pedido personalizado es obligatorio.');
        const subtotal = price * item.cantidad; total += subtotal; points += presentation.puntos * item.cantidad;
        details.push({ presentation, quantity: item.cantidad, cantidad: item.cantidad, precioUnitario: price.toFixed(2), puntosUnitario: presentation.puntos, subtotal: subtotal.toFixed(2), descripcionPersonalizada: item.descripcionPersonalizada ?? null });
      }
      const capacidad = await this.capacidad.getOrCreate(dto.fechaEntrega, manager);
      const available = capacidad.puntosLimite - capacidad.puntosUsados;
      if (points > capacidad.puntosLimite) this.fail('PEDIDO_EXCEDE_CAPACIDAD', 'Tu pedido es muy grande para hacerlo desde la página. Si deseas más, contacta a Miskila por WhatsApp.');
      if (points > available) { if (available <= 0) this.fail('FECHA_AGOTADA', 'Nos quedamos sin manos para esta fecha. Vuelve mañana a comprar.'); this.fail('SOLO_PRODUCTOS_PEQUENOS', 'Solo puedes escoger productos más pequeños. Si quieres más, contacta a Miskila a través de WhatsApp.'); }
      const deliveryCost = dto.modalidad === ModalidadPedido.DOMICILIO ? NEGOCIO_CONFIG.costoDomicilio : 0;
      const pedido = await manager.save(PedidoModelo, manager.create(PedidoModelo, { cliente, creador: idCreador ? await manager.findOneByOrFail(UsuarioModelo, { idUsuario: idCreador }) : null, tipo, fechaCompra: now, capacidadDia: capacidad, horaEntrega: dto.horaEntrega, modalidad: dto.modalidad as ModalidadPedido, direccionEntrega: dto.direccionEntrega ?? null, costoDomicilio: deliveryCost.toFixed(2), total: (total + deliveryCost).toFixed(2), puntosTotal: points, estado: EstadoPedido.PENDIENTE_PAGO, limitePago: new Date(now.getTime() + NEGOCIO_CONFIG.plazoPagoHoras * 3600000), listo: false, fechaCancelacion: null }));
      await manager.save(DetallePedidoModelo, details.map((detail) => manager.create(DetallePedidoModelo, { pedido, presentacion: detail.presentation, cantidad: detail.cantidad, precioUnitario: detail.precioUnitario, puntosUnitario: detail.puntosUnitario, subtotal: detail.subtotal, descripcionPersonalizada: detail.descripcionPersonalizada })));
      await manager.save(PagoModelo, manager.create(PagoModelo, { pedido, monto: pedido.total, estado: EstadoPago.PENDIENTE, comprobanteRecibido: false }));
      capacidad.puntosUsados += points; await manager.save(CapacidadDiaModelo, capacidad);
      return { pedido, mensaje: 'Realiza tu pago lo antes posible. Tienes 8 horas desde tu pedido para pagar, cancelar o solicitar reembolso. Pasado ese tiempo sin recibir tu pago, tu cuenta se suspenderá por 7 días.' };
    });
  }

  private customerView(pedido: PedidoModelo) { return { idPedido: pedido.idPedido, fechaCompra: pedido.fechaCompra, fechaEntrega: pedido.capacidadDia?.fecha, horaEntrega: pedido.horaEntrega, modalidad: pedido.modalidad, direccionEntrega: pedido.direccionEntrega, costoDomicilio: pedido.costoDomicilio, total: pedido.total, estado: pedido.estado, mensajeTiempo: `Tu pedido estará listo en ${this.remaining(pedido.capacidadDia?.fecha, pedido.horaEntrega)}.` }; }
  private remaining(fecha?: string, hora?: string) { if (!fecha || !hora) return 'la fecha programada'; const milliseconds = new Date(`${fecha}T${hora}:00`).getTime() - Date.now(); if (milliseconds <= 0) return 'breve'; const hours = Math.floor(milliseconds / 3600000); return hours > 24 ? `${Math.floor(hours / 24)} días` : `${hours} horas`; }
  mine(idCliente: number) { return this.pedidos.find({ where: { cliente: { idUsuario: idCliente } }, relations: { capacidadDia: true }, order: { fechaCompra: 'DESC' } }).then((rows) => rows.map((row) => this.customerView(row))); }
  async mineOne(idCliente: number, idPedido: number) { const row = await this.pedidos.findOne({ where: { idPedido, cliente: { idUsuario: idCliente } }, relations: { capacidadDia: true, detalles: { presentacion: true } } }); if (!row) throw new NotFoundException('El pedido no existe.'); return this.customerView(row); }
  list(fechaEntrega?: string, estado?: string) { return this.pedidos.find({ where: { ...(fechaEntrega ? { capacidadDia: { fecha: fechaEntrega } } : {}), ...(estado ? { estado: estado as EstadoPedido } : {}) }, relations: { cliente: true, capacidadDia: true }, order: { estado: 'ASC', limitePago: 'ASC' } }); }
  async one(idPedido: number) { const row = await this.pedidos.findOne({ where: { idPedido }, relations: { cliente: true, capacidadDia: true, detalles: { presentacion: true }, pago: true } }); if (!row) throw new NotFoundException('El pedido no existe.'); return row; }
  async markReady(idPedido: number) { const row = await this.one(idPedido); row.listo = true; return this.pedidos.save(row); }
  async markDelivered(idPedido: number) { const row = await this.one(idPedido); if (row.estado !== EstadoPedido.PAGADO) this.fail('ESTADO_INVALIDO', 'Esta acción no está permitida para el estado actual del pedido.'); row.estado = EstadoPedido.ENTREGADO; return this.pedidos.save(row); }
  async cancel(idCliente: number, idPedido: number) { const row = await this.pedidos.findOne({ where: { idPedido, cliente: { idUsuario: idCliente } }, relations: { cliente: true, capacidadDia: true } }); if (!row) throw new NotFoundException('El pedido no existe.'); if (row.estado !== EstadoPedido.PENDIENTE_PAGO) this.fail('ESTADO_INVALIDO', 'Esta acción no está permitida para el estado actual del pedido.'); if (this.now() > row.limitePago) this.fail('PLAZO_VENCIDO', 'Ya pasaron 8 horas desde tu compra, por lo que no se puede cancelar ni solicitar reembolso.'); return this.dataSource.transaction(async (manager) => { row.estado = EstadoPedido.CANCELADO; row.fechaCancelacion = this.now(); row.capacidadDia.puntosUsados -= row.puntosTotal; await manager.save(PedidoModelo, row); await manager.save(CapacidadDiaModelo, row.capacidadDia); return this.customerView(row); }); }
  requestRefund(idCliente: number, idPedido: number) { return this.reembolsos.request(idCliente, idPedido); }
}
