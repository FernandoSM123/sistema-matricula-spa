# Tareas: arquitectura

Entregable `arquitectura` de la [fase 0](../../specs/fase-0.md). Spec: [SPEC-arquitectura.md](../../specs/SPEC-arquitectura.md).

| Estado de la lista | Avance |
|---|---|
| **Aprobada** | 6/6 tareas completadas: **entregable completado** (2026-11-20) |

**Historial:**
- 2026-11-20: v1 en revisión.
- 2026-11-20: v1 aprobada. T1 en progreso.
- 2026-11-20: T1 implementada, en revisión del usuario. Resultados:

  **Dependencias** (`npm view`, 2026-11-20; todas con licencia MIT, salvo TypeScript, que es Apache-2.0):

  | Paquete | Versión | Compatibilidad y notas |
  |---|---|---|
  | `@angular/core`, `cli`, `cdk`, `material`, `material-date-fns-adapter` | 22.3.0 | Node `^22.22.3 \|\| ^24.15.0 \|\| >=26` (instalado: 24.20). El adaptador acepta `date-fns >2.20 <5` |
  | `typescript` | 6.0.x | Lo fija Angular (`>=6.0 <6.1`). La 7.0 es la más reciente, pero Angular 22 no la admite |
  | `date-fns` | 4.4.0 | — |
  | `fullcalendar` + `@fullcalendar/angular` | 7.1.5 | **Cambia respecto de la spec:** en la v7 no hay `@fullcalendar/core`, `timegrid` ni `list` separados; los paquetes `@fullcalendar/timegrid` y `@fullcalendar/list` son de la v6 y no se instalan. Las vistas se importan de `@fullcalendar/angular/timegrid` y `/list`. Pide `@angular/core 16 - 22` |
  | `temporal-polyfill` | 1.0.8 | Peer obligatorio de FullCalendar 7 |
  | `openapi-typescript` | 7.13.0 | Declara peer `typescript ^5.x`. Con TypeScript 6 da un aviso de peer, pero **genera bien** (probado con un OpenAPI de muestra: paginado, enum y `ProblemDetails`) |
  | `vitest` | 5.1.1 | El CLI lo instala con `jsdom` |
  | `angular-eslint` | 22.8.0 | Peer `eslint ^9 \|\| ^10` y `typescript-eslint ^8` |
  | `prettier` | 3.10.1 | El CLI ya lo incluye |
  | `pnpm` | 12.21.0 | — |

  **pnpm 12** (documentación de pnpm.io para la 12.x y el proyecto generado):
  - Los ajustes van en `pnpm-workspace.yaml`, no en `.npmrc`. `onlyBuiltDependencies` ya no existe (se quitó en la v11).
  - `allowBuilds` es un mapa `paquete: true|false`. Una dependencia con scripts que no está en la lista **hace fallar la instalación** (`strictDepBuilds: true` por defecto). El CLI de Angular genera la lista con `@parcel/watcher`, `esbuild`, `lmdb` y `msgpackr-extract` en `false`, y la compilación y las pruebas funcionan así.
  - `minimumReleaseAge` está en minutos y por defecto vale 1440 (un día). La documentación sugiere 10080 (una semana). Las excepciones van en `minimumReleaseAgeExclude`.
  - `--frozen-lockfile` es el valor por defecto en CI. `saveExact: true` guarda versiones exactas; el CLI genera rangos `^`, así que hay que fijarlas.
  - También ofrece `blockExoticSubdeps` (activo por defecto) y `trustPolicy: no-downgrade`.
  - Avisos de peer del propio Angular (`@emnapi/*`, transitivos de `@napi-rs/wasm-runtime`): no son nuestros, y se ignoran.

  **Proyecto generado** (`ng new --package-manager pnpm`): zoneless por defecto (sin `zone.js`), componentes standalone sin el sufijo `.component`, Vitest + jsdom como corredor de `ng test`, `packageManager: pnpm@12.21.0` en el `package.json` y presupuesto inicial de 500 kB de advertencia y 1 MB de error.

  **Selector de fecha** (adaptador date-fns, locale `es`, pruebas con Vitest):
  - Lee `15/03/2026`, `5/3/2026` y `05/03/2026` con los formatos `dd/MM/yyyy` y `d/M/yyyy`, y los muestra como `dd/mm/aaaa`. Rechaza `31/02/2026` y `03/15/2026` (RUI-15).
  - La semana empieza el lunes.

  **Selector de hora** (`mat-timepicker`): tiene la entrada `interval`, que admite 15 minutos. **Ajuste necesario para RUI-17:** con date-fns y el locale `es`, la hora sale como `6:30 PM` (formato `a`) o `6:30 p.m.` (`aaaa`), nunca como `6:30 p. m.`. `Intl` con `es-CR` sí da `6:30 p. m.`. Solución: un adaptador propio que extiende `DateFnsAdapter` y formatea las horas con `Intl`. La lectura de `6:30 p. m.` escrito ya funciona.

  **Intl:**
  - La marca UTC `2026-03-06T00:30Z` en `America/Costa_Rica` da `05/03/2026, 6:30 p. m.`. Hay que armar la fecha y la hora por separado para quitar la coma (RUI-16).
  - La moneda da `₡25 000,00` (RUI-18).

  **FullCalendar 7** (página de prueba con capturas de Edge sin interfaz a 1200 px y a 360 px, y prueba del clic con Vitest):
  - `timeGridWeek` con `allDaySlot: false`, `dayHeaderFormat: { weekday: 'long' }`, `hiddenDays: [0]`, `slotMinTime` y `slotMaxTime` muestra los días sin fecha, oculta el domingo y ajusta el rango de horas. Los bloques se repiten con `daysOfWeek`, `startTime` y `endTime`. `eventClick` recibe el id del bloque.
  - Algunas opciones cambiaron de nombre en la v7: `slotLabelFormat` ahora es `slotHeaderFormat` y `listDaySideFormat` es `listDayAltFormat`.
  - El locale se importa de `fullcalendar/locales/es`: `@fullcalendar/angular/locales/es` trae solo el tipo y no compila.
  - Ajustes que hay que hacer:
    - Las horas salen sin el espacio (`8:00a. m.`), así que los rótulos y las horas de los bloques se dibujan con nuestro formateador de `Intl`, con `slotHeaderContent` y `eventContent`.
    - Se resalta el día de hoy, así que hay que quitarlo, porque es un horario semanal y no un calendario.
    - Las clases CSS son internas y con hash (`fc-classic-TZ4…`). El estilo se ajusta con las variables de la paleta del tema (`--fc-classic-*`) y con las opciones `eventClass`, `dayHeaderClass`, `slotHeaderClass` y `dayCellClass`, nunca con selectores de sus clases.
  - **A 360 px, `listWeek` no sirve:** su columna de hora tiene un ancho fijo y el título del bloque se corta, aun forzando el ajuste de línea con una clase propia. **Propuesta:** en pantallas angostas, `HorarioSemanal` dibuja su propia lista por día (un `@for` agrupado, como en el wireframe), y usa FullCalendar solo para la grilla. Así ni siquiera hace falta la vista `list`.
  - **Tamaño:** FullCalendar 7 + `temporal-polyfill` agregan unos 400 kB al bundle (el inicial de prueba llegó a 527 kB). Tiene que cargarse en diferido, solo en las vistas con horario (`V-16`, `V-19`, `V-27`, `V-34`).

  La prueba desechable se hizo en el directorio temporal de la sesión y se borró. El repositorio no tiene archivos nuevos fuera de los del entregable.
