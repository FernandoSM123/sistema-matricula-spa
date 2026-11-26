import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MessagePage } from '../message-page/message-page';

/**
 * `V-10` Página no encontrada (§2.5 de los requerimientos): la dirección no corresponde a ninguna
 * vista. Distinta del registro inexistente (`404` de la API), que muestra la vista (RUI-13).
 */
@Component({
  selector: 'sm-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MessagePage],
  template: `<sm-message-page
    icon="info"
    heading="No encontramos esta página"
    message="La dirección no existe o cambió. Revise que esté bien escrita."
  />`,
})
export class NotFound {}
