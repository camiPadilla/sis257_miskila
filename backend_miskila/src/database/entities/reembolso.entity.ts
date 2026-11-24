import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { PedidoModelo } from './pedido.entity.js';
import { UsuarioModelo } from './usuario.entity.js';

export enum EstadoReembolso { SOLICITADO = 'solicitado', REALIZADO = 'realizado' }

@Entity('reembolso')
export class ReembolsoModelo {
  @PrimaryGeneratedColumn('identity', { name: 'id_reembolso' }) idReembolso!: number;
  @OneToOne('PedidoModelo', { nullable: false, onDelete: 'RESTRICT' }) @JoinColumn({ name: 'id_pedido' }) pedido!: PedidoModelo;
  @Column({ type: 'numeric', precision: 10, scale: 2 }) monto!: string;
  @Column({ type: 'enum', enum: EstadoReembolso, default: EstadoReembolso.SOLICITADO }) estado!: EstadoReembolso;
  @Column({ name: 'fecha_solicitud', type: 'timestamp' }) fechaSolicitud!: Date;
  @Column({ name: 'fecha_realizado', type: 'timestamp', nullable: true }) fechaRealizado!: Date | null;
  @ManyToOne(() => UsuarioModelo, { nullable: true, onDelete: 'SET NULL' }) @JoinColumn({ name: 'id_gestor' }) gestor!: UsuarioModelo | null;
  @Column({ type: 'varchar', length: 255, nullable: true }) observacion!: string | null;
}