- 2026-11-20: T1 completada (aprobada por el usuario, con los dos ajustes: adaptador propio para las horas y lista propia en celular en lugar de `listWeek`; pasados a la spec v3). T2 en progreso. Al empezar T2 se revisó la estabilidad de dos APIs en los paquetes 22.3.0: `httpResource` y `resource` son estables desde la 22.0 (`@publicApi 22.0`), y **Signal Forms** (`form()` de `@angular/forms/signals`) también. La spec descartaba Signal Forms solo por ser experimental, así que se pregunta al usuario.
- 2026-11-20: el usuario mantiene **Reactive Forms**.
- 2026-11-20: T2 implementada, en revisión del usuario. `docs/arquitectura.md` creado con el encabezado, el índice de las 12 secciones (de la 3 a la 12, como pendientes) y:
  - §1 Stack: la tabla con las versiones de T1 y las licencias, y la tabla de lo que no se usa.
  - §2 Arquitectura del código: carpetas `api`, `core`, `shared` y `features`, con lo que va en cada una; dependencias permitidas, sin ciclos; las 8 áreas con sus vistas, rutas y roles; carga diferida; el flujo de matricular desde `V-01`; y convenciones.

  Decisiones de esta tarea:
  - **`httpResource`** para las consultas y `HttpClient` para las acciones. Es estable desde Angular 22.0 y no estaba en la spec; es parte de Angular, no una dependencia nueva.
  - **Las áreas siguen las secciones de §3 de los requerimientos**, con `acceso` y `cuenta` separadas para que lo público y lo protegido carguen por separado. `V-09` y `V-10` van en `core/paginas`.
  - **Solo `matricula` se comparte entre áreas**, a través de su `index.ts` (ventanas `V-32` y `V-33` y el retiro). Navegar por `routerLink` no cuenta como dependencia.
  - **Las rutas en español quedan fijadas**: `/iniciar-sesion`, `/mis-matriculas`, etc.
  - **`canMatch` en las áreas de un solo rol**, para que los demás roles no descarguen su código. **FullCalendar se carga con `@defer`**, solo en pantallas anchas.
  - **Las dependencias entre carpetas se hacen cumplir con `no-restricted-imports` de ESLint.** El detalle va en §10 (T5).

  Verificación: cada vista de `V-01` a `V-38` está en una sola área (las 38: 4 + 1 + 3 + 9 + 8 + 3 + 5 + 3 + 2); cada dependencia de §1 está en la spec o en T1; las dependencias entre carpetas y áreas no tienen ciclos (`matricula` no importa de ninguna área).
