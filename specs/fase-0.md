# Fase 0 — Fundamentos del frontend

Plan de la fase previa al [mapa de módulos](mapa-modulos.md) del frontend (SPA) del sistema de matrícula. Antes de definir los módulos que se construyen, se fijan tres documentos base: qué hace el frontend, cómo se ven sus vistas y con qué se construye.

| Estado | Avance |
|---|---|
| **Aprobado** | 3/3 entregables completados: **fase completada** (2026-11-20) |

**Historial:**
- 2026-11-17: v1 en revisión.
- 2026-11-17: v1 aprobada, con sus seis supuestos. Se crean `AGENTS.md` y `CLAUDE.md`, y empieza `requerimientos` con su spec en revisión.
- 2026-11-17: `requerimientos` completado: `docs/requerimientos.md` aprobado. Siguiente entregable: `wireframes` (sin empezar, a la espera del usuario).
- 2026-11-19: empieza `wireframes`, con su spec en revisión.
- 2026-11-19: spec de `wireframes` aprobada; la estructura de `docs/wireframes/` se ajusta a carpetas por área (supuesto 1 de la spec). Lista de tareas en revisión.
- 2026-11-19: lista de tareas de `wireframes` aprobada; entregable en elaboración.
- 2026-11-20: `wireframes` completado: `docs/wireframes/` aprobado, y RUI-23 (pie de página) agregada a `docs/requerimientos.md`. Siguiente entregable: `arquitectura` (sin empezar, a la espera del usuario).
- 2026-11-20: empieza `arquitectura`, con Angular como framework (elegido por el usuario) y su spec en revisión.
- 2026-11-20: spec de `arquitectura` aprobada (v2: Angular Material, token en `sessionStorage`, pruebas unitarias, pnpm y regla 60-30-10). Lista de tareas en revisión.
- 2026-11-20: lista de tareas de `arquitectura` aprobada; entregable en elaboración.
- 2026-11-20: `arquitectura` completado: `docs/arquitectura.md` aprobado (Angular 22, Angular Material, pnpm 12, FullCalendar 7), `AGENTS.md` completado con los comandos, la estructura y los límites técnicos, y la brecha B-05 agregada a `docs/requerimientos.md`. **Fase 0 completada.** Siguiente paso: `specs/mapa-modulos.md` (sin empezar, a la espera del usuario), con el orden de `docs/arquitectura.md` §12.
- 2026-11-23: la brecha B-05 queda resuelta en el backend (`correcciones/COR-02-encabezados-cors.md`: la API expone `Retry-After` y `Location` por CORS). Se actualizan `docs/requerimientos.md` §8, `docs/arquitectura.md` §3.5 y §12, y `AGENTS.md`.

## Objetivo

Que al terminar la fase existan, aprobados:
1. Un documento de requerimientos propio del frontend, construido sobre lo que ya define el backend.
2. Unos wireframes navegables que fijen la estructura de cada vista.
3. Un documento de arquitectura con el stack y las convenciones del frontend.

Con esos tres se arma `specs/mapa-modulos.md` con los módulos construibles del SPA, y desde ahí cada módulo sigue Specify → Plan → Tasks → Implement.

**Fuente del contrato:** la API en `../sistema-matricula-api` (`docs/requerimientos.md`, `docs/arquitectura.md`, `specs/`, `README.md` y el OpenAPI en `http://localhost:5022/openapi/v1.json`). El frontend no redefine sus reglas: las referencia.

## Entregables

| Id | Entregable | Responsabilidad | Depende de |
|---|---|---|---|
| `requerimientos` | `docs/requerimientos.md` | Alcance del SPA: vistas por rol y navegación, flujos de interfaz (sesión, cambio obligatorio de contraseña, vencimiento del token, reactivación ante `RN-39`, confirmaciones), presentación de errores (`code`, errores por campo, `traceId`), requerimientos no funcionales (dispositivos, accesibilidad, idioma, navegadores, rendimiento de listados) y trazabilidad vista ↔ endpoint ↔ RF/RN del backend | — |
| `wireframes` | `docs/wireframes/` | Bocetos en HTML, CSS y JS sencillos, en escala de grises, de cada vista: estructura, posición de los elementos y componentes (tablas paginadas con filtros, formularios, grilla de horario semanal, selectores de fecha y hora, modales de confirmación, mensajes) y sus estados (vacío, cargando, error, sin permiso) | `requerimientos` |
| `arquitectura` | `docs/arquitectura.md` | Lenguaje, framework, librerías (componentes, calendario/horario, fechas, formularios y validación, HTTP, estado), estructura de carpetas, manejo del token, tipos generados desde el OpenAPI, manejo de errores, pruebas, estilo visual y convenciones | `requerimientos`, `wireframes` |

