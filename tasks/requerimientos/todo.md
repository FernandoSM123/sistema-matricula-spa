# Tareas: requerimientos

Entregable `requerimientos` de la [fase 0](../../specs/fase-0.md). Spec: [SPEC-requerimientos.md](../../specs/SPEC-requerimientos.md).

| Estado de la lista | Avance |
|---|---|
| **Aprobada** | 7/7 tareas completadas: **entregable completado** |

**Historial:**
- 2026-11-17: v1 en revisión.
- 2026-11-17: v1 aprobada. Un solo commit al terminar todo el entregable.
- 2026-11-17: T1 implementada. Desviación: el inventario de endpoints vive desde ya en §7.1 del documento, con la columna **Vista** por completar, en lugar de un anexo que se quita en T7.
- 2026-11-17: T1 completada (aprobada por el usuario). T2 implementada: vistas `V-01` a `V-10` (incluye las páginas "sin permiso" y "no encontrada" de §2.5), `RFF-01` a `RFF-10` y las brechas B-01 (periodo en la oferta pública) y B-02 (id del administrador en `/me`).
- 2026-11-17: T2 completada (aprobada por el usuario). T3 implementada: vistas `V-11` a `V-19` (listado, formulario de registro y edición, y detalle por entidad) y `RFF-11` a `RFF-17`. Endpoints con vista en §7.1: 31/76.
- 2026-11-17: T3 completada (aprobada por el usuario). T4 implementada: vistas `V-20` a `V-30` y `RFF-18` a `RFF-29`. Los periodos no tienen vista de detalle. La grilla del horario semanal (RFF-29) se define en T4, porque la usa la ocupación del aula, y T5 la reutiliza. La eliminación de grupos (RF-46, de `SPEC-matriculas`) se define aquí, porque es una acción del detalle del grupo. Endpoints con vista en §7.1: 60/76.
- 2026-11-17: T4 completada (aprobada por el usuario). T5 implementada: vistas `V-31` a `V-38`, secciones nuevas en `V-01`, `V-16`, `V-19`, `V-22` y `V-30`, `RFF-30` a `RFF-41` y la brecha B-03 (lista de entidades auditadas). Los 76 endpoints de §7.1 tienen vista, salvo `GET /matriculas/{id}`, fuera de alcance con su motivo.
- 2026-11-17: T5 completada (aprobada por el usuario). T6 implementada: `RUI-01` a `RUI-22` (errores, formularios y acciones, listados, formatos, mensajes y textos), §6 de no funcionales, y la brecha B-04 (trato en el mensaje del olvido). Se fija el trato de usted y se ajustan a él los textos citados en RFF-03 y RFF-07.
- 2026-11-17: T6 completada (aprobada por el usuario). T7 implementada: §7.2 (RF del backend → vistas), glosario, encabezado final del documento, y las referencias a tareas ("T5") reemplazadas por referencias a secciones y RFF. Verificación final:

  | Comprobación de la spec | Resultado |
  |---|---|
  | Cobertura de endpoints | 76/76 en §7.1: 75 con vista y `GET /matriculas/{id}` fuera de alcance con su motivo |
  | Cobertura de RF | RF-01…RF-59 en §7.2; sin interfaz solo RF-05, RF-56 y RF-58, con su motivo |
  | Matriz de permisos | Las vistas de cada rol coinciden con §2.2 del backend y con las políticas de los controllers |
  | Sin duplicar reglas | Las RN se citan por código; solo se copian los límites de formato de RUI-06, que no son RN |
  | Códigos únicos | `V-01`…`V-38`, `RFF-01`…`RFF-41`, `RUI-01`…`RUI-22`, sin repetidos ni huecos; todo código citado está definido |
  | Errores | Cada código HTTP (RUI-03) y cada `code` que devuelve la API (RUI-04, 33 códigos) tiene su presentación |
- 2026-11-17: T7 completada y documento aprobado por el usuario. Entregable completado; commit único del entregable.

## Plan

