# Tareas: nucleo

Módulo `nucleo` del [mapa](../../specs/mapa-modulos.md). Spec: [`specs/SPEC-nucleo.md`](../../specs/SPEC-nucleo.md) · Plan: [`plan.md`](plan.md)

**Estado de la lista:** Aprobada (2026-11-24)

Cada tarea termina con:
- `pnpm lint`, `pnpm test --watch=false` y `pnpm build` en verde;
- la verificación indicada;
- un solo commit en la rama `nucleo`, con el código y la actualización de este archivo, la spec y el mapa. En la tabla se marca ✅, sin el hash.

## Estado

| Tarea | Estado | Código | Pruebas unitarias | Verificación manual | Commit |
|---|---|:---:|:---:|:---:|:---:|
| T1. Contrato con la API | Completada | ✅ | ✅ | ✅ | ✅ |
| T2. `SesionService` | Completada | ✅ | ✅ | ➖ | ✅ |
| T3. `ErrorApi` e interceptores | Completada | ✅ | ✅ | ➖ | ✅ |
| T4. Guardas e inicio por rol | Completada | ✅ | ✅ | ➖ | ✅ |
| T5. Rutas, `V-09` y `V-10` | Pendiente | ⬜ | ⬜ | ⬜ | ⬜ |
| T6. Marco | Pendiente | ⬜ | ⬜ | ⬜ | ⬜ |
| T7. Verificación con sesión real y cierre | Pendiente | ⬜ | ➖ | ⬜ | ⬜ |

**Estados de tarea:**
- **Pendiente:** no se ha empezado.
- **En progreso:** se está trabajando en ella.
- **Implementada:** el código está hecho, pero falta alguna columna o la revisión del usuario.
- **Bloqueada:** no puede avanzar; se indica el motivo debajo de la tabla.
- **Completada:** todas las columnas en ✅, ➖ o ⏳.

**Columnas:** ✅ hecho · ⬜ pendiente · ➖ no aplica · ⏳ parte diferida a otro módulo (anotada en sus tareas)

## Verificaciones heredadas

Copiadas del [mapa](../../specs/mapa-modulos.md) al crear esta lista:

| Origen | Verificación | Tarea |
|---|---|---|
| `arquitectura` §3.2 | Al generar los tipos con `pnpm api:tipos`, revisar si algún número del OpenAPI viene como `integer \| string` y ajustar `modelos.ts` | T1: 168 casos (B-06), más los enums como `integer` (B-07). Se corrigen en la API con COR-03 (decisión 4) |
| `arquitectura` §1 | La aplicación funciona en las dos últimas versiones de Chrome, Edge, Firefox y Safari, en escritorio y en celular | T7: Chrome, Edge y Brave. Firefox y Safari pasan a `sistema` (decisión 2) |
| `arquitectura` §8.3 | Lighthouse: carga inicial de 500 kB o menos sin comprimir y LCP menor a 2,5 s, con el perfil de escritorio y el build de producción | T7 |

## Detalle

### T1. Contrato con la API
- Acceptance:
  - `openapi-typescript` 7.13.0 como dependencia de desarrollo exacta, después de verificar la versión con `npm view` (publicada el 2026-02-11, pasa `minimumReleaseAge`).
  - Script `api:tipos` de §11.2 en `package.json`, y `esquema.d.ts` generado y versionado. Prettier y ESLint lo ignoran, porque es generado.
  - COR-03 aplicada en la API (decisión 4) y `esquema.d.ts` regenerado: los 9 enums son uniones de textos y ningún número es `number | string`.
  - `api/modelos.ts`: los alias `TokenResponse`, `PerfilResponse`, `DatosPersonalesResponse`, `Rol`, `ProblemDetails` y `ValidationProblemDetails`, directos, sin tipo utilitario.
  - `api/api-url.ts`: el token `API_URL`, provisto en `app.config.ts` desde `environment.apiUrl`.
  - `api/paginacion.ts`: `Pagina<T>` (`items`, `page`, `pageSize`, `totalCount`, `totalPages`), `ParametrosListado` (`page`, `pageSize`, `search`, `incluirInactivos`) y `aParametros()`.
  - Documentos:
    - B-06 y B-07 en `docs/requerimientos.md` §8 (hecho), y su estado pasa a "Resuelta (COR-03)" cuando la API se corrija.
    - `docs/arquitectura.md` §3.2: el resultado de la revisión de la primera generación (B-06 y B-07, resueltas con COR-03), en lugar de "a revisar".
    - Mapa: `cambiosSinGuardarGuard` y `ConCambiosSinGuardar` en la fila de `componentes` (decisión 1); Firefox y Safari como verificación heredada por `sistema` (decisión 2), y la de §3.2 dada por hecha.
