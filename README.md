# 🧵 Onal & Nel — Sistema de Gestión Textil

Sistema integral para la gestión de pedidos, clientes, usuarios y producción de una sastrería/modistería.  
Consta de un **backend API REST** (Node.js + Express 5 + MySQL) y un **frontend SPA** (React + Vite).

---

## 📦 Stack tecnológico

### Backend (`/backend`)

| Dependencia | Versión | Propósito |
|-------------|---------|-----------|
| `express` | ^5.2.1 | Framework HTTP |
| `mysql2` | ^3.22.2 | Conexión a MySQL (pool) |
| `jsonwebtoken` | ^9.0.3 | JWT (access + refresh tokens) |
| `bcryptjs` | ^3.0.3 | Hash de contraseñas |
| `cookie-parser` | ^1.4.7 | Cookies httpOnly |
| `cors` | ^2.8.6 | CORS para frontend |
| `express-validator` | ^7.3.2 | Validación de inputs |
| `dotenv` | ^17.4.2 | Variables de entorno |
| `helmet` | ^8.1.0 | Seguridad HTTP |
| `morgan` | ^1.10.1 | Logs de peticiones |
| `uuid` | ^14.0.0 | Generación de IDs |
| `puppeteer` | ^25.0.2 | Generación de PDFs |
| `exceljs` | ^4.4.0 | Generación de Excel |

**Dev**: `jest` + `supertest` (tests).

### Frontend (`/frontend`)

| Dependencia | Versión | Propósito |
|-------------|---------|-----------|
| `react` | ^19.2.5 | UI |
| `react-router-dom` | ^7.15.0 | Enrutamiento |
| `axios` | ^1.15.2 | HTTP client |
| `framer-motion` | ^12.38.0 | Animaciones |
| `react-icons` | ^5.6.0 | Iconos (Feather) |
| `react-hook-form` | ^7.74.0 | Formularios |
| `react-toastify` | ^11.1.0 | Toast notifications |

**Dev**: `vite` + `@vitejs/plugin-react`.

---

## 🚀 Instalación y ejecución

### Backend

```bash
cd backend
npm install
```

Crear archivo `.env`:

```env
PORT=3000
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASS=
MYSQL_DATABASE=onal&nel-db-v5

ACCESS_TOKEN_KEY= <clave-secreta>
ACCESS_TOKEN_EXPIRES_IN=2h
REFRESH_TOKEN_KEY= <clave-secreta>
REFRESH_TOKEN_EXPIRES_IN=7d
```

```bash
npm run dev    # desarrollo (nodemon)
npm start      # producción
npm test       # tests (Jest + Supertest)
```

### Frontend

```bash
cd frontend
npm install
```

Crear archivo `.env`:

```env
VITE_API_URL=http://localhost:3000/
```

```bash
npm run dev      # desarrollo (Vite)
npm run build    # build producción
npm run preview  # preview del build
```

---

## 🐳 Docker (backend)

```bash
docker build -t backend-onal-nel ./backend
docker run -p 4000:3000 --env-file ./backend/.env backend-onal-nel
```

---

## 📁 Estructura del proyecto

### Backend (`backend/src/`)

```
src/
├── app.js                     # Configuración Express
├── config/
│   ├── config.js              # Variables de entorno
│   ├── db.js                  # Pool MySQL
│   └── server.js              # Inicio del servidor
├── controllers/               # Handlers de rutas
├── middleware/
│   ├── auth.middleware.js     # JWT + roles
│   ├── err.middleware.js      # Error global (AppError)
│   └── validator.middleware.js
├── models/                    # Consultas SQL
├── routes/                    # Definición de rutas
├── services/                  # Lógica de negocio
├── test/                      # Tests unitarios (Jest + Supertest)
├── utils/
│   ├── appError.js            # Clase AppError
│   ├── genId.js               # Generador de IDs
│   ├── normalizacion_datos.js
│   ├── paginacion.js
│   ├── pdfGenerator.js        # Generación de PDFs (Puppeteer)
│   ├── reportesPdf.js         # PDF de reportes de ventas
│   └── reportesExcel.js       # Excel de reportes de ventas
└── validators/                # Reglas express-validator
```

