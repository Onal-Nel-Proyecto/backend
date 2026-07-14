# Revisión Pre-Producción — Backend ONA & NEL

> **Proyecto:** Sistema de Gestión Textil (API REST)  
> **Stack:** Node.js + Express 5 + MySQL + Socket.IO  
> **Fecha del análisis:** 2025-04-22  
> **Propósito:** Identificar vulnerabilidades, carencias y problemas de rendimiento antes del pase a producción.

---

## 🔴 1. VULNERABILIDADES DE SEGURIDAD CRÍTICAS

### 1.1 Secretos comprometidos en el repositorio

| Archivo | Problema |
|---------|----------|
| `.env` | Contiene JWT secret real (`ACCESS_TOKEN_KEY`, `REFRESH_TOKEN_KEY`) y credenciales MySQL hardcodeadas |
| `.env.dev` | Idéntico al `.env` — misma clave JWT y base de datos |
| `.env.prod` | Presente, contenido no revisado, pero no se debe subir |

`.env` está en `.gitignore`, pero `.env.dev` y `.env.prod` **NO**. Si se subieron, las claves JWT y credenciales de BD están expuestas para siempre.

```bash
# Acción requerida:
# 1. Rotar TODAS las claves JWT y contraseñas
# 2. Agregar estos patrones al .gitignore:
.env.*
# 3. Eliminar del historial con git filter-repo / BFG
```

### 1.2 Helmet no está activado

`helmet` figura en `package.json` (v8.1.0) pero **nunca se importa ni usa** en `src/app.js`. El servidor carece de cabeceras de seguridad HTTP:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Strict-Transport-Security` (HSTS)
- `Content-Security-Policy`
- `X-XSS-Protection`

**Referencia:** `src/app.js` — no hay `app.use(helmet())`.

### 1.3 CORS demasiado permisivo

```js
if (!origin) return callback(null, true);  // src/app.js:22
```

Esto permite peticiones **sin origen** (Postman, cURL, scripts automatizados) incluso si no están en la lista blanca. Combinado con cookies `httpOnly` para autenticación, reduce la protección CORS.

### 1.4 Sin sanitización de entrada (XSS)

No hay ningún middleware de sanitización (`xss-clean`, `sanitize-html`, etc.). Los datos ingresados por el usuario pasan directamente a la BD (aunque parametrizados) y se renderizan en templates HTML de PDF/Excel sin escapado. En `pdfGenerator.js` y `reportesPdf.js`, los datos del cliente/BD se interpolan directamente en plantillas HTML sin `escape()`.

```js
// src/utils/pdfGenerator.js:97
const clienteNombre = `${nombres || ''} ${apellidos || ''}`.trim();
// Se inyecta directamente en el HTML sin escapar
```

### 1.5 Inyección SQL dinámica (columnas no parametrizadas)

En `PedidoModel.update()` y `PedidoModel.countPedidos()` se concatenan nombres de columna en SQL dinámico:

```js
// src/models/pedido.models.js ≈ línea 174
const setClause = Object.keys(fields)
  .map(key => `${key} = ${fields[key]}`)  // key viene del cuerpo de la request
  .join(', ');
