# Spec: nombres

Corrección transversal antes de `componentes`. No es un módulo del [mapa](mapa-modulos.md): cambia la regla de nombres de `docs/arquitectura.md` §10.1 y renombra lo que ya construyeron `fundacion` y `nucleo`.

| Estado | Plan | Tareas | Avance |
|---|---|---|---|
| **Aprobada** | [Aprobado](../tasks/nombres/plan.md) | [Aprobadas](../tasks/nombres/todo.md) | 5/7 tareas completadas |

**Historial:**
- 2026-11-24: v1 en revisión, en la rama `nombres`. El usuario fijó la regla (decisiones 1 a 5) al revisar el código a mano.
- 2026-11-24: v1 aprobada por el usuario, que resolvió las preguntas abiertas: "rol" se queda en español también en los nombres técnicos (decisión 6), las secciones del menú son `section` (decisión 7) y los scripts pasan a inglés (decisión 8). Plan y tareas en revisión.
- 2026-11-24: plan y tareas aprobados. Empieza T1.
- 2026-11-24: T1 completada. El usuario decidió los nombres de piezas futuras que la regla no dejaba claros (decisiones 9 a 11).

## Objetivo

Hoy, §10.1 de la arquitectura pide todo en español salvo los sufijos técnicos (`Service`, `Guard`, `Pipe`, `Api`). En la práctica eso tradujo también los conceptos de la interfaz y de Angular: `Marco` (layout), `Pie` (footer), `MenuCuenta` (user menu), `AdaptadorFechas`, `erroresInterceptor`. Son nombres menos reconocibles que los términos que usa cualquier proyecto web.

**Regla nueva:**
- **En español:**
  - Las entidades y conceptos del instituto: `Curso`, `Matricula`, `Periodo`, `Estudiante`, `Grupo`, `Aula`, `Rol`…, también dentro de un nombre técnico: `rolGuard`, `HOME_BY_ROL` (decisión 6).
  - Los datos que conforman esas entidades, con el nombre de la API: `rol`, `nombre`, `debeCambiarContrasena`, `expiraEn`, `incluirInactivos` (decisión 3).
  - Los valores de sus enums (`Administrador`, `EnCurso`, `RetiroVoluntario`).
  - Los textos de la interfaz (títulos, botones, mensajes), con trato de usted.
  - Las rutas de la URL y sus parámetros (`/mis-matriculas`, `?volver=`, `?aviso=sesion-terminada`).
  - Las carpetas de área (`features/matricula`…) y los ids de módulo.
  - Los comentarios, las descripciones de las pruebas y los documentos.
- **En inglés:** todo lo demás: componentes de interfaz, clases, funciones, métodos, constantes, tipos propios del SPA, carpetas técnicas, clases CSS, variables `--sm-*`, piezas de Angular (pipes, guards, interceptors, adapters) y scripts.
- **Combinados:** primero el nombre de dominio, en español, y después la parte técnica, en inglés: `CursosApi`, `EstudiantesList`, `CursoDetail`, `CursoForm`, `PeriodoSelect`.
- **Verbos en inglés**, también en las acciones propias del negocio: `list`, `get`, `create`, `update`, `delete`, `enroll`, `withdraw`, `changeGrupo` (decisión 1).
- **Si no está claro qué nombre o qué idioma le toca a algo, se pregunta al usuario** (decisión 5).

**Usuario:** quien construye y revisa los módulos siguientes.

### Alcance

1. **Documentos que fijan la regla** (para los desarrollos futuros):
   - `docs/arquitectura.md`: reescribir §10.1, con la regla, ejemplos y la tabla de piezas; cambiar los nombres en §2 a §9, §11 y §12, incluidas las piezas que todavía no existen (tabla 2.6 de esta spec).
   - `AGENTS.md`: la estructura de carpetas, la regla de nombres con sus ejemplos, los scripts, la ruta de la excepción de `icons.ts` y, en *Preguntar antes*, "el nombre o el idioma de algo, cuando la regla no lo deja claro".
   - `specs/mapa-modulos.md`: los nombres de las filas de `componentes` y `grupos` y de las verificaciones heredadas, una entrada en el historial y el estado de esta corrección.
   - `docs/requerimientos.md` (2 referencias) y `README.md` (scripts).
