# Spec: componentes

Módulo `componentes` del [mapa de módulos](mapa-modulos.md). Depende de `nucleo` (y de la corrección [`sesiones`](SPEC-sesiones.md)).

| Estado | Plan | Tareas | Avance |
|---|---|---|---|
| **Aprobada** | [Aprobado](../tasks/componentes/plan.md) | [Aprobadas](../tasks/componentes/todo.md) | 6/10 tareas completadas |

**Historial:**
- 2026-11-27: v1 en revisión, en la rama `componentes`.
- 2026-11-27: v1 aprobada por el usuario, que resolvió las preguntas abiertas: el catálogo de componentes queda en `/componentes`, en cualquier ambiente, sin sesión y sin enlaces (decisión 1), y los validadores de un solo formulario llegan con su módulo (decisión 2, antes supuesto 4). Plan y tareas en revisión.
- 2026-11-27: plan y tareas aprobados. T1 completada: el catálogo en `/componentes`, revisado por el usuario.
- 2026-11-27: T2 completada: límites, validadores, mensajes, `applyServerErrors` y `focusFirstError`.
- 2026-11-27: T3 completada: avisos, `Banner` y `ConfirmService`, revisados por el usuario. Decisión 3: la confirmación puede ejecutar la acción y mostrar su error dentro de la ventana (en T6).
- 2026-11-27: T4 completada: `unsavedChangesGuard`, `HasUnsavedChanges` y `warnBeforeUnload()`, revisados por el usuario. La guarda deja salir sin preguntar solo en la navegación del fin de la sesión (`aviso=sesion-terminada` o `sesion-cerrada`), no con cualquier sesión terminada.
- 2026-11-27: T5 completada: `FieldError`, `FormErrors`, `SubmitButton` y `PasswordField`, revisados por el usuario. Al revisar, el usuario fija la disposición de los formularios: a todo el ancho, 16 px entre filas y sin estirar los campos de una fila por un error (§5.1 de la arquitectura).
- 2026-11-27: T6 completada: `ActionError`, `retryCountdown` y la confirmación que ejecuta la acción (decisión 3), revisados por el usuario.

## Objetivo

Construir las piezas de interfaz que se repiten en las 38 vistas, para que cada área las use ya probadas en lugar de armarlas a su manera (decisión 1 del mapa, punto 2 de `SPEC-wireframes`):
- Los componentes de `shared/ui` del catálogo de los wireframes (`docs/wireframes/componentes.html`, §6.2 de la arquitectura), menos la grilla del horario, que es de `grupos`.
- Las piezas de formulario de `shared/forms` (§5): validadores, mensajes, errores del servidor y errores de campo.
- La presentación de los errores de la API de §3.5: `ActionError` en las acciones y `ContentState` al cargar. `nucleo` dejó la interpretación (`ApiError`); este módulo la muestra.
- `unsavedChangesGuard` y `HasUnsavedChanges` (§4.3, decisión 1 de `SPEC-nucleo`).

Este módulo no agrega vistas. Las áreas siguientes (`acceso` es la primera) solo declaran sus columnas, filtros, campos y acciones.

**Usuario:** quien construye los módulos siguientes y, a través de ellos, los cuatro roles (§2.1 de los requerimientos).

**Requerimientos que cubre:** la presentación de RUI-01 a RUI-05, RUI-06 a RUI-14, RUI-20 y RUI-21, y la parte de §6 de los requerimientos (accesibilidad) que toca a estas piezas. RUI-22 (trato de usted) en todos los textos.

### Alcance

