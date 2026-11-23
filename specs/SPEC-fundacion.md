# Spec: fundacion

Módulo `fundacion` del [mapa de módulos](mapa-modulos.md). Sin dependencias.

| Estado | Plan | Tareas | Avance |
|---|---|---|---|
| **Aprobada** | [Aprobado](../tasks/fundacion/plan.md) | [Aprobadas](../tasks/fundacion/todo.md) | 1/6 tareas completadas |

**Historial:**
- 2026-11-23: v1 en revisión.
- 2026-11-23: v1 aprobada por el usuario, con sus cinco supuestos. Pregunta abierta resuelta: el instituto se llama **Instituto de Cursos Libres** (RUI-23). Plan y tareas en revisión.

## Objetivo

Crear el proyecto Angular y la base que usan todos los módulos siguientes:
- La configuración: pnpm, TypeScript estricto, ESLint con las reglas entre carpetas, Prettier y presupuestos.
- Las carpetas de `docs/arquitectura.md` §2.2.
- El estilo visual de §6.6: paleta, tema de Material, tipografía, espaciado e íconos.
- Los formatos de §7: locale `es-CR`, formateadores, pipes y `AdaptadorFechas`.

El módulo no tiene vistas ni RFF. Construye RUI-15 a RUI-19 como piezas probadas, que las vistas usan después.

**Usuario:** quien construye los módulos siguientes (el usuario y los agentes).

### Alcance

1. **Proyecto** (§1, §11):
   - Creado con el CLI de Angular 22.3 y pnpm 12.21 en la raíz del repositorio, junto a `docs/`, `specs/` y `tasks/`.
   - Componentes standalone y sin `zone.js`.
   - `package.json` con las dependencias exactas de §1 que este módulo usa (supuesto 2), `packageManager` y los scripts de §11.2, salvo `api:tipos`, que llega con `nucleo`.
   - `pnpm-workspace.yaml` de §10.4 y `pnpm-lock.yaml` versionado.
   - `.gitignore` para Angular y pnpm.
2. **Configuración** (§8.2, §10.2, §11.3):
   - `tsconfig.json` con las opciones estrictas de §8.2.
   - En `angular.json`: prefijo `sm`, generadores con `OnPush` y `scss`, los presupuestos de §8.3 y `fileReplacements` para desarrollo.
   - **ESLint** con angular-eslint (recomendadas y accesibilidad de plantillas), `no-console`, `no-explicit-any` y `no-restricted-imports` por carpeta (§2.3, §10.2).
   - **Prettier**, con `printWidth: 120`, `singleQuote: true` y el analizador `angular`.
3. **Carpetas y arranque** (§2.2):
   - `src/app/` con `api/`, `core/`, `shared/` y `features/`, vacías salvo lo de este módulo.
   - `app.ts`, `app.config.ts` (locale, adaptador de fechas y opciones de Material) y `app.routes.ts` sin rutas de áreas.
   - `src/environments/` con `apiUrl`, `nombreInstituto` y `version` (§11.3).
   - `src/testing/` para los datos de prueba compartidos (§9).
4. **Estilo visual** (§6.6):
   - `src/styles/_paleta.scss` con todas las variables `--sm-*`: colores, tonos de estado y espaciado.
   - Tema claro de Material: `mat.theme` con la paleta generada desde el acento, y `mat.theme-overrides` hacia las `--sm-*`.
   - Fuente del sistema con base de 16 px, y foco visible de §6.5.
   - Los íconos SVG de Material Symbols de la lista de §6.6, en `public/iconos/`, con el aviso de su licencia y registrados en `core/config/`.
5. **Formatos** (§7):
   - `shared/formatos/formateadores.ts`: funciones puras de fecha, fecha y hora, hora, moneda y número, con `ZONA_INSTITUTO`.
   - `shared/formatos/etiquetas.ts`: las tablas de RUI-19.
   - Los pipes `fecha`, `fechaHora`, `hora`, `moneda`, `numero` y `etiqueta`.
   - Locale: `registerLocaleData(es-CR)` y `LOCALE_ID`.
   - `core/config/adaptador-fechas.ts` (`AdaptadorFechas`) con `MAT_DATE_FORMATS` y `MAT_DATE_LOCALE` (§7.3).
   - Opciones por defecto de Material (§6.1): campos `outline`, avisos de 5 segundos, `MatPaginatorIntl` y `MatDatepickerIntl` en español.
