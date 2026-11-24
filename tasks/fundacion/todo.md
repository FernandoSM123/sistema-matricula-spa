# Tareas: fundacion

Módulo `fundacion` del [mapa](../../specs/mapa-modulos.md). Spec: [`specs/SPEC-fundacion.md`](../../specs/SPEC-fundacion.md) · Plan: [`plan.md`](plan.md)

**Estado de la lista:** Aprobada (2026-11-23)

Cada tarea termina con:
- `pnpm lint`, `pnpm test --watch=false` y `pnpm build` en verde, desde que existen;
- la verificación indicada;
- un solo commit en la rama `fundacion`, con el código y la actualización de este archivo, la spec y el mapa. En la tabla se marca ✅, sin el hash.

## Estado

| Tarea | Estado | Código | Pruebas unitarias | Verificación manual | Commit |
|---|---|:---:|:---:|:---:|:---:|
| T1. Proyecto y configuración | Completada | ✅ | ➖ | ✅ | ✅ |
| T2. ESLint, Prettier y carpetas | Completada | ✅ | ➖ | ✅ | ✅ |
| T3. Formateadores, etiquetas y pipes | Completada | ✅ | ✅ | ➖ | ✅ |
| T4. `AdaptadorFechas` y opciones de Material | Completada | ✅ | ✅ | ➖ | ✅ |
| T5. Paleta, tema, tipografía e íconos | Completada | ✅ | ✅ | ✅ | ✅ |
| T6. Página de muestra, README y cierre | Completada | ✅ | ✅ | ✅ | ✅ |

**Estados de tarea:**
- **Pendiente:** no se ha empezado.
- **En progreso:** se está trabajando en ella.
- **Implementada:** el código está hecho, pero falta alguna columna o la revisión del usuario.
- **Bloqueada:** no puede avanzar; se indica el motivo debajo de la tabla.
- **Completada:** todas las columnas en ✅, ➖ o ⏳.

**Columnas:** ✅ hecho · ⬜ pendiente · ➖ no aplica · ⏳ parte diferida a otro módulo (anotada en sus tareas)

## Detalle

### T1. Proyecto y configuración
- Acceptance:
  - pnpm 12.21.0 instalado globalmente (supuesto 1 de la spec).
  - Versiones de §1 verificadas otra vez con `npm view`. Si una cambió, queda anotada en el historial y en §1 de la arquitectura.
  - Proyecto Angular 22.3 creado en la raíz con el CLI y pnpm:
    - standalone, zoneless, SCSS, sin SSR y con Vitest;
    - `--skip-git`, sin tocar `docs/`, `specs/` ni `tasks/`.
  - `pnpm-workspace.yaml` igual al de §10.4, y `packageManager: "pnpm@12.21.0"`.
  - Versiones exactas en `package.json`, sin `^` ni `~`.
  - `angular.json`:
    - prefijo `sm`;
    - generadores con `OnPush` y `scss`;
    - presupuestos de §8.3 (`initial` 500 kB y 750 kB, `anyComponentStyle` 4 kB y 8 kB);
    - `fileReplacements` para desarrollo.
  - `tsconfig.json` con las opciones estrictas de §8.2.
  - `src/environments/` (`environment.ts` y `environment.development.ts`, §3.1) con:
    - `apiUrl`: `http://localhost:5022/api/v1` en desarrollo. En producción, el mismo valor hasta que haya un despliegue, que no está en el alcance.
    - `nombreInstituto: 'Instituto de Cursos Libres'`.
    - `version`, importada de `package.json`, que queda en `0.1.0`.
  - Scripts `start`, `build`, `test`, `lint`, `formato` y `formato:revisar` de §11.2 (`lint` funciona desde T2).
  - `.gitignore` de Angular y pnpm.
  - Correcciones de documentos (decisiones 1 y 2 de la spec):
    - §10.3 de la arquitectura: un commit por tarea.
    - El nombre del instituto en RUI-23 (`docs/requerimientos.md`) y en §6.6 y §11.3 de la arquitectura.
- Verify:
  - Borrar `node_modules` y correr `pnpm install --frozen-lockfile`: sin errores ni scripts no autorizados.
  - `pnpm build` dentro de los presupuestos.
  - `pnpm start` responde en `http://localhost:5173`.
  - `git status` no muestra `node_modules/`, `dist/` ni `.angular/`.