### Frontend (`frontend/src/`)

```
src/
├── api/
│   ├── axiosInstance.js       # Axios + interceptor refresh
│   └── endpoints/             # Endpoints por módulo
├── components/
│   ├── common/                # Card, Button, Input
│   └── ui/
│       ├── feedback/          # Alert, InConstruction, LoadingPages
│       ├── Header/            # Header, NavTabs, UserDropdown, Notifications
│       └── Sidebar/           # Sidebar con roles
├── features/
│   ├── auth/                  # Login, sesión, hooks
│   └── pedidos/               # (en desarrollo)
├── hooks/                     # useDocumentTitle
├── layout/
│   └── MainLayout/            # Layout principal (Header + Sidebar + NavTabs)
├── page/                      # Páginas del sistema
├── routes/                    # Router, PrivateRoute, PublicRoute, AdminRoute
└── utils/                     # session.js (getStoredUser, isAdmin)
```

---

## 🔐 Autenticación

- **Login**: `POST /auth/login` → cookie `token` (access) + `refreshToken`
- **Refresh automático**: El interceptor de Axios captura `401` y llama a `POST /auth/refresh`
- **Logout**: `POST /auth/logout` (limpia cookies)
- **Roles**: `ADMINISTRADOR` (acceso total), otros roles con permisos limitados

### Rutas protegidas

| Tipo | Componente | Redirección |
|------|-----------|-------------|
| Públicas | `PublicRoute` | Si autenticado → `/dashboard` |
| Privadas | `PrivateRoute` | Si no autenticado → `/login` |
| Admin | `AdminRoute` | Si no admin → `/dashboard` |

---

## 🧭 Rutas del frontend

### Públicas
| Ruta | Página |
|------|--------|
| `/login` | Inicio de sesión |

### Privadas (requieren autenticación)
| Ruta | Página | Descripción |
|------|--------|-------------|
| `/dashboard` | Dashboard | KPIs, actividades, gráfico, stock |
| `/pedidos/dash` | Inicio Pedidos | Dashboard de pedidos |
| `/pedidos` | Listado | Tabla de pedidos con búsqueda y filtros |
| `/pedidos/:id` | Detalle | Detalle del pedido |
| `/pedidos/entregas` | Entregas | Gestión de entregas |
| `/gestion-personal` | Gestión | Clientes + Usuarios (admin) |
| `/gestion-clientes` | Clientes | CRUD de clientes |
| `/config` | Configuración | Categorías, Medidas, Copia seguridad |
| `/config/categorias` | Categorías | Administrar categorías |
| `/config/medidas` | Medidas | Administrar medidas |
| `/config/copia-seguridad` | Copia seguridad | Backups |
| `/gestion-usuarios` | Usuarios (admin) | CRUD de usuarios |

---

## 📋 Endpoints del backend

### Autenticación (`/auth`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/auth/login` | ❌ | Iniciar sesión |
| POST | `/auth/logout` | ❌ | Cerrar sesión (limpia cookies) |
| POST | `/auth/refresh` | ❌ | Refrescar access token |
| GET | `/auth/perfil` | ✅ | Perfil del usuario |

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

### Dashboard (`/dashboard`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/dashboard/resumen` | ✅ | KPIs, pedidos por estado, top clientes |
| GET | `/dashboard/pedidos` | ✅ | Dashboard completo de pedidos (indicadores, calendario, producción activa, últimos pedidos) |

### Productos (`/productos`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/productos` | ✅ | Listar productos (paginado + filtros) |
| GET | `/productos/:id` | ✅ | Obtener producto por ID |
| POST | `/productos` | ✅ + Admin | Crear producto |
| PUT | `/productos/:id` | ✅ + Admin | Actualizar producto |
| PATCH | `/productos/:id/estado` | ✅ + Admin | Cambiar estado (1=activo, 2=agotado, 3=inactivo) |

