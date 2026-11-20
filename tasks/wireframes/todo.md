# Tareas: wireframes

Entregable `wireframes` de la [fase 0](../../specs/fase-0.md). Spec: [SPEC-wireframes.md](../../specs/SPEC-wireframes.md).

| Estado de la lista | Avance |
|---|---|
| **Aprobada** | 8/8 tareas completadas: **entregable completado** (2026-11-20) |

**Historial:**
- 2026-11-19: v1 en revisión.
- 2026-11-19: v1 aprobada. T1 en progreso.
- 2026-11-19: T1 implementada, en revisión del usuario. Desviaciones del plan:
  - El marco (encabezado, menú por rol y menú de la cuenta) lo genera `wireframe.js` a partir de `data-wf-marco`, en lugar de copiarse en cada página. Así el menú de §2.3 vive en un solo lugar y las 38 páginas no repiten HTML. `verificar-enlaces.sh` revisa también las rutas del menú en el JS.
  - `verificar-enlaces.sh` separa las **vistas pendientes** (páginas `V-xx` de tareas posteriores, permitidas hasta T8) de los **enlaces rotos** (siempre un error). Con `--estricto`, también falla con vistas pendientes; se usa en T8.
  - Los archivos de las vistas se nombran `<area>/V-xx-<nombre-corto>.html`. Los 17 que enlaza el menú quedan fijados desde ya en `wireframe.js`, y las tareas siguientes usan esos nombres.
  - Verificación: sin enlaces rotos (17 vistas pendientes del menú); `node --check` sin errores; sin recursos externos; capturas con Edge sin interfaz en escritorio y en un marco de 360 px (sin desplazamiento horizontal) de los cinco marcos. Las interacciones con clic (ventanas, pestañas, menú plegable) quedan para la revisión del usuario en el navegador.
- 2026-11-19: ajuste pedido por el usuario en la revisión de T1: más espacio entre los grupos de vistas, las tablas y los encabezados del índice.
- 2026-11-19: T1 completada (aprobada por el usuario). T2 en progreso.
- 2026-11-19: T2 implementada, en revisión del usuario. `componentes.html` con los 11 componentes del punto 2 de la spec y sus variantes; estilos en las secciones 13 a 23 de `wireframe.css`, e interacciones nuevas en `wireframe.js` (mostrar contraseña, mensaje de éxito temporal, copiar código, envío en curso). Decisiones del boceto:
  - Las tablas pasan a tarjetas en celular solo con CSS: cada celda toma su rótulo de `data-etiqueta` y la celda principal (`wf-celda-principal`) encabeza la tarjeta.
  - La grilla del horario dibuja sus líneas con el fondo y solo posiciona días, horas y bloques; una fila son 30 minutos. Para lectores de pantalla y para celular se usa la lista por día, que lleva la misma información.
  - Las etiquetas de estado se distinguen por el texto y, como refuerzo, por el borde o el relleno (discontinuo, relleno, doble, gris, apagado, tachado).
  - El calendario usa la semana de lunes a domingo con las iniciales L K M J V S D. El selector de hora tiene minutos de 15 en 15 solo como boceto: el paso real lo fija `arquitectura`.
  - Verificación: sin enlaces rotos (21 vistas pendientes); `node --check` sin errores; sin recursos externos; capturas en escritorio y a 360 px. Se corrigieron, a 360 px, la altura del campo de búsqueda, el orden de la celda principal en las tarjetas y la paginación, y se cambió un ícono que se dibujaba como emoji a color.
- 2026-11-19: T2 completada (aprobada por el usuario). T3 en progreso.
- 2026-11-19: T3 implementada, en revisión del usuario. Vistas `V-01` a `V-10` en `publico/` y `cuenta/`, enlazadas en el índice, y los flujos "Acceso", "Registro y olvido" y "Sesión y permisos". Cambios en la base:
  - Recuadro de **simulación** (`.wf-simular`, no es parte del producto) para elegir el resultado de una acción y seguir el flujo; por ejemplo, con qué rol se inicia sesión.
  - `wireframe.js`: un enlace a la misma página con `#estado=…` cambia el estado sin recargar; los enlaces internos conservan el rol de "Ver como"; "Cerrar sesión" abre `V-01` con el aviso de sesión cerrada (RFF-04).
  - CSS: el contenido se centra en los marcos sin menú lateral; clase `wf-nowrap` para códigos y rangos de hora; las celdas de tabla ya no parten palabras.
  - Decisiones de las vistas: `V-01` usa el listado en tabla y tarjetas, con "Inicie sesión para matricular" por grupo para el visitante y la acción del estudiante como hueco para T7; `V-03` usa un marco mínimo, sin menú; `V-04` reemplaza el formulario por la respuesta única de RN-28; `V-07` muestra un aviso fijo con éxito (aviso al correo y cierre de las otras sesiones); `V-09` y `V-10` mantienen el marco del rol y enlazan a su inicio. Los textos de los mensajes de la API (registro, RN-21, RN-25, RF-09) son ilustrativos: la interfaz muestra el `detail`.
  - Verificación: sin enlaces rotos (17 vistas pendientes); `node --check` sin errores; sin recursos externos; capturas en escritorio y a 360 px de `V-01`, `V-02`, `V-03`, `V-05` y `V-06`.
