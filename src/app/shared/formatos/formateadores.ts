// Formatos de RUI-15 a RUI-18 (docs/arquitectura.md §7). Funciones puras: las usan los pipes,
// el adaptador de fechas y el horario. Un valor vacío da '' y uno que no se reconoce se
// devuelve tal cual, para no ocultar un dato inesperado de la API.

export const LOCALE_INSTITUTO = 'es-CR';
export const ZONA_INSTITUTO = 'America/Costa_Rica';

type Texto = string | null | undefined;
type Numero = number | null | undefined;

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_ONLY = /^([01]\d|2[0-3]):([0-5]\d)(?::[0-5]\d(?:\.\d+)?)?$/;

/** `'2026-03-05'` → `05/03/2026`. Se arma desde el texto, sin `Date` ni zona (RUI-15). */
export function formatearFecha(valor: Texto): string {
  if (!valor) return '';
  const partes = DATE_ONLY.exec(valor);
  return partes ? `${partes[3]}/${partes[2]}/${partes[1]}` : valor;
}

/** Marca UTC → `05/03/2026 6:30 p. m.` en la zona del instituto (RUI-16). */
export function formatearFechaHora(valor: Texto, zona: string = ZONA_INSTITUTO): string {
  if (!valor) return '';
  const instante = new Date(valor);
  if (Number.isNaN(instante.getTime())) return valor;
  // Fecha y hora por separado: juntas, Intl pone una coma entre ellas.
  return `${formatoFecha(zona).format(instante)} ${formatoHora(zona).format(instante)}`;
}

/** `TimeOnly` `'18:30:00'` → `6:30 p. m.`, sin convertir la zona (RUI-17). */
export function formatearHora(valor: Texto): string {
  if (!valor) return '';
  const partes = TIME_ONLY.exec(valor);
  if (!partes) return valor;
  // La hora no tiene zona: se formatea como UTC para que Intl no la convierta.
  return formatoHora('UTC').format(Date.UTC(1970, 0, 1, Number(partes[1]), Number(partes[2])));
}

/** `25000` → `₡25 000,00` (RUI-18). */
export function formatearMoneda(valor: Numero): string {
  return esNumero(valor) ? FORMATO_MONEDA.format(valor) : '';
}

/** `1234` → `1 234`, con el separador de miles de es-CR (RUI-18). */
export function formatearNumero(valor: Numero): string {
  return esNumero(valor) ? FORMATO_NUMERO.format(valor) : '';
}

const FORMATO_MONEDA = new Intl.NumberFormat(LOCALE_INSTITUTO, {
  style: 'currency',
  currency: 'CRC',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const FORMATO_NUMERO = new Intl.NumberFormat(LOCALE_INSTITUTO);

// Crear un Intl.DateTimeFormat es caro; se guarda uno por zona.
const formatosFecha = new Map<string, Intl.DateTimeFormat>();
const formatosHora = new Map<string, Intl.DateTimeFormat>();

function formatoFecha(zona: string): Intl.DateTimeFormat {
  return enCache(formatosFecha, zona, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatoHora(zona: string): Intl.DateTimeFormat {
  return enCache(formatosHora, zona, { hour: 'numeric', minute: '2-digit', hour12: true });
}

function enCache(
  cache: Map<string, Intl.DateTimeFormat>,
  zona: string,
  opciones: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  let formato = cache.get(zona);
  if (!formato) {
    formato = new Intl.DateTimeFormat(LOCALE_INSTITUTO, { ...opciones, timeZone: zona });
    cache.set(zona, formato);
  }
  return formato;
}

function esNumero(valor: Numero): valor is number {
  return typeof valor === 'number' && !Number.isNaN(valor);
}
