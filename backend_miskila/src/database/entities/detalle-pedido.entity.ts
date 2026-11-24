import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PedidoModelo } from './pedido.entity.js';
import { PresentacionModelo } from './presentacion.entity.js';

@Entity('detalle_pedido')
export class DetallePedidoModelo {
  @PrimaryGeneratedColumn('identity', { name: 'id_detalle' }) idDetalle!: number;
  @ManyToOne(() => PedidoModelo, { nullable: false, onDelete: 'CASCADE' }) @JoinColumn({ name: 'id_pedido' }) pedido!: PedidoModelo;
  @ManyToOne(() => PresentacionModelo, { nullable: false, onDelete: 'RESTRICT' }) @JoinColumn({ name: 'id_presentacion' }) presentacion!: PresentacionModelo;
  @Column({ type: 'integer' }) cantidad!: number;
  @Column({ name: 'precio_unitario', type: 'numeric', precision: 10, scale: 2 }) precioUnitario!: string;
  @Column({ name: 'puntos_unitario', type: 'integer' }) puntosUnitario!: number;
  @Column({ type: 'numeric', precision: 10, scale: 2 }) subtotal!: string;
  @Column({ name: 'descripcion_personalizada', type: 'varchar', length: 255, nullable: true }) descripcionPersonalizada!: string | null;
}
