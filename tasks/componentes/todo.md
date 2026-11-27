# Tareas: componentes

Módulo `componentes` del [mapa](../../specs/mapa-modulos.md). Spec: [`specs/SPEC-componentes.md`](../../specs/SPEC-componentes.md) · Plan: [`plan.md`](plan.md)

**Estado de la lista:** Aprobada (2026-11-27)

Cada tarea termina con:
- `pnpm lint`, `pnpm test --watch=false` y `pnpm build` en verde;
- la verificación indicada;
- un solo commit en la rama `componentes`, con el código y la actualización de este archivo, la spec y el mapa. En la tabla se marca ✅, sin el hash.

## Estado

| Tarea | Estado | Código | Pruebas unitarias | Verificación manual | Commit |
|---|---|:---:|:---:|:---:|:---:|
| T1. Catálogo de componentes | Completada | ✅ | ✅ | ✅ | ✅ |
| T2. Lógica de formularios | Pendiente | ⬜ | ⬜ | ➖ | ⬜ |
| T3. Mensajes y confirmaciones | Pendiente | ⬜ | ⬜ | ⬜ | ⬜ |
| T4. Cambios sin guardar | Pendiente | ⬜ | ⬜ | ⬜ | ⬜ |
| T5. Controles de formulario | Pendiente | ⬜ | ⬜ | ⬜ | ⬜ |
| T6. `ActionError` | Pendiente | ⬜ | ⬜ | ⬜ | ⬜ |
| T7. `ContentState` | Pendiente | ⬜ | ⬜ | ⬜ | ⬜ |
| T8. Listados | Pendiente | ⬜ | ⬜ | ⬜ | ⬜ |
| T9. Detalle y selección | Pendiente | ⬜ | ⬜ | ⬜ | ⬜ |
| T10. Cierre | Pendiente | ⬜ | ➖ | ⬜ | ⬜ |

**Estados de tarea:**
- **Pendiente:** no se ha empezado.
- **En progreso:** se está trabajando en ella.
- **Implementada:** el código está hecho, pero falta alguna columna o la revisión del usuario.
- **Bloqueada:** no puede avanzar; se indica el motivo debajo de la tabla.
- **Completada:** todas las columnas en ✅, ➖ o ⏳.

**Columnas:** ✅ hecho · ⬜ pendiente · ➖ no aplica · ⏳ parte diferida a otro módulo (anotada en sus tareas)

## Verificaciones heredadas

Copiadas del [mapa](../../specs/mapa-modulos.md) al crear esta lista:

| Origen | Verificación | Tarea |
|---|---|---|
| `nucleo` | `NotificationService.success()` fija la duración de 5 s en cada aviso: el token global `MAT_SNACK_BAR_DEFAULT_OPTIONS` salió de la raíz por la carga inicial | T3 |
| `arquitectura` §8.3 | Lighthouse al cerrar: carga inicial de 500 kB o menos sin comprimir y LCP menor a 2,5 s, con el perfil de escritorio y el build de producción, sobre `dist/` servido como estático con compresión | T10 |

## Detalle

### T1. Catálogo de componentes
- Acceptance:
  - `/componentes` en `app.routes.ts`, antes de `**`, con `loadChildren` a `core/pages/component-catalog/component-catalog.routes.ts`, que registra `provideMaterialDefaults()`. Sin guarda y con el título "Catálogo de componentes · Sistema de Matrícula".
  - `ComponentCatalog`: título, una nota de que es una página de pruebas visuales, un índice con enlaces a las secciones y las 11 secciones de `componentes.html` con su título y sus RUI, desde una sola lista (`catalog-sections.ts`). Cada sección sin contenido dice dónde se construye; la 10, con el módulo `grupos`.
  - Ninguna opción del menú ni enlace de la aplicación lleva a `/componentes` (`nav-items.ts` sin cambios).
  - Documentos:
    - `docs/arquitectura.md`: §6.6 ("cuando se instale FullCalendar (`grupos`)"); el catálogo en §2.2 (`core/pages/`) y en la tabla de §2.4 (fila `core/pages`); §9 (cada pieza nueva de `shared/ui` tiene su sección en el catálogo).
    - Mapa: la decisión 1 de la spec en sus decisiones aprobadas (el catálogo como lugar de revisión visual para los módulos siguientes).
- Verify:
  - Prueba: la ruta `/componentes` carga sin sesión y con sesión (sin pasar por `authGuard`).
  - `pnpm build`: la carga inicial no crece (438,60 kB) y aparece un chunk diferido del catálogo.
  - A mano: `/componentes` abre sin sesión dentro del layout del visitante, con el índice y las secciones.