- 2026-11-20: T2 completada (aprobada por el usuario). T3 en progreso.
- 2026-11-20: contrato revisado en el backend (`SPEC-acceso`, `GlobalExceptionHandler`, `LimitesPeticiones`, `PaginacionRequest`, `PerfilResponse`, CORS de `Program.cs` y `appsettings.Development.json`):
  - El login, `cambio-obligatorio` y `cambiar-contrasena` devuelven `{ accessToken, expiraEn, rol, debeCambiarContrasena }`. El token dura 60 minutos, sin refresh.
  - `GET /me` responde `403 RN-24` con un cambio pendiente.
  - El `code` y los datos extra del `409` (por ejemplo, `usuarioId` en RN-39) van como extensiones del `ProblemDetails`.
  - Paginación: `page` ≥ 1, `pageSize` entre 1 y 100 (por defecto 20), `search`.
  - El CORS de desarrollo permite `http://localhost:5173`.
  - **Brecha nueva, B-05:** el `429` trae `Retry-After`, pero el CORS no lo expone (`WithExposedHeaders`), así que el navegador no deja leerlo desde otro origen, y el cuerpo no trae los segundos. El usuario eligió registrarla para el backend (`.WithExposedHeaders("Retry-After")`). Mientras tanto, el frontend muestra el `detail` y deshabilita el envío 60 segundos. Queda anotada en §8 de `docs/requerimientos.md`, con su historial.
- 2026-11-20: T3 implementada, en revisión del usuario. Se agregaron a `docs/arquitectura.md` §3 (URL base y `HttpClient`, tipos generados, clientes por recurso, listados con estado en la URL y la tabla de errores con `ErrorApi`) y §4 (la sesión, los interceptores, una guarda por cada fila de la §2.5, lo que se muestra según el rol y las reglas de seguridad). Decisiones:
  - **El archivo generado `esquema.d.ts` se versiona** y no se edita. `modelos.ts` le da nombres legibles. Las fechas quedan como texto en los modelos y se convierten solo al mostrarlas o en los formularios.
  - **Los clientes devuelven `httpResource` en las consultas** (`…Recurso`) y un `Observable` en las acciones, que se consumen con `await firstValueFrom` y un `try/catch` con `ErrorApi`.
  - **Los parámetros de la URL usan los mismos nombres que la API.**
  - **Solo el `401` con token y el `403 RN-24` se manejan globalmente.** El resto, junto a la acción (`ErrorAccion`) o en la vista (`EstadoContenido`). El `403` al cargar muestra `V-09` con `skipLocationChange`.
  - **La sesión guarda `accessToken`, `expiraEn`, `rol`, `debeCambiarContrasena` y `nombre`** (este último de `GET /me`) en la clave `matricula.sesion`. `sesionGuard` también trata como vencida una sesión con `expiraEn` pasado.
  - **La ruta `volver` solo se acepta si es interna** (`/…` y no `//…`), para que no sirva de redirección abierta.
  - **El token solo se envía a `API_URL`.**
  - **Hay un tiempo de espera de 30 segundos** (opción `timeout` de `HttpClient`). `withFetch()` no se usa porque está obsoleto: fetch ya es el backend por defecto (verificado en los tipos de `@angular/common` 22.3.0).
  - **A revisar en la primera generación de tipos:** si ASP.NET Core declara los números como `integer | string`.

  Verificación: cada fila de RUI-03 y RUI-04 y cada situación de la §2.5 (más RUI-09) tienen su lugar en §3.5 y §4.3. Lo que se supone del contrato coincide con el backend (revisión de arriba), salvo B-05, que quedó registrada.
