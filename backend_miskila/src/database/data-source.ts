import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { CapacidadDiaModelo } from './entities/capacidad-dia.entity.js';
import { DetallePedidoModelo } from './entities/detalle-pedido.entity.js';
import { PagoModelo } from './entities/pago.entity.js';
import { PedidoModelo } from './entities/pedido.entity.js';
import { PresentacionModelo } from './entities/presentacion.entity.js';
import { ProductoModelo } from './entities/producto.entity.js';
import { ReembolsoModelo } from './entities/reembolso.entity.js';
import { SancionModelo } from './entities/sancion.entity.js';
import { UsuarioModelo } from './entities/usuario.entity.js';
import { InicialMiskila1774300000000 } from './migrations/1774300000000-inicial-miskila.js';

export const entidadesMiskila = [
  UsuarioModelo, SancionModelo, ProductoModelo, PresentacionModelo,
  CapacidadDiaModelo, PedidoModelo, DetallePedidoModelo, PagoModelo, ReembolsoModelo,
];

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5433),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'local_dev_password',
  database: process.env.DB_NAME ?? 'sis257_miskila',
  entities: entidadesMiskila,
  migrations: [InicialMiskila1774300000000],
});
