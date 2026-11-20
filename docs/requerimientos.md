# Sistema de Matrícula — Requerimientos del frontend

> **Estado:** aprobado (2026-11-17). Modificado el 2026-11-19: se agrega RUI-23 (pie de página), pedido durante los wireframes. Spec: [SPEC-requerimientos.md](../specs/SPEC-requerimientos.md) · Tareas: [tasks/requerimientos/todo.md](../tasks/requerimientos/todo.md).

Este documento define qué hace el frontend (SPA) del sistema de matrícula. Las reglas de negocio, los datos y los permisos ya están definidos e implementados en la API, y aquí **se citan, no se repiten**: `RF-xx` y `RN-xx` se refieren a los [requerimientos del backend](../../sistema-matricula-api/docs/requerimientos.md). Los códigos propios del frontend son:

| Prefijo | Significado |
|---|---|
| `V-xx` | Vista (pantalla) del frontend |
| `RFF-xx` | Requerimiento funcional del frontend |
| `RUI-xx` | Regla de interfaz, transversal a todas las vistas |

---

## 1. Descripción general

### 1.1 Propósito
Ofrecer a cada tipo de usuario del instituto una aplicación web para usar el sistema de matrícula: consultar la oferta, registrarse, matricular cursos y consultar el horario (estudiantes); consultar los grupos asignados y sus estudiantes (profesores), y gestionar los datos académicos, las personas y la matrícula (administradores).

### 1.2 Relación con la API
- El frontend es un cliente de la API REST del backend (`../sistema-matricula-api`), versión `v1`. En desarrollo, la URL base es `http://localhost:5022/api/v1`.
- La API es la fuente de verdad del contrato y de las reglas:
  - Requerimientos y reglas: `docs/requerimientos.md` del backend (RF-01…RF-59, RN-01…RN-49).
  - Endpoints, datos y códigos de error de cada módulo: `specs/SPEC-<modulo>.md` del backend.
  - Contrato técnico: el documento OpenAPI en `/openapi/v1.json`.
- La API valida todas las reglas. El frontend puede anticipar algunas para orientar al usuario (por ejemplo, ocultar una acción que el estado del grupo no permite), pero **nunca las reemplaza**: lo que decide es la respuesta de la API.
- El frontend no modifica la API. Lo que necesite y la API no ofrezca se registra en la sección 8 (brechas).

### 1.3 Alcance
**Incluido:**
- Una sola aplicación web para los cuatro roles del backend, con vistas y menú según el rol.
- Las vistas públicas: oferta académica, inicio de sesión, registro público de estudiantes y olvido de contraseña.
- Los flujos de acceso: cambio obligatorio de contraseña, cambio de contraseña propio, cierre de sesión y sesión vencida.
- El perfil propio y la edición de los datos de contacto del estudiante.
- La gestión del administrador: administradores, estudiantes, profesores, cursos, periodos, aulas, grupos y horarios, con sus altas, ediciones, desactivaciones, reactivaciones y eliminaciones.
- La matrícula, el retiro y el cambio de grupo, por el estudiante y por el administrador.
- Las consultas de la sección 6 del backend: listados, historial de matrículas, horarios semanales, grupos y estudiantes de un grupo, ocupación de aulas.
- La consulta de la auditoría y del registro de errores (administrador).
- Una aplicación adaptable a distintos tamaños de pantalla, desde 360 px de ancho.

**Fuera del alcance de esta versión** (posibles mejoras futuras):
- Exportar listados a Excel o PDF, e imprimir el horario: la API no tiene endpoints de exportación.
- Modo oscuro.
- Notificaciones en tiempo real, por ejemplo cuando se libera un cupo: la API no las ofrece.
- Aviso antes de que venza la sesión y renovación automática del token: la API no tiene refresh token.
- Varios idiomas: el sistema es solo en español.
- Estadísticas o tableros con indicadores: los reportes estadísticos están fuera del alcance del backend.
- Todo lo que el backend deja fuera de su alcance (§1.3 de sus requerimientos): calificaciones, prerrequisitos, lista de espera, pagos, asistencia, certificados, etc.

---

## 2. Roles y navegación

### 2.1 Roles
Los roles son los del backend (§2 de sus requerimientos): **Visitante** (sin sesión), **Estudiante**, **Profesor** y **Administrador**. Sus permisos son los de la matriz §2.2 del backend. Cada cuenta tiene un único rol (RN-31), así que el frontend no ofrece cambiar de rol.

El rol y la necesidad de cambiar la contraseña se conocen al iniciar sesión (respuesta del login: `rol` y `debeCambiarContrasena`).

### 2.2 Página de inicio por rol

| Rol | Página de inicio | Por qué |
|---|---|---|
| Visitante | Oferta académica | Es lo único que puede consultar sin sesión (RF-50), y desde ahí inicia sesión o se registra |
| Estudiante | Mis matrículas, con las del periodo vigente | Su tarea principal es matricular y revisar lo matriculado |
| Profesor | Mis grupos, con los del periodo vigente | Su tarea principal es consultar sus grupos y estudiantes |
| Administrador | Grupos del periodo vigente | Es el centro de la gestión académica. No hay un tablero con indicadores (ver §1.3) |

### 2.3 Menú por rol

Las vistas concretas, con sus ids, se definen en la sección 3. El menú solo muestra lo que el rol puede usar.

| Rol | Menú principal |
|---|---|
| Visitante | Oferta académica · Iniciar sesión · Registrarse |
| Estudiante | Mis matrículas (incluye el historial) · Mi horario · Oferta académica · Cursos |
| Profesor | Mis grupos · Mi horario · Oferta académica · Cursos · Aulas |
| Administrador | **Académico:** Grupos · Cursos · Periodos · Aulas · Oferta académica<br>**Personas:** Estudiantes · Profesores · Administradores<br>**Sistema:** Auditoría · Errores |

- **Menú de la cuenta** (cualquier rol con sesión): Mi perfil · Cambiar contraseña · Cerrar sesión. Muestra el nombre y el rol de quien inició sesión.
- La matrícula del administrador no tiene una entrada propia: se hace desde el detalle del estudiante (matricular, retirar, cambiar de grupo), y los inscritos se consultan desde el detalle del grupo.
- El estudiante y el profesor consultan los periodos dentro de los filtros de sus vistas, sin una entrada de menú propia.

### 2.4 Rutas públicas y protegidas
- **Públicas:** oferta académica, inicio de sesión, registro público y olvido de contraseña. Son las únicas que la API permite sin sesión (§7 de los requerimientos del backend).
- **Protegidas:** todas las demás. Requieren una sesión iniciada y el rol que corresponda.

### 2.5 Acceso a las vistas

| Situación | Comportamiento |
|---|---|
| Sin sesión, entra a una vista protegida | Va al inicio de sesión. Después de iniciar sesión, vuelve a la vista que pidió si su rol puede usarla; si no, va a su página de inicio |
| Con sesión, entra al inicio de sesión, al registro o al olvido | Va a su página de inicio |
| Con un cambio de contraseña pendiente (RN-24) | Solo puede usar el cambio obligatorio y cerrar sesión. Cualquier otra vista lo lleva al cambio obligatorio |
| Con sesión, entra a una vista de otro rol | Ve una página de "sin permiso" con un enlace a su página de inicio. El menú nunca le ofrece esas vistas |
| La sesión vence o se invalida mientras usa la aplicación (la API responde `401`) | Se le avisa que la sesión terminó y va al inicio de sesión. Después de iniciar sesión, vuelve a la vista donde estaba |
| La dirección no corresponde a ninguna vista | Página de "no encontrada" con un enlace a su página de inicio |
| El registro que pide no existe (la API responde `404`) | La vista muestra que el registro no existe, con un enlace al listado correspondiente |

La sesión puede invalidarse sin que venza: al cerrar sesión en otro dispositivo, al cambiar la contraseña o al ser desactivada la cuenta (§7 de la arquitectura del backend). En todos los casos el frontend lo detecta por el `401` y aplica la misma regla.

---

## 3. Catálogo de vistas

Cada vista tiene un id estable `V-xx`, que usan los wireframes (`docs/wireframes/`) y los módulos de implementación. Una vista puede mostrarse como página o como ventana sobre otra vista; eso lo deciden los wireframes. Los endpoints son relativos a `/api/v1`. El comportamiento de cada vista se detalla en el `RFF` indicado.

### 3.1 Acceso y cuenta

| Id | Vista | Rol(es) | Propósito | Endpoints | Backend | RFF |
|---|---|---|---|---|---|---|
| `V-02` | Inicio de sesión | Visitante | Ingresar con correo y contraseña | `POST /auth/login` | RF-06, RF-07, RF-11, RN-24, RN-29 | RFF-01 |
| `V-03` | Cambio obligatorio de contraseña | Cualquiera con cambio pendiente | Definir la contraseña tras ingresar con una temporal | `POST /auth/cambio-obligatorio`, `POST /auth/logout` | RF-07, RN-24, RN-25, RN-26, RN-33 | RFF-02 |
| `V-04` | Olvido de contraseña | Visitante | Pedir una contraseña temporal por correo | `POST /auth/olvido-contrasena` | RF-10, RF-11, RN-28, RN-32 | RFF-05 |
| `V-05` | Registro de estudiante | Visitante | Crear su cuenta de estudiante | `POST /estudiantes/registro` | RF-01, RN-19, RN-21, RN-26 | RFF-06 |
| `V-06` | Mi perfil | Estudiante, Profesor, Administrador | Consultar sus datos de cuenta y personales | `GET /me` | RF-13 | RFF-08 |
| `V-07` | Cambiar contraseña | Estudiante, Profesor, Administrador | Cambiar su contraseña | `POST /auth/cambiar-contrasena` | RF-09, RN-25, RN-26, RN-33 | RFF-09 |
| `V-08` | Editar mis datos de contacto | Estudiante | Cambiar su teléfono y dirección | `PUT /me/datos-contacto` | Matriz §2.2 | RFF-10 |

El cierre de sesión (RFF-04) no es una vista: es una acción del menú de la cuenta y de `V-03`.

### 3.2 Oferta académica

| Id | Vista | Rol(es) | Propósito | Endpoints | Backend | RFF |
|---|---|---|---|---|---|---|
| `V-01` | Oferta académica | Todos, incluido el visitante | Ver los grupos abiertos del periodo vigente y sus cupos disponibles | `GET /oferta-academica`, `GET /periodos/vigente` | RF-38, RF-50, consulta 9 | RFF-07 |

### 3.3 Páginas del sistema

| Id | Vista | Rol(es) | Propósito | Endpoints | Backend | RFF |
|---|---|---|---|---|---|---|
| `V-09` | Sin permiso | Cualquiera con sesión | Avisar que su rol no puede usar la vista que pidió (§2.5) | — | RN-18, matriz §2.2 | — |
| `V-10` | Página no encontrada | Todos | Avisar que la dirección no existe (§2.5) | — | — | — |

### 3.4 Administración: personas

Solo para el administrador. Las tres entidades siguen el mismo patrón: listado, formulario (registro y edición) y detalle con las acciones sobre la cuenta.