2. **El código de `fundacion` y `nucleo`**, según las tablas de abajo: archivos, carpetas, símbolos exportados, selectores, entradas de los componentes, miembros internos, clases CSS, variables de estilo, íconos, pruebas y utilidades de `src/testing/`.
3. **La configuración:** los scripts de `package.json`, `eslint.config.js` (rutas y nombres de sus funciones) y lo que nombre archivos renombrados (`angular.json`, `.prettierignore`).

### Lo que no cambia
- El comportamiento. Ni una vista, un texto visible, una ruta, un color ni una petición cambian: es un renombre puro.
- Los documentos históricos: `SPEC-fundacion`, `SPEC-nucleo`, `SPEC-requerimientos`, `SPEC-wireframes`, `SPEC-arquitectura`, `specs/fase-0.md` y los `tasks/*` cerrados. Cuentan lo que se hizo con los nombres de entonces; el mapa anota el cambio (supuesto 1).
- Los wireframes (`docs/wireframes/`): son una guía, y sus nombres de componentes los traduce la tabla de §6.2 de la arquitectura.
- La API. Los tipos generados y sus alias de `modelos.ts` (`CursoResponse`, `TokenResponse`, `Rol`) ya vienen de ella.

## Tablas de nombres

Los nombres internos (propiedades protegidas, variables locales, funciones privadas) siguen la regla, y el plan los lista por archivo. Aquí van los que ve el resto del código.

### 2.1 Carpetas y archivos

| Hoy | Nuevo |
|---|---|
| `api/esquema.d.ts` | `api/schema.d.ts` |
| `api/modelos.ts` | `api/models.ts` |
| `api/paginacion.ts` | `api/pagination.ts` |
| `api/error-api.ts` | `api/api-error.ts` |
| `core/marco/marco.*` | `core/layout/layout.*` |
| `core/marco/menu-opciones.ts` | `core/layout/nav-items.ts` |
| `core/marco/menu-cuenta/` | `core/layout/user-menu/` |
| `core/marco/pie/` | `core/layout/footer/` |
| `core/guardas/` | `core/guards/` |
| `core/guardas/sesion-guard.ts` | `core/guards/auth-guard.ts` |
| `core/guardas/invitado-guard.ts` | `core/guards/guest-guard.ts` |
| `core/guardas/rol-guard.ts` | `core/guards/rol-guard.ts` (decisión 6) |
| `core/guardas/cambio-pendiente-guard.ts` | `core/guards/password-change-guard.ts` |
| `core/guardas/ruta-volver.ts` | `core/guards/return-url.ts` |
| `core/http/errores-interceptor.ts` | `core/http/error-interceptor.ts` |
| `core/paginas/` | `core/pages/` |
| `core/paginas/mensaje-pagina/` | `core/pages/message-page/` |
| `core/paginas/no-encontrada/` | `core/pages/not-found/` |
| `core/paginas/sin-permiso/` | `core/pages/forbidden/` |
| `core/sesion/` | `core/session/` |
| `core/sesion/sesion-service.ts` | `core/session/session-service.ts` |
| `core/sesion/inicio-rol.ts` | `core/session/home-route.ts` |
| `core/sesion/reloj.ts` | `core/session/clock.ts` |
| `core/config/adaptador-fechas.ts` | `core/config/app-date-adapter.ts` |
| `core/config/formatos-fecha.ts` | `core/config/date-formats.ts` |
| `core/config/iconos.ts` | `core/config/icons.ts` |
| `core/config/material-vistas.ts` | `core/config/material-defaults.ts` |
| `shared/formatos/` | `shared/formatting/` |
| `shared/formatos/formateadores.ts` | `shared/formatting/formatters.ts` |
| `shared/formatos/etiquetas.ts` | `shared/formatting/labels.ts` |
| `shared/formatos/fecha-pipe.ts`, `fecha-hora-pipe.ts`, `hora-pipe.ts`, `moneda-pipe.ts`, `numero-pipe.ts`, `etiqueta-pipe.ts` | `date-pipe.ts`, `date-time-pipe.ts`, `time-pipe.ts`, `currency-pipe.ts`, `number-pipe.ts`, `label-pipe.ts` |
| `testing/espacios.ts`, `testing/sesion.ts` | `testing/whitespace.ts`, `testing/session.ts` |
| `public/iconos/` | `public/icons/` |
| `styles/_paleta.scss`, `styles/_tema.scss` | `styles/_palette.scss`, `styles/_theme.scss` |
| Pruebas: `guardas.spec.ts`, `paginas.spec.ts`, las de los archivos de arriba | `guards.spec.ts`, `pages.spec.ts`, el nombre nuevo de su archivo |

