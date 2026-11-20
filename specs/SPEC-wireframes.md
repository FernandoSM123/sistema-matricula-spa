# Spec: wireframes

Entregable `wireframes` de la [fase 0](fase-0.md). Depende de `requerimientos` (completado).

| Estado | Tareas | Avance |
|---|---|---|
| **Aprobada** | [Aprobadas](../tasks/wireframes/todo.md) | 7/8 tareas completadas |

**Historial:**
- 2026-11-19: v1 en revisión.
- 2026-11-19: v1 aprobada, con sus seis supuestos. Lista de 8 tareas en revisión.
- 2026-11-19: lista de tareas aprobada; T1 en progreso.

## Objetivo

Construir `docs/wireframes/`: bocetos navegables, en escala de grises, de las **38 vistas** del catálogo de [`docs/requerimientos.md`](../docs/requerimientos.md) (§3, `V-01` a `V-38`). Fijan **qué hay en cada vista y dónde**: estructura, posición de los elementos, componentes y estados. No fijan el estilo visual (decisión 3 de la fase 0).

**Usuarios del entregable:**
- El usuario (dueño del proyecto), que recorre los flujos y aprueba la estructura de las vistas antes de escribir código.
- El entregable `arquitectura`, que elige las librerías según los componentes que aparecen aquí (grilla semanal, selectores de fecha y hora, selectores con búsqueda, tablas paginadas, ventanas modales).
- Los módulos del mapa, que implementan cada vista tomando su wireframe como guía.

**Qué no es:** no es un contrato ni un prototipo funcional. No llama a la API, no valida de verdad y no decide colores, tipografía ni íconos. El comportamiento lo definen los `RFF` y las `RUI` de `docs/requerimientos.md`; el wireframe los **muestra** y los **cita**, no los redefine. Si al dibujar una vista aparece algo que los requerimientos no definen, se pregunta y, si hace falta, se ajusta primero `docs/requerimientos.md`.

### Alcance: contenido de `docs/wireframes/`

1. **Base compartida**
   - `css/wireframe.css`: escala de grises, fuente del sistema, una retícula sencilla y las clases de los componentes. Adaptable desde 360 px (decisión 1 de `SPEC-requerimientos`).
   - `js/wireframe.js`: solo interacciones mínimas (supuesto 3 de la fase 0): abrir y cerrar ventanas, cambiar de pestaña, abrir el menú en celular, y la **barra del wireframe** (punto 3).
   - **Marco de la aplicación** (layout): encabezado con el nombre del sistema y el menú de la cuenta (nombre, rol, Mi perfil, Cambiar contraseña, Cerrar sesión); menú principal por rol según §2.3; en pantallas angostas, menú plegable. El visitante tiene su propio marco, con Oferta académica, Iniciar sesión y Registrarse. Todos los marcos terminan con el pie de página de RUI-23 (agregado en T8).

2. **Catálogo de componentes** (`componentes.html`). Una página con cada componente reutilizable y sus variantes, para que las vistas los usen igual y para que `arquitectura` vea qué librerías hacen falta:

   | Componente | Variantes que muestra | Regla |
   |---|---|---|
   | Listado paginado | Tabla en escritorio y tarjetas en celular; rango y total; tamaño de página | RUI-10, RUI-14 |
   | Barra de búsqueda y filtros | Texto con botón "Buscar", listas, casillas, fechas, "Incluir inactivos", "Limpiar filtros" | RUI-11, RUI-12 |
   | Formulario | Campo obligatorio, error por campo, errores generales arriba, envío en curso, contraseña con "mostrar" | RUI-02, RUI-06, RUI-08 |
   | Selector de fecha y de hora | Fecha `dd/mm/aaaa`; hora de 12 horas con a. m. y p. m. | RUI-15, RUI-17 |
   | Selector con búsqueda | Sugerencias mientras se escribe (curso, profesor, aula, grupo) | RUI-11 |
   | Ventana de confirmación | Simple y reforzada | RUI-07 |
   | Mensajes | Éxito (temporal), aviso fijo, error de una acción, `409` con acción adicional, `429`, `500` con `traceId` y "Copiar", sin conexión con "Reintentar" | RUI-03, RUI-04, RUI-21 |
   | Estados de contenido | Cargando, vacío sin filtros, vacío con filtros, error | RUI-13 |
   | Etiquetas de estado | Grupo, matrícula, activo o inactivo | RUI-19, RUI-20 |
   | Grilla del horario semanal | Grilla por día y hora; lista por día en celular; sin periodo vigente; vacía | RFF-29 |
   | Pestañas y secciones de detalle | Encabezado de detalle con sus acciones | — |