1. **Mensajes y confirmaciones** (`shared/ui`, §6.2 filas 6 y 7):
   - `NotificationService.success(mensaje)`: `MatSnackBar` de 5 segundos, fijados en cada aviso (verificación heredada de `nucleo`), que se anuncia sin interrumpir (`politeness: 'polite'`). RUI-21.
   - `Banner`: aviso fijo en línea con tono (aviso, información, éxito, error), texto proyectado y "Cerrar" opcional (`correoEnviado: false`). RUI-21.
   - `ConfirmService.confirm({ title, message, action, irreversible })` → `Promise<boolean>`, sobre `MatDialog`. El botón de confirmar lleva el texto de `action` (RUI-07). La irreversible destaca que no se puede deshacer y deja el foco inicial en "Cancelar". El foco vuelve al cerrar (§6.5). Con `run`, la ventana ejecuta la acción y muestra su error sin cerrarse (decisión 3).
2. **Errores de la API** (§3.5):
   - `ActionError`: recibe un `ApiError` y dibuja cada fila de §3.5 que corresponde a una acción, con `role="alert"`:
     - `403`, `409` y un `code` desconocido: el `detail` (RUI-01, RUI-04). Las acciones adicionales de RUI-04 ("Reactivar", la alternativa a eliminar, los enlaces de `RN-36`, `RN-37` y `RN-21`) las proyecta la vista, que conoce el registro (supuesto 2). Con `CONCURRENCIA`, "Intentar de nuevo" (avisa por `output()`).
     - `429`: "Demasiados intentos. Intente de nuevo en N segundos", con la cuenta regresiva. Sin `retryAfter`, solo el `detail` (RUI-03).
     - `500`: el texto fijo con el `traceId` y "Copiar" (`Clipboard` del CDK).
     - Sin respuesta (`status: 0`): el texto fijo y "Reintentar" (avisa por `output()`).
     - `400` sin campo: los mensajes que `applyServerErrors` no ubicó (como `FormErrors`, punto 3).
   - **La espera del `429`** es una señal que comparten `ActionError` y `SubmitButton` (supuesto 3), para que el envío quede deshabilitado esos N segundos.
   - `ContentState`: recibe el recurso (`httpResource`) y si hay filtros aplicados, y dibuja los estados de RUI-13 y §3.5:
     - Cargando, solo la primera vez. Las recargas mantienen el contenido con una barra de progreso.
     - Vacío sin filtros (mensaje y acción de crear proyectados por la vista) y vacío con filtros ("No hay resultados para los filtros aplicados", con "Limpiar filtros").
     - Error (`500` y sin respuesta, con "Reintentar").
     - No existe (`404`): el mensaje y el enlace al listado, que da la vista.
     - Sin permiso (`403` sin `code` o con `RN-18`): muestra `V-09` sin cambiar la dirección (`skipLocationChange`, §3.5).
     - Con datos: el contenido proyectado.
3. **Formularios** (`shared/forms` y `shared/ui`, §5):
   - `limits.ts` con los límites de RUI-06, cada uno con el comentario del validador del backend del que sale.
   - Validadores genéricos con error con nombre: `passwordPolicy` (RN-26), `fieldsMatch` (RN-25), `notFutureDate`, `minDate`, `greaterThan` y `endAfterStart` (RN-15). Los validadores de un solo formulario (`periodoDates`, el del grupo según la modalidad) los agregan `catalogos` y `grupos` (decisión 2).
   - `messages.ts`: el mapa de error → mensaje, con trato de usted, incluidos los validadores de Angular (`required`, `maxlength`, `email`, `pattern`, `min`) y el error `server`.
   - `FieldError`: traduce el primer error de un control a su mensaje, dentro de `mat-error`.
   - `FormErrors`: los mensajes sin campo arriba del formulario.
   - `applyServerErrors(form, error, codeFields?)`: §5.3. Claves sin distinguir mayúsculas, rutas con punto (`Horarios.HoraFin`), el error `server` en el control tocado, y el mapa `code → campo` de los `409` (`RF-09`, `RN-25`). Devuelve los mensajes sin campo.
   - `focusFirstError(element)`: el foco al primer campo con error (§5.4).
   - `SubmitButton`: el botón de envío con el indicador de trabajo; se deshabilita mientras se envía o durante la espera del `429` (RUI-08).
   - `PasswordField`: campo de contraseña con "Mostrar"/"Ocultar" (íconos `visibility` y `visibility-off`, con `aria-label` y `aria-pressed`), usable como control de un Reactive Form.
