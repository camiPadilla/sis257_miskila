import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UsuarioModelo } from './usuario.entity.js';

export enum TipoSancion { SUSPENSION = 'suspension', BANEO = 'baneo' }

@Entity('sancion')
export class SancionModelo {
  @PrimaryGeneratedColumn('identity', { name: 'id_sancion' }) idSancion!: number;
  @ManyToOne(() => UsuarioModelo, { nullable: false, onDelete: 'RESTRICT' }) @JoinColumn({ name: 'id_usuario' }) usuario!: UsuarioModelo;
  @Column({ name: 'id_pedido', type: 'integer', nullable: true }) idPedido!: number | null;
  @ManyToOne(() => UsuarioModelo, { nullable: true, onDelete: 'SET NULL' }) @JoinColumn({ name: 'id_administrador' }) administrador!: UsuarioModelo | null;
  @Column({ type: 'enum', enum: TipoSancion }) tipo!: TipoSancion;
  @Column({ length: 200 }) motivo!: string;
  @Column({ name: 'fecha_inicio', type: 'timestamp' }) fechaInicio!: Date;
  @Column({ name: 'fecha_fin', type: 'timestamp', nullable: true }) fechaFin!: Date | null;
  @Column({ default: true }) activa!: boolean;
}