- 2026-11-19: T3 completada (aprobada por el usuario). T4 en progreso.
- 2026-11-19: T4 implementada, en revisión del usuario. Vistas `V-11` a `V-19` en `admin/`, enlazadas en el índice, y el flujo "Gestión de una persona". Decisiones:
  - Mismo patrón para las tres entidades. Los detalles traen un estado "con rechazos" donde cada ventana muestra la respuesta de rechazo de la API: `RN-36` lleva a la pestaña "Matrículas", `RN-37` a "Grupos", `RN-34` ofrece "Desactivar en su lugar" y `RN-30` no ofrece enlace.
  - `V-16` tiene las pestañas Datos, Matrículas y Horario, y `V-19` Datos, Grupos y Horario (RFF-35, RFF-37), con huecos para T7. `V-13` no tiene pestañas ni "Eliminar" (RN-35).
  - "Ver historial de cambios" (RFF-40) en `V-13`, `V-16` y `V-19`, hacia `V-36` (T8).
  - `V-12` agrega el estado "Editar mis datos", desde `V-06`, que vuelve a Mi perfil. `V-13` agrega el estado "El administrador de la sesión", cuya desactivación avisa que la sesión termina y abre `V-02` con el aviso de RFF-03. Es una confirmación simple, como fija RUI-07.
  - "Reactivar" desde el registro de un administrador (RN-39) abre `V-11` filtrado por la cédula.
  - Datos de ejemplo: dos administradores más (uno inactivo) y un profesor inactivo.
  - `wireframe.js`: atributo `data-wf-pestana` para ir a una pestaña desde una ventana; abrir una ventana desde otra cierra la primera; cambiar el estado cierra la ventana abierta.
  - Verificación: sin enlaces rotos (12 vistas pendientes); `node --check` sin errores; sin recursos externos; capturas en escritorio y a 360 px de `V-12` a `V-16` y de las ventanas de rechazo.
- 2026-11-19: T4 completada (aprobada por el usuario). T5 en progreso.
- 2026-11-19: T5 implementada, en revisión del usuario. Vistas `V-20` a `V-27` en `compartidas/` y `admin/`, enlazadas en el índice, y el flujo "Catálogos". Decisiones:
  - `V-20` y `V-22` con "Ver como" administrador, estudiante y profesor; `V-25` y `V-27`, administrador y profesor (el estudiante no tiene acceso a aulas). Estudiante y profesor no ven acciones, "Incluir inactivos" ni la columna Estado, porque solo ven activos.
  - `V-22` no usa pestañas: los datos del curso arriba y los grupos debajo. El administrador filtra por periodo y estado; estudiante y profesor solo ven grupos `Abierto`, con un hueco para "Matricular" (T7).
  - `V-23` no tiene detalle: Editar, "Ver grupos" y Eliminar van en cada fila, y registrar o editar vuelven al listado. Sin desactivar (RF-37). "Ver grupos" abre `V-28#estado=periodo`: T6 debe dar a `V-28` ese estado (filtrado por periodo).
  - `V-24` valida las cuatro condiciones de RN-16 según la decisión 5 de `SPEC-catalogos` (la API): el límite de retiro va entre el inicio de la matrícula y el fin de clases, y no se exige que la matrícula termine antes de las clases.
  - `V-26` agrega el estado `409 RN-09` (capacidad menor que el cupo de los grupos del aula).
  - `V-27` dibuja la ocupación de B-201 con la grilla, solo para el administrador. `RN-37` lleva a la sección "Ocupación" del aula y a "Grupos" del curso.
  - `wireframe.js`: `data-wf-pestana` también lleva a una sección que no es pestaña.
  - Datos de ejemplo: el curso inactivo FRA-100 y el periodo 2027-I, sin grupos.
  - Verificación: sin enlaces rotos (10 vistas pendientes); `node --check` sin errores; sin recursos externos; capturas en escritorio de `V-22` (estudiante), `V-23`, `V-24` y `V-27`, y a 360 px de `V-20`, `V-23`, `V-24` y `V-27`.
