import { normalizeWhitespace } from '../../../testing/whitespace';
import { EtiquetaPipe } from './etiqueta-pipe';
import { FechaHoraPipe } from './fecha-hora-pipe';
import { FechaPipe } from './fecha-pipe';
import { HoraPipe } from './hora-pipe';
import { MonedaPipe } from './moneda-pipe';
import { NumeroPipe } from './numero-pipe';

// Los pipes solo delegan en los formateadores, que tienen sus propias pruebas.
describe('pipes de formatos', () => {
  it('fecha', () => {
    expect(new FechaPipe().transform('2026-03-05')).toBe('05/03/2026');
    expect(new FechaPipe().transform(null)).toBe('');
  });

  it('fechaHora, con la zona del instituto o la que recibe', () => {
    expect(normalizeWhitespace(new FechaHoraPipe().transform('2026-03-06T00:30:00Z'))).toBe('05/03/2026 6:30 p. m.');
    expect(normalizeWhitespace(new FechaHoraPipe().transform('2026-03-06T00:30:00Z', 'UTC'))).toBe(
      '06/03/2026 12:30 a. m.',
    );
  });

  it('hora', () => {
    expect(normalizeWhitespace(new HoraPipe().transform('18:30:00'))).toBe('6:30 p. m.');
  });

  it('moneda', () => {
    expect(normalizeWhitespace(new MonedaPipe().transform(25000))).toBe('₡25 000,00');
  });

  it('numero', () => {
    expect(normalizeWhitespace(new NumeroPipe().transform(1234))).toBe('1 234');
  });

  it('etiqueta', () => {
    expect(new EtiquetaPipe().transform('EnCurso', 'estadoGrupo')).toBe('En curso');
    expect(new EtiquetaPipe().transform(undefined, 'estadoGrupo')).toBe('');
  });
});