6. **Página de muestra provisional** (supuesto 3): una sola página en la raíz que muestra la paleta, los botones, un campo con error, un selector de fecha, un selector de hora, los íconos y ejemplos de cada pipe. Sirve para verificar a mano el tema, el contraste y el adaptador. `nucleo` la reemplaza por el marco y la elimina.
7. **`README.md`** (§10.3): requisitos, cómo levantar el SPA junto a la API y los comandos de §11.2.
8. **Pruebas** (§9): formateadores, pipes y `AdaptadorFechas`.

### Fuera de alcance
- `api/`, sesión, interceptores, guardas, marco, `V-09` y `V-10`, y `openapi-typescript`: son de `nucleo`.
- Los componentes de `shared/ui` y `shared/formularios`: son de `componentes`.
- FullCalendar y `temporal-polyfill`: se instalan en `grupos`.
- Mapear las variables de FullCalendar (`--fc-classic-*`): también es de `grupos`.
- Pruebas e2e: siguen diferidas.

## Tech Stack

Lo de `docs/arquitectura.md` §1. Este módulo instala:
- **Angular:** `@angular/*` 22.3, Material y CDK 22.3.
- **Fechas:** date-fns 4.4 y `@angular/material-date-fns-adapter` 22.3.
- **Lenguaje:** TypeScript 6.0.
- **Pruebas:** Vitest 5.1 con jsdom.
- **Calidad:** angular-eslint 22.8 y Prettier 3.10.

Antes de instalar se vuelven a verificar las versiones con `npm view` (T1). Si salió un parche nuevo con al menos una semana de antigüedad (`minimumReleaseAge`), se usa ese y se anota en §1.

## Commands

```bash
npm install -g pnpm@12.21.0        # requisito, una sola vez (supuesto 1)
pnpm install --frozen-lockfile
pnpm start                         # http://localhost:5173: la página de muestra
pnpm test --watch=false
pnpm lint
pnpm formato:revisar
pnpm build                         # dentro de los presupuestos de §8.3
pnpm audit
```

**Cierre del módulo:** `pnpm formato:revisar && pnpm lint && pnpm test --watch=false && pnpm build` y `pnpm audit`.

## Project Structure

```
package.json, pnpm-workspace.yaml, pnpm-lock.yaml, angular.json, tsconfig*.json
eslint.config.js, .prettierrc, .prettierignore, .gitignore, README.md
public/iconos/                 SVG de Material Symbols y LICENSE
src/
  main.ts, index.html, styles.scss
  styles/_paleta.scss          Variables --sm-* (§6.6)
  styles/_tema.scss            mat.theme y mat.theme-overrides
  environments/                environment.ts, environment.development.ts
  testing/                     Datos de prueba compartidos (vacío por ahora)
  app/
    app.ts, app.html, app.scss, app.config.ts, app.routes.ts
    api/  features/            Vacías (con .gitkeep)
    core/config/               adaptador-fechas.ts, formatos-fecha.ts, iconos.ts, material.ts, locale.ts
    shared/formatos/           formateadores.ts, etiquetas.ts y los pipes, con sus .spec.ts
```

Los nombres exactos de los archivos de `core/config/` se ajustan en el plan.

## Code Style

El de `docs/arquitectura.md` §8 y §10. Un formateador:

```ts
// shared/formatos/formateadores.ts
export const ZONA_INSTITUTO = 'America/Costa_Rica';

/** RUI-15: 'yyyy-MM-dd' → 'dd/mm/aaaa', sin crear un Date ni convertir la zona. */
export function formatearFecha(valor: string | null | undefined): string {
  if (!valor) return '';
  const [anio, mes, dia] = valor.split('-');
  return `${dia}/${mes}/${anio}`;
}
```

## Testing Strategy

- **Formateadores y pipes:** los ejemplos de RUI-15 a RUI-19, incluidos:
  - el mediodía y la medianoche;
  - una marca UTC de la noche que en Costa Rica cae en el día anterior;
  - un valor de enum desconocido;
  - valores vacíos.

  Las comparaciones normalizan los espacios de `Intl`, y la zona se pasa por parámetro (§9).
