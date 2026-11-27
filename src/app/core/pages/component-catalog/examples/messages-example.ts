import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { Banner, BannerTone } from '../../../../shared/ui/banner/banner';
import { NotificationService } from '../../../../shared/ui/notification-service';

/** Sección 7 del catálogo: el aviso de éxito y el aviso fijo (RUI-21). Los errores llegan en T6. */
@Component({
  selector: 'sm-messages-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Banner, MatButton],
  template: `
    <h3>Éxito: breve y no bloqueante, desaparece solo</h3>
    <button mat-stroked-button type="button" (click)="notifications.success('Estudiante registrado')">
      Mostrar mensaje de éxito
    </button>

    <h3>Aviso fijo: queda hasta que se resuelve o se cierra</h3>
    @if (bannerOpen()) {
      <sm-banner
        heading="El estudiante se registró, pero no se pudo enviar el correo con la contraseña temporal."
        message="Puede reenviarla ahora o más tarde desde el detalle del estudiante."
        closable
        (closed)="bannerOpen.set(false)"
      >
        <button bannerActions mat-stroked-button type="button" (click)="notifications.success('Temporal reenviada')">
          Reenviar temporal
        </button>
      </sm-banner>
    } @else {
      <button mat-stroked-button type="button" (click)="bannerOpen.set(true)">Mostrar el aviso fijo otra vez</button>
    }

    <h3>Tonos del aviso fijo</h3>
    <div class="tones">
      @for (tone of tones; track tone.tone) {
        <sm-banner [tone]="tone.tone" [message]="tone.message" />
      }
    </div>
  `,
  styles: `
    h3 {
      margin: var(--sm-space-4) 0 var(--sm-space-2);
      font-size: 1rem;
    }
    h3:first-child {
      margin-top: 0;
    }
    .tones {
      display: grid;
      gap: var(--sm-space-2);
    }
  `,
})
export class MessagesExample {
  protected readonly notifications = inject(NotificationService);
  protected readonly bannerOpen = signal(true);

  protected readonly tones: readonly { tone: BannerTone; message: string }[] = [
    { tone: 'warning', message: 'Aviso: requiere una acción.' },
    { tone: 'info', message: 'Información: no hay un periodo vigente.' },
    { tone: 'success', message: 'Éxito: la operación terminó.' },
    { tone: 'error', message: 'Error: no se pudo completar la acción.' },
  ];
}
