# Backend - Sistema de Gestión de Pedidos (Onal & Nel)

API REST para la gestión de pedidos, clientes y producción de una sastrería/modistería. Construida con **Node.js + Express 5** y **MySQL**.

---

## 📦 Requisitos previos

- [Node.js](https://nodejs.org/) **v18 o superior**
- [MySQL](https://www.mysql.com/) **8.0+**
- Gestor de paquetes: **npm**

---

## 🚀 Instalación

### 1. Clonar el repositorio y acceder al backend

```bash
cd backend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz de `/backend` (o edita el existente) con la siguiente estructura:

```env
# Puerto del servidor
PORT=3000

# Base de datos MySQL
MYSQL_HOST=
MYSQL_PORT=
MYSQL_USER=
MYSQL_PASS=
MYSQL_DATABASE=

# JWT - Access Token
ACCESS_TOKEN_KEY=
ACCESS_TOKEN_EXPIRES_IN=

# JWT - Refresh Token
REFRESH_TOKEN_KEY=
REFRESH_TOKEN_EXPIRES_IN=
```

> ⚠️ Las claves JWT mostradas son de desarrollo. **En producción genera claves nuevas** con:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### 4. Base de datos

Asegúrate de tener MySQL corriendo y la base de datos (`onal&nel-db-v5`) creada. El esquema y los procedimientos almacenados deben estar previamente importados (no incluidos en este repositorio).

### 5. Iniciar el servidor

**Desarrollo** (con recarga automática):
```bash
npm run dev
```

**Producción**:
```bash
npm start
```

El servidor se iniciará en `http://localhost:3000` (o el puerto definido en `PORT`).

---

## 🐳 Docker

También puedes ejecutar el proyecto con Docker:

```bash
# Construir la imagen
docker build -t backend-onal-nel .

# Ejecutar el contenedor (exponiendo en puerto 4000)
docker run -p 4000:3000 --env-file .env backend-onal-nel
```

---

## 🧪 Tests

```bash
npm test
```

Los tests usan **Jest + Supertest**.

---

## 📐 Estructura del proyecto

```
backend/
├── src/
│   ├── app.js                  # Configuración de Express
│   ├── config/
│   │   ├── config.js           # Variables de entorno
│   │   ├── db.js               # Pool de conexión MySQL
│   │   └── server.js           # Inicio del servidor
│   ├── controllers/            # Lógica de los handlers
│   ├── middleware/
│   │   ├── auth.middleware.js   # Verificación JWT
│   │   ├── err.middleware.js    # Manejo de errores
│   │   └── validator.middleware.js
│   ├── models/                 # Consultas a la BD
│   ├── routes/                 # Definición de rutas
│   ├── services/               # Lógica de negocio
│   ├── utils/                  # Utilidades (paginación, IDs, etc.)
│   └── validators/             # Reglas de validación con express-validator
├── Dockerfile
└── package.json
```

---

## 📋 Endpoints

Todas las rutas (excepto `/auth/login` y `/auth/refresh`) requieren autenticación mediante **cookie httpOnly** con el token JWT.

### Autenticación (`/auth`)

| Método | Ruta               | Auth     | Descripción                          | Cuerpo (body)                                        |
|--------|--------------------|----------|--------------------------------------|------------------------------------------------------|
| POST   | `/auth/login`      | ❌ No    | Iniciar sesión                       | `{ "email": "...", "pass": "..." }`                  |
| POST   | `/auth/logout`     | ❌ No    | Cerrar sesión (limpia cookies)       | —                                                    |
| POST   | `/auth/refresh`    | ❌ No    | Refrescar token de acceso            | (usa cookie `refreshToken`)                          |
| GET    | `/auth/perfil`     | ✅ Sí    | Obtener perfil del usuario autenticado | —                                                  |

#### POST `/auth/login`
- **Validación**: `email` (obligatorio, formato email), `pass` (obligatorio, 6-15 caracteres).
- **Respuesta exitosa** (200): Establece cookies `token` y `refreshToken` (httpOnly, sameSite strict). Devuelve:
  ```json
  {
    "user_id": "...",
    "nombres": "...",
    "apellidos": "...",
    "rol": "..."
  }
  ```
- **Errores**: `401` (credenciales inválidas), `403` (usuario bloqueado).

#### POST `/auth/logout`
- **Respuesta** (200): Limpia las cookies `token` y `refreshToken`.

#### POST `/auth/refresh`
- **Respuesta exitosa** (200): Renueva la cookie `token`.

#### GET `/auth/perfil`
- **Respuesta exitosa** (200):
  ```json
  {
    "authenticated": true,
    "user": {
      "user_id": "...",
      "nombres": "...",
      "apellidos": "...",
      "rol": "..."
    }
  }
  ```

---

### Pedidos (`/pedidos`)

| Método | Ruta                                                        | Auth   | Descripción                          |
|--------|-------------------------------------------------------------|--------|--------------------------------------|
| GET    | `/pedidos`                                                  | ✅ Sí  | Obtener todos los pedidos (paginado) |
| POST   | `/pedidos`                                                  | ✅ Sí  | Crear un nuevo pedido                |
| GET    | `/pedidos/:id`                                              | ✅ Sí  | Obtener un pedido por ID             |
| PUT    | `/pedidos/:id`                                              | ✅ Sí  | Actualizar un pedido                 |
| PATCH  | `/pedidos/:id/cancelar`                                     | ✅ Sí  | Cancelar un pedido                   |
| POST   | `/pedidos/:id/detalles`                                     | ✅ Sí  | Agregar detalle a un pedido          |
| DELETE | `/pedidos/:id/detalles/:id_detalle`                         | ✅ Sí  | Eliminar detalle de un pedido        |
| PATCH  | `/pedidos/:id/detalles/:id_detalle`                         | ✅ Sí  | Actualizar detalle de un pedido      |
| POST   | `/pedidos/:id/detalles/:id_detalle/produccion`              | ✅ Sí  | Registrar producción de un detalle   |
| PATCH  | `/pedidos/:id/detalles/:id_detalle/produccion/:id_prod`     | ✅ Sí  | Actualizar estado de producción      |
| DELETE | `/pedidos/:id/detalles/:id_detalle/produccion/:id_prod`     | ✅ Sí  | Eliminar producción                  |

#### GET `/pedidos`
- **Query params**: `?pag=1` (número de página, opcional, default 1).
- **Respuesta** (200): Lista paginada de pedidos con `id`, `descripcion`, `cliente_nombres`, `fecha_estimada`, `estado`, `dias_faltantes`.

#### POST `/pedidos`
- **Body**:
  ```json
  {
    "id_cliente": "string (7-15)",
    "fecha_estimada": "YYYY-MM-DD (opcional, no anterior a hoy)",
    "observaciones": "string (opcional)",
    "recordatorio": "número entero (opcional)",
    "tipo_pedido": "personalizado | retoques | modificaciones (opcional)",
    "descripcion": "string, máx 100 caracteres (opcional)"
  }
  ```
- **Respuesta** (201): `{ "insertId": "...", "status": true }`

#### GET `/pedidos/:id`
- **Respuesta** (200): Objeto con datos completos del pedido incluyendo cliente, usuario, observaciones, fechas.

#### PUT `/pedidos/:id`
- **Body**: Mismos campos que POST, todos opcionales.
- **Respuesta** (200): `{ "status": true, "msg": "Se actualizó con éxito el pedido" }`

#### PATCH `/pedidos/:id/cancelar`
- **Body**:
  ```json
  { "motivo": "string (obligatorio, máx 255 caracteres)" }
  ```
- **Respuesta** (200): `{ "status": true, "msg": "Se ha cancelado el pedido con el código #<id>" }`

---

### Detalles de pedido (`/pedidos/:id/detalles`)

#### POST `/pedidos/:id/detalles`
- **Body** (debe enviar `producto_id` **o** `producto`, no ambos):
  ```json
  {
    "producto_id": "string (existente)",
    "o bien": {
      "producto": {
        "nombre": "string",
        "precio": 10.5,
        "categoria_id": 1
      }
    },
    "cantidad": 1,
    "observacion": "string (opcional)",
    "medidas": [
      { "medida_id": 1, "medida_valor": 42.5 }
    ]
  }
  ```
- **Respuesta** (201): `{ "status": true, "msg": "...", "data": { "detalle_id": "..." } }`

#### DELETE `/pedidos/:id/detalles/:id_detalle`
- **Respuesta** (200): `{ "status": true, "msg": "Detalle de pedido eliminado exitosamente" }`

#### PATCH `/pedidos/:id/detalles/:id_detalle`
- **Body** (todos opcionales):
  ```json
  {
    "cantidad": 2,
    "observacion": "...",
    "producto": { "nombre": "...", "precio": 25.0 },
    "medidas": [
      { "medida_id": 1, "medida_valor": 40.0 }
    ]
  }
  ```
- **Respuesta** (200): `{ "status": true, "msg": "...", "data": {...} }`

---

### Producción (`/pedidos/:id/detalles/:id_detalle/produccion`)

#### POST (registrar producción)
- **Body**:
  ```json
  {
    "producto_id": "string",
    "detalle_id": "string",
    "cantidad": 1
  }
  ```
- **Estados permitidos**: `PENDIENTE`, `EN_PROCESO`, `TERMINADO`, `CANCELADO`.
- **Respuesta** (201): `{ "status": true, "msg": "El detalle del pedido fue agregado a producción." }`

#### PATCH (actualizar producción)
- **Body**:
  ```json
  {
    "cantidad": 2,
    "estado": "EN_PROCESO"
  }
  ```
- **Respuesta** (201): `{ "status": true, "msg": "Estado de producción actualizado correctamente." }`

#### DELETE (eliminar producción)
- **Respuesta** (200): `{ "status": true, "msg": "Producción cancelada correctamente." }`

---

### Clientes (`/clientes`)

| Método | Ruta                    | Auth   | Descripción                       |
|--------|-------------------------|--------|-----------------------------------|
| GET    | `/clientes`             | ✅ Sí  | Obtener todos los clientes        |
| POST   | `/clientes`             | ✅ Sí  | Crear un nuevo cliente            |
| GET    | `/clientes/:id`         | ✅ Sí  | Obtener cliente por ID            |
| PUT    | `/clientes/:id`         | ✅ Sí  | Actualizar un cliente             |
| PATCH  | `/clientes/:id/estado`  | ✅ Sí  | Cambiar estado del cliente        |

#### GET `/clientes`
- **Query params**: `?pagina=1&limite=15` (opcional).
- **Respuesta** (200): Lista paginada de clientes.

#### POST `/clientes`
- **Body**:
  ```json
  {
    "cliente_nombre": "string (requerido, máx 255)",
    "cliente_apellido": "string (requerido, máx 255)",
    "cliente_email": "email (requerido, máx 254)",
    "cliente_direccion": "string (opcional, máx 500)",
    "telefono": [
      { "numero_telefono": "1234567890" }
    ]
  }
  ```
- **Respuesta** (201): Datos del cliente creado.

#### GET `/clientes/:id`
- **Respuesta** (200): Datos del cliente. `404` si no existe.

#### PUT `/clientes/:id`
- **Body**: Mismos campos que POST (sin `cliente_id`).
- **Respuesta** (200): Datos actualizados.

#### PATCH `/clientes/:id/estado`
- **Body**:
  ```json
  { "estado": 1 }
  ```
  `1` = activo, `2` = inactivo/bloqueado.
- **Respuesta** (200): `{ "status": true, "msg": "El cliente fue eliminado" }`

---

### Prueba / Utilidad

| Método | Ruta          | Auth         | Descripción                          |
|--------|---------------|--------------|--------------------------------------|
| GET    | `/prueba`     | ✅ Sí + Admin | Ruta de prueba para verificar acceso admin |

#### GET `/prueba`
- Requiere rol `ADMINISTRADOR`.
- **Respuesta** (200): `"pagina protegida"`.

---

### Usuarios (`/usuarios`)

> ⚠️ Todas las rutas de usuarios requieren rol `ADMINISTRADOR`.

| Método | Ruta                       | Auth            | Descripción                           |
|--------|----------------------------|-----------------|---------------------------------------|
| GET    | `/usuarios`                | ✅ Sí + Admin   | Obtener todos los usuarios            |
| GET    | `/usuarios/:id`            | ✅ Sí + Admin   | Obtener un usuario por ID             |
| POST   | `/usuarios`                | ✅ Sí + Admin   | Crear un nuevo usuario                |
| PUT    | `/usuarios/:id`            | ✅ Sí + Admin   | Actualizar datos de un usuario        |
| PATCH  | `/usuarios/:id/estado`     | ✅ Sí + Admin   | Cambiar estado (activar/bloquear)     |

#### POST `/usuarios`
- **Body**:
  ```json
  {
    "id": "12345678 (numérico, 6-15 caracteres)",
    "nombres": "string (requerido, máx 255)",
    "apellidos": "string (requerido, máx 255)",
    "telefono": "string (requerido, máx 10 caracteres)",
    "correo": "email (requerido)",
    "password": "string (requerido, 6-15 caracteres)",
    "rolId": "número entero (requerido)",
    "supervisorId": "string (opcional)"
  }
  ```
- **Respuesta** (201): `{ "msg": "Usuario creado correctamente" }`
- **Errores**: `400` (rol/supervisor inválido), `409` (ID o correo duplicado).

#### PUT `/usuarios/:id`
- **Body**:
  ```json
  {
    "nombres": "string",
    "apellidos": "string",
    "telefono": "string",
    "correo": "email",
    "rolId": "número entero",
    "supervisorId": "string (opcional)"
  }
  ```
- **Respuesta** (200): `{ "msg": "Usuario actualizado correctamente" }`.
- **Errores**: `404` (usuario no encontrado), `400` (rol/supervisor inválido), `409` (correo duplicado).

#### PATCH `/usuarios/:id/estado`
- **Body**:
  ```json
  { "estado": 1 }
  ```
  `1` = activo, `2` = bloqueado.
- **Respuesta** (200): `{ "msg": "Usuario bloqueado/activado correctamente" }`.
- **Errores**: `404` (usuario no encontrado).

---

## 🔐 Autenticación

El sistema usa **JWT** almacenado en **cookies httpOnly**:

1. **Login**: `POST /auth/login` → establece `token` (access) y `refreshToken`.
2. **Requests protegidos**: el middleware `authValidator` verifica la cookie `token` en cada ruta protegida.
3. **Token expirado**: el cliente debe llamar a `POST /auth/refresh` con la cookie `refreshToken` para obtener un nuevo `token`.
4. **Logout**: `POST /auth/logout` limpia ambas cookies.

### Roles
- **ADMINISTRADOR**: acceso completo, incluyendo rutas de administración (ej. `GET /prueba`).
- Otros roles pueden tener acceso limitado según la lógica de negocio.

---

## ⚙️ Configuración adicional

### CORS
Por defecto se permite el origen `http://localhost:5173` (frontend Vite). Modificar en `src/app.js` si es necesario.

### Variables de entorno
Todas las variables se cargan desde `.env` mediante `dotenv`. Ver `src/config/config.js`.

### Middleware global de errores

El proyecto incluye un **middleware de errores global** (`src/middleware/err.middleware.js`) que captura cualquier error lanzado con `next(err)` en los controladores y devuelve una respuesta JSON uniforme.

#### ¿Cómo funciona?

1. **`AppError`** (`src/utils/appError.js`): clase que extiende `Error` y agrega `statusCode`. Se usa para lanzar errores con código HTTP personalizado:

```js
import { AppError } from '../utils/appError.js';

// En un controlador, dentro de un catch o validación:
next(new AppError('Cliente no encontrado', 404));
next(new AppError('No autorizado', 401));
next(new AppError('Error interno del servidor', 500));
```

2. **`errorMiddleware`** (`src/middleware/err.middleware.js`): se ejecuta después de todas las rutas en `app.js`. Recibe el error y responde:

```json
{
  "success": false,
  "error": "mensaje del error"
}
```

#### ¿Cómo usarlo en un nuevo controlador?

Agrega `next` como tercer parámetro a la función del controlador y, en lugar de responder directamente con `res.status().json()` en los casos de error, llama a `next(new AppError(mensaje, código))`:

```js
// Antes (sin middleware global)
try {
  // ...
} catch (error) {
  res.status(404).json({ error: 'No encontrado' });
}

// Después (con middleware global)
import { AppError } from '../utils/appError.js';

export const miControlador = async (req, res, next) => {
  try {
    // ...
    if (!resultado) {
      return next(new AppError('No encontrado', 404));
    }
    res.json(resultado);
  } catch (error) {
    next(new AppError('Error interno del servidor', 500));
  }
};
```

> ⚠️ El middleware global **no interfiere con las respuestas exitosas** ni con los errores de validación de `express-validator`. Solo captura errores explícitos lanzados con `next(new AppError(...))`.

---

## 📄 Licencia

ISC