4. **Listados** (`shared/ui`, §3.4, §6.2 filas 1, 2 y 9):
   - `PaginatedList`: `mat-table` con `mat-paginator` (20 por defecto, opciones 10, 20 y 50, rango "21–40 de 134" con el `MatPaginatorIntl` de `fundacion`). Las columnas se declaran una sola vez en la vista; por debajo de 600 px dibuja tarjetas: la columna principal encabeza la tarjeta y las demás llevan su rótulo (RUI-14). Avisa el cambio de página por `output()`.
   - `FilterBar`: búsqueda con "Buscar" y Enter, los filtros de la vista proyectados, "Incluir inactivos" opcional y "Limpiar filtros" solo si hay alguno aplicado. Avisa por `output()`; la vista navega con los parámetros nuevos y `page=1` (RUI-11, RUI-12).
   - `StatusBadge`: el tipo (estado del grupo, de la matrícula, activo/inactivo y las otras marcas del catálogo: "Vigente", "Ya matriculado", "Sin cupo", "Sistema") y el valor; el texto de RUI-19 con el tono de §6.6 y el refuerzo del wireframe (RUI-20).
5. **Detalle y selección** (`shared/ui`, §6.2 filas 5 y 11):
   - `DetailHeader`: título, subtítulo opcional, `StatusBadge` y las acciones proyectadas; se apila en pantallas angostas. Las pestañas con la pestaña activa en la URL (`?pestana=`) las arma cada vista con `mat-tab-group`.
   - `SearchSelect`: sobre `mat-autocomplete`, como control de un Reactive Form. Recibe una función de búsqueda (`(texto) => Observable<Opcion[]>`, sin conocer la API), sugiere mientras se escribe con un retardo de 300 ms y hasta 10 opciones, guarda el id y muestra el texto. Con un valor inicial, muestra su texto.
6. **Cambios sin guardar** (`core/guards/`, §4.3, §5.5):
   - `HasUnsavedChanges` (`hasUnsavedChanges(): boolean`) y `unsavedChangesGuard` (`canDeactivate`): pide "¿Descartar los cambios?" con `ConfirmService` (texto del wireframe), y deja salir sin preguntar si la sesión terminó (`SessionService.ended()`, RFF-03).
   - El aviso nativo de `beforeunload` con cambios (§5.5): una función de `shared/forms` que el formulario registra (supuesto 5).
7. **Catálogo de componentes** (decisión 1): una página en `/componentes` que muestra todas las piezas con datos de ejemplo, para revisarlas contra `componentes.html` con la aplicación en marcha. No pide sesión, ningún menú ni enlace de la aplicación lleva a ella (solo se abre escribiendo la dirección), se carga en diferido y queda en la aplicación al cerrar el módulo. Los módulos siguientes pueden agregarle sus piezas (por ejemplo, `WeeklySchedule`).
8. **Cierre:**
   - La versión sube a `0.3.0` (§11.3).
   - §6.6 de la arquitectura dice que FullCalendar se instala en `componentes`; se corrige a `grupos`, como en el mapa (supuesto 6).
   - Las verificaciones heredadas del mapa: la duración de 5 s de `NotificationService` y Lighthouse.
9. **Pruebas** (§9): la fila de los componentes de `shared/ui`, los validadores, `applyServerErrors` y `unsavedChangesGuard`.

### Fuera de alcance
- `WeeklySchedule` y `PeriodoSelect`, y con ellos FullCalendar: son de `grupos` (mapa).
- Las acciones adicionales concretas de RUI-04 (qué hace "Reactivar", a dónde lleva cada enlace): las pone cada vista dentro de `ActionError`.
- Los `toRequest()`/`toForm()` de cada formulario: son de cada vista (§5.1).
- Los validadores de un solo formulario (`periodoDates`, el del grupo): `catalogos` y `grupos` (decisión 2).
- Probar estas piezas dentro de un flujo real con la API (formularios, `429` real, `403` al cargar): lo hacen `acceso` y los módulos siguientes.
- Pruebas e2e: siguen diferidas.

