# Spec: nucleo

Módulo `nucleo` del [mapa de módulos](mapa-modulos.md). Depende de `fundacion`.

| Estado | Plan | Tareas | Avance |
|---|---|---|---|
| **Aprobada** | [Aprobado](../tasks/nucleo/plan.md) | [Aprobadas](../tasks/nucleo/todo.md) | 1/7 tareas completadas |

**Historial:**
- 2026-11-24: v1 en revisión, en la rama `nucleo`.
- 2026-11-24: v1 aprobada por el usuario, que resolvió las preguntas abiertas: `cambiosSinGuardarGuard` pasa a `componentes` (decisión 1), y por ahora se prueba en Chrome, Edge y Brave (decisión 2). Con la API en marcha, la revisión del OpenAPI encontró números `integer | string`, y el usuario eligió ajustarlos en `modelos.ts` y anotar B-06 (decisión 3). Plan y tareas en revisión.
- 2026-11-24: plan y tareas aprobados, con un agregado a T1: actualizar §3.2 de la arquitectura con el resultado de la revisión de los tipos. Empieza T1.
- 2026-11-24: T1 bloqueada. Los tipos generados traen los enums como `number` (B-07). El usuario decide corregir B-06 y B-07 en la API con COR-03 (decisión 4, que reemplaza a la 3).
- 2026-11-24: COR-03 aplicada en la API y T1 completada. En T1, el usuario decide sacar de la carga inicial el adaptador de fechas y la duración de los avisos (decisión 5).

## Objetivo

Construir lo que existe una sola vez en la aplicación y que todas las áreas usan:
- La base de `api/`: el contrato con la API, el error interpretado (`ErrorApi`) y la URL base.
- La sesión, los interceptores y las guardas de `docs/arquitectura.md` §4.
- El marco de los wireframes: barra superior, menú por rol, menú de la cuenta y pie de página (RUI-23).
- Las rutas base: inicio por rol, `V-09` Sin permiso y `V-10` Página no encontrada.

Con este módulo, la aplicación deja de mostrar la página de muestra de `fundacion` y arranca con el marco. Las áreas (`acceso`, `oferta`…) se enchufan después a sus rutas, sin tocar `core/`.

**Usuario:** quien construye los módulos siguientes y, a través del marco y de `V-09`/`V-10`, los cuatro roles (§2.1 de los requerimientos).

**Requerimientos que cubre:** `V-09`, `V-10`, RFF-03, RFF-04, la interpretación del error de RUI-01 a RUI-05 (su presentación es de `componentes`), RUI-23, y §2.2 a §2.5 de los requerimientos (inicio, menú, rutas y acceso a las vistas).

### Alcance

1. **`api/` base** (§2.2, §3):
   - `openapi-typescript` 7.13 como dependencia de desarrollo y el script `pnpm api:tipos` (§11.2).
   - `esquema.d.ts` generado desde la API en marcha y versionado (§3.2).
   - `modelos.ts` con los alias que usa este módulo (sin tipo utilitario, decisión 4): `TokenResponse` (login, cambio obligatorio y cambiar contraseña), `PerfilResponse` (`GET /me`), `Rol` y `ProblemDetails`. Cada módulo agrega los suyos.
   - `paginacion.ts`: `Pagina<T>`, los parámetros comunes y `aParametros()`, con sus pruebas.
   - `error-api.ts`: la interfaz `ErrorApi` (§3.5) y la función pura que convierte un `HttpErrorResponse` en un `ErrorApi`.
   - `api-url.ts`: el token `API_URL`, que `app.config.ts` llena desde `environments/`.
   - `auth-api.ts` con solo `cerrarSesion()` (`POST /auth/logout`), y `me-api.ts` con solo `obtenerPerfil()` (`GET /me`). `acceso` les agrega el resto (supuesto 1).
2. **Sesión** (`core/sesion/`, §4.1):
   - `SesionService` con la sesión como signal: token, `expiraEn`, rol, `debeCambiarContrasena` y nombre. Expone `activa()`, `rol()`, `nombre()`, `cambioPendiente()` y si la sesión terminó (para RUI-09).
   - Guarda y lee una sola clave (`matricula.sesion`) de `sessionStorage`. Al arrancar descarta la sesión vencida.
   - `iniciar(respuesta)`: guarda la sesión de una respuesta con token y, si no hay cambio pendiente, pide el nombre a `GET /me` (supuesto 2). La usan `acceso` (login, cambio obligatorio, cambiar contraseña).
   - `terminar(motivo)`: descarta la sesión.
   - `cerrarSesion()` (RFF-04): llama a `POST /auth/logout`, descarta la sesión aunque la llamada falle y navega a `/oferta?aviso=sesion-cerrada` (supuesto 3).