- 2026-11-19: T5 completada (aprobada por el usuario). T6 en progreso.
- 2026-11-19: T6 implementada, en revisión del usuario. Vistas `V-28` a `V-30`, enlazadas en el índice, y el flujo "Grupos". Decisiones:
  - `V-28` empieza en el periodo vigente; sin vigente, en "Todos" con un aviso. Tiene el estado "Filtrado por un periodo", destino de "Ver grupos" en `V-23`. La búsqueda por NRC usa el parámetro `search` de `GET /grupos` (`SPEC-grupos`).
  - `V-29`: curso, profesor, periodo y aula con el selector con búsqueda (solo activos, RN-17); el aula desaparece en virtual; junto al cupo, la capacidad del aula. Estados para editar un grupo Planificado (todo editable) y uno Abierto (NRC, curso y periodo deshabilitados), y el traslape `409 RN-08` con el NRC con que choca.
  - `V-30`: todos los estados usan el grupo 1001, para comparar las acciones de RFF-26. Una acción de avance por estado, "Cancelar grupo" (reforzada, con las matrículas que se retiran) y "Editar" salvo en Finalizado y Cancelado. "Abrir grupo" deshabilitado sin horarios. Los horarios van en una tabla: agregar en todo estado salvo Finalizado y Cancelado, quitar solo en Planificado. El rechazo de agregar muestra `409 RN-07` con el NRC. `RN-34` al eliminar ofrece cancelar el grupo. `403 RN-18` muestra el aviso de `V-09`. Inscritos (administrador y profesor) y "Matricular" (estudiante) quedan como huecos para T7.
  - En las confirmaciones reforzadas de `V-30`, el botón para no actuar se llama "Volver", para no confundirlo con "Cancelar grupo".
  - CSS: los campos deshabilitados se ven con fondo gris y borde discontinuo. Etiquetas alineadas con el catálogo: "Vigente" en `V-23` sin relleno y "Abierto" en `V-22` relleno.
  - Verificación: sin enlaces rotos (6 vistas pendientes); `node --check` sin errores; sin recursos externos; capturas en escritorio de `V-28`, `V-29` (grupo Abierto), `V-30` (Planificado) y de las ventanas de agregar horario y cancelar, y a 360 px de `V-28`, `V-29` y `V-30` (administrador y estudiante).
- 2026-11-19: T6 completada (aprobada por el usuario). T7 en progreso.
- 2026-11-19: T7 implementada, en revisión del usuario. Vistas `V-31` a `V-35`, las secciones pendientes de `V-01`, `V-16`, `V-19`, `V-22` y `V-30`, y los flujos "Matrícula del estudiante", "Matrícula del administrador" y "Profesor". Decisiones:
  - JS: una ventana con `data-wf-abierta` se abre sola al cargar la página y al cambiar el estado o el rol. Se abre sin modo modal, con el fondo oscuro por CSS, para que la barra del wireframe siga usable. Además, `data-wf-pestana-inicial` elige una pestaña en ciertos estados (por ejemplo, Matrículas en `V-16` después de matricular).
  - Datos de muestra: se agregan los grupos 1007 (FOT-300, Ana, sábado de 9:00 a. m. a 12:00 p. m.) y 1008 (ING-101, Laura, viernes de 5:00 p. m. a 8:00 p. m.), para tener un grupo donde María puede matricularse, un caso RN-05 y un destino para el cambio de grupo. Están en el índice y en `V-28`.
  - `V-31`: barra del periodo con la fecha límite de retiro; pestañas Actuales (activas del periodo vigente, con Ver grupo, Cambiar de grupo y Retirarme) e Historial (con filtros, solo Ver grupo). Estados después de matricular, retirarse y cambiar de grupo, con su mensaje; el rechazo `RN-10` en la ventana de retiro.
  - `V-32` y `V-33` son páginas con la vista anfitriona de fondo y la ventana abierta. `V-32`: el estudiante ve el resumen y confirma; el administrador elige el grupo con el selector con búsqueda (todos los estados) y ve el aviso del supuesto 1 de `SPEC-matriculas`. Un estado por rechazo (RN-01 a RN-06 y `CONCURRENCIA` con "Intentar de nuevo"); RN-05 ofrece "Cambiar de grupo". `V-33`: grupo actual, destinos como opciones con horario, cupos y estado (sin cupo, deshabilitado), y el aviso de que el cambio se hace completo o no se hace.
  - `V-34`: grilla del componente 10 con "Ver como" Estudiante (aula y profesor) y Profesor (aula), más los estados sin periodo vigente y sin clases. `V-35`: la lista de grupos de Laura con el filtro de periodo; `V-19` reusa esa lista y la grilla.
  - `V-16`: la pestaña Matrículas tiene la lista del historial, con "Matricular" y, por matrícula activa, "Cambiar de grupo" y "Retirar" (simple, sin las restricciones de fecha y estado); la pestaña Horario tiene la grilla.
  - `V-30`: el estudiante ve "Ya matriculado" (María está en el 1001). La sección de inscritos tiene búsqueda y el filtro Activas, Retiradas o Todas; el administrador abre `V-16` y retira (estado "Después de retirar a un estudiante"), y el profesor solo consulta. `V-22` muestra "Ya matriculado" en el 1004; "Matricular" se ve en `V-01`.
  - Los textos de los rechazos son ilustrativos: el contrato fija el `code`, no el mensaje.
  - Verificación: sin enlaces rotos (solo quedan pendientes `V-36` y `V-37`); todos los `#estado` y `#rol` de los enlaces existen en su vista de destino; `node --check` sin errores; sin recursos externos; capturas en escritorio de `V-31`, `V-32` (administrador eligiendo el grupo), `V-33` (`CONCURRENCIA`) y `V-34` (profesor), y a 360 px de `V-31`, `V-32` (RN-05), `V-16` (Matrículas) y `V-30` (inscritos).
