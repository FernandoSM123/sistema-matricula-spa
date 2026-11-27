import type { ApiError } from '../../api/api-error';

/**
 * Lo que falló, como `ApiError`. Los errores de la API ya llegan así (`errorInterceptor`); otro error
 * es un fallo del propio SPA y se presenta como uno inesperado, sin detalles (RUI-05).
 *
 * `shared` solo importa tipos de `api` (§2.3), por eso no usa `isApiError`.
 */
export function asApiError(error: unknown): ApiError {
  if (typeof error === 'object' && error !== null && (error as { name?: unknown }).name === 'ApiError') {
    return error as ApiError;
  }
  return { name: 'ApiError', message: 'Error del cliente', status: 500, errors: {}, data: {} };
}
