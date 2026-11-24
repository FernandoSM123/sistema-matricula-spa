import { normalizeWhitespace } from '../../../testing/whitespace';
import {
  formatearFecha,
  formatearFechaHora,
  formatearHora,
  formatearMoneda,
  formatearNumero,
  ZONA_INSTITUTO,
} from './formateadores';

describe('formateadores', () => {
  it('ZONA_INSTITUTO es la de Costa Rica', () => {
    expect(ZONA_INSTITUTO).toBe('America/Costa_Rica');
  });

  describe('formatearFecha (RUI-15)', () => {
    it('muestra un DateOnly como dd/mm/aaaa', () => {
      expect(formatearFecha('2026-03-05')).toBe('05/03/2026');
    });

    it('no crea un Date, para no convertir la zona', () => {
      vi.stubGlobal(
        'Date',
        class {
          constructor() {
            throw new Error('formatearFecha no debe crear un Date');
          }
        },
      );
      try {
        expect(formatearFecha('2026-12-31')).toBe('31/12/2026');
      } finally {
        vi.unstubAllGlobals();
      }
    });

    it('devuelve tal cual un texto que no es una fecha', () => {
      expect(formatearFecha('05/03/2026')).toBe('05/03/2026');
    });
  });

  describe('formatearFechaHora (RUI-16)', () => {
    it('convierte una marca UTC de la noche al día anterior en Costa Rica', () => {
      expect(normalizeWhitespace(formatearFechaHora('2026-03-06T00:30:00Z'))).toBe('05/03/2026 6:30 p. m.');
    });

    it('usa la zona que recibe, no la del dispositivo', () => {
      expect(normalizeWhitespace(formatearFechaHora('2026-03-06T00:30:00Z', 'UTC'))).toBe('06/03/2026 12:30 a. m.');
      expect(normalizeWhitespace(formatearFechaHora('2026-03-06T00:30:00Z', 'Europe/Madrid'))).toBe(
        '06/03/2026 1:30 a. m.',
      );
    });

    it('acepta fracciones de segundo y un desplazamiento explícito', () => {
      expect(normalizeWhitespace(formatearFechaHora('2026-03-05T18:30:00.1234567+00:00'))).toBe(
        '05/03/2026 12:30 p. m.',
      );
    });

    it('devuelve tal cual un texto que no es una marca de tiempo', () => {
      expect(formatearFechaHora('ayer')).toBe('ayer');
    });
  });

  describe('formatearHora (RUI-17)', () => {
    it.each([
      ['18:30:00', '6:30 p. m.'],
      ['12:00:00', '12:00 p. m.'],
      ['00:00:00', '12:00 a. m.'],
      ['07:05:00', '7:05 a. m.'],
      ['18:30', '6:30 p. m.'],
    ])('%s → %s', (valor, esperado) => {
      expect(normalizeWhitespace(formatearHora(valor))).toBe(esperado);
    });

    it('devuelve tal cual un texto que no es una hora', () => {
      expect(formatearHora('25:00:00')).toBe('25:00:00');
    });
  });

  describe('formatearMoneda y formatearNumero (RUI-18)', () => {
    it('muestra colones con dos decimales', () => {
      expect(normalizeWhitespace(formatearMoneda(25000))).toBe('₡25 000,00');
      expect(normalizeWhitespace(formatearMoneda(1500.5))).toBe('₡1 500,50');
    });

    it('muestra un número con el separador de miles de es-CR', () => {
      expect(normalizeWhitespace(formatearNumero(1234))).toBe('1 234');
      expect(formatearNumero(30)).toBe('30');
      expect(formatearNumero(0)).toBe('0');
    });
  });

  describe('valores vacíos', () => {
    it.each([null, undefined, ''])('%s → texto vacío', (valor) => {
      expect(formatearFecha(valor)).toBe('');
      expect(formatearFechaHora(valor)).toBe('');
      expect(formatearHora(valor)).toBe('');
    });

    it.each([null, undefined, Number.NaN])('el número %s → texto vacío', (valor) => {
      expect(formatearMoneda(valor)).toBe('');
      expect(formatearNumero(valor)).toBe('');
    });
  });
});
