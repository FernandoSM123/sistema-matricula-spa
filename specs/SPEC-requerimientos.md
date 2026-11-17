# Spec: requerimientos

Entregable `requerimientos` de la [fase 0](fase-0.md). Sin dependencias.

| Estado | Tareas | Avance |
|---|---|---|
| **Aprobada** | [Aprobadas](../tasks/requerimientos/todo.md) | 7/7 tareas completadas: **entregable completado** (2026-11-17) |

**Historial:**
- 2026-11-17: v1 en revisión.
- 2026-11-17: v1 aprobada, con sus siete supuestos. Preguntas abiertas resueltas (decisiones 1 a 3). Lista de 7 tareas en revisión.
- 2026-11-17: lista de tareas aprobada; T1 implementada, en revisión del usuario.
- 2026-11-17: entregable completado (7/7 tareas). `docs/requerimientos.md` aprobado: 38 vistas, 41 RFF, 22 RUI y 4 brechas con el backend (B-01 a B-04). Desviación: el inventario de endpoints quedó en §7.1 desde T1 en lugar de un anexo.

## Objetivo

Escribir `docs/requerimientos.md`: el documento que define **qué hace el frontend**, tomando como base lo que la API ya implementa. Es el equivalente del documento de requerimientos del backend, pero solo con lo propio del cliente: qué vistas existen, quién las usa, cómo se navega entre ellas, cómo se comporta la interfaz en cada flujo y cómo se muestran los errores.

**Usuarios del documento:**
- El usuario (dueño del proyecto), que aprueba el alcance.
- El entregable `wireframes`, que dibuja una página por cada vista del catálogo.
- El entregable `arquitectura`, que elige las librerías según los componentes y las reglas de interfaz.
- Los módulos del mapa, que implementarán las vistas y citarán sus códigos.

**Qué no es:** no repite las reglas de negocio. Una vista cita `RF-51` o `RN-05` del backend en lugar de explicarlos (decisión 2 de la fase 0). Tampoco decide tecnología ni aspecto visual.

### Alcance: contenido de `docs/requerimientos.md`

1. **Descripción general**
   - Propósito del frontend y su relación con la API (versión, URL base, documentos de referencia).
   - Alcance incluido y fuera del alcance de esta versión.

2. **Roles y navegación**
   - Los cuatro roles del backend (§2 de sus requerimientos), por referencia.
   - Por rol: página de inicio, menú y vistas a las que tiene acceso.
   - Rutas públicas y protegidas, y qué pasa al entrar a una vista sin sesión o sin permiso.

3. **Catálogo de vistas.** Una fila por vista, con un id estable `V-xx` (supuesto 1), que usan los wireframes y los módulos:

   | Id | Vista | Rol(es) | Propósito | Endpoints | RF / RN del backend |
   |---|---|---|---|---|---|
   | `V-01` | Inicio de sesión | Visitante | … | `POST /auth/login` | RF-06, RF-07, RN-24, RN-29 |

   Agrupadas por área: acceso y cuenta, oferta pública, administración (personas, catálogos, grupos y horarios, matrícula, auditoría y errores), estudiante y profesor.

4. **Requerimientos funcionales del frontend** (`RFF-xx`, supuesto 1). Lo que la interfaz hace más allá de llamar al endpoint. Por ejemplo:
   - Redirigir al cambio obligatorio cuando el login responde `debeCambiarContrasena: true`, y no permitir salir de ahí salvo cerrando sesión (RN-24).
   - Qué ocurre cuando el token vence (60 minutos, sin renovación).
   - Mostrar el aviso de `correoEnviado: false` con la opción de reenviar la temporal.
   - Ante un `409 RN-39`, ofrecer reactivar el registro existente.
   - Mostrar u ocultar acciones de un grupo según su estado (RF-47, RF-48 y edición por estado de `SPEC-grupos` del backend).
   - Elegir el grupo destino en un cambio de grupo (RF-53).
   - Presentar el horario semanal como grilla por día y hora (RF-21, RF-28, RF-41).