| Id | Vista | Rol(es) | Propósito | Endpoints | Backend | RFF |
|---|---|---|---|---|---|---|
| `V-11` | Administradores | Administrador | Buscar y listar administradores | `GET /administradores` | RF-55, RN-41 | RFF-11 |
| `V-12` | Registrar o editar administrador | Administrador | Registrar un administrador o editar sus datos | `POST /administradores`, `PUT /administradores/{id}`, `POST /usuarios/{id}/reactivar` (RN-39) | RF-04, RF-05, RF-55, RN-13, RN-20, RN-22, RN-31, RN-39 | RFF-12, RFF-13 |
| `V-13` | Detalle de administrador | Administrador | Consultar un administrador y gestionar su cuenta | `GET /administradores/{id}`, `POST /usuarios/{id}/reenviar-temporal`, `POST /usuarios/{id}/desactivar`, `POST /usuarios/{id}/reactivar` | RF-12, RF-14, RF-55, RN-29, RN-30, RN-35 | RFF-14 a RFF-16 |
| `V-14` | Estudiantes | Administrador | Buscar y listar estudiantes | `GET /estudiantes` | RF-16, RN-41, consulta 1 | RFF-11 |
| `V-15` | Registrar o editar estudiante | Administrador | Registrar un estudiante con una temporal o editar sus datos | `POST /estudiantes`, `PUT /estudiantes/{id}`, `POST /estudiantes/{id}/reactivar` (RN-39) | RF-02, RF-05, RF-18, RN-13, RN-22, RN-31, RN-39 | RFF-12, RFF-13 |
| `V-16` | Detalle de estudiante | Administrador | Consultar un estudiante, gestionar su cuenta y su matrícula | `GET /estudiantes/{id}`, `POST /usuarios/{id}/reenviar-temporal`, `POST /estudiantes/{id}/desactivar`, `POST /estudiantes/{id}/reactivar`, `DELETE /estudiantes/{id}` | RF-12, RF-17, RF-19, RN-34, RN-35, RN-36, RN-38 | RFF-14 a RFF-17 |
| `V-17` | Profesores | Administrador | Buscar y listar profesores | `GET /profesores` | RF-23, RN-41 | RFF-11 |
| `V-18` | Registrar o editar profesor | Administrador | Registrar un profesor con una temporal o editar sus datos | `POST /profesores`, `PUT /profesores/{id}`, `POST /profesores/{id}/reactivar` (RN-39) | RF-03, RF-05, RF-22, RF-25, RN-13, RN-20, RN-22, RN-31, RN-39 | RFF-12, RFF-13 |
| `V-19` | Detalle de profesor | Administrador | Consultar un profesor, gestionar su cuenta y ver sus grupos | `GET /profesores/{id}`, `POST /usuarios/{id}/reenviar-temporal`, `POST /profesores/{id}/desactivar`, `POST /profesores/{id}/reactivar`, `DELETE /profesores/{id}` | RF-12, RF-24, RF-26, RN-34, RN-35, RN-37, RN-38 | RFF-14 a RFF-17 |

Las secciones de matrícula y horario de `V-16`, y de grupos y horario de `V-19`, se definen con la matrícula y las consultas (§3.7: RFF-35 y RFF-37).

### 3.5 Catálogos: cursos, periodos y aulas

| Id | Vista | Rol(es) | Propósito | Endpoints | Backend | RFF |
|---|---|---|---|---|---|---|
| `V-20` | Cursos | Todos con sesión | Buscar y listar cursos | `GET /cursos` | RF-30, RN-41 | RFF-18 |
| `V-21` | Registrar o editar curso | Administrador | Registrar un curso o editar sus datos | `POST /cursos`, `PUT /cursos/{id}`, `GET /cursos/{id}`, `POST /cursos/{id}/reactivar` (RN-39) | RF-29, RF-32, RN-13, RN-39 | RFF-19 |
| `V-22` | Detalle de curso | Todos con sesión | Consultar un curso y sus grupos | `GET /cursos/{id}`, `GET /cursos/{id}/grupos`, `POST /cursos/{id}/desactivar`, `POST /cursos/{id}/reactivar`, `DELETE /cursos/{id}` | RF-31, RF-33, RF-34, RN-18, RN-34, RN-37, consulta 4 | RFF-20 |
| `V-23` | Periodos | Administrador | Listar los periodos y gestionarlos | `GET /periodos`, `GET /periodos/vigente`, `DELETE /periodos/{id}` | RF-36, RF-37, RF-38, RN-34 | RFF-21 |
| `V-24` | Registrar o editar periodo | Administrador | Registrar un periodo o editar sus fechas | `POST /periodos`, `PUT /periodos/{id}`, `GET /periodos/{id}` | RF-35, RF-36, RN-13, RN-16 | RFF-21 |
| `V-25` | Aulas | Administrador, Profesor | Buscar y listar aulas | `GET /aulas` | RF-40, RN-41 | RFF-18 |
| `V-26` | Registrar o editar aula | Administrador | Registrar un aula o editar sus datos | `POST /aulas`, `PUT /aulas/{id}`, `GET /aulas/{id}`, `POST /aulas/{id}/reactivar` (RN-39) | RF-39, RF-40, RN-09, RN-13, RN-39 | RFF-19 |
| `V-27` | Detalle de aula | Administrador, Profesor | Consultar un aula y, el administrador, su ocupación | `GET /aulas/{id}`, `GET /aulas/{id}/ocupacion`, `POST /aulas/{id}/desactivar`, `POST /aulas/{id}/reactivar`, `DELETE /aulas/{id}` | RF-40, RF-41, RN-34, RN-37, consulta 8 | RFF-22 |

Los periodos no tienen una vista de detalle: el listado muestra todas sus fechas y sus acciones (RFF-21).

### 3.6 Grupos y horarios

| Id | Vista | Rol(es) | Propósito | Endpoints | Backend | RFF |
|---|---|---|---|---|---|---|
| `V-28` | Grupos | Administrador | Buscar y listar los grupos. Es la página de inicio del administrador | `GET /grupos`, `GET /periodos/vigente` | RF-43 | RFF-23 |
| `V-29` | Registrar o editar grupo | Administrador | Crear un grupo o editar sus datos según su estado | `POST /grupos`, `PUT /grupos/{id}`, `GET /grupos/{id}`; para los selectores, `GET /cursos`, `GET /profesores`, `GET /periodos`, `GET /aulas` | RF-42, RF-45, RN-07, RN-08, RN-09, RN-13, RN-17 | RFF-24 |
| `V-30` | Detalle de grupo | Todos con sesión, según RN-18 | Consultar un grupo, sus horarios y cupos; el administrador gestiona su estado y sus horarios | `GET /grupos/{id}`, `POST /grupos/{id}/estado`, `POST /grupos/{id}/horarios`, `DELETE /grupos/{id}/horarios/{horarioId}`, `DELETE /grupos/{id}` | RF-44, RF-46, RF-47, RF-48, RN-06, RN-07, RN-08, RN-12, RN-14, RN-15, RN-18, RN-34 | RFF-25 a RFF-28 |

La lista de estudiantes inscritos de `V-30` se define con la matrícula (§3.7, RFF-38). La grilla del horario semanal (RFF-29) se define aquí porque la usa la ocupación del aula, y la reutilizan los horarios de §3.7.

### 3.7 Matrícula, horarios y grupos del profesor

| Id | Vista | Rol(es) | Propósito | Endpoints | Backend | RFF |
|---|---|---|---|---|---|---|
| `V-31` | Mis matrículas | Estudiante | Ver sus matrículas actuales y su historial; retirarse o cambiar de grupo. Es su página de inicio | `GET /me/matriculas`, `GET /periodos/vigente`, `POST /matriculas/{id}/retiro` | RF-20, RF-52, RF-54, RN-10, RN-11, RN-18, consultas 2 y 10 | RFF-32, RFF-33 |
| `V-32` | Matricular en un grupo | Estudiante, Administrador | Confirmar la matrícula de un estudiante en un grupo | `POST /me/matriculas` (estudiante), `POST /matriculas` (administrador); para elegir el grupo, `GET /grupos` | RF-51, RN-01…RN-06, RN-11 | RFF-30, RFF-31 |
| `V-33` | Cambiar de grupo | Estudiante, Administrador | Mover una matrícula a otro grupo del mismo curso y periodo | `POST /matriculas/{id}/cambio-grupo`; para elegir el destino, `GET /cursos/{id}/grupos` | RF-53, RN-02…RN-06, RN-10, RN-11 | RFF-34 |
| `V-34` | Mi horario | Estudiante, Profesor | Ver su horario semanal | `GET /me/horario`, `GET /periodos` | RF-21, RF-28, consultas 6 y 7 | RFF-36 |
| `V-35` | Mis grupos | Profesor | Ver sus grupos asignados. Es su página de inicio | `GET /me/grupos`, `GET /periodos/vigente` | RF-27, RN-18, consulta 5 | RFF-37 |

Secciones que esta área agrega a vistas anteriores:

| Vista | Sección | Endpoints | RFF |
|---|---|---|---|
| `V-01` Oferta académica | Acción "Matricular" del estudiante y marca "Ya matriculado" | `GET /me/matriculas` | RFF-30 |
| `V-16` Detalle de estudiante | Matrículas (con matricular, retirar y cambiar de grupo) y horario | `GET /estudiantes/{id}/matriculas`, `GET /estudiantes/{id}/horario`, `POST /matriculas/{id}/retiro` | RFF-31, RFF-35 |
| `V-19` Detalle de profesor | Grupos y horario | `GET /profesores/{id}/grupos`, `GET /profesores/{id}/horario` | RFF-37 |
| `V-22` Detalle de curso y `V-30` Detalle de grupo | Acción "Matricular" del estudiante | — | RFF-30 |
| `V-30` Detalle de grupo | Estudiantes inscritos (administrador y profesor del grupo) | `GET /grupos/{id}/estudiantes`, `POST /matriculas/{id}/retiro` | RFF-38 |

### 3.8 Auditoría y errores

| Id | Vista | Rol(es) | Propósito | Endpoints | Backend | RFF |
|---|---|---|---|---|---|---|
| `V-36` | Auditoría | Administrador | Consultar los cambios de datos con filtros | `GET /auditoria` | RF-57, RN-43, RN-45, consulta 11 | RFF-39, RFF-40 |
| `V-37` | Errores | Administrador | Consultar los errores inesperados con filtros | `GET /errores` | RF-59, RN-49, consulta 12 | RFF-41 |
| `V-38` | Detalle de error | Administrador | Ver el detalle técnico de un error | `GET /errores/{id}` | RF-59, RN-47 | RFF-41 |

---

## 4. Requerimientos funcionales del frontend

Lo que la interfaz hace además de llamar a los endpoints. Las reglas de negocio se citan; los mensajes de error se presentan según las reglas de interfaz (§5).

### 4.1 Acceso y cuenta

