# Tareas: nombres

Corrección `nombres`, previa a `componentes` (ver el [mapa](../../specs/mapa-modulos.md)). Spec: [`specs/SPEC-nombres.md`](../../specs/SPEC-nombres.md) · Plan: [`plan.md`](plan.md)

**Estado de la lista:** Aprobada (2026-11-24)

Cada tarea termina con:
- `pnpm lint`, `pnpm test --watch=false` (20 archivos y 197 pruebas) y `pnpm build` en verde;
- un `grep` de los nombres viejos de su capa, sin resultados en el código;
- la verificación indicada;
- un solo commit en la rama `nombres`, con el código y la actualización de este archivo, la spec y el mapa. En la tabla se marca ✅, sin el hash.

Los nombres nuevos son los de las tablas 2.1 a 2.6 de la spec. Si aparece uno que no está ahí y la regla no lo deja claro, se pregunta (decisión 5).

## Estado

| Tarea | Estado | Código | Pruebas unitarias | Verificación manual | Commit |
|---|---|:---:|:---:|:---:|:---:|
| T1. Regla, documentos y scripts | Completada | ✅ | ✅ | ➖ | ✅ |
| T2. `api/` | Completada | ✅ | ✅ | ➖ | ✅ |
| T3. Sesión, guardas e interceptores | Pendiente | ⬜ | ⬜ | ➖ | ⬜ |
| T4. Configuración y formatos | Pendiente | ⬜ | ⬜ | ➖ | ⬜ |
| T5. Layout y páginas | Pendiente | ⬜ | ⬜ | ⬜ | ⬜ |
| T6. Estilos globales | Pendiente | ⬜ | ⬜ | ⬜ | ⬜ |
| T7. Verificación y cierre | Pendiente | ➖ | ⬜ | ⬜ | ⬜ |

**Estados de tarea:**
- **Pendiente:** no se ha empezado.
- **En progreso:** se está trabajando en ella.
- **Implementada:** el código está hecho, pero falta alguna columna o la revisión del usuario.
- **Bloqueada:** no puede avanzar; se indica el motivo debajo de la tabla.
- **Completada:** todas las columnas en ✅ o ➖.

**Columnas:** ✅ hecho · ⬜ pendiente · ➖ no aplica

**Pruebas unitarias:** en esta corrección significa que las 197 pruebas existentes pasan con los nombres nuevos; no se escriben pruebas nuevas.

## Detalle

### T1. Regla, documentos y scripts
- Acceptance:
  - `docs/arquitectura.md`:
    - §10.1 reescrito con la regla de la spec (objetivo y decisiones 1 a 8), ejemplos y la tabla de piezas con los nombres nuevos.
    - §2 a §9, §11 y §12 con los nombres nuevos de las tablas 2.1 a 2.6, incluidas las piezas futuras (§5, §6.2, §6.3) y los scripts de §11.2.
    - La ruta de la excepción de `bypassSecurityTrustResourceUrl` pasa a `core/config/icons.ts` y `public/icons/`.
  - `AGENTS.md`:
    - Comandos con `pnpm format:check`, `pnpm format` y `pnpm api:types`, y `src/app/api/schema.d.ts`.
    - Estructura de carpetas (`shared/formatting`, `shared/forms`) y la regla de nombres con ejemplos nuevos (`session-service.ts`, `date-pipe.ts`).
    - La excepción con la ruta `core/config/icons.ts`.
    - En *Preguntar antes*: "El nombre o el idioma de algo, cuando la regla de `docs/arquitectura.md` §10.1 no lo deja claro".
  - `docs/requerimientos.md` (2 referencias), `README.md` (scripts y su nota de `api:types`) y el mapa (filas de `componentes` y `grupos`, verificaciones heredadas, estado de la corrección).
  - `package.json`: scripts `format`, `format:check` y `api:types`, con salida a `src/app/api/schema.d.ts`.
  - `git mv src/app/api/esquema.d.ts src/app/api/schema.d.ts`, y las importaciones de `modelos.ts` y de las pruebas apuntan al nuevo.
  - `.prettierignore` y `eslint.config.js` ignoran `schema.d.ts`. Las funciones y variables internas de `eslint.config.js` pasan a inglés; sus mensajes siguen en español.
