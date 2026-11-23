# AGENTS.md — Frontend (SPA) Sistema de Matrícula

Frontend web del sistema de matrícula de un instituto de cursos libres. Consume la API de `../sistema-matricula-api`. Es una SPA en **Angular 22** con Angular Material, TypeScript estricto y pnpm.

## Fuentes de verdad
- **Contrato y reglas de negocio:** la API.
  - `../sistema-matricula-api/docs/requerimientos.md` (RF-01..RF-59, RN-01..RN-49).
  - `../sistema-matricula-api/specs/SPEC-<modulo>.md` (endpoints, DTOs, códigos de error).
  - El OpenAPI en `http://localhost:5022/openapi/v1.json`, con la API en marcha.

  El frontend **no redefine** esas reglas: las cita por código. Los ajustes a la API posteriores al cierre de sus módulos están en `../sistema-matricula-api/correcciones/` (COR-01 resolvió las brechas B-01, B-02 y B-04; COR-02, la B-05).
- **Fase 0 (fundamentos):** `specs/fase-0.md`.
- **Qué construir en el frontend:** `docs/requerimientos.md` (vistas `V-xx`, `RFF-xx`, `RUI-xx` y las brechas con el backend en §8).
- **Cómo se ven las vistas:** `docs/wireframes/` (guía, no contrato).
- **Cómo construirlo:** `docs/arquitectura.md` (stack, carpetas, integración con la API, sesión, formularios, componentes, estilo, formatos, pruebas, convenciones y orden de implementación).
- **Mapa de módulos:** `specs/mapa-modulos.md` (se crea al cerrar la fase 0).

Si algo de una spec contradice estos documentos, o el frontend necesita algo que la API no ofrece, detente y pregunta; no elijas por tu cuenta.

## Comandos
Requisitos: Node 24 LTS, pnpm 12.21 y la API en marcha en `http://localhost:5022` (ver su `README`).

```bash
pnpm install --frozen-lockfile   # instalar exactamente lo del lockfile
pnpm start                       # ng serve --port 5173 (el origen que permite el CORS de la API)
pnpm build                       # build de producción, con presupuestos de tamaño
pnpm test --watch=false          # pruebas unitarias (Vitest)
pnpm lint                        # ESLint, incluidas las dependencias entre carpetas
pnpm formato:revisar             # Prettier en modo revisión (pnpm formato para aplicar)
pnpm api:tipos                   # regenerar src/app/api/esquema.d.ts desde el OpenAPI
pnpm audit                       # revisar las dependencias
```

**Antes de cerrar un módulo:** `pnpm formato:revisar && pnpm lint && pnpm test --watch=false && pnpm build`, y `pnpm audit`. Después, revisar sus vistas contra los wireframes con la API en marcha (`docs/arquitectura.md` §9, §11).

## Estructura del código
```
src/app/
  api/        Contrato con la API: esquema.d.ts (generado, no se edita), modelos.ts, paginación, ErrorApi y un cliente por recurso (*-api.ts). Es la única carpeta que usa HttpClient
  core/       Una sola instancia: sesión (único acceso a sessionStorage), interceptores, guardas, marco, páginas V-09 y V-10, configuración
  shared/     Sin API ni sesión: componentes de ui/, formatos/ (pipes) y formularios/ (validadores)
  features/   Una carpeta por área, cargada en diferido: acceso, oferta, cuenta, personas, catalogos, grupos, matricula, sistema
src/styles/   Paleta (--sm-*), tema de Material y estilos globales
```
- **Dependencias permitidas:**
  - `api` → nada del SPA.
  - `shared` → `api` (solo tipos).
  - `core` → `api` y `shared`.
  - `features` → `core`, `shared` y `api`.
  - Entre áreas, solo el `index.ts` de `matricula`.

  Las hace cumplir ESLint (`docs/arquitectura.md` §2.3, §2.4).
- **Nombres:**
  - Dominio en español sin tildes ni ñ, y sufijos técnicos en inglés.
  - Archivos en kebab-case: `cursos-api.ts`, `sesion-service.ts`, `sesion-guard.ts`, `fecha-pipe.ts`. Los componentes van sin sufijo.
  - Prefijo de selectores `sm` (§10).

## Límites
**Siempre**
- Documentos e interfaz en español; la interfaz, con trato de usted.
- Mantener al día los estados de las specs, las tareas, `specs/fase-0.md` y, después, `specs/mapa-modulos.md`.
- Seguir `docs/arquitectura.md`:
  - Componentes standalone con `OnPush`, signals e `inject()`.
  - Reactive Forms tipados.
  - `httpResource` para las consultas y `HttpClient` para las acciones, siempre desde `api/`.
  - Errores de la API como `ErrorApi`, presentados según §3.5.
  - Estado de los listados en la URL.
- Formatos con los formateadores de `shared/formatos` (`es-CR` y zona `America/Costa_Rica`). Las fechas `DateOnly` nunca pasan por `new Date('yyyy-MM-dd')`.
- Escribir las pruebas de las piezas que lista `docs/arquitectura.md` §9.

**Preguntar antes**
- Interpretar un requerimiento ambiguo o una regla del backend.
- Añadir dependencias (se fijan en `docs/arquitectura.md` §1 y §10.4) o autorizar scripts de instalación en `allowBuilds`.
- Cambiar una decisión de `docs/arquitectura.md`, un color de la paleta (hay que recalcular el contraste) o las reglas de dependencias entre carpetas.
- Saltar o borrar una prueba que falla.

**Nunca**
- Modificar la API desde este proyecto. Las brechas con el backend se anotan en `docs/requerimientos.md` y se deciden aparte.
- Guardar o mostrar contraseñas o temporales fuera de los campos de formulario que las piden.
- Poner el token en la dirección, escribirlo en la consola o enviarlo a un origen que no sea la API. No usar `console.*` en el código de la aplicación.
- Usar `innerHTML` con datos de la API o `bypassSecurityTrust*`; cargar scripts, fuentes o íconos desde un CDN.
- Editar a mano `src/app/api/esquema.d.ts`, desactivar las opciones estrictas de TypeScript o usar `any`.
- Estilar FullCalendar con selectores de sus clases internas, que llevan hash (`docs/arquitectura.md` §6.3).

## Flujo de trabajo
Usar la skill **spec-driven-development**: `specs/SPEC-<id>.md` → `tasks/<id>/` → implementación tarea por tarea, con aprobación del usuario en cada fase.
- En la fase 0, plan y tareas van en un solo `tasks/<id>/todo.md`.
- Los módulos del mapa usan `plan.md` y `todo.md`, y siguen el orden de `docs/arquitectura.md` §12.