- Files: `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `angular.json`, `tsconfig*.json`, `src/environments/*`, `.gitignore` (más los archivos que genera el CLI), `docs/arquitectura.md`, `docs/requerimientos.md`

### T2. ESLint, Prettier y carpetas
- Acceptance:
  - angular-eslint 22.7.0 (ver las versiones de T1) con:
    - las reglas recomendadas y las de accesibilidad de plantillas;
    - `no-console` y `@typescript-eslint/no-explicit-any` como error;
    - `no-restricted-imports` por carpeta, según §2.3 y §10.2.
  - Prettier 3.10 con `printWidth: 120`, `singleQuote: true`, `endOfLine: 'lf'` y el analizador `angular`, más un `.prettierignore` con `pnpm-lock.yaml`, `dist/`, `docs/wireframes/`, `*.md`, `.agents/` y `.claude/`.
  - Final de línea LF en todo el repositorio:
    - `.gitattributes` con `* text=auto eol=lf`, y los binarios (`*.ico`, `*.png`) marcados como `binary`;
    - los archivos ya versionados, normalizados con `git add --renormalize .`.
  - Carpetas `src/app/api/`, `core/`, `shared/` y `features/`, y `src/testing/`, con `.gitkeep` donde estén vacías.
- Verify:
  - `pnpm lint` y `pnpm formato:revisar` pasan.
  - Un import de prueba en cada caso prohibido (`shared` → `core`, `api` → `shared` y `features/a` → `features/b`) hace fallar `pnpm lint` con el mensaje de §2.3. Después se quitan.
  - Un `console.log` y un `any` de prueba también fallan.
  - `git ls-files --eol` no muestra archivos de texto con `crlf`, y los commits ya no dan el aviso "LF will be replaced by CRLF".
- Files: `eslint.config.js`, `.prettierrc`, `.prettierignore`, `.gitattributes`, `package.json`, `.gitkeep` de las carpetas

### T3. Formateadores, etiquetas y pipes
- Acceptance:
  - `shared/formatos/formateadores.ts` con:
    - `ZONA_INSTITUTO`;
    - `formatearFecha`, `formatearFechaHora`, `formatearHora`, `formatearMoneda` y `formatearNumero`, puros y con la zona como parámetro opcional (§7.2).
  - `shared/formatos/etiquetas.ts` con las tablas de RUI-19 y `etiquetar(tipo, valor)`. Un valor desconocido se devuelve tal cual.
  - Pipes `fecha`, `fechaHora`, `hora`, `moneda`, `numero` y `etiqueta`, standalone y puros.
  - Locale `es-CR` registrado y `LOCALE_ID` en `app.config.ts`.
- Verify: pruebas (escritas antes del código) que pasan:
  - `'2026-03-05'` → `05/03/2026`, sin crear un `Date`.
  - `'2026-03-06T00:30:00Z'` → `05/03/2026 6:30 p. m.` en Costa Rica (cae en el día anterior).
  - `'12:00:00'` → `12:00 p. m.`; `'00:00:00'` → `12:00 a. m.`; `'18:30:00'` → `6:30 p. m.`
  - `25000` → `₡25 000,00`, y `1234` → `1 234`.
  - Una etiqueta por cada tabla de RUI-19 (por ejemplo, `EnCurso` → En curso), más un valor desconocido.
  - `null`, `undefined` y texto vacío → `''`.
  - Las comparaciones normalizan los espacios de `Intl`.
- Files: `src/app/shared/formatos/formateadores.ts` y `.spec.ts`, `etiquetas.ts` y `.spec.ts`, los pipes con sus `.spec.ts`, `src/app/core/config/locale.ts`, `app.config.ts`

### T4. `AdaptadorFechas` y opciones de Material
- Acceptance:
  - `core/config/adaptador-fechas.ts`: `AdaptadorFechas` extiende `DateFnsAdapter` y solo cambia `format()` para las horas, con `formatearHora` (§7.3).
  - `MAT_DATE_FORMATS`:
    - lectura `['dd/MM/yyyy', 'd/M/yyyy']` y `['h:mm a', 'H:mm']`;
    - presentación `dd/MM/yyyy` y la hora propia.
  - `MAT_DATE_LOCALE` con el locale `es` de date-fns.
  - Opciones de Material (§6.1): `MAT_FORM_FIELD_DEFAULT_OPTIONS` (`outline`, `dynamic`), avisos de 5 segundos, `MatPaginatorIntl` en español ("Filas por página", "21–40 de 134") y `MatDatepickerIntl` en español.
  - Todo registrado en `app.config.ts`, en lugar de `provideDateFnsAdapter()`.
- Verify: pruebas que pasan:
  - El adaptador lee `05/03/2026` y `5/3/2026`.
  - Rechaza `31/02/2026` y `03/15/2026`.
  - Lee "6:30 p. m." y "18:30", y escribe "6:30 p. m.".
  - El rango del paginador da "21–40 de 134".
- Files: `src/app/core/config/adaptador-fechas.ts` y `.spec.ts`, `formatos-fecha.ts`, `material.ts` y `.spec.ts`, `app.config.ts`

### T5. Paleta, tema, tipografía e íconos
- Acceptance:
  - `src/styles/_paleta.scss` con las variables `--sm-*` de §6.6:
    - neutros, secundario y acento;
    - los seis tonos de estado (texto, fondo y borde);
    - el espaciado `--sm-espacio-1` a `--sm-espacio-5`.
  - `src/styles/_tema.scss`:
    - `mat.theme` con la paleta generada por `ng generate @angular/material:theme-color` desde el acento `#0F766E`;
    - `mat.theme-overrides` con `primary`, `on-primary`, `surface`, `on-surface`, `outline`, `error` y los demás tokens que hagan falta, hacia las `--sm-*`;
    - solo tema claro.
  - `styles.scss`:
    - fuente del sistema con base de 16 px;
    - fondo `--sm-fondo`;
    - foco `:focus-visible` de 2 px con el acento;
    - área táctil de 44 px por debajo de 600 px (§6.5).
  - Los íconos de la lista de §6.6, como SVG de Material Symbols en `public/iconos/`, con el `LICENSE` (Apache-2.0) al lado.
  - `core/config/iconos.ts` los registra con `MatIconRegistry.addSvgIcon` en el arranque.
- Verify:
  - `pnpm build` sin warnings de estilos y dentro de los presupuestos.
  - En el navegador, `getComputedStyle` de `:root` da los valores de §6.6.
  - Un `mat-icon` registrado se ve, sin peticiones fuera de `localhost` en la pestaña de red.
- Files: `src/styles/_paleta.scss`, `src/styles/_tema.scss`, `src/styles.scss`, `public/iconos/*`, `src/app/core/config/iconos.ts`, `app.config.ts`

### T6. Página de muestra, README y cierre
- Acceptance:
  - `app.html` muestra una página de muestra provisional (supuesto 3 de la spec) con:
    - la paleta (60-30-10 y los tonos de estado);
    - un botón principal y uno secundario;
    - un campo con error;
    - un `mat-datepicker` y un `mat-timepicker` de 15 minutos;
    - los íconos registrados;
    - un ejemplo de cada pipe.

    Queda marcada en el código como provisional, para que `nucleo` la reemplace.
  - `README.md` con:
    - requisitos (Node 24, pnpm 12.21, la API);
    - cómo levantar el SPA junto a la API;
    - los comandos de §11.2;
    - el chequeo de cierre de un módulo.
  - `pnpm audit` revisado.
  - Estados cerrados:
    - spec y lista de tareas completadas;
    - `fundacion` completado en el mapa;
    - avance en `specs/mapa-modulos.md`.
- Verify:
  - Los 7 criterios de éxito de la spec.
  - Revisión manual en la muestra:
    - colores y contraste;
    - el foco con Tab;
    - `05/03/2026` escrito a mano en el selector de fecha;
    - "6:30 p. m." en el selector de hora;
    - a 360 px, sin desplazamiento horizontal, en Chrome y Edge.

  El usuario revisa la muestra antes del commit de cierre.
- Files: `src/app/app.html`, `app.ts`, `app.scss`, `README.md`, `specs/SPEC-fundacion.md`, `specs/mapa-modulos.md`, `tasks/fundacion/todo.md`

## Historial

- 2026-11-23: plan y lista de tareas en revisión.
- 2026-11-23: plan y lista de tareas aprobados por el usuario. T1 en progreso.
- 2026-11-23: T1 completada.
  - **Versiones.** Angular 22.3.0 (18/11), Vitest 5.1.1 y angular-eslint 22.8.0 tenían menos de una semana, y `minimumReleaseAge` las rechaza. El usuario eligió instalar las anteriores:
    - Angular 22.2.6, con CLI y `@angular/build` 22.2.7.
    - Material, CDK y `material-date-fns-adapter` 22.2.7.
    - date-fns 4.4.0, TypeScript 6.0.3, Vitest 5.1.0, jsdom 31.0.1, Prettier 3.10.1, RxJS 7.8.2 y tslib 2.9.1.
    - angular-eslint 22.7.0 se instala en T2.

    Las peer dependencies son compatibles. Se anotó en §1 de la arquitectura; la subida a 22.3 queda para un módulo posterior.
  - **pnpm 12.21.0** instalado con `npm install -g`. npm no ejecutó sus scripts de instalación, y pnpm funciona sin ellos.
  - **Proyecto.** Se generó con `pnpm dlx @angular/cli@22.2.7 new` en el scratchpad (`--skip-git --skip-install --style scss --ssr false --prefix sm --ai-config none`) y se copió a la raíz. El `README.md` generado no se copió: el propio se escribe en T6.
  - **Ajustes sobre lo generado:**
    - Versiones exactas y `version` 0.1.0 en `package.json`.
    - Scripts de §11.2 (`lint` funciona desde T2).
    - `saveExact`, `minimumReleaseAge` y `trustPolicy` en `pnpm-workspace.yaml`. El CLI ya traía `allowBuilds` con los cuatro paquetes de §10.4.
    - En `angular.json`: `OnPush` en el generador, `initial` con error en 750 kB (el CLI trae 1 MB) y `fileReplacements`.
    - En `tsconfig.json`: `strict`, `strictTemplates` y `resolveJsonModule` explícitos, este último para leer la versión del `package.json`.
    - En `index.html`: `lang="es"` y el título "Sistema de Matrícula".
  - **Entornos:** `environment.ts` y `environment.development.ts` con `apiUrl`, `nombreInstituto` y `version`.
  - **Documentos:**
    - `docs/arquitectura.md`: versiones instaladas (§1), commits por tarea (§10.3) y nombre del instituto (§6.6, §11.3).
    - `docs/requerimientos.md`: nombre del instituto en RUI-23.
  - **Verificación:**
    - `rm -rf node_modules` y `pnpm install --frozen-lockfile` sin errores ni scripts ejecutados.
    - `pnpm build` con 216,98 kB iniciales (presupuesto: 500 kB).
    - `pnpm test --watch=false`: 2 pruebas, las que genera el CLI.
    - `pnpm start` responde `200` en `http://localhost:5173`.
    - `git status` ignora `node_modules/`, `dist/` y `.angular/`.
  - **Problemas del entorno, no del proyecto:**
    - OneDrive a veces bloquea un renombrado durante `pnpm install` ("concurrent package import did not settle"). Reintentar lo resuelve.
    - Las rutas de `node_modules` superan los 260 caracteres. PowerShell no puede borrarlas y git avisa "Filename too long"; `rm -rf` desde bash funciona.
    - `pnpm peers check` avisa de `@emnapi/*` en `@napi-rs/wasm-runtime`, una dependencia indirecta que solo se usa como alternativa WebAssembly. No afecta.
- 2026-11-23: el proyecto se movió a `C:proyectos personalessistema-matricula-spa` por el límite de 260 caracteres. Se verificó que todo siguiera funcionando; solo se había perdido `.claude/skills/spec-driven-development/SKILL.md`, que se restauró de git. El usuario añadió a T2 el final de línea LF (`e056745`) y la exclusión de los Markdown y las skills de Prettier (`a330012`).
- 2026-11-23: T2 completada.
  - **Instalación** con `ng add angular-eslint@22.7.0` (la 22.8.0 salió el 18/11 y aún no cumple la semana). Creó `eslint.config.js` y el target `lint` de `angular.json`. Dejó `^` en `eslint` y `@eslint/js`; se fijaron las resueltas: ESLint 10.15.0, `@eslint/js` 10.0.1, typescript-eslint 8.72.1 y `@angular-eslint/builder` 22.7.0. Anotadas en §1 de la arquitectura.
  - **Reglas entre carpetas** con `@typescript-eslint/no-restricted-imports` y patrones `regex` sobre los imports relativos (así `@angular/core` no se confunde con `core/`). Además de los tres casos de la verificación:
    - `shared` → `api` solo con `import type` (`allowTypeImports`), como pide §2.3.
    - `core` → `features` prohibido (§2.3).
    - Solo `oferta`, `personas`, `catalogos` y `grupos` importan de `matricula`, y solo su `index.ts` (tabla de §2.4).
  - **`src/main.ts`:** se quitó el `.catch((err) => console.error(err))` que genera el CLI, porque `no-console` lo rechaza (§4.5). Si el arranque falla, el navegador informa el rechazo de la promesa.
  - **Prettier:** `printWidth` 120 y `.prettierignore`. `pnpm formato` reformateó 7 archivos generados por el CLI (`app.config.ts`, `app.html`, `app.spec.ts`, `index.html`, `main.ts` y los `tsconfig.*.json`), sin cambios de código.
  - **Verificación:**
    - `pnpm formato:revisar` y `pnpm lint` pasan; `pnpm test --watch=false` (2 pruebas) y `pnpm build` (216,95 kB) siguen en verde.
    - Con archivos temporales, fallaron con el mensaje de su regla: `shared` → `core`, `shared` → `api` sin `import type`, `api` → `shared`, `core` → `features`, `personas` → `catalogos`, `personas` → `matricula/v/interno`, `sistema` → `matricula`, un `any` y un `console.log`. Pasaron `import type` desde `shared`, `personas` → `matricula` (`index.ts`) y `personas` → `core`. Después se borraron.
    - `git ls-files --eol` no muestra archivos con CRLF, y `pnpm install --frozen-lockfile` pasa.
- 2026-11-23: T3 completada.
  - **Pruebas primero:** se escribieron las de formateadores, etiquetas, pipes y locale, y fallaron (no existía el código) antes de implementarlo.
  - **`formateadores.ts`:**
    - `LOCALE_INSTITUTO` ('es-CR') y `ZONA_INSTITUTO`. El locale vive en `shared` porque `core` puede importar de `shared`, pero no al revés (§2.3).
    - Solo `formatearFechaHora` recibe la zona (por defecto, la del instituto): `formatearFecha` arma el texto sin `Date`, y `formatearHora` formatea en UTC para que `Intl` no convierta la hora.
    - Un valor vacío (`null`, `undefined`, `''`, `NaN`) da `''`. Un texto que no tiene el formato esperado se devuelve tal cual, igual que las etiquetas, para no ocultar un dato inesperado de la API.
    - Los `Intl.DateTimeFormat` se guardan uno por zona.
  - **`etiquetas.ts`:** las nueve tablas de RUI-19 con los tipos `rol`, `nivelCurso`, `modalidad`, `estadoGrupo`, `estadoMatricula`, `motivoRetiro`, `dia`, `accionAuditoria` y `origenError`. Usa `Object.hasOwn`, para que un valor como `toString` no se tome como etiqueta.
  - **Pipes** standalone y puros (`fecha`, `fechaHora`, `hora`, `moneda`, `numero`, `etiqueta`). Como solo delegan en los formateadores, sus pruebas van juntas en `pipes.spec.ts`, en lugar de un `.spec.ts` por pipe.
  - **Locale:** `core/config/locale.ts` con `provideLocale()`, que registra `es-CR` y fija `LOCALE_ID`, con su prueba. Se agregó a `app.config.ts`.
  - **`src/testing/espacios.ts`:** `normalizarEspacios` para comparar la salida de `Intl` (§7.2). `src/testing/` se excluyó de `tsconfig.app.json` para que no entre en el build; su `.gitkeep` se borró.
  - **Verificación:**
    - `pnpm test --watch=false`: 45 pruebas en verde (43 nuevas), con todos los casos de la verificación. En `es-CR` la hora sale con espacios normales y la moneda con espacios que no se parten; las pruebas normalizan ambos.
    - La independencia de la zona del dispositivo se prueba con `formatearFechaHora` en `UTC` y `Europe/Madrid`, y con un `Date` que falla si `formatearFecha` lo crea. Correr las pruebas con otra `TZ` no sirve en Windows: Node la ignora.
    - `pnpm formato:revisar`, `pnpm lint` y `pnpm build` (219,42 kB) pasan.
- 2026-11-23: el usuario decide hacer un solo commit por tarea (código y documentos juntos) y marcar la columna "Commit" con ✅ en lugar del hash. T1 a T3 se cambiaron a ✅; sus hashes están en `git log`.
- 2026-11-23: T4 completada.
  - **Pruebas primero:** las del adaptador y las de Material fallaron (no existía el código) antes de implementarlo.
  - **`formatos-fecha.ts`:** `FORMATOS_FECHA` con la lectura y la presentación de la tarea, más las etiquetas del calendario (`LLL yyyy`, `PPP`, `LLLL yyyy`). `FORMATO_HORA` (`h:mm a`) es el formato que el adaptador reconoce como hora.
  - **`AdaptadorFechas`:** solo cambia `format()`. Para `FORMATO_HORA` usa `formatearHora` y escribe la hora con **espacios normales**: date-fns no lee "6:30 p. m." con los espacios que no se parten (U+00A0, U+202F), que `Intl` usa en algunos navegadores, y el selector de hora vuelve a leer lo que escribe. Verificado con date-fns: "6:30 p. m." con espacios normales se lee, con esos espacios da una fecha inválida. Los pipes conservan la salida de `Intl`. Anotado en §7.3 de la arquitectura.
  - **`provideAdaptadorFechas()`** registra el adaptador, `MAT_DATE_LOCALE` (`es` de date-fns) y `MAT_DATE_FORMATS`, en lugar de `provideDateFnsAdapter()`.
  - **`material.ts`:** `provideMaterial()` con los campos `outline` y `dynamic`, los avisos de 5 segundos, `PaginadorIntl` y `SelectorFechaIntl`. El rango del paginador usa `formatearNumero` ("1–10 de 1 234") y, como el de Material, no recorta una página que quedó fuera del total.
  - **`app.config.ts`:** `provideLocale()`, `provideAdaptadorFechas()` y `provideMaterial()`.
  - **Verificación:**
    - `pnpm test --watch=false`: 65 pruebas en verde (20 nuevas). El adaptador lee `05/03/2026` y `5/3/2026`, rechaza `31/02/2026` y `03/15/2026`, lee "6:30 p. m.", "18:30" y "12:00 a. m.", escribe "6:30 p. m." y vuelve a leer lo que escribe. La semana empieza el lunes. El paginador da "21–40 de 134".
    - `pnpm formato:revisar`, `pnpm lint` y `pnpm build` pasan. La carga inicial sube a 278,27 kB por los módulos de Material (presupuesto: 500 kB).
- 2026-11-23: T5 implementada; falta la verificación en el navegador, que se hace con la página de muestra de T6.
  - **Íconos y `bypassSecurityTrust*`:** `MatIconRegistry.addSvgIcon` (§6.6) exige un `SafeResourceUrl`, que solo se obtiene con `bypassSecurityTrustResourceUrl`, y `AGENTS.md` lo prohibía. Además, el registro descarga los SVG con `HttpClient`. El usuario eligió una **excepción acotada**: el bypass solo en `core/config/iconos.ts`, sobre rutas fijas de `public/iconos/`, y `provideHttpClient()` en `app.config.ts` desde ahora (`nucleo` le agrega los interceptores). Anotado en `AGENTS.md` y §6.6.
  - **Paleta:** `src/styles/_paleta.scss` con las variables de §6.6 en `:root`, más `--sm-texto-sobre-marca`, `--sm-texto-sobre-acento` (los blancos de la tabla) y `--sm-fuente`.
  - **Tema:** `src/styles/_theme-colors.scss`, generado con `ng generate @angular/material:theme-color --primary-color=#0F766E` y sin cambios. `_tema.scss` aplica `mat.theme` (claro, fuente del sistema, densidad 0) y `mat.theme-overrides` hacia las `--sm-*`: `primary`, `on-primary`, `background`, `surface` y sus `surface-container` (blancos, como pide §6.6), `on-surface`, `on-surface-variant`, `secondary-container` (opción activa), `outline` y `error`. Las variables de FullCalendar quedan para `componentes`, que lo instala.
  - **`styles.scss`:** base de 16 px, fondo `--sm-fondo`, foco `:focus-visible` de 2 px con el acento y, por debajo de 600 px, 44 × 44 px para los botones que no son de Material. Los de Material ya tienen un área táctil de 48 px con la densidad 0 (`button-touch-target-size`).
  - **Íconos:** los 19 SVG de la lista de §6.6, de Material Symbols (estilo Outlined, 24 px), descargados del repositorio `google/material-design-icons` con su `LICENSE` (Apache-2.0) a `public/iconos/`, con nombres en español. Antes de copiarlos se revisó que cada uno tuviera solo `<svg>` y `<path>`.
  - **`iconos.ts`:** `ICONOS`, el tipo `Icono` y `provideIconos()`, que los registra con `provideAppInitializer`. Su prueba comprueba que cada ícono pide su archivo, y que un nombre desconocido falla.
  - **Verificación:**
    - `pnpm test --watch=false` (67 pruebas), `pnpm formato:revisar` y `pnpm lint` pasan.
    - `pnpm build` sin warnings de estilos: 312,47 kB iniciales (`HttpClient` y el registro de íconos; presupuesto: 500 kB) y 10,70 kB de estilos.
    - El CSS del build tiene las variables de §6.6, `dist/` publica los 19 íconos y la licencia, y el build no referencia ningún otro origen.
    - **Pendiente para T6:** en el navegador, `getComputedStyle` de `:root` y un `mat-icon` visible sin peticiones fuera de `localhost`.
- 2026-11-23: T6 completada y T5 verificada. Módulo completado.
  - **Página de muestra:** con la paleta (cada color muestra el valor de `getComputedStyle` en `:root`), los seis estados, el botón principal y el secundario, un enlace, el campo de correo con su error, `mat-datepicker`, `mat-timepicker` de 15 minutos, los 19 íconos, un ejemplo de cada pipe y la barra con el foco claro de §6.6. Marcada como provisional en el código.
  - **La muestra va en una ruta diferida** (`src/app/muestra/`, con `muestra.routes.ts`), no en `app.html`: en `app.html` la carga inicial llegaba a 744 kB (presupuesto: 500 kB; error en 750 kB). `app.html` queda con el `<router-outlet>`, y `App` ahora tiene `OnPush`, que el CLI no había puesto.
  - **Opciones de Material por área** (decisión del usuario): con la muestra diferida, la carga inicial seguía en 708 kB, porque `provideMaterial()` en la raíz importaba `MatDatepickerIntl`, `MAT_FORM_FIELD_DEFAULT_OPTIONS` y `MatPaginatorIntl`, y en cuanto una vista diferida usa esos controles, sus módulos completos pasan a un chunk compartido que se carga al inicio. Medido: sin el selector de fecha en la raíz, 618 kB; sin ninguna opción, 415 kB. Ahora:
    - `core/config/material.ts`: `provideMaterial()` solo con la duración de los avisos, en `app.config.ts`.
    - `core/config/material-vistas.ts`: `provideMaterialVistas()` con los campos, el paginador y el selector de fecha. Cada área lo registra en los `providers` de su ruta diferida (la muestra ya lo hace). Anotado en §2.5 y §6.1 de la arquitectura.
  - **Carga inicial: 499,92 kB.** El overlay del CDK y el botón de Material entran por los avisos; el marco de `nucleo` los usa igual. **Alerta para `nucleo`:** con la barra, el menú lateral y los menús, es probable que pase la advertencia de 500 kB (el error es en 750 kB).
  - **Tema:** `mat.button-overrides` para que el botón de contorno use el color del texto y el borde de los controles (§6.6).
  - **README.md:** requisitos, cómo levantar el SPA junto a la API (incluido el origen del CORS), los comandos de §11.2 y el chequeo de cierre.
  - **`pnpm audit`:** 1 hallazgo moderado, ninguno alto ni crítico. `minimatch` 10.2.6 (GHSA-g3hv-75wg-m249, denegación de servicio con patrones de glob), que llega por typescript-eslint. Se acepta: es una herramienta de desarrollo, solo procesa los patrones de nuestra configuración y no llega al navegador. Se revisa al actualizar angular-eslint.
  - **Criterios de éxito de la spec:**
    1. `pnpm install --frozen-lockfile` sin errores ni scripts, con versiones exactas (T1, T2).
    2. `pnpm formato:revisar`, `pnpm lint`, `pnpm test --watch=false` (68 pruebas) y `pnpm build` pasan, con 499,92 kB iniciales.
    3. Los imports prohibidos fallan en `pnpm lint` con el mensaje de §2.3 (T2).
    4. Las pruebas de formateadores, pipes y `AdaptadorFechas` cubren los casos de §9 (T3, T4).
    5. `pnpm start` abre la muestra en `http://localhost:5173`. El usuario la revisó: paleta y valores de `:root`, contraste, foco con Tab, `05/03/2026` escrito a mano, "6:30 p. m." en el selector de hora, los íconos sin peticiones fuera de `localhost` y 360 px sin desplazamiento horizontal.
    6. `pnpm audit` sin hallazgos altos ni críticos; el moderado, anotado.
    7. El `README.md` cubre los pasos para levantar el proyecto.
