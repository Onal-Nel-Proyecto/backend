# 🧵 Onal & Nel — Sistema de Gestión Textil (API REST)

Sistema integral para la gestión de pedidos, clientes, usuarios, ventas, facturación, producción, inventario y alertas de una sastrería/modistería.  
**API REST** construida con Node.js + Express 5 + MySQL, con arquitectura MVC, notificaciones en tiempo real (Socket.IO) y generación de PDF/Excel.

---

## 📦 Stack tecnológico

| Dependencia | Versión | Propósito |
|-------------|---------|-----------|
| `express` | ^5.2.1 | Framework HTTP |
| `mysql2` | ^3.22.2 | Conexión a MySQL (pool con promesas) |
| `jsonwebtoken` | ^9.0.3 | JWT (access + refresh tokens) |
| `bcryptjs` | ^3.0.3 | Hash de contraseñas |
| `cookie-parser` | ^1.4.7 | Cookies httpOnly para tokens |
| `cors` | ^2.8.6 | CORS para frontend |
| `express-validator` | ^7.3.2 | Validación de inputs por ruta |
| `dotenv` | ^17.4.2 | Variables de entorno |
| `helmet` | ^8.1.0 | Seguridad HTTP (cabeceras) |
| `morgan` | ^1.10.1 | Logs de peticiones HTTP |
| `uuid` | ^14.0.0 | Generación de IDs alfanuméricos |
| `socket.io` | ^4.8.3 | Notificaciones en tiempo real (alertas) |
| `puppeteer` | ^25.0.2 | Generación de PDF (facturas y reportes) |
| `exceljs` | ^4.4.0 | Generación de Excel (.xlsx) |
| `node-cron` | ^4.2.1 | Programación de tareas (job de alertas c/15 min) |
| `nodemon` | ^3.1.14 | Recarga automática en desarrollo |

**Dev**: `jest` ^30.3.0 + `supertest` ^7.2.2 (tests), `only-allow` ^1.2.2 (forzar pnpm).

---

## 🚀 Instalación y ejecución

```bash
# El proyecto usa pnpm — instalar globalmente si no lo tienes
npm install -g pnpm

# Instalar dependencias
pnpm install
```

Crear archivo `.env` en la raíz:

```env
PORT=3000
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=onal&nel-db-v5

ACCESS_TOKEN_KEY=<clave-secreta>
ACCESS_TOKEN_EXPIRES_IN=2h
REFRESH_TOKEN_KEY=<clave-secreta>
REFRESH_TOKEN_EXPIRES_IN=7d

FRONT_URL_DEV=http://localhost:5173
FRONT_URL_PROD=https://tudominio.com
```

```bash
pnpm dev       # desarrollo (nodemon)
pnpm start     # producción
pnpm test      # tests (Jest + Supertest)
```

---

## 🐳 Docker

```bash
docker build -t onal-nel-api .
docker run -p 4000:3000 --env-file ./.env onal-nel-api
```

---

## 📁 Estructura del proyecto

