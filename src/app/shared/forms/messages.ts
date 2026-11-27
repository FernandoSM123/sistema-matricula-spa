import { ValidationErrors } from '@angular/forms';
import { formatDate } from '../formatting/formatters';

// Mensajes de los errores de validación (RUI-06, docs/arquitectura.md §5.2), con trato de usted
// (RUI-22). Siguen la redacción de los validadores del backend, para que el mensaje del cliente y
// el de la API digan lo mismo.

type Message = (value: unknown, field: string | undefined) => string;

const MESSAGES: Record<string, Message> = {
  // `field` es el dato con su artículo ("la cédula", "los apellidos"), como en el backend.
  required: (_value, field) => (field ? `Indique ${field}.` : 'Indique este dato.'),
  maxlength: (value) => `Use hasta ${length(value)} caracteres.`,
  minlength: (value) => `Use al menos ${length(value)} caracteres.`,
  email: () => 'El correo no tiene un formato válido.',
  min: (value) => `Use un valor mayor o igual a ${limit(value, 'min')}.`,
  cedula: () => 'La cédula solo admite letras, números y guiones.',
  telefono: () => 'De 8 a 20 caracteres: dígitos, espacios, + y -.',
  passwordPolicy: () => 'Use al menos 8 caracteres, con una mayúscula y un número.',
  fieldsMatch: () => 'Las contraseñas no coinciden.',
  notFutureDate: () => 'La fecha no puede ser futura.',
  minDate: (value) => `La fecha no puede ser anterior al ${formatDate(limit(value, 'min'))}.`,
  greaterThan: (value) => `Use un valor mayor que ${limit(value, 'limit')}.`,
  endAfterStart: () => 'La hora de fin debe ser posterior a la hora de inicio.',
  // Lo que el selector de fecha o de hora no pudo leer.
  matDatepickerParse: () => 'Escriba la fecha como dd/mm/aaaa.',
  matTimepickerParse: () => 'Escriba la hora como 6:30 p. m.',
  // El mensaje de la API, que `applyServerErrors` pone en el campo (RUI-02).
  server: (value) => String(value),
};

const UNKNOWN = 'Revise este dato.';

/**
 * El mensaje del primer error, o `null` si no hay errores. `field` es el nombre del dato con su
 * artículo, para el mensaje de `required` ("Indique la cédula."). Un error sin mensaje propio da
 * un texto genérico, para no mostrar nunca el nombre técnico del error.
 */
export function errorMessage(errors: ValidationErrors | null | undefined, field?: string): string | null {
  const [key, value] = Object.entries(errors ?? {})[0] ?? [];
  if (key === undefined) return null;
  return MESSAGES[key]?.(value, field) ?? UNKNOWN;
}

function length(value: unknown): string {
  return String((value as { requiredLength?: unknown } | null)?.requiredLength ?? '');
}

function limit(value: unknown, key: string): string {
  return String((value as Record<string, unknown> | null)?.[key] ?? '');
}