- **RFF-01 Inicio de sesión** (`V-02`):
  - Pide correo y contraseña, y ofrece los enlaces a `V-04` (olvidé mi contraseña) y `V-05` (registrarme).
  - Con un ingreso correcto, guarda la sesión (token, vencimiento y rol) y:
    - si `debeCambiarContrasena` es `true`, abre `V-03` (RFF-02);
    - si no, vuelve a la vista que el usuario había pedido antes de iniciar sesión, si su rol puede usarla (§2.5); si no, abre la página de inicio de su rol (§2.2).
  - Con credenciales inválidas (`401`), muestra un único mensaje genérico, sin indicar si el correo existe.
  - Con la cuenta inactiva (`403 RN-29`), indica que la cuenta está desactivada y que debe contactar a la administración.
  - Si se superó el límite de intentos (`429`), indica cuánto esperar antes de volver a intentar.
  - Si llegó desde una sesión vencida (RFF-03), muestra el aviso correspondiente sobre el formulario.

- **RFF-02 Cambio obligatorio de contraseña** (`V-03`, RN-24):
  - Explica que ingresó con una contraseña temporal y que debe definir una nueva para continuar.
  - Pide la nueva contraseña y su confirmación, y muestra la política (RN-26) antes de enviar.
  - Mientras el cambio esté pendiente, ninguna otra vista está disponible: cualquier navegación vuelve a `V-03` (§2.5). El menú solo ofrece cerrar sesión (RFF-04).
  - Si la nueva contraseña es igual a la temporal o a la actual (`409 RN-25`), lo indica en el campo de la nueva contraseña.
  - Con un cambio correcto, reemplaza la sesión por el token nuevo que devuelve la API, informa que se envió un aviso al correo (RN-33) y abre la vista pedida o la página de inicio del rol, como en RFF-01.

- **RFF-03 Sesión vencida o invalidada** (§2.5):
  - Cuando la API responde `401` a una petición hecha con sesión, el frontend descarta la sesión, recuerda la vista actual y abre `V-02` con el aviso "Su sesión terminó. Inicie sesión de nuevo".
  - Aplica igual si la sesión venció (60 minutos, sin renovación), si se cerró en otro dispositivo, si se cambió la contraseña o si se desactivó la cuenta.
  - Los datos que el usuario estaba escribiendo en un formulario se pierden. No hay aviso previo al vencimiento (fuera del alcance, §1.3).

- **RFF-04 Cierre de sesión** (RF-08):
  - Desde el menú de la cuenta o desde `V-03`. Llama a `POST /auth/logout`, descarta la sesión y abre `V-01`.
  - Si la llamada falla (por ejemplo, la sesión ya había vencido), igual descarta la sesión local.
  - Informa que la sesión se cerró en todos los dispositivos, porque la API invalida todos los tokens de la cuenta (supuesto 3 de `SPEC-acceso`).

- **RFF-05 Olvido de contraseña** (`V-04`):
  - Pide el correo y, al enviarlo, muestra siempre el mismo mensaje que devuelve la API, exista o no el correo (RN-28).
  - Agrega que la temporal vence en 1 hora, que al ingresar con ella deberá definir una nueva contraseña y que su contraseña actual sigue funcionando mientras tanto (RF-11, RN-32).
  - Ofrece volver a `V-02`. Con `429`, indica cuánto esperar.

- **RFF-06 Registro público de estudiante** (`V-05`):
  - Pide cédula, nombre, apellidos, teléfono, correo, fecha de nacimiento (opcional), dirección (opcional), contraseña y confirmación. No ofrece elegir un rol (RN-19).
  - Muestra la política de contraseñas (RN-26) y valida en el cliente los formatos de los datos (§5) antes de enviar; la API vuelve a validarlos.
  - Con un registro correcto (`201`), muestra el mensaje de la API y abre `V-02` con el correo ya escrito. No inicia sesión automáticamente (supuesto 4 de `SPEC-estudiantes`).
  - Si la cédula o el correo ya existen (`409 RN-21`), muestra el mensaje de la API con los enlaces a `V-02` y `V-04`, y la indicación de contactar a la administración.
  - Con `429`, indica cuánto esperar.

### 4.2 Oferta académica

- **RFF-07 Oferta académica** (`V-01`):
  - Es la página de inicio del visitante y una entrada del menú de los demás roles.
  - Muestra los grupos `Abierto` del periodo vigente. Por grupo: curso (código y nombre), NRC, profesor (solo el nombre), modalidad, aula (si tiene), horarios (día y horas) y cupos disponibles de su cupo total.
  - Un grupo con 0 cupos disponibles se sigue mostrando, marcado como "Sin cupo" (verificación de `SPEC-grupos`).
  - Filtros: texto (busca en el nombre y el código del curso, y en el NRC) y modalidad. Paginada (§5).
  - Arriba muestra el nombre del periodo vigente y su rango de matrícula, desde `GET /periodos/vigente`, para todos los roles, incluido el visitante: la API lo permite sin sesión (B-01, resuelta).
  - Si `GET /periodos/vigente` responde `404`, no hay periodo vigente: no es un error, sino el caso "no hay oferta" del punto siguiente, y no se muestra la barra del periodo.
  - Si no hay periodo vigente o ningún grupo abierto, la API responde una lista vacía: la vista muestra "No hay oferta disponible en este momento".
  - Acciones por rol:
    - Visitante: "Inicie sesión para matricular", que abre `V-02` y vuelve a la oferta después de iniciar sesión.
    - Estudiante: "Matricular" en cada grupo con cupo. Su flujo está en RFF-30.
    - Profesor y administrador: solo consulta.

### 4.3 Perfil

- **RFF-08 Mi perfil** (`V-06`, RF-13):
  - Muestra los datos de la cuenta: correo, rol, fecha de creación, último ingreso y último cambio de contraseña.
  - Muestra los datos personales según el rol:
    - Todos: cédula, nombre, apellidos y teléfono.
    - Estudiante: además, fecha de nacimiento, dirección y fecha de registro.
    - Profesor: además, especialidad y fecha de contratación.
  - Acciones:
    - Todos: "Cambiar contraseña" (`V-07`).
    - Estudiante: "Editar mis datos de contacto" (`V-08`). El resto de sus datos y su correo solo los cambia un administrador (decisiones 1 y 2 de `SPEC-estudiantes`); la vista lo indica.
    - Profesor: sin edición; sus datos los cambia un administrador (matriz §2.2).
    - Administrador: "Editar mis datos", que abre la edición de su registro de administrador (`V-12`, RFF-13) con el `personaId` que devuelve `GET /me` (B-02, resuelta).

- **RFF-09 Cambiar contraseña** (`V-07`, RF-09):
  - Pide la contraseña actual, la nueva y su confirmación, y muestra la política (RN-26).
  - Si la contraseña actual es incorrecta (`409 RF-09`), lo indica en ese campo. Si la nueva es igual a la actual (`409 RN-25`), en el de la nueva.
  - Con un cambio correcto, reemplaza la sesión por el token nuevo e informa que se envió un aviso al correo (RN-33) y que las sesiones abiertas en otros dispositivos se cerraron.

- **RFF-10 Datos de contacto del estudiante** (`V-08`):
  - Muestra el teléfono y la dirección actuales para editarlos. La dirección es opcional.
  - Con un cambio correcto, actualiza `V-06` con el perfil que devuelve la API y muestra un mensaje de éxito.

### 4.4 Administración: personas

- **RFF-11 Listados de personas** (`V-11`, `V-14`, `V-17`):
  - Columnas: cédula, nombre completo, correo, teléfono y estado (activo o inactivo). Profesores: además, especialidad.
  - Búsqueda por texto: nombre, apellidos, cédula o correo; en profesores, también especialidad.
  - Filtro "Incluir inactivos", desmarcado por defecto (RN-41). Los inactivos se distinguen a simple vista.
  - Paginados (§5). Cada fila abre el detalle. El botón "Registrar" abre el formulario.

- **RFF-12 Registrar una persona** (`V-12`, `V-15`, `V-18`):
  - Campos comunes: cédula, nombre, apellidos, teléfono y correo. Estudiante: además, fecha de nacimiento y dirección (opcionales). Profesor: además, especialidad y fecha de contratación (opcionales). No hay campo de contraseña: la API genera una temporal y la envía al correo (RF-05, RN-23); el formulario lo explica.
  - Con un registro correcto (`201`), abre el detalle del registro creado y muestra un mensaje de éxito.
  - Si la respuesta trae `correoEnviado: false`, el detalle muestra un aviso persistente: "La cuenta se creó, pero no se pudo enviar la contraseña temporal", con la acción "Reenviar temporal" (RFF-15).
  - Cédula o correo ya registrados en un registro activo (`409 RN-13`): muestra el mensaje de la API en el formulario, sin perder los datos escritos.
  - Cédula de un registro inactivo (`409 RN-39`): muestra el mensaje de la API y ofrece "Reactivar", con los ids que trae la respuesta:
    - Estudiante o profesor: llama a `POST /estudiantes/{estudianteId}/reactivar` o `POST /profesores/{profesorId}/reactivar` y abre su detalle.
    - Administrador: la respuesta solo trae `usuarioId`. Llama a `POST /usuarios/{usuarioId}/reactivar` y abre `V-11` filtrado por la cédula.
    - Se aclara que se reactiva el registro existente con sus datos anteriores, no los del formulario; después se pueden editar.

- **RFF-13 Editar una persona** (`V-12`, `V-15`, `V-18`):
  - El formulario de registro, con los datos actuales. Se pueden editar registros inactivos.
  - Si cambia el correo, advierte antes de guardar que la persona iniciará sesión con el correo nuevo y que las temporales llegarán ahí (RN-31). Cambiar el correo no cierra la sesión de la persona (supuesto 7 de `SPEC-acceso`).
  - Con `409 RN-13`, como en RFF-12. Con un cambio correcto, vuelve al detalle con un mensaje de éxito.
  - Un administrador edita sus propios datos con este mismo formulario, desde `V-06`, con el `personaId` de su perfil (RFF-08).

- **RFF-14 Detalle de una persona** (`V-13`, `V-16`, `V-19`):
  - Muestra los datos personales (los mismos del formulario), el correo, el estado, la fecha de creación y el último ingreso. Estudiante: además, la fecha de registro.
  - Acciones según el estado:

    | Acción | Si está activo | Si está inactivo | ¿Aplica a administradores? |
    |---|:---:|:---:|:---:|
    | Editar | ✔ | ✔ | ✔ |
    | Reenviar temporal (RFF-15) | ✔ | — | ✔ |
    | Desactivar (RFF-16) | ✔ | — | ✔ |
    | Reactivar (RFF-16) | — | ✔ | ✔ |
    | Eliminar (RFF-17) | ✔ | ✔ | ❌ nunca (RN-35) |

- **RFF-15 Reenviar contraseña temporal** (RF-12):
  - Pide confirmación, indicando el correo al que se enviará y que la temporal vence en 72 horas y reemplaza a cualquier otra pendiente (RN-23, RN-27).
  - Usa el `usuarioId` del registro. Con `correoEnviado: false`, avisa que el envío falló y permite reintentar.
  - Solo se ofrece a cuentas activas; si aun así la API responde `409 RN-29`, muestra su mensaje.
  - Sugiere revisar el correo antes de reenviar, por si la persona ya no tiene acceso a él (RF-12).