- Verify:
  - `pnpm format:check` funciona y pasa.
  - `pnpm api:types` (con la API en marcha) regenera `schema.d.ts` sin diferencias en git.
  - `grep` de los nombres viejos de las tablas 2.1 a 2.6 en `AGENTS.md`, `docs/arquitectura.md`, `docs/requerimientos.md`, `README.md` y el mapa (fuera de su historial): sin resultados.
- Files: `docs/arquitectura.md`, `AGENTS.md`, `docs/requerimientos.md`, `README.md`, `specs/mapa-modulos.md`, `package.json`, `src/app/api/schema.d.ts`, `src/app/api/modelos.ts`, `.prettierignore`, `eslint.config.js`
- **Resultado (2026-11-24):**
  - La arquitectura tenía más nombres de piezas futuras que los de la tabla 2.6. Los que la regla resuelve se aplicaron (`toRequest`, `passwordPolicy`, `listResource`…). Los que no estaban claros los decidió el usuario: el patrón de los componentes de las vistas, `irreversible` y `grupoSelect` (decisiones 9 a 11). Se agregaron a la tabla 2.6 de la spec.
  - `docs/arquitectura.md`: §10.1 reescrito con la regla, y unos 250 nombres cambiados en el resto del documento. El "marco" pasa a llamarse "layout" también en el texto, salvo una mención que explica que los wireframes lo llaman "marco". La línea de estado del documento conserva los nombres de entonces, porque es su historial.
  - `docs/requerimientos.md` no cambia: sus únicas menciones (`pnpm api:tipos` y `modelos.ts` en B-06 y B-07) son el historial de las brechas. "Marco de la aplicación" (§5.6) es el nombre del requerimiento, en prosa.
  - `AGENTS.md`: comandos, estructura, la regla de nombres con ejemplos, la ruta de la excepción de `icons.ts` y la pregunta sobre nombres en *Preguntar antes*.
  - `eslint.config.js`: `folder`, `restrict`, `areaRules`, `MATRICULA_IMPORTERS` y `AREAS_MESSAGE`; los mensajes siguen en español.
  - `pnpm api:types` regenera `schema.d.ts` sin diferencias (git lo ve como renombrado al 100 %).
  - `pnpm format:check`, `pnpm lint`, `pnpm test --watch=false` (20 archivos y 197 pruebas) y `pnpm build` (carga inicial: 438,60 kB, igual que al cerrar `nucleo`) en verde.

### T2. `api/`
- Acceptance (tabla 2.2 de la spec):
  - `git mv`: `modelos.ts` → `models.ts`, `paginacion.ts` → `pagination.ts`, `error-api.ts` → `api-error.ts`, con sus `.spec.ts`.
  - `ApiError` (`name: 'ApiError'`, campo `data`), `toApiError`, `isApiError`; `Page<T>`, `ListParams`, `ParamValue`, `toParams`.
  - `AuthApi.logout()` y `MeApi.getProfile()`.
  - Los nombres internos de esos archivos en inglés (por ejemplo, las funciones auxiliares de la conversión a `ApiError`).
  - Todas las importaciones y usos en `core/`, `src/testing/` y las pruebas.
- Verify: `grep -rnE "ErrorApi|aErrorApi|esErrorApi|Pagina<|ParametrosListado|ValorParametro|aParametros|obtenerPerfil|modelos|paginacion|error-api" src/` sin resultados.
- Files: `src/app/api/models.ts`, `pagination.ts`, `api-error.ts`, `auth-api.ts`, `me-api.ts`, sus `.spec.ts`, y los que los importan en `core/` y `src/testing/`
- **Resultado (2026-11-24):**
  - `models.ts`, `pagination.ts` y `api-error.ts` (con sus pruebas) movidos con `git mv`. Los nombres internos de `api-error.ts` también pasan a inglés (`KNOWN_FIELDS`, `toObject`, `asText`, `fieldErrors`, `seconds`), y el auxiliar `respuesta` de su prueba, a `response`.
  - `AuthApi.logout()` y `MeApi.getProfile()`. `SesionService.cerrarSesion()` y su variable `datos` se renombran en T3, con el resto de la sesión.
  - Las pruebas siguen importando `PROBLEMA_*` de `src/testing/`, que cambia en T3.
  - `pnpm format:check`, `pnpm lint`, `pnpm test --watch=false` (20 archivos y 197 pruebas) y `pnpm build` (carga inicial: 438,57 kB) en verde.