- Files: `src/app/app.routes.ts` (+ `.spec.ts`), `src/app/core/pages/component-catalog/` (página, rutas, lista de secciones y `.spec.ts`), `docs/arquitectura.md`, `specs/mapa-modulos.md`
- **Resultado (2026-11-27):**
  - El índice salta a la sección sin pasar por el router: un `href="#…"` navegaría a la raíz por el `<base href="/">`, y activar el desplazamiento a anclas del router cambiaría `app.config.ts` para toda la aplicación.
  - La primera importación de las rutas del catálogo (con las opciones de Material y date-fns) tarda unos 6 s en frío en Vitest; la prueba de rutas la precarga en un `beforeAll`.
  - Build: la carga inicial pasa de 440,91 kB (`main`, después de la corrección `sesiones`; `nucleo` cerró en 438,60 kB) a 444,02 kB. Los 3 kB son la entrada de la ruta y la división en un chunk compartido, sin código de Material nuevo. El catálogo y las opciones de Material van en chunks diferidos (`component-catalog-routes`, 57,72 kB).
  - Documentos: §2.2, §2.4, §6.6 y §9 de la arquitectura, y la decisión 7 del mapa.
  - `pnpm format:check`, `pnpm lint`, `pnpm test --watch=false` (22 archivos, 255 pruebas) y `pnpm build` en verde.

### T2. Lógica de formularios
- Acceptance:
  - `shared/forms/limits.ts`: todos los límites de RUI-06 y §5.2 (cédula, nombre, apellidos, especialidad, teléfono, correo, contraseña, dirección, fechas, curso, aula, periodo, grupo), cada grupo con el comentario del validador del backend del que sale.
  - `shared/forms/validators.ts`: `passwordPolicy` (RN-26), `fieldsMatch(a, b)` (RN-25, de grupo), `notFutureDate` (hoy en `America/Costa_Rica`), `minDate(fecha)`, `greaterThan(n)` y `endAfterStart(inicio, fin)` (RN-15, de grupo), con los patrones de cédula y teléfono como constantes. Cada uno devuelve un error con nombre y deja lo vacío a `required`.
  - `shared/forms/messages.ts`: mensaje con trato de usted para cada error propio y de Angular (`required`, `maxlength` con el límite, `email`, `pattern` por campo, `min`) y para `server` (el texto que trae).
  - `shared/forms/server-errors.ts`: `applyServerErrors(form, error, codeFields?)` según §5.3; devuelve los mensajes sin campo.
  - `shared/forms/focus-first-error.ts`: `focusFirstError(element)`.
  - Datos de prueba en `src/testing/`: un `ApiError` de cada tipo de §3.5 (`400` con `errors`, `403`, `404`, `409` con `code`, `429`, `500`, `status: 0`).
- Verify:
  - Pruebas de los validadores en el borde: 20 y 21 caracteres de cédula, cédula con un carácter fuera del patrón, teléfono de 7, 8, 20 y 21 caracteres, nombre de 100 y 101, la política de RN-26 (sin mayúscula, sin número, 7 caracteres, 128 y 129), `fieldsMatch`, `notFutureDate` con hoy y mañana en Costa Rica, `minDate` con 1899-12-31 y 1900-01-01, `greaterThan(0)` con 0 y 1, y el bloque de RN-15 con fin igual y posterior al inicio.
  - Pruebas de `applyServerErrors`: `Cedula` ↔ `cedula`, `Horarios.HoraFin` en un grupo anidado, un mensaje sin campo devuelto, el mapa `RF-09` → `contrasenaActual`, y los valores escritos sin cambios.
  - Prueba de `focusFirstError` con un formulario de dos campos inválidos.
- Files: `src/app/shared/forms/limits.ts`, `validators.ts`, `messages.ts`, `server-errors.ts`, `focus-first-error.ts` (con sus `.spec.ts`), `src/testing/api-errors.ts`

### T3. Mensajes y confirmaciones
- Acceptance:
  - `shared/ui/notification-service.ts`: `success(mensaje)` con `duration: 5000` en cada llamada y `politeness: 'polite'`; sin botón de cerrar.
  - `shared/ui/banner/`: `Banner` con `tone` (`warning`, `info`, `success`, `error`) y los colores de §6.6, ícono decorativo, contenido proyectado y `closable` con `output()` `closed`. `role="status"` (o `alert` con `tone="error"`).
  - `shared/ui/confirm-service.ts` y `confirm-dialog/`: `confirm({ title, message, action, irreversible })` → `Promise<boolean>`. Botones "Cancelar" y `action` (el principal en acento; en la irreversible, destacado en tono de error, con la nota "Esta acción no se puede deshacer"). `autoFocus` en "Cancelar" si es irreversible, en el botón de la acción si no. Cerrar con Escape da `false`.
  - Sección 6 (confirmaciones simple y reforzada) y sección 7 (éxito y aviso fijo) del catálogo, con botones que abren cada una.
