import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateCategoriaDto } from './dto/create-categoria.dto.js';
import { UpdateCategoriaDto } from './dto/update-categoria.dto.js';
import { Categoria } from './entities/categoria.entity.js';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectRepository(Categoria)
    private readonly categoriasRepository: Repository<Categoria>,
  ) {}

  async create(createCategoriaDto: CreateCategoriaDto): Promise<Categoria> {
    const nombre = createCategoriaDto.nombre.trim();
    await this.assertNameAvailable(nombre);
    const categoria = this.categoriasRepository.create({ nombre });
    if (createCategoriaDto.orden !== undefined) {
      categoria.orden = createCategoriaDto.orden;
    }
    if (createCategoriaDto.activa !== undefined) {
      categoria.activa = createCategoriaDto.activa;
    }
    return this.save(categoria);
  }

  findAll(): Promise<Categoria[]> {
    return this.categoriasRepository.find({
      order: { orden: 'ASC', nombre: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Categoria> {
    const categoria = await this.categoriasRepository.findOneBy({ id });
    if (!categoria) {
      throw new NotFoundException(`No existe la categoría ${id}`);
    }
    return categoria;
  }

  async update(
    id: number,
    updateCategoriaDto: UpdateCategoriaDto,
  ): Promise<Categoria> {
    const categoria = await this.findOne(id);

    if (updateCategoriaDto.nombre !== undefined) {
      const nombre = updateCategoriaDto.nombre.trim();
      await this.assertNameAvailable(nombre, id);
      categoria.nombre = nombre;
    }
    if (updateCategoriaDto.orden !== undefined) {
      categoria.orden = updateCategoriaDto.orden;
    }
    if (updateCategoriaDto.activa !== undefined) {
      categoria.activa = updateCategoriaDto.activa;
    }

    return this.save(categoria);
  }

  async remove(id: number): Promise<Categoria> {
    const categoria = await this.findOne(id);
    categoria.activa = false;
    return this.save(categoria);
  }

  private async assertNameAvailable(
    nombre: string,
    excludedId?: number,
  ): Promise<void> {
    const existing = await this.categoriasRepository.findOneBy({ nombre });
    if (existing && existing.id !== excludedId) {
      throw new ConflictException('Ya existe una categoría con ese nombre');
    }
  }

  private async save(categoria: Categoria): Promise<Categoria> {
    try {
      return await this.categoriasRepository.save(categoria);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.driverError?.code === '23505'
      ) {
        throw new ConflictException('Ya existe una categoría con ese nombre');
      }
      throw error;
    }
  }
}
