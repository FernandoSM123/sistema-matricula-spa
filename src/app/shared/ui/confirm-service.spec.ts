import { OverlayContainer } from '@angular/cdk/overlay';
import { TestBed } from '@angular/core/testing';
import { MATERIAL_ANIMATIONS } from '@angular/material/core';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { ERROR_409_RN39, ERROR_NO_RESPONSE, apiError } from '../../../testing/api-errors';
import { ConfirmOptions, ConfirmService } from './confirm-service';

const SIMPLE: ConfirmOptions = {
  title: '¿Desactivar a María Fernanda Quesada Rojas?',
  message: 'No podrá iniciar sesión.',
  action: 'Desactivar estudiante',
};

const IRREVERSIBLE: ConfirmOptions = {
  title: '¿Eliminar el curso ING-101?',
  message: 'Se eliminará el curso Inglés conversacional I.',
  action: 'Eliminar curso',
  irreversible: true,
};

describe('ConfirmService (RUI-07)', () => {
  let overlay: HTMLElement;

  beforeEach(() => {
    // Sin animaciones: la ventana toma el foco al terminar la de apertura, que jsdom no ejecuta.
    TestBed.configureTestingModule({
      imports: [MatIconTestingModule],
      providers: [{ provide: MATERIAL_ANIMATIONS, useValue: { animationsDisabled: true } }],
    });
    overlay = TestBed.inject(OverlayContainer).getContainerElement();
  });

  afterEach(() => TestBed.inject(OverlayContainer).ngOnDestroy());

  /** Abre la ventana y espera a que se dibuje y tome el foco. */
  async function open(options: ConfirmOptions) {
    const result = TestBed.inject(ConfirmService).confirm(options);
    await settle();
    const dialog = overlay.querySelector<HTMLElement>('sm-confirm-dialog')!;
    const button = (text: string) =>
      [...dialog.querySelectorAll<HTMLButtonElement>('button')].find((b) => b.textContent?.trim() === text)!;
    return { result, dialog, button };
  }

  async function settle() {
    TestBed.tick();
    await new Promise((resolve) => setTimeout(resolve));
    TestBed.tick();
  }

  it('nombra la acción y el registro, y el botón repite el verbo', async () => {
    const { dialog } = await open(SIMPLE);

    expect(dialog.querySelector('h2')?.textContent).toBe(SIMPLE.title);
    expect(dialog.textContent).toContain(SIMPLE.message);
    expect([...dialog.querySelectorAll('button')].map((b) => b.textContent?.trim())).toEqual([
      'Cancelar',
      'Desactivar estudiante',
    ]);
    expect(dialog.textContent).not.toContain('no se puede deshacer');
  });

  it('confirmar resuelve true', async () => {
    const { result, button } = await open(SIMPLE);
    button('Desactivar estudiante').click();
    await settle();
    await expect(result).resolves.toBe(true);
  });

  it('cancelar resuelve false', async () => {
    const { result, button } = await open(SIMPLE);
    button('Cancelar').click();
    await settle();
    await expect(result).resolves.toBe(false);
  });

  it('Escape resuelve false', async () => {
    const { result } = await open(SIMPLE);
    // El overlay escucha el teclado en el documento, y la CDK compara `keyCode`.
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }));
    await settle();
    await expect(result).resolves.toBe(false);
  });

  it('la reforzada destaca que no se puede deshacer y deja el foco en "Cancelar"', async () => {
    const { dialog, button } = await open(IRREVERSIBLE);

    expect(dialog.classList).toContain('irreversible');
    expect(dialog.textContent).toContain('Esta acción no se puede deshacer.');
    expect(document.activeElement).toBe(button('Cancelar'));
  });

  it('acepta otro texto para cancelar ("Seguir editando", RUI-09)', async () => {
    const { button } = await open({ ...SIMPLE, cancel: 'Seguir editando' });
    expect(button('Seguir editando')).toBeDefined();
  });

  describe('con run, la ventana ejecuta la acción (decisión 3 de SPEC-componentes)', () => {
    /** Una acción que el test resuelve o rechaza cuando quiere. */
    function pending() {
      let resolve!: () => void;
      let reject!: (error: unknown) => void;
      const promise = new Promise<void>((res, rej) => {
        resolve = res;
        reject = rej;
      });
      return { run: vi.fn(() => promise), resolve, reject };
    }

    const DELETE: ConfirmOptions = { ...IRREVERSIBLE, running: 'Eliminando…' };
    const buttonsOf = (dialog: HTMLElement) =>
      [...dialog.querySelectorAll<HTMLButtonElement>('mat-dialog-actions button')].map((b) => ({
        text: b.textContent?.trim(),
        disabled: b.disabled,
      }));

    it('mientras trabaja: el texto de trabajo, los botones deshabilitados, y no se cierra con Escape', async () => {
      const action = pending();
      const { dialog, button } = await open({ ...DELETE, run: action.run });

      button('Eliminar curso').click();
      await settle();
      expect(action.run).toHaveBeenCalledTimes(1);
      expect(buttonsOf(dialog)).toEqual([
        { text: 'Cancelar', disabled: true },
        { text: 'Eliminando…', disabled: true },
      ]);

      document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }));
      await settle();
      expect(overlay.querySelector('sm-confirm-dialog')).not.toBeNull();
      action.resolve();
      await settle();
    });

    it('si run termina, se cierra con true', async () => {
      const action = pending();
      const { result, button } = await open({ ...DELETE, run: action.run });

      button('Eliminar curso').click();
      action.resolve();
      await settle();
      await expect(result).resolves.toBe(true);
    });

    it('si la API rechaza (409), queda abierta con el error, la alternativa y solo "Cerrar"', async () => {
      const action = pending();
      const deactivate = vi.fn(() => Promise.resolve());
      const { result, dialog, button } = await open({
        ...DELETE,
        run: action.run,
        alternative: { code: 'RN-39', label: 'Reactivar estudiante', run: deactivate },
      });

      button('Eliminar curso').click();
      action.reject(ERROR_409_RN39);
      await settle();

      expect(dialog.querySelector('sm-action-error [role="alert"]')?.textContent).toContain(ERROR_409_RN39.detail);
      expect(buttonsOf(dialog)).toEqual([{ text: 'Cerrar', disabled: false }]);

      button('Reactivar estudiante').click();
      await settle();
      expect(deactivate).toHaveBeenCalled();
      await expect(result).resolves.toBe(false);
    });

    it('la alternativa solo aparece con su code', async () => {
      const action = pending();
      const { dialog, button } = await open({
        ...DELETE,
        run: action.run,
        alternative: { code: 'RN-34', label: 'Desactivar curso', run: () => Promise.resolve() },
      });

      button('Eliminar curso').click();
      action.reject(ERROR_409_RN39);
      await settle();
      expect(dialog.textContent).not.toContain('Desactivar curso');
    });

    it('sin respuesta: el error con "Reintentar", y la acción se puede repetir', async () => {
      const run = vi
        .fn<() => Promise<unknown>>()
        .mockRejectedValueOnce(ERROR_NO_RESPONSE)
        .mockResolvedValueOnce(undefined);
      const { result, dialog, button } = await open({ ...DELETE, run });

      button('Eliminar curso').click();
      await settle();
      expect(dialog.textContent).toContain('No se pudo conectar con el servidor.');
      expect(buttonsOf(dialog)).toEqual([
        { text: 'Cerrar', disabled: false },
        { text: 'Eliminar curso', disabled: false },
      ]);

      button('Reintentar').click();
      await settle();
      expect(run).toHaveBeenCalledTimes(2);
      await expect(result).resolves.toBe(true);
    });

    it('un error que no es de la API se muestra como inesperado, sin detalles (RUI-05)', async () => {
      const run = vi.fn(() => Promise.reject(new TypeError('x is undefined')));
      const { dialog, button } = await open({ ...DELETE, run });

      button('Eliminar curso').click();
      await settle();
      expect(dialog.textContent).toContain('Ocurrió un error inesperado.');
      expect(dialog.textContent).not.toContain('x is undefined');
    });

    it('un 429 deshabilita la acción durante la espera', async () => {
      const run = vi.fn(() => Promise.reject(apiError({ status: 429, retryAfter: 30 })));
      const { dialog, button } = await open({ ...DELETE, run });

      button('Eliminar curso').click();
      await settle();
      expect(dialog.textContent).toContain('Intente de nuevo en 30 segundos.');
      expect(buttonsOf(dialog)).toContainEqual({ text: 'Eliminar curso', disabled: true });
    });
  });
});