- 2026-11-20: T3 completada (aprobada por el usuario). T4 en progreso.
- 2026-11-20: T4 implementada, en revisión del usuario. Se agregaron a `docs/arquitectura.md`:
  - §5 Formularios: estructura con `NonNullableFormBuilder` y las funciones `aRequest`/`aFormulario`; tabla de validadores de RUI-06, con RN-26 tomada del backend (8 caracteres, una mayúscula, un número, hasta 128); errores del servidor con `aplicarErroresServidor`; el envío con el ejemplo de código; y los cambios sin guardar.
  - §6 Componentes y estilo visual: Material y sus opciones por defecto; la tabla de los 11 componentes de `componentes.html` con su pieza; `HorarioSemanal` con la configuración de T1; diseño adaptable; la tabla de accesibilidad de §6; y la paleta.
  - §7 Formatos: locale, la tabla por tipo de dato y `AdaptadorFechas`.

  Decisiones:
  - **Paleta propia 60-30-10:**
    - Neutro: fondo `#F5F7FA` y superficies blancas, texto `#1A2230`.
    - Secundario: barra `#1E3A5F` (azul marino) y secundario suave `#E3EAF3`.
    - Acento: `#0F766E` (verde azulado), solo para la acción principal, los enlaces, el foco y la selección.
    - Seis tonos de estado, con la asignación de cada estado de grupo y de matrícula.

    Se calculó el contraste de 26 combinaciones con la fórmula de WCAG 2 (un script de Node en el directorio temporal, ya borrado). Todas cumplen el mínimo.
  - **Material 22 se tematiza con `mat.theme` y `mat.theme-overrides`**, más el schematic `theme-color` (verificado en el paquete 22.3.0). Las variables de FullCalendar se mapean a la misma paleta.
  - **Sin dependencias nuevas para la tipografía ni los íconos:** fuente del sistema, y los SVG de Material Symbols (Apache-2.0) copiados a `public/iconos/` y registrados con `MatIconRegistry`.
  - **`HorarioSemanal` es de presentación pura.** El periodo lo elige `SelectorPeriodo` (también de `shared/ui`), que dibuja la vista porque `shared` no llama a la API. En la grilla, una lista por día oculta a la vista sirve a los lectores de pantalla.
  - **La pestaña activa de un detalle va en la URL** (`?pestana=`), para que los enlaces de `RN-36` y `RN-37` abran la pestaña correcta.
  - **Puntos de corte:** 600 px (celular: tarjetas y lista) y 960 px (menú fijo o plegable).
  - **Los formateadores son funciones puras en un solo archivo**, que comparten los pipes, el adaptador y el horario. Las fechas `DateOnly` nunca pasan por `new Date('yyyy-MM-dd')`.

  Verificación: los 11 componentes de `componentes.html` tienen su pieza; de la RUI-06 a la RUI-20, cada una aparece en §5 a §7; los 8 puntos de accesibilidad de §6 tienen cómo se cumplen; y la tabla de contraste cumple 4,5:1 en el texto y 3:1 en los bordes y el foco.