- Verify:
  - Pruebas: la duración de 5 s y la cortesía del aviso; `Banner` con cada tono y el cierre; `ConfirmService` con el texto de la acción en el botón, `true` al confirmar, `false` al cancelar y con Escape, y el foco inicial en "Cancelar" en la irreversible.
  - `pnpm build`: la carga inicial no crece.
  - A mano en el catálogo, contra las secciones 6 y 7 del wireframe: el aviso desaparece a los 5 s; las ventanas con el teclado, el foco inicial y el foco devuelto al botón que las abrió.
- Files: `src/app/shared/ui/notification-service.ts`, `banner/`, `confirm-service.ts`, `confirm-dialog/` (con sus `.spec.ts`), secciones 6 y 7 del catálogo

### T4. Cambios sin guardar
- Acceptance:
  - `core/guards/unsaved-changes-guard.ts`: la interfaz `HasUnsavedChanges` y `unsavedChangesGuard` (`CanDeactivateFn<HasUnsavedChanges>`). Sin cambios, deja salir. Con cambios, `ConfirmService.confirm()` con el texto de la ventana "¿Descartar los cambios?" del wireframe (acción "Descartar cambios"). Con `SessionService.ended()`, deja salir sin preguntar (RFF-03).
  - `shared/forms/before-unload.ts`: una función que, llamada en el constructor del formulario con `() => this.hasUnsavedChanges()`, activa el aviso nativo de `beforeunload` mientras haya cambios y se quita con `DestroyRef`.
  - En el catálogo, sección 3: un formulario de ejemplo en una ruta hija (`/componentes/formulario`) con la guarda y `beforeunload`, y "Guardar" que llama a `markAsPristine()`.
- Verify:
  - Pruebas: la guarda sin cambios, con cambios (confirma y cancela) y con la sesión terminada; `beforeunload` con y sin cambios, y que se quita al destruir el componente.
  - A mano: escribir en el formulario de ejemplo y salir pregunta; después de guardar no pregunta; recargar la pestaña con cambios muestra el aviso del navegador.
- Files: `src/app/core/guards/unsaved-changes-guard.ts` (+ `.spec.ts`), `src/app/shared/forms/before-unload.ts` (+ `.spec.ts`), el formulario de ejemplo y su ruta en el catálogo

### T5. Controles de formulario
- Acceptance:
  - `shared/forms/field-error/`: `FieldError` (`sm-field-error`, dentro de `mat-error`) recibe el control y muestra el mensaje de su primer error con `messages.ts`.
  - `shared/forms/form-errors/`: `FormErrors` recibe los mensajes sin campo y los muestra arriba del formulario, en tono de error, con `role="alert"`. No dibuja nada si no hay mensajes.
  - `shared/ui/submit-button/`: `SubmitButton` (botón principal, `type="submit"`) con `submitting` y `waitSeconds` (la espera del `429`, T6): deshabilitado y con indicador de trabajo mientras envía, deshabilitado mientras espera. Texto proyectado.
  - `shared/ui/password-field/`: `PasswordField` como `ControlValueAccessor` dentro de `mat-form-field`, con `mat-label` proyectado, `autocomplete` configurable (`current-password`, `new-password`) y el botón "Mostrar"/"Ocultar" (`aria-label`, `aria-pressed`, íconos `visibility` y `visibility-off`).
  - El formulario de ejemplo de T4 pasa a usar estas piezas y queda como la sección 3 del wireframe: datos personales con los validadores de T2, contraseña nueva y confirmación, y "Guardar" con `SubmitButton`. Un botón "Simular error 400" aplica `applyServerErrors` con el `ApiError` de ejemplo.
- Verify:
  - Pruebas: `FieldError` con `required`, `maxlength` y `server`; `FormErrors` vacío y con mensajes; `SubmitButton` deshabilitado al enviar y al esperar, con el indicador; `PasswordField` cambia el tipo del campo y escribe el valor en el control.
  - A mano, contra la sección 3 del wireframe: los errores aparecen al salir del campo o al enviar, no al escribir; el error del servidor en su campo y el sin campo arriba; el foco al primer campo con error al enviar; "Mostrar" con el teclado.
