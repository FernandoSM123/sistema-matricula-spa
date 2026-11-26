import { normalizeWhitespace } from '../../../testing/whitespace';
import { formatDate, formatDateTime, formatTime, formatCurrency, formatNumber, APP_TIME_ZONE } from './formatters';

describe('formatters', () => {
  it('APP_TIME_ZONE es la de Costa Rica', () => {
    expect(APP_TIME_ZONE).toBe('America/Costa_Rica');
  });

  describe('formatDate (RUI-15)', () => {
    it('muestra un DateOnly como dd/mm/aaaa', () => {
      expect(formatDate('2026-03-05')).toBe('05/03/2026');
    });

    it('no crea un Date, para no convertir la zona', () => {
      vi.stubGlobal(
        'Date',
        class {
          constructor() {
            throw new Error('formatDate no debe crear un Date');
          }
        },
      );
      try {
        expect(formatDate('2026-12-31')).toBe('31/12/2026');
      } finally {
        vi.unstubAllGlobals();
      }
    });

    it('devuelve tal cual un texto que no es una fecha', () => {
      expect(formatDate('05/03/2026')).toBe('05/03/2026');
    });
  });

  describe('formatDateTime (RUI-16)', () => {
    it('convierte una marca UTC de la noche al día anterior en Costa Rica', () => {
      expect(normalizeWhitespace(formatDateTime('2026-03-06T00:30:00Z'))).toBe('05/03/2026 6:30 p. m.');
    });

    it('usa la zona que recibe, no la del dispositivo', () => {
      expect(normalizeWhitespace(formatDateTime('2026-03-06T00:30:00Z', 'UTC'))).toBe('06/03/2026 12:30 a. m.');
      expect(normalizeWhitespace(formatDateTime('2026-03-06T00:30:00Z', 'Europe/Madrid'))).toBe(
        '06/03/2026 1:30 a. m.',
      );
    });

    it('acepta fracciones de segundo y un desplazamiento explícito', () => {
      expect(normalizeWhitespace(formatDateTime('2026-03-05T18:30:00.1234567+00:00'))).toBe('05/03/2026 12:30 p. m.');
    });

    it('devuelve tal cual un texto que no es una marca de tiempo', () => {
      expect(formatDateTime('ayer')).toBe('ayer');
    });
  });

  describe('formatTime (RUI-17)', () => {
    it.each([
      ['18:30:00', '6:30 p. m.'],
      ['12:00:00', '12:00 p. m.'],
      ['00:00:00', '12:00 a. m.'],
      ['07:05:00', '7:05 a. m.'],
      ['18:30', '6:30 p. m.'],
    ])('%s → %s', (value, expected) => {
      expect(normalizeWhitespace(formatTime(value))).toBe(expected);
    });

    it('devuelve tal cual un texto que no es una hora', () => {
      expect(formatTime('25:00:00')).toBe('25:00:00');
    });
  });

  describe('formatCurrency y formatNumber (RUI-18)', () => {
    it('muestra colones con dos decimales', () => {
      expect(normalizeWhitespace(formatCurrency(25000))).toBe('₡25 000,00');
      expect(normalizeWhitespace(formatCurrency(1500.5))).toBe('₡1 500,50');
    });

    it('muestra un número con el separador de miles de es-CR', () => {
      expect(normalizeWhitespace(formatNumber(1234))).toBe('1 234');
      expect(formatNumber(30)).toBe('30');
      expect(formatNumber(0)).toBe('0');
    });
  });

  describe('valores vacíos', () => {
    it.each([null, undefined, ''])('%s → texto vacío', (value) => {
      expect(formatDate(value)).toBe('');
      expect(formatDateTime(value)).toBe('');
      expect(formatTime(value)).toBe('');
    });

    it.each([null, undefined, Number.NaN])('el número %s → texto vacío', (value) => {
      expect(formatCurrency(value)).toBe('');
      expect(formatNumber(value)).toBe('');
    });
  });
});