### Materiales (`/materiales`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/materiales` | ✅ | Listar materiales (paginado + filtros) |
| GET | `/materiales/:id` | ✅ | Obtener material por ID |
| POST | `/materiales` | ✅ + Admin | Crear material |
| PUT | `/materiales/:id` | ✅ + Admin | Actualizar material |
| PATCH | `/materiales/:id/estado` | ✅ + Admin | Cambiar estado (DISPONIBLE, AGOTADO, ELIMINADO) |

### Clientes (`/clientes`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/clientes` | ✅ | Listar clientes |
| POST | `/clientes` | ✅ | Crear cliente |
| GET | `/clientes/:id` | ✅ | Obtener cliente |
| PUT | `/clientes/:id` | ✅ | Actualizar cliente |
| PATCH | `/clientes/:id/estado` | ✅ | Activar/bloquear |

### Ventas (`/ventas`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/ventas` | ✅ | Listar ventas (paginado + filtros) |
| POST | `/ventas` | ✅ | Crear venta |
| GET | `/ventas/:id` | ✅ | Obtener venta por ID |
| PATCH | `/ventas/:id` | ✅ | Actualizar venta (descuento, fecha límite) |
| DELETE | `/ventas/:id` | ✅ | Anular venta |

**Reportes de ventas:**

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/ventas/reportes/mensual` | ✅ | Reporte mensual (`?mes=&anio=`) |
| GET | `/ventas/reportes/periodo` | ✅ | Reporte por periodo (`?fechaInicio=&fechaFin=`) |
| GET | `/ventas/reportes/mensual/pdf` | ✅ | Exportar PDF reporte mensual |
| GET | `/ventas/reportes/periodo/pdf` | ✅ | Exportar PDF reporte por periodo |
| GET | `/ventas/reportes/mensual/excel` | ✅ | Exportar Excel reporte mensual |
| GET | `/ventas/reportes/periodo/excel` | ✅ | Exportar Excel reporte por periodo |

### Usuarios (`/usuarios`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/usuarios` | ✅ + Admin | Listar usuarios |
| POST | `/usuarios` | ✅ + Admin | Crear usuario |
| GET | `/usuarios/:id` | ✅ + Admin | Obtener usuario |
| PUT | `/usuarios/:id` | ✅ + Admin | Actualizar usuario |
| PATCH | `/usuarios/:id/estado` | ✅ + Admin | Activar/bloquear |

---

## 🧪 Tests

```bash
# Backend (Jest + Supertest)
cd backend && npm test

# Frontend (si se implementan)
cd frontend && npm test
```

```bash
# Ejecutar tests específicos de un módulo
node --experimental-vm-modules node_modules/jest/bin/jest.js src/test/productos.test.js
node --experimental-vm-modules node_modules/jest/bin/jest.js src/test/materiales.test.js
```

Los tests del backend **no dependen de la base de datos** (servicios mockeados). Actualmente hay tests para:

| Archivo | Tests |
|---------|-------|
| `auth.test.js` | Autenticación |
| `clientes.test.js` | Clientes |
| `pedidos.test.js` | Pedidos (CRUD + detalles + producción) |
| `user.test.js` | Usuarios |
| `productos.test.js` | Productos (CRUD + estado) |
| `materiales.test.js` | Materiales (CRUD + estado) |

---

## ⚙️ Configuración

### CORS
Backend permite origen `http://localhost:5173` (frontend Vite).  
Ajustar en `src/app.js` según entorno.

### Middleware de errores
Todos los controladores usan `next(new AppError(mensaje, código))`.  
El middleware `err.middleware.js` captura y responde con:
```json
{ "status": false, "error": "mensaje" }
```
Los errores internos (MySQL, etc.) solo se muestran en consola.

---

## 📄 Licencia

ISC — Proyecto de gestión textil Onal & Nel.
