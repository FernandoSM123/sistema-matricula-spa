import { Clipboard } from '@angular/cdk/clipboard';
import { ChangeDetectionStrategy, Component, resource, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import {
  ERROR_403,
  ERROR_403_RN18,
  ERROR_404,
  ERROR_409_UNKNOWN,
  ERROR_429,
  ERROR_500,
  ERROR_NO_RESPONSE,
  apiError,
} from '../../../../testing/api-errors';
import { TRACE_ID } from '../../../../testing/problem-details';
import { ContentState, ContentTemplate, defaultIsEmpty } from './content-state';

/** Un recurso cuyas respuestas resuelve o rechaza la prueba, una por pedido. */
abstract class ResourceHost {
  readonly key = signal(1);
  readonly filtered = signal(false);
  readonly cleared = signal(0);
  readonly requests: { resolve: (value: string[]) => void; reject: (error: unknown) => void }[] = [];
  readonly data = resource({
    params: () => this.key(),
    loader: () => new Promise<string[]>((resolve, reject) => this.requests.push({ resolve, reject })),
  });
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ContentState, ContentTemplate],
  template: `
    <sm-content-state
      [resource]="data"
      [filtered]="filtered()"
      loadingLabel="Cargando cursos"
      (clearFilters)="cleared.set(cleared() + 1)"
    >
      <p smEmpty>No hay cursos registrados.</p>
      <p smNotFound>El curso que busca no existe.</p>
      <ng-template [smContent]="data" let-cursos>
        <ul>
          @for (curso of cursos; track curso) {
            <li>{{ curso }}</li>
          }
        </ul>
      </ng-template>
    </sm-content-state>
  `,
})
class Host extends ResourceHost {}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ContentState, ContentTemplate],
  template: `
    <sm-content-state [resource]="data">
      <ng-template [smContent]="data" let-cursos>{{ cursos.length }}</ng-template>
    </sm-content-state>
  `,
})
class HostWithoutNotFound extends ResourceHost {}