- Verify:
  - `pnpm api:tipos` dos veces seguidas no deja diferencias en git.
  - Prueba de tipos (`expectTypeOf`): `PerfilResponse['usuarioId']` es `number`, `PerfilResponse['personaId']` es `number | null`, y `Rol` es `'Administrador' | 'Estudiante' | 'Profesor'`.
  - Pruebas de `aParametros()`: quita `undefined`, `null` y textos vacíos; convierte `true`, `false` y números a texto.
- Files: `package.json`, `pnpm-lock.yaml`, `src/app/api/esquema.d.ts`, `modelos.ts`, `modelos.spec.ts`, `api-url.ts`, `paginacion.ts`, `paginacion.spec.ts`, `src/app/app.config.ts`, `docs/requerimientos.md`, `docs/arquitectura.md`, `specs/mapa-modulos.md`
- **Resultado (2026-11-24):**
  - `openapi-typescript` 7.13.0 instalado. Solo da el aviso esperado de §1: pide TypeScript 5. `pnpm api:tipos` genera el mismo archivo dos veces seguidas.
  - Con COR-03 en la API: ningún `number | string` y los 9 enums como uniones de textos, con los mismos valores que las tablas de `etiquetas.ts`. `Rol` ya no admite `null`, y `motivoRetiro` y `usuarioRol` siguen anulables.
  - La prueba de tipos de `modelos.spec.ts` falla con `TS2344` si un tipo vuelve a ser `number | string` (comprobado rompiéndola a propósito).
  - `esquema.d.ts` queda fuera de Prettier (`.prettierignore`) y de ESLint (`ignores` en `eslint.config.js`).
  - **Carga inicial (decisión 5 de la spec):** con `API_URL`, el build pasó a 500,12 kB (antes 499,92 kB). Medido: sin el adaptador de fechas en la raíz, 430,56 kB; sin él ni `provideMaterial()`, 301,89 kB. Por decisión del usuario, el adaptador pasa a `provideMaterialVistas()` y `provideMaterial()` (con `material.spec.ts`) se elimina; la duración de los avisos queda para `AvisosService` en `componentes`. `material-vistas.spec.ts` comprueba que registra `AdaptadorFechas`. **Carga inicial: 301,89 kB.**
  - `angular.json` reformateado con Prettier: el commit `582c4d1` (`analytics: false`) había dejado un arreglo en varias líneas y `pnpm formato:revisar` fallaba.
  - `pnpm formato:revisar`, `pnpm lint`, `pnpm test --watch=false` (11 archivos, 74 pruebas) y `pnpm build` en verde.

### T2. `SesionService`
- Acceptance:
  - `api/auth-api.ts` con `cerrarSesion()` (`POST /auth/logout`) y `api/me-api.ts` con `obtenerPerfil()` (`GET /me`), sin lógica.
  - `core/sesion/sesion-service.ts`:
    - signal privado con `accessToken`, `expiraEn`, `rol`, `debeCambiarContrasena` y `nombre`; expone `activa()`, `rol()`, `nombre()`, `cambioPendiente()`, `token()` y `terminada()` (para RUI-09, en `componentes`);
    - `activa()` es falso si `expiraEn` ya pasó (con el reloj inyectable para las pruebas);
    - lee la clave `matricula.sesion` al crearse y descarta la vencida o la que no tenga la forma esperada; escribe con `effect()`, el único uso de `effect()` permitido (§8.1);
    - `iniciar(respuesta: TokenResponse)`: guarda la sesión y, sin cambio pendiente, pide el nombre con `obtenerPerfil()` (nombre y apellidos). Si falla, sigue sin nombre (supuesto 2);
    - `terminar(motivo)`: descarta la sesión y recuerda que terminó;
    - `cerrarSesion()`: descarta la sesión, llama a `POST /auth/logout` con el token que tenía (ignora el error) y navega a `/oferta?aviso=sesion-cerrada` (RFF-04, supuesto 3).
  - `src/testing/`: una `TokenResponse` y un `PerfilResponse` de ejemplo.
