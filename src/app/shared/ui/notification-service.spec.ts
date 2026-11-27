import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NOTIFICATION_DURATION_MS, NotificationService } from './notification-service';

describe('NotificationService (RUI-21)', () => {
  it('fija 5 s en cada aviso, sin botón, y lo anuncia sin interrumpir (verificación heredada de nucleo)', () => {
    const open = vi.spyOn(TestBed.inject(MatSnackBar), 'open');

    TestBed.inject(NotificationService).success('Estudiante registrado');

    expect(NOTIFICATION_DURATION_MS).toBe(5000);
    expect(open).toHaveBeenCalledWith('Estudiante registrado', undefined, {
      duration: 5000,
      politeness: 'polite',
      panelClass: 'sm-success-notification',
    });
  });

  it('el aviso desaparece solo a los 5 s', async () => {
    vi.useFakeTimers();
    try {
      TestBed.inject(NotificationService).success('Curso registrado');
      const snackBar = TestBed.inject(MatSnackBar);
      expect(snackBar._openedSnackBarRef).not.toBeNull();

      await vi.advanceTimersByTimeAsync(NOTIFICATION_DURATION_MS + 1000);
      expect(snackBar._openedSnackBarRef).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });
});