3. **Barra del wireframe.** Una franja fija, visualmente distinta del marco de la aplicación (no es parte del producto), con:
   - El id y nombre de la vista, y un enlace al índice.
   - **Estado:** los estados que aplican a la vista (por ejemplo: Con datos · Cargando · Vacío · Vacío con filtros · Error), que cambian el contenido sin cambiar de página.
   - **Ver como:** en las vistas que cambian según el rol, el rol con que se muestra (por ejemplo, `V-30` como Administrador, Profesor del grupo o Estudiante).
   - **Notas:** muestra u oculta las anotaciones de la vista (punto 5).

4. **Una página por vista** (`V-01` a `V-38`), con los datos de ejemplo (supuesto 4), los componentes del catálogo y los estados que le aplican. Las vistas que se muestran como ventana sobre otra vista (supuesto 2) tienen igual su página: la vista anfitriona de fondo y la ventana abierta. Las secciones que §3.7 agrega a vistas anteriores (por ejemplo, matrículas y horario en `V-16`) se dibujan en esas vistas.

5. **Anotaciones por vista.** Un panel plegable al final de cada página con:
   - Id, nombre, rol(es) y los `RFF` y `RUI` que la gobiernan (con su número, sin copiar su texto).
   - Endpoints que usa.
   - Decisiones de estructura propias del wireframe (por ejemplo: "matricular se abre como ventana sobre `V-01`").

6. **Flujos navegables.** Los enlaces y botones llevan a la vista que corresponde, para recorrer al menos estos flujos:

   | Flujo | Recorrido |
   |---|---|
   | Acceso | `V-01` → `V-02` → (`V-03` si hay cambio pendiente) → inicio del rol |
   | Registro y olvido | `V-01` → `V-05`; `V-02` → `V-04` → `V-02` |
   | Matrícula del estudiante | `V-31` → `V-01` → `V-32` → `V-31`; `V-31` → `V-33`; `V-31` → retiro (confirmación) |
   | Matrícula del administrador | `V-14` → `V-16` → `V-32` / `V-33` / retiro → `V-16` |
   | Gestión de una persona | Listado → registrar → detalle → editar / desactivar / reactivar / eliminar |
   | Grupos | `V-28` → `V-29` → `V-30` (estado, horarios, inscritos) |
   | Catálogos | `V-20`/`V-23`/`V-25` → formulario → detalle; `V-27` con la ocupación |
   | Profesor | `V-35` → `V-30` (inscritos); `V-34` |
   | Sistema | `V-36` → detalle del registro auditado; `V-37` → `V-38` |
   | Sesión y permisos | Aviso de sesión vencida en `V-02` (RFF-03); `V-09`; `V-10` |

7. **Estados especiales.** Además de los estados de contenido, cada uno de estos aparece al menos una vez, en la vista donde ocurre:

   | Estado | Vista(s) | Referencia |
   |---|---|---|
   | Credenciales inválidas, cuenta desactivada (`403 RN-29`), `429` | `V-02` | RFF-01, RUI-03 |
   | Sesión terminada | `V-02` | RFF-03 |
   | Registro ya existente (`409 RN-21`) | `V-05` | RFF-06, RUI-04 |
   | Temporal no enviada (`correoEnviado: false`) con "Reenviar" | `V-13`, `V-16` o `V-19` | RFF-14, RFF-15, RUI-21 |
   | Registro inactivo con "Reactivar" (`409 RN-39`) | `V-12`, `V-15`, `V-18`, `V-21` o `V-26` | RFF-12, RFF-19 |
   | No se puede eliminar (`409 RN-34`) con la alternativa | Un detalle de persona o catálogo, y `V-30` | RUI-04 |
   | No se puede desactivar (`409 RN-36`/`RN-37`) con el enlace | `V-16`, `V-19` | RFF-16 |
   | Rechazo de la matrícula (RN-01…RN-06) y `409 CONCURRENCIA` con "Intentar de nuevo" | `V-32`, `V-33` | RFF-30, RFF-34 |
   | Traslape de horario con el NRC con que choca | `V-29` o `V-30` | RFF-24, RFF-27 |
   | Acciones según el estado del grupo | `V-30`, un estado por opción de la barra | RFF-25, RFF-26 |
   | Sin periodo vigente | `V-01`, la grilla | RFF-07, RFF-29 |
   | Registro inexistente (`404`) | Un detalle | §2.5 |
   | Error inesperado (`500`) con `traceId` | Cualquier vista con datos | RUI-03 |
   | Cambios sin guardar | Un formulario | RUI-09 |