- **RFF-16 Desactivar y reactivar** (RF-14, RF-19, RF-26, RN-38):
  - Desactivar pide confirmación y explica las consecuencias: la persona no podrá iniciar sesión, sus sesiones abiertas se cierran y su historial se conserva (RN-29, RN-40).
  - Estudiantes y profesores usan su propio endpoint (`/estudiantes/{id}/…`, `/profesores/{id}/…`); los administradores, `/usuarios/{usuarioId}/…`. Es la misma operación (RN-38).
  - Si la API lo rechaza, muestra su mensaje y, cuando aplica, un enlace para resolverlo:
    - `409 RN-30` (último administrador activo): sin enlace.
    - `409 RN-36` (estudiante con matrículas activas): enlace a sus matrículas en `V-16`.
    - `409 RN-37` (profesor con grupos vigentes): enlace a sus grupos en `V-19`.
  - Si un administrador se desactiva a sí mismo, la confirmación advierte que su sesión terminará; después aplica RFF-03.
  - Reactivar pide una confirmación simple. Con éxito, el detalle se actualiza.

- **RFF-17 Eliminar estudiante o profesor** (RF-19, RF-26):
  - La acción está disponible, pero la confirmación explica que solo es posible si el registro nunca tuvo matrículas (estudiante) o grupos (profesor), por ejemplo si se registró por error, y que también se elimina su cuenta (RN-35). Para las bajas normales, se recomienda desactivar.
  - Con éxito (`204`), vuelve al listado con un mensaje.
  - Si tiene datos relacionados (`409 RN-34`), muestra el mensaje de la API y ofrece "Desactivar" en su lugar.
  - Los administradores nunca se eliminan: la acción no existe (RN-35).

### 4.5 Catálogos: cursos, periodos y aulas

- **RFF-18 Listados de cursos y aulas** (`V-20`, `V-25`):
  - Cursos: código, nombre, nivel, duración en horas, costo y estado. Búsqueda por nombre o código, filtro por nivel.
  - Aulas: código, ubicación, capacidad y estado. Búsqueda por código o ubicación.
  - Filtro "Incluir inactivos" (RN-41) y botón "Registrar" solo para el administrador. Estudiante y profesor ven solo los activos y no tienen acciones.
  - Paginados (§5). Cada fila abre el detalle.

- **RFF-19 Registrar o editar curso y aula** (`V-21`, `V-26`):
  - Curso: código, nombre, descripción (opcional), duración en horas, costo y nivel. Aula: código, ubicación (opcional) y capacidad. El código se guarda en mayúsculas (supuesto 1 de `SPEC-catalogos`); el campo lo muestra así al escribir.
  - Con `409 RN-13`, muestra el mensaje de la API sin perder lo escrito.
  - Con `409 RN-39` (código de un registro inactivo), ofrece "Reactivar" con el `cursoId` o `aulaId` de la respuesta y abre su detalle, igual que en RFF-12.
  - Al reducir la capacidad de un aula por debajo del cupo de sus grupos (`409 RN-09`), muestra el mensaje de la API.
  - Se pueden editar registros inactivos. Con éxito, abre el detalle con un mensaje.

- **RFF-20 Detalle de curso** (`V-22`):
  - Muestra los datos del curso. Para todos: la sección "Grupos" con los grupos del curso (`GET /cursos/{id}/grupos`), con NRC, periodo, profesor, modalidad, horarios, cupos disponibles y estado. Cada grupo abre `V-30`.
    - Administrador: filtros por periodo y estado, con todos los estados disponibles.
    - Estudiante y profesor: solo los grupos `Abierto`, que es lo que devuelve la API (supuesto 7 de `SPEC-grupos`); filtro por periodo. El estudiante tiene "Matricular" en cada grupo con cupo (RFF-30).
  - Acciones del administrador: Editar, Desactivar o Reactivar, y Eliminar. Siguen RFF-16 y RFF-17:
    - Desactivar con grupos vigentes (`409 RN-37`): mensaje de la API; la sección "Grupos" muestra cuáles son.
    - Eliminar con grupos (`409 RN-34`): mensaje de la API y "Desactivar" en su lugar.

- **RFF-21 Periodos** (`V-23`, `V-24`):
  - El listado muestra nombre, rango de clases, rango de matrícula y fecha límite de retiro, del más reciente al más antiguo. Búsqueda por nombre. Marca como "Vigente" el que devuelve `GET /periodos/vigente`.
  - Acciones por fila: Editar, "Ver grupos" (abre `V-28` filtrado por el periodo) y Eliminar.
  - Los periodos no se desactivan (RF-37). Eliminar pide confirmación y solo es posible si el periodo no tiene grupos; con `409 RN-34` muestra el mensaje de la API.
  - El formulario pide nombre y las cinco fechas, agrupadas en clases, matrícula y retiro. Valida en el cliente la coherencia de RN-16 y muestra el error en la fecha correspondiente; la API vuelve a validarla (`400`). Con `409 RN-13` (nombre repetido), muestra el mensaje.

- **RFF-22 Detalle de aula** (`V-27`):
  - Muestra los datos del aula a administrador y profesor.
  - Solo el administrador ve la sección "Ocupación" (RF-41): la grilla semanal (RFF-29) con los bloques ocupados del periodo elegido. Cada bloque muestra el NRC, el curso y el profesor, y abre `V-30`.
  - Acciones del administrador: Editar, Desactivar o Reactivar y Eliminar, como en RFF-20 (`409 RN-37`, `409 RN-34`).

### 4.6 Grupos y horarios

- **RFF-23 Listado de grupos** (`V-28`):
  - Al entrar, filtra por el periodo vigente; si no hay vigente, muestra todos los periodos.
  - Columnas: NRC, curso, profesor, periodo, modalidad, aula, cupos (ocupados de total) y estado.
  - Filtros: periodo, curso, profesor, estado, modalidad y búsqueda por NRC. Paginado (§5). No hay filtro de inactivos: los grupos tienen estado propio.
  - Cada fila abre `V-30`. El botón "Registrar grupo" abre `V-29`.

- **RFF-24 Registrar o editar grupo** (`V-29`):
  - Campos: NRC, curso, profesor, periodo, modalidad, aula y cupo. Curso, profesor, periodo y aula se eligen con selectores con búsqueda que solo ofrecen los registros activos (RN-17).
  - El aula solo se pide en modalidad presencial o híbrida; en virtual se oculta y se envía vacía (supuesto 2 de `SPEC-grupos`).
  - Junto al cupo se muestra la capacidad del aula elegida (RN-09).
  - Al editar, solo se habilitan los campos que el estado permite (supuesto 4 de `SPEC-grupos`):

    | Estado | Campos editables |
    |---|---|
    | Planificado | Todos |
    | Abierto, Cerrado, En curso | Profesor, aula, modalidad y cupo |
    | Finalizado, Cancelado | Ninguno: la acción "Editar" no se ofrece |

    El cupo no puede bajar de los cupos ocupados; el campo lo indica.
  - Con `409` (RN-07, RN-08, RN-09, RN-13, RN-17 o RF-45), muestra el mensaje de la API sin perder lo escrito. Un curso, profesor, periodo o aula que ya no existe (`404`) se informa en su campo.
  - Al crearlo, abre `V-30` con el aviso de que el grupo nace "Planificado" y necesita al menos un horario para abrirse.

- **RFF-25 Detalle de grupo** (`V-30`, RF-44):
  - Muestra: NRC, curso, profesor, periodo, modalidad, aula, estado, horarios (día y horas, ordenados) y cupos (total, ocupados y disponibles).
  - Según el rol (RN-18):
    - Administrador: todos los grupos, con las acciones de RFF-26 a RFF-28 y "Editar" (RFF-24).
    - Profesor: solo sus grupos, sin acciones. Ve los estudiantes inscritos (RFF-38).
    - Estudiante: los grupos `Abierto` y aquellos en los que tiene o tuvo una matrícula (`SPEC-matriculas`). Ve "Matricular" si el grupo está abierto y tiene cupo (RFF-30).
    - Si la API responde `403 RN-18`, muestra el aviso de "sin permiso" de `V-09`.

- **RFF-26 Cambiar el estado de un grupo** (RF-47):
  - Solo se ofrecen las transiciones permitidas desde el estado actual (supuesto 5 de `SPEC-grupos`):

    | Estado actual | Acciones |
    |---|---|
    | Planificado | Abrir · Cancelar |
    | Abierto | Cerrar · Cancelar |
    | Cerrado | Iniciar clases (pasa a "En curso") · Cancelar |
    | En curso | Finalizar · Cancelar |
    | Finalizado, Cancelado | Ninguna |

  - "Abrir" se deshabilita si el grupo no tiene horarios, con la explicación; si aun así la API responde `409 RF-47`, muestra su mensaje.
  - Cada cambio pide confirmación y aclara que no se puede volver al estado anterior.
  - "Cancelar" pide una confirmación reforzada: indica cuántas matrículas activas se retirarán (los cupos ocupados) y que es irreversible (RN-12).
  - Con éxito, el detalle se actualiza.

- **RFF-27 Horarios del grupo** (RF-48):
  - El administrador agrega un bloque con día, hora de inicio y hora de fin. El formulario valida que el fin sea posterior al inicio (RN-15) antes de enviar.
  - Se pueden agregar bloques en cualquier estado salvo Finalizado y Cancelado, y quitarlos solo en Planificado. Fuera de esos estados, la acción no se ofrece y se explica por qué.
  - Si el bloque choca, muestra el mensaje de la API, que nombra el NRC con que choca: con otro bloque del grupo (`409 RN-14`), con otro grupo del profesor (`409 RN-07`), con otro grupo del aula (`409 RN-08`) o con otros grupos de los estudiantes matriculados (`409 RN-06`).
  - Quitar un bloque pide confirmación. Con `409 RF-48`, muestra el mensaje.
  - Después de cada cambio, el detalle se actualiza con la respuesta de la API.

- **RFF-28 Eliminar un grupo** (RF-46):
  - La confirmación explica que solo es posible si el grupo nunca tuvo matrículas, por ejemplo si se creó por error, y que se eliminan también sus horarios.
  - Con éxito, vuelve a `V-28`. Con `409 RN-34`, muestra el mensaje de la API y ofrece "Cancelar" el grupo en su lugar.

- **RFF-29 Grilla del horario semanal** (componente compartido):
  - Muestra bloques de horario en una grilla con los días de la semana como columnas y las horas como filas, desde la hora del primer bloque hasta la del último. El domingo solo aparece si hay bloques ese día.
  - Cada bloque muestra el NRC, el curso y, según la vista, el aula o el profesor. Al elegirlo, abre `V-30`.
  - Tiene un selector de periodo que empieza en el periodo vigente. Si no hay vigente, la API responde `404` y la grilla pide elegir un periodo.
  - Sin bloques, muestra un mensaje de horario vacío.
  - En pantallas angostas, se presenta como una lista agrupada por día, en lugar de la grilla.
  - La usan la ocupación del aula (`V-27`) y los horarios del estudiante y del profesor (`V-34`, `V-16`, `V-19`).

### 4.7 Matrícula

