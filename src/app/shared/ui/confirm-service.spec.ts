import { OverlayContainer } from '@angular/cdk/overlay';
import { TestBed } from '@angular/core/testing';
import { MATERIAL_ANIMATIONS } from '@angular/material/core';
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
});
