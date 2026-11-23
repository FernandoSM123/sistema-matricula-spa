import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { normalizarEspacios } from '../../testing/espacios';
import { Muestra } from './muestra';
import { provideAdaptadorFechas } from '../core/config/adaptador-fechas';
import { provideIconos } from '../core/config/iconos';
import { provideLocale } from '../core/config/locale';
import { provideMaterialVistas } from '../core/config/material-vistas';

// PROVISIONAL (fundacion T6): pruebas de la página de muestra, que nucleo reemplaza.
describe('Muestra', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Muestra],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideLocale(),
        provideAdaptadorFechas(),
        provideMaterialVistas(),
        provideIconos(),
      ],
    }).compileComponents();
  });

  it('muestra el nombre del instituto y un ejemplo de cada pipe', async () => {
    const fixture = TestBed.createComponent(Muestra);
    await fixture.whenStable();
    const texto = normalizarEspacios((fixture.nativeElement as HTMLElement).textContent ?? '');

    expect(texto).toContain('Instituto de Cursos Libres');
    for (const ejemplo of ['05/03/2026', '05/03/2026 6:30 p. m.', '6:30 p. m.', '₡25 000,00', '1 234', 'En curso']) {
      expect(texto).toContain(ejemplo);
    }
  });

  it('muestra el error del campo de correo', async () => {
    const fixture = TestBed.createComponent(Muestra);
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).querySelector('mat-error')?.textContent).toContain(
      'Escriba un correo válido.',
    );
  });
});
