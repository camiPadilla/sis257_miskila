import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum RolUsuario {
  CLIENTE = 'cliente',
  EMPLEADO = 'empleado',
  ADMINISTRADOR = 'administrador',
}

export enum EstadoCuenta {
  ACTIVA = 'activa',
  SUSPENDIDA = 'suspendida',
  BANEADA = 'baneada',
}

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('identity')
  id!: number;

  @Column('varchar', { length: 8, unique: true })
  celular!: string;

  @Column('varchar', { name: 'contrasena_cifrada', length: 255, select: false })
  contrasenaCifrada!: string;

  @Column('varchar', { name: 'nombre_completo', length: 120, nullable: true })
  nombreCompleto!: string | null;

  @Column('enum', { enum: RolUsuario, default: RolUsuario.CLIENTE })
  rol!: RolUsuario;

  @Column('enum', {
    name: 'estado_cuenta',
    enum: EstadoCuenta,
    default: EstadoCuenta.ACTIVA,
  })
  estadoCuenta!: EstadoCuenta;

  @Column('timestamptz', { name: 'suspendido_hasta', nullable: true })
  suspendidoHasta!: Date | null;

  @Column('integer', { name: 'cancelaciones_hoy', default: 0 })
  cancelacionesHoy!: number;

  @Column('date', { name: 'fecha_contador', nullable: true })
  fechaContador!: string | null;

  @Column('boolean', { name: 'debe_cambiar_contrasena', default: false })
  debeCambiarContrasena!: boolean;

  @Column('timestamptz', { name: 'acepto_terminos_el', nullable: true })
  aceptoTerminosEl!: Date | null;

  @CreateDateColumn({ name: 'creado_el', type: 'timestamptz' })
  creadoEl!: Date;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'creado_por_id' })
  creadoPor!: Usuario | null;
}