### 2.2 `api/`

| Hoy | Nuevo |
|---|---|
| `ErrorApi` (y su `name: 'ErrorApi'`), `aErrorApi`, `esErrorApi` | `ApiError` (`name: 'ApiError'`), `toApiError`, `isApiError` |
| Campo `datos` de `ErrorApi` | `data` (decisión 4) |
| `Pagina<T>`, `ParametrosListado`, `ValorParametro`, `aParametros` | `Page<T>`, `ListParams`, `ParamValue`, `toParams` (los campos de la API, como `incluirInactivos`, no cambian) |
| `AuthApi.cerrarSesion()`, `MeApi.obtenerPerfil()` | `logout()`, `getProfile()` |
| `API_URL`, `AuthApi`, `MeApi` | Sin cambio |

### 2.3 `core/`

| Hoy | Nuevo |
|---|---|
| `Marco` (`sm-marco`), `VarianteMarco` (`'visitante' \| 'rol' \| 'cambio-pendiente'`), `ANCHO_MENU_FIJO` | `Layout` (`sm-layout`), `LayoutVariant` (`'guest' \| 'rol' \| 'password-change'`), `FIXED_SIDENAV_QUERY` |
| `OpcionMenu` (`ruta`, `etiqueta`, `roles`, `grupo`), `GrupoMenu` (`grupo`, `opciones`) | `NavItem` (`path`, `label`, `roles`, `section`), `NavSection` (`title`, `items`) (decisión 7) |
| `OPCIONES_MENU`, `OPCIONES_CUENTA`, `menuDe`, `Audiencia` | `NAV_ITEMS`, `USER_MENU_ITEMS`, `navFor`, `Audience` (el valor `'Visitante'` se queda, porque se une a los de `Rol`) |
| `MenuCuenta` (`sm-menu-cuenta`), `Pie` (`sm-pie`) | `UserMenu` (`sm-user-menu`), `Footer` (`sm-footer`) |
| `MensajePagina` (`sm-mensaje-pagina`; entradas `icono`, `titulo`, `mensaje`), `NoEncontrada`, `SinPermiso` | `MessagePage` (`sm-message-page`; `icon`, `heading`, `message`: `title` es un atributo global de HTML y mostraría un tooltip; decisión del usuario, 2026-11-24), `NotFound`, `Forbidden` |
| `SesionService`, el tipo `Sesion`, `CLAVE_SESION` (`'matricula.sesion'`) | `SessionService`, `Session`, `SESSION_KEY` (`'matricula.session'`, supuesto 2) |
| Métodos y signals de la sesión: `activa()`, `vencida()`, `iniciar()`, `terminar()`, `cerrarSesion()`, `terminada`, `cambioPendiente` | `isActive()`, `isExpired()`, `start()`, `end()`, `logout()`, `ended`, `passwordChangePending` |
| Datos de la sesión: `token`, `rol`, `nombre`, `accessToken`, `expiraEn`, `debeCambiarContrasena` | Sin cambio (decisión 3) |
| `sesionGuard`, `revisarSesion`, `invitadoGuard`, `rolGuard`, `cambioPendienteGuard` | `authGuard`, `checkSession`, `guestGuard`, `rolGuard` (sin cambio, decisión 6), `passwordChangeGuard` |
| `rutaVolverSegura` | `safeReturnUrl` |
| `erroresInterceptor`, `TIEMPO_ESPERA` | `errorInterceptor`, `REQUEST_TIMEOUT` |
| `RUTAS` (`oferta`, `inicioSesion`, `cambioObligatorio`, `sinPermiso`) | `APP_PATHS` (`oferta`, `login`, `passwordChange`, `forbidden`). `ROUTES` choca con el token de Angular |
| `INICIO_POR_ROL`, `EnlaceInicio`, `enlaceDeInicio`, `rutaDeInicio` | `HOME_BY_ROL`, `HomeLink`, `homeLink`, `homeRoute` (decisión 6) |
| `RELOJ` | `CLOCK` |
| `AdaptadorFechas`, `provideAdaptadorFechas` | `AppDateAdapter`, `provideAppDateAdapter`. `DateAdapter` choca con el de Material |
| `FORMATOS_FECHA`, `FORMATO_HORA` | `DATE_FORMATS`, `TIME_FORMAT` |
| `ICONOS`, `Icono`, `provideIconos`; los íconos `anterior`, `aviso`, `buscar`, `calendario`, `cerrar`, `copiar`, `editar`, `eliminar`, `exito`, `informacion`, `mostrar`, `ocultar`, `primera-pagina`, `reloj`, `salir`, `siguiente`, `ultima-pagina` | `ICONS`, `IconName`, `provideIcons`; `previous`, `warning`, `search`, `calendar`, `close`, `copy`, `edit`, `delete`, `success`, `info`, `visibility`, `visibility-off`, `first-page`, `clock`, `logout`, `next`, `last-page` (`error` y `menu` no cambian) |
| `PaginadorIntl`, `SelectorFechaIntl`, `provideMaterialVistas` | `PaginatorIntl`, `DatepickerIntl`, `provideMaterialDefaults` |
| `provideLocale` | Sin cambio |