3. **Interceptores** (`core/http/`, §3.1, §4.2):
   - `tokenInterceptor`: `Authorization: Bearer` solo a las peticiones a `API_URL`.
   - `erroresInterceptor`:
     - convierte todo error en `ErrorApi`, incluida la falta de respuesta y el tiempo agotado (`status: 0`), y lee `Retry-After`;
     - con un `401` de una petición que llevaba token, termina la sesión y navega a `/iniciar-sesion?volver=<ruta actual>&aviso=sesion-terminada`, una sola vez aunque fallen varias peticiones (RFF-03);
     - con un `403 RN-24`, navega a `/cambio-obligatorio` (RFF-02);
     - fija el tiempo de espera de 30 s en las peticiones a `API_URL` que no traen otro (§3.1).
   - Registrados en `app.config.ts` con `provideHttpClient(withInterceptors([...]))`.
4. **Guardas** (`core/guardas/`, §4.3): `sesionGuard` (con el cambio pendiente), `invitadoGuard`, `cambioPendienteGuard` y `rolGuard(...roles)`. Más:
   - `rutaVolverSegura()`: acepta `volver` solo si empieza con `/` y no con `//` (§4.2).
   - La función de inicio por rol, que usa la redirección de `/` y los enlaces de `V-09`/`V-10` (§2.2 de los requerimientos).
   - `cambiosSinGuardarGuard` pasa a `componentes` (decisión 1).
5. **Marco** (`core/marco/`, §4.4, §6.1, §6.4, wireframes):
   - Una sola lista de opciones del menú (`ruta`, `etiqueta`, `roles`, grupo), según §2.3 de los requerimientos y `docs/wireframes/js/wireframe.js`. Las rutas son las definitivas de §2.4 de la arquitectura.
   - Tres variantes, que salen de la sesión:
     - **Visitante:** barra superior con el nombre del sistema y los enlaces Oferta académica, Iniciar sesión y Registrarse.
     - **Con sesión:** barra superior con el botón del menú, el nombre del sistema (enlace a la página de inicio del rol) y el menú de la cuenta (`mat-menu`: nombre y rol; Mi perfil, Cambiar contraseña y Cerrar sesión). Menú lateral (`mat-sidenav`) con las opciones del rol, agrupadas para el administrador; fijo desde 960 px y plegable por debajo.
     - **Cambio pendiente:** solo el nombre del sistema y "Cerrar sesión" (RFF-02, variante "mínimo" del wireframe de `V-03`).
   - La opción activa se marca con `routerLinkActive` y `aria-current="page"`.
   - Pie (RUI-23): "Sistema de Matrícula · Instituto de Cursos Libres · © \<año\> · Versión \<versión\>", desde `environments/`. No queda fijo y se apila en pantallas angostas.
6. **Rutas y páginas** (`app.routes.ts`, `core/paginas/`, §2.4, §4.3):
   - `/` redirige a la página de inicio del rol, a `/cambio-obligatorio` con un cambio pendiente, o a `/oferta` sin sesión.
   - `/sin-permiso` (`V-09`, con `sesionGuard`) y `**` (`V-10`), en diferido, como en los wireframes: mensaje y un único enlace a la página de inicio del rol.
   - Las rutas de las áreas no se declaran: cada área agrega la suya al construirse (supuesto 4).
7. **Limpieza y cierre:**
   - Se borra la página de muestra (`src/app/muestra/`) y su ruta (supuesto 3 de `SPEC-fundacion`).
   - La versión sube a `0.2.0` (§11.3).
   - Las verificaciones heredadas del mapa: tipos `integer | string`, navegadores y Lighthouse.
8. **Pruebas** (§9): las filas de `SesionService`, `tokenInterceptor`, `erroresInterceptor` y guardas, más `aParametros()`, la conversión a `ErrorApi`, la lista del menú por rol y el pie.

### Fuera de alcance
- `V-02` a `V-08` y la lógica de login, cambio obligatorio y cambiar contraseña: son de `acceso`. También decidir, después del login, si el rol puede abrir la ruta `volver` (RFF-01).
- Los avisos "Su sesión terminó" en `V-02` y "Cerró sesión" en `V-01`: los muestran `acceso` y `oferta` a partir del parámetro `aviso` (supuesto 3).
- La presentación de los errores (`ErrorAccion`, `EstadoContenido`), los avisos temporales (`AvisosService`) y las confirmaciones: son de `componentes`.
- Mostrar `V-09` con `skipLocationChange` ante un `403` al cargar una vista: lo hace `EstadoContenido` (`componentes`). `nucleo` deja la ruta lista.
- Las verificaciones con una sesión obtenida desde `V-02`: heredadas por `acceso` en el mapa.
- Pruebas e2e: siguen diferidas.

