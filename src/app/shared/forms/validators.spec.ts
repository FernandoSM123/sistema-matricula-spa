import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LIMITS } from './limits';
import {
  cedula,
  endAfterStart,
  fieldsMatch,
  greaterThan,
  minDate,
  notFutureDate,
  passwordPolicy,
  telefono,
} from './validators';

const text = (length: number, char = 'a') => char.repeat(length);

/** Los errores de un control con esos validadores y ese valor. */
function errorsOf(value: unknown, ...validators: Parameters<typeof Validators.compose>[0]) {
  return new FormControl(value, Validators.compose(validators)).errors;
}

describe('validadores (RUI-06, §5.2)', () => {
  describe('cédula', () => {
    const validators = [Validators.required, Validators.maxLength(LIMITS.persona.cedula), cedula];

    it.each([
      ['20 caracteres', text(20, '1'), null],
      ['letras, dígitos y guiones', 'A-1234-b', null],
      ['21 caracteres', text(21, '1'), { maxlength: { requiredLength: 20, actualLength: 21 } }],
      ['un espacio', '1 234', { cedula: true }],
      ['un punto', '1.234', { cedula: true }],
      ['vacía', '', { required: true }],
    ])('%s', (_case, value, expected) => {
      expect(errorsOf(value, ...validators)).toEqual(expected);
    });
  });

  describe('teléfono', () => {
    it.each([
      ['7 caracteres', '8888888', { telefono: true }],
      ['8 caracteres', '88888888', null],
      ['20 caracteres', '+506 8888-8888 12345', null],
      ['21 caracteres', '+506 8888-8888 123456', { telefono: true }],
      ['una letra', '8888-888a', { telefono: true }],
      ['vacío, lo deja a required', '', null],
    ])('%s', (_case, value, expected) => {
      expect(errorsOf(value, telefono)).toEqual(expected);
    });
  });

  it('nombre: 100 caracteres sí, 101 no', () => {
    const max = Validators.maxLength(LIMITS.persona.nombre);
    expect(errorsOf(text(100), max)).toBeNull();
    expect(errorsOf(text(101), max)).toEqual({ maxlength: { requiredLength: 100, actualLength: 101 } });
  });

  describe('contraseña (RN-26)', () => {
    const validators = [Validators.maxLength(LIMITS.password.max), passwordPolicy];

    it.each([
      ['8 caracteres con mayúscula y número', 'Abcdefg1', null],
      ['una mayúscula con tilde o eñe', 'ñandú1Ñ1', null],
      ['128 caracteres', `A1${text(126)}`, null],
      ['7 caracteres', 'Abcdef1', { passwordPolicy: true }],
      ['sin mayúscula', 'abcdefg1', { passwordPolicy: true }],
      ['sin número', 'Abcdefgh', { passwordPolicy: true }],
      ['un dígito que no es del 0 al 9', 'Abcdefg١', { passwordPolicy: true }],
      ['129 caracteres', `A1${text(127)}`, { maxlength: { requiredLength: 128, actualLength: 129 } }],
      ['vacía, la deja a required', '', null],
    ])('%s', (_case, value, expected) => {
      expect(errorsOf(value, ...validators)).toEqual(expected);
    });
  });

  describe('confirmación (RN-25)', () => {
    const form = (contrasena: string, confirmacion: string) =>
      new FormGroup(
        { contrasena: new FormControl(contrasena), confirmacion: new FormControl(confirmacion) },
        { validators: fieldsMatch('contrasena', 'confirmacion') },
      );

    it('iguales, sin error', () => expect(form('Abcdefg1', 'Abcdefg1').errors).toBeNull());
    it('distintas, con error en el grupo', () =>
      expect(form('Abcdefg1', 'Abcdefg2').errors).toEqual({ fieldsMatch: true }));
    it('confirmación vacía, la deja a required', () => expect(form('Abcdefg1', '').errors).toBeNull());
  });

  describe('fechas', () => {
    afterEach(() => vi.useRealTimers());

    it('notFutureDate compara con hoy en Costa Rica, no en la zona de la máquina', () => {
      // 2026-11-27 a las 23:30 en Costa Rica (UTC-6) ya es el 28 en UTC.
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date('2026-11-28T05:30:00Z'));

      expect(errorsOf('2026-11-27', notFutureDate)).toBeNull();
      expect(errorsOf('2026-11-28', notFutureDate)).toEqual({ notFutureDate: true });
    });

    it('notFutureDate lee el Date del selector por sus campos locales', () => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date('2026-11-27T18:00:00Z'));

      expect(errorsOf(new Date(2026, 10, 27), notFutureDate)).toBeNull();
      expect(errorsOf(new Date(2026, 10, 28), notFutureDate)).toEqual({ notFutureDate: true });
    });

    it('minDate: 1900-01-01 sí, 1899-12-31 no', () => {
      const validator = minDate(LIMITS.persona.fechaMinima);
      expect(errorsOf(new Date(1900, 0, 1), validator)).toBeNull();
      expect(errorsOf('1900-01-01', validator)).toBeNull();
      expect(errorsOf(new Date(1899, 11, 31), validator)).toEqual({ minDate: { min: '1900-01-01' } });
    });

    it('vacías o ilegibles, las dejan a required y al selector', () => {
      expect(errorsOf(null, notFutureDate, minDate('1900-01-01'))).toBeNull();
      expect(errorsOf(new Date(Number.NaN), notFutureDate, minDate('1900-01-01'))).toBeNull();
    });
  });

  describe('greaterThan', () => {
    it.each([
      [0, { greaterThan: { limit: 0 } }],
      [-1, { greaterThan: { limit: 0 } }],
      [1, null],
      ['1', null],
      ['abc', { greaterThan: { limit: 0 } }],
      [null, null],
    ])('%s', (value, expected) => {
      expect(errorsOf(value, greaterThan(0))).toEqual(expected);
    });
  });

  describe('bloque de horario (RN-15)', () => {
    const block = (horaInicio: unknown, horaFin: unknown) =>
      new FormGroup(
        { horaInicio: new FormControl(horaInicio), horaFin: new FormControl(horaFin) },
        { validators: endAfterStart('horaInicio', 'horaFin') },
      );

    it('fin posterior al inicio, sin error', () => expect(block('08:00', '08:15').errors).toBeNull());
    it('fin igual al inicio, con error', () => expect(block('08:00', '08:00').errors).toEqual({ endAfterStart: true }));
    it('fin anterior al inicio, con error', () =>
      expect(block('10:00', '08:00:00').errors).toEqual({ endAfterStart: true }));
    it('lee los Date del selector de hora', () => {
      expect(block(new Date(2026, 0, 1, 18, 30), new Date(2026, 0, 1, 20, 0)).errors).toBeNull();
      expect(block(new Date(2026, 0, 1, 18, 30), new Date(2026, 0, 1, 18, 30)).errors).toEqual({
        endAfterStart: true,
      });
    });
    it('con una hora vacía, sin error', () => expect(block('08:00', null).errors).toBeNull());
  });
});