- 2026-11-20: T4 completada (aprobada por el usuario). T5 en progreso.
- 2026-11-20: T5 implementada, en revisión del usuario. Se agregaron a `docs/arquitectura.md` §8 (buenas prácticas y la meta de carga inicial), §9 (pruebas), §10 (convenciones), §11 (comandos y configuración) y §12 (orden de implementación). Ya no quedan secciones pendientes. Decisiones:
  - **Nombres en kebab-case al estilo del CLI de Angular 22**, con el tipo separado por guion: `cursos-api.ts`, `sesion-service.ts`, `sesion-guard.ts`, `fecha-pipe.ts`. Los componentes no llevan sufijo. Para quedar coherentes, se renombraron en §2 y §3 los `*.api.ts` a `*-api.ts`, y en §5 y §6 `Avisos` y `Confirmaciones` a `AvisosService` y `ConfirmacionesService`.
  - **Prefijo de selectores: `sm`.** Variables CSS: `--sm-*`.
  - **Meta de carga inicial:** como mucho 500 kB sin comprimir y un LCP de menos de 2,5 s en Lighthouse (escritorio, build de producción en local). Los presupuestos de `initial` avisan en 500 kB y fallan en 750 kB.
  - **`OnPush` en todos los componentes**, como valor por defecto del generador. `effect()` solo para sincronizar con algo externo.
  - **Pruebas:** una tabla de piezas con sus casos y sin un porcentaje de cobertura. La función que arma la configuración de la grilla es pura y se prueba; FullCalendar no se prueba.
  - **`pnpm-workspace.yaml`** con `saveExact`, `minimumReleaseAge: 10080` (una semana, la que sugiere pnpm), `trustPolicy: no-downgrade` y `allowBuilds` con los cuatro paquetes del CLI en `false`.
  - **Antes de cerrar un módulo:** `pnpm formato:revisar && pnpm lint && pnpm test --watch=false && pnpm build` y `pnpm audit`.
  - **La versión del pie sale del `package.json`:** empieza en `0.1.0` y la versión menor sube al cerrar cada módulo.
  - **Orden de 10 módulos con ids propuestos:** `fundacion`, `nucleo`, `componentes`, `acceso`, `oferta`, `catalogos`, `personas`, `grupos`, `matricula` y `sistema`. Las secciones que una vista recibe de un área posterior se completan con esa área, como en los wireframes.

  Verificación: cada comando tiene su script; el orden de §12 cubre las 38 vistas y respeta las dependencias de §2.4 (`matricula`, de la que dependen `oferta`, `catalogos`, `personas` y `grupos`, va después de ellas y completa sus secciones); ninguna área queda sin un paso.
- 2026-11-20: T5 completada (aprobada por el usuario). T6 en progreso.
- 2026-11-20: T6 implementada; falta la aprobación del documento completo por parte del usuario y, después, el cierre y el commit. Verificación con la tabla de la spec:

  | Qué | Resultado |
  |---|---|
  | Cobertura de los requerimientos | Las 23 RUI aparecen en el documento (`grep -o "RUI-[0-9]*"`). Las 7 situaciones de la §2.5, en §4.3 (más RUI-09). Requerimientos no funcionales de §6: dispositivos (§6.4), accesibilidad (§6.5), idioma (§7.1), seguridad (§4.5), rendimiento (§8.3), fechas (§7), configuración por entorno (§3.1, §11.3) y compatibilidad con la API (§3.2). **Faltaban los navegadores:** se agregó la fila "Navegadores" en §1 |
  | Cobertura de los wireframes | Los 11 componentes de `componentes.html`, en la tabla de §6.2 |
  | Dependencias | Versiones verificadas otra vez con `npm view` el 2026-11-20, sin cambios desde T1. Todas tienen licencia (MIT, salvo TypeScript, Apache-2.0) y son compatibles con Angular 22. TypeScript queda en 6.0, por el peer `>=6.0 <6.1` de Angular |
  | Contrato | Revisado contra el backend en T3. La única diferencia, el `Retry-After` no expuesto, quedó como B-05 en §8 de `docs/requerimientos.md`, con su comportamiento provisional |
  | Sin contradicciones | Nada contradice `AGENTS.md` (contraseñas, no modificar la API) ni `specs/fase-0.md` (supuesto 6: B-05 se registró y no se tocó la API). La spec quedó en v3 con los ajustes de T1 |
  | Accionable | Comandos completos con sus scripts (§11.2), estructura de carpetas (§2.2), `pnpm-workspace.yaml` (§10.4) y orden de módulos con ids propuestos (§12) |

  `AGENTS.md` quedó completado con:
  - Las fuentes de verdad, sin los "cuando esté aprobado".
  - Los comandos y el chequeo de cierre de un módulo.
  - La estructura del código, las dependencias permitidas y los nombres.
  - Los límites técnicos ("Siempre", "Preguntar antes" y "Nunca").
  - El flujo de los módulos con el orden de §12.
