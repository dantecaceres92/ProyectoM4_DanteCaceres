# ✅ MateTasks — Gestor estratégico de tareas

SPA de gestión de tareas para empleados de una pequeña empresa (cliente de **MateCode**). Permite registrarse, iniciar sesión, gestionar tareas propias en tiempo real y recibir por email un resumen del estado de las tareas.

🔗 **Producción:** https://proyecto-m4-dante-caceres.vercel.app

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Routing | React Router v6 |
| BaaS | Firebase Authentication (email/password + Google) y Cloud Firestore |
| Email | AWS SES invocado desde una Vercel Function |
| Testing | Vitest + React Testing Library |
| Deploy | Vercel |

## Funcionalidades

- Registro / login con email y contraseña o con Google, logout.
- Sesión persistente (sobrevive a recargas) vía `onAuthStateChanged`.
- Rutas protegidas: `/tasks` no es accesible sin sesión; `/login` y `/register` redirigen a `/tasks` si ya hay sesión.
- Errores de Firebase traducidos a mensajes entendibles.
- CRUD de tareas (título + descripción), marcar como completada, filtros (todas / pendientes / completadas) y estadísticas.
- Sincronización en tiempo real con `onSnapshot` (sin recargar).
- Cada usuario solo ve sus tareas (filtro por `userId` + reglas de Firestore).
- Botón para enviar un email con el resumen de todas las tareas.
- Diseño mobile-first con Flexbox/Grid.

## Estructura del proyecto

```
├─ api/
│  └─ send-summary.ts      # Vercel Function → AWS SES (único lugar con credenciales AWS)
├─ src/
│  ├─ api/                 # Cliente HTTP hacia las Vercel Functions (emailApi)
│  ├─ components/          # UI reutilizable (TaskForm, TaskList, TaskItem, AuthForm, ...)
│  ├─ features/            # Lógica por dominio (auth: AuthContext · tasks: stats/filtros)
│  ├─ hooks/               # useAuth, useTasks
│  ├─ pages/               # Login, Register, Tasks, NotFound
│  ├─ routes/              # AppRouter, ProtectedRoute, PublicOnlyRoute
│  ├─ services/            # Firebase (init), authService, taskService
│  ├─ types/               # Interfaces compartidas (Task, AuthUser, ...)
│  └─ utils/               # Validaciones, traducción de errores, formato
├─ tests/                  # Unit tests + tests de componentes + mocks
├─ firestore.rules         # Reglas de seguridad de Firestore
├─ .env.example            # Plantilla de variables (sin secretos)
└─ vercel.json             # Rewrites para que el router de la SPA funcione en producción
```

> **Nota:** la consigna sugiere `functions/`, pero Vercel solo detecta funciones serverless dentro de `api/` en la raíz. Por eso la función vive en `api/send-summary.ts`.

## Decisiones arquitectónicas

1. **Separación por capas.** Los componentes solo muestran datos. La lógica de negocio vive en hooks (`useTasks`) y las llamadas externas en `services/` y `api/`. Así cada capa se testea por separado mockeando la de abajo.
2. **Estado de sesión global con Context + Observer.** `AuthProvider` se suscribe una vez a `onAuthStateChanged` y expone `{ user, loading }`. El flag `loading` evita redirecciones prematuras mientras Firebase restaura la sesión.
3. **Tiempo real con `onSnapshot`.** `useTasks` se suscribe a `tasks where userId == uid` y devuelve la función `unsubscribe` en el cleanup del `useEffect` para evitar memory leaks. El orden se hace en el cliente para no necesitar un índice compuesto.
4. **Modelo de datos.** Colección `tasks` con documentos `{ userId, title, description, completed, createdAt, updatedAt }`. Las fechas usan `serverTimestamp()`.
5. **Seguridad en dos niveles.** El filtro por `userId` en la query es UX; la seguridad real la dan las **reglas de Firestore** (`firestore.rules`): solo el dueño puede leer/editar/borrar, no puede cambiar el `userId`, y el título debe ser un string no vacío.
6. **Email por backend.** El frontend nunca habla con AWS. Envía su **ID token de Firebase** a `/api/send-summary`; la función lo verifica y manda el email **solo al email del usuario autenticado** (no a una dirección arbitraria, para que el endpoint no se pueda usar para spam). El body se valida y el HTML se escapa.
7. **TypeScript estricto** (`strict: true`), sin `any`.

## Instalación y ejecución local

```bash
git clone https://github.com/TU-USUARIO/gestor-tareas.git
cd gestor-tareas
npm install
cp .env.example .env     # completar con tus valores
npm run dev              # http://localhost:5173 (sin la función de email)
```