- Verify: pruebas de §9 y de la spec: guarda y lee de `sessionStorage`, descarta una sesión vencida y una clave corrupta al arrancar, `iniciar()` reemplaza el token, pide `GET /me` solo sin cambio pendiente, sigue si `GET /me` falla, y `cerrarSesion()` descarta la sesión y navega aunque el logout responda `401` o no responda.
- Files: `src/app/api/auth-api.ts`, `me-api.ts`, `src/app/core/sesion/sesion-service.ts`, `sesion-service.spec.ts`, `src/testing/sesion.ts`
- **Resultado (2026-11-24):**
  - `AuthApi.cerrarSesion()` y `MeApi.obtenerPerfil()`. `obtenerPerfil()` devuelve un `Observable` y no un `httpResource`, porque la usa un servicio fuera de una vista; la consulta de `V-06` la agrega `acceso`.
  - `SesionService` con `token()`, `rol()`, `nombre()`, `cambioPendiente()` y `terminada()` como signals, y `activa()` y `vencida()` como métodos, porque dependen del reloj, que no es un signal. `vencida()` permite que `sesionGuard` distinga la sesión vencida, que lleva el aviso de RFF-03, de la falta de sesión.
  - `core/sesion/reloj.ts`: el token `RELOJ` (`Date.now` por defecto), para probar el vencimiento.
  - `terminar()` no recibe un motivo, como decía el plan: el aviso lo pone en la dirección quien navega (`erroresInterceptor`, `sesionGuard`).
  - `iniciar()` solo pone el nombre si la sesión sigue siendo la misma cuando responde `GET /me`.
  - `cerrarSesion()` envía el logout con el token y descarta la sesión **antes** de la respuesta. Así un `401` del logout no dispara, en T3, la navegación de RFF-03.
  - La sesión guardada se valida al leerla (token, `expiraEn`, rol conocido, booleano y nombre). Si el almacenamiento está bloqueado, se trabaja sin sesión guardada.
  - 19 pruebas nuevas. `pnpm formato:revisar`, `pnpm lint`, `pnpm test --watch=false` (12 archivos, 93 pruebas) y `pnpm build` en verde. La carga inicial no cambia (301,89 kB).

### T3. `ErrorApi` e interceptores
- Acceptance:
  - `api/error-api.ts`: la interfaz `ErrorApi` de §3.5 y `aErrorApi(error: unknown)`, que lee el `ProblemDetails` (`detail`, `code`, `errors`, `traceId`), pone las demás extensiones en `datos`, lee `Retry-After` en segundos, y da `status: 0` sin respuesta o con el tiempo agotado. Nunca copia el cuerpo crudo a `detail` (RUI-05).
  - `core/http/token-interceptor.ts`: `Authorization: Bearer <token>` solo si la URL empieza con `API_URL` y hay sesión activa.
  - `core/http/errores-interceptor.ts`:
    - fija `timeout: 30000` en las peticiones a `API_URL` que no traen otro (§3.1);
    - lanza siempre un `ErrorApi`;
    - `401` de una petición con `Authorization` y con sesión todavía activa: `terminar('sesion-terminada')` y navega a `/iniciar-sesion?volver=<url actual>&aviso=sesion-terminada`;
    - `403` con `code: "RN-24"`: navega a `/cambio-obligatorio`.
  - `app.config.ts`: `provideHttpClient(withInterceptors([tokenInterceptor, erroresInterceptor]))`.