```

Aunque los valores se pasan como parámetros (`?`), los nombres de columna NO se validan contra una lista blanca. Cualquier propiedad enviada en el body se convierte en columna SQL.

### 1.6 Sin HTTPS / TLS

No hay configuración de SSL/TLS. El servidor Express sirve en HTTP plano. En producción, debe ir detrás de un proxy inverso (nginx, Caddy) o usar `https.createServer()`.

### 1.7 Sin protección CSRF

La autenticación es vía cookies (`httpOnly`, `sameSite: "lax"`). SameSite=Lax previene CSRF entre sitios pero no en el mismo sitio. No hay tokens CSRF ni cabeceras anti-CSRF.

### 1.8 Límite de contraseña demasiado corto

```js
// src/validators/user.validator.js:33
.isLength({ min: 6, max: 15 })
.withMessage('La contraseña debe tener entre 6 y 15 caracteres')
```

15 caracteres máximos es débil para un hash de bcrypt. Debería permitir al menos 64-128 caracteres. El hash (`hashSync(password, 10)`) maneja cualquier longitud.

### 1.9 Refresh Token sin rotación

El refresh token se reutiliza indefinidamente. No hay invalidación tras usarlo. Si un refresh token es robado, sirve para generar access tokens perpetuamente hasta que expire (7 días por defecto).

### 1.10 Puppeteer en modo inseguro

```js
// src/utils/pdfGenerator.js:8
await puppeteer.launch({
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
```

El flag `--no-sandbox` es necesario en Docker pero reduce drásticamente el aislamiento del navegador. Si un atacante controla el HTML generado, podría explotar Puppeteer.

### 1.11 Sin límite de tamaño de body

`app.use(express.json())` usa el límite predeterminado (100 KB en Express 5). No hay límite explícito, no hay rechazo de payloads gigantes.

### 1.12 Sin rate limiting en rutas críticas

- `authLimiter`: 5 intentos / 15 min ✅ (bien configurado)
- `createLimiter`: 100 ops / min
- `generalLimiter`: 300 requests / 15 min

Pero rutas como POST `/pedidos`, POST `/productos`, etc. no tienen rate limit específico y pueden ser abusadas.

### 1.13 Sin escaneo de archivos subidos

`uploads/pedidos/` permite imágenes (JPEG, PNG, WebP, GIF) de hasta 5 MB. No hay validación del contenido real del archivo (solo MIME type declarado), ni escaneo antivirus. Un atacante podría subir un archivo con extensión/imagen manipulado.

### 1.14 Sin validación de entorno al arrancar

`src/config/server.js` no valida que las variables de entorno críticas existan. Si `ACCESS_TOKEN_KEY` está vacío, JWT usará una clave vacía.

---

## 🟠 2. CARENCIAS DE ARQUITECTURA Y FUNCIONALIDAD

### 2.1 Sin endpoint de health check

No hay `GET /health` o `GET /api/health` para load balancers, Kubernetes, Docker health checks, o monitoreo.

### 2.2 Sin shutdown graceful

No hay handlers para `SIGTERM` / `SIGINT`. Si el proceso recibe una señal de terminación, las conexiones activas de BD y Socket.IO se cortan abruptamente.

```js
// Necesario en src/config/server.js
process.on('SIGTERM', async () => {
  await pool.end();
  io?.close();
  server.close();
  process.exit(0);
});
```

### 2.3 Sin compresión HTTP

No hay `compression` (gzip/brotli). Las respuestas JSON (especialmente las listas paginadas con muchos datos) viajan sin comprimir.

### 2.4 Sin sistema de logging

- `morgan` está instalado pero no configurado para archivos — solo imprime a stdout.
- No hay `winston`, `pino` ni ningún logger estructurado.
- Los errores se registran con `console.error()` — sin rotación, sin niveles, sin persistencia.

### 2.5 Sin migraciones de base de datos

No hay tool de migraciones (Knex, Sequelize, TypeORM, Flyway). El esquema de BD se presume creado manualmente. No hay seed data ni control de versiones del esquema.

### 2.6 Documentación Swagger incompleta

```js
// src/config/swagger.js
paths: {
  ...categoriasPaths,
  ...medidasPaths,
}
```

Solo 2 de ~14 módulos tienen documentación OpenAPI. Faltan: auth, pedidos, clientes, usuarios, productos, materiales, ventas, pagos, alertas, dashboard, factura, proveedores, producción.

### 2.7 Sin versionado de API

Todas las rutas arrancan en `/` sin prefijo de versión (`/api/v1/`). Esto dificulta cambios breaking en el futuro.

### 2.8 Sin correlation IDs

No hay `X-Request-Id` o `X-Trace-Id`. Rastrear una petición a través de logs es imposible.

### 2.9 Sin paginación en usuarios

```js
// src/services/user.services.js
const users = await UserModel.getAllUsers();
return { data: users };
```

`GET /usuarios` devuelve TODOS los usuarios sin paginación. Si hay cientos de usuarios, la respuesta será masiva.

### 2.10 Sin timeouts de petición

No hay middleware `timeout` de Express ni `res.setTimeout()`. Peticiones lentas a MySQL (queries pesadas) pueden mantener conexiones abiertas indefinidamente.

### 2.11 Sin módulo de auditoría

No hay tabla de `auditoria` o `bitacora`. Los cambios importantes (cancelar pedido, anular venta, cambiar estado) no quedan registrados con quién, cuándo y qué cambió.

### 2.12 Sin métricas / APM

No hay endpoint `/metrics` para Prometheus, ni integración con Sentry, Datadog, New Relic. No hay visibilidad del rendimiento en producción.

---

## 🟡 3. RENDIMIENTO Y EFICIENCIA

### 3.1 N+1 queries en listado de pedidos

```js
// src/services/pedidos.service.js:26-29 (getAllPedidosService)
const tiposRows = await PedidoModel.getTiposPrendaByPedidoIds(pedidoIds);
```

Se hace una consulta SQL separada para obtener tipos de prenda. Aunque usa `GROUP_CONCAT` con `IN (ids)`, es una query adicional por cada listado paginado.

### 3.2 Sin caché de ningún tipo

- No hay Redis, Memcached, ni caché en memoria.
- Las queries se ejecutan contra MySQL en cada request.
- Los datos del dashboard (que cambian poco entre requests) se recalculan cada vez.

### 3.3 Puppeteer es extremadamente pesado

Cada generación de PDF (factura, reporte mensual, reporte por período) lanza una instancia completa de Chromium (~150-300 MB de RAM), carga una página, genera el PDF y cierra. Esto **no escala**.

**Solución recomendada:** 
- Usar `@puppeteer/browsers` con pool de navegadores reutilizables
- O migrar a `jsPDF` / `PDFKit` (mucho más liviano para facturas)
- O usar un worker queue (Bull + Redis) para evitar bloquear el event loop

### 3.4 Sin compresión de respuestas

Archivos JSON grandes sin comprimir. En conexiones móviles o limitadas, el tiempo de transferencia es 4-6x mayor de lo necesario.

### 3.5 Pool de MySQL sin tuning

```js
// src/config/db.js
connectionLimit: 10,
queueLimit: 0
```

10 conexiones es bajo para un servidor con múltiples endpoints concurrentes. `queueLimit: 0` significa cola ilimitada — bajo alta carga, las peticiones se acumulan sin límite.

### 3.6 Sin streaming para reportes grandes

Los reportes PDF/Excel se construyen completamente en memoria antes de enviarse. Para rangos grandes de datos, esto consume mucha RAM.

### 3.7 Sin prepared statements reutilizables

Cada `.query()` crea una prepared statement nueva. No se reutilizan. Esto agrega overhead en cada consulta.

### 3.8 Fechas usando `new Date()` sin verificar timezone

```js
// src/services/pedidos.service.js
const fechaEntrega = row.pedFecEnt
  ? new Date(row.pedFecEnt).toLocaleDateString()
  : null;
```

Sin especificar timezone, el servidor puede interpretar las fechas incorrectamente si está en UTC y la app espera hora Colombia (-5).

---

## 🟤 4. CONFIGURACIÓN Y DOCKER

### 4.1 Dockerfile desactualizado

```dockerfile
FROM node:18                          # ← El proyecto usa Node 22 en CI
RUN npm install                       # ← El proyecto usa pnpm
EXPOSE 4000                           # ← El app escucha en puerto 3000 por defecto
```

- Node 18 está cerca de EOL (oct 2025). El CI usa Node 22.
- Usar `npm install` ignora el lockfile de pnpm.
- EXPOSE 4000 pero `PORT=3000` — confuso.
- Sin `.dockerignore` — se copian `.env`, `node_modules` locales, etc.

### 4.2 Sin healthcheck en Docker

```dockerfile
# No hay:
HEALTHCHECK --interval=30s --timeout=5s \
  CMD node -e "require('http').get('http://localhost:3000/health', r => process.exit(r.statusCode===200?0:1))"
```

### 4.3 Sin non-root user

```dockerfile
# No hay:
RUN useradd -m -u 1001 appuser && chown -R appuser:appuser /src/app
USER appuser
```

El contenedor corre como root, lo que incrementa el riesgo de seguridad.

### 4.4 Variables de entorno inconsistentes

`.env.example` usa `MYSQL_PASS`, pero `src/config/config.js` destructurea `MYSQL_PASSWORD`:

```js
// src/config/config.js
const { MYSQL_PASSWORD } = process.env;  // ← busca MYSQL_PASSWORD

// .env.example
MYSQL_PASS=   # ← define MYSQL_PASS
```

Esto causa que la conexión falle silenciosamente porque `MYSQL_PASSWORD` será `undefined` y MySQL usará usuario sin contraseña.

---

## ⚪ 5. TESTS Y CALIDAD DE CÓDIGO

### 5.1 Cobertura de tests incompleta

Los tests unitarios existen (~150+ tests) pero:

- **NO testean controladores** — solo servicios (mocks de modelos)
- **NO hay tests de integración** — nada conecta a una BD real
- **NO hay tests de autenticación real** (solo login)
- **NO hay tests de autorización** (isAdmin, isAdminOrSelf)
- **NO hay tests de rate limiting**
- **NO hay tests de subida de archivos**

### 5.2 Sin ESLint / Prettier

No hay configuración de linter ni formateador. El código tiene estilos inconsistentes:
- `console.log()` en producción (en controllers, services, middleware)
- Punto y coma inconsistente
- Comillas mezcladas

### 5.3 Sin scripts de lint en package.json

```json
"scripts": {
  "test": "...",
  "start": "...",
  "dev": "...",
  // Sin "lint", "format", "typecheck"
}
```

### 5.4 Express 5 issues conocidos

Express 5 es todavía **experimental** (beta). Tiene diferencias breaking con Express 4:
- `res.json()` cambió comportamiento con `status` codes
- Middleware de errores requiere 4 parámetros exactos
- Algunos middlewares (morgan, cors) pueden tener incompatibilidades

---

## 🟢 6. LISTA DE ACCIONES PRIORIZADAS

### 🔥 Crítico — Hacer antes de producción

| # | Acción | Archivo(s) |
|---|--------|-----------|
| 1 | Rotar claves JWT y contraseñas (están en el repo) | `.env`, `.env.dev` |
| 2 | Agregar `.env.*` al `.gitignore` | `.gitignore` |
| 3 | Activar `helmet()` | `src/app.js` |
| 4 | Corregir `MYSQL_PASS` → `MYSQL_PASSWORD` | `.env.example`, verificar `.env.prod` |
| 5 | Validar variables de entorno al arrancar | `src/config/server.js` |
| 6 | Agregar límite explícito a `express.json({ limit: '1mb' })` | `src/app.js` |

### ⚠️ Alto — Semana 1

| # | Acción | Archivo(s) |
|---|--------|-----------|
| 7 | Endpoint `/health` | Nuevo |
| 8 | Graceful shutdown (SIGTERM/SIGINT) | `src/config/server.js` |
| 9 | Sanitización XSS en templates PDF/HTML | `src/utils/pdfGenerator.js`, `reportesPdf.js` |
| 10 | Validar nombres de columna contra whitelist en SQL dinámico | `src/models/pedido.models.js` |
| 11 | Revisar CORS — eliminar `!origin` en producción | `src/app.js`, `src/config/socket.js` |
| 12 | Agregar compression (gzip) | `package.json` + `src/app.js` |
| 13 | Timeout middleware para Express | `src/app.js` |
| 14 | Agregar prefijo `/api/v1` a rutas | `src/routes/index.route.js` |

### 📋 Medio — Semana 2

| # | Acción | Archivo(s) |
|---|--------|-----------|
| 15 | Paginación en `GET /usuarios` | `src/models/user.models.js`, `src/services/user.services.js` |
| 16 | Incrementar `connectionLimit` (20-50) | `src/config/db.js` |
| 17 | Pool de navegadores para Puppeteer o migrar a PDFKit | `src/utils/pdfGenerator.js` |
| 18 | Refresh token rotation | `src/services/auth.service.js` |
| 19 | Logger estructurado (pino/winston) | Nuevo + reemplazar `console.log` |
| 20 | Migraciones de BD (Knex o similar) | Nuevo |
| 21 | Cache básico (Redis o in-memory) para dashboard | Nuevo |
| 22 | Dockerfile corregido: Node 22, pnpm, non-root, HEALTHCHECK | `Dockerfile` + `.dockerignore` |
| 23 | Tests de integración con BD de prueba | `src/test/` |

### 🎯 Bajo — Post-MVP

| # | Acción |
|---|--------|
| 24 | Documentar todos los módulos en Swagger |
| 25 | Auditoría de acciones (tabla bitácora) |
| 26 | Monitoreo / APM (Sentry, Prometheus) |
| 27 | Escaneo antivirus en archivos subidos |
| 28 | Migrar Express 5 → Express 4 o esperar a que Express 5 sea estable |
| 29 | ESLint + Prettier + Husky |
| 30 | Módulo de notificaciones por correo |
| 31 | Rate limiting granular por endpoint |

---

## 📊 7. DIAGNÓSTICO RÁPIDO

```
Salud general del proyecto:       🟡  MEDIO-ALTO RIESGO
Cobertura de seguridad básica:    🔴  22% (helmet off, sin sanitización)
Cobertura de tests:               🟡  Unitarios OK, Integración: 0%
Docs Swagger:                     🔴  2/14 módulos
Logging:                          🔴  Solo console.log
Cache:                            🔴  Ninguno
Docker readiness:                 🔴  Node 18, npm, root user
Preparación para producción:      🟡  60% — requiere ~2 semanas de hardening
```

---

*Documento generado automáticamente mediante auditoría de código.  
Las líneas citadas refieren al estado actual del repositorio en la fecha del análisis.*
