import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FilterBar } from './filter-bar';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FilterBar],
  template: `
    <sm-filter-bar
      [search]="search()"
      [showInactive]="showInactive()"
      [inactive]="inactive()"
      [filtered]="filtered()"
      (searchChange)="searches.push($event); search.set($event)"
      (inactiveChange)="inactives.push($event)"
      (clear)="clears = clears + 1"
    >
      <span class="projected">Estado</span>
    </sm-filter-bar>
  `,
})
class Host {
  readonly search = signal('');
  readonly showInactive = signal(false);
  readonly inactive = signal(false);
  readonly filtered = signal(false);
  readonly searches: string[] = [];
  readonly inactives: boolean[] = [];
  clears = 0;
}

describe('FilterBar (RUI-11, RUI-12)', () => {
  function create() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    const input = element.querySelector<HTMLInputElement>('input[type="search"]')!;
    const button = (label: string) =>
      [...element.querySelectorAll('button')].find((b) => b.textContent?.trim() === label);
    const type = (text: string) => {
      input.value = text;
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
    };
    return { fixture, host: fixture.componentInstance, element, input, button, type };
  }

  it('no avisa mientras se escribe; sí con "Buscar", con el texto recortado', () => {
    const { host, button, type } = create();
    type('  inglés ');
    expect(host.searches).toEqual([]);

    button('Buscar')!.click();
    expect(host.searches).toEqual(['inglés']);
  });

  it('avisa con Enter (envío del formulario)', () => {
    const { host, element, type } = create();
    type('fotografía');
    element.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    expect(host.searches).toEqual(['fotografía']);
  });

  it('no avisa si la búsqueda no cambió', () => {
    const { fixture, host, button, type } = create();
    type('inglés');
    button('Buscar')!.click();
    fixture.detectChanges();
    button('Buscar')!.click();
    expect(host.searches).toEqual(['inglés']);
  });

  it('al limpiar desde afuera, el campo vuelve a la búsqueda aplicada', () => {
    const { fixture, host, input, button, type } = create();
    type('inglés');
    button('Buscar')!.click();
    fixture.detectChanges();

    host.search.set('');
    fixture.detectChanges();
    expect(input.value).toBe('');
  });

  it('"Incluir inactivos" solo si la vista lo pide, y avisa al marcarlo', () => {
    const { fixture, host, element } = create();
    expect(element.querySelector('mat-checkbox')).toBeNull();

    host.showInactive.set(true);
    fixture.detectChanges();
    const checkbox = element.querySelector<HTMLInputElement>('mat-checkbox input')!;
    expect(checkbox.checked).toBe(false);
    checkbox.click();
    expect(host.inactives).toEqual([true]);
  });

  it('"Limpiar filtros" solo con filtros aplicados', () => {
    const { fixture, host, button } = create();
    expect(button('Limpiar filtros')).toBeUndefined();

    host.filtered.set(true);
    fixture.detectChanges();
    button('Limpiar filtros')!.click();
    expect(host.clears).toBe(1);
  });

  it('proyecta los filtros de la vista, dentro del formulario de búsqueda', () => {
    const { element } = create();
    expect(element.querySelector('form[role="search"] .projected')?.textContent).toBe('Estado');
  });
});