- Verify: pruebas de §9 con `HttpTestingController`:
  - `aErrorApi`: un `400` con `errors`, un `409` con `code` y `usuarioId` en `datos`, un `429` con y sin `Retry-After`, un `500` con `traceId`, el error de red y el tiempo agotado.
  - `tokenInterceptor`: agrega el token a `API_URL`; no lo agrega a otro origen (`https://otro.sitio/…`), ni a `/iconos/…`, ni sin sesión.
  - `erroresInterceptor`: el `401` con token navega con `volver` y `aviso`; el `401` sin token (login) no navega; dos `401` seguidos navegan una sola vez; el `401` del logout después de `cerrarSesion()` no navega a `V-02`; el `403 RN-24` navega a `V-03`; un `403 RN-18` y un `409` no navegan.
- Files: `src/app/api/error-api.ts`, `error-api.spec.ts`, `src/app/core/http/token-interceptor.ts`, `errores-interceptor.ts`, sus `.spec.ts`, `src/app/app.config.ts`, `src/testing/problem-details.ts`
- **Resultado (2026-11-24):**
  - **`ErrorApi` con `name: 'ErrorApi'` y un `message` técnico** (`'HTTP 409 RN-39'`), además de los campos de §3.5. En Angular 22, `httpResource` entrega el error tal cual solo si tiene `name` y `message` de texto; si no, lo envuelve en un `ResourceWrappedError` y `EstadoContenido` tendría que desenvolverlo. `message` nunca se muestra (RUI-05). `esErrorApi()` lo reconoce. Anotado en §3.5 de la arquitectura.
  - `aErrorApi()` lee el cuerpo también si llegó como texto JSON, ignora uno que no es un `ProblemDetails` (p. ej. el HTML de un proxy) y descarta los errores de campo que no son listas de textos. `Retry-After` se lee solo como segundos enteros, que es lo que envía la API.
  - El tiempo agotado: el backend `fetch` de Angular aborta con un `DOMException` `TimeoutError` y lo entrega como `HttpErrorResponse` con `status: 0`. Cuenta como sin respuesta.
  - `esUrlDeLaApi()` (en `api-url.ts`) la usan los dos interceptores: la URL base o algo debajo de ella, no un prefijo parecido (`.../api/v1-falsa`).
  - `erroresInterceptor` solo convierte los errores de la API. Los íconos que descarga Material siguen como `HttpErrorResponse`.
  - El `401` navega solo si la petición llevaba token **y la sesión sigue**. Esa sola condición cubre el login, el logout después de `cerrarSesion()` y varios `401` a la vez. Una mutación que la quita hace fallar 2 pruebas (comprobado).
  - `tokenInterceptor` envía el token aunque haya vencido según `expiraEn`, para que la API responda `401` y se aplique RFF-03.
  - 34 pruebas nuevas. `pnpm formato:revisar`, `pnpm lint`, `pnpm test --watch=false` (15 archivos, 127 pruebas) y `pnpm build` en verde. Carga inicial: 306,72 kB (+4,8 kB: sesión e interceptores).

