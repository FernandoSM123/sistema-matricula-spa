# Plan: fundacion

Módulo `fundacion` del [mapa](../../specs/mapa-modulos.md). Spec: [`specs/SPEC-fundacion.md`](../../specs/SPEC-fundacion.md) · Tareas: [`todo.md`](todo.md)

**Estado del plan:** Aprobado (2026-11-23)

## Enfoque

El orden va de lo que no tiene dependencias a lo que se verifica a mano:
1. El proyecto y su configuración.
2. Las reglas de calidad.
3. Las piezas puras con sus pruebas (formatos, adaptador).
4. El estilo.
5. La página de muestra, que junta todo para la revisión visual.

Las piezas puras se escriben con las pruebas primero: los casos ya están fijados en RUI-15 a RUI-19 y en los resultados de T1 de la arquitectura.

Cada tarea termina con:
- `pnpm lint`, `pnpm test --watch=false` y `pnpm build` en verde, desde que existen;
- su verificación;
- un commit en la rama `fundacion` (decisión 5 del mapa).

## Componentes y orden

| # | Componente | Depende de | Notas |
|---|---|---|---|
| 1 | **Proyecto:** pnpm instalado, proyecto creado con el CLI en la raíz, `pnpm-workspace.yaml`, versiones exactas, `angular.json`, `tsconfig`, entornos y scripts. También la corrección de los documentos (decisiones 1 y 2 de la spec) | — | La base de todo lo demás |
| 2 | **Calidad:** ESLint (angular-eslint, `no-console`, `no-explicit-any`, reglas entre carpetas), Prettier y las carpetas vacías de §2.2 | 1 | Las reglas entre carpetas necesitan que existan las carpetas |
| 3 | **Formatos:** `formateadores.ts`, `etiquetas.ts`, los seis pipes y el locale `es-CR`, con sus pruebas | 2 | Funciones puras, sin Material |
| 4 | **Fechas de Material:** `AdaptadorFechas`, `MAT_DATE_FORMATS`, `MAT_DATE_LOCALE` y las opciones por defecto de Material, con sus pruebas | 3 | El adaptador usa el formateador de hora |
| 5 | **Estilo:** `_paleta.scss`, tema de Material, tipografía, foco, espaciado e íconos SVG | 2 | Independiente de 3 y 4 |
| 6 | **Muestra y cierre:** página de muestra, `README.md`, versión `0.1.0`, verificación manual y criterios de éxito | 3, 4, 5 | Cierra el módulo |

## Riesgos y mitigación

| Riesgo | Mitigación |
|---|---|
| `ng new` en un directorio que ya tiene archivos (`docs/`, `specs/`, `.git`) | Se crea con `--directory .` y `--skip-git`, después de comprobar que ningún archivo generado choca con uno existente. Si el CLI se niega, se crea en una carpeta temporal y se copian los archivos |
| `minimumReleaseAge` (una semana) rechaza una versión recién publicada que el CLI quiera instalar | Se fijan antes las versiones verificadas en `npm view`, y no se usan excepciones salvo un parche de seguridad (§10.4) |
| Un paquete con scripts de instalación no listado en `allowBuilds` hace fallar la instalación | La lista de §10.4 viene de T1. Si aparece otro, se detiene y se pregunta (`AGENTS.md`) |
| `ng add @angular-eslint/schematics` instala con `^` | `saveExact: true` en `pnpm-workspace.yaml` antes de agregarlo, y se revisa el `package.json` |
| `Intl` usa espacios que no se parten, y su texto puede variar según la versión de ICU de Node y del navegador | Las pruebas normalizan los espacios (§7.2, §9). Node 24 trae ICU completo |
| Las pruebas dependen de la zona horaria de la máquina | Los formateadores reciben la zona por parámetro, con `ZONA_INSTITUTO` por defecto (§9) |
| El tema generado por `theme-color` no coincide con la paleta | `mat.theme-overrides` fija los tokens que importan a las `--sm-*`, y se revisan en la página de muestra |
| Una regla de `no-restricted-imports` mal escrita deja pasar imports prohibidos | Se prueba con un import prohibido a propósito por cada carpeta, y después se quita |

## Puntos de verificación

- **Después de T1:** `pnpm install --frozen-lockfile` y `pnpm build` funcionan, y `pnpm start` sirve la página por defecto en el puerto 5173.
- **Después de T2:** los imports prohibidos fallan en `pnpm lint`, y `pnpm formato:revisar` pasa.
- **Después de T4:** todas las pruebas de formatos y del adaptador pasan.
- **Después de T6:** se cumplen los 7 criterios de éxito de la spec, y el usuario revisa la página de muestra.

## Fuera de este plan

- Lo que la spec deja fuera de su alcance: `api/`, sesión, marco, componentes y FullCalendar.
- Las verificaciones heredadas del mapa (navegadores y Lighthouse), que hace `nucleo`.
