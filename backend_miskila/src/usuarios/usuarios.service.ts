import { ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcryptjs';
import { Repository } from 'typeorm';
import { EstadoUsuario, RolUsuario, UsuarioModelo } from '../database/entities/usuario.entity.js';

@Injectable()
export class UsuariosService {
  constructor(@InjectRepository(UsuarioModelo) private readonly usuarios: Repository<UsuarioModelo>) {}
  publico(usuario: UsuarioModelo) { return { idUsuario: usuario.idUsuario, celular: usuario.celular, nombreCompleto: usuario.nombreCompleto, rol: usuario.rol, estado: usuario.estado }; }
  async register(celular: string, contrasena: string) {
    const existente = await this.usuarios.findOneBy({ celular });
    if (existente?.estado === EstadoUsuario.BANEADO) throw new ForbiddenException('No es posible registrar ese número.');
    if (existente) throw new ConflictException({ codigo: 'CELULAR_YA_REGISTRADO', message: 'Este número ya está registrado. Si olvidaste tu contraseña, escribe a soporte de Miskila.' });
    return this.publico(await this.usuarios.save(this.usuarios.create({ celular, contrasena: await hash(contrasena, 12), rol: RolUsuario.CLIENTE, estado: EstadoUsuario.ACTIVO, nombreCompleto: null })));
  }
  async login(celular: string, contrasena: string) {
    const usuario = await this.usuarios.findOneBy({ celular });
    if (!usuario || !(await compare(contrasena, usuario.contrasena))) throw new UnauthorizedException('Celular o contraseña incorrectos');
    return usuario;
  }
  async byId(idUsuario: number) { const usuario = await this.usuarios.findOneBy({ idUsuario }); if (!usuario) throw new NotFoundException('La cuenta ya no existe'); return usuario; }
  async completeName(idUsuario: number, nombreCompleto: string) { const usuario = await this.byId(idUsuario); usuario.nombreCompleto = nombreCompleto.trim(); return this.publico(await this.usuarios.save(usuario)); }
}
