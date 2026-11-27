# Plan: componentes

Módulo `componentes` del [mapa](../../specs/mapa-modulos.md). Spec: [`specs/SPEC-componentes.md`](../../specs/SPEC-componentes.md) · Tareas: [`todo.md`](todo.md)

**Estado del plan:** Aprobado (2026-11-27)

## Enfoque

Primero el catálogo de componentes, vacío, para que cada tarea siguiente agregue la sección de lo que construye y se revise contra `componentes.html` en el momento, no todo al final. Después, lo que no depende de nada (la lógica de formularios), los servicios que otras piezas usan (`ConfirmService`, que necesita `unsavedChangesGuard`) y, por último, los componentes más grandes (errores, listados, selección).

La lógica pura (validadores, `applyServerErrors`, la cuenta regresiva del `429`, la guarda) se escribe con las pruebas primero: sus casos están fijados en §3.5, §5 y §9 de la arquitectura. Los componentes se prueban con un componente anfitrión de prueba (para el contenido proyectado y los `input()`), y se revisan a mano en el catálogo.

Cada tarea termina con:
- `pnpm lint`, `pnpm test --watch=false` y `pnpm build` en verde;
- su sección en el catálogo, revisada contra `componentes.html` en escritorio y a 360 px (salvo T2, que no tiene nada visible);
- un commit en la rama `componentes` (decisión 5 del mapa).

## El catálogo de componentes (decisión 1)

- **Dónde:** `core/pages/component-catalog/`. Es una página que existe una sola vez, como `V-09` y `V-10`, y `core/` puede importar `shared/` (§2.3). No es un área: no entra en la lista de áreas de ESLint ni en el menú.
- **Ruta:** `/componentes` en `app.routes.ts`, con `loadChildren` a `component-catalog.routes.ts`, que registra `provideMaterialDefaults()` en sus `providers`. Así ni la página ni las opciones de Material entran en la carga inicial (§2.5, §6.1). Sin guarda: se abre con o sin sesión, dentro del layout.
- **Contenido:** las 11 secciones de `componentes.html`, en su orden y con sus títulos, salen de una sola lista (`catalog-sections.ts`) que arma el índice y las secciones. El contenido de cada sección es un `@case` del `@switch` de la plantilla, y cada tarea agrega el suyo (con un componente de ejemplo en `examples/` si es largo). Las que no tienen contenido dicen dónde se construyen; la 10, "Llega con el módulo grupos". Los datos de ejemplo son los del wireframe (María Fernanda Quesada, ING-101…) y viven en la carpeta del catálogo, no en `src/testing/`.
- **Errores de ejemplo:** las secciones de errores construyen `ApiError` a mano, sin llamar a la API.

## Componentes y orden

| # | Componente | Depende de | Notas |
|---|---|---|---|
| 1 | **Catálogo de componentes:** la ruta `/componentes`, la página con las secciones vacías, y los documentos (§6.6 de la arquitectura, el catálogo en §2.2 y §2.4, el mapa) | — | Desde aquí cada tarea tiene dónde mostrarse |
| 2 | **Lógica de formularios:** `limits.ts`, validadores, `messages.ts`, `applyServerErrors`, `focusFirstError` | — | Pura, pruebas primero. Sin sección en el catálogo |
| 3 | **Mensajes y confirmaciones:** `NotificationService`, `Banner`, `ConfirmService` y su ventana | — | Cierra la verificación heredada de los 5 s |
| 4 | **Cambios sin guardar:** `HasUnsavedChanges`, `unsavedChangesGuard` y el aviso de `beforeunload` | 3 | En el catálogo, un formulario de ejemplo con la guarda en su ruta hija |
| 5 | **Controles de formulario:** `FieldError`, `FormErrors`, `SubmitButton`, `PasswordField` | 2 | Sección 3 del catálogo, con el formulario completo de ejemplo |
| 6 | **`ActionError`** y la cuenta regresiva del `429` | 2, 5 | La pieza con más casos (§3.5). `SubmitButton` recibe la espera |
| 7 | **`ContentState`** | 6 | Usa el texto del `500` y de la falta de respuesta de T6 |
| 8 | **Listados:** `StatusBadge`, `PaginatedList`, `FilterBar` | 7 | `PaginatedList` usa `ContentState` dentro del ejemplo del catálogo, no dentro de sí |
| 9 | **Detalle y selección:** `DetailHeader`, `SearchSelect` | 8 | `DetailHeader` usa `StatusBadge` |
| 10 | **Cierre:** revisión completa del catálogo, Lighthouse, `pnpm audit`, versión `0.3.0` y criterios de éxito | 1 a 9 | Deja el PR listo |