```
src/
├── app.js                        # Configuración Express (CORS, cookies, rutas, error middleware)
├── config/
│   ├── config.js                 # Variables de entorno validadas
│   ├── db.js                     # Pool MySQL (mysql2/promise) + connectDB()
│   ├── server.js                 # Punto de entrada: HTTP server + Socket.IO + cron jobs
│   └── socket.js                 # Inicialización y acceso a Socket.IO (initSocket / getIO)
├── controllers/
│   ├── alertas.controller.js     # Listar alertas con filtros (GET)
│   ├── auth.controller.js        # Login, refresh token, perfil
│   ├── cliente.controller.js     # CRUD clientes
│   ├── dashboard.controller.js   # KPIs, dashboard de pedidos
│   ├── dt_pedido.controller.js   # Detalles de pedido
│   ├── dt_venta.controller.js    # Detalles de venta
│   ├── factura.controller.js     # Factura CRUD + PDF
│   ├── materiales.controller.js  # CRUD materiales
│   ├── pagos.controller.js       # Pagos CRUD + rechazo
│   ├── pedidos.controller.js     # Pedidos CRUD + cancelación
│   ├── produccion.controller.js  # Producción asociada a detalles
│   ├── productos.controller.js   # CRUD productos
│   ├── user.controller.js        # CRUD usuarios (admin)
│   └── ventas.controller.js      # Ventas CRUD + reportes + exportación
├── jobs/
│   └── alertas.job.js            # Job programado (node-cron) cada 15 min
├── middleware/
│   ├── auth.middleware.js        # JWT validation + role guards (authValidator, isAdmin)
│   ├── err.middleware.js         # Captura global de errores (AppError)
│   └── validator.middleware.js   # Ejecuta validaciones de express-validator
├── models/
│   ├── alertas.models.js         # Alertas CRUD
│   ├── cliente.models.js         # Clientes CRUD
│   ├── dashboard.models.js       # KPIs, pedidos, dashboard pedidos
│   ├── dt_pedido.models.js       # Detalles de pedido
│   ├── dt_venta.models.js        # Detalles de venta
│   ├── factura.models.js         # Factura CRUD
│   ├── materiales.models.js      # Materiales CRUD
│   ├── pagos.models.js           # Pagos CRUD
│   ├── pedido.models.js          # Pedidos CRUD + SP cancelación
│   ├── produccion.models.js      # Producción
│   ├── producto.models.js        # Productos CRUD
│   ├── user.models.js            # Usuarios CRUD
│   └── ventas.models.js          # Ventas CRUD + SP + reportes
├── routes/
│   ├── alertas.route.js          # [GET /alertas]
│   ├── cliente.route.js          # CRUD /clientes
│   ├── dashboard.route.js        # /dashboard/*
│   ├── index.route.js            # Agrupador de todas las rutas
│   ├── log.route.js              # /auth/*
│   ├── materiales.route.js       # CRUD /materiales
│   ├── pagos.route.js            # /pagos
│   ├── pedidos.route.js          # /pedidos + detalles + producción
│   ├── productos.route.js        # CRUD /productos
│   ├── user.route.js             # /usuarios
│   └── ventas.route.js           # /ventas + reportes + factura
├── services/
│   ├── alertas.service.js        # Lógica de alertas + verificación pagos
│   ├── auth.service.js           # Login JWT + refresh
│   ├── clientes.service.js       # CRUD clientes
│   ├── dashboard.service.js      # KPIs y dashboard pedidos
│   ├── dt_pedido.service.js      # Detalles de pedido
│   ├── dt_venta.service.js       # Detalles de venta
│   ├── factura.service.js        # Factura CRUD + datos PDF
│   ├── materiales.service.js     # CRUD materiales
│   ├── pagos.service.js          # Pagos
│   ├── pedidos.service.js        # Pedidos con filtros
│   ├── produccion.service.js     # Lógica de producción
│   ├── productos.service.js      # CRUD productos
│   ├── user.services.js          # CRUD usuarios
│   └── ventas.service.js         # Ventas + reportes
├── test/                         # Tests unitarios (Jest + Supertest — 150+ tests)
│   ├── alertas.test.js
│   ├── auth.test.js
│   ├── clientes.test.js
│   ├── factura.test.js
│   ├── materiales.test.js
│   ├── pagos.test.js
│   ├── pedidos.test.js
│   ├── productos.test.js
│   ├── user.test.js
│   └── ventas.test.js
├── utils/
│   ├── appError.js               # Clase AppError para errores controlados
│   ├── genId.js                  # Generador de IDs con prefijo (SP en BD)
│   ├── normalizacion_datos.js    # Normalización de inputs (nombres, mayúsculas)
│   ├── paginacion.js             # Helper calculateTotalPages
│   ├── pdfGenerator.js           # Generación de PDF con Puppeteer + HTML template
│   ├── reportesPdf.js            # PDF de reportes de ventas
│   └── reportesExcel.js          # Excel de reportes de ventas
└── validators/                   # Reglas de validación por módulo (express-validator)
    ├── auth.validator.js         # Login: email, password
    ├── cliente.validator.js      # Cliente: nombres, documento, teléfono
    ├── dt_pedido.validator.js    # Detalles de pedido
    ├── factura.validator.js      # Factura
    ├── materiales.validator.js   # Materiales
    ├── pagos.validator.js        # Pagos: monto, método, referencia
    ├── pedido.validator.js       # Pedido: fechas, cliente, servicios
    ├── produccion.validator.js   # Producción: fecha, responsable
    ├── productos.validator.js    # Productos
    ├── user.validator.js         # Usuario: email, rol, contraseña
    └── ventas.validator.js       # Venta: descuento, detalles, pagos
```

