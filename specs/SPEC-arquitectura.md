# Spec: arquitectura

Entregable `arquitectura` de la [fase 0](fase-0.md). Depende de `requerimientos` y `wireframes` (completados).

| Estado | Tareas | Avance |
|---|---|---|
| **Aprobada** | [Aprobadas](../tasks/arquitectura/todo.md) | 6/6 tareas completadas: **entregable completado** (2026-11-20) |

**Historial:**
- 2026-11-20: v1 en revisión. Framework elegido por el usuario: **Angular**. Calendario propuesto por el usuario: **FullCalendar**.
- 2026-11-20: v2 en revisión. Preguntas abiertas resueltas por el usuario: Angular Material, token en `sessionStorage`, pruebas unitarias ahora y e2e diferidas. Se agregan **pnpm** como gestor de paquetes y la **regla 60-30-10** para los colores, con una paleta propia porque el proyecto no tiene marca (es de práctica).
- 2026-11-20: v2 aprobada. Lista de 6 tareas en revisión.
- 2026-11-20: v3, ajustes aprobados por el usuario con los resultados de T1:
  - FullCalendar 7 se instala como `fullcalendar` + `@fullcalendar/angular` + `temporal-polyfill`, y solo se usa para la grilla. En pantallas angostas, `HorarioSemanal` dibuja su propia lista por día, porque `listWeek` corta el texto a 360 px.
  - Las horas se formatean con un adaptador propio que extiende `DateFnsAdapter` y usa `Intl` (RUI-17).
  - Los ajustes de pnpm 12 son `allowBuilds`, `minimumReleaseAge` y `saveExact`, en `pnpm-workspace.yaml`.
- 2026-11-20: entregable completado (6/6 tareas). `docs/arquitectura.md` aprobado. Cambios fuera de la spec, todos aprobados por el usuario durante las tareas: Reactive Forms se mantiene aunque Signal Forms ya es estable (T2); `httpResource` para las consultas (T2); la brecha B-05 (`Retry-After` no expuesto por CORS), anotada en `docs/requerimientos.md` §8 (T3); y la fila de navegadores en §1 (T6).

## Objetivo

Redactar `docs/arquitectura.md`: el documento que fija **con qué y cómo** se construye el SPA. Sigue el modelo de `../sistema-matricula-api/docs/arquitectura.md`: stack con su justificación, arquitectura del código, buenas prácticas, convenciones y orden sugerido de implementación. Busca lo mismo que el backend, una arquitectura **simple y fácil de mantener, sin sobreingeniería**.

**Usuarios del entregable:**
- El usuario (dueño del proyecto), que aprueba el stack y las dependencias. `AGENTS.md` pide aprobación antes de agregar dependencias, y este documento es donde quedan fijadas.
- `specs/mapa-modulos.md`, que se arma con la estructura de carpetas y el orden de implementación de este documento.
- Los módulos del mapa, que lo siguen al implementar cada vista.
- `AGENTS.md`, que al aprobarse el documento recibe los comandos, la estructura del código y los límites técnicos (supuesto 5 de la fase 0).

**Qué no es:** no crea el proyecto Angular ni escribe código de la aplicación. El esqueleto del proyecto es el primer módulo del mapa. Tampoco redefine requerimientos: cada decisión cita la `RFF`, `RUI` o el requerimiento no funcional (§6 de `docs/requerimientos.md`) que resuelve.

### Alcance: contenido de `docs/arquitectura.md`

Cada sección dice qué decide. Las decisiones propuestas están en la tabla de abajo.

1. **Stack.** Tabla Pieza · Elección · Por qué, con las versiones fijadas, y la lista de lo que **no** se usa y por qué (como en §1 del backend).
2. **Arquitectura del código.** Capas o carpetas (`core`, `shared`, `features`), qué va en cada una, las dependencias permitidas entre ellas, la carga diferida por área y el **flujo de una vista**, desde la ruta hasta la respuesta de la API y su presentación, con un ejemplo concreto (matricular, como en §2.4 del backend).
3. **Integración con la API.**
   - Tipos generados desde el OpenAPI y cómo se regeneran.
   - Un servicio por recurso.
   - Paginación `{ items, page, pageSize, totalCount }` y filtros en la URL.
   - URL base por entorno.
   - Correspondencia entre `ProblemDetails` y la presentación: RUI-01 a RUI-05, `errors` por campo sin distinguir mayúsculas, `code`, `traceId` y `Retry-After`.
4. **Sesión y seguridad en el cliente.**
   - Dónde vive el token y cuándo se descarta.
   - El interceptor que agrega el token y maneja los `401` (RFF-03).
   - Las guardas de la §2.5: sesión, rol, cambio pendiente (RN-24), volver a la ruta pedida y cambios sin guardar (RUI-09).
   - Ocultar acciones por rol solo como ayuda.
   - Reglas sobre contraseñas: no guardarlas ni escribirlas en la consola.