### T4. Guardas e inicio por rol
- Acceptance:
  - `core/sesion/inicio-rol.ts`: la ruta de inicio de cada rol (§2.2 de los requerimientos, §2.4 de la arquitectura): `/oferta` sin sesión, `/mis-matriculas`, `/mis-grupos`, `/grupos`; y `/cambio-obligatorio` con un cambio pendiente.
  - `core/guardas/`:
    - `sesionGuard`: sin sesión, `/iniciar-sesion?volver=<ruta>`; con la sesión vencida según `expiraEn`, además `aviso=sesion-terminada`; con un cambio pendiente, `/cambio-obligatorio`;
    - `invitadoGuard`: con sesión, la página de inicio del rol;
    - `cambioPendienteGuard`: sin un cambio pendiente, la página de inicio del rol (sin sesión, `V-02`);
    - `rolGuard(...roles)`: sirve como `canActivate` y `canMatch`; con otro rol, `/sin-permiso`;
    - `rutaVolverSegura(valor)`: devuelve la ruta solo si empieza con `/` y no con `//` ni `/\`; si no, `null`.
- Verify: una prueba por fila de §4.3 (salvo las que no son guardas) y los casos de `rutaVolverSegura`: `/grupos/5?pestana=x` aceptada; `//otro.sitio`, `/\otro.sitio`, `https://otro.sitio`, `javascript:…` y vacío rechazados.
- Files: `src/app/core/sesion/inicio-rol.ts`, `src/app/core/guardas/*.ts` y sus `.spec.ts`
- **Resultado (2026-11-24):**
  - `inicio-rol.ts`: `RUTAS` (oferta, inicio de sesión, cambio obligatorio, sin permiso), `INICIO_POR_ROL` y `rutaDeInicio(sesion)`. Con la sesión vencida, la oferta.
  - `sesionGuard` y `rolGuard` sirven como `canActivate` y como `canMatch`. Toman `volver` de `router.currentNavigation()` (el signal que reemplaza a `getCurrentNavigation()`, obsoleto desde Angular 20.2), porque `canMatch` no recibe el `RouterStateSnapshot`. Así `volver` conserva los parámetros también en un área protegida con `canMatch`.
  - `rolGuard` aplica primero la regla de `sesionGuard` (`revisarSesion()`), así sirve sola en un área de un solo rol.
  - `invitadoGuard` y `cambioPendienteGuard` descartan una sesión vencida. `cambioPendienteGuard` no pone `volver`, que sería el propio `V-03`.
  - `rutaVolverSegura()` también rechaza espacios y caracteres de control, que algunos navegadores ignoran al leer la dirección (`/ /otro.sitio`, `/	/otro.sitio`).
  - **El aviso de sesión vencida solo aparece si vence durante el uso:** al arrancar, `SesionService` descarta la vencida sin aviso (§4.1). Dos pruebas fallaron al principio por crear el servicio después de vencer la sesión; se corrigieron las pruebas, no el código. Anotado en §4.3 de la arquitectura.
  - Las pruebas de las guardas navegan con el router real, con rutas de prueba, en lugar de llamar a las funciones con datos simulados.
  - 42 pruebas nuevas. `pnpm formato:revisar`, `pnpm lint`, `pnpm test --watch=false` (18 archivos, 169 pruebas) y `pnpm build` en verde. La carga inicial no cambia (306,72 kB): las guardas aún no están en ninguna ruta.

### T5. Rutas, `V-09` y `V-10`
- Acceptance:
  - `app.routes.ts`: `''` con `redirectTo` a una función que usa `inicio-rol.ts`; `sin-permiso` con `sesionGuard`; `**`. Las dos páginas, con `loadComponent` (en diferido).
  - `core/paginas/sin-permiso/` (`V-09`) y `core/paginas/no-encontrada/` (`V-10`): título, mensaje y un único botón principal a la página de inicio del rol, con los textos del wireframe ("No tiene permiso para ver esta página", "No encontramos esta página"…). Con el foco visible y un `h1` por página.
  - Se borran `src/app/muestra/` y su ruta, y lo que solo usaba la muestra.
- Verify:
  - Pruebas: el enlace de cada página según el rol (visitante solo en `V-10`), y la redirección de `''` con cada rol y con el cambio pendiente.
  - Manual: `pnpm start`; `/una-ruta-inexistente` muestra `V-10` con "Ir a la oferta académica"; la muestra ya no existe.
- Files: `src/app/app.routes.ts`, `src/app/core/paginas/**`, `src/app/muestra/**` (se borra)

### T6. Marco
- Acceptance:
  - `core/marco/menu-opciones.ts`: la lista única de opciones (`ruta`, `etiqueta`, `roles`, `grupo`) de §2.3 de los requerimientos, en el orden de los wireframes, y la función que da las de un rol.
  - `core/marco/`: el componente del marco en `app.html`, alrededor del `<router-outlet>`, con las tres variantes de la spec (visitante, con sesión y cambio pendiente):
    - `mat-toolbar` con el nombre del sistema (enlace a la página de inicio del rol) y, por debajo de 960 px, el botón "Menú" con `aria-label` y `aria-expanded`;
    - `mat-sidenav` fijo (`side`) desde 960 px y plegable (`over`) por debajo, con `BreakpointObserver`; se cierra al navegar en modo plegable;
    - menú de la cuenta (`mat-menu`) con el nombre y la etiqueta del rol (pipe `etiqueta`), Mi perfil, Cambiar contraseña y Cerrar sesión (`SesionService.cerrarSesion()`);
    - opción activa con `routerLinkActive` y `aria-current="page"`;
    - pie de RUI-23 con `environment.nombreInstituto`, el año en la zona del instituto (supuesto 6) y `environment.version`, apilado por debajo de 600 px.
  - Estilos con las variables `--sm-*` de §6.6 (barra `--sm-marca`, menú `--sm-secundario-suave`, opción activa `--sm-secundario-activo`, foco `--sm-foco-sobre-marca` sobre la barra), dentro del presupuesto de estilos por componente (4 kB).
