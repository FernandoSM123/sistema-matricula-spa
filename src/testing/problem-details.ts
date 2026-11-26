// Cuerpos de error como los envía la API (ProblemDetails, RFC 9457; §5.1 de los requerimientos).

export const TRACE_ID = '00-8e6310e497950a1c66c2750f1bd7dec4-0713595d60009a6c-00';

export const PROBLEM_400 = {
  type: 'https://tools.ietf.org/html/rfc9110#section-15.5.1',
  title: 'One or more validation errors occurred.',
  status: 400,
  detail: 'Revise los datos enviados.',
  errors: { Cedula: ['La cédula es obligatoria.'], 'Horarios[0].HoraFin': ['La hora de fin debe ser posterior.'] },
  traceId: TRACE_ID,
};

export const PROBLEM_409_RN39 = {
  title: 'Conflict',
  status: 409,
  detail: 'Ya existe un estudiante inactivo con esa cédula. Reactívelo.',
  code: 'RN-39',
  usuarioId: 12,
  traceId: TRACE_ID,
};

export const PROBLEM_403_RN24 = {
  title: 'Forbidden',
  status: 403,
  detail: 'Debe cambiar su contraseña antes de continuar.',
  code: 'RN-24',
  traceId: TRACE_ID,
};

export const PROBLEM_401 = {
  type: 'https://tools.ietf.org/html/rfc9110#section-15.5.2',
  title: 'Unauthorized',
  status: 401,
  traceId: TRACE_ID,
};

export const PROBLEM_500 = {
  title: 'Error interno',
  status: 500,
  detail: 'Ocurrió un error inesperado.',
  traceId: TRACE_ID,
};
