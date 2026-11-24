## Resumen del negocio

Miskila trabaja exclusivamente bajo pedido: no hay stock de productos terminados ni control de insumos. La capacidad se controla con puntos por presentación y un límite diario de 500 puntos por defecto. El pago es únicamente por QR; el comprobante enviado por WhatsApp es opcional y la verificación depende de que el dinero llegue.

La entrega puede ser a domicilio por Bs 13 o retiro en el área de producción de Miskila sin costo. La modalidad se elige una sola vez al comprar. El contacto manual del negocio es [https://wa.link/m0juem](https://wa.link/m0juem).

## Reglas del negocio

- Las compras se realizan de lunes a viernes, de 9:00 a 18:00; a las 18:00 exactas la compra está cerrada.
- Las entregas y retiros se realizan todos los días de 7:00 a 20:00.
- La entrega se programa con mínimo 24 horas exactas y máximo 5 días desde la compra.
- Al presionar **Comprar** se registra el pedido, se crea su pago `pendiente` y se descuentan los puntos.
- El plazo para pagar, cancelar o solicitar reembolso es de 8 horas desde la compra.
- Si no llega el pago y el administrador lo marca después de las 8 horas, el pedido pasa a `no_pagado`, se liberan los puntos y la cuenta se suspende por 7 días.
- Los puntos se devuelven al solicitar un reembolso. Los reembolsos fuera de 9:00 a 18:00 se atienden a primera hora del día siguiente.
- Dos cancelaciones el mismo día suspenden la cuenta durante 24 horas. Los reembolsos no cuentan como cancelaciones.
- Un comprobante falso puede causar un baneo permanente.

### Mensajes de capacidad

- Sin puntos disponibles: **“Nos quedamos sin manos para esta fecha. Vuelve mañana a comprar.”**
- Si solo caben presentaciones pequeñas: **“Solo puedes escoger productos más pequeños. Si quieres más, contacta a Miskila a través de WhatsApp.”**
- No existe un tercer mensaje de cupo por tipo de producto.

### Entidades 

La base de datos contiene `usuario`, `sancion`, `producto`, `presentacion`, `capacidad_dia`, `pedido`, `detalle_pedido`, `pago` y `reembolso`. Las tablas y columnas usan `snake_case`; las propiedades TypeScript usan `camelCase` y se mapean mediante TypeORM.

Los estados de pedido son `pendiente_pago`, `pagado`, `no_pagado`, `cancelado`, `reembolso_solicitado`, `reembolsado` y `entregado`.

Sistema web para gestionar pedidos de postres de Miskila, un negocio de Sucre, Bolivia, que trabaja por encargo y coordina con sus clientes por WhatsApp.

## Descripción del Negocio

**Miskila** elabora y vende masitas, cupcakes, rollos, empanadas, pays, tortas y postres 3 leches, etc. Los clientes realizan pedidos por internet; no hay una tienda física para la atención de ventas. La producción se organiza de acuerdo con los pedidos y la capacidad disponible para cada fecha.

### Características clave del modelo de negocio

1. **Venta por pedido:** los productos se preparan según la demanda y no se controla stock de unidades terminadas.
2. **Capacidad de producción:** cada fecha de entrega tiene inicialmente 500 puntos. Cada producto consume puntos según su tipo y tamaño.
3. **Entrega local:** los pedidos se entregan a domicilio en Sucre por Bs 13 o se recogen en el local sin costo.
4. **Pago por QR:** el cliente paga mediante el QR fijo de Miskila. El comprobante por WhatsApp es opcional; el administrador verifica que el dinero llegue y que el monto sea correcto.
5. **Pedidos personalizados:** el precio de una torta personalizada se acuerda por WhatsApp y el equipo registra el pedido desde el panel.

## Objetivos del Sistema

- Administrar el catálogo mediante CRUD de categorías y productos.
- Permitir registro e inicio de sesión con roles para clientes, empleados y administradores.
- Registrar pedidos con sus productos, cantidades, precios y puntos.
- Validar las fechas de entrega y la capacidad disponible antes de confirmar una compra.
- Dar seguimiento al pago y al estado de cada pedido.

### 1. Categoria

Clasifica los productos del catálogo.

| Campo | Tipo de Dato | Descripción |
|---|---|---|
| `id` | INT (PK) | Identificador de la clasificación. |
| `nombre` | VARCHAR | Nombre, por ejemplo: "Masitas", "Tortas" o "3 leches". |
| `orden` | INT | Posición en que aparece en el catálogo. |
| `activa` | BOOLEAN | Indica si la categoría se muestra. |

### 2. Producto

Productos que los clientes pueden incluir en sus pedidos.

| Campo | Tipo de Dato | Descripción |
|---|---|---|
| `id_producto` | INT (PK) | Identificador único. |
| `nombre` | VARCHAR(100) | Nombre del producto. |
| `descripcion` | VARCHAR(255), NULL | Descripción para el catálogo. |
| `categoria` | VARCHAR(50) | Categoría del producto. |
| `imagen` | VARCHAR(255), NULL | Ruta de la imagen. |
| `pausado` | BOOLEAN | Indica si el administrador pausó el producto. |

### 3. Usuario

Clientes, empleados y administradores del sistema.

| Campo | Tipo de Dato | Descripción |
|---|---|---|
| `id_usuario` | INT (PK) | Identificador único. |
| `celular` | VARCHAR | Número boliviano único; se usa para iniciar sesión. |
| `contrasena` | VARCHAR(255) | Contraseña almacenada mediante hash, nunca en texto plano. |
| `nombre_completo` | VARCHAR | Nombre del usuario; obligatorio para continuar tras el primer ingreso. |
| `rol` | VARCHAR | `cliente`, `empleado` o `administrador`. |
| `estado` | VARCHAR | `activo`, `suspendido` o `baneado`. |
| `fecha_registro` | TIMESTAMP | Fecha y hora de creación de la cuenta. |

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
| `estado` | VARCHAR | `pendiente_pago`, `pagado`, `no_pagado`, `cancelado`, `reembolso_solicitado`, `reembolsado` o `entregado`. |
| `comprado_el` | TIMESTAMP | Fecha y hora de creación del pedido. |
| `limite_pago` | TIMESTAMP | Plazo de 8 horas desde la compra. |
| `listo` | BOOLEAN | Marca interna para empleados y administradores. |
| `fecha_cancelacion` | TIMESTAMP | Fecha de cancelación, si corresponde. |

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

### 7. Reembolso

Devolución de dinero de un pedido con pago verificado. El reembolso puede estar `solicitado` o `realizado`.

| Campo | Tipo de Dato | Descripción |
|---|---|---|
| `id_reembolso` | INT (PK) | Identificador único. |
| `id_pedido` | INT (FK) | Pedido correspondiente. |
| `monto` | DECIMAL(10,2) | Monto devuelto. |
| `estado` | VARCHAR | `solicitado` o `realizado`. |
| `fecha_solicitud` | TIMESTAMP | Fecha de solicitud. |
| `fecha_realizado` | TIMESTAMP | Fecha de devolución, si corresponde. |
| `id_gestor` | INT (FK) | Administrador que gestionó el reembolso. |
| `observacion` | VARCHAR | Observaciones. |

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
- Las entregas y retiros se programan todos los días de 7:00 a 20:00.
- La entrega se programa con al menos 24 horas de anticipación y hasta 5 días adelante.
- Cada fecha dispone inicialmente de 500 puntos. Un pedido normal no puede superar ese límite.
- Se permiten varios pedidos pendientes de pago por cliente.
- Domicilio dentro de Sucre cuesta Bs 13; el retiro no tiene costo. La modalidad no se cambia después de comprar.
- Las tortas personalizadas se cotizan por WhatsApp y el equipo registra el pedido con el precio acordado.
- El cliente paga con el QR fijo de Miskila. El comprobante por WhatsApp es opcional; el administrador verifica el depósito.
- La zona horaria del sistema es `America/La_Paz`.

## Tecnologías y estructura requerida

- Base de datos: PostgreSQL, `sis257_miskila`.
- Backend: NestJS, TypeORM, validaciones y JWT, en `backend_miskila`.
- Frontend: Vue.js, Axios y plantilla Bootstrap, en `frontend_miskila`.
- Directorio raíz y repositorio: `sis257_miskila`.
- Documentación de la API: Swagger.
