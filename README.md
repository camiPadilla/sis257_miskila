# Miskila - Sistema de pedidos en línea

Sistema web para gestionar pedidos de postres de Miskila, un negocio de Sucre, Bolivia, que trabaja por encargo y coordina con sus clientes por WhatsApp.

## Descripción del Negocio

**Miskila** elabora y vende masitas, cupcakes, rollos, empanadas, pays, tortas y postres 3 leches, etc. Los clientes realizan pedidos por internet; no hay una tienda física para la atención de ventas. La producción se organiza de acuerdo con los pedidos y la capacidad disponible para cada fecha.

### Características clave del modelo de negocio

1. **Venta por pedido:** los productos se preparan según la demanda y no se controla stock de unidades terminadas.
2. **Capacidad de producción:** cada fecha de entrega tiene inicialmente 500 puntos. Cada producto consume puntos según su tipo y tamaño.
3. **Entrega local:** los pedidos se entregan a domicilio en Sucre por Bs 13 o se recogen en el local sin costo.
4. **Pago por QR:** el cliente paga mediante el QR fijo de Miskila y envía el comprobante por WhatsApp. El administrador verifica el depósito.
5. **Pedidos personalizados:** el precio de una torta personalizada se acuerda por WhatsApp y el equipo registra el pedido desde el panel.

## Objetivos del Sistema

- Administrar el catálogo mediante CRUD de categorías y productos.
- Permitir registro e inicio de sesión con roles para clientes, empleados y administradores.
- Registrar pedidos con sus productos, cantidades, precios y puntos.
- Validar las fechas de entrega y la capacidad disponible antes de confirmar una compra.
- Dar seguimiento al pago y al estado de cada pedido.

---

## Modelo de Datos (Entidades y Campos Tentativos)

La estructura inicial de la base de datos PostgreSQL se propone a continuación. Los campos y relaciones se revisarán antes de generar las entidades del backend.

### 1. Categoria

Clasifica los productos del catálogo.

| Campo | Tipo de Dato | Descripción |
|---|---|---|
| `id` | INT (PK) | Identificador único. |
| `nombre` | VARCHAR | Nombre, por ejemplo: "Masitas", "Tortas" o "3 leches". |
| `orden` | INT | Posición en que aparece en el catálogo. |
| `activa` | BOOLEAN | Indica si la categoría se muestra. |

### 2. Producto

Productos que los clientes pueden incluir en sus pedidos.

| Campo | Tipo de Dato | Descripción |
|---|---|---|
| `id` | INT (PK) | Identificador único. |
| `categoria_id` | INT (FK) | Categoría a la que pertenece. |
| `nombre` | VARCHAR | Nombre y tamaño del producto. |
| `descripcion` | TEXT | Descripción para el catálogo. |
| `foto` | VARCHAR | Ruta o URL de la imagen. |
| `precio_bs` | DECIMAL | Precio de venta en bolivianos. |
| `puntos` | INT | Capacidad de producción consumida por unidad. |
| `disponible` | BOOLEAN | Indica si se aceptan pedidos para este producto. |
| `es_personalizada` | BOOLEAN | Indica si se cotiza y registra desde el panel. |
| `orden` | INT | Posición en que aparece dentro de la categoría. |

### 3. Usuario

Clientes, empleados y administradores del sistema.

| Campo | Tipo de Dato | Descripción |
|---|---|---|
| `id` | INT (PK) | Identificador único. |
| `celular` | VARCHAR | Número boliviano único; se usa para iniciar sesión. |
| `contrasena_cifrada` | VARCHAR | Contraseña almacenada mediante hash, nunca en texto plano. |
| `nombre_completo` | VARCHAR | Nombre del usuario; obligatorio para continuar tras el primer ingreso. |
| `rol` | VARCHAR | `cliente`, `empleado` o `administrador`. |
| `estado_cuenta` | VARCHAR | `activa`, `suspendida` o `baneada`. |
| `debe_cambiar_contrasena` | BOOLEAN | Indica si debe reemplazar una contraseña temporal. |
| `acepto_terminos_el` | TIMESTAMP | Fecha y hora en que aceptó los términos. |
| `creado_el` | TIMESTAMP | Fecha y hora de creación de la cuenta. |

El registro público es solo para clientes. Las cuentas del equipo las crea un administrador.

### 4. Pedido

Cabecera del pedido y datos de entrega elegidos por el cliente.