### 2.4 `shared/` y `testing/`

| Hoy | Nuevo |
|---|---|
| `formatearFecha`, `formatearFechaHora`, `formatearHora`, `formatearMoneda`, `formatearNumero` | `formatDate`, `formatDateTime`, `formatTime`, `formatCurrency`, `formatNumber` |
| `LOCALE_INSTITUTO`, `ZONA_INSTITUTO` | `APP_LOCALE`, `APP_TIME_ZONE` |
| `etiquetar`, `TipoEtiqueta` | `toLabel`, `LabelType`. Las claves del catálogo (`rol`, `nivelCurso`, `estadoGrupo`, `motivoRetiro`, `dia`…) son de dominio y no cambian |
| Pipes `fecha`, `fechaHora`, `hora`, `moneda`, `numero`, `etiqueta` (`FechaPipe`…) | `smDate`, `smDateTime`, `smTime`, `smCurrency`, `smNumber`, `smLabel` (`SmDatePipe`, `SmDateTimePipe`, `SmTimePipe`, `SmCurrencyPipe`, `SmNumberPipe`, `SmLabelPipe`). El prefijo evita chocar con `date`, `currency` y `number` de Angular (decisión 2) |
| `normalizarEspacios`, `TRACE_ID`, `PROBLEMA_400`, `PROBLEMA_401`, `PROBLEMA_403_RN24`, `PROBLEMA_409_RN39`, `PROBLEMA_500`, `AHORA` | `normalizeWhitespace`, `TRACE_ID`, `PROBLEM_400`, `PROBLEM_401`, `PROBLEM_403_RN24`, `PROBLEM_409_RN39`, `PROBLEM_500`, `NOW` |
| `TOKEN_ESTUDIANTE`, `TOKEN_CAMBIO_PENDIENTE`, `PERFIL_ESTUDIANTE` | `ESTUDIANTE_TOKEN`, `PASSWORD_CHANGE_TOKEN`, `ESTUDIANTE_PROFILE` |

### 2.5 Estilos, entorno y scripts