- Verify:
  - Pruebas: las opciones de cada rol coinciden con §2.3 (incluidos los grupos del administrador), el visitante ve sus tres enlaces, el cambio pendiente solo ve "Cerrar sesión", y el texto del pie.
  - `pnpm build` dentro del presupuesto inicial; se anota el tamaño.
  - Manual, sin sesión: el marco del visitante contra `V-02`/`V-10` de los wireframes, a 1280 px y 360 px.
- Files: `src/app/core/marco/**`, `src/app/app.ts`, `app.html`, `app.scss`

### T7. Verificación con sesión real y cierre
- Acceptance:
  - Verificación manual con la API en marcha (supuesto 5): se pide un token con `curl -X POST http://localhost:5022/api/v1/auth/login` para `admin@instituto.local`, `profesor1@prueba.test`, `estudiante1@prueba.test` y `estudiante2@prueba.test` (cambio pendiente), y se escribe en `sessionStorage` la clave `matricula.sesion` con la forma que guarda `SesionService`. Para cada uno:
    - el marco y el menú coinciden con los wireframes, a 1280 px, 800 px (menú plegable) y 360 px sin desplazamiento horizontal;
    - todo se usa con el teclado, con el foco visible;
    - `/sin-permiso` muestra `V-09` con el enlace a la página de inicio del rol. Como ninguna área existe todavía, `rolGuard` sobre una ruta real se verifica en `acceso` (verificación heredada del mapa); aquí lo cubren sus pruebas;
    - "Cerrar sesión" envía `POST /auth/logout`, descarta la clave y navega a `/oferta?aviso=sesion-cerrada`;
    - con un token invalidado (logout desde otra pestaña), la siguiente petición da `401` y navega a `/iniciar-sesion` con `volver` y `aviso`.
  - Navegadores (decisión 2): lo anterior en Chrome, Edge y Brave, más el modo celular de las herramientas.
  - Lighthouse con el build de producción servido en local, perfil de escritorio: carga inicial ≤ 500 kB sin comprimir y LCP < 2,5 s. Resultados anotados aquí.
  - Versión `0.2.0` en `package.json`.
  - Comando de cierre y `pnpm audit` sin hallazgos altos ni críticos (o anotados).
  - Spec, mapa y este archivo al día: módulo completado y criterios de éxito revisados.
- Verify: los 9 criterios de éxito de la spec, y la revisión del marco por el usuario.
- Files: `package.json`, `tasks/nucleo/todo.md`, `specs/SPEC-nucleo.md`, `specs/mapa-modulos.md`

## Historial

- 2026-11-24: lista en revisión.
- 2026-11-24: lista aprobada por el usuario, con un agregado a T1: actualizar §3.2 de la arquitectura. Empieza T1.
- 2026-11-24: T1 bloqueada. El primer `esquema.d.ts` trae los 9 enums como `number` sin valores (B-07), además de los números `integer | string` (B-06). Causa: en `Program.cs` del backend, `JsonStringEnumConverter` está solo en las opciones de MVC, y el OpenAPI lee las de `ConfigureHttpJsonOptions`. El usuario decide corregir ambas en la API (COR-03), y el tipo utilitario de los números se descarta.
- 2026-11-24: COR-03 aplicada en la API (el usuario reinició la instancia de `:5022`). T1 completada, con un cambio decidido por el usuario: el adaptador de fechas y la duración de los avisos salen de la carga inicial (decisión 5 de la spec).
- 2026-11-24: T2 completada.
- 2026-11-24: T3 completada.
- 2026-11-24: T4 completada.
