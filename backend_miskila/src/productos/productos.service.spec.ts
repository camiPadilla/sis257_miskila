import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductoModelo } from '../database/entities/producto.entity.js';
import { PresentacionModelo } from '../database/entities/presentacion.entity.js';
import { ProductosService } from './productos.service.js';

describe('ProductosService', () => {
  const productosRepository = {
    find: vi.fn(),
    findOneBy: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
  };
  const presentacionesRepository = { find: vi.fn(), findOneBy: vi.fn(), create: vi.fn(), save: vi.fn() };
  let service: ProductosService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        ProductosService,
        {
          provide: getRepositoryToken(ProductoModelo),
          useValue: productosRepository,
        },
        {
          provide: getRepositoryToken(PresentacionModelo),
          useValue: presentacionesRepository,
        },
      ],
    }).compile();
    service = moduleRef.get(ProductosService);
  });

  it('creates a product with the new catalog model', async () => {
    productosRepository.create.mockImplementation((value) => value);
    productosRepository.save.mockImplementation(async (value) => value);

    await expect(service.create({ nombre: 'Torta de chocolate', categoria: 'tortas', pausado: false })).resolves.toMatchObject({
      nombre: 'Torta de chocolate',
    });
  });

  it('pauses a product instead of deleting it', async () => {
    const producto = {
      idProducto: 1,
      nombre: 'Torta de chocolate',
      pausado: false,
    };
    productosRepository.findOneBy.mockResolvedValue(producto);
    productosRepository.save.mockImplementation(async (value) => value);

    await expect(service.update(1, { pausado: true })).resolves.toMatchObject({
      pausado: true,
    });
  });
});