- 2026-11-19: T7 completada (aprobada por el usuario). T8 en progreso.
- 2026-11-19: T8 implementada, en revisión del usuario. Vistas `V-36` a `V-38`, el flujo "Sistema" y el índice final; se borró `compartidas/_marco.html`. Decisiones:
  - `V-36`: lista de registros que se expanden (no tabla), porque cada uno lleva su tabla de cambios: propiedad, valor anterior y nuevo en las modificaciones, y propiedad y valor en las creaciones y eliminaciones. La entidad es una lista fija (B-03, descartada en COR-01) y el id se habilita al elegirla. Sin autor se muestra "Sistema" (RN-45); `"***"` se muestra como "Valor protegido" (RN-44). Cada registro ofrece "Abrir registro" (si la entidad tiene vista; uno eliminado abre el detalle con el aviso de que no existe), "Ver los cambios de este autor" y "Ver toda la operación". Estados: historial de un registro (destino de todos los "Ver historial de cambios"), por operación, operación sin cambios, por autor, filtro inválido (`400` en su campo), sin resultados, cargando y error.
  - `V-37`: el código de error va primero en los filtros y acepta el código completo o sus 32 caracteres. El origen `Peticion` se muestra como "Solicitud" y un usuario sin sesión como "Sin sesión". Estados: buscado por código, código inválido, sin errores, sin resultados, cargando y error.
  - `V-38`: los datos y debajo el detalle técnico en texto de ancho fijo con su propio desplazamiento, con "Copiar código" y "Copiar detalle" (única excepción de RUI-05). "Ver cambios de esta operación" abre `V-36` por operación: un `500` no deja cambios (estado "Operación sin cambios") y un correo fallido sí puede tenerlos (la creación de Luis Diego). Un error depurado o inexistente (`404`) lo indica.
  - Pie de página, pedido por el usuario en la revisión de T8: se agrega RUI-23 a `docs/requerimientos.md` (§5.6) y el pie al marco de todas las vistas en `wireframe.js` ("Sistema de Matrícula · [Nombre del instituto] · © 2026" y "Versión 0.1.0"; el nombre del instituto queda entre corchetes hasta definirlo). Queda al final de la ventana aunque la vista sea corta, sin quedar fijo; en celular se apila. `componentes.html` no lo lleva porque no tiene marco.
  - Ancho del contenido, pedido por el usuario en la revisión de T8: el contenido ocupa todo el ancho disponible, con 24 px a cada lado, con o sin menú lateral (antes tenía un máximo de 1100 px y en pantallas anchas sobraba espacio; en `V-01` y `V-05`, a los dos lados). Los formularios también usan todo el ancho: sus campos van en dos columnas, y en cuatro cuando el formulario mide 1300 px o más (con una consulta de contenedor, así no depende de si hay menú). Siempre un número par de columnas, para que los pares de campos no queden separados; en celular, una. Se descartó limitarlos a un ancho fijo. Las vistas de un formulario corto o un mensaje (`wf-vista-angosta`: `V-02` a `V-04`, `V-09` y `V-10`) pasan de 460 a 700 px, centradas, a pedido del usuario. `V-07` y `V-08` dejan de ser angostas (cambio del usuario) y usan todo el ancho, como los demás formularios.
  - Filtros, pedido por el usuario en la revisión de T8: se acomodan en una rejilla de cuatro columnas como máximo (por ejemplo, los seis de `V-28` en una fila de cuatro y otra de dos); con menos de cuatro se reparten el ancho, bajan a tres o dos en pantallas más angostas y a una en celular. Se alinean arriba, para que una ayuda bajo un campo no desacomode la fila, y la casilla "Incluir inactivos" baja lo que mide una etiqueta para quedar al nivel de los campos.
  - `V-36`, pedido por el usuario en la revisión de T8: la cabecera de la lista usa el estilo de las tablas y va dentro del mismo marco que los registros; el marcador de expandir queda centrado en la altura de la fila.
  - `V-16`, pedido por el usuario en la revisión de T8: en la pestaña Matrículas, "Matricular" va arriba de los filtros, a la derecha, y los filtros ocupan todo el ancho.
  - CSS: los selectores de la barra del wireframe se acortan para no desbordar a 360 px; los nombres de tipos y rutas se cortan en los puntos y barras.
  - Verificación de la spec:

    | Qué | Resultado |
    |---|---|
    | Cobertura de vistas | 38 páginas `V-*.html`; el índice enlaza las 38, el catálogo de componentes y los 10 flujos |
    | Contenido de cada vista | Cada vista muestra los datos y acciones de su `RFF`; no queda ninguna sección pendiente (sin `wf-hueco`) |
    | Variantes por rol | Las vistas compartidas tienen "Ver como": `V-01`, `V-06`, `V-07`, `V-09`, `V-10`, `V-20`, `V-22`, `V-25`, `V-27`, `V-30` y `V-32` a `V-34` |
    | Estados | Los listados y vistas con datos tienen Cargando, Vacío y Error; los 14 estados especiales del punto 7 aparecen (revisados uno por uno) |
    | Confirmaciones | Las acciones de RUI-07 abren su ventana: reforzada para eliminar y cancelar un grupo; simple para el resto |
    | Flujos | `verificar-enlaces.sh --estricto` sin enlaces rotos ni vistas pendientes; todos los `#estado` y `#rol` enlazados existen en su destino |
    | Celular | Revisión automática a 360 px de las 38 vistas, en cada estado y rol: ninguna con desplazamiento horizontal |
    | Formatos y textos | `dd/mm/aaaa`, `6:30 p. m.`, `₡25 000,00`, trato de usted |
    | Anotaciones | Cada vista tiene sus notas con `RFF`, `RUI`, endpoints y decisiones |
    | Sin dependencias | Ningún `<script>` ni `<link>` externo; `node --check` del JS sin errores |
