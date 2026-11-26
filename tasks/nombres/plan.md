# Plan: nombres

Corrección `nombres`, previa a `componentes` (ver el [mapa](../../specs/mapa-modulos.md)). Spec: [`specs/SPEC-nombres.md`](../../specs/SPEC-nombres.md) · Tareas: [`todo.md`](todo.md)

**Estado del plan:** Aprobado (2026-11-24)

## Enfoque

Primero se fija la regla en los documentos, para que cada tarea siguiente tenga una referencia escrita. Después el código se renombra por capas, en el orden de las dependencias de §2.3: `api/`, que no depende de nada; la sesión, las guardas y los interceptores; la configuración y los formatos; lo visible (layout y páginas); y al final los estilos. Cada capa se renombra junto con todo lo que la importa, para que cada commit compile.

No se escriben pruebas nuevas, porque no hay comportamiento nuevo. La red de seguridad son las 197 pruebas de `nucleo`, que se renombran junto con lo que prueban y deben seguir pasando en cada tarea, todas y con el mismo número.

Cada archivo se mueve con `git mv`, para que git siga su historia, y después se edita su contenido.

Cada tarea termina con:
- `pnpm lint`, `pnpm test --watch=false` (20 archivos y 197 pruebas) y `pnpm build` en verde;
- un `grep` de los nombres viejos de esa capa, sin resultados en el código;
- su verificación;
- un commit en la rama `nombres` (decisión 5 del mapa).

## Componentes y orden

| # | Componente | Depende de | Notas |
|---|---|---|---|
| 1 | **Regla, documentos y scripts:** §10.1 y el resto de `docs/arquitectura.md`, `AGENTS.md`, `docs/requerimientos.md`, `README.md` y el mapa. Los scripts de `package.json`, `esquema.d.ts` → `schema.d.ts` y `eslint.config.js` | — | Los documentos quedan con los nombres nuevos antes que el código: durante T2 a T6 describen el destino, no el estado intermedio |
| 2 | **`api/`:** `models.ts`, `pagination.ts`, `api-error.ts` y los métodos de `AuthApi` y `MeApi` | 1 | `ApiError` lo usan los interceptores y las pruebas de `core/` |
| 3 | **Sesión, guardas e interceptores:** `core/session/`, `core/guards/`, `core/http/` y `src/testing/` | 2 | La capa con más pruebas: 3 a 4 archivos de pruebas cambian |
| 4 | **Configuración y formatos:** `core/config/` (incluidos los íconos y `public/icons/`) y `shared/formatting/` (formateadores, etiquetas y los pipes `sm*`) | 1 | Independiente de 2 y 3, pero se hace después para no mezclar capas en un commit |
| 5 | **Lo visible:** `core/layout/` (`Layout`, `UserMenu`, `Footer`, `nav-items.ts`), `core/pages/`, `app.ts`, `app.routes.ts`, clases CSS de los componentes y `environment.instituteName` | 3, 4 | Usa la sesión, los íconos y los pipes ya renombrados |
| 6 | **Estilos globales:** `_palette.scss`, `_theme.scss`, las variables `--sm-*` y `$font` en todos los `.scss` | 5 | Va después de 5 para no tocar dos veces los mismos `.scss` |
| 7 | **Cierre:** `grep` global, verificación a mano, `pnpm api:types`, `pnpm audit`, criterios de éxito, estados de la spec y del mapa | 1 a 6 | Deja el PR listo |

Nada se hace en paralelo: cada tarea parte del commit anterior.

## Riesgos y mitigación

| Riesgo | Mitigación |
|---|---|
| Un renombre en un archivo deja una importación rota en otro | `pnpm build` y `pnpm lint` en cada tarea. TypeScript estricto encuentra las importaciones y los símbolos que faltan |
| Un nombre que solo vive en una plantilla o un `.scss` (selector, clase CSS, variable `--sm-*`, nombre de ícono) no lo ve el compilador | `grep` de cada nombre viejo de las tablas de la spec en `src/` y `public/` al final de cada tarea. Revisión a mano del layout en T5 y T6 |
| Una prueba deja de probar algo, porque busca un selector o una clase que ya no existe y pasa sin encontrar nada | Las pruebas que buscan elementos (`querySelector`) se revisan una por una en T5. Se compara el número de pruebas, que debe seguir siendo 197 |
| `sm-layout` u otro selector nuevo choca con algo de Material | Los selectores de Material usan el prefijo `mat-`. `ng build` avisa si dos componentes comparten un selector |
| Una plantilla queda con el nombre viejo de un ícono (`svgIcon="salir"`), que el compilador no revisa | `MatIconRegistry` solo conoce los SVG de `public/icons/`, y `icons.spec.ts` comprueba que cada nombre de `ICONS` tiene su archivo. Los usos en plantillas se buscan con `grep svgIcon` y se ven a mano en T5 |
| Cambiar `schema.d.ts` cambia los tipos | `pnpm api:types` con la API en marcha genera el archivo nuevo; `git diff --stat -M` debe mostrarlo como renombrado al 100 % |
| Los `.md` de §2–§12 tienen unas 100 referencias, y se escapa alguna | `grep` de las tablas de la spec sobre los documentos vivos al final de T1 y otra vez en T7 |
| Un nombre que la spec no lista y la regla no deja claro | Se pregunta al usuario (decisión 5) y se agrega a la tabla de la spec |

## Puntos de verificación

- **Después de T1:** `pnpm format:check` y `pnpm api:types` funcionan con los nombres nuevos, y los documentos vivos ya no tienen los nombres viejos.
- **Después de T3:** las pruebas de sesión, guardas e interceptores pasan con los nombres nuevos.
- **Después de T5:** el layout del visitante y de un rol, `V-09` y `V-10` se ven igual que antes con `pnpm start`.
- **Después de T7:** se cumplen los 6 criterios de éxito de la spec, y el usuario revisa el diff antes del PR.

## Fuera de este plan

- Los documentos históricos (supuesto 1 de la spec).
- Construir las piezas futuras de la tabla 2.6: llegan con `componentes` y los módulos siguientes, ya con su nombre en inglés.
