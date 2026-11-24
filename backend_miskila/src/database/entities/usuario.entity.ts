import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum RolUsuario { CLIENTE = 'cliente', EMPLEADO = 'empleado', ADMINISTRADOR = 'administrador' }
export enum EstadoUsuario { ACTIVO = 'activo', SUSPENDIDO = 'suspendido', BANEADO = 'baneado' }

@Entity('usuario')
export class UsuarioModelo {
  @PrimaryGeneratedColumn('identity', { name: 'id_usuario' }) idUsuario!: number;
  @Column({ length: 15, unique: true }) celular!: string;
  @Column({ type: 'varchar', length: 100, nullable: true, name: 'nombre_completo' }) nombreCompleto!: string | null;
  @Column({ length: 255 }) contrasena!: string;
  @Column({ type: 'enum', enum: RolUsuario, default: RolUsuario.CLIENTE }) rol!: RolUsuario;
  @Column({ type: 'enum', enum: EstadoUsuario, default: EstadoUsuario.ACTIVO }) estado!: EstadoUsuario;
  @CreateDateColumn({ name: 'fecha_registro', type: 'timestamp' }) fechaRegistro!: Date;
}
