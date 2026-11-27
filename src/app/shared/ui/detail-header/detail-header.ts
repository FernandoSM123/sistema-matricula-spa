import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Encabezado de un detalle (docs/arquitectura.md §6.2 fila 11, wireframe sección 11): las migas
 * hacia el listado, el nombre del registro como `h1` con su etiqueta de estado y las acciones que
 * el rol y el estado permiten. Se apila en pantallas angostas.
 *
 * ```html
 * <sm-detail-header heading="María Fernanda Quesada Rojas">
 *   <a detailBreadcrumb routerLink="/estudiantes">Estudiantes</a>
 *   <sm-status-badge detailStatus kind="activo" [value]="true" />
 *   <a detailActions mat-stroked-button routerLink="editar">Editar</a>
 * </sm-detail-header>
 * ```
 *
 * Se llama `heading` y no `title` para no poner el atributo `title` (la ayuda del navegador) en el
 * elemento.
 */
@Component({
  selector: 'sm-detail-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './detail-header.html',
  styleUrl: './detail-header.scss',
})
export class DetailHeader {
  readonly heading = input.required<string>();
  /** Un dato que identifica el registro: la cédula, el código, el NRC. */
  readonly subtitle = input<string>();
}
