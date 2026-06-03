# 🧵 Onal & Nel — Sistema de Gestión Textil (API REST)

Sistema integral para la gestión de pedidos, clientes, usuarios, ventas, facturación y producción de una sastrería/modistería.  
**API REST** construida con Node.js + Express 5 + MySQL, con arquitectura MVC, notificaciones en tiempo real (Socket.IO) y generación de PDF (Puppeteer).

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
│   ├── dashboard.controller.js   # KPIs, actividades, gráficos
│   ├── dt_pedido.controller.js   # Detalles de pedido
│   ├── dt_venta.controller.js    # Detalles de venta
│   ├── factura.controller.js     # Factura CRUD + PDF
│   ├── pagos.controller.js       # Pagos CRUD + rechazo
│   ├── pedidos.controller.js     # Pedidos CRUD + cancelación
│   ├── produccion.controller.js  # Producción asociada a detalles
│   ├── user.controller.js        # CRUD usuarios (admin)
│   └── ventas.controller.js      # Ventas CRUD + anulación
├── jobs/
│   └── alertas.job.js            # Job programado (node-cron) cada 15 min — verifica pagos vencidos
├── middleware/
│   ├── auth.middleware.js        # JWT validation + role guards (authValidator, isAdmin)
│   ├── err.middleware.js         # Captura global de errores (AppError)
│   └── validator.middleware.js   # Ejecuta validaciones de express-validator
├── models/
│   ├── alertas.models.js         # Alertas: crear, listar (paginado + filtros), actualizar estado
│   ├── cliente.models.js         # Clientes CRUD
│   ├── dashboard.models.js       # KPIs, pedidos por estado, top clientes
│   ├── dt_pedido.models.js       # Detalles de pedido
│   ├── dt_venta.models.js        # Detalles de venta (CRUD + SP ID)
│   ├── factura.models.js         # Factura CRUD (incluye anulación)
│   ├── pagos.models.js           # Pagos: registrar, listar, rechazar
│   ├── pedido.models.js          # Pedidos CRUD + SP cancelación
│   ├── produccion.models.js      # Producción (asignada a detalle de pedido)
│   ├── producto.models.js        # Productos: CRUD con generación de ID y control de stock
│   ├── user.models.js            # Usuarios CRUD (admin)
│   └── ventas.models.js          # Ventas CRUD + SP registro con detalles y pagos
├── routes/
│   ├── alertas.route.js          # [GET /alertas] — listado paginado con filtros
│   ├── cliente.route.js          # CRUD /clientes
│   ├── dashboard.route.js        # /dashboard/resumen
│   ├── index.route.js            # Agrupador de todas las rutas
│   ├── log.route.js              # /auth (login, logout, refresh, perfil)
│   ├── pagos.route.js            # /pagos
│   ├── pedidos.route.js          # /pedidos + /pedidos/:id/detalles + producción
│   ├── user.route.js             # /usuarios (admin)
│   └── ventas.route.js           # /ventas + /ventas/:id/detalles + /ventas/:id/factura
├── services/
│   ├── alertas.service.js        # Lógica de negocio: listar alertas + verificación pagos vencidos
│   ├── auth.service.js           # Login con JWT + refresh token
│   ├── clientes.service.js       # CRUD clientes
│   ├── dashboard.service.js      # KPIs y estadísticas
│   ├── dt_pedido.service.js      # Detalles de pedido
│   ├── dt_venta.service.js       # Detalles de venta
│   ├── factura.service.js        # Factura: CRUD + obtención de datos para PDF
│   ├── pagos.service.js          # Registro y consulta de pagos
│   ├── pedidos.service.js        # Pedidos con filtros y paginación
│   ├── produccion.service.js     # Lógica de producción
│   ├── user.services.js          # CRUD usuarios
│   └── ventas.service.js         # Ventas con filtros, SP, paginación
├── test/                         # Tests unitarios (Jest + Supertest)
│   ├── alertas.test.js           # 10+ tests — alertas paginadas, filtros
│   ├── auth.test.js              # Login, refresh, perfil, logout
│   ├── clientes.test.js          # CRUD clientes
│   ├── factura.test.js           # Factura CRUD + PDF
│   ├── pagos.test.js             # Pagos CRUD + rechazo
│   ├── pedidos.test.js           # Pedidos CRUD + cancelación
│   ├── user.test.js              # CRUD usuarios (admin)
│   └── ventas.test.js            # 41 tests — cobertura completa de ventas
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
    ├── pagos.validator.js        # Pagos: monto, método, referencia
    ├── pedido.validator.js       # Pedido: fechas, cliente, servicios
    ├── produccion.validator.js   # Producción: fecha, responsable
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