5. **Formularios y validación.** Validadores con los límites de RUI-06, cuándo se muestran los errores, cómo se aplican los errores del servidor a los campos, el envío en curso (RUI-08) y los cambios sin guardar (RUI-09).
6. **Componentes y estilo visual.**
   - Librería de componentes y cómo se envuelve.
   - Componentes compartidos del catálogo de los wireframes: listado paginado con tarjetas, filtros, confirmación simple y reforzada, mensajes, estados de contenido, etiquetas y grilla del horario.
   - FullCalendar dentro de `HorarioSemanal`.
   - Diseño adaptable desde 360 px.
   - Accesibilidad de §6.
   - Estilo visual: tipografía, íconos y cómo se sirven sin CDN. Los colores siguen la **regla 60-30-10**:
     - 60 % neutro: fondo y superficies.
     - 30 % secundario: barra superior, menú, encabezados y tarjetas.
     - 10 % acento: la acción principal de la vista, los enlaces, el foco y la selección.

     Los colores de estado (éxito, error, aviso y las etiquetas de RUI-20) van aparte de la regla, se usan poco y siempre con texto. Cada combinación de texto y fondo cumple el contraste WCAG AA (4,5:1 para el texto normal, 3:1 para el texto grande y los bordes de los controles). Como no hay colores de marca, el documento propone una paleta propia, definida con las variables del tema de Material para poder cambiarla en un solo lugar.
7. **Formatos, fechas y zona horaria.** Locale `es-CR`, `DateOnly` sin conversión (RUI-15), marcas UTC convertidas a `America/Costa_Rica` (RUI-16), horas de 12 horas (RUI-17), moneda (RUI-18), etiquetas de enums (RUI-19) y el paso del selector de hora, que los wireframes dejaron pendiente.
8. **Buenas prácticas de Angular.** Componentes standalone, signals, `OnPush` o zoneless, control de flujo `@if`/`@for`, `inject()`, funciones en lugar de clases para guardas e interceptores, TypeScript estricto, manejo de suscripciones y rendimiento de la carga inicial con una meta concreta (§6, "Rendimiento percibido").
9. **Pruebas.** Qué se prueba, con qué herramienta, dónde viven las pruebas y qué queda diferido (como en §1 del backend).
10. **Convenciones.** Idioma (dominio en español sin tildes ni ñ y sufijos técnicos en inglés, como el backend), nombres de archivos y selectores, formato y lint, comentarios, commits y `README`. Incluye la **seguridad de las dependencias**:
    - Lockfile en el repositorio e instalación con el lockfile congelado.
    - Versiones exactas.
    - Lista de las dependencias autorizadas a ejecutar scripts de instalación.
    - Antigüedad mínima de las versiones nuevas.
    - Revisión con `pnpm audit`.
11. **Comandos y configuración.** Instalación, desarrollo en el puerto 5173 (CORS de la API), build, pruebas, lint, regeneración de tipos y versión en el pie (RUI-23).
12. **Orden sugerido de implementación.** Es la base del mapa de módulos, como §9 del backend.

### Decisiones propuestas

Son la base de la redacción. Las que dependen de una preferencia del usuario están en las preguntas abiertas. Las demás se aplican salvo que se corrijan en la revisión. Las versiones son las publicadas al 2026-11-20 y se vuelven a verificar al redactar.