- 2026-11-20: T8 completada (aprobada por el usuario, con los ajustes de la revisión). Entregable completado: 8/8 tareas.

## Plan

**Enfoque:** primero la base y los componentes, después las vistas por área, en el mismo orden que §3 de `docs/requerimientos.md`. Así cada vista se arma con piezas ya revisadas y no inventa variantes propias. Cada tarea de vistas dibuja juntas las vistas de un área, con sus estados, sus variantes por rol y sus notas, porque comparten patrón (por ejemplo, listado, formulario y detalle de las personas).

**Fuentes por tarea:** la sección de `docs/requerimientos.md` que cita cada tarea (§3 para el catálogo y los endpoints, §4 para el contenido de cada vista, §5 para los componentes y estados). Solo se consulta la spec del backend si un `RFF` remite a ella para un dato que hay que mostrar.

**Orden y dependencias:** T1 → T2 → T3 → T4 → T5 → T6 → T7 → T8. Es secuencial:
- T1 y T2 son la base de todo.
- T4 dibuja `V-16` y `V-19` con un hueco marcado para sus secciones de matrícula, grupos y horario, que completa T7 (como hizo `requerimientos` con §3.7).
- T6 (`V-30`) va antes de T7, porque la matrícula, los inscritos y las grillas enlazan al detalle del grupo.

**Enlaces a vistas pendientes:** una vista puede enlazar a otra que todavía no existe si esta es de una tarea posterior. `verificar-enlaces.sh` lista esos enlaces rotos, y cada tarea revisa que todos apunten a vistas de tareas posteriores. Al terminar T8 no queda ninguno.

**Tamaño de las tareas:** las tareas de vistas tocan más de cinco archivos (hasta 10 páginas en T3 y 9 en T4). Se aceptan así porque las páginas de un área siguen el mismo patrón, son cortas y se revisan juntas. Partirlas daría tareas de una o dos páginas sin un corte con sentido.