Los mensajes de las reglas de matrícula vienen de la API y nombran el dato que falló (por ejemplo, el NRC y el bloque con que choca en RN-06). El frontend los muestra tal cual, según §5. Las reglas que la API aplica en cada operación están en `SPEC-matriculas` del backend.

- **RFF-30 Matricular (estudiante)** (`V-32`, RF-51):
  - Se inicia con "Matricular" en un grupo de la oferta (`V-01`), de los grupos de un curso (`V-22`) o del detalle de un grupo abierto (`V-30`). La acción solo se ofrece en grupos `Abierto` con cupos disponibles.
  - La oferta marca como "Ya matriculado" los grupos en los que el estudiante tiene una matrícula activa (cruzando con `GET /me/matriculas?estado=Activa`), y no ofrece "Matricular" en ellos.
  - `V-32` muestra un resumen del grupo (curso, NRC, profesor, modalidad, aula, horarios y cupos disponibles) y pide confirmar. El estudiante nunca elige a otro estudiante: la API toma su identidad de la sesión (RN-18).
  - Con éxito (`201`), muestra un mensaje y abre `V-31`.
  - Si la API lo rechaza, muestra su mensaje con un título según el `code`: estudiante inactivo (RN-01), grupo no abierto (RN-02, RN-11), sin cupo (RN-03), fuera de las fechas de matrícula (RN-04), ya matriculado en el curso este periodo (RN-05) o choque de horario (RN-06).
  - Si otro estudiante tomó el último cupo al mismo tiempo (`409 CONCURRENCIA`), muestra el mensaje de la API y ofrece "Intentar de nuevo", que vuelve a cargar el grupo con sus cupos actuales.

- **RFF-31 Matricular (administrador)** (`V-32`, RF-51):
  - Se inicia con "Matricular" en la sección de matrículas del detalle del estudiante (`V-16`).
  - `V-32` pide elegir el grupo con un buscador por NRC o curso, filtrado por el periodo vigente y cambiable a otro periodo (`GET /grupos`). Al elegirlo, muestra el mismo resumen que RFF-30.
  - Indica que, como administrador, no se le aplican las restricciones del estado del grupo ni de las fechas del periodo, y sí las demás (supuesto 1 de `SPEC-matriculas`). Por eso no oculta los grupos que no están abiertos.
  - Con éxito, vuelve a `V-16` con las matrículas actualizadas. Los rechazos se muestran como en RFF-30.

- **RFF-32 Mis matrículas** (`V-31`, RF-20, RF-54):
  - Arriba, el periodo vigente con su rango de matrícula y su fecha límite de retiro (`GET /periodos/vigente`).
  - Dos pestañas sobre el mismo endpoint (supuesto 7 de `SPEC-matriculas`):
    - **Actuales:** matrículas `Activa` del periodo vigente (RF-20).
    - **Historial:** todas, activas y retiradas, de todos los periodos (RF-54). Filtros por periodo y estado, y búsqueda por curso o NRC.
  - Por matrícula: curso (código y nombre), NRC, periodo, profesor, modalidad, estado del grupo, fecha de matrícula, estado y, si está retirada, fecha y motivo de retiro (retiro voluntario, cambio de grupo o cancelación del grupo).
  - Acciones en las matrículas `Activa`: "Retirarme" (RFF-33), "Cambiar de grupo" (RFF-34) y "Ver grupo" (`V-30`).
  - Sin matrículas, invita a ver la oferta académica (`V-01`).

- **RFF-33 Retirar una matrícula** (RF-52):
  - Desde `V-31` (estudiante), `V-16` o la lista de inscritos de `V-30` (administrador).
  - Pide confirmación: indica el curso y el NRC, que se libera el cupo, que no se puede deshacer y que, para volver, habría que matricular de nuevo si todavía hay cupo y está en fechas.
  - Con éxito (`204`), actualiza la lista. Si la API lo rechaza (`409 RF-52`, RN-10 fuera de la fecha límite, RN-11 grupo no abierto), muestra su mensaje. El administrador no tiene las restricciones de fecha ni de estado (supuesto 1 de `SPEC-matriculas`).

- **RFF-34 Cambiar de grupo** (`V-33`, RF-53):
  - Desde una matrícula `Activa` en `V-31` (estudiante) o `V-16` (administrador).
  - Muestra el grupo actual y ofrece como destino los otros grupos del mismo curso y periodo (`GET /cursos/{cursoId}/grupos?periodoId=`), con sus horarios y cupos disponibles. Al estudiante solo le llegan los `Abierto`; el administrador ve todos los estados.
  - Pide confirmación aclarando que el cambio se hace completo o no se hace: si falla, conserva su matrícula actual (RF-53).
  - Con éxito (`201`), actualiza la lista: la matrícula anterior aparece retirada con motivo "Cambio de grupo" y la nueva, activa. Los rechazos (RF-53, RN-02…RN-06, RN-10, RN-11, `CONCURRENCIA`) se muestran como en RFF-30.

- **RFF-35 Matrículas y horario en el detalle del estudiante** (`V-16`, RF-20, RF-21, RF-54):
  - Sección "Matrículas": la misma lista y filtros de la pestaña "Historial" de RFF-32, desde `GET /estudiantes/{id}/matriculas`, con "Matricular" (RFF-31) y, por matrícula activa, "Retirar" (RFF-33) y "Cambiar de grupo" (RFF-34).
  - Sección "Horario": la grilla semanal (RFF-29) con `GET /estudiantes/{id}/horario`.
  - Es el destino del enlace de RFF-16 cuando no se puede desactivar al estudiante por tener matrículas activas (RN-36).

### 4.8 Horarios y grupos del profesor

- **RFF-36 Mi horario** (`V-34`, RF-21, RF-28):
  - La grilla semanal (RFF-29) con `GET /me/horario`. Para el estudiante, sus grupos con matrícula activa, mostrando el aula y el profesor; para el profesor, sus grupos, mostrando el aula.
  - Sin periodo vigente, pide elegir uno (RFF-29).

- **RFF-37 Grupos del profesor** (`V-35` y sección "Grupos" de `V-19`, RF-27):
  - Lista paginada de los grupos: NRC, curso, periodo, modalidad, aula, horarios, cupos (ocupados de total) y estado. Filtro por periodo, que empieza en el vigente; con "Todos los periodos", lista el historial.
  - `V-35` usa `GET /me/grupos`; `V-19`, `GET /profesores/{id}/grupos`. Cada grupo abre `V-30`.
  - `V-19` agrega la sección "Horario", con la grilla (RFF-29) y `GET /profesores/{id}/horario`. Es el destino del enlace de RFF-16 cuando no se puede desactivar al profesor por tener grupos vigentes (RN-37).

- **RFF-38 Estudiantes inscritos en un grupo** (sección de `V-30`, RF-49):
  - Visible para el administrador y para el profesor del grupo. Lista paginada con cédula, nombre, apellidos, correo y fecha de matrícula; con el filtro de estado "Retiradas", además fecha y motivo de retiro (supuesto 8 de `SPEC-matriculas`).
  - Filtro por estado, que empieza en "Activas", y búsqueda por nombre, apellidos o cédula.
  - El administrador puede abrir el detalle del estudiante (`V-16`) y retirar una matrícula activa (RFF-33). El profesor solo consulta.

### 4.9 Auditoría y errores

- **RFF-39 Auditoría** (`V-36`, RF-57):
  - Lista paginada, del cambio más reciente al más antiguo: fecha y hora, acción (creación, modificación o eliminación), entidad e id del registro, autor y operación.
  - El autor se muestra con su correo y rol del momento del cambio; si es `null`, como "Sistema" (RN-45).
  - Filtros combinables: entidad (lista fija, brecha B-03), id del registro (solo con una entidad elegida), acción, rango de fechas (desde y hasta, incluidas), operación y búsqueda por correo del autor. Elegir un autor o una operación en una fila filtra por ese valor.
  - Al expandir un registro se ven sus cambios:
    - Modificación: una tabla de propiedad, valor anterior y valor nuevo.
    - Creación y eliminación: una tabla de propiedad y valor.
    - Las propiedades se muestran con etiquetas legibles y los valores con los formatos de §5. Un valor `"***"` (contraseña o temporal) se muestra como "Valor protegido", sin el contenido (RN-44).
  - Si el registro todavía existe y tiene una vista, la fila ofrece abrirla. Si se eliminó, el detalle de la vista avisa que no existe (§2.5).
  - Con un filtro inválido (`400`), muestra el mensaje en el filtro correspondiente.

- **RFF-40 Historial de cambios de un registro**:
  - Los detalles de administrador, estudiante, profesor, curso, aula y grupo (`V-13`, `V-16`, `V-19`, `V-22`, `V-27`, `V-30`) ofrecen al administrador "Ver historial de cambios", que abre `V-36` filtrado por esa entidad y ese id.

- **RFF-41 Errores** (`V-37`, `V-38`, RF-59):
  - Lista paginada, del error más reciente al más antiguo: fecha y hora, origen (solicitud o correo), descripción, tipo de error, método y ruta, y rol del usuario.
  - Filtros combinables: rango de fechas, origen, código de error y búsqueda por texto (mensaje, tipo o ruta). El código de error acepta el `traceId` completo que ve el usuario o sus 32 caracteres (`SPEC-errores`), para encontrar el error que reporta una persona.
  - Cada fila abre `V-38`, que muestra todos los datos y el detalle técnico en texto de ancho fijo, con un botón para copiarlo, y el enlace "Ver cambios de esta operación", que abre `V-36` filtrado por la operación.
  - Si el error ya no existe porque se depuró (90 días por defecto, RN-49), `V-38` lo indica.
  - Los errores no se pueden marcar como revisados ni eliminar (fuera del alcance del backend, §1.3).

---

## 5. Reglas de interfaz

Comportamientos que aplican a todas las vistas. Un `RFF` puede precisar una regla para su caso, pero no contradecirla.

### 5.1 Errores de la API

Todas las respuestas de error de la API son `ProblemDetails` (RFC 9457) con `title`, `detail`, `status`, `traceId` y, cuando hay una regla de por medio, `code` (`docs/arquitectura.md` §3 del backend).

- **RUI-01 Mensaje del error:** el texto que ve el usuario es el `detail` de la respuesta, que la API redacta en español y para el usuario final. El frontend no lo reemplaza, salvo en los casos de esta sección. Los errores de una acción se muestran junto a ella (en el formulario o en la ventana de confirmación) y nunca borran lo que el usuario escribió.

- **RUI-02 Validación (`400`):** la respuesta trae `errors`, un objeto con un arreglo de mensajes por campo. El nombre del campo puede venir con mayúscula inicial (`Cedula`), así que se compara sin distinguir mayúsculas con los campos del formulario.
  - Cada mensaje se muestra debajo de su campo, y el foco va al primer campo con error.
  - Los mensajes cuyo campo no está en el formulario se muestran arriba del formulario.