| Campo | Tipo de Dato | Descripción |
|---|---|---|
| `id` | INT (PK) | Identificador y número del pedido. |
| `cliente_id` | INT (FK) | Usuario cliente que realiza el pedido. |
| `creado_por_id` | INT (FK) | Usuario que lo registró; puede estar vacío en compras web. |
| `tipo_entrega` | VARCHAR | `domicilio` o `retiro`. |
| `direccion_calle_zona` | VARCHAR | Calle y zona, requeridas para domicilio. |
| `direccion_referencia` | VARCHAR | Referencia para la entrega a domicilio. |
| `fecha_hora_entrega` | TIMESTAMP | Fecha y franja de entrega o retiro. |
| `costo_domicilio_bs` | DECIMAL | Bs 13 para domicilio o Bs 0 para retiro. |
| `total_bs` | DECIMAL | Total fijado al crear el pedido, incluido el costo de domicilio. |
| `puntos_totales` | INT | Puntos consumidos para la fecha de entrega. |
| `estado` | VARCHAR | Estado del pedido, por ejemplo: `por_verificar`, `verificado` o `entregado`. |
| `comprado_el` | TIMESTAMP | Fecha y hora de creación del pedido. |
| `pagar_antes_de` | TIMESTAMP | Plazo habitual de pago: dos horas desde la compra. |
| `verificar_antes_de` | TIMESTAMP | Plazo habitual para que el administrador verifique el pago: seis horas desde la compra. |
| `verificado_el` | TIMESTAMP | Fecha y hora en que se confirmó el pago. |
| `verificado_por_id` | INT (FK) | Administrador que verificó el pago. |

### 5. DetallePedido

Productos y cantidades que componen cada pedido.

| Campo | Tipo de Dato | Descripción |
|---|---|---|
| `id` | INT (PK) | Identificador único. |
| `pedido_id` | INT (FK) | Pedido al que pertenece. |
| `producto_id` | INT (FK) | Producto solicitado. |
| `cantidad` | INT | Cantidad de unidades solicitadas. |
| `precio_unitario_bs` | DECIMAL | Precio del producto al realizar la compra. |
| `puntos_unitarios` | INT | Puntos del producto al realizar la compra. |
| `nota` | TEXT | Especificación del cliente o precio acordado para una torta personalizada. |

### 6. Pago

Registro de la verificación manual de los pagos recibidos.

| Campo | Tipo de Dato | Descripción |
|---|---|---|
| `id` | INT (PK) | Identificador único. |
| `pedido_id` | INT (FK) | Pedido al que corresponde el pago. |
| `monto_bs` | DECIMAL | Monto recibido en bolivianos. |
| `estado_pago` | VARCHAR | Estado de verificación del pago. |
| `fecha_pago` | TIMESTAMP | Fecha y hora en que se registró el pago. |
| `verificado_por_id` | INT (FK) | Administrador que confirmó el depósito. |

### 7. HistorialPedido

Bitácora de cambios de estado para dar seguimiento a cada pedido.

| Campo | Tipo de Dato | Descripción |
|---|---|---|
| `id` | INT (PK) | Identificador único. |
| `pedido_id` | INT (FK) | Pedido cuyo estado cambió. |
| `estado_anterior` | VARCHAR | Estado antes del cambio. |
| `estado_nuevo` | VARCHAR | Estado después del cambio. |
| `usuario_id` | INT (FK) | Usuario que realizó el cambio; puede estar vacío si fue automático. |
| `fecha_hora` | TIMESTAMP | Fecha y hora del cambio. |
| `nota` | TEXT | Motivo o comentario del cambio. |

### Puntos iniciales por producto

Los puntos representan capacidad de producción; no son visibles para el cliente.

| Producto o tamaño | Puntos |
|---|---:|
| Masita | 1 |
| Empanada | 2 |
| Cupcake | 5 |
| Rollo | 10 |
| Pay | 50 |
| Torta pequeña (10 personas) | 100 |
| Torta (15 a 20 personas) | 150 |
| Torta (25 a 30 personas) | 200 |
| 3 leches (4 a 6 personas) | 50 |
| 3 leches (8 a 10 personas) | 100 |
| 3 leches (15 a 20 personas) | 150 |
| 3 leches (25 a 30 personas) | 200 |
| Torta personalizada pequeña (8 a 10 personas) | 150 |
| Torta personalizada mediana (15 a 20 personas) | 200 |
| Torta personalizada grande (25 a 30 personas) | 250 |

## Reglas iniciales de operación

- Las compras web se habilitan de lunes a viernes, de 9:00 a 18:00. El catálogo sigue visible fuera de ese horario.
- Las entregas y retiros se programan todos los días de 7:00 a 20:00, en franjas de una hora.
- La entrega se programa con al menos 24 horas de anticipación y hasta 5 días adelante.
- Cada fecha dispone inicialmente de 500 puntos. Un pedido normal no puede superar ese límite.
- Se permiten varios pedidos pendientes de pago por cliente.
- Domicilio dentro de Sucre cuesta Bs 13; el retiro no tiene costo. Si un pedido pagado cambia de domicilio a retiro, se registra el reembolso de Bs 13 y el cambio.
- Las tortas personalizadas se cotizan por WhatsApp y el equipo registra el pedido con el precio acordado.
- El cliente paga con el QR fijo de Miskila y envía el comprobante por WhatsApp. El administrador verifica el depósito.
- La zona horaria del sistema es `America/La_Paz`.

## Tecnologías y estructura requerida

- Base de datos: PostgreSQL, `sis257_miskila`.
- Backend: NestJS, TypeORM, validaciones y JWT, en `backend_miskila`.
- Frontend: Vue.js, Axios y plantilla Bootstrap, en `frontend_miskila`.
- Directorio raíz y repositorio: `sis257_miskila`.
- Documentación de la API: Swagger.

Los precios del catálogo, los términos de uso, la política completa de reembolsos y la imagen definitiva del QR se confirmarán antes de completar la implementación.
