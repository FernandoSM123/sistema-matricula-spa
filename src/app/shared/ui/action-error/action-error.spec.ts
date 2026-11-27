import { Clipboard } from '@angular/cdk/clipboard';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import type { ApiError } from '../../../api/api-error';
import {
  ERROR_400,
  ERROR_403,
  ERROR_403_RN18,
  ERROR_404,
  ERROR_409_CONCURRENCIA,
  ERROR_409_RN39,
  ERROR_409_UNKNOWN,
  ERROR_429,
  ERROR_429_WITHOUT_RETRY,
  ERROR_500,
  ERROR_NO_RESPONSE,
  apiError,
} from '../../../../testing/api-errors';
import { TRACE_ID } from '../../../../testing/problem-details';
import { ActionError } from './action-error';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ActionError],
  template: `
    <sm-action-error
      [error]="error()"
      [waitSeconds]="wait()"
      (retry)="retries.set(retries() + 1)"
      (retryConcurrency)="concurrencyRetries.set(concurrencyRetries() + 1)"
    >
      <button errorActions type="button">Reactivar estudiante</button>
    </sm-action-error>
  `,
})
class Host {
  readonly error = signal<ApiError | null>(null);
  readonly wait = signal(0);
  readonly retries = signal(0);
  readonly concurrencyRetries = signal(0);
}

describe('ActionError (§3.5, RUI-03, RUI-04)', () => {
  const copy = vi.fn<Clipboard['copy']>();

  function create(error: ApiError | null, wait = 0) {
    copy.mockReset().mockReturnValue(true);
    TestBed.configureTestingModule({
      imports: [MatIconTestingModule],
      providers: [{ provide: Clipboard, useValue: { copy } }],
    });
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.error.set(error);
    fixture.componentInstance.wait.set(wait);
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement.querySelector('sm-action-error');
    const text = () => element.querySelector('p')?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
    const buttons = () => [...element.querySelectorAll('button')].map((b) => b.textContent?.trim());
    const button = (label: string) =>
      [...element.querySelectorAll('button')].find((b) => b.textContent?.trim() === label)!;
    return { fixture, host: fixture.componentInstance, element, text, buttons, button };
  }

  it('sin error, no dibuja nada', () => {
    expect(create(null).element.children).toHaveLength(0);
  });

  it.each([
    ['403', ERROR_403],
    ['403 RN-18', ERROR_403_RN18],
    ['404', ERROR_404],
    ['409 con un code desconocido', ERROR_409_UNKNOWN],
  ])('%s: el detail de la API, como alerta', (_case, error) => {
    const { element, text } = create(error);

    expect(element.querySelector('[role="alert"]')).not.toBeNull();
    expect(text()).toBe(error.detail);
  });

  it('409 RN-39: el detail y la acción de la vista (RUI-04)', () => {
    const { text, buttons } = create(ERROR_409_RN39);

    expect(text()).toBe(ERROR_409_RN39.detail);
    expect(buttons()).toEqual(['Reactivar estudiante']);
  });

  it('409 CONCURRENCIA: "Intentar de nuevo" avisa', () => {
    const { fixture, host, buttons, button } = create(ERROR_409_CONCURRENCIA);

    expect(buttons()).toEqual(['Intentar de nuevo', 'Reactivar estudiante']);
    button('Intentar de nuevo').click();
    fixture.detectChanges();
    expect(host.concurrencyRetries()).toBe(1);
  });

  it('429 con retryAfter: la cuenta regresiva, con el ícono del reloj', () => {
    const { fixture, host, element, text } = create(ERROR_429, 30);

    expect(text()).toBe('Demasiados intentos. Intente de nuevo en 30 segundos.');
    expect(element.querySelector('mat-icon')?.getAttribute('data-mat-icon-name')).toBe('clock');

    host.wait.set(1);
    fixture.detectChanges();
    expect(text()).toBe('Demasiados intentos. Intente de nuevo en 1 segundo.');

    host.wait.set(0);
    fixture.detectChanges();
    expect(text()).toBe('Ya puede intentar de nuevo.');
  });

  it('429 sin retryAfter: el detail, sin cuenta regresiva', () => {
    expect(create(ERROR_429_WITHOUT_RETRY).text()).toBe(ERROR_429_WITHOUT_RETRY.detail);
  });

  it('500: el texto fijo con el código, y "Copiar código"', () => {
    const { fixture, text, button } = create(ERROR_500);

    expect(text()).toBe(`Ocurrió un error inesperado. Si el problema continúa, reporte este código: ${TRACE_ID}`);
    button('Copiar código').click();
    fixture.detectChanges();
    expect(copy).toHaveBeenCalledWith(TRACE_ID);
    expect(button('Código copiado')).toBeDefined();
  });

  it('500 sin traceId: el texto fijo, sin código', () => {
    const { text, buttons } = create(apiError({ status: 503, traceId: undefined }));

    expect(text()).toBe('Ocurrió un error inesperado. Intente de nuevo más tarde.');
    expect(buttons()).toEqual([]);
  });

  it('sin respuesta: el texto fijo y "Reintentar"', () => {
    const { fixture, host, text, buttons, button } = create(ERROR_NO_RESPONSE);

    expect(text()).toBe('No se pudo conectar con el servidor. Revise su conexión e intente de nuevo.');
    expect(buttons()).toEqual(['Reintentar']);
    button('Reintentar').click();
    fixture.detectChanges();
    expect(host.retries()).toBe(1);
  });

  it('400 con errores por campo: nada, los muestran los campos (RUI-02)', () => {
    expect(create(ERROR_400).element.children).toHaveLength(0);
  });

  it('nunca muestra el texto técnico (RUI-05)', () => {
    for (const error of [ERROR_403, ERROR_409_RN39, ERROR_429, ERROR_500, ERROR_NO_RESPONSE]) {
      expect(create(error, 5).element.textContent).not.toContain(error.message);
      TestBed.resetTestingModule();
    }
  });

  it('sin detail, un texto genérico', () => {
    expect(create(apiError({ status: 409, code: 'RN-05' })).text()).toBe('No se pudo completar la acción.');
  });
});
