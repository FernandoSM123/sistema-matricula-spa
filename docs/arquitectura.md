# Arquitectura y buenas prácticas — SPA Sistema de Matrícula

> **Estado:** aprobado (2026-11-20). Modificado el 2026-11-26 en la corrección `sesiones` T5: la renovación de la sesión con el refresh token de la API (§2.2, §3.5, §4.1 a §4.3, §4.5 y §9). Modificado el 2026-11-24 en la corrección `nombres` T1: el dominio en español y lo técnico en inglés (§10.1), con los nombres nuevos en todo el documento. Modificado el 2026-11-23: B-05 resuelta en el backend (COR-02); se quita el comportamiento provisional del `429`. Modificado el 2026-11-23 en `fundacion` T1: versiones instaladas (§1), nombre del instituto (§6.6, §11.3) y commits por tarea (§10.3). Modificado el 2026-11-24 en `nucleo` T6: menú de la cuenta en diferido (§8.3). Modificado el 2026-11-24 en `nucleo` T4: precisiones de las guardas (§4.3). Modificado el 2026-11-24 en `nucleo` T3: `name` y `message` en `ErrorApi` (§3.5) y `terminar()` sin motivo (§4.2). Modificado el 2026-11-24 en `nucleo` T1: resultado de la primera generación de tipos (§3.2, B-06 y B-07, resueltas con COR-03) y, por la carga inicial, el adaptador de fechas y la duración de los avisos salen de `app.config.ts` (§6.1, §7.3). Spec: [SPEC-arquitectura.md](../specs/SPEC-arquitectura.md) · Tareas: [tasks/arquitectura/todo.md](../tasks/arquitectura/todo.md).

Este documento fija con qué y cómo se construye el frontend del sistema de matrícula: una SPA en Angular que consume la API de `../sistema-matricula-api`. **Qué** hace el frontend está en [`requerimientos.md`](requerimientos.md), y **cómo se ve cada vista**, en [`wireframes/`](wireframes/index.html). Aquí se citan sus códigos (`V-xx`, `RFF-xx`, `RUI-xx`) sin repetirlos.

Busca lo mismo que la [arquitectura del backend](../../sistema-matricula-api/docs/arquitectura.md): una arquitectura **simple, ordenada por funcionalidad y fácil de mantener, sin sobreingeniería**. Las reglas de negocio las valida la API; el frontend las muestra y, a lo sumo, las anticipa (§1.2 de los requerimientos).

