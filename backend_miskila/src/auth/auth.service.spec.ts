import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { RolUsuario, EstadoCuenta } from '../usuarios/entities/usuario.entity.js';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  const usuariosService = {
    registerCliente: vi.fn(),
    validateCredentials: vi.fn(),
    findPublicById: vi.fn(),
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
    usuariosService.validateCredentials.mockResolvedValue({
      id: 7,
      celular: '73463222',
      nombreCompleto: null,
      rol: RolUsuario.CLIENTE,
      estadoCuenta: EstadoCuenta.ACTIVA,
      debeCambiarContrasena: false,
    });
    jwtService.signAsync.mockResolvedValue('signed-token');

    await expect(
      service.login({ celular: '73463222', contrasena: 'password-segura' }),
    ).resolves.toMatchObject({
      accessToken: 'signed-token',
      usuario: { id: 7, rol: RolUsuario.CLIENTE },
    });
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: 7,
      rol: RolUsuario.CLIENTE,
    });
  });
});