- 2026-11-20: T6 completada: el usuario aprobó el documento completo. Entregable cerrado: `docs/arquitectura.md` aprobado, spec y lista de tareas cerradas, `specs/fase-0.md` con la fase completada.

## Plan

**Enfoque:** primero se verifica lo que el documento va a afirmar sobre las librerías: versiones, licencias, compatibilidad y los comportamientos que más riesgo tienen. Después se redacta `docs/arquitectura.md` por bloques de secciones, en el orden del alcance de la spec. Cada bloque se apoya en el anterior: la estructura del código (T2) define dónde viven las piezas que describen T3 a T5. Al final se verifica el documento completo y se completan `AGENTS.md` y la fase 0.

**Fuentes por tarea:**
- `docs/requerimientos.md`: la §2.5 para las guardas, la §5 (RUI) para errores, formularios y formatos, y la §6 para los requerimientos no funcionales.
- `docs/wireframes/componentes.html`, para la correspondencia de componentes.
- `../sistema-matricula-api/docs/arquitectura.md`, como modelo de forma.
- Las specs del backend y su carpeta `correcciones/`, solo para confirmar lo que el documento supone del contrato: autenticación, `ProblemDetails`, paginación y CORS.

**Orden y dependencias:** T1 → T2 → T3 → T4 → T5 → T6, en secuencia.
- T1 va primero porque sus resultados pueden cambiar una decisión del stack. Si una prueba falla, por ejemplo si el adaptador de fechas no lee `dd/mm/aaaa`, se pregunta antes de redactar.
- T2 fija el stack y las carpetas, que el resto del documento cita.
- T6 depende de que todas las secciones existan.

**Riesgos:**
- **Afirmar sobre una librería algo que no es cierto en la versión fijada.** Por ejemplo, el nombre de un ajuste de pnpm 12 o una opción de FullCalendar 7. Mitigación: T1 lo verifica en la documentación o en una prueba desechable, y el documento solo cita lo verificado.
- **Que el documento crezca hasta ser un manual de Angular.** Mitigación: cada sección dice solo lo que es propio de este proyecto y cita la RUI, RFF o requerimiento no funcional que resuelve. Lo que es estándar de Angular se nombra sin explicarse.
- **Contradecir el contrato de la API.** Mitigación: T3 confirma cada supuesto contra la spec del módulo correspondiente del backend y sus `correcciones/`.
- **Una paleta que no cumpla el contraste.** Mitigación: T4 calcula la relación de contraste de cada combinación y la anota en una tabla.

**Pruebas desechables:** en el directorio temporal de la sesión, nunca en el repositorio (supuesto 2 de la spec). Se borran al terminar T1. Solo su resultado queda anotado en el historial y en el documento.

**Puntos de control:** al terminar cada tarea, el usuario revisa las secciones nuevas de `docs/arquitectura.md`, o los resultados de T1. Al terminar T6, revisa el documento completo con la tabla de verificación de la spec.

## Estado de las tareas

| Tarea | Estado | Revisión del usuario | Commit |
|---|---|---|---|
| T1 Verificación de las dependencias y pruebas desechables | Completada | Aprobada | `7936f0a` |
| T2 Stack y arquitectura del código (§1 y §2) | Completada | Aprobada | `7936f0a` |
| T3 Integración con la API y sesión (§3 y §4) | Completada | Aprobada | `7936f0a` |
| T4 Formularios, componentes, estilo visual y formatos (§5 a §7) | Completada | Aprobada | `7936f0a` |
| T5 Buenas prácticas, pruebas, convenciones, comandos y orden (§8 a §12) | Completada | Aprobada | `7936f0a` |
| T6 Verificación final, `AGENTS.md` y cierre | Completada | Aprobada | `7936f0a` |

**Estados de una tarea:** Pendiente · En progreso · Implementada (hecha, falta la revisión del usuario) · Bloqueada · Completada.
**Commit:** uno solo al terminar todas las tareas del entregable (supuesto 6 de la spec); al hacerlo se anota su hash en todas las filas.

## Tareas