- **RUI-03 Respuestas según el código HTTP:**

  | Respuesta | Presentación |
  |---|---|
  | `401` con sesión | Sesión terminada: RFF-03 |
  | `401` en el inicio de sesión | Credenciales inválidas: RFF-01 |
  | `403` con `code: "RN-24"` | Cambio de contraseña pendiente: abre `V-03` (RFF-02) |
  | `403` con `code: "RN-29"` | Cuenta desactivada, en el inicio de sesión: RFF-01 |
  | `403` sin `code` o con `RN-18` | Si es la carga de una vista, muestra `V-09`. Si es una acción, muestra el `detail` junto a ella |
  | `404` | Si es la carga de una vista, muestra que el registro no existe (§2.5). Si es un dato referenciado en un formulario, lo indica en el campo |
  | `409` | Según RUI-04 |
  | `429` | Muestra "Demasiados intentos. Intente de nuevo en N segundos", con N tomado del encabezado `Retry-After`, y deshabilita el botón de envío durante ese tiempo |
  | `500` | Muestra "Ocurrió un error inesperado. Si el problema continúa, reporte este código: `<traceId>`", con un botón para copiar el código. Es el código que el administrador busca en `V-37` (RFF-41) |
  | Sin respuesta (sin conexión, servidor caído o tiempo agotado) | Muestra "No se pudo conectar con el servidor. Revise su conexión e intente de nuevo", con un botón "Reintentar" |

- **RUI-04 Reglas de negocio (`409`):** se muestra el `detail` como un mensaje de error destacado junto a la acción. Algunos códigos agregan una acción para resolverlos:

  | `code` | Acción adicional | RFF |
  |---|---|---|
  | `RN-39` | "Reactivar" el registro existente, con el id que trae la respuesta | RFF-12, RFF-19 |
  | `RN-34` | "Desactivar" o "Cancelar el grupo" en lugar de eliminar | RFF-17, RFF-20, RFF-22, RFF-28 |
  | `RN-36`, `RN-37` | Enlace a las matrículas o a los grupos que lo impiden | RFF-16 |
  | `RN-21` | Enlaces a iniciar sesión y a recuperar la contraseña | RFF-06 |
  | `CONCURRENCIA` | "Intentar de nuevo", que vuelve a cargar los datos actuales antes de reintentar | RFF-30, RFF-34 |
  | `RF-09`, `RN-25` | El mensaje va en el campo de contraseña correspondiente | RFF-02, RFF-09 |

  El resto de los códigos que devuelve la API (`RF-45`, `RF-47`, `RF-48`, `RF-52`, `RF-53`, `RN-01` a `RN-11`, `RN-13` a `RN-17`, `RN-23`, `RN-30`) solo muestran el mensaje. Un `code` desconocido se trata igual: el frontend no necesita conocer cada código para funcionar.

- **RUI-05 Sin detalles técnicos:** la interfaz nunca muestra trazas, nombres de clases ni respuestas crudas de la API al usuario. La única excepción es `V-38`, el detalle técnico de un error, solo para el administrador.

### 5.2 Formularios y acciones

- **RUI-06 Validación en el cliente:** los formularios validan antes de enviar, con los mismos límites que la API, para avisar sin esperar la respuesta. La API vuelve a validar todo y su respuesta es la que vale (§1.2). Límites tomados de las specs y los validadores del backend:

  | Dato | Regla |
  |---|---|
  | Cédula | Obligatoria, de 1 a 20 caracteres: letras, dígitos y guiones |
  | Nombre, apellidos | Obligatorios, hasta 100 caracteres |
  | Teléfono | Obligatorio, de 8 a 20 caracteres: dígitos, espacios, `+` y `-` |
  | Correo | Obligatorio, formato de correo, hasta 256 caracteres |
  | Contraseña nueva | RN-26; la confirmación debe coincidir (RN-25) |
  | Dirección | Opcional, hasta 250 caracteres |
  | Fecha de nacimiento | Opcional, no futura ni anterior a 01/01/1900 |
  | Especialidad | Opcional, hasta 100 caracteres |
  | Fecha de contratación | Opcional, no anterior a 01/01/1900 |
  | Curso | Código hasta 20 caracteres; nombre hasta 150; descripción opcional hasta 1000; duración mayor que 0; costo mayor o igual a 0; nivel obligatorio |
  | Aula | Código hasta 20 caracteres; ubicación opcional hasta 150; capacidad mayor que 0 |
  | Periodo | Nombre hasta 50 caracteres; las cinco fechas obligatorias y coherentes (RN-16) |
  | Grupo | NRC hasta 10 caracteres; cupo mayor que 0; aula según la modalidad (supuesto 2 de `SPEC-grupos`) |
  | Bloque de horario | Día obligatorio; fin posterior al inicio (RN-15) |

  Los campos obligatorios se marcan como tales. Los errores aparecen al salir del campo o al intentar enviar, no mientras se escribe.

- **RUI-07 Confirmaciones:** las acciones que cambian datos de forma importante piden confirmación en una ventana que nombra la acción y el registro, y explica sus consecuencias. El botón de confirmar repite el verbo de la acción ("Desactivar estudiante", no "Aceptar").

  | Tipo | Acciones |
  |---|---|
  | **Reforzada:** la ventana destaca que no se puede deshacer, y el foco inicial queda en "Cancelar" | Eliminar cualquier registro (RFF-17, RFF-20, RFF-21, RFF-22, RFF-28) · Cancelar un grupo (RFF-26) |
  | **Simple** | Desactivar y reactivar (RFF-16) · Reenviar una temporal (RFF-15) · Cambiar el estado de un grupo (RFF-26) · Quitar un bloque de horario (RFF-27) · Matricular (RFF-30, RFF-31) · Retirar (RFF-33) · Cambiar de grupo (RFF-34) · Cambiar el correo de una persona (RFF-13) |
  | **Sin confirmación** | Guardar un formulario de registro o edición · Iniciar o cerrar sesión · Aplicar filtros |

- **RUI-08 Envíos en curso:** mientras se procesa una acción, su botón se deshabilita y muestra que está trabajando, para evitar envíos dobles.

- **RUI-09 Cambios sin guardar:** si el usuario sale de un formulario con cambios sin guardar, se le pregunta si desea descartarlos. No aplica si sale porque la sesión terminó (RFF-03).

### 5.3 Listados

- **RUI-10 Paginación:** todos los listados se paginan en la API (`page` y `pageSize`). Por defecto, 20 filas por página, con opciones de 10, 20 y 50 (la API admite hasta 100). Se muestran el rango y el total ("21–40 de 134") y los controles de página anterior y siguiente.

- **RUI-11 Búsqueda y filtros:**
  - La búsqueda por texto no se ejecuta mientras se escribe. Se aplica al presionar Enter en el campo o el botón "Buscar", que está junto a él. Lo mismo vale para los demás filtros que se escriben, como el id del registro en la auditoría o el código de error.
  - Los filtros que se eligen (listas, casillas y fechas) se aplican al cambiarlos, junto con el texto de búsqueda ya aplicado.
  - Los selectores con búsqueda de los formularios (glosario) no siguen esta regla: sugieren opciones mientras se escribe.
  - Cambiar la búsqueda o un filtro vuelve a la página 1.
  - Hay una acción "Limpiar filtros" cuando hay alguno aplicado.
  - La búsqueda, los filtros y la página se reflejan en la dirección de la vista, así que se conservan al volver atrás, al recargar y al compartir el enlace.

- **RUI-12 Registros inactivos:** el filtro "Incluir inactivos" (RN-41) está desmarcado por defecto. Un registro inactivo se identifica con la etiqueta "Inactivo", no solo con un color.

- **RUI-13 Estados de un listado o una vista:**
  - **Cargando:** un indicador en el lugar del contenido. La primera carga no muestra un listado vacío antes de recibir los datos.
  - **Vacío sin filtros:** un mensaje de que no hay registros y, si el rol puede, la acción para crear el primero.
  - **Vacío con filtros:** "No hay resultados para los filtros aplicados", con "Limpiar filtros".
  - **Error:** el mensaje de §5.1 y "Reintentar".

- **RUI-14 Listados en pantallas angostas:** las tablas se presentan como una lista de tarjetas, con los datos principales de cada fila y el acceso a su detalle.

### 5.4 Formatos

- **RUI-15 Fechas** (`DateOnly` de la API): se muestran como `dd/mm/aaaa` y **sin conversión de zona horaria**, porque ya están en la fecha local del instituto (decisión 9 del mapa del backend). Se ingresan con un selector de fecha que también permite escribirla.

- **RUI-16 Fecha y hora** (marcas de tiempo en UTC: fecha de creación, último ingreso, último cambio de contraseña, auditoría, errores): se convierten a la zona horaria del instituto, `America/Costa_Rica`, y se muestran como `dd/mm/aaaa` seguido de la hora en el formato de RUI-17 (por ejemplo, `05/03/2026 6:30 p. m.`). Así coinciden con los filtros por fecha de la auditoría y los errores, que la API interpreta en esa zona.

- **RUI-17 Horas** (`TimeOnly` de los horarios y la hora de las marcas de tiempo):
  - Se muestran en formato de 12 horas con a. m. o p. m., sin segundos: `7:00 a. m.`, `12:30 p. m.`, `6:30 p. m.`. Las 12 del mediodía son `12:00 p. m.` y la medianoche, `12:00 a. m.`
  - Se ingresan con un selector de hora de 12 horas con a. m. y p. m.
  - Es solo presentación: la API envía y recibe las horas en formato de 24 horas (`"18:30:00"`). El frontend las convierte al mostrarlas y las devuelve a 24 horas al enviar un formulario. El backend no cambia.
  - La grilla del horario (RFF-29) rotula sus filas con este formato.

- **RUI-18 Números y moneda:** formato de Costa Rica (`es-CR`). El costo de los cursos, en colones con dos decimales (por ejemplo, ₡25 000,00).

- **RUI-19 Valores de la API con etiqueta legible:** los enums llegan como texto sin tildes ni espacios. Se muestran así:

  | Enum | Valores de la API → etiqueta |
  |---|---|
  | Rol | `Administrador` → Administrador · `Profesor` → Profesor · `Estudiante` → Estudiante |
  | Nivel del curso | `Basico` → Básico · `Intermedio` → Intermedio · `Avanzado` → Avanzado |
  | Modalidad | `Presencial` → Presencial · `Virtual` → Virtual · `Hibrida` → Híbrida |
  | Estado del grupo | `Planificado` → Planificado · `Abierto` → Abierto · `Cerrado` → Cerrado · `EnCurso` → En curso · `Finalizado` → Finalizado · `Cancelado` → Cancelado |
  | Estado de la matrícula | `Activa` → Activa · `Retirada` → Retirada |
  | Motivo del retiro | `RetiroVoluntario` → Retiro voluntario · `CambioGrupo` → Cambio de grupo · `CancelacionGrupo` → Cancelación del grupo |
  | Día | `Lunes` → Lunes · `Martes` → Martes · `Miercoles` → Miércoles · `Jueves` → Jueves · `Viernes` → Viernes · `Sabado` → Sábado · `Domingo` → Domingo |
  | Acción de auditoría | `Creacion` → Creación · `Modificacion` → Modificación · `Eliminacion` → Eliminación |
  | Origen del error | `Peticion` → Solicitud · `Correo` → Correo |

  Un valor que no está en la tabla se muestra tal como llega.

