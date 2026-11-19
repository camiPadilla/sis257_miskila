import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('categorias')
export class Categoria {
  @PrimaryGeneratedColumn('identity')
  id!: number;

  @Column('varchar', { length: 80, unique: true })
  nombre!: string;

  @Column('integer', { default: 0 })
  orden!: number;

  @Column('boolean', { default: true })
  activa!: boolean;
}