5. **Reglas de interfaz** (`RUI-xx`). Comportamientos transversales que aplican a todas las vistas:
   - **Errores:** cómo se presenta cada respuesta: `400` por campo, `401`, `403`, `403 RN-24`, `404`, `409` con su `code`, `409 CONCURRENCIA`, `429` con `Retry-After`, y `500` con el `traceId` como código para reportar.
   - **Confirmaciones:** qué acciones piden confirmación (desactivar, eliminar, cancelar un grupo, retirar una matrícula, cambiar de grupo, reenviar una temporal).
   - **Listados:** paginación, búsqueda, filtros, el filtro "incluir inactivos" (RN-41) y el estado vacío.
   - **Formatos:** fechas, horas, moneda, y etiquetas legibles para los enums (`EnCurso` → "En curso", `Basico` → "Básico").
   - **Mensajes de éxito** y estados de carga.

6. **Requerimientos no funcionales**: dispositivos y tamaños de pantalla, navegadores, accesibilidad, idioma, rendimiento percibido, seguridad en el cliente (dónde vive el token sin decidir la técnica, no mostrar datos sensibles) y fechas sin conversión de zona horaria (las `DateOnly` del backend ya están en la fecha local del instituto).

7. **Trazabilidad**
   - Matriz endpoint de la API → vista(s) que lo usan. Los **76 endpoints** de los 14 controllers del backend deben aparecer: usados por una vista o marcados como fuera del alcance, con el motivo.
   - Lista de los RF del backend con interfaz, y la vista que los cubre.

8. **Brechas con el backend** (supuesto 6 de la fase 0): lo que el frontend necesita y la API no ofrece, con su impacto y una propuesta. No se resuelven aquí.

9. **Glosario**: solo los términos de interfaz nuevos. Los del negocio se citan del backend (§8).

### Fuera del alcance de este entregable

- Elegir framework, librerías, la forma de guardar el token o el estilo visual: entregable `arquitectura`.
- Dibujar las vistas: entregable `wireframes`. El catálogo solo las nombra y describe su contenido.
- Cambiar la API o sus reglas.
- Definir los módulos de implementación: `specs/mapa-modulos.md`, al cerrar la fase.

## Tech Stack

No aplica: es un documento Markdown. No se instalan dependencias.

## Commands

No aplica. Para verificar la trazabilidad se listan los endpoints del backend:

```bash
grep -n "\[Http\|\[Route" ../sistema-matricula-api/src/Matricula.Api/Controllers/*.cs
```

## Project Structure

```
docs/requerimientos.md          entregable
specs/SPEC-requerimientos.md    esta spec
tasks/requerimientos/todo.md    plan y tareas (después de aprobar esta spec)
```

## Code Style

Mismo estilo que `docs/requerimientos.md` del backend: Markdown con secciones numeradas, tablas para catálogos y reglas, códigos estables y frases cortas. Ejemplo de un requerimiento:

```markdown
- **RFF-03 Cambio obligatorio de contraseña:**
  - Si el login responde `debeCambiarContrasena: true`, la aplicación abre `V-03` y no permite navegar a otra vista; solo ofrece cerrar sesión (RN-24).
  - Al completarse, guarda el token nuevo y abre la página de inicio del rol.
  - Endpoints: `POST /auth/cambio-obligatorio`, `POST /auth/logout`. Backend: RF-07, RN-25, RN-26.
```

## Testing Strategy (verificación)

Revisión del documento contra estas comprobaciones, antes de pedir la aprobación:

| Qué | Cómo |
|---|---|
| Cobertura de endpoints | Cada uno de los 76 endpoints aparece en la matriz con una vista o como fuera de alcance |
| Cobertura de RF | Todo RF del backend con interfaz (RF-01…RF-59, excepto los internos como RF-05, RF-56 y RF-58) tiene al menos una vista |
| Matriz de permisos | Las vistas de cada rol coinciden con §2.2 de los requerimientos del backend y con las políticas de sus specs |
| Sin duplicar reglas | Ninguna RN del backend está reescrita; solo citada |
| Códigos únicos | `V-xx`, `RFF-xx` y `RUI-xx` sin repetidos ni huecos |
| Errores | Cada código HTTP y cada `code` que la API devuelve tiene una regla de presentación |

