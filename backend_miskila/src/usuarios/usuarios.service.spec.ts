import { ConflictException, ForbiddenException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { compare } from 'bcryptjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RegisterDto } from '../auth/dto/register.dto.js';
import {
  EstadoCuenta,
  RolUsuario,
  Usuario,
} from './entities/usuario.entity.js';
import { UsuariosService } from './usuarios.service.js';

describe('UsuariosService', () => {
  const queryBuilder = {
    addSelect: vi.fn(),
    where: vi.fn(),
    getOne: vi.fn(),
  };
  const repository = {
    create: vi.fn(),
    save: vi.fn(),
    findOneBy: vi.fn(),
    createQueryBuilder: vi.fn(),
  };
  let service: UsuariosService;

  beforeEach(async () => {
    vi.clearAllMocks();
    queryBuilder.addSelect.mockReturnValue(queryBuilder);
    queryBuilder.where.mockReturnValue(queryBuilder);
    repository.create.mockImplementation((value) => value);
    repository.createQueryBuilder.mockReturnValue(queryBuilder);

    const moduleRef = await Test.createTestingModule({
      providers: [
        UsuariosService,
        { provide: getRepositoryToken(Usuario), useValue: repository },
      ],
    }).compile();
    service = moduleRef.get(UsuariosService);
  });

  it('registers a client with a hashed password and no staff role', async () => {
    const input: RegisterDto = {
      celular: '73463222',
      contrasena: 'password-segura',
      aceptaTerminos: true,
    };
    repository.save.mockImplementation(async (usuario) => ({
      ...usuario,
      id: 1,
    }));

    const created = await service.registerCliente(input);

    expect(created).toMatchObject({
      id: 1,
      celular: input.celular,
      rol: RolUsuario.CLIENTE,
      estadoCuenta: EstadoCuenta.ACTIVA,
    });
    expect(created).not.toHaveProperty('contrasenaCifrada');
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ rol: RolUsuario.CLIENTE }),
    );
    const passwordHash = repository.create.mock.calls[0][0]
      .contrasenaCifrada as string;
    expect(passwordHash).not.toBe(input.contrasena);
    await expect(compare(input.contrasena, passwordHash)).resolves.toBe(true);
  });

  it('rejects registration for a banned cellphone', async () => {
    repository.findOneBy.mockResolvedValue({
      estadoCuenta: EstadoCuenta.BANEADA,
    });

    await expect(
      service.registerCliente({
        celular: '73463222',
        contrasena: 'password-segura',
        aceptaTerminos: true,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects an already registered cellphone', async () => {
    repository.findOneBy.mockResolvedValue({
      estadoCuenta: EstadoCuenta.ACTIVA,
    });

    await expect(
      service.registerCliente({
        celular: '73463222',
        contrasena: 'password-segura',
        aceptaTerminos: true,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