8. **Índice** (`index.html`): las 38 vistas agrupadas por rol (supuesto 1 de la fase 0, estructura de carpetas), con su id y nombre, más los enlaces al catálogo de componentes y a los flujos de la tabla del punto 6.

### Fuera del alcance de este entregable

- El estilo visual (colores, tipografía, íconos, marca): se decide en `arquitectura` o después.
- Validaciones, llamadas a la API y lógica real: se implementan en los módulos.
- Textos definitivos: los mensajes de la API vienen en su `detail` (RUI-01). Los textos propios se escriben con el trato de usted (RUI-22), pero pueden ajustarse al implementar.
- Elegir framework o librerías: entregable `arquitectura`.
- Cambiar el catálogo de vistas, los `RFF` o las `RUI`: si hace falta, se pregunta y se cambia en `docs/requerimientos.md`, no aquí.

## Tech Stack

HTML, CSS y JavaScript sin dependencias, sin build, sin servidor y sin CDN (supuesto 3 de la fase 0). Se abren con doble clic en las dos últimas versiones de Chrome, Edge, Firefox y Safari.

## Commands

No hay build. Para revisar:

```bash
# Abrir el índice en el navegador predeterminado (Windows)
start docs/wireframes/index.html

# Verificar que cada vista V-01…V-38 tiene su página
ls docs/wireframes/*/V-*.html | wc -l      # debe dar 38

# Verificar que ningún enlace interno apunta a un archivo inexistente
bash docs/wireframes/verificar-enlaces.sh
```

`verificar-enlaces.sh` es un script de unas líneas (`grep` + `test -f`) que se crea en la primera tarea. No es una dependencia.

## Project Structure

```
docs/wireframes/
  index.html                    Índice de vistas por rol y de flujos
  componentes.html              Catálogo de componentes (punto 2)
  verificar-enlaces.sh          Verificación de enlaces internos
  css/wireframe.css             Estilos compartidos en escala de grises
  js/wireframe.js               Interacciones mínimas y barra del wireframe
  publico/                      V-01, V-02, V-03, V-04, V-05, V-09, V-10
  cuenta/                       V-06, V-07, V-08
  admin/                        V-11…V-19, V-21, V-23, V-24, V-26, V-28, V-29, V-36, V-37, V-38
  compartidas/                  V-20, V-22, V-25, V-27, V-30, V-32, V-33, V-34
  estudiante/                   V-31
  profesor/                     V-35
specs/SPEC-wireframes.md        Esta spec
tasks/wireframes/todo.md        Plan y tareas (después de aprobar esta spec)
```

Archivos nombrados con el id y un nombre corto: `admin/V-14-estudiantes.html`. Ver el supuesto 1.

## Code Style

HTML semántico y legible, sin frameworks; clases cortas en español con el prefijo `wf-` para los componentes; datos de ejemplo escritos en el HTML. Ejemplo:

```html
<main class="wf-vista">
  <header class="wf-encabezado">
    <h1>Estudiantes</h1>
    <a class="wf-boton wf-principal" href="V-15-estudiante-form.html">Registrar estudiante</a>
  </header>

  <form class="wf-filtros" role="search">
    <label>Buscar <input type="search" placeholder="Nombre, apellidos o cédula"></label>
    <button type="button">Buscar</button>
    <label><input type="checkbox"> Incluir inactivos</label>
  </form>

  <section data-wf-estado="datos">
    <table class="wf-tabla">…</table>
    <nav class="wf-paginacion">21–40 de 134 …</nav>
  </section>
  <section data-wf-estado="vacio" hidden>
    <p>No hay estudiantes registrados.</p>
  </section>
</main>

<details class="wf-notas">
  <summary>Notas de V-14</summary>
  <p>RFF-11 · RUI-10 a RUI-14 · <code>GET /estudiantes</code></p>
</details>
```

- Los estados se marcan con `data-wf-estado` y la barra los alterna; las variantes por rol, con `data-wf-rol`.
- Los textos visibles van en español y de usted (RUI-22), con los formatos de §5.4 (`dd/mm/aaaa`, `6:30 p. m.`, `₡25 000,00`) y las etiquetas de RUI-19.
- Accesibilidad básica desde el boceto: etiquetas visibles en los campos, botones con texto, foco visible y orden lógico (§6 de `docs/requerimientos.md`).

## Testing Strategy (verificación)

Revisión del entregable contra estas comprobaciones, antes de pedir la aprobación:

