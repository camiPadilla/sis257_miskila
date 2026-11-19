import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from '../categorias/entities/categoria.entity.js';
import { CreateProductoDto } from './dto/create-producto.dto.js';
import { UpdateProductoDto } from './dto/update-producto.dto.js';
import { Producto } from './entities/producto.entity.js';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private readonly productosRepository: Repository<Producto>,
    @InjectRepository(Categoria)
    private readonly categoriasRepository: Repository<Categoria>,
  ) {}

  async create(createProductoDto: CreateProductoDto): Promise<Producto> {
    const categoria = await this.findActiveCategory(
      createProductoDto.categoriaId,
    );
    const producto = this.productosRepository.create({
      categoria,
      nombre: createProductoDto.nombre.trim(),
      descripcion: createProductoDto.descripcion?.trim() ?? null,
      foto: createProductoDto.foto?.trim() ?? null,
      precioBs: createProductoDto.precioBs.toFixed(2),
      puntos: createProductoDto.puntos,
      disponible: createProductoDto.disponible ?? true,
      esPersonalizada: createProductoDto.esPersonalizada ?? false,
      orden: createProductoDto.orden ?? 0,
    });
    return this.productosRepository.save(producto);
  }

  findAll(): Promise<Producto[]> {
    return this.productosRepository.find({
      relations: { categoria: true },
      order: { orden: 'ASC', nombre: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Producto> {
    const producto = await this.productosRepository.findOne({
      where: { id },
      relations: { categoria: true },
    });
    if (!producto) {
      throw new NotFoundException(`No existe el producto ${id}`);
    }
    return producto;
  }

  async update(
    id: number,
    updateProductoDto: UpdateProductoDto,
  ): Promise<Producto> {
    const producto = await this.findOne(id);

    if (updateProductoDto.categoriaId !== undefined) {
      producto.categoria = await this.findActiveCategory(
        updateProductoDto.categoriaId,
      );
    }
    if (updateProductoDto.nombre !== undefined) {
      producto.nombre = updateProductoDto.nombre.trim();
    }
    if (updateProductoDto.descripcion !== undefined) {
      producto.descripcion = updateProductoDto.descripcion?.trim() ?? null;
    }
    if (updateProductoDto.foto !== undefined) {
      producto.foto = updateProductoDto.foto?.trim() ?? null;
    }
    if (updateProductoDto.precioBs !== undefined) {
      producto.precioBs = updateProductoDto.precioBs.toFixed(2);
    }
    if (updateProductoDto.puntos !== undefined) {
      producto.puntos = updateProductoDto.puntos;
    }
    if (updateProductoDto.disponible !== undefined) {
      producto.disponible = updateProductoDto.disponible;
    }
    if (updateProductoDto.esPersonalizada !== undefined) {
      producto.esPersonalizada = updateProductoDto.esPersonalizada;
    }
    if (updateProductoDto.orden !== undefined) {
      producto.orden = updateProductoDto.orden;
    }

    return this.productosRepository.save(producto);
  }

  async remove(id: number): Promise<Producto> {
    const producto = await this.findOne(id);
    producto.disponible = false;
    return this.productosRepository.save(producto);
  }

  private async findActiveCategory(id: number): Promise<Categoria> {
    const categoria = await this.categoriasRepository.findOneBy({ id });
    if (!categoria) {
      throw new NotFoundException(`No existe la categoría ${id}`);
    }
    if (!categoria.activa) {
      throw new BadRequestException('La categoría seleccionada está inactiva');
    }
    return categoria;
  }
}