## Tech Stack

Lo de `docs/arquitectura.md` §1, ya instalado. **No agrega dependencias**: usa Angular Material y el CDK que ya están (`mat-table`, `mat-paginator`, `mat-snack-bar`, `mat-dialog`, `mat-autocomplete`, `mat-form-field`, `mat-checkbox`, `mat-progress-bar`, `mat-progress-spinner`, `mat-button`, `mat-icon`, `Clipboard`, `BreakpointObserver`, `LiveAnnouncer` si hace falta).

Usa los íconos que ya están en `public/icons/`. Si alguna pieza necesita uno nuevo, se pregunta antes de copiarlo.

## Commands

```bash
pnpm install --frozen-lockfile
pnpm start                         # http://localhost:5173/componentes: el catálogo
pnpm test --watch=false
pnpm lint
pnpm format:check
pnpm build
pnpm audit
```

**Cierre del módulo:** `pnpm format:check && pnpm lint && pnpm test --watch=false && pnpm build` y `pnpm audit`. Después, la revisión contra `componentes.html` y Lighthouse sobre `dist/`.

## Project Structure

```
src/app/
  shared/
    ui/
      notification-service.ts, banner/, confirm-service.ts (+ confirm-dialog/)
      action-error/, content-state/
      submit-button/, password-field/
      paginated-list/, filter-bar/, status-badge/
      detail-header/, search-select/
    forms/
      limits.ts, validators.ts, messages.ts
      field-error/, form-errors/
      server-errors.ts            applyServerErrors
      focus-first-error.ts, before-unload.ts
      retry-countdown.ts          la espera del 429 (supuesto 3)
  core/
    guards/
      unsaved-changes-guard.ts    + HasUnsavedChanges
  <catálogo de componentes>       Ruta /componentes, en diferido y sin enlaces (decisión 1). La carpeta se fija en el plan
src/testing/                      + un ApiError de cada tipo y un formulario de ejemplo
```

Los nombres exactos de los archivos se ajustan en el plan. `shared/` sigue sin importar `core/`, y de `api/` solo tipos (§2.3, lo hace cumplir ESLint).

## Code Style

El de `docs/arquitectura.md` §8 y §10: standalone, `OnPush`, signals, `input()`/`output()`, `inject()`. Un validador:

```ts
// shared/forms/validators.ts
/** RN-26: al menos 8 caracteres, una mayúscula y un número (hasta 128, limits.ts). */
export const passwordPolicy: ValidatorFn = (control) => {
  const value: unknown = control.value;
  if (typeof value !== 'string' || value === '') return null;   // lo vacío es de `required`
  const valid =
    value.length >= LIMITS.password.min && /[A-Z]/.test(value) && /\d/.test(value);
  return valid ? null : { passwordPolicy: true };
};
```

Y su mensaje, en `messages.ts`: `passwordPolicy: () => 'Use al menos 8 caracteres, con una mayúscula y un número'`.

## Testing Strategy