### T3. Sesión, guardas e interceptores
- Acceptance (tabla 2.3 y 2.4 de la spec):
  - `git mv core/sesion core/session` y `core/guardas core/guards`, con los archivos de la tabla 2.1 (`session-service.ts`, `home-route.ts`, `clock.ts`, `auth-guard.ts`, `guest-guard.ts`, `rol-guard.ts`, `password-change-guard.ts`, `return-url.ts`, `guards.spec.ts`) y `core/http/error-interceptor.ts`.
  - `SessionService` (`Session`, `SESSION_KEY = 'matricula.session'`; `isActive`, `isExpired`, `start`, `end`, `logout`, `ended`, `passwordChangePending`). Los datos `token`, `rol`, `nombre`, `accessToken`, `expiraEn`, `debeCambiarContrasena` no cambian (decisión 3).
  - `authGuard`, `checkSession`, `guestGuard`, `rolGuard`, `passwordChangeGuard`, `safeReturnUrl`; `errorInterceptor`, `REQUEST_TIMEOUT`; `APP_PATHS`, `HOME_BY_ROL`, `HomeLink`, `homeLink`, `homeRoute`, `CLOCK`.
  - `src/testing/`: `whitespace.ts` (`normalizeWhitespace`), `session.ts`, `problem-details.ts` con los nombres de la tabla 2.4.
  - `app.config.ts`, `app.routes.ts`, el layout y las páginas usan los nombres nuevos (sin renombrar todavía sus propios archivos).
- Verify:
  - Las pruebas de sesión, guardas e interceptores pasan.
  - `grep -rnE "SesionService|CLAVE_SESION|sesionGuard|revisarSesion|invitadoGuard|cambioPendienteGuard|rutaVolverSegura|erroresInterceptor|TIEMPO_ESPERA|RUTAS|INICIO_POR_ROL|enlaceDeInicio|rutaDeInicio|RELOJ|normalizarEspacios|PROBLEMA_|AHORA|core/sesion|core/guardas" src/` sin resultados.
- Files: `src/app/core/session/*`, `src/app/core/guards/*`, `src/app/core/http/*`, `src/testing/*`, `src/app/app.config.ts`, `src/app/app.routes.ts`, y los usos en `core/marco/` y `core/paginas/`

### T4. Configuración y formatos
- Acceptance (tablas 2.3 y 2.4 de la spec):
  - `core/config/`: `app-date-adapter.ts` (`AppDateAdapter`, `provideAppDateAdapter`), `date-formats.ts` (`DATE_FORMATS`, `TIME_FORMAT`), `icons.ts` (`ICONS`, `IconName`, `provideIcons`), `material-defaults.ts` (`PaginatorIntl`, `DatepickerIntl`, `provideMaterialDefaults`), con sus `.spec.ts`.
  - `git mv public/iconos public/icons` y cada SVG con su nombre nuevo; `icons.ts` registra la ruta `icons/<nombre>.svg`, y los `svgIcon` de las plantillas usan los nombres nuevos.
  - `git mv shared/formatos shared/formatting`: `formatters.ts` (`formatDate`, `formatDateTime`, `formatTime`, `formatCurrency`, `formatNumber`, `APP_LOCALE`, `APP_TIME_ZONE`), `labels.ts` (`toLabel`, `LabelType`; las claves del catálogo no cambian) y los pipes `smDate`, `smDateTime`, `smTime`, `smCurrency`, `smNumber`, `smLabel` (`SmDatePipe`…), con sus pruebas.
  - Los usos en `app.config.ts`, el layout y las páginas.
- Verify:
  - `icons.spec.ts` pasa con las rutas nuevas.
  - `grep -rnE "AdaptadorFechas|FORMATOS_FECHA|FORMATO_HORA|ICONOS|provideIconos|PaginadorIntl|SelectorFechaIntl|MaterialVistas|formatear|LOCALE_INSTITUTO|ZONA_INSTITUTO|etiquetar|TipoEtiqueta|FechaPipe|MonedaPipe|NumeroPipe|HoraPipe|EtiquetaPipe|formatos/|iconos" src/` sin resultados, y `grep -rn "svgIcon" src/app` solo con nombres de `ICONS`.
- Files: `src/app/core/config/*`, `public/icons/*`, `src/app/shared/formatting/*`, `src/app/app.config.ts`, y los usos en `core/marco/` y `core/paginas/`

