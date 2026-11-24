import 'reflect-metadata';
import { hash } from 'bcryptjs';
import { AppDataSource } from './data-source.js';
import { ProductoModelo } from './entities/producto.entity.js';
import { PresentacionModelo } from './entities/presentacion.entity.js';
import { UsuarioModelo, RolUsuario, EstadoUsuario } from './entities/usuario.entity.js';

async function seed() {
  await AppDataSource.initialize();
  const usuarios = AppDataSource.getRepository(UsuarioModelo);
  const productos = AppDataSource.getRepository(ProductoModelo);
  const presentaciones = AppDataSource.getRepository(PresentacionModelo);

  const celular = process.env.SEED_ADMIN_CELULAR ?? '70000000';
  const existente = await usuarios.findOneBy({ celular });
  if (!existente) {
    await usuarios.save(usuarios.create({
      celular,
      nombreCompleto: 'Administrador Miskila',
      contrasena: await hash(process.env.SEED_ADMIN_CONTRASENA ?? 'Miskila2026!', 12),
      rol: RolUsuario.ADMINISTRADOR,
      estado: EstadoUsuario.ACTIVO,
    }));
  }

  if ((await productos.count()) === 0) {
    const catalogo = [
      { nombre: 'Masitas', categoria: 'masitas', descripcion: 'Masitas dulces de Miskila.' },
      { nombre: 'Rollos', categoria: 'rollos', descripcion: 'Rollos horneados.' },
      { nombre: 'Empanadas', categoria: 'empanadas', descripcion: 'Empanadas recién elaboradas.' },
      { nombre: 'Pays', categoria: 'pays', descripcion: 'Pays preparados bajo pedido.' },
      { nombre: 'Cupcakes', categoria: 'cupcakes', descripcion: 'Cupcakes decorados.' },
      { nombre: 'Torta tres leches', categoria: 'tortas', descripcion: 'Torta tres leches por tamaño.' },
      { nombre: 'Torta personalizada', categoria: 'tortas', descripcion: 'Cotización personalizada por WhatsApp.' },
    ];
    for (const item of catalogo) {
      const producto = await productos.save(productos.create(item));
      await presentaciones.save(presentaciones.create({
        producto,
        nombre: item.categoria === 'tortas' ? 'Pequeña' : 'Unidad',
        cantidadPersonas: item.categoria === 'tortas' ? 10 : null,
        precio: item.categoria === 'tortas' && item.nombre === 'Torta personalizada' ? null : '25.00',
        puntos: item.categoria === 'tortas' ? 100 : 5,
        activa: true,
      }));
    }
  }
  await AppDataSource.destroy();
}

seed().catch(async (error) => {
  console.error(error);
  if (AppDataSource.isInitialized) await AppDataSource.destroy();
  process.exitCode = 1;
});