| Pieza | Propuesta | Por qué |
|---|---|---|
| Framework | **Angular 22** (22.3) con el CLI, TypeScript estricto y componentes standalone | Elegido por el usuario. Router con guardas, `HttpClient` con interceptores y Reactive Forms incluidos |
| Runtime de desarrollo | **Node 24 LTS** (ya instalado: 24.20) | Soporte largo |
| Gestor de paquetes | **pnpm 12** (12.21), fijado en `packageManager` del `package.json` | Elegido por el usuario. No ejecuta los scripts de instalación de las dependencias salvo los autorizados, permite exigir una antigüedad mínima a las versiones nuevas y su `node_modules` estricto impide importar lo que no está declarado. Ajustes en `pnpm-workspace.yaml`: `allowBuilds`, `minimumReleaseAge` y `saveExact` (T1) |
| Reactividad | **Signals** para el estado de los componentes y servicios; sin NgRx ni otra librería de estado | El estado compartido es poco (la sesión), y el resto es de cada vista |
| Componentes | **Angular Material + CDK 22** (elegido por el usuario) | Oficiales y con las mismas versiones que Angular. Incluyen accesibilidad (foco en las ventanas, teclado), selector de fecha que también permite escribir, selector de hora, autocompletado, paginador, ventanas y avisos temporales |
| Fechas | **date-fns 4** con `@angular/material-date-fns-adapter` para los selectores, extendido por un adaptador propio que formatea las horas con `Intl` (T1); `Intl.DateTimeFormat` con `timeZone: 'America/Costa_Rica'` para mostrar las marcas UTC | El adaptador nativo no lee bien `dd/mm/aaaa` escrito a mano. date-fns no da "6:30 p. m." en español, e `Intl` sí. `Intl` resuelve la zona sin otra dependencia |
| Formularios | **Reactive Forms tipados** | Estables. Signal Forms se descarta mientras sea experimental |
| HTTP | `HttpClient` con **interceptores funcionales** (token, `401`) y servicios por recurso escritos a mano | Un cliente generado (NSwag, openapi-generator) agrega mucho código y una herramienta más |
| Tipos de la API | **openapi-typescript 7** (solo en desarrollo), generados desde `http://localhost:5022/openapi/v1.json` a un archivo del repositorio | Los tipos siguen al contrato (§6, "Compatibilidad con la API") sin escribir los DTOs a mano |
| Horario semanal | **FullCalendar 7** (`fullcalendar`, `@fullcalendar/angular` y `temporal-polyfill`), solo para la grilla (`timeGridWeek`) y envuelto en un componente propio `HorarioSemanal`, que en celular dibuja su propia lista por día | Propuesto por el usuario. MIT, compatible con Angular 16 a 22. Cubre la grilla de RFF-29 con eventos que se repiten (T1) |
| Token | **`sessionStorage`** (elegido por el usuario) | Sobrevive a recargar la página y se borra al cerrar la pestaña. Cada pestaña inicia su propia sesión. No hay refresh token (§1.3) |
| Pruebas | **Vitest** (el corredor del CLI de Angular), solo pruebas unitarias: guardas, interceptor, correspondencia de errores, validadores, pipes de formato y componentes compartidos. E2e diferidas (elegido por el usuario) | Como en el backend: se prueba lo puro primero |
| Colores | **Regla 60-30-10** con una paleta propia en las variables del tema de Material, y contraste WCAG AA | Propuesta por el usuario. El proyecto no tiene marca |
| Calidad | **angular-eslint** y **Prettier** | Lo estándar en Angular |
| Idioma | `LOCALE_ID` `es-CR` con `registerLocaleData`; sin el sistema i18n de Angular | Un solo idioma (§1.3) |

**Lo que no se usaría (para mantenerlo simple):** NgRx o Akita, un cliente HTTP generado, NgModules, Tailwind junto con Material, Moment o Luxon, una librería de tablas aparte (`mat-table` alcanza) y un servidor SSR (es una SPA detrás de login, sin SEO).

### Fuera del alcance de este entregable

- Crear el proyecto Angular, instalar dependencias o escribir código de la aplicación: es el primer módulo del mapa. Para resolver dudas de compatibilidad sí se permite una prueba desechable en el directorio temporal, fuera del repositorio (supuesto 2).
- `specs/mapa-modulos.md`: se arma después de aprobar este documento, al cerrar la fase 0.
- El diseño gráfico detallado (pantallas de alta fidelidad). El documento fija las bases del estilo (variables, tipografía, íconos, espaciado), no cada pantalla.
- Modificar la API. Si algo de la arquitectura necesita un cambio en el backend, se anota como brecha en `docs/requerimientos.md` (§8).

## Tech Stack

El de este entregable es Markdown. El stack del SPA es el **contenido** del documento (tabla de decisiones propuestas).

## Commands

No hay build. Para verificar el documento:

```bash
# Versiones vigentes de las dependencias propuestas (se citan en el documento)
npm view pnpm version
npm view @angular/core version
npm view @angular/material version
npm view @fullcalendar/angular peerDependencies

# Que cada RUI y cada sección de §6 de los requerimientos tenga dónde se resuelve
grep -o "RUI-[0-9]*" docs/arquitectura.md | sort -u
```

## Project Structure

```
docs/arquitectura.md            Entregable
specs/SPEC-arquitectura.md      Esta spec
tasks/arquitectura/todo.md      Plan y tareas (después de aprobar esta spec)
AGENTS.md                       Se completa al aprobar el documento (comandos, estructura, límites técnicos)
```

Estructura propuesta para el código del SPA, que el documento detalla:

```
src/app/
  core/          Una sola instancia: sesión, interceptores, guardas, manejo de errores, marco (encabezado, menú, pie), configuración
  shared/        Reutilizable sin estado propio: componentes del catálogo, pipes de formato, validadores
  api/           Tipos generados desde el OpenAPI y servicios por recurso
  features/      Una carpeta por área, cargada en diferido: acceso, cuenta, oferta, personas, catalogos, grupos, matricula, sistema
  app.routes.ts  Rutas por área con sus guardas
```