Para probar también la función de email en local:

```bash
npm i -g vercel
vercel dev               # levanta el frontend + /api en http://localhost:3000
```

### Scripts

| Script | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Chequeo de tipos + build de producción |
| `npm run test` | Corre todos los tests una vez |
| `npm run test:watch` | Tests en modo watch |

## Variables de entorno

| Variable | Dónde se usa | Descripción |
|---|---|---|
| `VITE_FIREBASE_API_KEY` | Frontend (+ función, para verificar el token) | Config web de Firebase |
| `VITE_FIREBASE_AUTH_DOMAIN` | Frontend | Config web de Firebase |
| `VITE_FIREBASE_PROJECT_ID` | Frontend | Config web de Firebase |
| `VITE_FIREBASE_STORAGE_BUCKET` | Frontend | Config web de Firebase |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Frontend | Config web de Firebase |
| `VITE_FIREBASE_APP_ID` | Frontend | Config web de Firebase |
| `AWS_SES_REGION` | Solo servidor | Región de SES (ej. `us-east-1`) |
| `AWS_SES_ACCESS_KEY_ID` | Solo servidor | Access key de un usuario IAM con permiso `ses:SendEmail` |
| `AWS_SES_SECRET_ACCESS_KEY` | Solo servidor | Secret key de ese usuario IAM |
| `SES_FROM_EMAIL` | Solo servidor | Remitente verificado en SES |

Las variables con prefijo `VITE_` se incluyen en el bundle del navegador (la config web de Firebase es pública por diseño; la protección la dan las reglas). Las de AWS **no** llevan prefijo y solo existen en la función serverless. `.env` está en `.gitignore`.

## Flujo de envío de emails

```
[Botón "Enviarme resumen"]
        │  POST /api/send-summary
        │  Authorization: Bearer <Firebase ID token>
        │  body: { tasks: [{ title, description, completed }] }
        ▼
[Vercel Function api/send-summary.ts]
   1. Valida método (POST) y body
   2. Verifica el ID token con Firebase Identity Toolkit → obtiene el email del usuario
   3. Arma el resumen (pendientes / completadas) en HTML y texto
   4. Envía con AWS SES (SendEmailCommand) usando credenciales del servidor
        ▼
[Respuesta] 200 { sentTo } → la UI muestra éxito · 4xx/5xx { error } → la UI muestra el error
```

> AWS SES en **modo sandbox** solo envía a direcciones verificadas: el remitente y el destinatario deben estar verificados en la consola de SES.

## Testing

`npm run test` — 33 tests, todos con Firebase y la API mockeados (sin llamadas reales):

- **Unitarios:** validaciones, traducción de errores de auth, estadísticas/filtros, armado y validación del resumen de email (incluye escape de HTML).
- **Componentes:** `TaskForm` (validación, envío, edición), `TaskList` (render, toggle, eliminar con confirmación, editar inline), `ProtectedRoute` (loading, redirección, acceso), `SendSummaryButton` (éxito y error).
- **Hook:** `useTasks` (suscripción, **unsubscribe al desmontar**, errores).

## Uso de IA en el desarrollo

Usé un asistente de IA (Claude) como pair programmer senior.

**Prompts principales**
- "Actuá como desarrollador fullstack senior. Con esta consigna [consigna del PI], proponé una arquitectura por capas para React + TS + Firebase + AWS SES + Vercel y generá el código base."
- "¿Por qué no puedo llamar a AWS SES desde el navegador y cómo evito que el endpoint de email se use para spam?"
- "Escribí tests con Vitest + RTL para TaskForm, TaskList, ProtectedRoute y useTasks, mockeando Firebase."

**Cómo influyó y qué decisiones tomé**
- Adopté la separación `services → hooks → components`, que facilitó mockear Firebase en los tests.
- A partir de la discusión de seguridad, decidí verificar el ID token de Firebase en la función y enviar el email solo al usuario autenticado.
- Moví la función de `functions/` a `api/` porque Vercel solo detecta funciones en esa carpeta.
- Un test falló porque el servicio creaba la referencia a la colección al importarse; lo convertí en una función lazy.

**Dónde fue más efectiva:** scaffolding, reglas de Firestore, casos de test y detección de problemas de seguridad.
**Buenas prácticas que descubrí:** dar contexto completo en el prompt (stack + consigna), pedir explicación además del código, y verificar todo corriendo build y tests en vez de confiar ciegamente en la respuesta.