| Hoy | Nuevo |
|---|---|
| Clases CSS: `barra`, `boton-menu`, `cerrar-sesion`, `contenido`, `cuenta`, `cuenta-cargando`, `cuerpo`, `enlaces-visitante`, `espacio`, `grupo`, `icono`, `lateral`, `mensaje`, `nombre`, `nombre-sistema`, `pagina`, `rol`, `activa`, `oculto` | `toolbar`, `menu-button`, `logout`, `content`, `account`, `account-loading`, `body`, `guest-links`, `spacer`, `section`, `icon`, `sidenav`, `message`, `name`, `app-name`, `page`, `rol` (sin cambio, decisión 6); también `activa` → `active` y `oculto` → `hidden` |
| `--sm-marca`, `--sm-acento`, `--sm-acento-hover`, `--sm-fondo`, `--sm-superficie`, `--sm-texto`, `--sm-texto-secundario`, `--sm-texto-deshabilitado`, `--sm-texto-sobre-marca`, `--sm-texto-sobre-acento`, `--sm-foco-sobre-marca`, `--sm-borde-control`, `--sm-secundario-activo`, `--sm-secundario-suave`, `--sm-fuente`, `--sm-espacio-1` a `5` | `--sm-brand`, `--sm-accent`, `--sm-accent-hover`, `--sm-background`, `--sm-surface`, `--sm-text`, `--sm-text-secondary`, `--sm-text-disabled`, `--sm-text-on-brand`, `--sm-text-on-accent`, `--sm-focus-on-brand`, `--sm-control-border`, `--sm-secondary-active`, `--sm-secondary-soft`, `--sm-font`, `--sm-space-1` a `5` |
| Estados `--sm-{exito,aviso,error,informacion,neutro,apagado}-{fondo,borde,texto}` | `--sm-{success,warning,error,info,neutral,muted}-{bg,border,text}` |
| `$fuente` (`_tema.scss`) | `$font` |
| `environment.nombreInstituto` | `environment.instituteName` |
| Scripts `formato`, `formato:revisar`, `api:tipos` | `format`, `format:check`, `api:types` (decisión 8) |
| Funciones de `eslint.config.js` (`restringir`, `carpeta`…) | En inglés; sus mensajes siguen en español |

Los colores no cambian: solo los nombres de las variables. No hace falta recalcular el contraste.

### 2.6 Piezas futuras (se renombran solo en los documentos)

| Hoy en la arquitectura y el mapa | Nuevo |
|---|---|
| `EstadoContenido`, `ErrorAccion` | `ContentState`, `ActionError` |
| `AvisosService`, `AvisoFijo` | `NotificationService`, `Banner` |
| `ConfirmacionesService` | `ConfirmService` |
| `BotonEnvio`, `CampoContrasena` | `SubmitButton`, `PasswordField` |
| `aplicarErroresServidor` | `applyServerErrors` |
| `ListadoPaginado`, `BarraFiltros` | `PaginatedList`, `FilterBar` |
| `EtiquetaEstado`, `EncabezadoDetalle`, `SelectorBusqueda` | `StatusBadge`, `DetailHeader`, `SearchSelect` |
| `HorarioSemanal`, `SelectorPeriodo` | `WeeklySchedule`, `PeriodoSelect` |
| `cambiosSinGuardarGuard`, `ConCambiosSinGuardar` | `unsavedChangesGuard`, `HasUnsavedChanges` |
| `shared/formularios/` y sus validadores | `shared/forms/`, validadores con nombres en inglés (`cedula` y los demás de dominio conservan esa parte: `cedulaValidator`) |
| Componentes de área: `EstudiantesListado`, `CursoDetalle`, `CursoFormulario`, `OfertaAcademica` | `EstudiantesList`, `CursoDetail`, `CursoForm`, `OfertaList` (decisión 9) |
| Ventanas: `MatricularVentana` (`V-32`), Cambiar de grupo (`V-33`) | `EnrollDialog`, `ChangeGrupoDialog` (decisión 9) |
| Métodos de los clientes: `listar`, `obtener`, `crear`, `registrar`, `editar`, `matricular`, `matricularme`, `retirar`, `cambiarGrupo`; consultas `listarRecurso` | `list`, `get`, `create`, `create`, `update`, `enroll`, `enrollMe`, `withdraw`, `changeGrupo`; `listResource` |
| `confirmar({ titulo, mensaje, accion, reforzada })` | `confirm({ title, message, action, irreversible })` (decisión 10) |
| `AvisosService.exito()`, el output `elegir(grupoId)` de `HorarioSemanal` | `NotificationService.success()`, el output `grupoSelect` (decisión 11) |
| `ConCambiosSinGuardar.tieneCambios()` | `HasUnsavedChanges.hasUnsavedChanges()` |
| Formularios: `aRequest`, `aFormulario`, `enfocarPrimerError`, `enviando`, `guardar()`, el error `servidor`, `ErrorCampo`, `ErroresFormulario`, `limites.ts`, `mensajes.ts` | `toRequest`, `toForm`, `focusFirstError`, `submitting`, `save()`, `server`, `FieldError`, `FormErrors`, `limits.ts`, `messages.ts` |
| Validadores: `politicaContrasena`, `coinciden`, `fechaNoFutura`, `fechaMinima`, `mayorQue`, `fechasPeriodo`, `finPosterior` | `passwordPolicy`, `fieldsMatch`, `notFutureDate`, `minDate`, `greaterThan`, `periodoDates`, `endAfterStart` |

