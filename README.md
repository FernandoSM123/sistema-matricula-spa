# SPA — Sistema de Matrícula

Frontend web del sistema de matrícula de un instituto de cursos libres. Es una SPA en Angular 22 con Angular Material, que consume la API de [`sistema-matricula-api`](../sistema-matricula-api).

## Requisitos

- **Node 24 LTS.**
- **pnpm 12.21**, instalado con `npm install -g pnpm@12.21.0`. El campo `packageManager` del `package.json` avisa si la versión no coincide.
- **La API en marcha** en `http://localhost:5022`. Sus requisitos (.NET 10, PostgreSQL y smtp4dev) y cómo levantarla están en el [`README` de la API](../sistema-matricula-api/README.md).

Las dos carpetas deben quedar una al lado de la otra (`sistema-matricula-api` y `sistema-matricula-spa`), porque los documentos del SPA citan los de la API con rutas relativas.

## Levantar el SPA junto a la API

1. Levantar la API, siguiendo su `README`. En Windows, `dev.cmd`, en la raíz de la API, abre smtp4dev y la API. Comprobar que responde en `http://localhost:5022/health`.
2. Instalar las dependencias del SPA, exactamente las del lockfile:

   ```bash
   pnpm install --frozen-lockfile
   ```

3. Levantar el servidor de desarrollo:

   ```bash
   pnpm start
   ```

4. Abrir `http://localhost:5173`. Ese es el origen que permite el CORS de la API en desarrollo (`Cors:OrigenesPermitidos` en su `appsettings.Development.json`); con otro puerto, el navegador rechaza las llamadas.

La URL de la API se configura en `src/environments/` (`apiUrl`). Todo lo que va ahí llega al navegador, así que nunca lleva secretos.

## Comandos

| Comando | Para qué |
|---|---|
| `pnpm install --frozen-lockfile` | Instalar exactamente lo del lockfile (al clonar o en CI) |
| `pnpm start` | Servidor de desarrollo en `http://localhost:5173` |
| `pnpm build` | Build de producción en `dist/`, con los presupuestos de tamaño |
| `pnpm test` | Pruebas unitarias (Vitest) en modo observador. Una sola pasada: `pnpm test --watch=false` |
| `pnpm lint` | ESLint, incluidas las reglas de dependencias entre carpetas |
| `pnpm formato` | Formatear con Prettier |
| `pnpm formato:revisar` | Revisar el formato sin cambiar archivos |
| `pnpm audit` | Revisar las dependencias |

`pnpm api:tipos`, que regenera los tipos de la API desde su OpenAPI, llega con el módulo `nucleo`.

## Antes de cerrar un módulo

```bash
pnpm formato:revisar && pnpm lint && pnpm test --watch=false && pnpm build
pnpm audit
```

Todo debe pasar, el build debe quedar dentro de los presupuestos, y un hallazgo alto o crítico de `pnpm audit` se resuelve o se anota con su justificación. Después se revisan las vistas del módulo contra sus wireframes, con la API en marcha.

## Documentación

- **Qué construir:** `docs/requerimientos.md`, con las vistas, los requerimientos y las brechas con la API.
- **Cómo se ven las vistas:** `docs/wireframes/`.
- **Cómo construirlo:** `docs/arquitectura.md`.
- **Módulos y su avance:** `specs/mapa-modulos.md`, con una spec por módulo en `specs/` y sus tareas en `tasks/`.
- **Para agentes de IA:** `AGENTS.md`.
