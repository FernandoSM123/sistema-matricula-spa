import { TestBed } from '@angular/core/testing';
import { MatDatepickerIntl } from '@angular/material/datepicker';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { normalizarEspacios } from '../../../testing/espacios';
import { provideMaterial } from './material';

describe('provideMaterial (§6.1)', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideMaterial()] });
  });

  it('los campos son outline, con el texto de ayuda dinámico', () => {
    expect(TestBed.inject(MAT_FORM_FIELD_DEFAULT_OPTIONS)).toEqual({
      appearance: 'outline',
      subscriptSizing: 'dynamic',
    });
  });

  it('los avisos temporales duran 5 segundos', () => {
    expect(TestBed.inject(MAT_SNACK_BAR_DEFAULT_OPTIONS).duration).toBe(5000);
  });

  describe('paginador en español (RUI-10)', () => {
    let intl: MatPaginatorIntl;

    beforeEach(() => {
      intl = TestBed.inject(MatPaginatorIntl);
    });

    it('rotula las filas por página', () => {
      expect(intl.itemsPerPageLabel).toBe('Filas por página');
      expect(intl.nextPageLabel).toBe('Página siguiente');
    });

    it.each([
      [1, 20, 134, '21–40 de 134'],
      [6, 20, 134, '121–134 de 134'],
      [0, 20, 0, '0 de 0'],
      [0, 10, 1234, '1–10 de 1 234'],
    ])('página %i de %i con %i filas → %s', (pagina, tamano, total, esperado) => {
      expect(normalizarEspacios(intl.getRangeLabel(pagina, tamano, total))).toBe(esperado);
    });
  });

  it('el selector de fecha está en español', () => {
    const intl = TestBed.inject(MatDatepickerIntl);
    expect(intl.openCalendarLabel).toBe('Abrir el calendario');
    expect(intl.formatYearRange('2020', '2043')).toBe('2020–2043');
  });
});