### T5. Layout y páginas
- Acceptance (tablas 2.3 y 2.5 de la spec):
  - `git mv core/marco core/layout`: `layout.ts|html|scss|spec.ts` (`Layout`, `sm-layout`, `LayoutVariant` con `'guest' | 'rol' | 'password-change'`, `FIXED_SIDENAV_QUERY`), `nav-items.ts` (`NavItem` con `path`, `label`, `roles`, `section`; `NavSection` con `title`, `items`; `NAV_ITEMS`, `USER_MENU_ITEMS`, `navFor`, `Audience`), `user-menu/` (`UserMenu`, `sm-user-menu`) y `footer/` (`Footer`, `sm-footer`). Los miembros internos en inglés (`toggleSidenav`, `hasSidenav`, `fixedSidenav`, `sidenav`, `logout`…).
  - `git mv core/paginas core/pages`: `message-page/` (`MessagePage`, `sm-message-page`, entradas `icon`, `title`, `message`), `not-found/` (`NotFound`), `forbidden/` (`Forbidden`) y `pages.spec.ts`.
  - `app.ts`, `app.html` (`<sm-layout>`) y `app.routes.ts` (las rutas `loadComponent` a los archivos nuevos; las direcciones de la URL no cambian).
  - Clases CSS de los componentes según la tabla 2.5 (`rol` se queda, decisión 6), en las plantillas, los `.scss` y las pruebas que las buscan.
  - `environment.instituteName` en los dos archivos de `environments/` y en `Footer`.
- Verify:
  - Las pruebas que buscan elementos (`querySelector`) se revisan una por una: cada una sigue encontrando lo que busca. Siguen siendo 197.
  - `grep -rnE "Marco|MenuCuenta|\bPie\b|menu-opciones|OpcionMenu|GrupoMenu|OPCIONES_|menuDe|Audiencia|MensajePagina|NoEncontrada|SinPermiso|sm-marco|sm-pie|sm-menu-cuenta|sm-mensaje-pagina|nombreInstituto|core/marco|core/paginas" src/` sin resultados, ni las clases viejas de la tabla 2.5 en `src/app`.
  - **Manual**, con `pnpm start` y la API en marcha: el layout del visitante, el de un rol (sesión escrita en `sessionStorage` con la clave nueva), el menú de la cuenta, el pie, `/sin-permiso` y una dirección inexistente se ven igual que antes, con sus íconos.
- Files: `src/app/core/layout/*`, `src/app/core/pages/*`, `src/app/app.ts`, `app.html`, `app.routes.ts`, `src/environments/*`

### T6. Estilos globales
- Acceptance (tabla 2.5 de la spec):
  - `git mv`: `_paleta.scss` → `_palette.scss`, `_tema.scss` → `_theme.scss`, y los `@use` de `styles.scss`.
  - Variables `--sm-*` y `$font` con sus nombres nuevos, en su definición y en todos los `.scss` que las usan. Los valores no cambian.
  - Las clases CSS globales de `styles.scss`, si las hay, según la regla.
- Verify:
  - `git diff` de `_palette.scss`: solo cambian los nombres; los colores, iguales.
  - `grep -rnE "\-\-sm-(marca|acento|fondo|superficie|texto|borde|secundario|fuente|espacio|foco|exito|aviso|informacion|neutro|apagado)|\\\$fuente|_paleta|_tema" src/` sin resultados.
  - **Manual:** el layout del visitante y de un rol, `V-09` y `V-10` se ven igual que en T5 (colores, espacios, foco con el teclado).
- Files: `src/styles/_palette.scss`, `_theme.scss`, `src/styles.scss` y los `.scss` de los componentes

### T7. Verificación y cierre
- Acceptance:
  - `grep` global de todos los nombres viejos de las tablas 2.1 a 2.6 en `src/`, `public/`, la configuración y los documentos vivos: solo quedan en los documentos históricos y en el historial del mapa.
  - `pnpm api:types` genera `schema.d.ts` sin diferencias.
  - `pnpm format:check && pnpm lint && pnpm test --watch=false && pnpm build` en verde, con 20 archivos y 197 pruebas, y `pnpm audit` sin hallazgos altos ni críticos.
  - Los 6 criterios de éxito de la spec, revisados uno por uno y anotados en el resultado de esta tarea.
  - La spec, este archivo y el mapa con su estado final.
- Verify: revisión del usuario del diff completo de la rama antes de abrir el PR.
- Files: `specs/SPEC-nombres.md`, `tasks/nombres/todo.md`, `tasks/nombres/plan.md`, `specs/mapa-modulos.md`