## Tech Stack

Sin cambios. No se agrega ni se quita ninguna dependencia.

## Commands

```bash
pnpm install --frozen-lockfile
pnpm format:check                  # antes: pnpm formato:revisar
pnpm lint
pnpm test --watch=false
pnpm build
pnpm api:types                     # antes: pnpm api:tipos. Con la API en marcha
pnpm audit
```

**Cierre:** `pnpm format:check && pnpm lint && pnpm test --watch=false && pnpm build`, y `pnpm audit`. Después, una revisión a mano del marco y de `V-09`/`V-10` con la API en marcha, para confirmar que nada cambió a la vista.

## Project Structure

```
src/app/
  api/        schema.d.ts, models.ts, pagination.ts, api-error.ts, api-url.ts, auth-api.ts, me-api.ts
  core/
    config/   app-date-adapter.ts, date-formats.ts, icons.ts, locale.ts, material-defaults.ts
    guards/   auth-guard.ts, guest-guard.ts, rol-guard.ts, password-change-guard.ts, return-url.ts
    http/     token-interceptor.ts, error-interceptor.ts
    layout/   layout.*, nav-items.ts, user-menu/, footer/
    pages/    message-page/, not-found/, forbidden/
    session/  session-service.ts, home-route.ts, clock.ts
  shared/
    formatting/  formatters.ts, labels.ts, *-pipe.ts
    forms/       (llega con componentes)
    ui/          (llega con componentes)
  features/   acceso, oferta, cuenta, personas, catalogos, grupos, matricula, sistema (sin cambio)
src/testing/  whitespace.ts, problem-details.ts, session.ts
src/styles/   _palette.scss, _theme.scss, _theme-colors.scss
public/icons/
```

## Code Style

La regla, en un ejemplo:

```ts
// core/guards/rol-guard.ts
/** §2.5: con sesión, una vista de otro rol lleva a V-09. */
export function rolGuard(...roles: Rol[]): CanActivateFn & CanMatchFn {
  return () => {
    const session = checkSession();
    if (session !== true) return session;
    const rol = inject(SessionService).rol(); // entidad y su dato: español (decisiones 3 y 6)
    return rol !== null && roles.includes(rol) ? true : inject(Router).parseUrl(APP_PATHS.forbidden);
  };
}
```

```html
<!-- Texto visible en español; nombres y pipes, en inglés -->
<sm-message-page icon="warning" title="Sin permiso" message="Usted no tiene acceso a esta vista." />
<td>{{ matricula.fechaMatricula | smDate }}</td>
```

Los renombres se hacen con el editor o con `git mv`, para conservar la historia de cada archivo.

## Testing Strategy

- No se escriben pruebas nuevas: un renombre no agrega comportamiento. Las existentes se renombran junto con lo que prueban y **todas siguen pasando**, con el mismo número de pruebas que al cerrar `nucleo`.
- Las pruebas que buscan selectores (`sm-menu-cuenta`, `sm-pie span`) o clases CSS se ajustan a los nombres nuevos.
- Un `grep` final comprueba que no quedan los nombres viejos en `src/`, `public/`, la configuración, `AGENTS.md`, `docs/arquitectura.md`, `docs/requerimientos.md`, `README.md` y el mapa (salvo su historial).
- **Manual:** con la API en marcha, el marco del visitante y de un rol, el menú de la cuenta, el pie, `V-09` y `V-10` se ven igual que antes, con sus íconos.

## Boundaries

- **Siempre:**
  - Commit después de cada tarea, en la rama `nombres` (decisión 5 del mapa).
  - Cada tarea deja el proyecto compilando y con las pruebas en verde.