## Boundaries

- **Siempre:** citar el RF, RN o endpoint del backend en lugar de describir la regla. Leer la spec del módulo del backend antes de describir el comportamiento de una vista. Anotar como brecha lo que la API no ofrezca.
- **Preguntar antes:** incluir una vista o funcionalidad que el backend no soporta. Excluir un RF del backend. Interpretar un comportamiento que la spec del backend no fija.
- **Nunca:** modificar la API. Decidir tecnología o estilo visual en este documento.

## Success Criteria

1. `docs/requerimientos.md` existe, con las nueve secciones del alcance.
2. El catálogo de vistas cubre los cuatro roles, y cada vista tiene id, rol, propósito, endpoints y referencias del backend.
3. Las comprobaciones de la tabla de verificación se cumplen.
4. Las preguntas abiertas de esta spec quedan resueltas o registradas como supuestos en el documento.
5. El usuario aprueba el documento.

## Supuestos

Se aplican salvo que se corrijan en la revisión:

1. **Prefijos de códigos propios:** `V-xx` (vistas), `RFF-xx` (requerimientos funcionales del frontend) y `RUI-xx` (reglas de interfaz), para no confundirlos con los `RF` y `RN` del backend. Los no funcionales se agrupan por tema, sin código, igual que en el backend.
2. **Una sola aplicación** para los cuatro roles. Cada rol ve su menú y su inicio; no hay aplicaciones separadas por rol.
3. **Inicio público = oferta académica** (RF-50), con accesos a iniciar sesión y registrarse.
4. **Vencimiento del token:** sin renovación (la API no la ofrece). Al recibir un `401` con sesión iniciada, la aplicación avisa que la sesión venció, vuelve al login y, después de iniciar sesión, regresa a la vista donde estaba. No hay aviso previo al vencimiento.
5. **Matrícula del administrador** desde el detalle del estudiante (matricular, retirar, cambiar de grupo) y consulta de inscritos desde el detalle del grupo.
6. **Moneda en colones (₡)**, por la zona horaria configurada en el backend (`America/Costa_Rica`). Fechas como `dd/mm/aaaa` y horas en formato de 12 horas con a. m. y p. m. (cambiado después de la aprobación; antes, 24 horas). La API sigue usando 24 horas.
7. **Sin modo oscuro, exportaciones ni impresión** en esta versión (ver fuera de alcance diferido).

## Out of Scope (Deferred)

Ideas excluidas de esta versión del frontend, para una versión futura:

- Exportar listados a Excel o PDF, e imprimir el horario: no las pide el backend y no hay endpoints de exportación.
- Modo oscuro: no aporta a la funcionalidad de la primera versión.
- Notificaciones en tiempo real (por ejemplo, cupos que se liberan): la API no las ofrece.
- Aviso antes del vencimiento del token y renovación de la sesión: la API no tiene refresh token.
- Varios idiomas: el sistema es solo en español.
- Todo lo que el backend deja fuera de su alcance (§1.3 de sus requerimientos: calificaciones, pagos, lista de espera, etc.).

## Decisiones

1. **Aplicación adaptable (responsive)** (2026-11-17). Todas las vistas funcionan desde 360 px de ancho. Las del estudiante y la oferta se piensan primero para celular; las de administración, para escritorio, pero usables en celular.
2. **Accesibilidad con buenas prácticas básicas** (2026-11-17): navegación con teclado, etiquetas en los formularios, foco visible y contraste suficiente. Sin el cumplimiento formal de WCAG 2.1 AA.
3. **Navegadores** (2026-11-17): las dos últimas versiones de Chrome, Edge, Firefox y Safari.

## Open Questions

Ninguna.
