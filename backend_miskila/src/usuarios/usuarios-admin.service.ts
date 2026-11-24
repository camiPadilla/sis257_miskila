import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcryptjs';
import { Like, Repository } from 'typeorm';
import { NEGOCIO_CONFIG } from '../common/config/negocio.config.js';
import { PedidoModelo } from '../database/entities/pedido.entity.js';
import { SancionModelo, TipoSancion } from '../database/entities/sancion.entity.js';
import { EstadoUsuario, RolUsuario, UsuarioModelo } from '../database/entities/usuario.entity.js';

@Injectable()
export class UsuariosAdminService {
  constructor(@InjectRepository(UsuarioModelo) private readonly usuarios: Repository<UsuarioModelo>, @InjectRepository(PedidoModelo) private readonly pedidos: Repository<PedidoModelo>, @InjectRepository(SancionModelo) private readonly sanciones: Repository<SancionModelo>) {}
  list(buscar?: string, rol?: RolUsuario) { return this.usuarios.find({ where: buscar ? [{ celular: Like(`%${buscar}%`) }, { nombreCompleto: Like(`%${buscar}%`) }] : rol ? { rol } : {}, order: { idUsuario: 'DESC' } }); }
  async one(id: number) { const user = await this.usuarios.findOneBy({ idUsuario: id }); if (!user) throw new NotFoundException('La cuenta ya no existe.'); return user; }
  orders(id: number) { return this.pedidos.find({ where: { cliente: { idUsuario: id } }, relations: { capacidadDia: true, detalles: { presentacion: true } }, order: { fechaCompra: 'DESC' } }); }
  async create(data: { celular: string; contrasena: string; rol: RolUsuario }) { if (![RolUsuario.EMPLEADO, RolUsuario.ADMINISTRADOR].includes(data.rol)) throw new ConflictException('Solo se pueden crear cuentas de empleado o administrador.'); if (await this.usuarios.findOneBy({ celular: data.celular })) throw new ConflictException({ codigo: 'CELULAR_YA_REGISTRADO', message: 'Este número ya está registrado.' }); return this.usuarios.save(this.usuarios.create({ celular: data.celular, contrasena: await hash(data.contrasena, 12), rol: data.rol, estado: EstadoUsuario.ACTIVO, nombreCompleto: null })); }
  async suspend(id: number, motivo: string, admin: number) { const user = await this.one(id); user.estado = EstadoUsuario.SUSPENDIDO; await this.usuarios.save(user); return this.sanciones.save(this.sanciones.create({ usuario: user, tipo: TipoSancion.SUSPENSION, motivo, fechaInicio: new Date(), fechaFin: new Date(Date.now() + NEGOCIO_CONFIG.suspensionPagoDias * 86400000), administrador: await this.usuarios.findOneByOrFail({ idUsuario: admin }), activa: true })); }
  async ban(id: number, motivo: string, admin: number, idPedido?: number) { const user = await this.one(id); user.estado = EstadoUsuario.BANEADO; await this.usuarios.save(user); return this.sanciones.save(this.sanciones.create({ usuario: user, tipo: TipoSancion.BANEO, motivo, idPedido: idPedido ?? null, fechaInicio: new Date(), fechaFin: null, administrador: await this.usuarios.findOneByOrFail({ idUsuario: admin }), activa: true })); }
  async lift(id: number) { const user = await this.one(id); user.estado = EstadoUsuario.ACTIVO; await this.usuarios.save(user); await this.sanciones.update({ usuario: { idUsuario: id }, activa: true }, { activa: false }); return user; }
}