---

## 🔐 Autenticación

- **Login**: `POST /auth/login` → cookies `token` (access) + `refreshToken` (httpOnly, secure, SameSite=None)
- **Refresh**: `POST /auth/refresh` → lee `refreshToken` de cookie, devuelve nuevo `token`
- **Logout**: `POST /auth/logout` → limpia ambas cookies
- **Perfil**: `GET /auth/perfil` → datos del usuario autenticado
- **Roles**: `ADMINISTRADOR` (acceso total), otros roles con permisos limitados vía middleware `isAdmin`

---

## 📋 Endpoints del backend

### Autenticación (`/auth`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/auth/login` | ❌ | Iniciar sesión (email + pass) → cookies httpOnly |
| POST | `/auth/logout` | ❌ | Cerrar sesión (limpia cookies) |
| POST | `/auth/refresh` | ❌ | Refrescar access token desde refreshToken cookie |
| GET | `/auth/perfil` | ✅ | Perfil del usuario autenticado |

### Alertas (`/alertas`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/alertas` | ✅ | Listar alertas (paginado + filtros: `estado`, `tipo`, `categoria`) |

> Las alertas se generan automáticamente cada 15 min vía **node-cron** — verifican pagos vencidos. Se emiten en tiempo real por **Socket.IO**.

### Dashboard (`/dashboard`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/dashboard/resumen` | ✅ | KPIs, pedidos por estado, top clientes |
| GET | `/dashboard/pedidos` | ✅ | Dashboard de pedidos (indicadores, calendario, producción activa, últimos pedidos) |

### Pedidos (`/pedidos`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/pedidos` | ✅ | Listar pedidos (paginado + filtros) |
| POST | `/pedidos` | ✅ | Crear pedido |
| GET | `/pedidos/:id` | ✅ | Obtener pedido por ID |
| PUT | `/pedidos/:id` | ✅ | Actualizar pedido |
| PATCH | `/pedidos/:id/cancelar` | ✅ | Cancelar pedido (usa SP) |
| PATCH | `/pedidos/:id/entregar` | ✅ | Entregar pedido (TERMINADO → ENTREGADO) |
| GET | `/pedidos/entregas` | ✅ | Listar pedidos completados |

**Detalles**: `POST/DELETE/PATCH /pedidos/:id/detalles[/:id_detalle]`  
**Producción**: `POST/PATCH/DELETE /pedidos/:id/detalles/:id_detalle/produccion[/:id_produccion]`

### Productos (`/productos`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/productos` | ✅ | Listar productos (paginado + filtros: `nombre`, `estado`, `categoria`, `tipoProducto`). Incluye `resumen` con `total_productos`, `alertas_stock` y `valor_total` del catálogo filtrado |
| GET | `/productos/:id` | ✅ | Obtener producto por ID |
| POST | `/productos` | ✅ + Admin | Crear producto |
| PUT | `/productos/:id` | ✅ + Admin | Actualizar producto |
| PATCH | `/productos/:id/estado` | ✅ + Admin | Cambiar estado (1=activo, 2=agotado, 3=inactivo) |

### Materiales (`/materiales`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/materiales` | ✅ | Listar materiales (paginado + filtros: `nombre`, `estado`, `tipoMaterial`). Incluye `resumen` con `total_stock` (objeto: `{ total, materiales_registrados }`) y `alertas_stock` del inventario filtrado |
| GET | `/materiales/:id` | ✅ | Obtener material por ID |
| POST | `/materiales` | ✅ + Admin | Crear material |
| PUT | `/materiales/:id` | ✅ + Admin | Actualizar material |
| PATCH | `/materiales/:id/estado` | ✅ + Admin | Cambiar estado (DISPONIBLE, AGOTADO, ELIMINADO) |