## Code Style

El del documento: como `docs/requerimientos.md`, en español, con tablas para las decisiones y la **justificación** de cada una. Los ejemplos de código son cortos y reales, y muestran la convención (por ejemplo, una guarda funcional o el manejo de un `409`). Ejemplo del tono esperado:

```ts
// core/sesion/rol.guard.ts
export const rolGuard = (rol: Rol): CanActivateFn => () => {
  const sesion = inject(SesionService);
  return sesion.rol() === rol || inject(Router).createUrlTree(['/sin-permiso']);
};
```

## Testing Strategy (verificación)

Revisión del documento, antes de pedir la aprobación:

| Qué | Cómo |
|---|---|
| Cobertura de los requerimientos | Cada RUI, cada punto de §2.5 y cada requerimiento no funcional de §6 de `docs/requerimientos.md` tiene la sección del documento que lo resuelve |
| Cobertura de los wireframes | Cada componente de `docs/wireframes/componentes.html` tiene una pieza asignada (librería o componente propio) |
| Dependencias | Cada dependencia tiene versión, licencia y justificación, y es compatible con Angular 22 (`npm view`) |
| Colores | Cada combinación de texto y fondo de la paleta tiene su contraste calculado y cumple WCAG AA |
| Contrato | Lo que el documento supone de la API (URL, CORS, `ProblemDetails`, paginación, token, claim de cambio pendiente) coincide con el backend y sus `correcciones/` |
| Sin contradicciones | Nada contradice `AGENTS.md`, `specs/fase-0.md` ni los límites de la API |
| Accionable | Comandos completos y una estructura de carpetas lista para el primer módulo |

## Boundaries

- **Siempre:** justificar cada decisión, citar la RUI, RFF o el requerimiento no funcional que resuelve, y fijar versiones exactas.
- **Preguntar antes:** agregar una dependencia que no esté en la tabla de decisiones. Cambiar algo de `docs/requerimientos.md` que la arquitectura revele como incompleto. Elegir donde la spec deja una pregunta abierta.
- **Nunca:** crear el proyecto o instalar paquetes en el repositorio. Modificar la API. Usar CDN para fuentes o íconos en producción.

## Success Criteria

1. `docs/arquitectura.md` existe con las 12 secciones del alcance.
2. Las comprobaciones de la tabla de verificación se cumplen.
3. Las preguntas abiertas están resueltas y reflejadas en el documento.
4. `AGENTS.md` queda completado con los comandos, la estructura y los límites técnicos, y `specs/fase-0.md` queda con el entregable completado.
5. El usuario aprueba el documento.

## Supuestos

Se aplican salvo que se corrijan en la revisión:

1. **Angular 22**, la última versión estable. Si sale Angular 23 antes de crear el proyecto, se evalúa en el primer módulo, según la compatibilidad de FullCalendar y Material.
2. **Prueba desechable permitida:** si una decisión depende de cómo se comporta una librería (por ejemplo, el formato `dd/mm/aaaa` escrito a mano en el selector de fecha o los encabezados sin fecha en FullCalendar), se prueba en el directorio temporal, fuera del repositorio. El resultado se anota en el documento.
3. **Puerto 5173 en desarrollo** (`ng serve --port 5173`), para no tocar el CORS de la API.
4. **Sin despliegue:** el documento solo fija la URL base por entorno y el HTTPS en producción. El hosting y la integración continua quedan diferidos, como en el backend.
5. **Paso del selector de hora:** 15 minutos, como en el boceto de los wireframes, salvo que el documento encuentre un motivo en la API para otro valor.
6. **Commit único** al terminar el entregable (memoria de commits al final).

## Out of Scope (Deferred)

- **Pruebas e2e** (por ejemplo, con Playwright): se retoman cuando haya flujos completos, igual que las pruebas de integración del backend.
- **Colores de marca:** si el instituto llega a tener una identidad, se cambia la paleta en las variables del tema, sin tocar los componentes.
- **Despliegue, Docker e integración continua:** cuando se defina dónde corre el sistema.
- **Modo oscuro, varios idiomas y PWA:** fuera del alcance de los requerimientos (§1.3).
- **Monitoreo de errores en el cliente** (Sentry o similares): los errores se reportan con el `traceId` de la API (RUI-03).

## Open Questions

Ninguna. Las de la v1 quedaron resueltas por el usuario (2026-11-20):

1. **Librería de componentes:** Angular Material + CDK.
2. **Dónde vive el token:** `sessionStorage`.
3. **Alcance de las pruebas:** unitarias ahora y e2e diferidas.
