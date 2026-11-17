# AGENTS.md — Frontend (SPA) Sistema de Matrícula

Frontend web del sistema de matrícula de un instituto de cursos libres. Consume la API de `../sistema-matricula-api`.

## Fuentes de verdad
- **Contrato y reglas de negocio:** la API. `../sistema-matricula-api/docs/requerimientos.md` (RF-01..RF-59, RN-01..RN-49), `../sistema-matricula-api/specs/SPEC-<modulo>.md` (endpoints, DTOs, códigos de error) y el OpenAPI en `http://localhost:5022/openapi/v1.json` con la API en marcha. El frontend **no redefine** esas reglas: las cita por código. Los ajustes a la API posteriores al cierre de sus módulos están en `../sistema-matricula-api/correcciones/` (por ejemplo, COR-01 resolvió las brechas B-01, B-02 y B-04).
- **Fase 0 (fundamentos):** `specs/fase-0.md`.
- **Qué construir en el frontend:** `docs/requerimientos.md` (cuando esté aprobado).
- **Cómo se ven las vistas:** `docs/wireframes/` (guía, no contrato).
- **Cómo construirlo:** `docs/arquitectura.md` (cuando esté aprobado).
- **Mapa de módulos:** `specs/mapa-modulos.md` (se crea al cerrar la fase 0).

Si algo de una spec contradice estos documentos, o el frontend necesita algo que la API no ofrece, detente y pregunta; no elijas por tu cuenta.

## Límites
**Siempre**
- Documentos e interfaz en español.
- Mantener al día los estados de las specs, las tareas, `specs/fase-0.md` y, después, `specs/mapa-modulos.md`.

**Preguntar antes**
- Interpretar un requerimiento ambiguo o una regla del backend.
- Añadir dependencias (se fijan en `docs/arquitectura.md`).

**Nunca**
- Modificar la API desde este proyecto. Las brechas con el backend se anotan en `docs/requerimientos.md` y se deciden aparte.
- Guardar o mostrar contraseñas o temporales fuera de los campos de formulario que las piden.

## Flujo de trabajo
Usar la skill **spec-driven-development**: `specs/SPEC-<id>.md` → `tasks/<id>/` → implementación tarea por tarea, con aprobación del usuario en cada fase. En la fase 0, plan y tareas van en un solo `tasks/<id>/todo.md`; los módulos del mapa usan `plan.md` y `todo.md`.

Los comandos, la estructura del código y los límites técnicos se agregan aquí al aprobar `docs/arquitectura.md`.
