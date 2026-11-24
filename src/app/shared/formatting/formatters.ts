// Formatos de RUI-15 a RUI-18 (docs/arquitectura.md §7). Funciones puras: las usan los pipes,
// el adaptador de fechas y el horario. Un valor vacío da '' y uno que no se reconoce se
// devuelve tal cual, para no ocultar un dato inesperado de la API.

export const APP_LOCALE = 'es-CR';
export const APP_TIME_ZONE = 'America/Costa_Rica';

type OptionalText = string | null | undefined;
type OptionalNumber = number | null | undefined;

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_ONLY = /^([01]\d|2[0-3]):([0-5]\d)(?::[0-5]\d(?:\.\d+)?)?$/;

/** `'2026-03-05'` → `05/03/2026`. Se arma desde el texto, sin `Date` ni zona (RUI-15). */
export function formatDate(value: OptionalText): string {
  if (!value) return '';
  const parts = DATE_ONLY.exec(value);
  return parts ? `${parts[3]}/${parts[2]}/${parts[1]}` : value;
}

/** Marca UTC → `05/03/2026 6:30 p. m.` en la zona del instituto (RUI-16). */
export function formatDateTime(value: OptionalText, timeZone: string = APP_TIME_ZONE): string {
  if (!value) return '';
  const instant = new Date(value);
  if (Number.isNaN(instant.getTime())) return value;
  // Fecha y hora por separado: juntas, Intl pone una coma entre ellas.
  return `${dateFormat(timeZone).format(instant)} ${timeFormat(timeZone).format(instant)}`;
}

/** `TimeOnly` `'18:30:00'` → `6:30 p. m.`, sin convertir la zona (RUI-17). */
export function formatTime(value: OptionalText): string {
  if (!value) return '';
  const parts = TIME_ONLY.exec(value);
  if (!parts) return value;
  // La hora no tiene zona: se formatea como UTC para que Intl no la convierta.
  return timeFormat('UTC').format(Date.UTC(1970, 0, 1, Number(parts[1]), Number(parts[2])));
}

/** `25000` → `₡25 000,00` (RUI-18). */
export function formatCurrency(value: OptionalNumber): string {
  return isNumber(value) ? CURRENCY_FORMAT.format(value) : '';
}

/** `1234` → `1 234`, con el separador de miles de es-CR (RUI-18). */
export function formatNumber(value: OptionalNumber): string {
  return isNumber(value) ? NUMBER_FORMAT.format(value) : '';
}

const CURRENCY_FORMAT = new Intl.NumberFormat(APP_LOCALE, {
  style: 'currency',
  currency: 'CRC',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const NUMBER_FORMAT = new Intl.NumberFormat(APP_LOCALE);

// Crear un Intl.DateTimeFormat es caro; se guarda uno por zona.
const dateFormats = new Map<string, Intl.DateTimeFormat>();
const timeFormats = new Map<string, Intl.DateTimeFormat>();

function dateFormat(timeZone: string): Intl.DateTimeFormat {
  return cached(dateFormats, timeZone, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function timeFormat(timeZone: string): Intl.DateTimeFormat {
  return cached(timeFormats, timeZone, { hour: 'numeric', minute: '2-digit', hour12: true });
}

function cached(
  cache: Map<string, Intl.DateTimeFormat>,
  timeZone: string,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  let format = cache.get(timeZone);
  if (!format) {
    format = new Intl.DateTimeFormat(APP_LOCALE, { ...options, timeZone: timeZone });
    cache.set(timeZone, format);
  }
  return format;
}

function isNumber(value: OptionalNumber): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}