describe('ContentState (RUI-13)', () => {
  const copy = vi.fn<Clipboard['copy']>();

  async function create<H extends ResourceHost>(type: new () => H = Host as unknown as new () => H) {
    copy.mockReset().mockReturnValue(true);
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: Clipboard, useValue: { copy } }],
    });
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    const fixture: ComponentFixture<H> = TestBed.createComponent(type);
    await settle(fixture);

    const element: HTMLElement = fixture.nativeElement;
    const host = fixture.componentInstance;
    const items = () => [...element.querySelectorAll('li')].map((li) => li.textContent?.trim());
    const text = () => element.textContent?.replace(/\s+/g, ' ').trim() ?? '';
    const button = (label: string) =>
      [...element.querySelectorAll('button')].find((b) => b.textContent?.trim() === label);
    const respond = async (value: string[]) => {
      host.requests.at(-1)!.resolve(value);
      await settle(fixture);
    };
    const fail = async (error: unknown) => {
      host.requests.at(-1)!.reject(error);
      await settle(fixture);
    };
    return { fixture, host, element, items, text, button, respond, fail, navigate };
  }

  async function settle(fixture: ComponentFixture<unknown>) {
    for (let i = 0; i < 3; i++) {
      await Promise.resolve();
      TestBed.tick();
    }
    fixture.detectChanges();
  }

  it('la primera carga muestra el indicador, sin contenido', async () => {
    const { element, items } = await create();

    expect(element.querySelector('mat-progress-spinner')?.getAttribute('aria-label')).toBe('Cargando cursos');
    expect(items()).toEqual([]);
    expect(element.textContent).not.toContain('No hay cursos');
  });

  it('con datos, el contenido con el valor del recurso', async () => {
    const { element, items, respond } = await create();
    await respond(['ING-101', 'FOT-110']);

    expect(items()).toEqual(['ING-101', 'FOT-110']);
    expect(element.querySelector('mat-progress-spinner')).toBeNull();
    expect(element.querySelector('mat-progress-bar')).toBeNull();
  });

  it('al recargar, conserva el contenido con la barra de progreso', async () => {
    const { fixture, host, element, items, respond } = await create();
    await respond(['ING-101']);

    host.data.reload();
    await settle(fixture);
    expect(items()).toEqual(['ING-101']);
    expect(element.querySelector('mat-progress-bar')).not.toBeNull();

    await respond(['ING-101', 'COC-120']);
    expect(items()).toEqual(['ING-101', 'COC-120']);
    expect(element.querySelector('mat-progress-bar')).toBeNull();
  });

  it('al cambiar de página, conserva el contenido anterior hasta que llega el nuevo', async () => {
    const { fixture, host, element, items, respond } = await create();
    await respond(['ING-101']);

    host.key.set(2);
    await settle(fixture);
    expect(items()).toEqual(['ING-101']);
    expect(element.querySelector('mat-progress-bar')).not.toBeNull();
    expect(element.querySelector('mat-progress-spinner')).toBeNull();

    await respond(['FOT-110']);
    expect(items()).toEqual(['FOT-110']);
  });

  it('vacío sin filtros: lo proyectado con smEmpty', async () => {
    const { text, respond, button } = await create();
    await respond([]);

    expect(text()).toBe('No hay cursos registrados.');
    expect(button('Limpiar filtros')).toBeUndefined();
  });

  it('vacío con filtros: el mensaje y "Limpiar filtros"', async () => {
    const { fixture, host, text, respond, button } = await create();
    host.filtered.set(true);
    await respond([]);

    expect(text()).toContain('No hay resultados para los filtros aplicados.');
    expect(text()).not.toContain('No hay cursos registrados.');
    button('Limpiar filtros')!.click();
    fixture.detectChanges();
    expect(host.cleared()).toBe(1);
  });

  it('404: lo proyectado con smNotFound', async () => {
    const { text, fail } = await create();
    await fail(ERROR_404);
    expect(text()).toBe('El curso que busca no existe.');
  });

  it('404 sin smNotFound: un texto por defecto', async () => {
    const { text, fail } = await create(HostWithoutNotFound);
    await fail(ERROR_404);
    expect(text()).toBe('El registro que busca no existe.');
  });

  it.each([
    ['sin code', ERROR_403],
    ['RN-18', ERROR_403_RN18],
  ])('403 %s: abre /sin-permiso sin cambiar la dirección', async (_case, error) => {
    const { element, fail, navigate } = await create();
    await fail(error);

    expect(navigate).toHaveBeenCalledWith('/sin-permiso', { skipLocationChange: true });
    expect(element.querySelector('[role="alert"]')).toBeNull();
  });

  it('500: el texto con el código, "Copiar código" y "Reintentar", que vuelve a pedir', async () => {
    const { host, text, fail, button, respond, items, fixture } = await create();
    await fail(ERROR_500);

    expect(text()).toContain(`Ocurrió un error inesperado. Si el problema continúa, reporte este código: ${TRACE_ID}`);
    button('Copiar código')!.click();
    expect(copy).toHaveBeenCalledWith(TRACE_ID);

    button('Reintentar')!.click();
    await settle(fixture);
    expect(host.requests).toHaveLength(2);
    expect(fixture.nativeElement.querySelector('mat-progress-spinner')).not.toBeNull();
    await respond(['ING-101']);
    expect(items()).toEqual(['ING-101']);
  });

  it('un error tras tener datos los descarta', async () => {
    const { fixture, host, items, respond, fail, text } = await create();
    await respond(['ING-101']);
    host.data.reload();
    await settle(fixture);
    await fail(ERROR_NO_RESPONSE);

    expect(items()).toEqual([]);
    expect(text()).toContain('No se pudo conectar con el servidor.');
  });

  it('sin respuesta: el texto fijo como alerta, con "Reintentar"', async () => {
    const { element, text, fail, button } = await create();
    await fail(ERROR_NO_RESPONSE);

    expect(element.querySelector('[role="alert"]')).not.toBeNull();
    expect(text()).toContain('No se pudo conectar con el servidor. Revise su conexión e intente de nuevo.');
    expect(button('Reintentar')?.disabled).toBe(false);
  });

  it('429: la espera, con "Reintentar" deshabilitado', async () => {
    const { text, fail, button } = await create();
    await fail(ERROR_429);

    expect(text()).toContain('Demasiados intentos. Intente de nuevo en 30 segundos.');
    expect(button('Reintentar')?.disabled).toBe(true);
  });

  it('otro rechazo: el detail, nunca el texto técnico (RUI-05)', async () => {
    const { text, fail } = await create();
    await fail(ERROR_409_UNKNOWN);

    expect(text()).toContain(ERROR_409_UNKNOWN.detail);
    expect(text()).not.toContain(ERROR_409_UNKNOWN.message);
  });

  it('401: nada, porque errorInterceptor ya lleva al inicio de sesión', async () => {
    const { element, fail, navigate } = await create();
    await fail(apiError({ status: 401 }));

    expect(element.querySelector('sm-content-state')?.children).toHaveLength(0);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('un error que no es de la API se muestra como inesperado, sin detalles', async () => {
    const { text, fail } = await create();
    await fail(new TypeError('x is undefined'));

    expect(text()).toContain('Ocurrió un error inesperado.');
    expect(text()).not.toContain('x is undefined');
  });
});

describe('defaultIsEmpty', () => {
  it('un arreglo o una página sin elementos', () => {
    expect(defaultIsEmpty([])).toBe(true);
    expect(defaultIsEmpty({ items: [], total: 0 })).toBe(true);
    expect(defaultIsEmpty(['a'])).toBe(false);
    expect(defaultIsEmpty({ items: ['a'] })).toBe(false);
    expect(defaultIsEmpty({ id: 1 })).toBe(false);
  });
});