- **Unitarias (Vitest, `TestBed`)**, por fila de §9:
  - `ActionError`: cada respuesta de §3.5 que le toca (`403`, `409` con y sin `CONCURRENCIA`, `code` desconocido, `429` con y sin `retryAfter` y su cuenta regresiva con reloj falso, `500` con el `traceId` y "Copiar", `status: 0` con "Reintentar"), y que nunca muestra `message` (RUI-05).
  - `ContentState`: cada estado (cargando la primera vez, recarga con contenido, vacío, vacío con filtros, error, `404`, `403` que navega con `skipLocationChange`, con datos).
  - `ConfirmService`: el texto de la acción en el botón, el resultado `true`/`false`, y la irreversible con el foco inicial en "Cancelar".
  - `PaginatedList`: en tabla y en tarjetas (con `BreakpointObserver` simulado), el rango y el cambio de página.
  - `FilterBar`: Enter y "Buscar" avisan la búsqueda; "Limpiar filtros" solo con filtros y avisa; "Incluir inactivos".
  - `SubmitButton`, `PasswordField`, `StatusBadge`, `SearchSelect` (retardo, tope de 10, guarda el id), `NotificationService` (duración de 5 s) y `Banner`: un caso por regla del alcance.
  - Validadores: los límites de RUI-06 en el borde (20 y 21 caracteres de cédula, 8 y 20 del teléfono, 100 y 101 del nombre), la política de RN-26, `fieldsMatch`, las fechas (`notFutureDate` con hoy en Costa Rica, `minDate` con 1900-01-01) y el bloque de RN-15.
  - `applyServerErrors`: una clave con otra capitalización, una ruta con punto, un mensaje sin campo, el mapa de `code` a campo y que no cambia los valores escritos (RUI-01).
  - `unsavedChangesGuard`: sin cambios deja salir; con cambios pregunta y respeta la respuesta; con la sesión terminada deja salir sin preguntar.
- **Manual**, en el catálogo de componentes, contra `docs/wireframes/componentes.html`:
  - Cada componente en escritorio y a 360 px sin desplazamiento horizontal.
  - El teclado y el foco: ventanas (foco inicial y devolución), `FilterBar`, `SearchSelect`, `PasswordField` y el paginador.
  - Los avisos con un lector de pantalla o, al menos, sus atributos (`role="alert"`, `aria-live`).
- **Verificaciones heredadas:** la duración de 5 s de los avisos y Lighthouse (carga inicial de 500 kB o menos y LCP menor a 2,5 s, sobre `dist/`). El catálogo de componentes no entra en la carga inicial.

## Boundaries

- **Siempre:**
  - Las reglas de `AGENTS.md` y de `docs/arquitectura.md` §2.3: `shared/` no importa `core/` ni usa `HttpClient`, y de `api/` solo importa tipos.
  - Los textos del usuario son el `detail` de la API, salvo los fijos de §3.5 (RUI-01, RUI-05). Nunca se muestra `message`.
  - Las piezas no conocen ningún recurso de la API: reciben datos por `input()`, funciones de búsqueda o contenido proyectado.
  - Commit después de cada tarea, en la rama `componentes` (decisión 5 del mapa).
- **Preguntar antes:**
  - Una dependencia nueva o un ícono nuevo.
  - Un color o un tono que no esté en §6.6.
  - Cambiar la firma que fija §6.2 de una pieza (por ejemplo, `confirm()`).
- **Nunca:**
  - Mostrar contraseñas fuera de su campo, `innerHTML` con datos de la API o `bypassSecurityTrust*`.
  - Enlazar el catálogo de componentes desde el menú u otra vista de la aplicación.
  - Modificar la API.

## Success Criteria

1. Existen todas las piezas de los puntos 1 a 6 del alcance, en las carpetas de §2.2, y ESLint confirma que `shared/` no importa `core/` ni usa `HttpClient`.
2. `pnpm format:check`, `pnpm lint`, `pnpm test --watch=false` y `pnpm build` pasan, y el build queda dentro de los presupuestos de §8.3.
3. Las pruebas de la estrategia pasan, con al menos una por respuesta de §3.5 en `ActionError`, una por estado en `ContentState`, y los bordes de RUI-06 en los validadores.
4. En el catálogo de componentes (`/componentes`, sin sesión y sin enlaces desde la aplicación), cada pieza coincide con `componentes.html` (salvo la grilla del horario), en escritorio y a 360 px sin desplazamiento horizontal, y se usa con el teclado.
5. Los avisos de `NotificationService` duran 5 s (verificación heredada) y se anuncian sin interrumpir; `ActionError` usa `role="alert"`.
6. `unsavedChangesGuard` pregunta con la ventana "¿Descartar los cambios?" y no pregunta con la sesión terminada.
7. Lighthouse, perfil de escritorio, sobre `dist/`: carga inicial de 500 kB o menos sin comprimir y LCP menor a 2,5 s.
8. `pnpm audit` no tiene hallazgos altos ni críticos, o quedan anotados con su justificación.
9. La versión es `0.3.0` y §6.6 de la arquitectura dice que FullCalendar llega con `grupos`.

