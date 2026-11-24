import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service.js';

@Injectable()
export class AuthService {
  constructor(private readonly usuarios: UsuariosService, private readonly jwt: JwtService) {}
  async register(celular: string, contrasena: string) { return this.usuarios.register(celular, contrasena); }
  async login(celular: string, contrasena: string) { const usuario = await this.usuarios.login(celular, contrasena); return { accessToken: await this.jwt.signAsync({ sub: usuario.idUsuario, rol: usuario.rol }), usuario: this.usuarios.publico(usuario) }; }
  me(idUsuario: number) { return this.usuarios.byId(idUsuario).then((usuario) => this.usuarios.publico(usuario)); }
  completeName(idUsuario: number, nombreCompleto: string) { return this.usuarios.completeName(idUsuario, nombreCompleto); }
}
