import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MensajePagina } from '../mensaje-pagina/mensaje-pagina';

/**
 * `V-09` Sin permiso (§2.5 de los requerimientos): su rol no puede usar la vista pedida. No dice qué
 * rol haría falta, porque el menú nunca ofrece esas vistas (wireframe de V-09).
 */
@Component({
  selector: 'sm-sin-permiso',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MensajePagina],
  template: `<sm-mensaje-pagina
    icono="warning"
    titulo="No tiene permiso para ver esta página"
    mensaje="Su cuenta no tiene acceso a esta sección del sistema."
  />`,
})
export class SinPermiso {}