**Enfoque:** el documento se escribe por áreas, como cortes verticales. Cada tarea de catálogo (T2 a T5) escribe juntas las vistas de un área y sus requerimientos funcionales (`RFF`), porque los `RFF` nacen de revisar los flujos de esas vistas en la spec del backend. Las reglas transversales (`RUI`) y los no funcionales van después, cuando ya se conocen todas las vistas. La trazabilidad completa cierra el documento.

**Fuentes por área** (en `../sistema-matricula-api/`):

| Área | Specs del backend | Controllers |
|---|---|---|
| Acceso, cuenta y oferta | `SPEC-acceso`, `SPEC-estudiantes` (registro y `/me`), `SPEC-grupos` (oferta) | `Auth`, `Me`, `OfertaAcademica` |
| Personas | `SPEC-acceso` (administradores, usuarios), `SPEC-estudiantes`, `SPEC-profesores` | `Administradores`, `Usuarios`, `Estudiantes`, `Profesores` |
| Catálogos, grupos y horarios | `SPEC-catalogos`, `SPEC-grupos` | `Cursos`, `Periodos`, `Aulas`, `Grupos` |
| Matrícula, profesor, auditoría y errores | `SPEC-matriculas`, `SPEC-grupos` (consultas), `SPEC-auditoria`, `SPEC-errores` | `Matriculas`, `Me`, `Grupos`, `Auditoria`, `Errores` |

**Orden y dependencias:** T1 → T2 → T3 → T4 → T5 → T6 → T7. Es secuencial: los ids `V-xx` y `RFF-xx` se numeran en orden y cada área puede reutilizar vistas de la anterior (por ejemplo, el detalle del estudiante de T3 aloja la matrícula del administrador de T5).

**Riesgos:**
- *Duplicar reglas del backend.* Mitigación: cada `RFF` cita el RF/RN y describe solo el comportamiento de la interfaz.
- *Descubrir brechas tarde.* Mitigación: cada tarea anota sus brechas en la sección 8 en cuanto aparecen, sin esperar a T7.
- *Un documento demasiado largo para revisar de una vez.* Mitigación: el usuario revisa cada sección al terminar su tarea.

**Puntos de control:** al terminar cada tarea, el usuario revisa las secciones nuevas. Al terminar T7, revisa el documento completo y la tabla de verificación de la spec.

## Estado de las tareas

| Tarea | Estado | Revisión del usuario | Commit |
|---|---|---|---|
| T1 Esqueleto, descripción general, roles y navegación | Completada | Aprobada | — |
| T2 Vistas y RFF: acceso, cuenta y oferta pública | Completada | Aprobada | — |
| T3 Vistas y RFF: personas | Completada | Aprobada | — |
| T4 Vistas y RFF: catálogos, grupos y horarios | Completada | Aprobada | — |
| T5 Vistas y RFF: matrícula, profesor, auditoría y errores | Completada | Aprobada | — |
| T6 Reglas de interfaz y no funcionales | Completada | Aprobada | — |
| T7 Trazabilidad, brechas, glosario y verificación final | Completada | Aprobada | — |

**Estados de una tarea:** Pendiente · En progreso · Implementada (escrita, falta la revisión del usuario) · Bloqueada · Completada.
**Commit:** uno solo al terminar todas las tareas del entregable (decisión del usuario, 2026-11-17); al hacerlo se anota su hash en todas las filas.

## Tareas

- [x] **T1 Esqueleto, descripción general, roles y navegación**
  - Acceptance: `docs/requerimientos.md` tiene las nueve secciones de la spec (las pendientes, con un marcador). Las secciones 1 y 2 están completas: propósito, relación con la API, alcance incluido y fuera del alcance (con los diferidos de la spec), los cuatro roles por referencia, página de inicio y menú por rol, rutas públicas y protegidas, y qué pasa sin sesión o sin permiso. Además, el inventario de los 76 endpoints en §7.1, con la columna **Vista** por completar.
  - Verify: el menú de cada rol coincide con la matriz §2.2 del backend; el inventario tiene 76 filas, comparado con el `grep` de la spec.
  - Files: `docs/requerimientos.md`

