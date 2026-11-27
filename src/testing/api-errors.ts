import type { ApiError } from '../app/api/api-error';
import { TRACE_ID } from './problem-details';

// Un `ApiError` de cada fila de docs/arquitectura.md §3.5, ya interpretado, para las pruebas de las
// piezas que lo presentan (applyServerErrors, ActionError, ContentState).

export function apiError(error: Partial<ApiError> & Pick<ApiError, 'status'>): ApiError {
  return {
    name: 'ApiError',
    message: error.code ? `HTTP ${error.status} ${error.code}` : `HTTP ${error.status}`,
    errors: {},
    data: {},
    traceId: error.status === 0 ? undefined : TRACE_ID,
    ...error,
  };
}

export const ERROR_400 = apiError({
  status: 400,
  detail: 'Revise los datos enviados.',
  errors: {
    Cedula: ['La cédula no puede superar los 20 caracteres.'],
    'Horarios[0].HoraFin': ['La hora de fin debe ser posterior a la hora de inicio.'],
    Periodo: ['El periodo no existe.', 'Seleccione otro periodo.'],
  },
});

export const ERROR_403 = apiError({ status: 403, detail: 'No puede modificar los datos de otro usuario.' });

export const ERROR_403_RN18 = apiError({
  status: 403,
  code: 'RN-18',
  detail: 'Solo el profesor del grupo puede ver sus estudiantes.',
});

export const ERROR_404 = apiError({ status: 404, detail: 'El estudiante no existe.' });

export const ERROR_409_RN39 = apiError({
  status: 409,
  code: 'RN-39',
  detail: 'Ya existe un estudiante inactivo con esa cédula. Reactívelo.',
  data: { usuarioId: 12 },
});

export const ERROR_409_RF09 = apiError({
  status: 409,
  code: 'RF-09',
  detail: 'La contraseña actual no es correcta.',
});

export const ERROR_409_CONCURRENCIA = apiError({
  status: 409,
  code: 'CONCURRENCIA',
  detail: 'Otra persona modificó el grupo al mismo tiempo. Intente de nuevo.',
});

export const ERROR_409_UNKNOWN = apiError({
  status: 409,
  code: 'RN-99',
  detail: 'El grupo no admite la operación.',
});

export const ERROR_429 = apiError({
  status: 429,
  detail: 'Demasiados intentos. Intente de nuevo más tarde.',
  retryAfter: 30,
});

export const ERROR_429_WITHOUT_RETRY = apiError({
  status: 429,
  detail: 'Demasiados intentos. Intente de nuevo más tarde.',
});

export const ERROR_500 = apiError({ status: 500, detail: 'Ocurrió un error inesperado.' });

export const ERROR_NO_RESPONSE = apiError({ status: 0 });
