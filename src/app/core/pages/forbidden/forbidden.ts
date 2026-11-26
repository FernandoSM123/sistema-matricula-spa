import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MessagePage } from '../message-page/message-page';

/**
 * `V-09` Sin permiso (§2.5 de los requerimientos): su rol no puede usar la vista pedida. No dice qué
 * rol haría falta, porque el menú nunca ofrece esas vistas (wireframe de V-09).
 */
@Component({
  selector: 'sm-forbidden',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MessagePage],
  template: `<sm-message-page
    icon="warning"
    heading="No tiene permiso para ver esta página"
    message="Su cuenta no tiene acceso a esta sección del sistema."
  />`,
})
export class Forbidden {}