**Riesgos:**
- *Vistas inconsistentes entre sí.* Mitigación: el catálogo de componentes (T2) se aprueba antes de dibujar vistas, y las vistas solo usan sus clases.
- *Repetir el marco en 38 páginas.* Sin build no hay plantillas, así que el marco (encabezado y menú por rol) se copia en cada página. Mitigación: `wireframe.js` marca la opción activa del menú y el rol del marco desde atributos `data-wf-*`, de modo que el HTML copiado es idéntico entre páginas del mismo rol.
- *Descubrir huecos en los requerimientos al dibujar.* Mitigación: cada tarea anota en su historial lo que encuentra y pregunta antes de cambiar `docs/requerimientos.md` (Boundaries de la spec).
- *Datos de ejemplo incoherentes.* Mitigación: se fijan en T1 y cada tarea toma de ahí nombres, NRC, horarios y cupos.

**Puntos de control:** al terminar cada tarea, el usuario abre las páginas nuevas en el navegador y las revisa. Al terminar T8, revisa el entregable completo con la tabla de verificación de la spec.

## Estado de las tareas

| Tarea | Estado | Revisión del usuario | Commit |
|---|---|---|---|
| T1 Base: estilos, interacciones, marco, datos de ejemplo e índice | Completada | Aprobada | `4cdb2c1`, `f65bbf5` |
| T2 Catálogo de componentes | Completada | Aprobada | `4cdb2c1`, `f65bbf5` |
| T3 Vistas: acceso, cuenta, oferta y páginas del sistema | Completada | Aprobada | `4cdb2c1`, `f65bbf5` |
| T4 Vistas: personas | Completada | Aprobada | `4cdb2c1`, `f65bbf5` |
| T5 Vistas: catálogos (cursos, periodos y aulas) | Completada | Aprobada | `4cdb2c1`, `f65bbf5` |
| T6 Vistas: grupos y horarios | Completada | Aprobada | `4cdb2c1`, `f65bbf5` |
| T7 Vistas: matrícula, horarios y grupos del profesor | Completada | Aprobada | `4cdb2c1`, `f65bbf5` |
| T8 Auditoría y errores, índice final y verificación | Completada | Aprobada | `4cdb2c1`, `f65bbf5` |

**Estados de una tarea:** Pendiente · En progreso · Implementada (hecha, falta la revisión del usuario) · Bloqueada · Completada.
**Commit:** uno solo al terminar todas las tareas del entregable (supuesto 6 de la spec); al hacerlo se anota su hash en todas las filas. Quedaron dos: `4cdb2c1` (el entregable, hecho por el usuario antes de los últimos ajustes) y `f65bbf5` (los ajustes de la revisión de T8 y el cierre).

## Tareas

- [x] **T1 Base: estilos, interacciones, marco, datos de ejemplo e índice**
  - Acceptance:
    - `css/wireframe.css`: escala de grises, fuente del sistema, foco visible, retícula y adaptación a pantallas angostas desde 360 px.
    - `js/wireframe.js`: barra del wireframe (id y nombre de la vista, enlace al índice, "Estado", "Ver como" y "Notas") construida a partir de atributos `data-wf-*` de la página; abrir y cerrar ventanas (con el foco al abrir y devolverlo al cerrar); pestañas; menú plegable en celular; opción activa del menú.
    - Marco del visitante y marco con sesión para los tres roles, con el menú de §2.3 y el menú de la cuenta.
    - `index.html`: las 38 vistas agrupadas por rol según §2.3 (las aún no dibujadas, sin enlace y marcadas como pendientes), espacio para los flujos, y la sección "Datos de ejemplo" con el conjunto del supuesto 4 de la spec.
    - `verificar-enlaces.sh`: lista los enlaces internos (`href` y `src`) que apuntan a archivos inexistentes.
    - Una página de muestra (`compartidas/_marco.html`, que se borra en T8) con el marco de cada rol y la barra funcionando.
  - Verify: abrir `index.html` y la página de muestra con doble clic en Chrome o Edge; la barra alterna estados y roles; a 360 px no hay desplazamiento horizontal y el menú se pliega; `bash docs/wireframes/verificar-enlaces.sh` no reporta nada; ningún recurso externo.
  - Files: `docs/wireframes/css/wireframe.css`, `docs/wireframes/js/wireframe.js`, `docs/wireframes/index.html`, `docs/wireframes/verificar-enlaces.sh`, `docs/wireframes/compartidas/_marco.html`