- [x] **T1 Verificación de las dependencias y pruebas desechables**
  - Acceptance:
    - Una tabla en el historial con cada dependencia de la spec:
      - Versión exacta vigente, licencia y compatibilidad con Angular 22: `peerDependencies` de `@fullcalendar/angular`, `@angular/material-date-fns-adapter` y `openapi-typescript`.
      - Las dependencias que tienen scripts de instalación y habrá que autorizar en pnpm.
    - Los nombres y la forma de configurar, en pnpm 12, la lista de dependencias autorizadas a ejecutar scripts, la antigüedad mínima de las versiones y la instalación con el lockfile congelado. Se toman de la documentación oficial de la versión fijada.
    - Una prueba desechable (Angular 22 + Material + date-fns + FullCalendar, instalada con pnpm en el directorio temporal) que confirme:
      - Que el selector de fecha de Material, con el adaptador de date-fns y el locale `es`, lee una fecha escrita como `dd/mm/aaaa` y la muestra igual (RUI-15).
      - Que el selector de hora de Material muestra 12 horas con a. m. y p. m. y acepta un intervalo de 15 minutos (RUI-17, supuesto 5).
      - Que FullCalendar (`timeGridWeek` y `listWeek`) muestra los días sin fecha, oculta el domingo, ajusta el rango de horas a los bloques y lleva al `eventClick` (RFF-29).
      - Que el CLI crea el proyecto con Vitest como corredor de pruebas y con zoneless por defecto, o qué hace falta configurar.
    - Si algo no funciona como supone la spec, se anota la alternativa y se pregunta al usuario antes de seguir.
  - Verify: cada afirmación de la tabla tiene su fuente (comando `npm view`, página de la documentación o resultado de la prueba); la prueba desechable se borró y el repositorio no tiene archivos nuevos fuera de este `todo.md`.
  - Files: `tasks/arquitectura/todo.md`

- [x] **T2 Stack y arquitectura del código (§1 y §2)**
  - Acceptance:
    - `docs/arquitectura.md` creado con el encabezado de estado, la introducción y el índice de las 12 secciones.
    - §1 Stack: tabla Pieza · Elección · Por qué, con las versiones de T1 y la licencia de cada dependencia, más la lista de lo que no se usa y por qué.
    - §2 Arquitectura del código:
      - Las carpetas `core`, `shared`, `api` y `features`, con lo que va en cada una y las dependencias permitidas entre ellas, en un diagrama como §2.3 del backend.
      - Las áreas de `features`, con las vistas `V-xx` que contiene cada una.
      - La carga diferida por área y por rol.
      - El flujo de una vista con el ejemplo de matricular (`V-32`): ruta y guardas, componente, servicio, interceptor, API, y respuesta o error presentado según RUI-04.
  - Verify: cada vista `V-01` a `V-38` está asignada a una sola área; ninguna dependencia de la §1 falta en la spec o en T1; la dirección de las dependencias no tiene ciclos.
  - Files: `docs/arquitectura.md`

- [x] **T3 Integración con la API y sesión (§3 y §4)**
  - Acceptance:
    - §3 Integración con la API:
      - Generación de los tipos con openapi-typescript: comando, archivo de salida y cuándo se regenera.
      - Forma de los servicios por recurso.
      - Paginación y filtros reflejados en la URL (RUI-10, RUI-11).
      - URL base por entorno.
      - Tabla `ProblemDetails` → presentación para cada fila de RUI-03 y RUI-04, incluidos `errors` por campo sin distinguir mayúsculas (RUI-02), `traceId` (RUI-03), `Retry-After` (`429`) y la falta de respuesta.
    - §4 Sesión y seguridad:
      - Qué se guarda en `sessionStorage`: el token y los datos de la sesión que se leen del login y de `GET /me`. Cuándo se descarta.
      - Interceptor del token y del `401` (RFF-03).
      - Una guarda por cada fila de la §2.5, incluidos la vuelta a la ruta pedida, RN-24 y `canDeactivate` para RUI-09.
      - Reglas sobre el token y las contraseñas (§6, "Seguridad en el cliente").
  - Verify: cada fila de RUI-03, RUI-04 y §2.5 tiene su lugar en el documento. Lo que se supone del contrato coincide con el backend: respuesta del login (`rol`, `debeCambiarContrasena`), claim de cambio pendiente, 60 minutos sin refresh, `ProblemDetails` con `code` y `traceId`, paginación y CORS en el puerto 5173 (revisado en la spec de autenticación del backend y en `correcciones/`).
  - Files: `docs/arquitectura.md`

