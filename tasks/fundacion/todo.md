# Tareas: fundacion

Módulo `fundacion` del [mapa](../../specs/mapa-modulos.md). Spec: [`specs/SPEC-fundacion.md`](../../specs/SPEC-fundacion.md) · Plan: [`plan.md`](plan.md)

**Estado de la lista:** Aprobada (2026-11-23)

Cada tarea termina con:
- `pnpm lint`, `pnpm test --watch=false` y `pnpm build` en verde, desde que existen;
- la verificación indicada;
- un commit en la rama `fundacion`, cuyo hash se anota en la tabla.

## Estado

| Tarea | Estado | Código | Pruebas unitarias | Verificación manual | Commit |
|---|---|:---:|:---:|:---:|:---:|
| T1. Proyecto y configuración | Completada | ✅ | ➖ | ✅ | `152c1a3` |
| T2. ESLint, Prettier y carpetas | Completada | ✅ | ➖ | ✅ | `62f8a10` |
| T3. Formateadores, etiquetas y pipes | Pendiente | ⬜ | ⬜ | ➖ | ⬜ |
| T4. `AdaptadorFechas` y opciones de Material | Pendiente | ⬜ | ⬜ | ➖ | ⬜ |
| T5. Paleta, tema, tipografía e íconos | Pendiente | ⬜ | ➖ | ⬜ | ⬜ |
| T6. Página de muestra, README y cierre | Pendiente | ⬜ | ➖ | ⬜ | ⬜ |

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