> Las alertas se generan automáticamente cada 15 min vía **node-cron** — verifican pagos vencidos desde la vista `vw_pagos_pendientes`. Se emiten en tiempo real por **Socket.IO**.

### Dashboard (`/dashboard`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/dashboard/resumen` | ✅ | KPIs, pedidos por estado, top clientes |

### Pedidos (`/pedidos`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/pedidos` | ✅ | Listar pedidos (paginado + filtros) |
| POST | `/pedidos` | ✅ | Crear pedido |
| GET | `/pedidos/:id` | ✅ | Obtener pedido por ID |
| PUT | `/pedidos/:id` | ✅ | Actualizar pedido |
| PATCH | `/pedidos/:id/cancelar` | ✅ | Cancelar pedido (usa SP) |

**Detalles**: `POST/DELETE/PATCH /pedidos/:id/detalles[/:id_detalle]`  
**Producción**: `POST/PATCH/DELETE /pedidos/:id/detalles/:id_detalle/produccion[/:id_produccion]`

> La fecha estimada (`fecha_estimada`) en pedidos tiene dos restricciones: no puede ser anterior a hoy ni superar 1 año desde hoy (comparación con fecha local del servidor).

### Clientes (`/clientes`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/clientes` | ✅ | Listar clientes |
| POST | `/clientes` | ✅ | Crear cliente |
| GET | `/clientes/:id` | ✅ | Obtener cliente |
| PUT | `/clientes/:id` | ✅ | Actualizar cliente |
| PATCH | `/clientes/:id/estado` | ✅ | Activar/bloquear |

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
| POST | `/ventas/:id/detalles` | ✅ | Agregar detalle a venta (producto, cantidad, precio) |
| DELETE | `/ventas/:id/detalles/:id_detalle` | ✅ | Eliminar detalle (con auditoría: `SET @usuActual`) |

### Factura (`/ventas/:id/factura`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/ventas/:id/factura` | ✅ | Obtener datos de la factura (empresa, cliente, detalle, totales) |
| POST | `/ventas/:id/factura` | ✅ | Crear factura para una venta |
| PATCH | `/ventas/:id/factura/:id_factura/anular` | ✅ | Anular factura |
| GET | `/ventas/:id/factura/pdf` | ✅ | Generar y descargar PDF de la factura |

> La generación de PDF usa **Puppeteer** con un template HTML minimalista (estilo factura). Si la factura no existe, la crea automáticamente antes de generar el PDF.

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
pnpm test
```

Los tests no dependen de la base de datos (servicios mockeados con `jest.unstable_mockModule`).  
Usan **Jest** + **Supertest** para peticiones HTTP simuladas.

### Cobertura de tests (8 archivos)

| Archivo | Tests | Cobertura |
|---------|-------|-----------|
| `ventas.test.js` | **65** | CRUD ventas, detalles, reportes, exportación PDF/Excel, validaciones |
| `alertas.test.js` | ~10 | Listado paginado, filtros por estado/tipo/categoría |
| `auth.test.js` | ~8 | Login exitoso/fallido, refresh token, perfil, logout |
| `clientes.test.js` | ~10 | CRUD clientes, activar/bloquear |
| `factura.test.js` | ~8 | CRUD factura, anulación, generación PDF |
| `pagos.test.js` | ~8 | CRUD pagos, rechazo, filtros |
| `pedidos.test.js` | ~10 | CRUD pedidos, cancelación, validaciones de fecha |
| `user.test.js` | ~8 | CRUD usuarios (admin), activar/bloquear |

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
2. Si hay monto pendiente vencido → crea alerta (evita duplicados por referencia + categoría)
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