## Tech Stack

Lo de `docs/arquitectura.md` §1, ya instalado en `fundacion`. Este módulo agrega solo **openapi-typescript 7.13** (dependencia de desarrollo, ya aprobada en §1). Antes de instalarlo se verifica la versión con `npm view` y la regla de `minimumReleaseAge`, como en `fundacion` T1.

Del CDK y de Material usa `mat-toolbar`, `mat-sidenav`, `mat-menu`, `mat-list`, `mat-button`, `mat-icon` y `BreakpointObserver`.

## Commands

```bash
pnpm install --frozen-lockfile
pnpm api:tipos                     # con la API en marcha en http://localhost:5022
pnpm start                         # http://localhost:5173: el marco
pnpm test --watch=false
pnpm lint
pnpm formato:revisar
pnpm build
pnpm audit
```

**Cierre del módulo:** `pnpm formato:revisar && pnpm lint && pnpm test --watch=false && pnpm build` y `pnpm audit`. Después, Lighthouse y la revisión contra los wireframes.

## Project Structure

```
src/app/
  app.ts, app.html, app.scss      El marco envuelve el <router-outlet>
  app.config.ts                   + API_URL, interceptores
  app.routes.ts                   Inicio, /sin-permiso y **
  api/
    esquema.d.ts                  Generado (no se edita)
    modelos.ts, paginacion.ts, error-api.ts, api-url.ts
    auth-api.ts, me-api.ts        Solo lo que usa nucleo
  core/
    sesion/                       sesion-service.ts, sesion.ts (tipos), inicio-rol.ts
    http/                         token-interceptor.ts, errores-interceptor.ts
    guardas/                      sesion-guard.ts, invitado-guard.ts, cambio-pendiente-guard.ts, rol-guard.ts, ruta-volver.ts
    marco/                        marco.ts, menu-opciones.ts, menu-cuenta.ts, pie.ts
    paginas/                      sin-permiso/, no-encontrada/
src/testing/                      + una sesión y un ProblemDetails de ejemplo
```

Los nombres exactos de los archivos se ajustan en el plan.

## Code Style

El de `docs/arquitectura.md` §8 y §10. Una guarda:

```ts
// core/guardas/rol-guard.ts
/** §2.5: con sesión, una vista de otro rol lleva a V-09. */
export function rolGuard(...roles: Rol[]): CanActivateFn & CanMatchFn {
  return () => {
    const sesion = inject(SesionService);
    const rol = sesion.rol();
    return rol !== null && roles.includes(rol) ? true : inject(Router).parseUrl('/sin-permiso');
  };
}
```

## Testing Strategy

- **Unitarias (Vitest, `TestBed` y `HttpTestingController`)**, una por fila de §9:
  - `SesionService`: guarda y lee de `sessionStorage`, descarta una sesión vencida al arrancar, reemplaza el token, pide el nombre a `GET /me` solo sin cambio pendiente, y `cerrarSesion()` descarta la sesión aunque el logout falle.
  - `tokenInterceptor`: agrega el token a `API_URL` y no a otro origen ni sin sesión.
  - `erroresInterceptor`: cada fila de §3.5 que le toca. El `ProblemDetails` se convierte en `ErrorApi` (con `errors`, `traceId`, `code` y las extensiones en `datos`); el `429` lee `Retry-After`; la falta de respuesta da `status: 0`; el `401` con token navega a `V-02` con `volver` y `aviso`; el `401` sin token no navega; el `403 RN-24` navega a `V-03`; varios `401` a la vez navegan una sola vez.
  - Guardas: una prueba por fila de §4.3, incluida la sesión vencida según `expiraEn` y la ruta `volver` externa (`//otro.sitio`, `https://…`) rechazada.
  - `aParametros()`: quita los vacíos y convierte booleanos y números.
  - Marco: las opciones del menú de cada rol (§2.3) y el texto del pie.
