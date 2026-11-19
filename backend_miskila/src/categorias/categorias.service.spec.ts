import { ConflictException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Categoria } from './entities/categoria.entity.js';
import { CategoriasService } from './categorias.service.js';

describe('CategoriasService', () => {
  const repository = {
    find: vi.fn(),
    findOneBy: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
  };
  let service: CategoriasService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        CategoriasService,
        { provide: getRepositoryToken(Categoria), useValue: repository },
      ],
    }).compile();
    service = moduleRef.get(CategoriasService);
  });

  it('rejects duplicate category names', async () => {
    repository.findOneBy.mockResolvedValue({
      id: 1,
      nombre: 'Masitas',
      orden: 0,
      activa: true,
    });

    await expect(
      service.create({ nombre: 'Masitas' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('deactivates a category instead of deleting it', async () => {
    const categoria = {
      id: 1,
      nombre: 'Masitas',
      orden: 0,
      activa: true,
    };
    repository.findOneBy.mockResolvedValue(categoria);
    repository.save.mockImplementation(async (value) => value);

    await expect(service.remove(1)).resolves.toMatchObject({ activa: false });
  });
});