- **`AdaptadorFechas`:** lee `dd/mm/aaaa` y `d/m/aaaa`; rechaza `31/02/2026` y `03/15/2026`; lee "6:30 p. m." y "18:30", y escribe "6:30 p. m.".
- **ESLint de las carpetas:** verificación manual. Un import prohibido de prueba (`shared` → `core`) hace fallar `pnpm lint`, y después se quita.
- **Manual, en la página de muestra:**
  - los colores coinciden con §6.6;
  - el foco se ve con el teclado;
  - el selector de fecha acepta `05/03/2026` escrito a mano;
  - el selector de hora muestra "6:30 p. m.";
  - los íconos cargan sin red externa;
  - Chrome y Edge en escritorio, y el modo celular de las herramientas del navegador a 360 px sin desplazamiento horizontal.

  Los cuatro navegadores y Lighthouse quedan para `nucleo` (verificaciones heredadas del mapa).

## Boundaries

- **Siempre:**
  - Las versiones exactas de §1.
  - Las reglas de `AGENTS.md`.
  - Commit después de cada tarea, en la rama `fundacion` (decisión 5 del mapa).
- **Preguntar antes:**
  - Una dependencia que no esté en §1.
  - Autorizar un script en `allowBuilds`.
  - Cambiar un color o una regla de ESLint de la arquitectura.
- **Nunca:**
  - Fuentes, íconos o scripts desde un CDN.
  - Desactivar opciones estrictas.
  - `new Date('yyyy-MM-dd')` para las fechas `DateOnly`.

## Success Criteria

1. `pnpm install --frozen-lockfile` instala sin errores ni scripts no autorizados, con versiones exactas en `package.json`.
2. `pnpm formato:revisar`, `pnpm lint`, `pnpm test --watch=false` y `pnpm build` pasan. El build queda dentro de los presupuestos (menos de 500 kB iniciales).
3. Un import prohibido entre carpetas hace fallar `pnpm lint` con el mensaje de §2.3.
4. Las pruebas de formateadores, pipes y `AdaptadorFechas` cubren los casos de la estrategia y pasan.
5. `pnpm start` abre la página de muestra en `http://localhost:5173`, con la paleta, el tema, la tipografía, el foco y los íconos de §6.6. Los íconos no hacen peticiones fuera del servidor local.
6. `pnpm audit` no tiene hallazgos altos ni críticos, o los que tenga quedan anotados con su justificación.
7. El `README.md` permite a otra persona levantar el proyecto con solo seguirlo.

## Supuestos

1. **pnpm se instala globalmente** con `npm install -g pnpm@12.21.0`, como dice §11.1. Hoy no está en la máquina. Corepack, que trae Node 24, sería otra opción, pero la arquitectura fija la instalación con npm.
2. **Cada módulo instala solo las dependencias que usa:**
   - `openapi-typescript`, con `nucleo`.
   - FullCalendar y `temporal-polyfill`, con `grupos`.

   Así `fundacion` no deja paquetes sin usar. Todas ya están aprobadas en §1.
3. **Página de muestra provisional.** Sin ella no hay dónde verificar el tema ni el adaptador hasta `componentes`. Vive en `app.html` (no es una vista `V-xx`), y `nucleo` la reemplaza.
4. **La versión del frontend** (`version` en `package.json`, mostrada en el pie por RUI-23) queda en `0.1.0` al cerrar `fundacion`. Cada módulo siguiente sube la versión menor (§11.3).
5. **Los íconos SVG** se copian del repositorio oficial de Material Symbols (`google/material-design-icons`, Apache-2.0). Es una descarga puntual de archivos, no una dependencia.

## Decisiones

1. **Corrección de `docs/arquitectura.md` §10.3:** dice "un solo commit al cerrar cada entregable o módulo". Se actualiza a la decisión 5 del mapa, aprobada por el usuario el 2026-11-23: un commit por tarea en la rama del módulo, y un pull request a `main` al cerrarlo. Se hace en la primera tarea.
2. **Nombre del instituto: "Instituto de Cursos Libres"** (2026-11-23, decidido por el usuario). Va en `nombreInstituto` de `environments/`. En la primera tarea se quita el "pendiente de definir" de RUI-23 (`docs/requerimientos.md`) y de §6.6 y §11.3 de la arquitectura. El pie lo muestra desde `nucleo`.

## Preguntas abiertas

Ninguna.
