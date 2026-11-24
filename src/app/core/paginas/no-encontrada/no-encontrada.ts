import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MensajePagina } from '../mensaje-pagina/mensaje-pagina';

/**
 * `V-10` Página no encontrada (§2.5 de los requerimientos): la dirección no corresponde a ninguna
 * vista. Distinta del registro inexistente (`404` de la API), que muestra la vista (RUI-13).
 */
@Component({
  selector: 'sm-no-encontrada',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MensajePagina],
  template: `<sm-mensaje-pagina
    icono="info"
    titulo="No encontramos esta página"
    mensaje="La dirección no existe o cambió. Revise que esté bien escrita."
  />`,
})
export class NoEncontrada {}
