import { ValidatorFn } from '@angular/forms';
import { APP_TIME_ZONE } from '../formatting/formatters';
import { CEDULA_PATTERN, LIMITS, TELEFONO_PATTERN } from './limits';

// Validadores de RUI-06 que usan varios formularios (docs/arquitectura.md §5.2). Cada uno devuelve
// un error con nombre, cuyo mensaje está en messages.ts, y deja lo vacío a `Validators.required`.
// Los de un solo formulario (`periodoDates`, el del grupo) llegan con su módulo (decisión 2 de
// SPEC-componentes).

/** Cédula: letras, dígitos y guiones. El largo lo revisa `maxLength(LIMITS.persona.cedula)`. */
export const cedula: ValidatorFn = (control) =>
  isEmpty(control.value) || CEDULA_PATTERN.test(String(control.value)) ? null : { cedula: true };

/** Teléfono: de 8 a 20 dígitos, espacios, `+` y `-`. */
export const telefono: ValidatorFn = (control) =>
  isEmpty(control.value) || TELEFONO_PATTERN.test(String(control.value)) ? null : { telefono: true };

/**
 * RN-26: al menos 8 caracteres, una mayúscula y un número (`PasswordPolicy`). Como en el backend,
 * cualquier mayúscula cuenta (también `Ñ` o `É`), pero solo los dígitos del 0 al 9. El máximo de
 * 128 lo revisa `maxLength(LIMITS.password.max)`.
 */
export const passwordPolicy: ValidatorFn = (control) => {
  const value: unknown = control.value;
  if (isEmpty(value)) return null;
  const text = String(value);
  const valid = text.length >= LIMITS.password.min && /\p{Lu}/u.test(text) && /[0-9]/.test(text);
  return valid ? null : { passwordPolicy: true };
};

/**
 * RN-25: la confirmación coincide (validador del grupo). Si la confirmación está vacía, no hay
 * error: lo marca su `required`.
 */
export function fieldsMatch(field: string, confirmation: string): ValidatorFn {
  return (group) => {
    const confirmationValue: unknown = group.get(confirmation)?.value;
    if (isEmpty(confirmationValue)) return null;
    return group.get(field)?.value === confirmationValue ? null : { fieldsMatch: true };
  };
}

/** La fecha no es posterior a hoy en Costa Rica (fecha de nacimiento). */
export const notFutureDate: ValidatorFn = (control) => {
  const date = toDateOnly(control.value);
  return date === null || date <= today() ? null : { notFutureDate: true };
};

/** La fecha no es anterior a `min` (`'yyyy-MM-dd'`), p. ej. `LIMITS.persona.fechaMinima`. */
export function minDate(min: string): ValidatorFn {
  return (control) => {
    const date = toDateOnly(control.value);
    return date === null || date >= min ? null : { minDate: { min } };
  };
}

/** El número es mayor que `limit` (duración, capacidad, cupo). */
export function greaterThan(limit: number): ValidatorFn {
  return (control) => {
    const value: unknown = control.value;
    if (isEmpty(value)) return null;
    const number = Number(value);
    return Number.isFinite(number) && number > limit ? null : { greaterThan: { limit } };
  };
}

/** RN-15: la hora de fin es posterior a la de inicio (validador del grupo del bloque de horario). */
export function endAfterStart(start: string, end: string): ValidatorFn {
  return (group) => {
    const startMinutes = toMinutes(group.get(start)?.value);
    const endMinutes = toMinutes(group.get(end)?.value);
    if (startMinutes === null || endMinutes === null) return null;
    return endMinutes > startMinutes ? null : { endAfterStart: true };
  };
}

function isEmpty(value: unknown): boolean {
  return value === null || value === undefined || value === '';
}

/** Hoy en la zona del instituto, como `'yyyy-MM-dd'` (`en-CA` escribe ese formato). */
function today(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: APP_TIME_ZONE }).format(new Date());
}

/**
 * Una fecha del formulario como `'yyyy-MM-dd'`, que se compara como texto. El selector de fecha
 * entrega un `Date` a medianoche local (date-fns), así que se leen sus campos locales, sin zona.
 * Un valor vacío o que no se reconoce da `null`: lo marcan `required` o el selector.
 */
function toDateOnly(value: unknown): string | null {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${String(value.getFullYear()).padStart(4, '0')}-${month}-${day}`;
  }
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

/** Una hora del formulario (`Date` del selector de hora o `'HH:mm[:ss]'`) en minutos del día. */
function toMinutes(value: unknown): number | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.getHours() * 60 + value.getMinutes();
  }
  const match = typeof value === 'string' ? /^(\d{2}):(\d{2})/.exec(value) : null;
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}
