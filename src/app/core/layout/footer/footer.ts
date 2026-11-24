import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { APP_TIME_ZONE } from '../../../shared/formatting/formatters';
import { CLOCK } from '../../session/clock';

/**
 * RUI-23: el nombre del sistema, el del instituto, el año y la versión del frontend, que sale del
 * build y ayuda a soporte cuando se reporta un error. No queda fijo; en celular se apila.
 */
@Component({
  selector: 'sm-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span>Sistema de Matrícula · {{ instituteName }} · © {{ year }}</span>
    <span>Versión {{ version }}</span>
  `,
  styleUrl: './footer.scss',
  host: { role: 'contentinfo' },
})
export class Footer {
  protected readonly instituteName = environment.instituteName;
  protected readonly version = environment.version;
  /** El año en la zona del instituto, no en la del dispositivo (supuesto 6 de SPEC-nucleo). */
  protected readonly year = new Intl.DateTimeFormat('es-CR', { year: 'numeric', timeZone: APP_TIME_ZONE }).format(
    inject(CLOCK)(),
  );
}
