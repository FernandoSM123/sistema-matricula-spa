import { HttpErrorResponse } from '@angular/common/http';

/**
 * Un error de la API ya interpretado (docs/arquitectura.md §3.5). `errorInterceptor` convierte
 * toda respuesta de error en uno, así los componentes nunca leen un `ProblemDetails` crudo (RUI-05).
 */
export interface ApiError {
  /** Siempre `'ApiError'`. Con `message`, hace que `httpResource` lo entregue tal cual, sin envolverlo. */
  name: 'ApiError';
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
  data: Record<string, unknown>;
}

// Campos del ProblemDetails que tienen su propio lugar en ApiError o que no se usan.
const KNOWN_FIELDS = new Set(['type', 'title', 'status', 'detail', 'instance', 'errors', 'code', 'traceId']);

/** Convierte cualquier error de una petición en un `ApiError`. */
export function toApiError(error: unknown): ApiError {
  const status = error instanceof HttpErrorResponse ? error.status : 0;
  const body = error instanceof HttpErrorResponse && status !== 0 ? toObject(error.error) : null;
  const code = asText(body?.['code']);

  const data: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body ?? {})) {
    if (!KNOWN_FIELDS.has(key)) data[key] = value;
  }

  return {
    name: 'ApiError',
    message: code ? `HTTP ${status} ${code}` : `HTTP ${status}`,
    status,
    code,
    detail: asText(body?.['detail']),
    errors: fieldErrors(body?.['errors']),
    traceId: asText(body?.['traceId']),
    retryAfter: error instanceof HttpErrorResponse ? seconds(error.headers.get('Retry-After')) : undefined,
    data,
  };
}

export function isApiError(value: unknown): value is ApiError {
  return typeof value === 'object' && value !== null && (value as { name?: unknown }).name === 'ApiError';
}

/** El cuerpo como objeto. Un texto se lee como JSON; si no lo es (p. ej. HTML de un proxy), se ignora. */
function toObject(body: unknown): Record<string, unknown> | null {
  let value = body;
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value);
    } catch {
      return null;
    }
  }
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asText(value: unknown): string | undefined {
  return typeof value === 'string' && value !== '' ? value : undefined;
}

function fieldErrors(value: unknown): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  if (typeof value !== 'object' || value === null) return errors;
  for (const [field, messages] of Object.entries(value)) {
    if (Array.isArray(messages) && messages.every((m) => typeof m === 'string')) errors[field] = messages;
  }
  return errors;
}

/** `Retry-After` en segundos. La API lo envía como entero (COR-02). */
function seconds(value: string | null): number | undefined {
  return value !== null && /^\d+$/.test(value.trim()) ? Number(value.trim()) : undefined;
}
