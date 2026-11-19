import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash, compare } from 'bcryptjs';
import { QueryFailedError, Repository } from 'typeorm';
import { RegisterDto } from '../auth/dto/register.dto.js';
import {
  EstadoCuenta,
  RolUsuario,
  Usuario,
} from './entities/usuario.entity.js';

export type UsuarioPublico = Pick<
  Usuario,
  | 'id'
  | 'celular'
  | 'nombreCompleto'
  | 'rol'
  | 'estadoCuenta'
  | 'debeCambiarContrasena'
>;

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
  ) {}

  async registerCliente(registerDto: RegisterDto): Promise<UsuarioPublico> {
    const existing = await this.usuariosRepository.findOneBy({
      celular: registerDto.celular,
    });
    if (existing?.estadoCuenta === EstadoCuenta.BANEADA) {
      throw new ForbiddenException('No es posible registrar ese número');
    }
    if (existing) {
      throw new ConflictException(
        'Ese celular ya está registrado. Si olvidaste tu contraseña, comunícate con Miskila por WhatsApp.',
      );
    }

    const usuario = this.usuariosRepository.create({
      celular: registerDto.celular,
      contrasenaCifrada: await hash(registerDto.contrasena, 12),
      nombreCompleto: null,
      rol: RolUsuario.CLIENTE,
      estadoCuenta: EstadoCuenta.ACTIVA,
      suspendidoHasta: null,
      cancelacionesHoy: 0,
      fechaContador: null,
      debeCambiarContrasena: false,
      aceptoTerminosEl: new Date(),
      creadoPor: null,
    });

    try {
      return this.toPublico(await this.usuariosRepository.save(usuario));
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.driverError?.code === '23505'
      ) {
        throw new ConflictException(
          'Ese celular ya está registrado. Si olvidaste tu contraseña, comunícate con Miskila por WhatsApp.',
        );
      }
      throw error;
    }
  }

  async validateCredentials(
    celular: string,
    contrasena: string,
  ): Promise<UsuarioPublico> {
    const usuario = await this.usuariosRepository
      .createQueryBuilder('usuario')
      .addSelect('usuario.contrasenaCifrada')
      .where('usuario.celular = :celular', { celular })
      .getOne();

    if (
      !usuario ||
      !(await compare(contrasena, usuario.contrasenaCifrada))
    ) {
      throw new UnauthorizedException('Celular o contraseña incorrectos');
    }

    return this.toPublico(usuario);
  }

  async findPublicById(id: number): Promise<UsuarioPublico> {
    const usuario = await this.usuariosRepository.findOneBy({ id });
    if (!usuario) {
      throw new NotFoundException('La cuenta ya no existe');
    }
    return this.toPublico(usuario);
  }

  private toPublico(usuario: Usuario): UsuarioPublico {
    return {
      id: usuario.id,
      celular: usuario.celular,
      nombreCompleto: usuario.nombreCompleto,
      rol: usuario.rol,
      estadoCuenta: usuario.estadoCuenta,
      debeCambiarContrasena: usuario.debeCambiarContrasena,
    };
  }
}
