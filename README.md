# Miskila — Sistema web de pedidos

Sistema web para la pastelería Miskila de Sucre, Bolivia. La producción se realiza bajo pedido, la capacidad se controla mediante puntos y el pago se verifica manualmente mediante un QR.

## Funcionalidades

- Registro e inicio de sesión con roles: cliente, empleado y administrador.
- Catálogo de productos y presentaciones.
- Carrito y compra con modalidad de domicilio o retiro.
- Validación de fecha, hora y capacidad diaria.
- Pago por QR, verificación administrativa y reembolsos.
- Historial de pedidos, cancelaciones y solicitudes de reembolso.
- Gestión administrativa de pedidos, productos, presentaciones, capacidad, clientes y reportes.

## Tecnologías

- PostgreSQL 17
- NestJS, TypeORM, JWT, bcrypt y class-validator
- Vue 3, Vite, TypeScript, Axios, Pinia, Vue Router y Bootstrap
- Docker Compose y nginx

## Estructura

```text
sis257_miskila/
├── backend_miskila/    # API REST NestJS
├── frontend_miskila/   # Aplicación Vue
├── ejemplo/            # Proyecto de referencia
├── docker-compose.yml
├── AGENTS.md
└── README.md
```

## Ejecución con Docker

Requisitos: Docker Desktop iniciado.

```powershell
docker compose up --build -d
```

La aplicación queda disponible en:

- Frontend: http://localhost:5173
- Backend: http://localhost:3000/api
- Swagger: http://localhost:3000/api/docs
- PostgreSQL: localhost:5433

El contenedor del backend ejecuta automáticamente las migraciones y el seed inicial.

Para detener los servicios:

```powershell
docker compose down
```

Para eliminar también los datos de PostgreSQL:

```powershell
docker compose down -v
```

## Ejecución local sin Docker para la aplicación

Con PostgreSQL disponible y las variables configuradas en `backend_miskila/.env`:

```powershell
cd backend_miskila
npm.cmd run migration:run
npm.cmd run seed
npm.cmd run start:dev
```

En otra terminal:

```powershell
cd frontend_miskila
npm.cmd run dev
```

## Usuario administrador de prueba

```text
Celular: 70000000
Contraseña: local_admin_password
```

Estas credenciales corresponden al seed local y deben cambiarse antes de publicar el sistema.

## Reglas principales

- Las compras se realizan de lunes a viernes de 09:00 a 18:00.
- La entrega o retiro se programa entre 24 horas y 5 días desde la compra.
- El horario de entrega y retiro es de 07:00 a 20:00.
- El domicilio tiene un costo fijo de 13 Bs.
- El plazo para pagar, cancelar o solicitar reembolso es de 8 horas.
- El QR de pago está en `frontend_miskila/public/images/qrmiskila.jpg`.
- WhatsApp de Miskila: https://wa.link/m0juem

## Comandos de validación

Backend:

```powershell
cd backend_miskila
npm.cmd run build
npm.cmd run lint
npm.cmd test
```

Frontend:

```powershell
cd frontend_miskila
npm.cmd run build
```

## Base de datos

La base de datos se llama `sis257_miskila` y contiene las tablas `usuario`, `sancion`, `producto`, `presentacion`, `capacidad_dia`, `pedido`, `detalle_pedido`, `pago` y `reembolso`.

La documentación funcional y las reglas completas del sistema se encuentran en [AGENTS.md](./AGENTS.md).
