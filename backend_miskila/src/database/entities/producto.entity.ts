import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('producto')
export class ProductoModelo {
  @PrimaryGeneratedColumn('identity', { name: 'id_producto' }) idProducto!: number;
  @Column({ length: 100 }) nombre!: string;
  @Column({ type: 'varchar', length: 255, nullable: true }) descripcion!: string | null;
  @Column({ length: 50 }) categoria!: string;
  @Column({ type: 'varchar', length: 255, nullable: true }) imagen!: string | null;
  @Column({ default: false }) pausado!: boolean;
}