- **Manual**, con la API en marcha y una sesión real: un token pedido a `POST /auth/login` (con curl o Swagger) y escrito en `sessionStorage` desde las herramientas del navegador, con usuarios de los datos de prueba del backend (supuesto 5):
  - El marco de cada rol y del visitante, contra los wireframes, en escritorio y a 360 px sin desplazamiento horizontal.
  - El menú plegable por debajo de 960 px, el teclado y el foco.
  - `V-09` en `/sin-permiso`, y `V-10` con una dirección inexistente.
  - Cerrar sesión desde el menú de la cuenta: la petición de logout sale y la sesión se descarta.
  - Un token invalidado (logout desde otra pestaña) devuelve el `401` y navega con `volver`.
- **Verificaciones heredadas:** los navegadores de la decisión 2 y Lighthouse con el build de producción.

## Boundaries

- **Siempre:**
  - Las reglas de `AGENTS.md` y de `docs/arquitectura.md` §4.5: el token solo a `API_URL`, nunca en la dirección ni en la consola.
  - Solo `core/sesion/` usa `sessionStorage`, y solo `api/` usa `HttpClient`.
  - Commit después de cada tarea, en la rama `nucleo` (decisión 5 del mapa).
- **Preguntar antes:**
  - Una dependencia que no sea `openapi-typescript`.
  - Si el OpenAPI trae un tipo que no coincide con las specs del backend.
  - Cambiar una ruta de §2.4 o una regla de las guardas.
- **Nunca:**
  - Editar `esquema.d.ts` a mano.
  - Modificar la API.
  - Guardar la contraseña o la respuesta cruda del login fuera de `SesionService`.

## Success Criteria

1. `pnpm api:tipos` genera `esquema.d.ts` desde la API, y `modelos.ts` compila sin `any`. Con COR-03 aplicada en la API, los ids y números de los alias son `number` y los enums, uniones de textos, con una prueba de tipos que lo comprueba. B-06 y B-07 quedan anotadas en `docs/requerimientos.md` §8 (decisión 4).
2. `pnpm formato:revisar`, `pnpm lint`, `pnpm test --watch=false` y `pnpm build` pasan. El build queda dentro de los presupuestos de §8.3, y la página de muestra ya no existe.
3. Las pruebas de la estrategia pasan, con al menos una por fila de §4.3 y por cada caso de `erroresInterceptor` de §9.
4. Con la API en marcha, el marco del visitante y de los tres roles coincide con los wireframes (menú, menú de la cuenta, pie), en escritorio y a 360 px sin desplazamiento horizontal, y se usa con el teclado.
5. `/sin-permiso` muestra `V-09`, y una dirección inexistente muestra `V-10`, cada una con el enlace a la página de inicio del rol. `rolGuard` lleva a `/sin-permiso` (pruebas); con una ruta real de otro rol se verifica en `acceso`, cuando existan áreas.
6. Cerrar sesión llama a `POST /auth/logout`, descarta la sesión aunque falle, y navega a `/oferta?aviso=sesion-cerrada`. Un `401` con token navega a `/iniciar-sesion` con `volver` y `aviso`.
7. Lighthouse, perfil de escritorio y build de producción: carga inicial de 500 kB o menos sin comprimir y LCP menor a 2,5 s.
8. La verificación en Chrome, Edge y Brave queda hecha y anotada en `todo.md`, y la de Firefox y Safari, anotada en el mapa como pendiente (decisión 2).
9. `pnpm audit` no tiene hallazgos altos ni críticos, o quedan anotados con su justificación.

## Supuestos

1. **Los clientes de `api/` crecen por módulo.** `nucleo` crea `auth-api.ts` y `me-api.ts` con solo lo que usa (logout y perfil), y `modelos.ts` con sus tipos. `acceso` les agrega el login, el cambio obligatorio, el olvido, el registro y lo demás. Así no queda código sin usar ni probar.
2. **El nombre del menú de la cuenta lo pide `SesionService`.** Al iniciar la sesión sin cambio pendiente, pide `GET /me` y guarda el nombre completo (nombre y apellidos de `datosPersonales`) en la misma clave de `sessionStorage`. Si `GET /me` falla, el menú muestra solo el rol, y la sesión sigue. Con el cambio pendiente no se pide, porque la API responde `403 RN-24` (§4.1).
3. **Los avisos de sesión van como parámetro de la ruta.** El `401` navega con `aviso=sesion-terminada` (§4.2), y el cierre de sesión, con `/oferta?aviso=sesion-cerrada`, como el estado "Después de cerrar sesión" del wireframe de `V-01`. Muestran el aviso `acceso` y `oferta`, que son dueñas de esas vistas.
4. **Las rutas de las áreas llegan con cada área.** `app.routes.ts` no puede declarar un `loadChildren` a un archivo que no existe. Mientras tanto, las opciones del menú y la redirección de `/` llevan a rutas sin vista, que muestran `V-10`. Por ejemplo, el visitante ve `V-10` al abrir `/` hasta que exista `oferta`. Es esperado durante la construcción.
5. **Verificación manual sin `V-02`.** Como el inicio de sesión llega con `acceso`, la sesión de la verificación manual se arma con un token real de `POST /auth/login` escrito en `sessionStorage`. Las 7 situaciones de §2.5 desde el formulario quedan para `acceso` (verificación heredada del mapa).
6. **El año del pie** es el año actual en la zona del instituto, no el del build.