- **RUI-20 Estados como etiquetas:** los estados (de grupo, de matrícula, activo o inactivo) se muestran como etiquetas con texto. El color puede reforzarlos, pero nunca es la única señal.

### 5.5 Mensajes y textos

- **RUI-21 Mensajes de éxito:** breves y no bloqueantes ("Estudiante registrado"), visibles unos segundos sin que el usuario deba cerrarlos. Los avisos que requieren una acción, como `correoEnviado: false`, quedan fijos hasta que se resuelven o se cierran.

- **RUI-22 Trato y tono:** la interfaz trata al usuario de **usted**, como los mensajes de la API. Los textos son cortos, en lenguaje del instituto y no técnico ("matrícula", "grupo", "cupo"; no "registro" ni "entidad"), salvo en `V-36` a `V-38`, que son vistas técnicas del administrador.

### 5.6 Marco de la aplicación

- **RUI-23 Pie de página:** todas las vistas, también las públicas y el cambio obligatorio de contraseña (`V-03`), terminan con un pie que muestra el nombre del sistema, el nombre del instituto, el año y la versión del frontend (por ejemplo, "Sistema de Matrícula · [Nombre del instituto] · © 2026 · Versión 0.1.0"). La versión ayuda a soporte cuando un usuario reporta un error con su código (RUI-03); sale del build, no de la API. El nombre del instituto queda pendiente de definir. El pie no queda fijo en la pantalla, no lleva enlaces ni datos de contacto (la API no los ofrece) y en pantallas angostas se apila.

---

## 6. Requerimientos no funcionales

- **Dispositivos y tamaños de pantalla:**
  - Todas las vistas funcionan desde 360 px de ancho, sin desplazamiento horizontal de la página. Las tablas anchas pasan a tarjetas (RUI-14), y la grilla de horario, a una lista por día (RFF-29).
  - Las vistas del visitante y del estudiante se diseñan primero para celular; las del administrador, para escritorio, pero usables en celular. Las del profesor, para ambos.

- **Navegadores:** las dos últimas versiones estables de Chrome, Edge, Firefox y Safari, en escritorio y en celular.

- **Accesibilidad** (buenas prácticas, sin un nivel formal de cumplimiento):
  - Todo se puede usar con el teclado, en un orden lógico, y el foco siempre es visible.
  - Cada campo tiene su etiqueta visible, y sus errores están asociados al campo.
  - Contraste suficiente entre el texto y el fondo; el color nunca es la única señal (RUI-20).
  - Las ventanas de confirmación reciben el foco al abrirse y lo devuelven al cerrarse.
  - Los elementos táctiles tienen un tamaño cómodo en celular.
  - Las imágenes e íconos con significado tienen un texto alternativo.

- **Idioma:** toda la interfaz en español de Costa Rica, con trato de usted (RUI-22).

- **Seguridad en el cliente:**
  - La API valida todos los permisos y las reglas; ocultar una acción en la interfaz es solo una ayuda (§1.2).
  - El token de acceso nunca va en la dirección de la página ni se escribe en la consola del navegador. Se descarta al cerrar sesión y al recibir un `401` (RFF-03, RFF-04). Dónde se guarda lo decide `docs/arquitectura.md`.
  - Las contraseñas solo existen en los campos que las piden: no se guardan ni se muestran después de enviarlas. Los campos de contraseña permiten mostrar lo escrito a petición del usuario.
  - En producción, el frontend y la API se sirven por HTTPS.

- **Rendimiento percibido:**
  - Cualquier acción muestra una respuesta visual (indicador de carga o botón deshabilitado) de inmediato (RUI-08, RUI-13).
  - Ningún listado carga todos los registros: siempre se pagina en la API (RUI-10).
  - La carga inicial de la aplicación es rápida en una conexión de banda ancha típica; la meta concreta y cómo lograrla (por ejemplo, cargar las vistas de administración solo cuando se usan) los fija `docs/arquitectura.md`.

- **Fechas y zona horaria:** las fechas sin hora no se convierten (RUI-15); las marcas de tiempo se muestran en la hora del instituto (RUI-16). El resultado no depende de la zona horaria del dispositivo del usuario.

- **Configuración por entorno:** la URL base de la API no está escrita en el código: se configura por entorno (desarrollo: `http://localhost:5022/api/v1`). En desarrollo, el frontend corre en un origen permitido por el CORS de la API (`http://localhost:5173`, sección `Cors` del README del backend).

- **Compatibilidad con la API:** el frontend trabaja con la versión `v1`. Los tipos de datos que usa se mantienen alineados con el documento OpenAPI; un cambio del contrato en el backend se revisa en el frontend antes de desplegar.

---

## 7. Trazabilidad

### 7.1 Endpoints de la API → vistas

Los 76 endpoints de los 14 controllers del backend, con las vistas que los usan. Todos tienen al menos una vista, salvo `GET /matriculas/{id}`, que queda fuera del alcance con su motivo. Rutas relativas a `/api/v1`.

| # | Método y ruta | Acceso | Vista |
|---|---|---|---|
| 1 | `POST /auth/login` | Anónimo | V-02 |
| 2 | `POST /auth/olvido-contrasena` | Anónimo | V-04 |
| 3 | `POST /auth/cambio-obligatorio` | Con cambio pendiente | V-03 |
| 4 | `POST /auth/cambiar-contrasena` | Con sesión | V-07 |
| 5 | `POST /auth/logout` | Con sesión (incluso con cambio pendiente) | V-03, menú de la cuenta (RFF-04) |
| 6 | `GET /me` | Con sesión | V-06 |
| 7 | `PUT /me/datos-contacto` | Estudiante | V-08 |
| 8 | `GET /me/matriculas` | Estudiante | V-31; V-01 (marca «Ya matriculado») |
| 9 | `POST /me/matriculas` | Estudiante | V-32 |
| 10 | `GET /me/grupos` | Profesor | V-35 |
| 11 | `GET /me/horario` | Profesor o Estudiante | V-34 |
| 12 | `GET /oferta-academica` | Anónimo | V-01 |
| 13 | `POST /administradores` | Administrador | V-12 |
| 14 | `GET /administradores` | Administrador | V-11 |
| 15 | `GET /administradores/{id}` | Administrador | V-13, V-12 |
| 16 | `PUT /administradores/{id}` | Administrador | V-12 |
| 17 | `POST /usuarios/{id}/reenviar-temporal` | Administrador | V-13, V-16, V-19 |
| 18 | `POST /usuarios/{id}/desactivar` | Administrador | V-13 |
| 19 | `POST /usuarios/{id}/reactivar` | Administrador | V-13, V-12 (RN-39) |
| 20 | `POST /estudiantes/registro` | Anónimo | V-05 |
| 21 | `POST /estudiantes` | Administrador | V-15 |
| 22 | `GET /estudiantes` | Administrador | V-14 |
| 23 | `GET /estudiantes/{id}` | Administrador | V-16, V-15 |
| 24 | `PUT /estudiantes/{id}` | Administrador | V-15 |
| 25 | `POST /estudiantes/{id}/desactivar` | Administrador | V-16 |
| 26 | `POST /estudiantes/{id}/reactivar` | Administrador | V-16, V-15 (RN-39) |
| 27 | `DELETE /estudiantes/{id}` | Administrador | V-16 |
| 28 | `GET /estudiantes/{id}/matriculas` | Administrador | V-16 |
| 29 | `GET /estudiantes/{id}/horario` | Administrador | V-16 |
| 30 | `POST /profesores` | Administrador | V-18 |
| 31 | `GET /profesores` | Administrador | V-17; V-29 (selector) |
| 32 | `GET /profesores/{id}` | Administrador | V-19, V-18 |
| 33 | `PUT /profesores/{id}` | Administrador | V-18 |
| 34 | `POST /profesores/{id}/desactivar` | Administrador | V-19 |
| 35 | `POST /profesores/{id}/reactivar` | Administrador | V-19, V-18 (RN-39) |
| 36 | `DELETE /profesores/{id}` | Administrador | V-19 |
| 37 | `GET /profesores/{id}/grupos` | Administrador | V-19 |
| 38 | `GET /profesores/{id}/horario` | Administrador | V-19 |
| 39 | `POST /cursos` | Administrador | V-21 |
| 40 | `GET /cursos` | Con sesión | V-20; V-29 (selector) |
| 41 | `GET /cursos/{id}` | Con sesión | V-22, V-21 |
| 42 | `PUT /cursos/{id}` | Administrador | V-21 |
| 43 | `POST /cursos/{id}/desactivar` | Administrador | V-22 |
| 44 | `POST /cursos/{id}/reactivar` | Administrador | V-22, V-21 (RN-39) |
| 45 | `DELETE /cursos/{id}` | Administrador | V-22 |
| 46 | `GET /cursos/{id}/grupos` | Con sesión | V-22; V-33 (grupos destino) |
| 47 | `POST /periodos` | Administrador | V-24 |
| 48 | `GET /periodos` | Con sesión | V-23; V-28, V-29 (selector); grilla RFF-29 (selector); V-31, V-16, V-35, V-19, V-22 (filtros por periodo) |
| 49 | `GET /periodos/vigente` | Anónimo | V-01, V-23, V-28, V-31, V-35; grilla RFF-29 |
| 50 | `GET /periodos/{id}` | Con sesión | V-24 |
| 51 | `PUT /periodos/{id}` | Administrador | V-24 |
| 52 | `DELETE /periodos/{id}` | Administrador | V-23 |
| 53 | `POST /aulas` | Administrador | V-26 |
| 54 | `GET /aulas` | Administrador o Profesor | V-25; V-29 (selector) |
| 55 | `GET /aulas/{id}` | Administrador o Profesor | V-27, V-26 |
| 56 | `PUT /aulas/{id}` | Administrador | V-26 |
| 57 | `POST /aulas/{id}/desactivar` | Administrador | V-27 |
| 58 | `POST /aulas/{id}/reactivar` | Administrador | V-27, V-26 (RN-39) |
| 59 | `DELETE /aulas/{id}` | Administrador | V-27 |
| 60 | `GET /aulas/{id}/ocupacion` | Administrador | V-27 |
| 61 | `POST /grupos` | Administrador | V-29 |
| 62 | `GET /grupos` | Con sesión | V-28; V-32 (buscador del administrador) |
| 63 | `GET /grupos/{id}` | Con sesión | V-30, V-29 |
| 64 | `PUT /grupos/{id}` | Administrador | V-29 |
| 65 | `DELETE /grupos/{id}` | Administrador | V-30 |
| 66 | `POST /grupos/{id}/estado` | Administrador | V-30 |
| 67 | `POST /grupos/{id}/horarios` | Administrador | V-30 |
| 68 | `DELETE /grupos/{id}/horarios/{horarioId}` | Administrador | V-30 |
| 69 | `GET /grupos/{id}/estudiantes` | Administrador o Profesor | V-30 |
| 70 | `POST /matriculas` | Administrador | V-32 |
| 71 | `GET /matriculas/{id}` | Administrador o Estudiante | Fuera de alcance: las listas de matrículas ya traen los mismos datos (`MatriculaResponse`), así que no hay una vista de detalle de matrícula |
| 72 | `POST /matriculas/{id}/retiro` | Administrador o Estudiante | V-31, V-16, V-30 |
| 73 | `POST /matriculas/{id}/cambio-grupo` | Administrador o Estudiante | V-33 |
| 74 | `GET /auditoria` | Administrador | V-36; enlaces de RFF-40 y V-38 |
| 75 | `GET /errores` | Administrador | V-37 |
| 76 | `GET /errores/{id}` | Administrador | V-38 |