- [x] **T4 Formularios, componentes, estilo visual y formatos (§5 a §7)**
  - Acceptance:
    - §5 Formularios:
      - Validadores compartidos para los límites de RUI-06.
      - Cuándo se muestran los errores (al salir del campo o al enviar).
      - Cómo se aplican los errores del servidor a los campos y arriba del formulario.
      - Envío en curso (RUI-08) y cambios sin guardar (RUI-09).
    - §6 Componentes y estilo visual:
      - Tabla Componente del catálogo de los wireframes · Pieza (Material o propio) · Regla, con todas las filas de `componentes.html`.
      - `HorarioSemanal` sobre FullCalendar, con la configuración verificada en T1.
      - Diseño adaptable desde 360 px, con tablas que pasan a tarjetas (RUI-14).
      - Accesibilidad de la §6.
      - Paleta propia con la regla 60-30-10 y los colores de estado aparte, en las variables del tema de Material, con una tabla de contraste calculado que cumpla WCAG AA.
      - Tipografía e íconos servidos desde el propio proyecto, sin CDN.
    - §7 Formatos: locale `es-CR`, `DateOnly` sin conversión, marcas UTC en `America/Costa_Rica` con `Intl`, horas de 12 horas, moneda en colones, etiquetas de enums (RUI-19) y el paso de 15 minutos del selector de hora. Indica dónde vive cada formateador (pipes de `shared`).
  - Verify: cada componente de `componentes.html` y cada RUI de la RUI-06 a la RUI-20 tiene su pieza; cada par de colores de la tabla tiene una relación de contraste de al menos 4,5:1 para el texto normal o de 3:1 para el texto grande y los bordes de los controles.
  - Files: `docs/arquitectura.md`

- [x] **T5 Buenas prácticas, pruebas, convenciones, comandos y orden (§8 a §12)**
  - Acceptance:
    - §8 Buenas prácticas de Angular:
      - Standalone, signals, zoneless u `OnPush` según lo que verificó T1, `@if`/`@for`, `inject()` y funciones para las guardas e interceptores.
      - TypeScript estricto y manejo de suscripciones.
      - Una meta concreta para la carga inicial (§6, "Rendimiento percibido") y cómo se cumple: presupuestos de tamaño en `angular.json` y carga diferida.
    - §9 Pruebas: Vitest, qué se prueba (guardas, interceptor, errores, validadores, formatos, componentes compartidos), dónde viven las pruebas y qué queda diferido (e2e).
    - §10 Convenciones:
      - Idioma y nombres de archivos, clases y selectores (con un prefijo de selector).
      - Formato con Prettier y lint con angular-eslint.
      - Comentarios, commits y `README`.
      - Seguridad de las dependencias con pnpm, con los ajustes verificados en T1.
    - §11 Comandos y configuración: instalación, desarrollo en el puerto 5173, build, pruebas, lint, regeneración de tipos y la versión del `package.json` en el pie (RUI-23).
    - §12 Orden sugerido de implementación: esqueleto y piezas transversales primero, después las áreas en un orden que sirva de base para `specs/mapa-modulos.md`.
  - Verify: cada comando está completo y sus scripts están nombrados; el orden de §12 respeta las dependencias entre las áreas de §2; ningún paso del orden queda sin un área.
  - Files: `docs/arquitectura.md`

- [x] **T6 Verificación final, `AGENTS.md` y cierre**
  - Acceptance:
    - La tabla de verificación de la spec, cumplida y anotada en el historial.
    - `AGENTS.md` completado con los comandos, la estructura del código y los límites técnicos del documento (supuesto 5 de la fase 0).
    - Estado de `docs/arquitectura.md` en "Aprobado", spec y lista de tareas cerradas, y `specs/fase-0.md` con el entregable completado y el siguiente paso (`specs/mapa-modulos.md`).
    - Commit único del entregable, con su hash anotado.
  - Verify: `grep -o "RUI-[0-9]*" docs/arquitectura.md | sort -u` cubre de la RUI-01 a la RUI-23; las versiones citadas coinciden con un `npm view` del día; el usuario aprueba el documento.
  - Files: `docs/arquitectura.md`, `AGENTS.md`, `specs/SPEC-arquitectura.md`, `tasks/arquitectura/todo.md`, `specs/fase-0.md`