- Files: `src/app/shared/forms/field-error/`, `form-errors/`, `src/app/shared/ui/submit-button/`, `password-field/` (con sus `.spec.ts`), la sección 3 del catálogo

### T6. `ActionError`
- Acceptance:
  - `shared/forms/retry-countdown.ts`: a partir de un signal con el `ApiError` (o `null`), un signal con los segundos que faltan del `429` (`retryAfter`), que baja de a uno y llega a 0. Sin `429` o sin `retryAfter`, 0.
  - `shared/ui/action-error/`: `ActionError` (`role="alert"`) con `error` (`ApiError | null`) y `waitSeconds`, y los `output()` `retry` (sin respuesta) y `retryConcurrency` (`CONCURRENCIA`):
    - `403`, `404`, `409` y `code` desconocido: el `detail`, y el contenido proyectado (las acciones de RUI-04 de la vista). `CONCURRENCIA` agrega "Intentar de nuevo".
    - `429`: "Demasiados intentos. Intente de nuevo en N segundos" mientras `waitSeconds` > 0; sin `retryAfter`, el `detail`.
    - `500`: "Ocurrió un error inesperado. Si el problema continúa, reporte este código: `<traceId>`" con "Copiar" (`Clipboard`), que confirma con "Copiado".
    - `status: 0`: "No se pudo conectar con el servidor. Revise su conexión e intente de nuevo" con "Reintentar".
    - `400`: no dibuja nada (lo muestran los campos y `FormErrors`).
    - Nunca muestra `message`. Sin `detail` en un `403`/`409`, un texto genérico ("No se pudo completar la acción").
  - Sección 7 del catálogo, "Error de una acción", "409 con acción adicional" y "Respuestas con texto fijo": cada caso con un botón que lo simula, y el `429` con `SubmitButton` deshabilitado durante la cuenta regresiva.
- Verify:
  - Pruebas de `retryCountdown` con temporizadores falsos (de 3 a 0, y un `429` nuevo que reinicia).
  - Pruebas de `ActionError`, una por fila de §3.5 de las acciones, más el contenido proyectado en un `409 RN-39`, `CONCURRENCIA` con su `output()`, "Copiar" con el `traceId`, y que `message` nunca aparece.
  - A mano, contra la sección 7 del wireframe.
- Files: `src/app/shared/forms/retry-countdown.ts` (+ `.spec.ts`), `src/app/shared/ui/action-error/` (+ `.spec.ts`), la sección 7 del catálogo

### T7. `ContentState`
- Acceptance:
  - `shared/ui/content-state/`: `ContentState` con `resource` (un `Resource<T>`, como el de `httpResource`), `filtered` (si hay filtros aplicados) y los `output()` `retry` y `clearFilters`. Una función `isEmpty` opcional para decidir el vacío (por defecto, `items` vacío o arreglo vacío).
    - Cargando la primera vez: indicador (`mat-progress-spinner`) en el lugar del contenido. En las recargas, el contenido con una `mat-progress-bar` arriba.
    - Vacío sin filtros: el contenido proyectado con `smEmpty` (mensaje y acción de crear de la vista).
    - Vacío con filtros: "No hay resultados para los filtros aplicados" y "Limpiar filtros".
    - `404`: el contenido proyectado con `smNotFound` (mensaje y enlace al listado).
    - `403` sin `code` o con `RN-18`: navega a `/sin-permiso` con `skipLocationChange`.
    - `500` y sin respuesta: los textos de T6 con "Reintentar" (por defecto, `resource.reload()`).
    - Con datos: el contenido principal proyectado.
  - Sección 8 del catálogo: cada estado, con un recurso de ejemplo que se cambia con botones.
- Verify:
  - Pruebas: cada estado con un recurso simulado, la recarga que conserva el contenido, el `403` que navega a `/sin-permiso` sin cambiar la dirección, y "Reintentar" y "Limpiar filtros".
  - A mano, contra la sección 8 del wireframe.
- Files: `src/app/shared/ui/content-state/` (+ `.spec.ts`), la sección 8 del catálogo