**Contenido:**
1. [Stack](#1-stack)
2. [Arquitectura del código](#2-arquitectura-del-código)
3. [Integración con la API](#3-integración-con-la-api)
4. [Sesión y seguridad en el cliente](#4-sesión-y-seguridad-en-el-cliente)
5. [Formularios y validación](#5-formularios-y-validación)
6. [Componentes y estilo visual](#6-componentes-y-estilo-visual)
7. [Formatos, fechas y zona horaria](#7-formatos-fechas-y-zona-horaria)
8. [Buenas prácticas de Angular](#8-buenas-prácticas-de-angular)
9. [Pruebas](#9-pruebas)
10. [Convenciones](#10-convenciones)
11. [Comandos y configuración](#11-comandos-y-configuración)
12. [Orden sugerido de implementación](#12-orden-sugerido-de-implementación)

---

## 1. Stack

Versiones verificadas el 2026-11-20 (`npm view` y una prueba desechable, T1 de la lista de tareas). Se instalan **exactas**, sin `^` ni `~` (§10). Todas las dependencias tienen licencia MIT, salvo TypeScript (Apache-2.0).

**Versiones instaladas en `fundacion` (2026-11-23):** Angular 22.3.0, Vitest 5.1.1 y angular-eslint 22.8.0 tenían menos de una semana y `minimumReleaseAge` (§10.4) las rechaza. Por decisión del usuario se instalaron las anteriores, con más de una semana: Angular 22.2.6 (CLI y `@angular/build` 22.2.7), Material, CDK y el adaptador de date-fns 22.2.7, Vitest 5.1.0 y angular-eslint 22.7.0 (con ESLint 10.15.0, `@eslint/js` 10.0.1 y typescript-eslint 8.72.1). Se sube a 22.3 con `ng update` en un módulo posterior, cuando cumpla la semana.

| Pieza | Elección | Por qué |
|---|---|---|
| Lenguaje | **TypeScript 6.0**, en modo estricto | Es la versión que pide Angular 22 (`>=6.0 <6.1`). La 7.0 ya salió, pero Angular 22 no la admite |
| Framework | **Angular 22.2** (22.3 más adelante, ver la nota de arriba): componentes standalone, sin `zone.js` (zoneless) | Elegido por el usuario. Trae incluidos lo que piden los requerimientos: router con guardas (§2.5), `HttpClient` con interceptores (RFF-03, RUI-03) y formularios con validación (RUI-06). Zoneless es el valor por defecto del CLI |
| Runtime de desarrollo | **Node 24 LTS** | Soporte largo. Angular 22 pide `^22.22.3`, `^24.15.0` o `>=26` |
| Gestor de paquetes | **pnpm 12.21**, fijado en `packageManager` del `package.json` | Elegido por el usuario. No ejecuta scripts de instalación que no estén autorizados, puede exigir una antigüedad mínima a las versiones nuevas, y su `node_modules` estricto impide importar lo que no está declarado (§10) |
| Build y servidor de desarrollo | **`@angular/build`**, el del CLI (esbuild y Vite) | El que trae el CLI. No hace falta configurar un bundler |
| Componentes | **Angular Material + CDK 22.2** | Elegido por el usuario. Oficiales y con las mismas versiones que Angular. Resuelven la accesibilidad de §6 (foco en las ventanas, teclado) y traen las piezas de los wireframes: tabla, paginador, ventanas, avisos temporales, selector de fecha que permite escribir, selector de hora y autocompletado |
| Estado | **Signals** (`signal`, `computed`, `linkedSignal`) en los componentes y en los servicios de `core` | El único estado compartido es la sesión. El resto es de cada vista |
| Lectura de datos | **`httpResource`** para las consultas (`GET`) y **`HttpClient`** para las acciones (`POST`, `PUT`, `DELETE`) | `httpResource` es estable desde Angular 22.0. Se vuelve a pedir solo cuando cambian sus parámetros (filtros, página) y expone el estado de la carga, que alimenta RUI-13 sin código repetido. RxJS 7.8 viene con Angular y se usa solo donde una API de Angular lo pide |
| Formularios | **Reactive Forms tipados** | Elegido por el usuario el 2026-11-20. Signal Forms también es estable desde la 22.0, pero Reactive Forms es más maduro y está probado con todos los controles de Material |
| Fechas en los selectores | **date-fns 4.4** con **`@angular/material-date-fns-adapter` 22.2**, extendido por un adaptador propio | Lee `dd/mm/aaaa` escrito a mano y rechaza fechas inválidas (RUI-15, verificado en T1). El adaptador propio formatea las horas con `Intl`, porque date-fns escribe "6:30 PM" o "6:30 p.m.", y RUI-17 pide "6:30 p. m." (§7) |
| Fechas para mostrar | **`Intl`** del navegador (`DateTimeFormat`, `NumberFormat`) con `es-CR` y `timeZone: 'America/Costa_Rica'` | Da la hora (RUI-16, RUI-17) y la moneda (RUI-18) en el formato pedido sin otra dependencia (§7) |
| Horario semanal | **FullCalendar 7.1** (`fullcalendar` y `@fullcalendar/angular` 7.1.5, con `temporal-polyfill` 1.0.8), solo para la grilla | Propuesto por el usuario. La vista `timeGridWeek` cubre la grilla de RFF-29 con bloques que se repiten cada semana. En pantallas angostas, el componente dibuja su propia lista por día, porque la lista de FullCalendar no cabe en 360 px (T1, §6) |
| Tipos de la API | **openapi-typescript 7.13**, solo en desarrollo | Genera los tipos de los DTO desde `/openapi/v1.json` (§3). Avisa que espera TypeScript 5, pero genera bien con TypeScript 6 (T1) |
| Pruebas | **Vitest 5.1** con **jsdom**, el corredor de `ng test` | El que trae el CLI. Solo pruebas unitarias; las e2e quedan diferidas (§9) |
| Calidad | **angular-eslint 22.7** (con ESLint y typescript-eslint) y **Prettier 3.10** | Lo estándar en Angular. Prettier ya viene con el CLI. ESLint también hace cumplir las dependencias entre carpetas (§2.3) |
| Idioma | `LOCALE_ID` `es-CR` con `registerLocaleData` | Un solo idioma (§1.3 de los requerimientos) |
| Navegadores | Los objetivos de compilación por defecto del CLI, sin un `.browserslistrc` propio | Los navegadores que soporta Angular incluyen las dos últimas versiones de Chrome, Edge, Firefox y Safari, en escritorio y en celular, que es lo que pide §6 de los requerimientos. `temporal-polyfill` cubre la API `Temporal` que FullCalendar necesita en los navegadores que aún no la traen. El primer módulo lo confirma en los cuatro navegadores |

**Lo que no se usa (para mantenerlo simple):**

| Pieza | Por qué no |
|---|---|
| NgRx, NgRx Signal Store u otra librería de estado | Solo la sesión es estado compartido, y un servicio con signals alcanza |
| NgModules y `zone.js` | Los componentes standalone y la detección de cambios zoneless son los valores por defecto de Angular 22 |
| Un cliente HTTP generado (NSwag, openapi-generator, orval) | Agrega mucho código generado y otra herramienta. Los clientes a mano son cortos y usan los tipos generados (§3) |
| Signal Forms | Decisión del usuario (fila "Formularios") |
| Tailwind, Bootstrap u otro framework CSS junto con Material | Dos sistemas de estilos que compiten. Material y sus variables cubren el estilo (§6) |
| Moment, Luxon o date-fns-tz | `Intl` resuelve la zona horaria y los formatos, y date-fns solo hace falta para los selectores |
| Una librería de tablas aparte | `mat-table` y `mat-paginator` alcanzan, porque la API pagina, filtra y ordena (RUI-10) |
| La vista de lista de FullCalendar | No cabe en 360 px; se reemplaza por una lista propia (T1) |
| SSR, hidratación o un framework encima de Angular | Es una SPA detrás de un inicio de sesión, sin necesidad de SEO |
| El sistema i18n de Angular (`@angular/localize`) | La interfaz es solo en español |
| Karma y Jasmine | El CLI usa Vitest |

---

## 2. Arquitectura del código

### 2.1 Resumen

El código se organiza en **cuatro carpetas** dentro de `src/app/`, con una regla clara de quién puede usar a quién (§2.3):

| Carpeta | Propósito | Habla con la API | Estado | Elementos |
|---|---|:---:|:---:|---|
| **`api/`** | El contrato con el backend | ✔ (es la única que usa `HttpClient`) | ✘ | Tipos generados, clientes por recurso, paginación y el error de la API (`ApiError`) |
| **`core/`** | Lo que existe una sola vez en la aplicación | ✔ vía `api/` | ✔ (la sesión) | Sesión, interceptores, guardas, layout de la aplicación, páginas del sistema y configuración |
| **`shared/`** | Piezas reutilizables que no conocen la API ni la sesión | ✘ | ✘ | Componentes del catálogo de los wireframes, formatos y utilidades de formularios |
| **`features/`** | Las vistas, agrupadas en áreas | ✔ vía `api/` | ✔ (de cada vista) | Una carpeta por área, cargada en diferido, con sus rutas y sus vistas |

**No hay una capa de "servicios de dominio" entre las vistas y la API.** Las reglas las aplica el backend. Un servicio extra solo repetiría los métodos de los clientes de `api/`, así que las vistas los usan directamente, como los servicios del backend usan `DbContext` sin repositorios (§2.1 de su arquitectura).

### 2.2 Detalle por carpeta

```
src/
  main.ts                       Arranque: bootstrapApplication(App, appConfig)
  environments/                 URL base de la API por entorno (§3, §11)
  app/
    app.ts                      Componente raíz: el layout y el <router-outlet>
    app.config.ts               Providers: router, HttpClient con interceptores, API_URL, locale es-CR e íconos. El adaptador de fechas y las opciones de Material van en la ruta de cada área (§6.1)
    app.routes.ts               Una ruta por área, con carga diferida y guardas (§2.5)
    api/
    core/
    shared/
    features/
```

**`api/`**: el único lugar que conoce las URL y los DTO de la API.
- `schema.d.ts`: los tipos generados por openapi-typescript. **No se edita a mano** (§3).
- `models.ts`: alias legibles de los tipos generados, por ejemplo `export type GrupoResponse = components['schemas']['GrupoResponse']`. El resto del código importa de aquí, no del archivo generado.
- `pagination.ts`: `Page<T>` (`{ items, page, pageSize, totalCount }`) y los parámetros comunes (`page`, `pageSize`, `search`, `incluirInactivos`).
- `api-error.ts`: `ApiError`, el error ya interpretado: `status`, `code`, `detail`, `errors` por campo, `traceId` y `retryAfter` (§3).
- `api-url.ts`: el `InjectionToken` con la URL base, que `app.config.ts` toma de `environments/`.
- `http-context.ts`: `NO_SESSION`, la marca de las peticiones que no usan la sesión (la renovación, §4.2).
- Un cliente por recurso de la API: `auth-api.ts`, `me-api.ts`, `administradores-api.ts`, `estudiantes-api.ts`, `profesores-api.ts`, `usuarios-api.ts`, `cursos-api.ts`, `periodos-api.ts`, `aulas-api.ts`, `grupos-api.ts`, `matriculas-api.ts`, `oferta-api.ts`, `auditoria-api.ts` y `errores-api.ts`. Cada uno tiene un método por endpoint y devuelve tipos de `models.ts`. No tiene lógica ni estado.

**`core/`**: piezas que existen una sola vez. Las vistas usan sus servicios, pero no sus componentes.
- `session/`: `SessionService`, con la sesión como signal (token, refresh token, rol, nombre, cambio pendiente) y su renovación. Es el único que lee y escribe `sessionStorage` (§4).
- `http/`: los interceptores funcionales. `tokenInterceptor` agrega el token (y lo renueva antes si venció), y `errorInterceptor` convierte las respuestas de error en `ApiError` y maneja el `401` (renovando) y el `403 RN-24` (RFF-03, RUI-03).
- `guards/`: las guardas funcionales de la §2.5: sesión, invitado, rol, cambio pendiente y cambios sin guardar (§4).
- `layout/`: el encabezado, el menú por rol de la §2.3, el menú de la cuenta y el pie de página (RUI-23). Es el `Layout`, que en los wireframes se llama "marco".
- `pages/`: `V-09` Sin permiso y `V-10` Página no encontrada. Y el catálogo de componentes (`/componentes`, decisión 1 de `SPEC-componentes`): las piezas de `shared/ui` y `shared/forms` con datos de ejemplo, para revisarlas contra `docs/wireframes/componentes.html`. No pide sesión, ningún menú ni enlace lleva a él y se carga en diferido. Cada pieza nueva de `shared/` agrega ahí su ejemplo.
- `config/`: el locale, el adaptador de fechas propio (§7) y las opciones por defecto de Material.

**`shared/`**: piezas sin dependencias de la sesión ni de la API, que reciben todo por `input()` y avisan por `output()`.
- `ui/`: los componentes del catálogo de los wireframes (`docs/wireframes/componentes.html`): listado paginado, barra de filtros, confirmación, avisos, estados de contenido, etiqueta de estado, error de una acción y `WeeklySchedule` (§6).
- `formatting/`: los pipes de fecha, fecha y hora, hora, moneda y etiquetas de enums (RUI-15 a RUI-19, §7).
- `forms/`: los validadores de RUI-06, la función que aplica los errores del servidor a los campos (RUI-02) y el componente que muestra el error de un campo (§5).

**`features/`**: una carpeta por área (§2.4). Cada área tiene:
- `<area>.routes.ts`: sus rutas, con las guardas de rol de cada vista.
- Una carpeta por vista, con el componente de la vista (que carga sus datos) y, si hace falta, sus componentes internos.
- `index.ts`, solo si otra área la usa (§2.3): exporta lo que se comparte y nada más.

### 2.3 Dependencias entre carpetas

```
app.routes ── import() diferido ──► features/<area> ──► features/matricula (index.ts)
                                      │    │    │
                                      │    │    └──────────────────► api/
                                      │    └──► shared/ ── tipos ──► api/
                                      └──► core/ ──► shared/ y api/
```

| Carpeta | Puede importar de |
|---|---|
| `api/` | Nada del SPA, solo de Angular |
| `shared/` | `api/`, **solo tipos** (`import type`) |
| `core/` | `api/` y `shared/` |
| `features/<area>` | `core/` (sus servicios y guardas), `shared/`, `api/` y el `index.ts` de otra área, solo según la tabla de §2.4 |
| `app.*` | `core/`, y las áreas solo con `import()` diferido |

- La dirección es una sola y sin ciclos: `shared` no conoce `core`, y `api` no conoce a nadie.
- **Navegar no es depender:** un `routerLink` a la vista de otra área no la importa. Las áreas se enlazan libremente; solo importan componentes de otra área cuando abren una de sus ventanas.
- Las reglas se hacen cumplir con ESLint (`no-restricted-imports` por carpeta, §10), no solo con la revisión.

### 2.4 Áreas

Las áreas siguen las secciones del catálogo de vistas (§3 de los requerimientos), así que cada vista se encuentra donde la define el documento de requerimientos. Cada vista pertenece a una sola área.

| Área | Vistas | Rutas | Roles | Importa de otra área |
|---|---|---|---|---|
| `acceso` | `V-02`, `V-03`, `V-04`, `V-05` | `/iniciar-sesion`, `/cambio-obligatorio`, `/olvido-contrasena`, `/registro` | Visitante; `V-03`, quien tiene un cambio pendiente | — |
| `oferta` | `V-01` | `/oferta` | Todos | `matricula` (`V-32`) |
| `cuenta` | `V-06`, `V-07`, `V-08` | `/mi-perfil`, `/cambiar-contrasena`, `/mis-datos-contacto` | Con sesión; `V-08`, solo el estudiante | — |
| `personas` | `V-11` a `V-19` | `/administradores`, `/estudiantes`, `/profesores`, cada una con `/nuevo`, `/:id` y `/:id/editar` | Administrador | `matricula` (`V-32`, `V-33` y el retiro, en `V-16`) |
| `catalogos` | `V-20` a `V-27` | `/cursos`, `/periodos`, `/aulas`, con `/nuevo`, `/:id` y `/:id/editar` según la vista | Según la vista (§3.5 de los requerimientos) | `matricula` (`V-32` desde `V-22`) |
| `grupos` | `V-28`, `V-29`, `V-30` | `/grupos`, `/grupos/nuevo`, `/grupos/:id`, `/grupos/:id/editar` | `V-28` y `V-29`, administrador; `V-30`, con sesión (RN-18) | `matricula` (`V-32` y el retiro de los inscritos, en `V-30`) |
| `matricula` | `V-31` a `V-35` | `/mis-matriculas`, `/mi-horario`, `/mis-grupos`. `V-32` y `V-33` son ventanas, sin ruta propia | Estudiante y profesor; las ventanas, también el administrador | — |
| `sistema` | `V-36`, `V-37`, `V-38` | `/auditoria`, `/errores`, `/errores/:id` | Administrador | — |
| `core/pages` | `V-09`, `V-10` | `/sin-permiso` y cualquier ruta desconocida (`**`). Además, `/componentes`: el catálogo de componentes, que no es una vista de los requerimientos (§2.2) | Todos | — |

En total son 38 vistas: 4 + 1 + 3 + 9 + 8 + 3 + 5 + 3 + 2.

- **`matricula` es la única área que se comparte**, porque sus ventanas (`V-32` Matricular, `V-33` Cambiar de grupo) y el retiro se abren desde vistas de otras áreas (§3.7 de los requerimientos y supuesto 2 de los wireframes). Su `index.ts` exporta solo esas ventanas y la acción de retiro. Como `matricula` no importa de ninguna otra área, no hay ciclos.
- La ruta de inicio (`/`) lleva a la página de inicio del rol (§2.2 de los requerimientos): `/oferta` para el visitante, `/mis-matriculas` para el estudiante, `/mis-grupos` para el profesor y `/grupos` para el administrador.
- Los nombres de las rutas son definitivos desde aquí: los enlaces del menú (§2.3 de los requerimientos), las guardas y los avisos de RUI-04 los usan.

### 2.5 Carga diferida

- **Por área:** cada área se carga con `loadChildren: () => import('./features/<area>/<area>.routes')`. La carga inicial incluye solo `core` (layout, sesión, interceptores, guardas) y lo de Material que usa el marco.
- **Opciones de Material:** cada área registra `provideMaterialDefaults()` en los `providers` de su ruta raíz (`<area>.routes.ts`), para que los módulos de los campos, el paginador y el selector de fecha no entren en la carga inicial (§6.1).
- **Por rol:** las áreas de un solo rol (`personas`, `sistema`) se protegen con `canMatch`, no con `canActivate`. Así su código ni siquiera se descarga para los demás roles. Las áreas compartidas filtran por rol en cada ruta.
- **FullCalendar:** `WeeklySchedule` lo carga con `@defer`, y solo en pantallas anchas. Agrega unos 400 kB (T1), que solo se descargan en `V-16`, `V-19`, `V-27` y `V-34`, al mostrar la grilla. En pantallas angostas no se descarga.
- La meta concreta de la carga inicial y los presupuestos de tamaño se fijan en §8.

### 2.6 Flujo de una vista (ej. matricular desde la oferta)

El estudiante matricula un grupo desde `V-01` (RFF-30):

1. **Ruta.** `/oferta` carga en diferido el área `oferta`. Es pública: para el visitante no hay guarda, pero la vista sabe por `SessionService` si hay un estudiante con sesión.
2. **Carga de datos.** `OfertaList` crea un `httpResource` con `OfertaApi` a partir de los signals de los filtros y la página. Mientras carga, o si viene vacía o con un error, `ContentState` muestra el estado de RUI-13. Si hay un estudiante con sesión, un segundo recurso pide sus matrículas activas para marcar "Ya matriculado".
3. **Ventana.** "Matricular" abre `EnrollDialog` (`V-32`), importada del `index.ts` de `matricula`, con `MatDialog`. La ventana recibe el grupo y muestra el resumen.
4. **Acción.** "Matricular en el grupo" deshabilita el botón y muestra que está trabajando (RUI-08). La ventana llama a `MatriculasApi.enrollMe(grupoId)`, que hace `POST /me/matriculas`.
5. **Interceptores.** `tokenInterceptor` agrega `Authorization: Bearer`. Si la respuesta es un error, `errorInterceptor` lo convierte en un `ApiError`. Si es un `401`, cierra la sesión y lleva al inicio de sesión con la ruta de vuelta (RFF-03). Si es un `403 RN-24`, lleva a `V-03` (RFF-02). Los demás errores siguen hasta la ventana.
6. **API.** Valida RN-01 a RN-06 y la concurrencia del cupo, y responde.
7. **Éxito (`201`).** La ventana se cierra, un aviso temporal confirma la matrícula (RUI-21) y la aplicación abre `V-31` (RFF-30).
8. **Rechazo (`409`).** La ventana sigue abierta y `ActionError` muestra el `detail` junto a la acción, con el título según el `code` (RFF-30). Con `CONCURRENCIA`, ofrece "Intentar de nuevo", que vuelve a cargar el grupo (RUI-04). Un `429`, un `500` o la falta de respuesta se muestran en el mismo lugar, como fija RUI-03 (§3).

Los componentes nunca usan `HttpClient` ni leen un `ProblemDetails` crudo: reciben tipos de `models.ts` y, si algo falla, un `ApiError`.

### 2.7 Convenciones de la arquitectura

- **Por funcionalidad, no por tipo:** las vistas de un área viven juntas; no hay carpetas globales `components/` ni `services/`.
- **Una vista, un componente de ruta:** el componente de la vista carga sus datos y maneja sus acciones. Sus componentes internos solo reciben datos por `input()` y avisan por `output()`.
- **Solo `api/` usa `HttpClient`**, y solo `core/session/` usa `sessionStorage`.
- **El estado de un listado vive en la URL:** los filtros y la página son parámetros de la ruta, de modo que recargar la página o volver atrás los conserva (RUI-11, §3).
- **No se reimplementan reglas de negocio.** La interfaz puede anticipar una regla para orientar, por ejemplo ocultando "Matricular" en un grupo sin cupo, pero la respuesta de la API es la que vale (§1.2 de los requerimientos).

---

## 3. Integración con la API

El contrato lo define la API (`/openapi/v1.json` y las specs del backend). Esta sección dice cómo lo consume el frontend. Todo vive en `api/` (§2.2), salvo los interceptores, que están en `core/http/`.

### 3.1 URL base y `HttpClient`

- **URL base por entorno** (§6 de los requerimientos, "Configuración por entorno"). Va en `src/environments/environment.ts` (producción) y `environment.development.ts` (desarrollo: `http://localhost:5022/api/v1`). El build elige uno con `fileReplacements`. `app.config.ts` la entrega con el token `API_URL`, y ningún otro archivo la escribe. La URL de producción se fija al decidir el despliegue (diferido).
- **CORS:** en desarrollo, el SPA corre en `http://localhost:5173`, el origen que permite la API (§11). No hay proxy de desarrollo.
- **`HttpClient`** se registra con `provideHttpClient(withInterceptors([tokenInterceptor, errorInterceptor]))`. Usa fetch por defecto; `withFetch()` está obsoleto en Angular 22 y no se agrega.
- **Tiempo de espera:** las peticiones usan la opción `timeout` de `HttpClient` con 30 segundos. Si se agota, cuenta como "sin respuesta" (RUI-03, tabla de §3.5).

### 3.2 Tipos generados desde el OpenAPI

- **Generación:** `pnpm api:types` ejecuta `openapi-typescript http://localhost:5022/openapi/v1.json -o src/app/api/schema.d.ts` (§11). Necesita la API en marcha.
- **El archivo generado se versiona** en el repositorio y **no se edita a mano**. Así el build no depende de que la API esté en marcha, y cada cambio del contrato aparece como un diff en git.
- **Cuándo se regenera:**
  - Al crear el proyecto.
  - Antes de empezar un módulo que use endpoints nuevos.
  - Cuando el backend publica una corrección (`../sistema-matricula-api/correcciones/`).

  Si el diff cambia un tipo que ya se usa, el compilador marca los lugares afectados. Eso cumple "Compatibilidad con la API" (§6 de los requerimientos).
- **`models.ts`** da nombres legibles a los tipos generados (`export type CursoResponse = components['schemas']['CursoResponse']`). El resto del código importa de ahí.
- **Tipos de la API, tal como llegan:**
  - Los enums son uniones de textos (`'Abierto' | 'Cerrado' | …`); sus etiquetas legibles están en `shared/formatting` (RUI-19, §7).
  - Las fechas son textos: `DateOnly` llega como `'2026-03-05'`, `TimeOnly` como `'18:30:00'` y las marcas de tiempo, en ISO 8601 UTC.
  - **No se convierten a `Date` en los modelos.** Solo se convierten al mostrarlas (pipes) y en los formularios (§7).
- **Revisión de la primera generación (`nucleo` T1, 2026-11-24):** el OpenAPI declaraba los números como `integer | string` (B-06) y los enums como `integer` sin valores (B-07), porque el generador lee las opciones JSON HTTP de ASP.NET Core y el backend solo configuraba las de MVC. Las dos brechas se resolvieron en la API ([COR-03](../../sistema-matricula-api/correcciones/COR-03-contrato-openapi.md)), y los tipos generados quedan como `number` y uniones de textos, sin parchear el archivo generado. `api/models.spec.ts` lo comprueba con pruebas de tipos: si un cambio del contrato los vuelve a ensanchar, falla la compilación de las pruebas.

### 3.3 Clientes por recurso

Un cliente por recurso de la API (§2.2), sin lógica ni estado. Las **consultas** devuelven un `httpResource` y las **acciones**, un `Observable` de `HttpClient`:

```ts
// api/cursos-api.ts
@Injectable({ providedIn: 'root' })
export class CursosApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_URL)}/cursos`;

  /** GET /cursos. Se llama desde un inicializador de campo del componente (contexto de inyección). */
  listResource(filters: () => CursosFilters) {
    return httpResource<Page<CursoResponse>>(() => ({ url: this.url, params: toParams(filters()) }));
  }

  create(body: CrearCursoRequest) {
    return this.http.post<CursoResponse>(this.url, body);
  }
}
```

- Los métodos de consulta terminan en `Resource` y reciben una función con los parámetros. Así el recurso se vuelve a pedir solo cuando cambian.
- **Las acciones se consumen con `await firstValueFrom(...)`** dentro de un `try/catch` que recibe un `ApiError` (§3.5). Así se lee en orden: enviar, esperar y presentar.
- `toParams()` (en `api/pagination.ts`) quita los valores vacíos y convierte los booleanos y los números a texto.
- Los endpoints "lo mío" (`/me/...`) están en `me-api.ts`, y el cliente nunca envía el id del usuario de la sesión (RN-18).

### 3.4 Listados: paginación y filtros en la URL

- **La URL es el estado del listado** (RUI-11): búsqueda, filtros y página son parámetros de la ruta, con **los mismos nombres que la API** (`search`, `page`, `pageSize`, `incluirInactivos` y los propios de cada listado). Por eso se conservan al volver atrás, al recargar y al compartir el enlace.
- El componente del listado recibe los parámetros como `input()` (con `withComponentInputBinding()` en el router), y el `httpResource` los usa. Aplicar un filtro es navegar a la misma ruta con otros parámetros. Al cambiar un filtro se vuelve a `page=1` (RUI-11).
- **Página:** 20 filas por defecto, con opciones de 10, 20 y 50 (RUI-10). La API admite hasta 100. El rango y el total ("21–40 de 134") salen de `page`, `pageSize` y `totalCount`.
- El listado paginado y la barra de filtros son componentes de `shared/ui` (§6). La vista solo declara las columnas y los filtros.
- La búsqueda se aplica con Enter o con "Buscar" (RUI-11). Los selectores con búsqueda de los formularios sí sugieren mientras se escribe, con un pequeño retardo para no pedir en cada tecla.

### 3.5 Errores de la API

`errorInterceptor` convierte toda respuesta de error en un **`ApiError`**. Los componentes nunca leen un `HttpErrorResponse` ni un `ProblemDetails` crudo (RUI-05):

```ts
// api/api-error.ts
export interface ApiError {
  name: 'ApiError';                 // con `message`, httpResource lo entrega tal cual, sin envolverlo (nucleo T3)
  message: string;                   // texto técnico ('HTTP 409 RN-39'); nunca se muestra (RUI-05)
  status: number;                    // 0 si no hubo respuesta
  code?: string;                     // 'RN-05', 'RF-47', 'CONCURRENCIA'… (extensión `code` del ProblemDetails)
  detail?: string;                   // mensaje para el usuario, ya en español (RUI-01)
  errors: Record<string, string[]>;  // errores por campo del 400 (RUI-02)
  traceId?: string;                  // código para reportar un 500 (RUI-03)
  retryAfter?: number;               // segundos del 429, del encabezado `Retry-After`
  data: Record<string, unknown>;     // otras extensiones, p. ej. `usuarioId` del 409 RN-39
}
```

**Quién maneja cada respuesta y cómo se presenta:**

| Respuesta | Quién la maneja | Presentación |
|---|---|---|
| `401` de una petición que llevaba token | `errorInterceptor` (global) | Renueva la sesión y repite la petición una vez. Si no se puede renovar, sesión terminada: descarta la sesión y abre `V-02` con el aviso y la ruta de vuelta (RFF-03, §4.2) |
| `401` sin token (inicio de sesión) | `V-02` | Mensaje genérico, el `detail` (RFF-01) |
| `403` con `code: "RN-24"` | `errorInterceptor` | Abre `V-03` (RFF-02) |
| `403` con `code: "RN-29"` | `V-02` | Cuenta desactivada (RFF-01) |
| `403` sin `code` o con `RN-18`, al cargar una vista | La vista, con `ContentState` | Muestra `V-09` sin cambiar la dirección (`skipLocationChange`) |
| `403` sin `code` o con `RN-18`, en una acción | `ActionError` | El `detail` junto a la acción |
| `404` al cargar una vista | La vista, con `ContentState` | "El registro no existe", con el enlace al listado (§2.5 de los requerimientos) |
| `404` de un dato referenciado en un formulario | El formulario | El error en ese campo |
| `400` | El formulario, con `applyServerErrors()` | Cada mensaje en su campo, comparando los nombres sin distinguir mayúsculas (`Cedula` ↔ `cedula`); los que no tienen campo, arriba del formulario (RUI-02, §5) |
| `409` | `ActionError`, con las acciones que le pasa la vista | El `detail` destacado junto a la acción, más la acción adicional según el `code` (RUI-04): "Reactivar" (`RN-39`, con el id de `data`), la alternativa a eliminar (`RN-34`), el enlace a lo que lo impide (`RN-36`, `RN-37`), los enlaces de `RN-21` e "Intentar de nuevo" (`CONCURRENCIA`). `RF-09` y `RN-25` van al campo de la contraseña. Un `code` desconocido solo muestra el mensaje |
| `429` | `ActionError` | Con `retryAfter`: "Demasiados intentos. Intente de nuevo en N segundos", y el envío queda deshabilitado N segundos con cuenta regresiva (RUI-03). La API expone `Retry-After` por CORS desde COR-02. Si una respuesta llegara sin el encabezado, muestra el `detail` sin cuenta regresiva |
| `500` | `ActionError` en una acción; `ContentState` al cargar | "Ocurrió un error inesperado. Si el problema continúa, reporte este código: `<traceId>`", con el botón "Copiar" (RUI-03) |
| Sin respuesta (`status: 0`, sin conexión o tiempo agotado) | `ActionError` o `ContentState` | "No se pudo conectar con el servidor. Revise su conexión e intente de nuevo", con "Reintentar" (RUI-03) |

- **Solo los errores de la API** (`API_URL`) se convierten. Los de otras peticiones, como los íconos que descarga Material, siguen como `HttpErrorResponse`. `isApiError()` distingue un `ApiError` de otro error.
- **Regla general (RUI-01):** el texto es el `detail` de la API. El frontend solo pone textos propios donde la tabla lo indica: `500`, sin respuesta y el `429` con N.
- **Los errores de una acción se muestran junto a ella** (en el formulario o en la ventana) y nunca borran lo que el usuario escribió (RUI-01). Por eso los maneja el componente y no un aviso global. Los únicos que se manejan globalmente son el `401` con sesión y el `403 RN-24`, porque cambian de vista.

---

## 4. Sesión y seguridad en el cliente

### 4.1 La sesión

`SessionService` (`core/session/`) es el único estado compartido de la aplicación y el único que usa `sessionStorage` (§2.7).

| Dato | De dónde sale | Para qué |
|---|---|---|
| `accessToken` | Respuesta del login, de `cambio-obligatorio`, de `cambiar-contrasena` y de `refresh` (las cuatro devuelven un `TokenResponse`) | El encabezado `Authorization` |
| `expiraEn` | La misma respuesta | Saber si el token de acceso venció (15 minutos, RN-50) y renovarlo antes de enviar (§4.2) |
| `refreshToken` | La misma respuesta. `null` en el login con temporal (RN-52) | El cuerpo de `POST /auth/refresh` (RF-60) |
| `refreshExpiraEn` | La misma respuesta. `null` en el login con temporal. No cambia al renovar (RN-50) | El fin de la sesión: 8 horas desde el inicio de sesión (§4.3) |
| `rol` | La misma respuesta | Menú, rutas y página de inicio (§2.2 y §2.3 de los requerimientos) |
| `debeCambiarContrasena` | La misma respuesta | La guarda del cambio pendiente (RN-24) |
| `nombre` | `GET /me` (`datosPersonales`), después del login. Se conserva al renovar | El menú de la cuenta. Con un cambio pendiente, `GET /me` responde `403 RN-24`, así que `V-03` no lo muestra |

- **Guardado:** una sola clave (`matricula.session`) en **`sessionStorage`**, como JSON, con la marca `tabOpen` (pestaña duplicada, abajo). Al arrancar se lee, y si la sesión ya terminó, se descarta.
- **El fin de la sesión** es `refreshExpiraEn`, o `expiraEn` si no hay refresh token (temporal). Con el token de acceso vencido y la sesión vigente, la sesión sigue activa: `isActive()` es verdadero y la siguiente petición renueva el token.
- **Por qué `sessionStorage`** (decisión del usuario): sobrevive a recargar la página y se borra al cerrar la pestaña. Cada pestaña inicia su propia sesión. El refresh token va en el cuerpo de la petición, no en una cookie, justamente para mantener ese modelo (`SPEC-sesiones` de la API).
- **Riesgo aceptado:** un script inyectado (XSS) podría leer el token o el refresh token. Las medidas que lo mitigan están en §4.5. El refresh token solo sirve una vez (RN-51) y la sesión dura 8 horas como máximo.
- **Renovación (RF-60):** `refresh()` cambia el refresh token por un par nuevo y devuelve `'renewed'`, `'ended'` (la API respondió `401`, o no hay nada que renovar) o, si la renovación no está disponible (sin respuesta, `429`, `5xx`), el `ApiError` de la renovación. **Una sola renovación a la vez por pestaña:** las llamadas que llegan mientras tanto reciben la misma promesa, porque usar un refresh token ya reemplazado terminaría la sesión (RN-51). `refresh()` no descarta la sesión ni navega: lo deciden los interceptores (§4.2) y el cierre de sesión. Si la sesión terminó o se reemplazó mientras tanto, la respuesta se descarta.
- **Se descarta** al cerrar sesión (aunque `POST /auth/logout` falle, RFF-04), cuando la sesión no se puede renovar (RFF-03) y al arrancar con una sesión terminada.
- **Se reemplaza** con el par nuevo de `cambio-obligatorio` (RFF-02), de `cambiar-contrasena` (RFF-09) y de cada renovación.
- **Pestaña duplicada** (decisión 3 de `SPEC-sesiones`): al duplicar una pestaña, el navegador copia su `sessionStorage`, y las dos tendrían el mismo refresh token; la primera que renueva dejaría a la otra con uno ya reemplazado, y la API terminaría la sesión en las dos (RN-51). Por eso `tabOpen` vale `true` mientras la pestaña está abierta, `false` después de `pagehide` y `true` otra vez en `pageshow` desde el historial. Si al arrancar ya estaba en `true`, el almacenamiento es una copia: la pestaña empieza sin sesión y sin aviso. Una recarga pasa antes por `pagehide` y conserva la sesión.
- **Varias pestañas:** cerrar sesión en una invalida todas las sesiones de la cuenta en la API, así que las demás no pueden renovar y aplican RFF-03 en su siguiente petición.
- Los componentes leen la sesión con signals (`session.rol()`, `session.isActive()`), nunca de `sessionStorage`.

### 4.2 Interceptores

- **`tokenInterceptor`:**
  - Agrega `Authorization: Bearer <token>` **solo a las peticiones a `API_URL`**. El token nunca se envía a otro origen.
  - Las peticiones marcadas con `NO_SESSION` (`api/http-context.ts`) van sin token: la renovación es anónima y no debe esperar otra renovación.
  - Si el token de acceso venció según `expiraEn` (con un margen de 30 segundos) y la sesión tiene refresh token, primero espera `refresh()` y envía con el token nuevo. Si la renovación falla, envía igual, y la respuesta sigue el camino de siempre.
- **`errorInterceptor`:**
  - Convierte cada error en un `ApiError` (§3.5).
  - **`401` de una petición que llevaba token**, con la sesión todavía activa:
    - Llama a `refresh()`. Con `'renewed'`, **repite la petición una vez** con el token nuevo. Es seguro también en un `POST`: con `401`, la API no la ejecutó. La repetición lleva una marca en una copia de su `HttpContext`, y si vuelve a dar `401`, se aplica RFF-03 sin renovar otra vez.
    - Con `'ended'`: llama a `SessionService.end()`, que descarta la sesión, y navega a `/iniciar-sesion?volver=<ruta actual>&aviso=sesion-terminada` (RFF-03).
    - Si la renovación no está disponible: no descarta la sesión ni navega. La petición falla con el error de la renovación, que el componente presenta según §3.5, y la siguiente petición intenta renovar de nuevo.
  - Un `401` sin token es una credencial inválida (lo maneja `V-02`) o el rechazo de la renovación (lo resuelve `refresh()`).
  - **`403 RN-24`:** navega a `/cambio-obligatorio`.
  - Si varias peticiones fallan con `401` a la vez, se hace una sola renovación. Si no se puede renovar, solo la primera navega.
- **La ruta de vuelta (`volver`)** solo se acepta si es una ruta interna (empieza con `/` y no con `//`). Así nadie puede usar el enlace de inicio de sesión para redirigir a otro sitio. Después del login se usa solo si el rol puede abrir esa ruta (RFF-01).

### 4.3 Guardas (§2.5 de los requerimientos)

Funciones en `core/guards/`, una por regla:

| Situación (§2.5) | Guarda | Dónde | Resultado |
|---|---|---|---|
| Sin sesión, o con la sesión terminada según `refreshExpiraEn` (o `expiraEn` sin refresh token), entra a una vista protegida | `authGuard` | Todas las rutas protegidas | `/iniciar-sesion?volver=<ruta>`. Si estaba terminada, con el aviso de RFF-03. Con solo el token de acceso vencido, deja pasar: la siguiente petición lo renueva |
| Con sesión, entra al inicio de sesión, al registro o al olvido | `guestGuard` | `V-02`, `V-04`, `V-05` | Página de inicio del rol |
| Con un cambio de contraseña pendiente (RN-24) | `authGuard` (lo revisa después de la sesión) | Todas las rutas protegidas, menos `V-03` | `/cambio-obligatorio` |
| Entra a `V-03` sin un cambio pendiente | `passwordChangeGuard` | `V-03` | Página de inicio del rol |
| Con sesión, entra a una vista de otro rol | `rolGuard(...roles)` | Como `canMatch` en las áreas de un solo rol (§2.5) y como `canActivate` en las vistas | `/sin-permiso` (`V-09`) |
| La API responde `401` durante el uso | — (`errorInterceptor`) | — | Renueva y repite; si no se puede, RFF-03 (§4.2) |
| La dirección no existe | Ruta `**` | `app.routes.ts` | `V-10` |
| El registro no existe (`404`) | — (la vista) | — | §3.5 |
| Sale de un formulario con cambios sin guardar (RUI-09) | `unsavedChangesGuard` | `canDeactivate` de los formularios | Confirmación "¿Descartar los cambios?" (RUI-07). No pregunta si la salida es porque la sesión terminó (RFF-03) |

- **`rolGuard` aplica primero la regla de `authGuard`** (sin sesión, terminada o con un cambio pendiente), así sirve sola como `canMatch` de un área de un solo rol. Las dos toman `volver` de la navegación en curso (`router.currentNavigation()`), porque `canMatch` no recibe el `RouterStateSnapshot`, y así conservan los parámetros de la dirección (`nucleo` T4).
- **El aviso de sesión terminada** solo aparece si la sesión termina durante el uso. Al arrancar, una sesión terminada o copiada de otra pestaña se descarta sin aviso (§4.1).
- **Inicio (`/`):** una función de redirección envía a la página de inicio del rol, o a `/oferta` sin sesión (§2.2 de los requerimientos).
- `unsavedChangesGuard` funciona con cualquier componente que implemente `HasUnsavedChanges` (`hasUnsavedChanges(): boolean`). Para saber si la sesión terminó, consulta `SessionService`.

### 4.4 Lo que se muestra según el rol

- El menú sale de una sola lista de opciones (`ruta`, `etiqueta`, `roles`) en `core/layout/`, que sigue §2.3 de los requerimientos. Solo se muestran las opciones del rol.
- Las acciones dentro de una vista se muestran con `@if` según el rol y el estado del registro (por ejemplo, las acciones de `V-30` según el estado del grupo, RFF-25). **Es solo una ayuda:** la API valida todos los permisos, y si rechaza, se aplica §3.5 (§6 de los requerimientos, "Seguridad en el cliente").

### 4.5 Reglas de seguridad

- **Contraseñas** (§6 de los requerimientos y `AGENTS.md`):
  - Solo existen en el control del formulario que las pide.
  - No se copian a signals, servicios, almacenamiento ni registros.
  - El formulario se limpia después de enviarlas.
  - Los campos usan `autocomplete="current-password"` o `"new-password"`, y el botón "Mostrar" solo cambia el `type` del campo.
- **El token y el refresh token** nunca van en la dirección ni se escriben en la consola. El refresh token solo sale en el cuerpo de `POST /auth/refresh`. **No hay `console.*` en el código de la aplicación** (regla de ESLint, §10).
- **Contra XSS:**
  - Nunca se usa `innerHTML` con datos de la API ni `bypassSecurityTrust*`. Angular escapa las interpolaciones por defecto.
  - No se cargan scripts de terceros ni de CDN (§6).
  - En producción, una Content Security Policy se define con el despliegue (diferido).
- **HTTPS en producción** para el SPA y la API (§6 de los requerimientos).

## 5. Formularios y validación

Los formularios usan **Reactive Forms tipados** (§1) con los controles de Material. La validación del cliente **avisa antes de enviar**, pero la que decide es la de la API (RUI-06, §1.2 de los requerimientos).

### 5.1 Estructura de un formulario

- El formulario se arma con `inject(NonNullableFormBuilder).group({...})`, así que sus tipos salen de los controles y `reset()` vuelve a los valores iniciales.
- **Formulario y DTO son cosas distintas.** Una función `toRequest(form.getRawValue())` en la carpeta de la vista arma el DTO de la API:
  - Quita los espacios de los extremos.
  - Convierte un opcional vacío en `null`.
  - Convierte las fechas a `'yyyy-MM-dd'` y las horas a `'HH:mm:ss'` (§7).

  La función inversa, `toForm(response)`, llena el formulario de edición.
- **Controles:**
  - Campos de texto: `mat-form-field` con apariencia `outline` y `mat-label` siempre visible; nunca solo un placeholder (§6 de los requerimientos).
  - Fechas: `mat-datepicker`. Horas: `mat-timepicker` con un intervalo de 15 minutos (§7).
  - Listas cortas: `mat-select`. Selectores con búsqueda: `SearchSelect` (§6).

### 5.2 Validadores (RUI-06)

En `shared/forms/`. Los límites viven en un solo archivo, `limits.ts`, con un comentario que cita el validador del backend del que salen:

| Dato | Validación en el cliente |
|---|---|
| Cédula | `required`, `maxLength(20)` y `cedula` (el patrón `^[A-Za-z0-9-]+$`) |
| Nombre, apellidos, especialidad | `required` (salvo la especialidad) y `maxLength(100)` |
| Teléfono | `required` y `telefono` (el patrón `^[0-9 +-]{8,20}$`) |
| Correo | `required`, `email` y `maxLength(256)` |
| Contraseña nueva | `passwordPolicy`: al menos 8 caracteres, una mayúscula y un número (RN-26), hasta 128. Y `fieldsMatch('contrasena', 'confirmacion')` en el grupo (RN-25) |
| Dirección | `maxLength(250)` |
| Fecha de nacimiento | `notFutureDate` y `minDate(1900-01-01)` |
| Fecha de contratación | `minDate(1900-01-01)` |
| Curso | Código hasta 20, nombre hasta 150, descripción hasta 1000, `greaterThan(0)` en la duración, `min(0)` en el costo y nivel `required` |
| Aula | Código hasta 20, ubicación hasta 150 y `greaterThan(0)` en la capacidad |
| Periodo | Nombre hasta 50, las cinco fechas `required` y `periodoDates` en el grupo (RN-16) |
| Grupo | NRC hasta 10, `greaterThan(0)` en el cupo y el aula según la modalidad, como validador del grupo (supuesto 2 de `SPEC-grupos`) |
| Bloque de horario | Día `required` y `endAfterStart` en el grupo (RN-15) |

- Cada validador devuelve un error con nombre, y los mensajes están en un solo mapa de `shared/forms/messages.ts`, con trato de usted (RUI-22) y la redacción de los validadores del backend. Por ejemplo: `passwordPolicy` → "Use al menos 8 caracteres, con una mayúscula y un número". La cédula y el teléfono usan validadores propios (`cedula`, `telefono`) en lugar de `Validators.pattern`, para que cada uno tenga su mensaje. `errorMessage(errors, field)` da el mensaje del primer error; `field` es el dato con su artículo, para "Indique la cédula." (`componentes` T2).
- **Cuándo se muestran:** al salir del campo o al intentar enviar, no mientras se escribe (RUI-06). Es lo que hace `mat-error` por defecto (el control debe estar tocado o el formulario, enviado). Los obligatorios llevan la marca de Material en la etiqueta.

### 5.3 Errores del servidor

- **`applyServerErrors(form, error)`** recorre `error.errors` (RUI-02):
  - Busca cada clave en los controles **sin distinguir mayúsculas** (`Cedula` ↔ `cedula`). También acepta rutas con punto, como `Horarios.HoraFin`.
  - Marca el control con el error `server` (el primer mensaje) y lo da por tocado.
  - Devuelve los mensajes que no encontraron campo, que `FormErrors` muestra arriba del formulario.
- **Los `409` que van a un campo** (`RF-09` y `RN-25`, RUI-04) usan la misma función, con un mapa `code → campo` que define la vista.
- El error `server` desaparece cuando el usuario cambia ese campo, porque Angular vuelve a validar y no lo conserva.
- **Nada de esto borra lo escrito** (RUI-01).

### 5.4 Envío

```ts
protected readonly submitting = signal(false);

protected async save() {
  if (this.form.invalid) { this.form.markAllAsTouched(); focusFirstError(this.element); return; }
  this.submitting.set(true);                                  // RUI-08: botón deshabilitado y con indicador
  try {
    await firstValueFrom(this.cursosApi.create(toRequest(this.form.getRawValue())));
    this.form.markAsPristine();                             // la guarda de RUI-09 ya no pregunta
    this.notifications.success('Curso registrado');                  // RUI-21
    await this.router.navigate(['/cursos', ...]);
  } catch (e) {
    this.error.set(e as ApiError);                          // §3.5: campo, arriba del formulario o ActionError
    applyServerErrors(this.form, e as ApiError);
  } finally {
    this.submitting.set(false);
  }
}
```

- **Si es inválido no se envía:** se marcan los errores y el foco va al primer campo con error, para el teclado y los lectores de pantalla.
- **`SubmitButton`** (de `shared/ui`) muestra el indicador de trabajo y se deshabilita mientras `submitting()` es verdadero, o durante la espera de un `429` (§3.5).
- **Guardar no pide confirmación** (RUI-07). Las acciones que sí la piden (por ejemplo, cambiar el correo, RFF-13) llaman primero a `ConfirmService.confirm()` (§6).

### 5.5 Cambios sin guardar (RUI-09)

- Los componentes de formulario implementan `HasUnsavedChanges` con `hasUnsavedChanges = () => this.form.dirty`, y su ruta usa `unsavedChangesGuard` (§4.3). Al guardar se llama a `markAsPristine()`, así que salir después no pregunta.
- Si el usuario recarga o cierra la pestaña con cambios, el formulario activa el aviso nativo del navegador (`beforeunload`). Su texto lo pone el navegador.
- Si la sesión terminó (RFF-03), no se pregunta: `unsavedChangesGuard` deja salir (§4.3).

---

## 6. Componentes y estilo visual

### 6.1 Angular Material

- **Se usan sus controles directamente** en las vistas: campos, `mat-select`, `mat-datepicker`, `mat-timepicker`, `mat-autocomplete`, botones, casillas, pestañas y menús. **Los patrones que se repiten** (listado, filtros, confirmación, avisos, estados) se envuelven en componentes de `shared/ui`, para que cada vista no los arme a su manera (punto 2 de `SPEC-wireframes`).
- **Opciones por defecto** en `core/config/`:
  - Campos: `MAT_FORM_FIELD_DEFAULT_OPTIONS` con `appearance: 'outline'` y `subscriptSizing: 'dynamic'`.
  - Avisos temporales: duran 5 segundos.
  - Textos en español: `MatPaginatorIntl` ("Filas por página" y el rango "21–40 de 134", RUI-10) y `MatDatepickerIntl`.
- **Dónde se registran** (decisión del usuario, `fundacion` T6):
  - En `app.config.ts` no va ninguna opción de Material (`nucleo` T1). Hasta entonces, `provideMaterial()` fijaba ahí la duración de los avisos, pero importar el token `MAT_SNACK_BAR_DEFAULT_OPTIONS` metía todo el módulo de avisos (con overlay y botones) en la carga inicial: 129 kB, medido. **La duración de 5 segundos la fija `NotificationService`** (`componentes`) en cada aviso. No puede ir en la ruta de cada área, porque `MatSnackBar` vive en la raíz y lee sus opciones de ahí.
  - `provideMaterialDefaults()` (`core/config/material-defaults.ts`): los campos, el paginador, el selector de fecha y el adaptador de fechas (§7.3). **Cada área lo registra en los `providers` de su ruta diferida** (§2.5), y nada de la carga inicial importa ese archivo. Si la raíz importara `MatDatepickerIntl` o `MAT_FORM_FIELD_DEFAULT_OPTIONS`, el primer uso de esos controles en una vista diferida metería sus módulos completos en un chunk compartido de la carga inicial: medido en `fundacion`, 708 kB contra 500 kB.
- **El layout** (`core/layout/`) usa `mat-toolbar` para la barra superior, `mat-sidenav` para el menú y `mat-menu` para el menú de la cuenta. El menú es lateral fijo desde 960 px y plegable por debajo (wireframes).

### 6.2 Componentes del catálogo de los wireframes

Cada componente de `docs/wireframes/componentes.html` tiene su pieza:

| # | Componente | Pieza | Reglas |
|---|---|---|---|
| 1 | Listado paginado | `PaginatedList` (`shared/ui`): `mat-table` y `mat-paginator`. Por debajo de 600 px dibuja tarjetas con las mismas columnas: la columna principal encabeza la tarjeta y las demás llevan su rótulo. Las columnas se declaran una sola vez en la vista | RUI-10, RUI-13, RUI-14 |
| 2 | Búsqueda y filtros | `FilterBar` (`shared/ui`): campo de búsqueda con "Buscar" y Enter, los filtros de la vista proyectados, "Incluir inactivos" (`mat-checkbox`) y "Limpiar filtros" cuando hay alguno aplicado. Avisa por `output()` y la vista navega con los nuevos parámetros (§3.4) | RUI-11, RUI-12 |
| 3 | Formulario | `mat-form-field` y `mat-error` con `FieldError`, que traduce el error a su mensaje; `FormErrors` arriba; `SubmitButton`; `PasswordField`, con "Mostrar" (§5) | RUI-02, RUI-06, RUI-08 |
| 4 | Selectores de fecha y hora | `mat-datepicker` y `mat-timepicker` (con un intervalo de 15 minutos) con `AppDateAdapter` (§7) | RUI-15, RUI-17 |
| 5 | Selector con búsqueda | `SearchSelect` (`shared/ui`), sobre `mat-autocomplete`. Recibe una función de búsqueda, sugiere mientras se escribe (con un retardo de 300 ms y hasta 10 opciones), guarda el id y muestra el texto | RUI-11 |
| 6 | Ventanas de confirmación | El servicio `ConfirmService` (`shared/ui`), sobre `MatDialog`: `confirm({ title, message, action, irreversible })` devuelve `Promise<boolean>`. La irreversible (`irreversible: true`) destaca que no se puede deshacer y deja el foco inicial en "Cancelar". `MatDialog` lleva el foco a la ventana y lo devuelve al cerrarla | RUI-07, §6 |
| 7 | Mensajes | El servicio `NotificationService` (`MatSnackBar`): `success()`, de 5 segundos, que se anuncia sin interrumpir. `Banner` (componente en línea), para lo que requiere una acción (`correoEnviado: false`). `ActionError` (con `role="alert"`) recibe un `ApiError` y las acciones de la vista, y dibuja todas las filas de §3.5: `409` con su acción, `429` con cuenta regresiva, `500` con el `traceId` y "Copiar" (`Clipboard` del CDK), y la falta de respuesta con "Reintentar" | RUI-03, RUI-04, RUI-21 |
| 8 | Estados de contenido | `ContentState` (`shared/ui`): recibe el estado del `httpResource` y si hay filtros aplicados. Muestra cargando (solo la primera vez; las recargas mantienen el contenido con una barra de progreso), vacío, vacío con filtros, error con "Reintentar", "no existe" (`404`) y sin permiso (`403`, §3.5) | RUI-13 |
| 9 | Etiquetas de estado | `StatusBadge` (`shared/ui`): recibe el tipo y el valor, y muestra la etiqueta de RUI-19 con el tono de §6.6 | RUI-19, RUI-20 |
| 10 | Grilla del horario semanal | `WeeklySchedule` (§6.3), con `PeriodoSelect` | RFF-29 |
| 11 | Encabezado de detalle y pestañas | `DetailHeader` (`shared/ui`): título, etiqueta de estado y las acciones proyectadas. Las pestañas son `mat-tab-group`, y la pestaña activa va en la URL (`?pestana=matriculas`), para que los enlaces de RUI-04 (`RN-36`, `RN-37`) abran la pestaña correcta | RFF-16 |

### 6.3 `WeeklySchedule`

- **Es de presentación pura.** Recibe los bloques (`dia`, `horaInicio`, `horaFin`, `grupoId`, `nrc`, `curso` y el aula o el profesor, según la vista) y avisa con `grupoSelect(grupoId)`. La vista navega a `V-30`.
- **El periodo** lo elige `PeriodoSelect` (`shared/ui`). Lo dibuja la vista, que le pasa los periodos y el vigente. Si `GET /periodos/vigente` responde `404`, la vista pide elegir un periodo (RFF-29).
- **Pantalla ancha (desde 600 px): FullCalendar 7**, cargado con `@defer` (§2.5), con la configuración verificada en T1:
  - Vista `timeGridWeek` sin barra (`headerToolbar: false`) y sin franja de "todo el día" (`allDaySlot: false`). La semana empieza el lunes (`firstDay: 1`) y el locale se importa de `fullcalendar/locales/es`.
  - Los encabezados muestran solo el nombre del día (`dayHeaderFormat: { weekday: 'long' }`). El domingo se oculta (`hiddenDays: [0]`) salvo que haya bloques ese día.
  - Las filas van de la hora del primer bloque a la del último, redondeadas a la hora (`slotMinTime`, `slotMaxTime`).
  - Los bloques se repiten cada semana (`daysOfWeek`, `startTime` y `endTime`), con el día traducido de `Lunes`…`Domingo` a 1…0.
  - Los rótulos de las horas (`slotHeaderContent`) y el contenido de los bloques (`eventContent`) se dibujan con los formateadores de §7, porque FullCalendar no deja el espacio en "8:00 a. m." (T1).
  - El día de hoy no se resalta: es un horario semanal, no un calendario.
  - **El estilo** se ajusta con las variables de su paleta (`--fc-classic-*`, mapeadas a las de §6.6) y con sus opciones `eventClass`, `dayHeaderClass` y `slotHeaderClass`. **Nunca con selectores de sus clases internas**, que llevan hash y cambian entre versiones.
- **Pantalla angosta (menos de 600 px): una lista propia por día**, hecha con un `@for` agrupado, como en el wireframe. No descarga FullCalendar. La vista de lista de FullCalendar no se usa, porque no cabe en 360 px (T1).
- **Accesibilidad:** cuando se muestra la grilla, la misma lista por día queda disponible para los lectores de pantalla (oculta a la vista con la clase `cdk-visually-hidden`). Así el horario se puede leer sin depender de la grilla.
- **Sin bloques**, muestra el mensaje de horario vacío (RFF-29).

### 6.4 Diseño adaptable

- **Puntos de corte** (los de `BreakpointObserver` del CDK):
  - Menos de 600 px: celular. Tablas en tarjetas y horario en lista.
  - Menos de 960 px: menú plegable.
  - Desde 960 px: menú lateral fijo.
- Las vistas del visitante y del estudiante se diseñan primero para celular, y las del administrador, para escritorio, sin dejar de ser usables en celular (§6 de los requerimientos).
- **Ninguna vista se desplaza en horizontal a 360 px.** Las tablas pasan a tarjetas, la grilla a lista, y los encabezados de detalle y las barras de filtros se apilan.
- El pie de página (RUI-23) también se apila en pantallas angostas.

### 6.5 Accesibilidad (§6 de los requerimientos)

| Requerimiento | Cómo se cumple |
|---|---|
| Todo se usa con el teclado, en orden lógico | Controles de Material y del CDK. El orden del DOM es el visual, y no hay `tabindex` positivos |
| El foco siempre es visible | `:focus-visible` con un contorno de 2 px del color de acento; sobre la barra superior, el foco claro de §6.6 |
| Cada campo tiene etiqueta visible, y sus errores están asociados | `mat-label` siempre. `mat-error` queda asociado al campo con `aria-describedby` |
| Contraste suficiente; el color nunca es la única señal | La tabla de contraste de §6.6. `StatusBadge` siempre tiene texto (RUI-20) |
| Las ventanas reciben el foco y lo devuelven | `MatDialog` (`autoFocus` y `restoreFocus`). En la irreversible, el foco inicial va a "Cancelar" (RUI-07) |
| Elementos táctiles cómodos en celular | Botones con un área táctil de al menos 44 × 44 px por debajo de 600 px; los botones de solo ícono crecen con relleno |
| Imágenes e íconos con significado tienen texto alternativo | Los botones de solo ícono llevan `aria-label`; los íconos decorativos, `aria-hidden="true"` |
| Los mensajes llegan a los lectores de pantalla | `NotificationService` se anuncia sin interrumpir; `ActionError` usa `role="alert"` |

### 6.6 Estilo visual

**Colores con la regla 60-30-10.** Es una paleta propia, porque el proyecto no tiene marca. Vive en un solo archivo, `src/styles/_palette.scss`, como variables CSS (`--sm-*`); cambiarla no toca los componentes.

| Proporción | Uso | Variable | Color |
|---|---|---|---|
| **60 %, neutro** | Fondo de la página | `--sm-background` | `#F5F7FA` |
| | Superficies: tarjetas, tablas, formularios, ventanas | `--sm-surface` | `#FFFFFF` |
| | Texto principal | `--sm-text` | `#1A2230` |
| | Texto secundario (rótulos, ayudas, rangos) | `--sm-text-secondary` | `#4A5565` |
| | Borde de los controles | `--sm-control-border` | `#7A8597` |
| | Texto deshabilitado | `--sm-text-disabled` | `#8B95A5` |
| **30 %, secundario** | Barra superior | `--sm-brand` (texto `#FFFFFF`) | `#1E3A5F` |
| | Menú lateral, encabezados de tabla y de detalle | `--sm-secondary-soft` | `#E3EAF3` |
| | Opción activa del menú | `--sm-secondary-active` (texto `--sm-brand`) | `#C9D7E8` |
| **10 %, acento** | La acción principal de la vista (una por vista), enlaces, foco, selección (casillas, pestaña activa, página actual) | `--sm-accent` (texto `#FFFFFF`) | `#0F766E` |
| | Acento al pasar el puntero o presionar | `--sm-accent-hover` | `#115E59` |
| | Foco sobre la barra superior | `--sm-focus-on-brand` | `#7DD3C8` |

- **Los botones secundarios** son de contorno, con el color del texto principal, no del acento. Así el acento queda solo para lo que debe llamar la atención.
- **Los colores de estado van aparte de la regla.** Se usan poco y siempre con texto (RUI-20):

| Tono | Texto | Fondo | Borde | Se usa en |
|---|---|---|---|---|
| Éxito | `#166534` | `#DCFCE7` | `#16A34A` | Grupo `Abierto`, matrícula `Activa`, "Activo"; aviso de éxito |
| Error | `#B42318` | `#FEE4E2` | `#B42318` | Grupo `Cancelado`; errores de campo y de acción |
| Aviso | `#854D0E` | `#FEF3C7` | `#B45309` | Grupo `Cerrado`; avisos fijos (`correoEnviado: false`) |
| Información | `#1E40AF` | `#DBEAFE` | `#1E40AF` | Grupo `EnCurso` |
| Neutro | `#374151` | `#F1F3F6` | `#7A8597` | Grupo `Planificado` |
| Apagado | `#4A5565` | `#F1F3F6` | `#7A8597` (discontinuo) | Grupo `Finalizado`, matrícula `Retirada`, "Inactivo" (RUI-12) |

**Contraste calculado** (fórmula de WCAG 2, 2026-11-20). El mínimo es 4,5:1 para el texto normal, y 3:1 para el texto grande, los bordes de los controles y los indicadores de foco:

| Combinación | Relación | Mínimo |
|---|---|---|
| Texto principal sobre fondo / superficie | 14,88 / 15,96 | 4,5 |
| Texto secundario sobre superficie / fondo | 7,56 / 7,04 | 4,5 |
| Texto principal / secundario sobre secundario suave | 13,17 / 6,24 | 4,5 |
| Marca sobre secundario activo (opción activa del menú) | 7,87 | 4,5 |
| Blanco sobre la barra superior | 11,50 | 4,5 |
| Foco sobre la barra superior | 6,59 | 3 |
| Blanco sobre acento / acento hover (botón principal) | 5,47 / 7,58 | 4,5 |
| Acento como enlace sobre superficie / fondo | 5,47 / 5,10 | 4,5 |
| Acento como foco sobre superficie | 5,47 | 3 |
| Borde de control sobre superficie / fondo | 3,73 / 3,48 | 3 |
| Éxito: texto sobre su fondo · borde sobre superficie | 6,49 · 3,30 | 4,5 · 3 |
| Error: texto sobre su fondo · sobre superficie | 5,45 · 6,57 | 4,5 |
| Aviso: texto sobre su fondo · borde sobre superficie | 6,15 · 5,02 | 4,5 · 3 |
| Información: texto sobre su fondo | 7,15 | 4,5 |
| Neutro / apagado: texto sobre su fondo | 9,27 / 6,80 | 4,5 |
| Texto deshabilitado sobre superficie | 3,03 | — (WCAG no exige contraste a lo deshabilitado) |

Un color nuevo o cambiado vuelve a calcular su contraste antes de usarse (§10).

**Cómo se aplica a Material:**
- En `styles.scss`, `@include mat.theme(...)` define el tema claro con una paleta generada desde el acento con `ng generate @angular/material:theme-color`.
- `@include mat.theme-overrides(...)` fija los tokens de sistema que importan (`primary`, `on-primary`, `surface`, `on-surface`, `outline`, `error`…) a las variables `--sm-*`.
- Las variables de FullCalendar (`--fc-classic-*`) se mapean a las mismas en ese archivo, cuando se instale FullCalendar (`grupos`, con `WeeklySchedule`).
- Solo hay tema claro, porque el modo oscuro está fuera del alcance (§1.3 de los requerimientos).

**Tipografía:** la fuente del sistema (`system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`), con la escala de tipos de Material y una base de 16 px. No se descarga ninguna fuente, así que no hay CDN ni dependencia, y la carga inicial no espera una fuente.

**Íconos:** archivos SVG de **Material Symbols** (licencia Apache-2.0) copiados a `public/icons/` y registrados con `MatIconRegistry.addSvgIcon` en `core/config/`. No se usa la fuente de íconos ni un CDN, y no se agrega una dependencia. Solo se copian los que se usan: menú, buscar, cerrar, editar, eliminar, mostrar u ocultar, copiar, calendario, reloj, éxito, aviso, error, información, flechas de paginación y salir. El aviso de la licencia queda junto a los archivos.
- **Registro (`fundacion` T5, nombres en inglés desde la corrección `nombres`):** `provideIcons()` en `core/config/icons.ts` registra cada ícono con su nombre, que es también el nombre del archivo: `menu`, `search`, `close`, `edit`, `delete`, `visibility`, `visibility-off`, `copy`, `calendar`, `clock`, `success`, `warning`, `error`, `info`, `first-page`, `previous`, `next`, `last-page` y `logout`. Se usan con `<mat-icon svgIcon="search" />`.
- **Excepción a `bypassSecurityTrust*`** (decisión del usuario, 2026-11-23): `addSvgIcon` exige un `SafeResourceUrl`, que solo se obtiene con `bypassSecurityTrustResourceUrl`. Se usa solo en `icons.ts` y sobre rutas fijas del propio sitio. Material descarga los SVG con `HttpClient`, así que `app.config.ts` registra `provideHttpClient()` desde `fundacion`; `nucleo` le agrega los interceptores.

**Espaciado:** una escala de 4, 8, 16, 24 y 32 px (`--sm-space-1` a `--sm-space-5`). Ningún componente usa medidas sueltas.

**Nombre del instituto (RUI-23):** "Instituto de Cursos Libres" (decidido por el usuario el 2026-11-23). Va como constante en `environments/`, junto con la versión del frontend (§11), y el pie lo lee de ahí.

---

## 7. Formatos, fechas y zona horaria

**Un solo lugar para cada formato:** funciones puras en `shared/formatting/formatters.ts`. Las usan los pipes, el adaptador de fechas y `WeeklySchedule`, y se prueban una vez (§9).

### 7.1 Locale

- `registerLocaleData(localeEsCR)` (de `@angular/common/locales/es-CR`) y `LOCALE_ID` `'es-CR'`.
- Para los selectores, `MAT_DATE_LOCALE` es el locale `es` de date-fns, que no tiene variante de Costa Rica. La semana empieza el lunes (verificado en T1).
- La zona del instituto es una constante, `APP_TIME_ZONE = 'America/Costa_Rica'`. **Ningún formato depende de la zona horaria del dispositivo** (§6 de los requerimientos).

### 7.2 Cada tipo de dato

| Dato | Llega de la API | Se muestra | Se ingresa y se envía | Regla |
|---|---|---|---|---|
| Fecha (`DateOnly`) | `'2026-03-05'` | `05/03/2026`, con el pipe `smDate`. Se arma desde el texto, **sin crear un `Date` ni convertir la zona** | `mat-datepicker`, que también deja escribir `dd/mm/aaaa`. Se envía como `'yyyy-MM-dd'` | RUI-15 |
| Marca de tiempo (UTC) | `'2026-03-06T00:30:00Z'` | `05/03/2026 6:30 p. m.`, con el pipe `smDateTime`: `Intl.DateTimeFormat` con `timeZone: APP_TIME_ZONE`, la fecha y la hora por separado (si se piden juntas, `Intl` pone una coma, T1) | No se ingresa. Los filtros por fecha de la auditoría y de los errores envían fechas locales (`DateOnly`), que la API interpreta en la zona del instituto | RUI-16 |
| Hora (`TimeOnly`) | `'18:30:00'` | `6:30 p. m.`, con el pipe `smTime`. `Intl` con `hour12`, sin segundos y sin convertir la zona. El mediodía es `12:00 p. m.` y la medianoche, `12:00 a. m.` | `mat-timepicker` de 12 horas, con un intervalo de 15 minutos. Acepta escribir "6:30 p. m." o "18:30". Se envía como `'HH:mm:ss'` | RUI-17 |
| Moneda | `25000` | `₡25 000,00`, con el pipe `smCurrency` (`Intl.NumberFormat`, `CRC`, dos decimales; verificado en T1) | Campo numérico. Se envía como número | RUI-18 |
| Número entero (cupos, capacidad) | `30` | Con el separador de miles de `es-CR`, con el pipe `smNumber` | Campo numérico | RUI-18 |
| Valor de un enum | `'EnCurso'` | `En curso`, con el pipe `smLabel:'estadoGrupo'`. Las tablas de RUI-19 están en `shared/formatting/labels.ts`; un valor desconocido se muestra tal como llega | `mat-select` con las mismas etiquetas | RUI-19 |

- **Una trampa a evitar:** `new Date('2026-03-05')` interpreta la fecha en UTC, y en Costa Rica da el 4 de marzo a las 6:00 p. m. Las fechas sin hora se convierten con `parse(texto, 'yyyy-MM-dd', ...)` de date-fns, que crea la medianoche local, y solo en los formularios.
- **Los separadores de `Intl`:** según el navegador, los espacios de "6:30 p. m." y de "₡25 000,00" pueden ser espacios normales o espacios que no se parten. Las pruebas comparan normalizando los espacios (§9).

### 7.3 `AppDateAdapter`

- `core/config/app-date-adapter.ts` extiende `DateFnsAdapter`, de `@angular/material-date-fns-adapter`. Solo cambia `format()`: cuando el formato es de hora, usa el formateador de §7.2, porque date-fns escribe "6:30 PM" o "6:30 p.m." y RUI-17 pide "6:30 p. m." (T1).
- **Formatos** (`MAT_DATE_FORMATS`):
  - Lectura: fechas con `['dd/MM/yyyy', 'd/M/yyyy']` y horas con `['h:mm a', 'H:mm']`. En T1 se verificó que lee "6:30 p. m." y que rechaza `31/02/2026` y `03/15/2026`.
  - Presentación: `dd/MM/yyyy` para las fechas y el formateador propio para las horas y las opciones del selector de hora.
- Se registra como el `DateAdapter` con `provideAppDateAdapter()`, en lugar de `provideDateFnsAdapter()`, **dentro de `provideMaterialDefaults()`**, es decir, en la ruta de cada área (§6.1). Hasta `nucleo` T1 iba en `app.config.ts`, pero así date-fns (70 kB, medido) entraba en la carga inicial y solo lo usan los formularios.
- Escribe la hora con espacios normales, porque el selector vuelve a leer lo que escribe y date-fns no reconoce "p. m." con los espacios que no se parten que `Intl` usa en algunos navegadores (`fundacion` T4). Los pipes conservan la salida de `Intl`.

---

## 8. Buenas prácticas de Angular

Lo estándar de Angular 22 se nombra sin explicarlo. Lo que sigue es lo que este proyecto exige.

### 8.1 Componentes y reactividad

- **Standalone y zoneless.** Son los valores por defecto del CLI: no hay NgModules ni `zone.js`. Todos los componentes usan **`ChangeDetectionStrategy.OnPush`**, configurado como valor por defecto del generador en `angular.json` (§11).
- **Signals para el estado:**
  - `input()`, `output()` y `model()` en lugar de los decoradores.
  - `computed()` para lo derivado y `linkedSignal()` para un valor que se reinicia cuando cambia otro.
  - `effect()` solo para sincronizar con algo externo a Angular, como `sessionStorage` en `SessionService`. **Nunca para copiar un signal en otro.**
- **Plantillas:** control de flujo `@if`, `@for` (siempre con `track` por id) y `@switch`, y `@defer` para lo pesado (§2.5). Sin llamadas a funciones con lógica en las plantillas: lo calculado va en un `computed()`.
- **`inject()`** en lugar de inyectar por el constructor. Los enlaces del host van en `host: {}`, no en `@HostBinding` ni `@HostListener`.
- **Guardas, interceptores y resolvers son funciones**, no clases (§4).
- **RxJS solo donde Angular lo da:** las acciones de `HttpClient` (§3.3) y algún evento del router. Las acciones se consumen con `firstValueFrom`. Si hace falta una suscripción, se cierra con `takeUntilDestroyed()`. No hay `subscribe` sin cerrar.
- **Estilos:** cada componente tiene su `.scss`, sin `::ng-deep` ni `ViewEncapsulation.None`. Lo global (paleta, tema, tipografía) vive en `src/styles/` (§6.6).

### 8.2 TypeScript estricto

- Las opciones estrictas que activa el CLI (`strict`, `strictTemplates`, `noImplicitOverride`, `noPropertyAccessFromIndexSignal`, `noImplicitReturns`, `noFallthroughCasesInSwitch`) no se desactivan.
- **Sin `any`** (regla de ESLint). Lo desconocido se tipa como `unknown` y se revisa. Los tipos de la API salen de `models.ts` (§3.2).
- Sin el operador `!` para callar al compilador, salvo con un comentario que diga por qué es seguro.

### 8.3 Rendimiento de la carga inicial (§6 de los requerimientos)

**Meta:** la carga inicial (lo que se descarga antes de la primera vista) **no supera 500 kB sin comprimir**, y la primera vista se pinta en **menos de 2,5 s** (LCP) en Lighthouse, con el perfil de escritorio y el build de producción servido en local.

Cómo se cumple:
- **Presupuestos en `angular.json`:** `initial` avisa en 500 kB y falla en 750 kB; `anyComponentStyle` avisa en 4 kB y falla en 8 kB (los valores del CLI). Un build que falla el presupuesto no se acepta.
- **Carga diferida por área y por rol**, y FullCalendar (unos 400 kB) con `@defer` (§2.5).
- **El menú de la cuenta, con `@defer (on idle)`:** `mat-menu` arrastra el overlay del CDK (unos 60 kB) y solo se usa con sesión. Mientras carga, la barra muestra el rol. Con el layout, la carga inicial quedó en 438,6 kB (`nucleo` T6).
- **Imports por componente:** cada componente importa solo lo que usa de Material, sin módulos "compartidos" que lo traigan todo.
- La fuente del sistema y los íconos SVG no agregan descargas al arranque (§6.6).
- Los listados nunca piden todo: la API pagina (RUI-10).

Lighthouse se revisa a mano al cerrar los módulos que cambian la carga inicial: el layout y las piezas transversales (§12).

---

## 9. Pruebas

Como en el backend, primero lo que es puro y transversal. Las pruebas de las vistas completas contra la API quedan diferidas (§1 del backend).

| Qué | Cómo |
|---|---|
| Herramienta | **Vitest 5.1 con jsdom**, el corredor de `ng test` (§1). `TestBed` para lo que necesita inyección, y `provideHttpClientTesting()` con `HttpTestingController` para lo que usa `HttpClient` |
| Dónde | Junto al código: `formatters.spec.ts` al lado de `formatters.ts`. Los datos de prueba compartidos (un curso, un grupo, un `ProblemDetails` de ejemplo), en `src/testing/` |
| Meta de cobertura | Sin un porcentaje. Cada pieza de la tabla siguiente tiene sus pruebas, y una corrección de un error en ellas agrega la prueba que lo habría detectado |
| Diferido | **Pruebas e2e** (por ejemplo, con Playwright), cuando haya flujos completos (decisión del usuario). Mientras tanto, cada módulo verifica sus vistas a mano, contra sus wireframes y con la API en marcha y sus datos de prueba (`SPEC-datos-prueba` del backend) |

**Lo que se prueba:**

| Pieza | Casos |
|---|---|
| Formateadores y pipes (§7) | Los ejemplos de RUI-15 a RUI-19, incluidos el mediodía, la medianoche, una marca UTC de la noche que cae en el día anterior en Costa Rica, y un valor de enum desconocido. Se compara normalizando los espacios de `Intl` |
| `AppDateAdapter` | Lo verificado en T1: lee `dd/mm/aaaa` y `d/m/aaaa`, rechaza `31/02/2026` y `03/15/2026`, y lee y escribe "6:30 p. m." |
| Validadores (§5.2) | Los límites de RUI-06 en el borde: 20 y 21 caracteres de cédula, la política de RN-26, las fechas de RN-16 y el bloque de RN-15 |
| `applyServerErrors` | Una clave con otra capitalización, una ruta con punto, un mensaje sin campo y el mapa de `code` a campo |
| `errorInterceptor` | Cada fila de §3.5: el `ProblemDetails` se convierte en `ApiError`; el `401` con token renueva y repite una vez (también un `POST`); si la repetición da `401` o no se puede renovar, navega a `V-02` con `volver`; si la renovación no está disponible, entrega su error sin navegar; varios `401` a la vez hacen una renovación y navegan una sola vez; el `401` sin token no navega; el `403 RN-24` navega a `V-03` |
| `tokenInterceptor` | Agrega el token a `API_URL` y no a otro origen ni a `NO_SESSION`; con el token vencido renueva antes de enviar, y sin refresh token envía con el que hay |
| `SessionService` | Guarda y lee de `sessionStorage`, con el refresh token; el fin de la sesión según `refreshExpiraEn`; `refresh()` (una sola a la vez, cada resultado, respuestas tardías); la pestaña duplicada; reemplaza el token; el cierre de sesión renueva antes si el token venció |
| Guardas (§4.3) | Una prueba por fila, incluida la ruta `volver` externa rechazada |
| Componentes de `shared/ui` | `ActionError` con cada respuesta de §3.5 (incluida la cuenta regresiva del `429`), `ContentState` con cada estado, la confirmación irreversible con el foco en "Cancelar", `PaginatedList` en tabla y en tarjetas, y `FilterBar` (Enter y "Limpiar filtros"). Además, cada pieza tiene su ejemplo en el catálogo de componentes (`/componentes`, §2.2), que se revisa a mano contra `componentes.html` |
| `WeeklySchedule` | La función pura que arma la configuración de la grilla (domingo oculto o visible, el rango de horas, la traducción de los días) y la lista por día. FullCalendar no se prueba: se confía en su biblioteca |

- Las pruebas no llaman a la API real ni dependen de la zona horaria de la máquina: los formateadores reciben la zona por parámetro en las pruebas que la necesitan.
- Una prueba que falla no se borra ni se salta sin la aprobación del usuario.

---

## 10. Convenciones

### 10.1 Idioma y nombres

Regla fijada por el usuario el 2026-11-24 ([`SPEC-nombres`](../specs/SPEC-nombres.md)): **el dominio, en español; lo técnico, en inglés.**

- **En español, sin tildes ni ñ:**
  - Las entidades y conceptos del instituto: `Curso`, `Matricula`, `Periodo`, `Estudiante`, `Grupo`, `Aula`, `Rol`. "Rol" también dentro de un nombre técnico: `rolGuard`, `HOME_BY_ROL`.
  - Los datos de esas entidades, con el nombre que les da la API, aunque estén dentro de una pieza con nombre en inglés: `session.rol()`, `nombre`, `debeCambiarContrasena`, `incluirInactivos`. Y los valores de sus enums (`EnCurso`, `RetiroVoluntario`).
  - Las rutas de la URL y sus parámetros (`/mis-matriculas`, `?volver=`, `?pestana=`), las carpetas de área (`features/matricula`) y los ids de módulo.
  - Los textos de la interfaz, **con** tildes y ñ y con trato de usted (RUI-22). También los comentarios, las descripciones de las pruebas y los documentos.
- **En inglés, todo lo demás:** componentes de interfaz, clases, funciones, métodos, constantes, tipos propios del SPA, carpetas técnicas, clases CSS, variables `--sm-*`, íconos, scripts y las piezas de Angular (pipes, guards, interceptors, adapters).
- **Combinados:** primero la entidad, en español, y después la parte técnica, en inglés: `CursosApi`, `CursosFilters`, `PeriodoSelect`, `periodoDates`.
- **Los verbos van en inglés**, también los de las acciones propias del negocio: `list`, `get`, `create`, `update`, `delete`, `enroll`, `withdraw`, `changeGrupo`. Las consultas de los clientes terminan en `Resource` (`listResource`, §3.3).
- **Componentes de las vistas:** la entidad y un sufijo de interfaz: `EstudiantesList` (listado), `CursoDetail` (detalle), `CursoForm` (formulario). Las ventanas de una acción llevan el verbo: `EnrollDialog` (`V-32`), `ChangeGrupoDialog` (`V-33`).
- **Outputs:** la entidad y el evento, como `grupoSelect`.
- **Pipes propios con el prefijo `sm`:** `smDate`, `smDateTime`, `smTime`, `smCurrency`, `smNumber`, `smLabel`. Así no chocan con `date`, `currency` y `number` de Angular.
- **Si la regla no deja claro el nombre o el idioma de algo, se pregunta al usuario** (`AGENTS.md`).

**Archivos en kebab-case, al estilo del CLI de Angular 22:**

| Pieza | Archivo | Clase o función |
|---|---|---|
| Componente | `estudiantes-list.ts`, `.html` y `.scss` | `EstudiantesList` (sin sufijo `Component`, como genera el CLI) |
| Cliente de la API | `cursos-api.ts` | `CursosApi` |
| Servicio | `session-service.ts` | `SessionService` |
| Guarda, interceptor | `auth-guard.ts`, `rol-guard.ts`, `token-interceptor.ts` | `authGuard`, `rolGuard`, `tokenInterceptor` |
| Pipe | `date-pipe.ts` | `SmDatePipe`, usado como `smDate` |
| Rutas, configuración, pruebas | `personas.routes.ts`, `app.config.ts`, `*.spec.ts` | Las convenciones propias de Angular |

- **Prefijo de los selectores:** `sm` (Sistema de Matrícula), por ejemplo `sm-paginated-list`. Se fija en `angular.json`.
- **Rutas:** en minúscula, en español y con guiones (§2.4).
- **Variables CSS:** `--sm-*` (§6.6), en inglés. Las clases CSS van en inglés y en kebab-case, salvo los términos de dominio (`rol`).

### 10.2 Formato y lint

- **Prettier** formatea todo, con `printWidth: 120` y `singleQuote: true`, y el analizador `angular` para las plantillas. No se discute el formato a mano.
- **ESLint** con angular-eslint (las reglas recomendadas y las de accesibilidad de las plantillas), más:
  - `no-console` (§4.5) y `@typescript-eslint/no-explicit-any` (§8.2).
  - `no-restricted-imports` por carpeta, para hacer cumplir §2.3:

```js
// eslint.config.js (extracto)
{ files: ['src/app/shared/**'], rules: { 'no-restricted-imports': ['error', { patterns: [
  { group: ['**/core/**', '**/features/**'], message: 'shared no conoce core ni features (§2.3)' },
] }] } },
{ files: ['src/app/api/**'], rules: { 'no-restricted-imports': ['error', { patterns: [
  { group: ['**/core/**', '**/shared/**', '**/features/**'], message: 'api no depende del SPA (§2.3)' },
] }] } },
{ files: ['src/app/features/**'], rules: { 'no-restricted-imports': ['error', { patterns: [
  { group: ['**/features/*/**', '!**/features/matricula'], message: 'Entre áreas, solo el index.ts de matricula (§2.4)' },
] }] } },
```

  El patrón exacto se ajusta al crear el proyecto. Lo que no puede cambiar es la regla de §2.3.

  **Patrón final (`fundacion` T2):** `@typescript-eslint/no-restricted-imports` con patrones `regex` sobre los imports relativos, para no confundir `core/` con `@angular/core`. `shared` importa de `api` solo con `import type` (`allowTypeImports`), `core` no importa de `features`, y cada área tiene su bloque: solo las de la tabla de §2.4 importan de `matricula`, y solo su `index.ts`. Ver `eslint.config.js`.

### 10.3 Código, comentarios y documentos

- **Un archivo por pieza.** Pocos comentarios, en español, solo para explicar **por qué** se hace algo, por ejemplo citando la RUI o la RN que lo justifica.
- **Las reglas se citan, no se repiten:** si un código implementa una RUI o un RFF, lo nombra en un comentario corto o en el nombre de la prueba.
- **`README.md`** con los requisitos, los pasos para levantar el SPA junto a la API y los comandos de §11. Se crea en el primer módulo.
- **Commits:** en la fase 0 hubo un solo commit por entregable. En los módulos del mapa, un commit después de cada tarea, en la rama del módulo, y un pull request a `main` al cerrarlo (decisión 5 de `specs/mapa-modulos.md`, 2026-11-23). Mensajes en español, con prefijo (`feat:`, `docs:`, `fix:`).

### 10.4 Dependencias

- **Agregar una dependencia** requiere la aprobación del usuario (`AGENTS.md`), y se anota en §1 con su versión, su licencia y por qué.
- **`pnpm-workspace.yaml`** (pnpm 12, verificado en T1):

```yaml
packages:
  - '.'
saveExact: true              # versiones exactas en package.json, sin ^ ni ~
minimumReleaseAge: 10080     # no instalar versiones publicadas hace menos de una semana
trustPolicy: no-downgrade    # fallar si un paquete perdió evidencia de confianza respecto de versiones anteriores
allowBuilds:                 # scripts de instalación: denegados salvo que se autoricen aquí
  '@parcel/watcher': false
  esbuild: false
  lmdb: false
  msgpackr-extract: false
```

- **Scripts de instalación:**
  - Una dependencia con scripts que no está en `allowBuilds` hace fallar la instalación (`strictDepBuilds`, activo por defecto).
  - Autorizar una (`true`) requiere saber qué hace su script y anotarlo aquí.
  - Las de la lista funcionan sin sus scripts (T1).
- **Excepciones a `minimumReleaseAge`** (en `minimumReleaseAgeExclude`): solo para un parche de seguridad urgente, y con la razón anotada.
- **Instalación reproducible:** el lockfile (`pnpm-lock.yaml`) se versiona. Al clonar se instala con `--frozen-lockfile`, que en CI es el valor por defecto.
- **Revisión:** `pnpm audit` antes de cerrar cada módulo. Un hallazgo alto o crítico se resuelve o se anota con su justificación.
- **Las actualizaciones de Angular** (cada seis meses sale una versión mayor) se hacen con `ng update` en un módulo propio, después de confirmar la compatibilidad de FullCalendar y de los demás paquetes (supuesto 1 de la spec).

---

## 11. Comandos y configuración

### 11.1 Requisitos

- **Node 24 LTS** y **pnpm 12.21**, por ejemplo con `npm install -g pnpm@12.21.0`. El campo `packageManager` del `package.json` avisa si la versión no coincide.
- **La API en marcha** en `http://localhost:5022` para desarrollar y para generar los tipos (`README` del backend).

### 11.2 Scripts del `package.json`

| Comando | Script | Para qué |
|---|---|---|
| `pnpm install --frozen-lockfile` | — | Instalar exactamente lo del lockfile (al clonar o en CI) |
| `pnpm start` | `ng serve --port 5173` | Desarrollo en `http://localhost:5173`, el origen que permite el CORS de la API |
| `pnpm build` | `ng build` | Build de producción en `dist/`, con los presupuestos de §8.3 |
| `pnpm test` | `ng test` | Pruebas en modo observador. En CI o antes de cerrar un módulo: `pnpm test --watch=false` |
| `pnpm lint` | `ng lint` | ESLint (§10.2) |
| `pnpm format` | `prettier --write .` | Formatear |
| `pnpm format:check` | `prettier --check .` | Revisar el formato sin cambiar archivos |
| `pnpm api:types` | `openapi-typescript http://localhost:5022/openapi/v1.json -o src/app/api/schema.d.ts` | Regenerar los tipos de la API (§3.2) |
| `pnpm audit` | — | Revisar las dependencias (§10.4) |

**Antes de cerrar un módulo:** `pnpm format:check && pnpm lint && pnpm test --watch=false && pnpm build`.

### 11.3 Configuración

- **`angular.json`:**
  - `prefix: "sm"`.
  - Generadores con `changeDetection: "OnPush"` y estilos `scss`.
  - Los presupuestos de §8.3.
  - `fileReplacements` para el entorno de desarrollo.
- **`src/environments/`:** `apiUrl` (§3.1), `instituteName` ("Instituto de Cursos Libres", RUI-23) y `version`.
- **Versión en el pie (RUI-23):**
  - `version` se importa del `package.json` en `environments/`, así que sale del build y no de la API.
  - Empieza en `0.1.0` y la versión menor sube al cerrar cada módulo del mapa.
- **`pnpm-workspace.yaml`:** §10.4.
- **Sin secretos en el frontend:** todo lo que va en `environments/` es público (llega al navegador).

---

## 12. Orden sugerido de implementación

Es la base de `specs/mapa-modulos.md`. Cada paso depende de los anteriores, y los ids son una propuesta para el mapa:

| # | Módulo (id propuesto) | Contenido | Vistas |
|---|---|---|---|
| 1 | `fundacion` | Crear el proyecto con el CLI y pnpm (§11); `pnpm-workspace.yaml`, ESLint, Prettier y carpetas de §2.2; `environments/`; tema, paleta, tipografía e íconos (§6.6); locale, `AppDateAdapter`, formateadores y pipes (§7), con sus pruebas | — |
| 2 | `nucleo` | `api/` base (tipos generados, `models.ts`, paginación, `ApiError`, `API_URL`); `SessionService`, interceptores y guardas (§4); layout con el menú por rol, el menú de la cuenta y el pie; páginas del sistema | `V-09`, `V-10` |
| 3 | `componentes` | `shared/ui` y `shared/forms`: `ContentState`, `ActionError`, `NotificationService`, `Banner`, `ConfirmService`, `SubmitButton`, `PasswordField`, validadores, `applyServerErrors`, `PaginatedList`, `FilterBar`, `StatusBadge`, `DetailHeader`, `SearchSelect` (§5, §6) | — |
| 4 | `acceso` | Inicio de sesión, cambio obligatorio, olvido y registro; el perfil, el cambio de contraseña y los datos de contacto | `V-02` a `V-08` |
| 5 | `oferta` | La oferta académica, sin la acción "Matricular" (se completa en el paso 9) | `V-01` |
| 6 | `catalogos` | Cursos, periodos y aulas. La ocupación del aula se completa en el paso 8 | `V-20` a `V-27` |
| 7 | `personas` | Administradores, estudiantes y profesores. Las secciones de matrícula, grupos y horario de `V-16` y `V-19` se completan en el paso 9 | `V-11` a `V-19` |
| 8 | `grupos` | Grupos y horarios; `WeeklySchedule` y `PeriodoSelect` (§6.3), y con ellos la ocupación de `V-27` | `V-28` a `V-30` |
| 9 | `matricula` | Mis matrículas, mi horario y mis grupos; las ventanas `V-32` y `V-33` y el retiro; y las secciones que §3.7 de los requerimientos agrega a `V-01`, `V-16`, `V-19`, `V-22` y `V-30` | `V-31` a `V-35` |
| 10 | `sistema` | Auditoría y errores, y los enlaces "Ver historial de cambios" de los detalles (RFF-40) | `V-36` a `V-38` |

- **El orden sigue el de los requerimientos y los wireframes:** primero lo transversal, después las áreas de §3. Las secciones que una vista recibe de un área posterior se completan con esa área, como hicieron los wireframes (T4 y T7 de su lista de tareas).
- **Cada módulo se verifica** con las pruebas de §9, el comando de cierre de §11.2 y la revisión de sus vistas contra los wireframes, con la API en marcha.
- **Lighthouse (§8.3)** se mide al cerrar `nucleo` y `componentes`, y otra vez al final.
- **`Retry-After` y `Location` (COR-02):** la API ya los expone por CORS. El módulo `acceso`, el primero que maneja un `429`, comprueba desde el navegador que `ApiError.retryAfter` trae el valor, como pide la verificación pendiente de COR-02.
