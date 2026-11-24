import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ProductoModelo } from './producto.entity.js';

@Entity('presentacion')
export class PresentacionModelo {
  @PrimaryGeneratedColumn('identity', { name: 'id_presentacion' }) idPresentacion!: number;
  @ManyToOne(() => ProductoModelo, { nullable: false, onDelete: 'RESTRICT' }) @JoinColumn({ name: 'id_producto' }) producto!: ProductoModelo;
  @Column({ length: 50 }) nombre!: string;
  @Column({ name: 'cantidad_personas', type: 'integer', nullable: true }) cantidadPersonas!: number | null;
  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true }) precio!: string | null;
  @Column({ type: 'integer' }) puntos!: number;
  @Column({ default: true }) activa!: boolean;
}