## Supuestos

1. **Las piezas no tienen datos propios.** Reciben todo por `input()` o contenido proyectado y avisan por `output()` (§2.2), así que se prueban sin la API. `SearchSelect` recibe la función de búsqueda; `ContentState`, el recurso.
2. **Las acciones adicionales de RUI-04 las proyecta la vista dentro de `ActionError`**, porque solo ella sabe qué registro reactivar o a qué pestaña llevar (`RN-36`, `RN-37`). `ActionError` dibuja el `detail` y el lugar de esas acciones; solo "Intentar de nuevo" (`CONCURRENCIA`) y "Reintentar" (sin respuesta) son suyas, y avisan por `output()`. Es la lectura de "recibe un `ApiError` y las acciones de la vista" de §6.2.
3. **La espera del `429`** es una función de `shared/forms` que, a partir del `ApiError`, da un signal con los segundos que faltan. La vista se la pasa a `ActionError` (para el texto) y a `SubmitButton` (para deshabilitarse), así los dos cuentan con el mismo reloj.
4. Pasó a la decisión 2.
5. **`beforeunload`:** una función de `shared/forms` que recibe `hasUnsavedChanges` y registra el aviso nativo mientras el componente vive (con `DestroyRef`). Así cada formulario la usa con una línea, junto con la guarda.
6. **§6.6 de la arquitectura** dice "cuando se instale FullCalendar (`componentes`)", pero el mapa y §12 ponen `WeeklySchedule` en `grupos`. Se corrige el texto a `grupos`; no cambia ninguna decisión.
7. **`ContentState` y `V-09`:** con un `403` al cargar, navega a `/sin-permiso` con `skipLocationChange`, como dice §3.5. Usa el `Router` de Angular, no `core/`, así que respeta §2.3.

## Decisiones

1. **Catálogo de componentes permanente** (2026-11-27, decidido por el usuario): las piezas se revisan a mano en una página con datos de ejemplo que no pide sesión y a la que solo se llega escribiendo la dirección, sin enlaces desde la aplicación. No se borra al cerrar el módulo. La ruta es `/componentes` y está en todos los ambientes, también en producción: es solo para pruebas visuales y no muestra datos reales.
2. **Los validadores crecen por módulo** (2026-11-27, decidido por el usuario), como los clientes de `api/` en `nucleo` (supuesto 1 de `SPEC-nucleo`). `componentes` hace los que usan varios formularios y `limits.ts` completo (son datos de RUI-06). `periodoDates` (RN-16) y el validador del grupo según la modalidad, que usa un solo formulario cada uno, llegan con `catalogos` y `grupos`, junto con sus pruebas (la de RN-16 que pide §9 la hace `catalogos`).
3. **La confirmación ejecuta la acción** (2026-11-27, decidido por el usuario en T3). Como en el wireframe, la confirmación puede quedar abierta mientras se envía la acción ("Eliminando…", RUI-08) y, si la API la rechaza, mostrar el error con `ActionError` dentro de la ventana, con la acción alternativa de RUI-04 ("Desactivar curso" ante `409 RN-34`). Así el error queda junto a la acción (RUI-01). `confirm()` recibe la acción en `run` y la alternativa en `alternative`, opcionales; sin ellas, solo pregunta. Se construye en T6, junto con `ActionError`.

## Preguntas abiertas

Ninguna.
