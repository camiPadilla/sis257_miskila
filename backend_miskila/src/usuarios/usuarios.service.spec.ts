import { ConflictException, ForbiddenException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { compare } from 'bcryptjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  EstadoUsuario,
  RolUsuario,
  UsuarioModelo,
} from '../database/entities/usuario.entity.js';
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
        { provide: getRepositoryToken(UsuarioModelo), useValue: repository },
      ],
    }).compile();
    service = moduleRef.get(UsuariosService);
  });

  it('registers a client with a hashed password and no staff role', async () => {
    const celular = '73463222';
    const contrasena = 'password-segura';
    repository.save.mockImplementation(async (usuario) => ({
      ...usuario,
      idUsuario: 1,
    }));

    const created = await service.register(celular, contrasena);

    expect(created).toMatchObject({
      idUsuario: 1,
      celular,
      rol: RolUsuario.CLIENTE,
      estado: EstadoUsuario.ACTIVO,
    });
    expect(created).not.toHaveProperty('contrasena');
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ rol: RolUsuario.CLIENTE }),
    );
    const passwordHash = repository.create.mock.calls[0][0]
      .contrasena as string;
    expect(passwordHash).not.toBe(contrasena);
    await expect(compare(contrasena, passwordHash)).resolves.toBe(true);
  });

  it('rejects registration for a banned cellphone', async () => {
    repository.findOneBy.mockResolvedValue({
      estado: EstadoUsuario.BANEADO,
    });

    await expect(
      service.register('73463222', 'password-segura'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects an already registered cellphone', async () => {
    repository.findOneBy.mockResolvedValue({
      estado: EstadoUsuario.ACTIVO,
    });

    await expect(
      service.register('73463222', 'password-segura'),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