### Clientes (`/clientes`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/clientes` | ✅ | Listar clientes (paginado + filtro `search`). Cada item incluye `cliente_telefonos` |
| POST | `/clientes` | ✅ | Crear cliente |
| GET | `/clientes/:id` | ✅ | Obtener cliente por ID (incluye `cliente_telefonos`) |
| PUT | `/clientes/:id` | ✅ | Actualizar cliente |
| PATCH | `/clientes/:id/estado` | ✅ | Activar/bloquear |

### Categorías (`/categorias`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/categorias` | ✅ | Listar categorías (paginado) |
| GET | `/categorias/:id` | ✅ | Obtener categoría por ID |
| POST | `/categorias` | ✅ + Admin | Crear categoría |
| PUT | `/categorias/:id` | ✅ + Admin | Actualizar categoría |
| PATCH | `/categorias/:id/estado` | ✅ + Admin | Cambiar estado |

### Medidas (`/medidas`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/medidas` | ✅ | Listar medidas (paginado) |
| GET | `/medidas/:id` | ✅ | Obtener medida por ID |
| POST | `/medidas` | ✅ + Admin | Crear medida |
| PUT | `/medidas/:id` | ✅ + Admin | Actualizar medida |
| PATCH | `/medidas/:id/estado` | ✅ + Admin | Cambiar estado |

### Proveedores (`/proveedores`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/proveedores` | ✅ | Listar proveedores (paginado) |
| GET | `/proveedores?prov_nombre=...` | ✅ | Filtrar por nombre |
| GET | `/proveedores?prov_tipo_suministro=...` | ✅ | Filtrar por tipo de suministro |
| POST | `/proveedores` | ✅ | Crear proveedor (ID generado por SP) |
| GET | `/proveedores/:id` | ✅ | Obtener proveedor + historial de abastecimiento |
| PUT | `/proveedores/:id` | ✅ | Actualizar proveedor |
| DELETE | `/proveedores/:id` | ✅ | Deshabilitar proveedor (→ INACTIVO) |

### Usuarios (`/usuarios`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/usuarios` | ✅ + Admin | Listar usuarios |
| POST | `/usuarios` | ✅ + Admin | Crear usuario |
| GET | `/usuarios/:id` | ✅ + Admin | Obtener usuario |
| PUT | `/usuarios/:id` | ✅ + Admin | Actualizar usuario |
| PATCH | `/usuarios/:id/estado` | ✅ + Admin | Activar/bloquear |

### Ventas (`/ventas`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/ventas` | ✅ | Listar ventas (paginado + filtros por `fecha_registro`, `fecha_limite_pago`, `cliente`) |
| POST | `/ventas` | ✅ | Registrar venta con SP `sp_registrar_venta` (detalles + pagos opcionales) |
| GET | `/ventas/:id` | ✅ | Obtener venta por ID (incluye cliente, usuario y detalles paginados) |
| PATCH | `/ventas/:id` | ✅ | Actualizar descuento y/o fecha límite de pago |
| DELETE | `/ventas/:id` | ✅ | Anular venta (cambia estado a `ANULADO`) |

**Reportes y exportación** (`/ventas/reportes`):

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/ventas/reportes/mensual` | ✅ | Reporte mensual (`?mes=&anio=`) |
| GET | `/ventas/reportes/periodo` | ✅ | Reporte por periodo (`?fechaInicio=&fechaFin=`) |
| GET | `/ventas/reportes/mensual/pdf` | ✅ | Exportar PDF reporte mensual |
| GET | `/ventas/reportes/periodo/pdf` | ✅ | Exportar PDF reporte por periodo |
| GET | `/ventas/reportes/mensual/excel` | ✅ | Exportar Excel reporte mensual |
| GET | `/ventas/reportes/periodo/excel` | ✅ | Exportar Excel reporte por periodo |

**Detalles de venta** (`/ventas/:id/detalles`):

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/ventas/:id/detalles` | ✅ | Agregar detalle a venta |
| DELETE | `/ventas/:id/detalles/:id_detalle` | ✅ | Eliminar detalle |

