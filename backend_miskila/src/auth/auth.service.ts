import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService, UsuarioPublico } from '../usuarios/usuarios.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { JwtPayload } from './interfaces/jwt-payload.interface.js';

export interface AuthResponse {
  accessToken: string;
  usuario: UsuarioPublico;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  register(registerDto: RegisterDto): Promise<UsuarioPublico> {
    return this.usuariosService.registerCliente(registerDto);
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const usuario = await this.usuariosService.validateCredentials(
      loginDto.celular,
      loginDto.contrasena,
    );
    const payload: JwtPayload = { sub: usuario.id, rol: usuario.rol };
    const accessToken = await this.jwtService.signAsync(payload);

    return { accessToken, usuario };
  }

  getProfile(userId: number): Promise<UsuarioPublico> {
    return this.usuariosService.findPublicById(userId);
  }
}
