import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UsuarioModelo } from './usuario.entity.js';
import { CapacidadDiaModelo } from './capacidad-dia.entity.js';

export enum TipoPedido { NORMAL = 'normal', PERSONALIZADO = 'personalizado' }
export enum EstadoPedido { PENDIENTE_PAGO = 'pendiente_pago', PAGADO = 'pagado', NO_PAGADO = 'no_pagado', CANCELADO = 'cancelado', REEMBOLSO_SOLICITADO = 'reembolso_solicitado', REEMBOLSADO = 'reembolsado', ENTREGADO = 'entregado' }
export enum ModalidadPedido { DOMICILIO = 'domicilio', RETIRO = 'retiro' }

@Entity('pedido')
export class PedidoModelo {
  @PrimaryGeneratedColumn('identity', { name: 'id_pedido' }) idPedido!: number;
  @ManyToOne(() => UsuarioModelo, { nullable: false, onDelete: 'RESTRICT' }) @JoinColumn({ name: 'id_cliente' }) cliente!: UsuarioModelo;
  @ManyToOne(() => UsuarioModelo, { nullable: true, onDelete: 'SET NULL' }) @JoinColumn({ name: 'id_creador' }) creador!: UsuarioModelo | null;
  @Column({ type: 'enum', enum: TipoPedido }) tipo!: TipoPedido;
  @Column({ name: 'fecha_compra', type: 'timestamp' }) fechaCompra!: Date;
  @ManyToOne(() => CapacidadDiaModelo, { nullable: false, onDelete: 'RESTRICT' }) @JoinColumn({ name: 'fecha_entrega', referencedColumnName: 'fecha' }) capacidadDia!: CapacidadDiaModelo;
  @Column({ name: 'hora_entrega', type: 'time' }) horaEntrega!: string;
  @Column({ type: 'enum', enum: ModalidadPedido }) modalidad!: ModalidadPedido;
  @Column({ name: 'direccion_entrega', type: 'varchar', length: 255, nullable: true }) direccionEntrega!: string | null;
  @Column({ name: 'costo_domicilio', type: 'numeric', precision: 10, scale: 2, default: 0 }) costoDomicilio!: string;
  @Column({ type: 'numeric', precision: 10, scale: 2 }) total!: string;
  @Column({ name: 'puntos_total', type: 'integer' }) puntosTotal!: number;
  @Column({ type: 'enum', enum: EstadoPedido, default: EstadoPedido.PENDIENTE_PAGO }) estado!: EstadoPedido;
  @Column({ name: 'limite_pago', type: 'timestamp' }) limitePago!: Date;
  @Column({ default: false }) listo!: boolean;
  @Column({ name: 'fecha_cancelacion', type: 'timestamp', nullable: true }) fechaCancelacion!: Date | null;
  @OneToMany('DetallePedidoModelo', (detalle: any) => detalle.pedido) detalles!: any[];
  @OneToOne('PagoModelo', (pago: any) => pago.pedido) pago!: any;
  @OneToOne('ReembolsoModelo', (reembolso: any) => reembolso.pedido) reembolso!: any;
}
