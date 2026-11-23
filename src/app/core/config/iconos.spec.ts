import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatIconRegistry } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import { ICONOS, provideIconos } from './iconos';

describe('provideIconos (§6.6)', () => {
  let registro: MatIconRegistry;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideIconos()],
    });
    registro = TestBed.inject(MatIconRegistry);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('registra cada ícono con su archivo de public/iconos', async () => {
    for (const icono of ICONOS) {
      const svg = firstValueFrom(registro.getNamedSvgIcon(icono));
      http.expectOne(`iconos/${icono}.svg`).flush('<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0"/></svg>');
      expect((await svg).tagName.toLowerCase()).toBe('svg');
    }
  });

  it('no conoce un ícono que no está en la lista', async () => {
    await expect(firstValueFrom(registro.getNamedSvgIcon('no-existe'))).rejects.toThrow();
  });
});