### T8. Listados
- Acceptance:
  - `shared/ui/status-badge/`: `StatusBadge` con `kind` (`estadoGrupo`, `estadoMatricula`, `activo`, `marca`) y `value`. El texto sale de `labels.ts` (RUI-19) o de las marcas ("Activo", "Inactivo", "Vigente", "Ya matriculado", "Sin cupo", "Sistema"); el tono y el refuerzo (discontinuo, relleno, doble, apagado, tachado) son los de §6.6 y del wireframe. Un valor desconocido, en tono neutro con su texto.
  - `shared/ui/paginated-list/`: `PaginatedList` con `page` (`Page<T>`), las columnas como plantillas proyectadas (`smColumn` con nombre, rótulo y `primary`), `rowLink` opcional (función a la ruta del detalle) y el `output()` `pageChange` (`page`, `pageSize`). `mat-table` desde 600 px y tarjetas por debajo (`BreakpointObserver`), con la columna principal como encabezado de la tarjeta. `mat-paginator` con 10, 20 y 50 y el `MatPaginatorIntl` de `fundacion`.
  - `shared/ui/filter-bar/`: `FilterBar` con `search` (el valor aplicado), `showInactive` (si muestra la casilla), `inactive`, `filtered` y los filtros proyectados; `output()` `searchChange`, `inactiveChange` y `clear`. La búsqueda se aplica con Enter o "Buscar"; "Limpiar filtros" solo con `filtered`. Se apila en pantallas angostas.
  - Secciones 1, 2 y 9 del catálogo: un listado de ejemplo (en memoria) con su barra de filtros, su estado de contenido y sus etiquetas, con el estado en la URL (`?search=&page=&pageSize=&incluirInactivos=`), como lo hará una vista (§3.4).
- Verify:
  - Pruebas: `StatusBadge` con cada estado y un valor desconocido; `PaginatedList` en tabla y en tarjetas, el rango y `pageChange`; `FilterBar` con Enter y "Buscar", que no avisa mientras se escribe, la casilla y "Limpiar filtros" solo con filtros.
  - A mano, contra las secciones 1, 2 y 9 del wireframe, en escritorio y a 360 px (tarjetas, sin desplazamiento horizontal). Recargar y volver atrás conservan los filtros y la página.
- Files: `src/app/shared/ui/status-badge/`, `paginated-list/`, `filter-bar/` (con sus `.spec.ts`), las secciones 1, 2 y 9 del catálogo

### T9. Detalle y selección
- Acceptance:
  - `shared/ui/detail-header/`: `DetailHeader` con `title`, `subtitle` opcional, el estado (`StatusBadge` proyectado o por `input()`) y las acciones proyectadas. Se apila en pantallas angostas.
  - `shared/ui/search-select/`: `SearchSelect` como `ControlValueAccessor` sobre `mat-autocomplete`, con `search` (`(texto: string) => Observable<SearchOption[]>`, `SearchOption` = `{ id, text }`), `initialText` y `mat-label` proyectado. Sugiere con 300 ms de retardo y hasta 10 opciones, guarda el `id` y muestra el `text`; si se borra el texto, el valor queda `null`. Mensaje "Sin resultados" cuando la búsqueda no trae nada.
  - Sección 11 del catálogo (encabezado con estado y acciones, y `mat-tab-group` con la pestaña en `?pestana=`) y sección 5 (un selector con una búsqueda en memoria con retardo simulado). La sección 4 (fecha y hora) muestra `mat-datepicker` y `mat-timepicker` con `AppDateAdapter`, sin pieza propia.
- Verify:
  - Pruebas: `DetailHeader` con título, estado y acciones; `SearchSelect` con el retardo, el tope de 10, la opción elegida que guarda el id, el valor inicial con su texto y el borrado a `null`.
  - A mano, contra las secciones 4, 5 y 11 del wireframe, con el teclado (flechas y Enter en el selector).
- Files: `src/app/shared/ui/detail-header/`, `search-select/` (con sus `.spec.ts`), las secciones 4, 5 y 11 del catálogo

### T10. Cierre
- Acceptance:
  - Revisión completa del catálogo contra `componentes.html`, en escritorio y a 360 px, con el teclado, en Chrome, Edge y Brave.
  - Lighthouse (verificación heredada), perfil de escritorio, sobre `dist/` servido como estático con compresión.
  - Versión `0.3.0` en `package.json`.
  - Comando de cierre y `pnpm audit` sin hallazgos altos ni críticos (o anotados).
  - Spec, mapa y este archivo al día: módulo completado y criterios de éxito revisados. En el mapa se quitan las verificaciones heredadas cumplidas.
- Verify: los 9 criterios de éxito de la spec, y la revisión del catálogo por el usuario.
- Files: `package.json`, `tasks/componentes/todo.md`, `specs/SPEC-componentes.md`, `specs/mapa-modulos.md`

## Historial

- 2026-11-27: lista en revisión.
- 2026-11-27: lista aprobada por el usuario. Empieza T1.
- 2026-11-27: T1 completada, revisada por el usuario.