### 7.2 RF del backend → vistas

Todos los RF del backend que tienen interfaz están cubiertos. Los que no tienen interfaz se indican con el motivo.

| RF | Vista(s) | RFF |
|---|---|---|
| RF-01 Registro público de estudiantes | `V-05` | RFF-06 |
| RF-02 Registro de estudiantes por un administrador | `V-15` | RFF-12 |
| RF-03 Registro de profesores | `V-18` | RFF-12 |
| RF-04 Registro de administradores | `V-12` | RFF-12 |
| RF-05 Generar y enviar una temporal | Sin interfaz propia: lo hace la API al registrar y al reenviar (`V-12`, `V-15`, `V-18`, `V-13`, `V-16`, `V-19`) | RFF-12, RFF-15 |
| RF-06 Iniciar sesión | `V-02` | RFF-01 |
| RF-07 Cambio obligatorio | `V-02`, `V-03` | RFF-01, RFF-02 |
| RF-08 Cerrar sesión | Menú de la cuenta, `V-03` | RFF-04 |
| RF-09 Cambiar la contraseña propia | `V-07` | RFF-09 |
| RF-10 Olvido de contraseña | `V-04` | RFF-05 |
| RF-11 Vigencia de la contraseña actual durante un olvido | `V-02`, `V-04` | RFF-01, RFF-05 |
| RF-12 Reenvío de la temporal | `V-13`, `V-16`, `V-19` | RFF-15 |
| RF-13 Perfil propio | `V-06` | RFF-08 |
| RF-14 Desactivar o reactivar usuarios | `V-13`, `V-16`, `V-19` | RFF-16 |
| RF-15 Registrar un estudiante | `V-05`, `V-15` (por RF-01 y RF-02) | RFF-06, RFF-12 |
| RF-16 a RF-19 Estudiantes: listar, detalle, modificar, desactivar o eliminar | `V-14`, `V-15`, `V-16` | RFF-11 a RFF-17 |
| RF-20 Cursos y grupos matriculados de un estudiante | `V-31`, `V-16` | RFF-32, RFF-35 |
| RF-21 Horario de un estudiante | `V-34`, `V-16` | RFF-35, RFF-36 |
| RF-22 a RF-26 Profesores: registrar, listar, detalle, modificar, desactivar o eliminar | `V-17`, `V-18`, `V-19` | RFF-11 a RFF-17 |
| RF-27 Grupos de un profesor | `V-35`, `V-19` | RFF-37 |
| RF-28 Horario de un profesor | `V-34`, `V-19` | RFF-36, RFF-37 |
| RF-29 a RF-33 Cursos: registrar, listar, detalle, modificar, desactivar o eliminar | `V-20`, `V-21`, `V-22` | RFF-18 a RFF-20 |
| RF-34 Grupos de un curso | `V-22` | RFF-20 |
| RF-35 a RF-38 Periodos: registrar, listar y modificar, eliminar, vigente | `V-23`, `V-24`; el vigente también en `V-01`, `V-28`, `V-31` y `V-35` | RFF-21 |
| RF-39, RF-40 Aulas: registrar, listar, modificar, desactivar o eliminar | `V-25`, `V-26`, `V-27` | RFF-18, RFF-19, RFF-22 |
| RF-41 Ocupación de un aula | `V-27` | RFF-22, RFF-29 |
| RF-42 Crear un grupo | `V-29` | RFF-24 |
| RF-43 Listar grupos | `V-28` | RFF-23 |
| RF-44 Detalle de un grupo | `V-30` | RFF-25 |
| RF-45 Modificar un grupo | `V-29` | RFF-24 |
| RF-46 Eliminar un grupo | `V-30` | RFF-28 |
| RF-47 Cambiar el estado de un grupo | `V-30` | RFF-26 |
| RF-48 Horarios de un grupo | `V-30` | RFF-27 |
| RF-49 Estudiantes de un grupo | `V-30` (sección de inscritos) | RFF-38 |
| RF-50 Oferta académica | `V-01` | RFF-07 |
| RF-51 Matricular | `V-32` | RFF-30, RFF-31 |
| RF-52 Retirar | `V-31`, `V-16`, `V-30` | RFF-33 |
| RF-53 Cambiar de grupo | `V-33` | RFF-34 |
| RF-54 Historial de matrícula | `V-31`, `V-16` | RFF-32, RFF-35 |
| RF-55 Administradores | `V-11`, `V-12`, `V-13` | RFF-11 a RFF-16 |
| RF-56 Registrar los cambios de datos | Sin interfaz: la API lo hace automáticamente | — |
| RF-57 Consultar la auditoría | `V-36`, y los enlaces de los detalles | RFF-39, RFF-40 |
| RF-58 Registrar los errores inesperados | Sin interfaz: la API lo hace automáticamente. El usuario solo ve el código del error (RUI-03) | — |
| RF-59 Consultar los errores | `V-37`, `V-38` | RFF-41 |

---

## 8. Brechas con el backend

Lo que el frontend necesita y la API no ofrece. Se registran aquí y se decide aparte si se resuelven en el backend o quedan fuera del alcance.

Las cuatro brechas se decidieron en el backend, en [`correcciones/COR-01-brechas-frontend.md`](../../sistema-matricula-api/correcciones/COR-01-brechas-frontend.md) (2026-11-17): B-01, B-02 y B-04 se resolvieron en la API, y B-03 se descartó. Las vistas y los RFF de este documento ya reflejan esas decisiones.

| Id | Brecha | Impacto | Propuesta | Estado |
|---|---|---|---|---|
| B-01 | La oferta académica (`GET /oferta-academica`) no incluye el periodo, y `GET /periodos/vigente` exige sesión. | El visitante ve la oferta sin saber de qué periodo es ni hasta cuándo puede matricular. | Agregar el periodo vigente (nombre y rango de matrícula) a la respuesta de la oferta, o permitir `GET /periodos/vigente` sin sesión. Mientras tanto, la oferta del visitante no muestra el periodo. | **Resuelta** (COR-01): `GET /periodos/vigente` ya no exige sesión. La oferta muestra el periodo a todos (RFF-07). |
| B-02 | `GET /me` devuelve el `usuarioId` del administrador, pero no el id de su registro de administrador, que es el que pide `PUT /administradores/{id}`. | Para "Editar mis datos" (RFF-08), el frontend debe buscar al administrador con `GET /administradores?search=<su correo>` y elegir el que tenga su `usuarioId`. Funciona, pero es una petición extra y un rodeo. | Agregar el id de la persona (administrador, estudiante o profesor) a `GET /me`. Mientras tanto, se usa el rodeo. | **Resuelta** (COR-01): `GET /me` devuelve `personaId`, el id del administrador, estudiante o profesor. Ya no se usa el rodeo (RFF-08, RFF-13). |
| B-03 | La API no expone la lista de entidades auditadas que acepta el filtro `entidad` de `GET /auditoria`; solo la nombra en el mensaje del `400`. | El frontend mantiene una lista fija (Usuario, Administrador, Estudiante, Profesor, Curso, Periodo, Aula, Grupo, Horario, Matricula), que habría que actualizar si el backend agrega entidades. | Un endpoint de solo lectura con las entidades auditadas, o incluirlas en el OpenAPI como enum. Mientras tanto, se usa la lista fija. | **Descartada** (COR-01): se mantiene la lista fija en el frontend. Agregar una entidad auditada exige una spec nueva en el backend, y en ese momento se actualiza la lista y sus etiquetas. |
| B-04 | Los mensajes de la API tratan al usuario de usted ("Contacte a la administración", "Reactívelo"), salvo el del olvido de contraseña, que lo tutea ("recibirás una contraseña temporal"). | El frontend muestra ese mensaje tal cual (RFF-05, RN-28), así que en `V-04` el trato no coincide con el resto de la interfaz (RUI-22). Es solo de estilo. | Cambiar el mensaje en el backend a "recibirá". Mientras tanto, se muestra como llega. | **Resuelta** (COR-01): el mensaje dice "recibirá", y `V-04` lo muestra como llega (RFF-05). |

---

## 9. Glosario

Solo los términos propios de la interfaz. Los del negocio (NRC, grupo, cupo, periodo, matrícula, retiro, traslape, desactivar, contraseña temporal, etc.) están en el glosario del backend (§8 de sus requerimientos).

| Término | Definición |
|---|---|
| **Vista** | Una pantalla de la aplicación, identificada por un id `V-xx`. Puede mostrarse como página o como ventana sobre otra vista. |
| **Página de inicio** | La vista que se abre al iniciar sesión, distinta para cada rol (§2.2). |
| **Menú de la cuenta** | El menú con Mi perfil, Cambiar contraseña y Cerrar sesión, disponible para cualquier rol con sesión. |
| **Sesión** | El periodo en que el usuario está identificado ante la API con un token de acceso. Dura 60 minutos y no se renueva. |
| **Sesión terminada** | Una sesión que venció o que la API invalidó (cierre de sesión, cambio de contraseña, desactivación). El frontend la detecta por un `401` (RFF-03). |
| **Cambio pendiente** | El estado de una sesión iniciada con una contraseña temporal: solo permite el cambio obligatorio y cerrar sesión (RN-24). |
| **Listado** | Una vista con una tabla paginada de registros, búsqueda y filtros (§5.3). |
| **Detalle** | Una vista con los datos de un registro y sus acciones. |
| **Formulario** | Una vista para registrar o editar un registro. |
| **Selector con búsqueda** | Un campo para elegir un registro relacionado (curso, profesor, grupo…) escribiendo parte de su nombre o código. |
| **Confirmación simple o reforzada** | La ventana que pide confirmar una acción antes de enviarla a la API (RUI-07). La reforzada destaca que la acción no se puede deshacer. |
| **Grilla semanal** | El componente que muestra bloques de horario por día y hora (RFF-29). |
| **Etiqueta de estado** | El texto breve que muestra el estado de un registro, como "Abierto" o "Inactivo" (RUI-20). |
| **Mensaje de éxito** | Un aviso breve que confirma una acción y desaparece solo (RUI-21). |
| **Aviso fijo** | Un aviso que queda visible hasta que se resuelve o se cierra, por ejemplo cuando no se pudo enviar una temporal (RUI-21). |
| **Estado vacío** | Lo que muestra una vista cuando no hay datos, con o sin filtros aplicados (RUI-13). |
| **Código de error** | El `traceId` que la API envía en cada error. Se muestra al usuario en los errores inesperados para que lo reporte, y el administrador lo usa para buscar el error (RUI-03, RFF-41). |
| **Brecha** | Algo que el frontend necesita y la API no ofrece (§8). |
