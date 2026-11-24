import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatIconRegistry } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import { ICONS, provideIcons } from './icons';

describe('provideIcons (§6.6)', () => {
  let registry: MatIconRegistry;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideIcons()],
    });
    registry = TestBed.inject(MatIconRegistry);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('registra cada ícono con su archivo de public/icons', async () => {
    for (const icon of ICONS) {
      const svg = firstValueFrom(registry.getNamedSvgIcon(icon));
      http.expectOne(`icons/${icon}.svg`).flush('<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0"/></svg>');
      expect((await svg).tagName.toLowerCase()).toBe('svg');
    }
  });

  it('no conoce un ícono que no está en la lista', async () => {
    await expect(firstValueFrom(registry.getNamedSvgIcon('no-existe'))).rejects.toThrow();
  });
});
