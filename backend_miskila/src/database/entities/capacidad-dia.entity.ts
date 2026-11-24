import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('capacidad_dia')
export class CapacidadDiaModelo {
  @PrimaryColumn({ type: 'date' }) fecha!: string;
  @Column({ name: 'puntos_limite', type: 'integer' }) puntosLimite!: number;
  @Column({ name: 'puntos_usados', type: 'integer', default: 0 }) puntosUsados!: number;
}
