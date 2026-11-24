import { HttpErrorResponse } from '@angular/common/http';

/**
 * Un error de la API ya interpretado (docs/arquitectura.md §3.5). `erroresInterceptor` convierte
 * toda respuesta de error en uno, así los componentes nunca leen un `ProblemDetails` crudo (RUI-05).
 */
export interface ErrorApi {
  /** Siempre `'ErrorApi'`. Con `message`, hace que `httpResource` lo entregue tal cual, sin envolverlo. */
  name: 'ErrorApi';
  /** Texto técnico (`'HTTP 409 RN-39'`). Nunca se muestra al usuario. */
  message: string;
  /** 0 si no hubo respuesta: sin conexión o tiempo agotado. */
  status: number;
  /** `'RN-05'`, `'RF-47'`, `'CONCURRENCIA'`… (extensión `code` del ProblemDetails). */
  code?: string;
  /** El mensaje para el usuario, ya en español (RUI-01). */
  detail?: string;
  /** Errores por campo del 400, con las claves tal como llegan (RUI-02). */
  errors: Record<string, string[]>;
  /** El código para reportar un error inesperado (RUI-03). */
  traceId?: string;
  /** Segundos del 429, del encabezado `Retry-After` (RUI-03, COR-02). */
  retryAfter?: number;
  /** Las demás extensiones, p. ej. `usuarioId` del 409 RN-39 (RUI-04). */
  datos: Record<string, unknown>;
}

// Campos del ProblemDetails que tienen su propio lugar en ErrorApi o que no se usan.
const CAMPOS_CONOCIDOS = new Set(['type', 'title', 'status', 'detail', 'instance', 'errors', 'code', 'traceId']);

/** Convierte cualquier error de una petición en un `ErrorApi`. */
export function aErrorApi(error: unknown): ErrorApi {
  const status = error instanceof HttpErrorResponse ? error.status : 0;
  const cuerpo = error instanceof HttpErrorResponse && status !== 0 ? aObjeto(error.error) : null;
  const code = texto(cuerpo?.['code']);

  const datos: Record<string, unknown> = {};
  for (const [clave, valor] of Object.entries(cuerpo ?? {})) {
    if (!CAMPOS_CONOCIDOS.has(clave)) datos[clave] = valor;
  }

  return {
    name: 'ErrorApi',
    message: code ? `HTTP ${status} ${code}` : `HTTP ${status}`,
    status,
    code,
    detail: texto(cuerpo?.['detail']),
    errors: erroresPorCampo(cuerpo?.['errors']),
    traceId: texto(cuerpo?.['traceId']),
    retryAfter: error instanceof HttpErrorResponse ? segundos(error.headers.get('Retry-After')) : undefined,
    datos,
  };
}

export function esErrorApi(valor: unknown): valor is ErrorApi {
  return typeof valor === 'object' && valor !== null && (valor as { name?: unknown }).name === 'ErrorApi';
}

/** El cuerpo como objeto. Un texto se lee como JSON; si no lo es (p. ej. HTML de un proxy), se ignora. */
function aObjeto(cuerpo: unknown): Record<string, unknown> | null {
  let valor = cuerpo;
  if (typeof valor === 'string') {
    try {
      valor = JSON.parse(valor);
    } catch {
      return null;
    }
  }
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor)
    ? (valor as Record<string, unknown>)
    : null;
}

function texto(valor: unknown): string | undefined {
  return typeof valor === 'string' && valor !== '' ? valor : undefined;
}

function erroresPorCampo(valor: unknown): Record<string, string[]> {
  const errores: Record<string, string[]> = {};
  if (typeof valor !== 'object' || valor === null) return errores;
  for (const [campo, mensajes] of Object.entries(valor)) {
    if (Array.isArray(mensajes) && mensajes.every((m) => typeof m === 'string')) errores[campo] = mensajes;
  }
  return errores;
}

/** `Retry-After` en segundos. La API lo envía como entero (COR-02). */
function segundos(valor: string | null): number | undefined {
  return valor !== null && /^\d+$/.test(valor.trim()) ? Number(valor.trim()) : undefined;
}
