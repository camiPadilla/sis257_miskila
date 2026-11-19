import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Categoria } from '../categorias/entities/categoria.entity.js';
import { Producto } from './entities/producto.entity.js';
import { ProductosService } from './productos.service.js';

describe('ProductosService', () => {
  const productosRepository = {
    find: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
  };
  const categoriasRepository = {
    findOneBy: vi.fn(),
  };
  let service: ProductosService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        ProductosService,
        {
          provide: getRepositoryToken(Producto),
          useValue: productosRepository,
        },
        {
          provide: getRepositoryToken(Categoria),
          useValue: categoriasRepository,
        },
      ],
    }).compile();
    service = moduleRef.get(ProductosService);
  });

  it('rejects products assigned to an inactive category', async () => {
    categoriasRepository.findOneBy.mockResolvedValue({
      id: 1,
      nombre: 'Tortas',
      orden: 0,
      activa: false,
    });

    await expect(
      service.create({
        categoriaId: 1,
        nombre: 'Torta de chocolate',
        precioBs: 45,
        puntos: 100,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('marks a product unavailable instead of deleting it', async () => {
    const producto = {
      id: 1,
      nombre: 'Torta de chocolate',
      disponible: true,
    };
    productosRepository.findOne.mockResolvedValue(producto);
    productosRepository.save.mockImplementation(async (value) => value);

    await expect(service.remove(1)).resolves.toMatchObject({
      disponible: false,
    });
  });
});