**Orden:** `requerimientos` → `wireframes` → `arquitectura` → `specs/mapa-modulos.md`

## Flujo por entregable

Cada entregable pasa por el mismo flujo aprobado que los módulos, con aprobación en cada fase:

1. `specs/SPEC-<id>.md`: objetivo, alcance, estructura del documento, criterios de éxito y preguntas abiertas.
2. `tasks/<id>/todo.md`: plan corto y lista de tareas (supuesto 2).
3. Redacción o construcción del entregable, tarea por tarea.
4. Revisión final y aprobación del entregable.

## Estado de los entregables

| Entregable | Spec | Tareas | Avance | Estado |
|---|---|---|---|---|
| `requerimientos` | [Aprobada](SPEC-requerimientos.md) | [Aprobadas](../tasks/requerimientos/todo.md) | 7/7 | Completado |
| `wireframes` | [Aprobada](SPEC-wireframes.md) | [Aprobadas](../tasks/wireframes/todo.md) | 8/8 | Completado |
| `arquitectura` | [Aprobada](SPEC-arquitectura.md) | [Aprobadas](../tasks/arquitectura/todo.md) | 6/6 | Completado |

**Estados de un documento** (spec o lista de tareas): Borrador · En revisión · Aprobado/a · Obsoleto/a.
**Estados de un entregable:** Sin empezar · Planificación · En elaboración · Completado.

## Estructura de carpetas

```
AGENTS.md, CLAUDE.md        Instrucciones para agentes (supuesto 5)
docs/
  requerimientos.md         Entregable `requerimientos`
  wireframes/               Entregable `wireframes`
    index.html              Índice de vistas por rol
    componentes.html        Catálogo de componentes
    css/wireframe.css       Estilos compartidos en escala de grises
    js/wireframe.js         Interacciones mínimas
    <area>/V-xx-<vista>.html  Una página por vista; áreas: publico, cuenta, admin, estudiante, profesor, compartidas (SPEC-wireframes, supuesto 1)
  arquitectura.md           Entregable `arquitectura`
specs/
  fase-0.md                 Este documento
  SPEC-<id>.md              Spec de cada entregable y, después, de cada módulo
  mapa-modulos.md           Se crea al cerrar la fase 0
tasks/
  <id>/todo.md              Plan y tareas de cada entregable
```

## Decisiones aprobadas

1. **Fase 0 aparte del mapa de módulos** (2026-11-17). Los documentos base tienen su propio plan (este documento). El mapa de módulos solo contiene módulos construibles y se crea al cerrar la fase.
2. **Los requerimientos del frontend referencian a los del backend** (2026-11-17). No copian RF ni RN: los citan por código y se centran en lo propio del cliente.
3. **Wireframes en HTML, CSS y JS sencillos, en escala de grises** (2026-11-17). Baja fidelidad: fijan estructura, posición y componentes, no el estilo visual. Son una guía para la implementación, no un contrato.
4. **La arquitectura se decide después de los wireframes** (2026-11-17), para elegir las librerías según los componentes que las vistas necesitan (por ejemplo, el horario semanal y los selectores de fecha).

## Supuestos

Se aplican salvo que se corrijan en la revisión:

1. **Ubicación de los documentos:** la de la estructura de carpetas, igual que en el backend (`docs/`, `specs/`, `tasks/`).
2. **Plan y tareas en un solo `todo.md`** para los entregables de esta fase, con el plan como primera sección. Son documentos, no código, y un `plan.md` aparte sería repetitivo. Los módulos del mapa sí tendrán `plan.md` y `todo.md` separados, como en el backend.
3. **Wireframes sin dependencias:** se abren con doble clic, sin servidor, sin build y sin CDN. Una página por vista, enlazadas entre sí para recorrer los flujos. JS solo para lo mínimo (abrir un modal, cambiar de pestaña, alternar estados como vacío o error). Usan datos de ejemplo escritos a mano, sin llamar a la API.
4. **Idioma:** documentos e interfaz en español.
5. **`AGENTS.md` y `CLAUDE.md`** (`@AGENTS.md`) en la raíz del SPA, creados al aprobar este plan, con las fuentes de verdad, el flujo de trabajo y la regla de que el contrato lo define la API. Se completan con comandos y límites técnicos en el entregable `arquitectura`.
6. **La API no se modifica en la fase 0.** Si los requerimientos o los wireframes revelan algo que el backend no ofrece, se anota como brecha en `docs/requerimientos.md` y se decide aparte si se resuelve en el backend o se deja fuera del alcance.

## Preguntas abiertas

Ninguna. Las preguntas de alcance (dispositivos, accesibilidad, navegadores, etc.) se resuelven en `SPEC-requerimientos.md`.
