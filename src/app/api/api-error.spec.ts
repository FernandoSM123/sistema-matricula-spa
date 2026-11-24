import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { PROBLEM_400, PROBLEM_409_RN39, PROBLEM_500, TRACE_ID } from '../../testing/problem-details';
import { isApiError, toApiError } from './api-error';

const response = (status: number, error: unknown, headers?: Record<string, string>) =>
  new HttpErrorResponse({ status, error, headers: new HttpHeaders(headers), url: 'http://api/x' });

describe('toApiError (§3.5)', () => {
  it('un 400 trae los errores por campo, tal como llegan (RUI-02)', () => {
    const error = toApiError(response(400, PROBLEM_400));
    expect(error.status).toBe(400);
    expect(error.detail).toBe('Revise los datos enviados.');
    expect(error.errors).toEqual(PROBLEM_400.errors);
    expect(error.traceId).toBe(TRACE_ID);
    expect(error.data).toEqual({});
  });

  it('un 409 trae el code y deja las demás extensiones en data (RUI-04)', () => {
    const error = toApiError(response(409, PROBLEM_409_RN39));
    expect(error.code).toBe('RN-39');
    expect(error.data).toEqual({ usuarioId: 12 });
    expect(error.errors).toEqual({});
  });

  it('un 500 trae el traceId para reportarlo (RUI-03)', () => {
    const error = toApiError(response(500, PROBLEM_500));
    expect(error.status).toBe(500);
    expect(error.traceId).toBe(TRACE_ID);
  });

  it.each([
    ['30', 30],
    ['0', 0],
    ['abc', undefined],
    ['-5', undefined],
  ])('un 429 con Retry-After %s da retryAfter %s', (value, expected) => {
    const error = toApiError(
      response(429, { status: 429, detail: 'Demasiadas solicitudes.' }, { 'Retry-After': value }),
    );
    expect(error.retryAfter).toBe(expected);
  });

  it('un 429 sin Retry-After no trae retryAfter', () => {
    expect(toApiError(response(429, { status: 429 })).retryAfter).toBeUndefined();
  });

  it('sin respuesta (error de red) da status 0', () => {
    const error = toApiError(response(0, new ProgressEvent('error')));
    expect(error.status).toBe(0);
    expect(error.detail).toBeUndefined();
  });

  it('con el tiempo agotado da status 0', () => {
    const error = toApiError(new HttpErrorResponse({ error: new DOMException('signal timed out', 'TimeoutError') }));
    expect(error.status).toBe(0);
  });

  it('lee un ProblemDetails que llegó como texto', () => {
    expect(toApiError(response(409, JSON.stringify(PROBLEM_409_RN39))).code).toBe('RN-39');
  });

  it('no copia al detail un cuerpo que no es un ProblemDetails (RUI-05)', () => {
    const error = toApiError(response(502, '<html><body>Bad Gateway</body></html>'));
    expect(error.status).toBe(502);
    expect(error.detail).toBeUndefined();
    expect(error.data).toEqual({});
  });

  it('descarta los errores de campo que no son listas de textos', () => {
    const error = toApiError(response(400, { errors: { Nombre: ['Requerido'], Raro: 'x', Mixto: ['ok', 3] } }));
    expect(error.errors).toEqual({ Nombre: ['Requerido'] });
  });

  it('un error que no es de HTTP se trata como sin respuesta', () => {
    expect(toApiError(new TypeError('Failed to fetch')).status).toBe(0);
  });

  it('es un error para httpResource (name y message) y isApiError lo reconoce', () => {
    const error = toApiError(response(409, PROBLEM_409_RN39));
    expect(error.name).toBe('ApiError');
    expect(error.message).toBe('HTTP 409 RN-39');
    expect(isApiError(error)).toBe(true);
    expect(isApiError(new Error('x'))).toBe(false);
    expect(isApiError(null)).toBe(false);
  });
});