- [x] **T2 Catálogo de componentes**
  - Acceptance: `componentes.html` muestra cada componente de la tabla del punto 2 de la spec con todas sus variantes: listado paginado (tabla y tarjetas), búsqueda y filtros, formulario (obligatorio, error por campo, errores generales, envío en curso, contraseña con "mostrar"), selectores de fecha y hora de 12 horas, selector con búsqueda, confirmación simple y reforzada, mensajes (éxito, aviso fijo, error de acción, `409` con acción, `429`, `500` con `traceId`, sin conexión), estados de contenido, etiquetas de estado y la grilla semanal (grilla, lista por día, sin periodo vigente, vacía). Cada componente cita su `RUI` o `RFF`.
  - Verify: cada fila del punto 2 de la spec tiene su ejemplo; las ventanas abren y cierran con teclado; a 360 px la tabla pasa a tarjetas y la grilla a lista por día; formatos de §5.4 y etiquetas de RUI-19.
  - Files: `docs/wireframes/componentes.html`, `docs/wireframes/css/wireframe.css`, `docs/wireframes/js/wireframe.js`, `docs/wireframes/index.html`

- [x] **T3 Vistas: acceso, cuenta, oferta y páginas del sistema**
  - Acceptance: `V-01` a `V-10` (§3.1 a §3.3; RFF-01 a RFF-10). Incluye:
    - `V-01` con "Ver como" Visitante y Estudiante (la acción "Matricular" y la marca "Ya matriculado" quedan como hueco para T7) y el estado "sin periodo vigente".
    - `V-02` con credenciales inválidas, `403 RN-29`, `429` y el aviso de sesión terminada (RFF-03).
    - `V-03` sin menú, solo con cerrar sesión (RN-24); `V-04` con su respuesta única; `V-05` con `409 RN-21` y sus enlaces.
    - `V-06` con las variantes por rol; `V-07` con el error en el campo (`RF-09`, `RN-25`); `V-08` con cambios sin guardar (RUI-09).
    - `V-09` y `V-10`.
    - Flujos "Acceso" y "Registro y olvido" del punto 6 de la spec, y sus enlaces en el índice.
  - Verify: cada vista muestra lo que pide su `RFF` y sus notas coinciden con §3; los dos flujos se recorren con clics; `verificar-enlaces.sh` solo reporta enlaces a vistas de tareas posteriores; revisión a 360 px.
  - Files: `docs/wireframes/publico/` (`V-01` a `V-05`, `V-09`, `V-10`), `docs/wireframes/cuenta/` (`V-06` a `V-08`), `docs/wireframes/index.html`

- [x] **T4 Vistas: personas**
  - Acceptance: `V-11` a `V-19` (§3.4; RFF-11 a RFF-17), con el mismo patrón para las tres entidades:
    - Listados con búsqueda, "Incluir inactivos", paginación y los estados de RUI-13.
    - Formularios en modo registro y edición, con validación por campo, la confirmación del cambio de correo (RFF-13) y `409 RN-39` con "Reactivar".
    - Detalles con las acciones según la entidad y su estado: reenviar temporal, desactivar, reactivar, eliminar (no para administradores); aviso fijo de `correoEnviado: false`; `409 RN-30`, `RN-34`, `RN-36` y `RN-37` con su acción o enlace; registro inexistente (`404`).
    - `V-16` y `V-19` con un hueco marcado para sus secciones de matrícula, grupos y horario (T7).
    - Flujo "Gestión de una persona", y la sección "Personas" del índice.
  - Verify: las acciones de cada entidad coinciden con RFF-14 a RFF-17; cada acción abre la confirmación del tipo que fija RUI-07; el flujo se recorre con clics; enlaces rotos solo hacia tareas posteriores; revisión a 360 px.
  - Files: `docs/wireframes/admin/` (`V-11` a `V-19`), `docs/wireframes/index.html`

- [x] **T5 Vistas: catálogos (cursos, periodos y aulas)**
  - Acceptance: `V-20` a `V-27` (§3.5; RFF-18 a RFF-22):
    - `V-20`, `V-22`, `V-25` y `V-27` con "Ver como" (el administrador ve las acciones; los demás roles, solo la consulta).
    - `V-22` con los grupos del curso según RN-18 (la acción "Matricular" del estudiante queda como hueco para T7).
    - `V-23` con el periodo vigente destacado y sus acciones; `V-24` con las cinco fechas (RN-16).
    - `V-27` con la sección "Ocupación" usando la grilla semanal, solo para el administrador.
    - Formularios con `409 RN-39`; detalles con `409 RN-34` y `RN-37`.
    - Flujo "Catálogos", y la sección del índice.
  - Verify: los permisos de cada vista coinciden con la columna "Rol(es)" de §3.5 (por ejemplo, aulas sin acceso para el estudiante); el flujo se recorre con clics; enlaces rotos solo hacia tareas posteriores; revisión a 360 px.
  - Files: `docs/wireframes/compartidas/` (`V-20`, `V-22`, `V-25`, `V-27`), `docs/wireframes/admin/` (`V-21`, `V-23`, `V-24`, `V-26`), `docs/wireframes/index.html`