**Reportes y exportación** (`/ventas/reportes`):

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/ventas/reportes/mensual` | ✅ | Reporte mensual (`?mes=&anio=`) |
| GET | `/ventas/reportes/periodo` | ✅ | Reporte por periodo (`?fechaInicio=&fechaFin=`) |
| GET | `/ventas/reportes/mensual/pdf` | ✅ | Exportar PDF reporte mensual |
| GET | `/ventas/reportes/periodo/pdf` | ✅ | Exportar PDF reporte por periodo |
| GET | `/ventas/reportes/mensual/excel` | ✅ | Exportar Excel reporte mensual |
| GET | `/ventas/reportes/periodo/excel` | ✅ | Exportar Excel reporte por periodo |

### Factura (`/ventas/:id/factura`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/ventas/:id/factura` | ✅ | Obtener datos de la factura |
| POST | `/ventas/:id/factura` | ✅ | Crear factura para una venta |
| PATCH | `/ventas/:id/factura/:id_factura/anular` | ✅ | Anular factura |
| GET | `/ventas/:id/factura/pdf` | ✅ | Generar y descargar PDF de la factura |

> La generación de PDF usa **Puppeteer**. Si la factura no existe, la crea automáticamente antes de generar el PDF.

### Pagos (`/pagos`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/pagos` | ✅ | Listar pagos (filtro por `pedido_id` o `venta_id`, paginado) |
| POST | `/pagos` | ✅ | Registrar un nuevo pago |
| PATCH | `/pagos/:id/rechazar` | ✅ | Rechazar un pago |

> **Métodos de pago válidos**: `EFECTIVO`, `TRANSFERENCIA`, `TARJETA`.

---

## 🧪 Tests

```bash
# Ejecutar todos los tests
pnpm test

# Ejecutar tests de un módulo específico
node --experimental-vm-modules node_modules/jest/bin/jest.js src/test/productos.test.js
node --experimental-vm-modules node_modules/jest/bin/jest.js src/test/materiales.test.js
```

Los tests no dependen de la base de datos (servicios mockeados con `jest.unstable_mockModule`).  
Usan **Jest** + **Supertest** para peticiones HTTP simuladas (150+ tests).

| Archivo | Tests | Cobertura |
|---------|-------|-----------|
| `ventas.test.js` | **65** | CRUD ventas, detalles, reportes, exportación PDF/Excel, validaciones |
| `productos.test.js` | **32** | CRUD productos, filtros, validaciones, estado |
| `materiales.test.js` | **32** | CRUD materiales, filtros, validaciones, estado |
| `pedidos.test.js` | ~10 | CRUD pedidos, cancelación, validaciones de fecha |
| `clientes.test.js` | **24** | CRUD clientes, teléfonos, activar/bloquear |
| `alertas.test.js` | ~10 | Listado paginado, filtros |
| `auth.test.js` | ~8 | Login, refresh, perfil, logout |
| `factura.test.js` | ~8 | CRUD factura, anulación, PDF |
| `pagos.test.js` | ~8 | CRUD pagos, rechazo, filtros |
| `user.test.js` | ~8 | CRUD usuarios, activar/bloquear |

---

## ⚙️ Configuración

### CORS
Backend permite orígenes desde `src/app.js`:
- `http://localhost:5173` (frontend Vite en desarrollo)
- `https://frontend-nine-vert-24.vercel.app` (producción)
- Devtunnel de MS y otros según `FRONT_URL_DEV` / `FRONT_URL_PROD`

### Socket.IO
Los eventos en tiempo real se emiten desde `src/config/socket.js`.  
Usado para notificar creación/resolución de alertas (`nueva-alerta`, `alerta-resuelta`).

### Job programado (cron)
`src/jobs/alertas.job.js` ejecuta `ejecutarVerificacionPagos()` cada **15 minutos**:
1. Consulta la vista `vw_pagos_pendientes`
2. Si hay monto pendiente vencido → crea alerta (evita duplicados)
3. Si ya no hay deuda y hay alerta activa → marca como `RESUELTO`
4. Emite eventos Socket.IO en ambos casos

### Middleware de errores
Todos los controladores usan `next(new AppError(mensaje, código))`.  
El middleware `err.middleware.js` captura y responde con:
```json
{ "status": false, "error": "mensaje" }
```
Los errores internos (MySQL, etc.) se loguean en consola sin exponerse al cliente.

---

## 📄 Licencia

ISC — Proyecto de gestión textil Onal & Nel.