## Decisiones

1. **`cambiosSinGuardarGuard` pasa a `componentes`** (2026-11-24, decidido por el usuario), junto con la interfaz `ConCambiosSinGuardar`. Pide la confirmación "¿Descartar los cambios?" (RUI-07) con `ConfirmacionesService`, que se construye en `componentes`, y ningún formulario la necesita antes de `acceso`. Se anota en el mapa.
2. **Navegadores** (2026-11-24, decidido por el usuario): por ahora se prueba en Chrome, Edge y Brave, en escritorio y en el modo celular de las herramientas. Los tres usan el motor Chromium, así que Firefox y Safari (escritorio y celular) quedan en el mapa como verificación heredada por `sistema`, el último módulo.
3. **Números como `integer | string`** (2026-11-24, decidido por el usuario). Al revisar el OpenAPI (verificación heredada de §3.2), 168 números vienen declarados como `integer | string`, también en las respuestas (`usuarioId`, `personaId`, `status`…). La API los envía como números; el tipo es más ancho porque ASP.NET Core acepta leer números escritos como texto (`NumberHandling = AllowReadingFromString`, el valor por defecto de la web). Se resuelve así:
   - `modelos.ts` define un tipo utilitario que convierte `number | string` en `number` (de forma recursiva, en objetos y arreglos), y todos los alias pasan por él. `esquema.d.ts` no se toca.
   - Se anota como brecha **B-06** en `docs/requerimientos.md` §8, con la corrección del backend propuesta (`JsonNumberHandling.Strict`), para decidir aparte. Si el backend la aplica, el tipo utilitario queda sin efecto y se quita.

   **Reemplazada por la decisión 4** (2026-11-24): B-06 se corrige en la API, junto con B-07, y el tipo utilitario ya no hace falta.
4. **Enums declarados como `integer` y corrección COR-03 en la API** (2026-11-24, decidido por el usuario). Al generar los tipos en T1, los 9 enums salieron como `number` sin valores (`Rol: number`), aunque la API los envía como texto. La causa está en `Program.cs` del backend: `JsonStringEnumConverter` está solo en las opciones de MVC, y el generador del OpenAPI lee las de `ConfigureHttpJsonOptions`, que además traen la tolerancia de B-06. Se resuelve así:
   - Se anota la brecha **B-07** en `docs/requerimientos.md` §8.
   - El backend corrige B-06 y B-07 en una corrección aparte (COR-03): `ConfigureHttpJsonOptions` con `JsonStringEnumConverter` y `NumberHandling = Strict`. `nucleo` no modifica la API (decisión 4 del mapa).
   - T1 queda bloqueada hasta que COR-03 esté hecha. Después se regenera `esquema.d.ts`, se comprueba que los enums sean uniones de textos y los números `number`, y `modelos.ts` queda con alias directos, sin tipo utilitario.

   **Hecho** (2026-11-24): COR-03 se aplicó en la API, que además quitó el `null` de los enums `Rol` y `MotivoRetiro`.
5. **El adaptador de fechas y la duración de los avisos salen de la carga inicial** (2026-11-24, decidido por el usuario en T1). Con solo `API_URL`, el build pasó a 500,12 kB, por encima de la meta de 500 kB, antes de agregar el marco. Medido: el adaptador de fechas (date-fns) pesaba 70 kB, y `provideMaterial()`, que solo fijaba la duración de los avisos, 129 kB, porque su token arrastra todo el módulo de avisos. Ninguno de los dos lo usa el arranque. Se resuelve así:
   - `provideAdaptadorFechas()` pasa a `provideMaterialVistas()`, que cada área registra en su ruta (§2.5).
   - `provideMaterial()` se elimina. La duración de 5 s la fija `AvisosService` en cada aviso (`componentes`, verificación heredada en el mapa), porque `MatSnackBar` vive en la raíz y no vería un token puesto en la ruta.
   - Se actualizan §2.2, §6.1 y §7.3 de la arquitectura. La carga inicial baja a 301,89 kB.

## Preguntas abiertas

Ninguna.