- [x] **T6 Vistas: grupos y horarios**
  - Acceptance: `V-28` a `V-30` (§3.6; RFF-23 a RFF-28):
    - `V-28` filtrado por el periodo vigente, con los filtros de RFF-23.
    - `V-29` en modo crear y editar, con los campos editables según el estado del grupo, el aula según la modalidad y el traslape (`RN-07`, `RN-08`) mostrando el NRC con que choca.
    - `V-30` con "Ver como" Administrador, Profesor del grupo y Estudiante (RN-18); con "Estado" para cada estado del grupo, que muestra las acciones que le corresponden (RFF-26); gestión de bloques de horario con su traslape (`RN-14`); cancelación y eliminación con confirmación reforzada y `409 RN-34`. La sección de inscritos y la acción "Matricular" quedan como hueco para T7.
    - Flujo "Grupos", y la sección del índice.
  - Verify: las acciones por estado coinciden con RFF-26 y la edición por estado con RFF-24; las variantes por rol coinciden con RFF-25; el flujo se recorre con clics; enlaces rotos solo hacia tareas posteriores; revisión a 360 px.
  - Files: `docs/wireframes/admin/` (`V-28`, `V-29`), `docs/wireframes/compartidas/V-30-grupo.html`, `docs/wireframes/index.html`

- [x] **T7 Vistas: matrícula, horarios y grupos del profesor**
  - Acceptance: `V-31` a `V-35` (§3.7; RFF-30 a RFF-38) y los huecos dejados en las tareas anteriores:
    - `V-31` con sus pestañas (actuales e historial), retiro y cambio de grupo.
    - `V-32` como ventana, en sus dos variantes: estudiante (sobre `V-01`, con el resumen) y administrador (sobre `V-16`, con el buscador de grupo y el aviso de que no aplican las restricciones de estado y fechas). Con los rechazos RN-01 a RN-06 y `409 CONCURRENCIA` con "Intentar de nuevo".
    - `V-33` como ventana, con la elección del grupo destino (RF-53) y sus rechazos.
    - `V-34` con "Ver como" Estudiante y Profesor, usando la grilla; `V-35` con el filtro por periodo.
    - Secciones agregadas: "Matricular" y "Ya matriculado" en `V-01`, "Matricular" en `V-22` y `V-30`, matrículas y horario en `V-16`, grupos y horario en `V-19`, inscritos en `V-30` (RFF-38).
    - Flujos "Matrícula del estudiante", "Matrícula del administrador" y "Profesor", y la sección del índice.
  - Verify: cada consulta de §3.7 tiene su vista o sección; los tres flujos se recorren con clics; las confirmaciones de matricular, retirar y cambiar de grupo son simples (RUI-07); enlaces rotos solo hacia `V-36` a `V-38`; revisión a 360 px.
  - Files: `docs/wireframes/estudiante/V-31-mis-matriculas.html`, `docs/wireframes/compartidas/` (`V-32`, `V-33`, `V-34`, y los cambios en `V-22`, `V-30`), `docs/wireframes/profesor/V-35-mis-grupos.html`, `docs/wireframes/publico/V-01-oferta.html`, `docs/wireframes/admin/` (`V-16`, `V-19`), `docs/wireframes/index.html`

- [x] **T8 Auditoría y errores, índice final y verificación**
  - Acceptance:
    - `V-36` con sus filtros (RFF-39), el autor `null` como "Sistema" y el enlace al registro auditado (RFF-40); `V-37` con la búsqueda por `traceId`; `V-38` con el detalle técnico (única excepción de RUI-05).
    - Índice completo: las 38 vistas enlazadas, los 10 flujos del punto 6 de la spec y el enlace al catálogo de componentes.
    - Se borra `compartidas/_marco.html`.
    - La tabla de verificación de la spec, completa, en el historial de esta lista.
  - Verify: `ls docs/wireframes/*/V-*.html | wc -l` da 38; `verificar-enlaces.sh` no reporta nada; cada estado especial del punto 7 de la spec aparece donde corresponde; ningún recurso externo (`grep -r "http" docs/wireframes --include=*.html` solo encuentra textos de ejemplo, no `src` ni `href`); revisión a 360 px de todas las vistas.
  - Files: `docs/wireframes/admin/` (`V-36` a `V-38`), `docs/wireframes/index.html`, `docs/wireframes/compartidas/_marco.html` (se borra), `specs/SPEC-wireframes.md` y `specs/fase-0.md` (estados), esta lista
