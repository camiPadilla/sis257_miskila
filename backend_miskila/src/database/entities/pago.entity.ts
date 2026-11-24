import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { PedidoModelo } from './pedido.entity.js';
import { UsuarioModelo } from './usuario.entity.js';

export enum EstadoPago { PENDIENTE = 'pendiente', VERIFICADO = 'verificado', NO_LLEGO = 'no_llego' }

@Entity('pago')
export class PagoModelo {
  @PrimaryGeneratedColumn('identity', { name: 'id_pago' }) idPago!: number;
  @OneToOne('PedidoModelo', { nullable: false, onDelete: 'CASCADE' }) @JoinColumn({ name: 'id_pedido' }) pedido!: PedidoModelo;
  @Column({ type: 'numeric', precision: 10, scale: 2 }) monto!: string;
  @Column({ name: 'comprobante_recibido', default: false }) comprobanteRecibido!: boolean;
  @Column({ name: 'fecha_comprobante', type: 'timestamp', nullable: true }) fechaComprobante!: Date | null;
  @Column({ type: 'enum', enum: EstadoPago, default: EstadoPago.PENDIENTE }) estado!: EstadoPago;
  @Column({ name: 'fecha_verificacion', type: 'timestamp', nullable: true }) fechaVerificacion!: Date | null;
  @ManyToOne(() => UsuarioModelo, { nullable: true, onDelete: 'SET NULL' }) @JoinColumn({ name: 'id_verificador' }) verificador!: UsuarioModelo | null;
  @Column({ type: 'varchar', length: 255, nullable: true }) observacion!: string | null;
}
