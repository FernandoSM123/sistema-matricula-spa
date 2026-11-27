import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CATALOG_SECTIONS } from './catalog-sections';
import { ActionErrorExample } from './examples/action-error-example';
import { BadgesExample } from './examples/badges-example';
import { ConfirmExample } from './examples/confirm-example';
import { ContentStateExample } from './examples/content-state-example';
import { DateTimeExample } from './examples/date-time-example';
import { DetailExample } from './examples/detail-example';
import { FiltersExample } from './examples/filters-example';
import { ListExample } from './examples/list-example';
import { MessagesExample } from './examples/messages-example';
import { SearchSelectExample } from './examples/search-select-example';

/**
 * Catálogo de componentes (decisión 1 de SPEC-componentes): las piezas de `shared/` con datos de
 * ejemplo, para revisarlas contra `docs/wireframes/componentes.html`. No pide sesión y ningún enlace
 * de la aplicación lleva aquí: solo se abre escribiendo `/componentes`.
 *
 * Cada sección es un `@case` del `@switch` de la plantilla; las que todavía no tienen contenido
 * dicen dónde se construyen.
 */
@Component({
  selector: 'sm-component-catalog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ActionErrorExample,
    BadgesExample,
    ConfirmExample,
    ContentStateExample,
    DateTimeExample,
    DetailExample,
    FiltersExample,
    ListExample,
    MessagesExample,
    RouterLink,
    SearchSelectExample,
  ],
  templateUrl: './component-catalog.html',
  styleUrl: './component-catalog.scss',
})
export class ComponentCatalog {
  private readonly document = inject(DOCUMENT);
  protected readonly sections = CATALOG_SECTIONS;

  /**
   * El índice salta a la sección sin pasar por el router: un `href="#…"` navegaría a la raíz por
   * el `<base href="/">`, y el router no tiene activado el desplazamiento a anclas.
   */
  protected goTo(event: Event, id: string): void {
    event.preventDefault();
    const target = this.document.getElementById(id);
    target?.scrollIntoView();
    target?.focus();
  }
}
