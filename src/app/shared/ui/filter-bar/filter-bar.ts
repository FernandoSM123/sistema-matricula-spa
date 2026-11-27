import { booleanAttribute, ChangeDetectionStrategy, Component, input, linkedSignal, output } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

/**
 * Barra de búsqueda y filtros de un listado (RUI-11, RUI-12, docs/arquitectura.md §6.2 fila 2).
 *
 * - La búsqueda se aplica con Enter o con "Buscar", no mientras se escribe.
 * - Los filtros de la vista (listas, fechas) se proyectan y se aplican al cambiarlos.
 * - "Incluir inactivos", si la vista lo pide con `showInactive`; desmarcado por defecto.
 * - "Limpiar filtros", solo con `filtered`.
 *
 * Solo avisa: la vista navega con los nuevos parámetros y vuelve a la página 1 (§3.4).
 */
@Component({
  selector: 'sm-filter-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButton, MatCheckbox, MatFormField, MatInput, MatLabel],
  templateUrl: './filter-bar.html',
  styleUrl: './filter-bar.scss',
})
export class FilterBar {
  /** La búsqueda aplicada, la de la URL. */
  readonly search = input('');
  readonly searchPlaceholder = input('');
  readonly showInactive = input(false, { transform: booleanAttribute });
  readonly inactive = input(false);
  /** Si hay algún filtro aplicado: muestra "Limpiar filtros". */
  readonly filtered = input(false);

  readonly searchChange = output<string>();
  readonly inactiveChange = output<boolean>();
  readonly clear = output<void>();

  /** Lo escrito y todavía no aplicado. Vuelve a la búsqueda aplicada cuando esta cambia. */
  protected readonly draft = linkedSignal(() => this.search());

  protected applySearch(event: Event): void {
    event.preventDefault();
    const text = this.draft().trim();
    this.draft.set(text);
    if (text !== this.search()) this.searchChange.emit(text);
  }
}
