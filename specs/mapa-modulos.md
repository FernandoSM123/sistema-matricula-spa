# Mapa de módulos — Frontend (SPA) Sistema de Matrícula

Índice de los módulos del SPA. Cada módulo tiene su spec en `specs/SPEC-<id>.md`, su plan y sus tareas en `tasks/<id>/plan.md` y `tasks/<id>/todo.md`, y se construye en el orden indicado (Specify → Plan → Tasks → Implement). Los ids son estables: no se renombran.

Se arma con los tres documentos de la [fase 0](fase-0.md):
- Las vistas y los RFF de `docs/requerimientos.md`.
- Los wireframes de `docs/wireframes/`.
- El orden de `docs/arquitectura.md` §12.

| Estado | Avance |
|---|---|
| **Aprobado** | 2/10 módulos completados |

**Historial:**
- 2026-11-23: v1 en revisión.
- 2026-11-23: v1 aprobada, con un cambio del usuario en la decisión 5: commit después de cada tarea, no solo al cerrar el módulo. Siguiente paso: la spec de `fundacion` (sin empezar, a la espera del usuario).
- 2026-11-23: empieza `fundacion`, en la rama `fundacion`, con su spec en revisión.
- 2026-11-24: `fundacion` completado e integrado a `main` (PR #1). Empieza `nucleo`, en la rama `nucleo`, con su spec en revisión.
- 2026-11-24: spec de `nucleo` aprobada; plan y tareas en revisión. Los cambios al mapa de sus decisiones (`cambiosSinGuardarGuard` a `componentes`, Firefox y Safari a `sistema`) se aplican en su T1.
- 2026-11-24: plan y tareas de `nucleo` aprobados. T1 queda bloqueada: los tipos generados traen los enums como `number` (B-07) y los números como `number | string` (B-06). Por decisión del usuario se corrigen en la API con COR-03 (decisión 4 del mapa), y `nucleo` sigue cuando esté hecha.
- 2026-11-24: COR-03 aplicada en la API, y `nucleo` T1 completada: los tipos generados traen `number` y uniones de textos. Además, por decisión del usuario, el adaptador de fechas y la duración de los avisos salen de la carga inicial, que baja de 500 kB a 302 kB. Se aplican los cambios de las decisiones de `nucleo`: `cambiosSinGuardarGuard` pasa a `componentes`, y Firefox y Safari a `sistema`.
- 2026-11-24: `nucleo` completado (7/7 tareas, versión 0.2.0), en la rama `nucleo`; el pull request a `main` lo abre el usuario. Se quita la fila de Chrome, Edge y Brave, ya verificados. Lighthouse queda para `componentes` y `sistema`, medido sobre `dist/`. El `401` con un token invalidado y el cambio pendiente con una cuenta real se prueban a mano en `acceso`. Siguiente módulo: `componentes`.
- 2026-11-24: `nucleo` integrado a `main` (PR #2). Antes de `componentes`, el usuario cambia la regla de nombres: el dominio en español y lo técnico en inglés. La corrección [`nombres`](SPEC-nombres.md), en la rama `nombres`, renombra lo construido en `fundacion` y `nucleo`. Spec, plan y tareas aprobados. T1 completada: la regla está en §10.1 de la arquitectura y en `AGENTS.md`.
- 2026-11-24: corrección [`nombres`](SPEC-nombres.md) completada (7/7 tareas), en la rama `nombres`; el pull request a `main` lo abre el usuario. Lo construido en `fundacion` y `nucleo` ya usa la regla nueva, sin cambios para quien usa la aplicación. Siguiente módulo: `componentes`.
- 2026-11-26: corrección `nombres` integrada a `main` (PR #3). La API agregó el refresh token (su módulo `sesiones`: RF-60, RN-50 a RN-52) y renombró 32 esquemas del OpenAPI (su corrección `nombres`). Antes de `componentes`, la corrección [`sesiones`](SPEC-sesiones.md), en la rama `sesiones`, adapta la sesión y los interceptores de `nucleo`. Spec aprobada, con las decisiones recomendadas para la pestaña duplicada y el cierre de sesión. Plan y tareas aprobados. T1 a T5 completadas (5/6): tipos regenerados, `AuthApi.refresh()`, la renovación en `SessionService`, la pestaña duplicada, los interceptores, el cierre de sesión y los documentos (decisión 6).
- 2026-11-26: corrección [`sesiones`](SPEC-sesiones.md) completada (6/6 tareas), en la rama `sesiones`; el pull request a `main` lo abre el usuario. El SPA renueva el token de acceso sin intervención del usuario y aplica RFF-03 solo cuando la sesión no se puede renovar. La prueba de punta a punta con un formulario queda en la verificación heredada de `acceso`. Siguiente módulo: `componentes`.
- 2026-11-27: corrección `sesiones` integrada a `main` (PR #4). Empieza `componentes`, en la rama `componentes`, con su spec en revisión.
- 2026-11-27: spec de `componentes` aprobada, con dos decisiones del usuario: un catálogo de componentes permanente en `/componentes`, sin sesión y sin enlaces, para la revisión visual; y los validadores de un solo formulario llegan con su módulo (`catalogos`, `grupos`). Plan y tareas en revisión.
- 2026-11-27: plan y tareas de `componentes` aprobados. T1 completada: el catálogo de componentes en `/componentes` (decisión 7). T2 completada: la lógica de los formularios. T3 completada: avisos y confirmaciones. T4 completada: cambios sin guardar. T5 completada: controles de formulario. T6 completada: errores de una acción.

## Módulos

| # | Id | Responsabilidad | Vistas | RFF | RUI que construye | Depende de |
|---|---|---|---|---|---|---|
| 1 | `fundacion` | Proyecto creado con el CLI y pnpm, `pnpm-workspace.yaml`, ESLint con las reglas entre carpetas, Prettier, carpetas de §2.2 y `environments/`. Tema de Material, paleta `--sm-*`, tipografía e íconos (§6.6). Locale `es-CR`, `AppDateAdapter`, formateadores y pipes (§7) | — | — | RUI-15 a RUI-19 | — |
| 2 | `nucleo` | `api/` base: tipos generados, `models.ts`, paginación, `ApiError` y `API_URL`. `SessionService`, interceptores y guardas (§4). Layout con el menú por rol, el menú de la cuenta y el pie. Rutas y página de inicio por rol (§2.2 a §2.5 de los requerimientos) | `V-09`, `V-10` | RFF-03, RFF-04 | RUI-01 a RUI-05 (interpretación del error), RUI-23 | `fundacion` |
| 3 | `componentes` | `shared/ui` y `shared/forms`: `ContentState`, `ActionError`, `NotificationService`, `Banner`, `ConfirmService`, `SubmitButton`, `PasswordField`, validadores, `applyServerErrors`, `PaginatedList`, `FilterBar`, `StatusBadge`, `DetailHeader` y `SearchSelect` (§5, §6). `unsavedChangesGuard` y `HasUnsavedChanges` (§4.3, decisión 1 de `SPEC-nucleo`) | — | — | RUI-01 a RUI-05 (presentación), RUI-06 a RUI-14, RUI-20, RUI-21 | `nucleo` |
| 4 | `acceso` | Inicio de sesión, cambio obligatorio, olvido de contraseña y registro público. Mi perfil, cambiar contraseña y datos de contacto | `V-02` a `V-08` | RFF-01, RFF-02, RFF-05, RFF-06, RFF-08 a RFF-10 | — | `componentes` |
| 5 | `oferta` | La oferta académica pública. La acción "Matricular" la agrega `matricula` | `V-01` | RFF-07 | — | `componentes` |
| 6 | `catalogos` | Cursos, periodos y aulas. La ocupación del aula la agrega `grupos` | `V-20` a `V-27` | RFF-18 a RFF-22 | — | `acceso` |
| 7 | `personas` | Administradores, estudiantes y profesores, con las acciones sobre la cuenta. Las secciones de matrícula, grupos y horario de `V-16` y `V-19` las agrega `matricula` | `V-11` a `V-19` | RFF-11 a RFF-17 | — | `acceso` |
| 8 | `grupos` | Grupos, horarios y estados. `WeeklySchedule` (FullCalendar) y `PeriodoSelect` (§6.3), y con ellos la ocupación de `V-27` | `V-28` a `V-30` | RFF-23 a RFF-29 | — | `catalogos`, `personas` |
| 9 | `matricula` | Mis matrículas, matricular, cambiar de grupo y retirar. Mi horario y mis grupos. Las secciones que agrega a vistas anteriores (decisión 2) | `V-31` a `V-35` | RFF-30 a RFF-38 | — | `oferta`, `catalogos`, `personas`, `grupos` |
| 10 | `sistema` | Auditoría y errores. El enlace "Ver historial de cambios" de los detalles (RFF-40) | `V-36` a `V-38` | RFF-39 a RFF-41 | — | `catalogos`, `personas`, `grupos` |

**Orden de construcción:** `fundacion` → `nucleo` → `componentes` → `acceso` → `oferta` → `catalogos` → `personas` → `grupos` → `matricula` → `sistema`

- Es el orden de `docs/arquitectura.md` §12. Algunos pares se podrían intercambiar, porque no dependen entre sí: `oferta` con los que le siguen hasta `grupos`, y `catalogos` con `personas`. Se mantiene el orden lineal porque el proyecto lo construye una sola persona.
- Las 38 vistas y los 41 RFF quedan en un solo módulo cada uno. Las RUI 22 (trato de usted) y la accesibilidad de §6 de los requerimientos las aplican todos los módulos.

## Estado de los módulos

| Módulo | Spec | Plan | Tareas | Avance | Estado del módulo |
|---|---|---|---|---|---|
| `fundacion` | [Aprobada](SPEC-fundacion.md) | [Aprobado](../tasks/fundacion/plan.md) | [Aprobadas](../tasks/fundacion/todo.md) | 6/6 | Completado |
| `nucleo` | [Aprobada](SPEC-nucleo.md) | [Aprobado](../tasks/nucleo/plan.md) | [Aprobadas](../tasks/nucleo/todo.md) | 7/7 | Completado |
| `componentes` | [Aprobada](SPEC-componentes.md) | [Aprobado](../tasks/componentes/plan.md) | [Aprobadas](../tasks/componentes/todo.md) | 6/10 | En implementación |
| `acceso` | — | — | — | — | Sin empezar |
| `oferta` | — | — | — | — | Sin empezar |
| `catalogos` | — | — | — | — | Sin empezar |
| `personas` | — | — | — | — | Sin empezar |
| `grupos` | — | — | — | — | Sin empezar |
| `matricula` | — | — | — | — | Sin empezar |
| `sistema` | — | — | — | — | Sin empezar |

**Estados de un documento** (spec, plan o lista de tareas):
- **Borrador:** se está escribiendo.
- **En revisión:** espera la aprobación del usuario.
- **Aprobado/a:** aprobado y vigente.
- **Obsoleto/a:** reemplazado; queda solo como historial.

**Estados de un módulo:**
- **Sin empezar.**
- **Planificación:** spec, plan o tareas sin aprobar.
- **En implementación:** tareas aprobadas y al menos una iniciada.
- **Completado:** todas las tareas completadas y los criterios de éxito de la spec cumplidos.

**Avance** = tareas completadas / total de tareas del `todo.md` del módulo.

## Verificaciones heredadas

Verificaciones que un módulo no puede hacer por falta de vistas o de datos. Se copian al `todo.md` del módulo destino cuando se crea.

| Origen | Destino | Verificación |
|---|---|---|
| `nucleo` | `sistema` | La aplicación funciona en las dos últimas versiones de Firefox y Safari, en escritorio y en celular. `nucleo` solo probó navegadores con Chromium (decisión 2 de `SPEC-nucleo`) |
| `arquitectura` §1 | `grupos` | La grilla de `WeeklySchedule` (FullCalendar con `temporal-polyfill`) funciona en Chrome, Edge y Brave. Firefox y Safari, con `sistema` |
| `nucleo` | `componentes` | `NotificationService.success()` fija la duración de 5 s en cada aviso: el token global `MAT_SNACK_BAR_DEFAULT_OPTIONS` salió de la raíz por la carga inicial (decisión 5 de `SPEC-nucleo`, §6.1 de la arquitectura) |
| `arquitectura` §8.3 | `componentes`, `sistema` | Lighthouse al cerrar cada uno: carga inicial de 500 kB o menos sin comprimir y LCP menor a 2,5 s, con el perfil de escritorio y el build de producción. Se mide sobre `dist/` servido como estático con compresión, no sobre `ng serve`, que agrega los mapas de fuentes y no comprime (`nucleo` T7) |
| `nucleo`, `sesiones` | `acceso` | Con una sesión real: las 7 situaciones de §2.5 de los requerimientos (sin sesión, rol sin permiso, `401` que vuelve a `V-02` con el aviso y regresa a la vista, cambio pendiente…) y el cierre de sesión desde el menú de la cuenta (RFF-04). De la corrección `sesiones` (RF-60): un formulario sigue funcionando después de que vence el token de acceso, sin el aviso de RFF-03 (con `Jwt:AccessTokenMinutes` acortado en la API y restaurado al terminar); un `401` por una sesión invalidada desde otro dispositivo aplica RFF-03 después de intentar renovar; la renovación no aparece como `401` en la consola del navegador. En `nucleo` no se probaron a mano, por decisión del usuario (2026-11-24): el `401` con un token invalidado, porque ninguna petición con sesión lo provoca todavía, y el layout del cambio pendiente con una cuenta real, porque la temporal de `estudiante2` había vencido (se revisó con una sesión ficticia). Los cubren las pruebas automáticas |
| COR-02 (backend) | `acceso` | Desde el navegador, el `429` del inicio de sesión llena `ApiError.retryAfter` con el valor de `Retry-After` (RUI-03) |

## Decisiones aprobadas

1. **Módulos por capa técnica al inicio y por área después.** `fundacion`, `nucleo` y `componentes` no tienen vistas de negocio (salvo `V-09` y `V-10`). Así cada área usa piezas ya probadas, en lugar de que la primera área cargue con todo lo transversal.
2. **Las secciones que una vista recibe de un área posterior las agrega el área posterior**, como en el backend (decisión 4 de su mapa) y en los wireframes. El módulo dueño de la vista deja el lugar de la sección, sin mostrarla:
   - `grupos` agrega la ocupación a `V-27`.
   - `matricula` agrega:
     - a `V-01`, la acción "Matricular" y la marca "Ya matriculado";
     - a `V-16`, las matrículas y el horario;
     - a `V-19`, los grupos y el horario;
     - a `V-22` y `V-30`, la acción "Matricular";
     - a `V-30`, los estudiantes inscritos (§3.7 de los requerimientos).
   - `sistema` agrega "Ver historial de cambios" a `V-13`, `V-16`, `V-19`, `V-22`, `V-27` y `V-30`.
3. **Pruebas:** las unitarias de `docs/arquitectura.md` §9 en cada módulo. Cada módulo se verifica también a mano, con la API en marcha y la base de desarrollo sembrada por el módulo `datos-prueba` del backend, revisando sus vistas contra los wireframes. Las pruebas e2e siguen diferidas.
4. **La API no se modifica desde el SPA.** Si un módulo encuentra algo que la API no ofrece, se detiene, lo anota como brecha en `docs/requerimientos.md` §8 y se decide aparte, como B-05 (COR-02).
5. **Un commit después de cada tarea** (2026-11-23, pedido por el usuario), que incluye el código y la actualización del `todo.md`, la spec y el mapa. En la columna "Commit" de la tabla de estado del `todo.md` se marca ✅, sin el hash (decisión del usuario, 2026-11-23: el hash obligaba a un segundo commit solo para anotarlo). Se aparta de la fase 0, que hacía un solo commit por entregable. Cada módulo se trabaja en su propia rama (`<id>`) y se integra a `main` con un pull request, como en el backend.
6. **La sesión se renueva con el refresh token** (2026-11-26, corrección [`sesiones`](SPEC-sesiones.md), por el módulo `sesiones` de la API: RF-60, RN-50 a RN-52). El token de acceso dura 15 minutos y el SPA lo renueva sin intervención del usuario; la sesión dura hasta 8 horas desde el inicio de sesión. El refresh token se guarda con la sesión en `sessionStorage` y una pestaña duplicada empieza sin sesión. RFF-03 se aplica solo cuando la sesión no se puede renovar. La regla está en §4 de `docs/arquitectura.md`.
7. **Catálogo de componentes** (2026-11-27, decisión 1 de [`SPEC-componentes`](SPEC-componentes.md)). Las piezas de `shared/` se revisan a mano en `/componentes`, con datos de ejemplo, contra `docs/wireframes/componentes.html`. La página no pide sesión, ningún menú ni enlace lleva a ella y está en todos los ambientes. Los módulos que agregan piezas a `shared/` (por ejemplo, `grupos` con `WeeklySchedule` y `PeriodoSelect`) les agregan su ejemplo ahí.
