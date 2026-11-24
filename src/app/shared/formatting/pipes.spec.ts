import { normalizeWhitespace } from '../../../testing/whitespace';
import { SmLabelPipe } from './label-pipe';
import { SmDateTimePipe } from './date-time-pipe';
import { SmDatePipe } from './date-pipe';
import { SmTimePipe } from './time-pipe';
import { SmCurrencyPipe } from './currency-pipe';
import { SmNumberPipe } from './number-pipe';

// Los pipes solo delegan en los formateadores, que tienen sus propias pruebas.
describe('pipes de formatos', () => {
  it('smDate', () => {
    expect(new SmDatePipe().transform('2026-03-05')).toBe('05/03/2026');
    expect(new SmDatePipe().transform(null)).toBe('');
  });

  it('smDateTime, con la zona del instituto o la que recibe', () => {
    expect(normalizeWhitespace(new SmDateTimePipe().transform('2026-03-06T00:30:00Z'))).toBe('05/03/2026 6:30 p. m.');
    expect(normalizeWhitespace(new SmDateTimePipe().transform('2026-03-06T00:30:00Z', 'UTC'))).toBe(
      '06/03/2026 12:30 a. m.',
    );
  });

  it('smTime', () => {
    expect(normalizeWhitespace(new SmTimePipe().transform('18:30:00'))).toBe('6:30 p. m.');
  });

  it('smCurrency', () => {
    expect(normalizeWhitespace(new SmCurrencyPipe().transform(25000))).toBe('₡25 000,00');
  });

  it('smNumber', () => {
    expect(normalizeWhitespace(new SmNumberPipe().transform(1234))).toBe('1 234');
  });

  it('smLabel', () => {
    expect(new SmLabelPipe().transform('EnCurso', 'estadoGrupo')).toBe('En curso');
    expect(new SmLabelPipe().transform(undefined, 'estadoGrupo')).toBe('');
  });
});