- [x] **T2 Vistas y RFF: acceso, cuenta y oferta pública**
  - Acceptance: vistas de login, cambio obligatorio, olvido de contraseña, registro público, oferta académica, perfil (`/me`, con las variantes por rol), cambio de contraseña y edición de datos de contacto del estudiante. Sus `RFF`, como mínimo: redirección al cambio obligatorio (RN-24), sesión vencida y regreso a la vista (supuesto 4), respuesta única del olvido (RN-28), `409 RN-21` en el registro, `403 RN-29` en el login y cierre de sesión.
  - Verify: cada vista tiene id, rol, propósito, endpoints y RF/RN; los flujos de §3.2 del backend tienen su vista.
  - Files: `docs/requerimientos.md`

- [x] **T3 Vistas y RFF: personas**
  - Acceptance: listado, alta, detalle y edición de administradores, estudiantes y profesores; desactivar, reactivar y eliminar (estudiantes y profesores); reenvío de la temporal. Sus `RFF`, como mínimo: aviso de `correoEnviado: false` con la opción de reenviar, oferta de reactivar ante `409 RN-39`, mensajes de `409 RN-30`, `RN-34`, `RN-36` y `RN-37`, y que un administrador no se elimina.
  - Verify: las acciones de cada entidad coinciden con la tabla §4.2 del backend.
  - Files: `docs/requerimientos.md`

- [x] **T4 Vistas y RFF: catálogos, grupos y horarios**
  - Acceptance: vistas de cursos, periodos (con el vigente) y aulas (con su ocupación); listado, alta, detalle y edición de grupos, cambio de estado y gestión de bloques de horario; grupos de un curso. Sus `RFF`, como mínimo: acciones visibles según el estado del grupo (RF-47, RF-48, edición por estado), aula según modalidad, traslapes `RN-07`, `RN-08` y `RN-14` mostrando el NRC con que choca, abrir un grupo sin horarios, y lo que ve cada rol (RN-18).
  - Verify: los permisos de lectura coinciden con las políticas de `SPEC-catalogos` y `SPEC-grupos` (por ejemplo, aulas solo para administrador y profesor).
  - Files: `docs/requerimientos.md`

- [x] **T5 Vistas y RFF: matrícula, profesor, auditoría y errores**
  - Acceptance: matricular, retirar y cambiar de grupo (estudiante y administrador), historial de matrículas, horario semanal (estudiante, profesor, administrador), los grupos del profesor y sus estudiantes, auditoría con sus filtros y errores con su detalle. Sus `RFF`, como mínimo: elegir el grupo destino del cambio (RF-53), mensajes de RN-01…06 y RN-10/11, `409 CONCURRENCIA` con la opción de reintentar, que el administrador no tiene las restricciones de fechas y estado (supuesto 1 de `SPEC-matriculas`), la grilla del horario, el autor `null` mostrado como "Sistema" y la búsqueda por `traceId`.
  - Verify: todas las consultas de la sección 6 del backend tienen una vista.
  - Files: `docs/requerimientos.md`

- [x] **T6 Reglas de interfaz y no funcionales**
  - Acceptance: `RUI` de errores (cada código HTTP y cada `code` que la API devuelve), confirmaciones, listados (paginación, búsqueda, filtros, inactivos, vacío), formatos (fechas, horas, moneda, etiquetas de los enums), éxito y carga. Los no funcionales con las decisiones 1 a 3 de la spec, más idioma, seguridad en el cliente, rendimiento percibido y fechas sin conversión de zona.
  - Verify: cada `RFF` de T2 a T5 que menciona un error o una confirmación remite a una `RUI` sin contradecirla.
  - Files: `docs/requerimientos.md`

- [x] **T7 Trazabilidad, brechas, glosario y verificación final**
  - Acceptance: matriz de los 76 endpoints → vista o fuera de alcance (con el motivo); lista de los RF del backend con interfaz → vista; brechas consolidadas con su impacto y una propuesta; glosario de términos de interfaz. La columna **Vista** de §7.1 queda completa.
  - Verify: la tabla de verificación de la spec completa (endpoints, RF, matriz de permisos, sin reglas duplicadas, códigos únicos y sin huecos, errores).
  - Files: `docs/requerimientos.md`, `specs/SPEC-requerimientos.md` y `specs/fase-0.md` (estados)
