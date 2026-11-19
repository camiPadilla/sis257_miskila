import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Categoria } from '../../categorias/entities/categoria.entity.js';

@Entity('productos')
export class Producto {
  @PrimaryGeneratedColumn('identity')
  id!: number;

  @ManyToOne(() => Categoria, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'categoria_id' })
  categoria!: Categoria;

  @Column('varchar', { length: 120 })
  nombre!: string;

  @Column('text', { nullable: true })
  descripcion!: string | null;

  @Column('varchar', { length: 500, nullable: true })
  foto!: string | null;

  @Column('numeric', { precision: 10, scale: 2 })
  precioBs!: string;

  @Column('integer')
  puntos!: number;

  @Column('boolean', { default: true })
  disponible!: boolean;

  @Column('boolean', { default: false })
  esPersonalizada!: boolean;

  @Column('integer', { default: 0 })
  orden!: number;
}
