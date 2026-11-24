import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { entidadesMiskila } from './database/data-source.js';
import { InicialMiskila1774300000000 } from './database/migrations/1774300000000-inicial-miskila.js';
import { AuthModule } from './auth/auth.module.js';
import { ProductosModule } from './productos/productos.module.js';
import { CapacidadModule } from './capacidad/capacidad.module.js';
import { ConfiguracionModule } from './configuracion/configuracion.module.js';
import { PedidosModule } from './pedidos/pedidos.module.js';
import { PagosModule } from './pagos/pagos.module.js';
import { ReembolsosModule } from './reembolsos/reembolsos.module.js';
import { ReportesModule } from './reportes/reportes.module.js';
import { SancionesModule } from './sanciones/sanciones.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const port = Number.parseInt(config.getOrThrow<string>('DB_PORT'), 10);
        if (!Number.isInteger(port) || port < 1 || port > 65535) {
          throw new Error('DB_PORT debe ser un puerto válido entre 1 y 65535');
        }

        return {
          type: 'postgres',
          host: config.getOrThrow<string>('DB_HOST'),
          port,
          username: config.getOrThrow<string>('DB_USERNAME'),
          password: config.getOrThrow<string>('DB_PASSWORD'),
          database: config.getOrThrow<string>('DB_NAME'),
          entities: entidadesMiskila,
          migrations: [InicialMiskila1774300000000],
          migrationsRun: config.get<string>('RUN_MIGRATIONS', 'true') === 'true',
          synchronize: false,
        };
      },
    }),
    AuthModule,
    ProductosModule,
    CapacidadModule,
    ConfiguracionModule,
    PedidosModule,
    PagosModule,
    ReembolsosModule,
    ReportesModule,
    SancionesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