- **Preguntar antes:**
  - Un nombre que no esté en las tablas y que la regla no deje claro (decisión 5).
  - Cualquier cambio que no sea un renombre.
- **Nunca:**
  - Cambiar un texto visible, una ruta, un parámetro de la URL, un color o un dato de la API.
  - Editar `schema.d.ts` a mano (se regenera con `pnpm api:types`, que solo cambia de destino).
  - Reescribir los documentos históricos.

## Success Criteria

1. `pnpm format:check`, `pnpm lint`, `pnpm test --watch=false` y `pnpm build` pasan, con el mismo número de pruebas que al cerrar `nucleo` (20 archivos y 197 pruebas), y `pnpm audit` sigue sin hallazgos altos ni críticos.
2. Los nombres de las tablas 2.1 a 2.5 están aplicados, y la búsqueda de los nombres viejos no da resultados fuera de los documentos históricos y del historial del mapa.
3. `pnpm api:types` genera `src/app/api/schema.d.ts`, idéntico al `esquema.d.ts` anterior.
4. `docs/arquitectura.md` §10.1 tiene la regla nueva, y el resto de la arquitectura, `AGENTS.md`, el mapa, `docs/requerimientos.md` y `README.md` usan los nombres nuevos, incluidos los de la tabla 2.6.
5. `AGENTS.md` pide preguntar el nombre o el idioma de algo cuando la regla no lo deja claro.
6. Con la API en marcha, el marco, el menú de la cuenta, el pie, `V-09` y `V-10` se ven y se comportan igual que antes.

## Supuestos

1. **Los documentos históricos no se reescriben.** Las specs y las tareas cerradas cuentan lo que se hizo; el historial del mapa anota cuándo cambiaron los nombres y remite a esta spec.
2. **La clave de `sessionStorage` cambia a `matricula.session`.** Todavía no hay usuarios con una sesión guardada; lo único que pasa es que quien tenga una sesión abierta en desarrollo vuelve a iniciar sesión.
3. **La versión no sube.** Es un cambio interno, sin efecto para quien usa la aplicación; queda en `0.2.0`.

## Decisiones

1. **Verbos en inglés** (2026-11-24, decidido por el usuario), también en las acciones propias del negocio: `enroll()`, `withdraw()`, `changeGrupo()`.
2. **Prefijo `sm` en los pipes propios** (2026-11-24, decidido por el usuario): `smDate`, `smCurrency`… Evita chocar con los pipes de Angular.
3. **Los datos de las entidades se quedan en español** (2026-11-24, decidido por el usuario), con el nombre que les da la API, aunque estén dentro de una pieza con nombre en inglés: `session.rol()`, `nombre`, `debeCambiarContrasena`.
4. **`ErrorApi.datos` pasa a `data`.** No es un dato de una entidad, sino el lugar donde `ApiError` guarda las extensiones del `ProblemDetails`.
5. **Ante la duda, preguntar** (2026-11-24, pedido por el usuario): si la regla no deja claro el nombre o el idioma de algo, se pregunta en lugar de elegir.
6. **"Rol" se queda en español también en los nombres técnicos** (2026-11-24, decidido por el usuario): `rolGuard`, `rol-guard.ts`, `HOME_BY_ROL`, la clase CSS `rol` y la variante `'rol'` de `LayoutVariant`.
7. **Las secciones del menú del administrador son `section`** (2026-11-24, decidido por el usuario): `NavItem.section` y `NavSection`. `group` se confundiría con la entidad `Grupo`.
8. **Los scripts pasan a inglés** (2026-11-24, decidido por el usuario): `format`, `format:check` y `api:types`.
9. **Componentes de las vistas: la entidad y un sufijo de interfaz** (2026-11-24, decidido por el usuario en T1): `OfertaList`, `CursoDetail`, `CursoForm`. Las ventanas de una acción llevan el verbo en inglés: `EnrollDialog` (`V-32`), `ChangeGrupoDialog` (`V-33`).
10. **La confirmación reforzada es `irreversible`** (2026-11-24, decidido por el usuario en T1): `confirm({ title, message, action, irreversible })`.
11. **Avisos y outputs** (2026-11-24, decidido por el usuario en T1): `NotificationService.success()`. Los outputs llevan la entidad y el evento: `grupoSelect`.