| Qué | Cómo |
|---|---|
| Cobertura de vistas | Las 38 vistas tienen página, y el índice las enlaza a todas |
| Contenido de cada vista | Cada vista muestra los datos y acciones de su `RFF`, y las secciones que §3.7 le agrega |
| Variantes por rol | Las vistas compartidas muestran lo que ve cada rol (RFF-25 y similares) con "Ver como" |
| Estados | Cada listado o vista con datos tiene Cargando, Vacío y Error (RUI-13); los estados especiales del punto 7 aparecen |
| Confirmaciones | Cada acción de RUI-07 abre su ventana, del tipo correcto (simple o reforzada) |
| Flujos | Los flujos del punto 6 se recorren con clics, sin enlaces rotos (`verificar-enlaces.sh`) |
| Celular | Con el navegador a 360 px de ancho, ninguna vista tiene desplazamiento horizontal; las tablas pasan a tarjetas y la grilla a lista por día |
| Formatos y textos | Fechas, horas, moneda y enums con los formatos de §5.4; trato de usted |
| Anotaciones | Cada vista cita sus `RFF`, `RUI` y endpoints, y coinciden con §3 de `docs/requerimientos.md` |
| Sin dependencias | Ningún `<script src>` ni `<link>` externo; todo abre con doble clic |

## Boundaries

- **Siempre:** usar los ids `V-xx` y citar `RFF`, `RUI` y endpoints de `docs/requerimientos.md`. Reutilizar los componentes del catálogo en lugar de inventar variantes por vista. Mantener los datos de ejemplo coherentes entre vistas.
- **Preguntar antes:** agregar, quitar o fusionar una vista. Mostrar un dato o una acción que el `RFF` no menciona. Cambiar algo de `docs/requerimientos.md` que el dibujo revele como incompleto o contradictorio.
- **Nunca:** agregar dependencias, CDN o build. Llamar a la API. Decidir el estilo visual definitivo. Modificar la API.

## Success Criteria

1. `docs/wireframes/` existe con la estructura de esta spec: base, catálogo de componentes, índice y las 38 vistas.
2. Las comprobaciones de la tabla de verificación se cumplen.
3. Los flujos del punto 6 se recorren de principio a fin con clics.
4. Lo que los wireframes revelen como faltante en `docs/requerimientos.md` queda corregido allí, con la aprobación del usuario, o registrado como pregunta resuelta.
5. El usuario aprueba el entregable.

## Supuestos

Se aplican salvo que se corrijan en la revisión:

1. **Carpetas por área de uso, no estrictamente por rol.** La estructura de la fase 0 (`<rol>/<vista>.html`) no encaja con las vistas que usan varios roles (por ejemplo, `V-30` la usan los tres roles con sesión). Se usan `publico/`, `cuenta/`, `admin/`, `estudiante/`, `profesor/` y `compartidas/`, y el índice sí agrupa por rol. Al aprobar, se actualiza la estructura de carpetas de la fase 0.
2. **Vistas que se muestran como ventana:** `V-32` Matricular y `V-33` Cambiar de grupo, sobre la vista desde la que se inician (porque son una confirmación con resumen y, en el caso del administrador y del cambio, un selector de grupo). Las demás son páginas. Las confirmaciones de RUI-07 son ventanas dentro de la vista que las usa, sin página propia.
3. **Escritorio y celular en el mismo HTML:** el CSS compartido adapta cada vista a pantallas angostas; no hay páginas separadas para celular. Se revisa con el ancho del navegador o el modo de dispositivo de sus herramientas.
4. **Datos de ejemplo:** un conjunto pequeño y coherente, escrito a mano en cada página: un periodo vigente y uno anterior, unos 5 cursos, 4 aulas, 3 profesores, 6 estudiantes y unos 8 grupos en estados distintos. Se fija en la primera tarea (en `index.html`) y se reutiliza en todas las vistas.
5. **Escala de grises sin íconos de imagen:** los íconos, si hacen falta, son texto o símbolos Unicode simples. Las etiquetas de estado se distinguen por su texto y su borde (RUI-20).
6. **Commit único** al terminar el entregable, como en `requerimientos`.

## Out of Scope (Deferred)

- Wireframes de alta fidelidad o un sistema de diseño: se deciden después de `arquitectura`.
- Variantes de tableta como diseño propio: las cubre el comportamiento adaptable entre celular y escritorio.
- Pruebas de usabilidad con usuarios reales: no forman parte de la fase 0.
- Todo lo diferido en `docs/requerimientos.md` §1.3 (exportaciones, modo oscuro, notificaciones, etc.).

## Open Questions

Ninguna bloqueante. Los supuestos 1 a 3 son las decisiones de estructura que más conviene revisar.