Nada se hace en paralelo: el proyecto lo construye una sola persona.

## Riesgos y mitigación

| Riesgo | Mitigación |
|---|---|
| La ruta del catálogo mete `provideMaterialDefaults()` o Material en la carga inicial | `loadChildren` a un archivo de rutas propio, que es el único que importa `material-defaults.ts`. Se mira el tamaño del build en T1 y en cada tarea (en `main`, 440,91 kB después de la corrección `sesiones`; con T1, 444,02 kB) |
| `NotificationService` o `ConfirmService` en `providedIn: 'root'` meten `MatSnackBar` o `MatDialog` en la carga inicial | Nada de la carga inicial los importa: solo los usan vistas diferidas y `unsavedChangesGuard`, que se usa en rutas diferidas. Se revisa el build en T3 y T4 |
| El presupuesto `anyComponentStyle` (aviso en 4 kB) se supera en `PaginatedList` o `ActionError` | Estilos con las variables `--sm-*` y las clases de Material; lo común (tonos de estado) en `src/styles/`. Se mira el aviso del build en cada tarea |
| `PaginatedList`: declarar las columnas una sola vez para la tabla y las tarjetas | Columnas como plantillas proyectadas (una directiva `smColumn` con nombre, rótulo y si es la principal), que la tabla y las tarjetas recorren. Se fija en T8 con una prueba en cada modo |
| `ContentState` necesita distinguir la primera carga de las recargas, y `httpResource` no lo dice directamente | Recuerda si ya tuvo un valor (`hasValue()` alguna vez) con un signal propio. Prueba con un recurso simulado que pasa de cargando a valor y otra vez a cargando |
| `SearchSelect` como control de formulario (`ControlValueAccessor`) con texto mostrado distinto del valor guardado | `displayWith` de `mat-autocomplete` y una entrada para el texto del valor inicial. Pruebas con `fakeAsync` o el reloj de Vitest para el retardo |
| La cuenta regresiva del `429` depende del reloj | El `CLOCK` de `core/session/` no se puede usar desde `shared/`. La función usa `setInterval` y se prueba con los temporizadores falsos de Vitest |
| La carga inicial crece aunque las piezas sean diferidas: si una pieza usa una exportación de un módulo que ya está en la carga inicial (`button`, la CDK), el build la deja ahí (T3: 9 kB) | Se mide en cada tarea con `ng build --stats-json`. Margen hasta la meta de 500 kB: 47 kB después de T3. Si se acerca, se revisa qué pieza lo causa antes de seguir |
| Una pieza necesita un ícono que no está en `public/icons/` | Se pregunta antes de copiarlo (Boundaries de la spec) |

## Puntos de verificación

- **Después de T1:** `/componentes` abre sin sesión, muestra las 11 secciones vacías, ningún enlace de la aplicación lleva a ella y la carga inicial no crece.
- **Después de T4:** el formulario de ejemplo pregunta "¿Descartar los cambios?" al salir y no pregunta después de guardar.
- **Después de T7:** las piezas de errores muestran cada fila de §3.5 en el catálogo.
- **Después de T10:** se cumplen los 9 criterios de éxito de la spec, y el usuario revisa el catálogo completo.

## Fuera de este plan

- Lo que la spec deja fuera: `WeeklySchedule` y `PeriodoSelect` (`grupos`), los validadores de un solo formulario (decisión 2) y las acciones concretas de RUI-04 de cada vista.
- Firefox y Safari, heredados por `sistema`.
