import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ConfirmService } from '../../shared/ui/confirm-service';
import { SessionService } from '../session/session-service';
import { DISCARD_CHANGES, HasUnsavedChanges, unsavedChangesGuard } from './unsaved-changes-guard';

describe('unsavedChangesGuard (RUI-09, §4.3)', () => {
  const ended = signal(false);
  const confirm = vi.fn<ConfirmService['confirm']>();

  beforeEach(() => {
    ended.set(false);
    confirm.mockReset();
    TestBed.configureTestingModule({
      providers: [
        { provide: SessionService, useValue: { ended } },
        { provide: ConfirmService, useValue: { confirm } },
      ],
    });
  });

  const form = (dirty: boolean): HasUnsavedChanges => ({ hasUnsavedChanges: () => dirty });

  /** Sale del formulario hacia `url`. */
  function leave(component: HasUnsavedChanges, queryParams: Record<string, string> = {}) {
    const nextState = { url: '/x', root: { queryParams } } as unknown as RouterStateSnapshot;
    return TestBed.runInInjectionContext(() =>
      unsavedChangesGuard(component, {} as ActivatedRouteSnapshot, {} as RouterStateSnapshot, nextState),
    );
  }

  it('sin cambios, deja salir sin preguntar', () => {
    expect(leave(form(false))).toBe(true);
    expect(confirm).not.toHaveBeenCalled();
  });

  it('con cambios, pregunta "¿Descartar los cambios?" y respeta la respuesta', async () => {
    confirm.mockResolvedValueOnce(true).mockResolvedValueOnce(false);

    await expect(leave(form(true))).resolves.toBe(true);
    await expect(leave(form(true))).resolves.toBe(false);
    expect(confirm).toHaveBeenCalledWith(DISCARD_CHANGES);
    expect(DISCARD_CHANGES).toMatchObject({ action: 'Descartar cambios', cancel: 'Seguir editando' });
  });

  it.each(['sesion-terminada', 'sesion-cerrada'])(
    'con la sesión terminada y la navegación del fin de la sesión (aviso=%s), deja salir sin preguntar',
    (aviso) => {
      ended.set(true);
      expect(leave(form(true), { aviso })).toBe(true);
      expect(confirm).not.toHaveBeenCalled();
    },
  );

  it('con una sesión que terminó antes (un visitante que cerró sesión), sí pregunta', async () => {
    ended.set(true);
    confirm.mockResolvedValue(false);

    await expect(leave(form(true))).resolves.toBe(false);
    expect(confirm).toHaveBeenCalled();
  });
});
