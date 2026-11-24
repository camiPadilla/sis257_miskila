import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { RolUsuario, EstadoUsuario } from '../database/entities/usuario.entity.js';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  const usuariosService = {
    login: vi.fn(),
    publico: vi.fn((usuario) => ({
      idUsuario: usuario.idUsuario,
      celular: usuario.celular,
      nombreCompleto: usuario.nombreCompleto,
      rol: usuario.rol,
      estado: usuario.estado,
    })),
  };
  const jwtService = {
    signAsync: vi.fn(),
  };
  let service: AuthService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsuariosService, useValue: usuariosService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();
    service = moduleRef.get(AuthService);
  });

  it('issues a JWT containing the user id and role', async () => {
    usuariosService.login.mockResolvedValue({
      idUsuario: 7,
      celular: '73463222',
      nombreCompleto: null,
      rol: RolUsuario.CLIENTE,
      estado: EstadoUsuario.ACTIVO,
    });
    jwtService.signAsync.mockResolvedValue('signed-token');

    await expect(
      service.login('73463222', 'password-segura'),
    ).resolves.toMatchObject({
      accessToken: 'signed-token',
      usuario: { idUsuario: 7, rol: RolUsuario.CLIENTE },
    });
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: 7,
      rol: RolUsuario.CLIENTE,
    });
  });
});
