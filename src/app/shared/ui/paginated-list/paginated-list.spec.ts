import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MATERIAL_ANIMATIONS } from '@angular/material/core';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import type { Page } from '../../../api/pagination';
import { CARDS_QUERY, ColumnTemplate, PageChange, PaginatedList } from './paginated-list';

interface Curso {
  id: number;
  codigo: string;
  nombre: string;
}

const PAGE: Page<Curso> = {
  items: [
    { id: 1, codigo: 'ING-101', nombre: 'Inglés conversacional I' },
    { id: 2, codigo: 'FOT-110', nombre: 'Fotografía básica' },
  ],
  page: 2,
  pageSize: 20,
  totalCount: 45,
};

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ColumnTemplate, PaginatedList],
  template: `
    <sm-paginated-list label="Cursos" [page]="page()" [rowLink]="link" (pageChange)="changes.push($event)">
      <ng-template [smColumn]="page()" name="codigo" header="Código" let-c>{{ c.codigo }}</ng-template>
      <ng-template [smColumn]="page()" name="nombre" header="Nombre" primary let-c>{{ c.nombre }}</ng-template>
    </sm-paginated-list>
  `,
})
class Host {
  readonly page = signal(PAGE);
  readonly changes: PageChange[] = [];
  readonly link = (c: Curso) => ['/cursos', c.id];
}

describe('PaginatedList (RUI-10, RUI-14)', () => {
  function create(cards: boolean) {
    const state = new BehaviorSubject<BreakpointState>({ matches: cards, breakpoints: { [CARDS_QUERY]: cards } });
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: BreakpointObserver, useValue: { observe: () => state } },
        { provide: MATERIAL_ANIMATIONS, useValue: { animationsDisabled: true } },
      ],
    });
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    const text = (node: Element | null | undefined) => node?.textContent?.replace(/\s+/g, ' ').trim();
    return { fixture, host: fixture.componentInstance, element, text };
  }

  it('desde 600 px: una tabla con los encabezados y una fila por elemento', () => {
    const { element, text } = create(false);

    expect(element.querySelector('table')?.getAttribute('aria-label')).toBe('Cursos');
    expect([...element.querySelectorAll('th')].map(text)).toEqual(['Código', 'Nombre']);
    const rows = [...element.querySelectorAll('tbody tr, tr.mat-mdc-row')];
    expect(rows.map((row) => [...row.querySelectorAll('td')].map(text))).toEqual([
      ['ING-101', 'Inglés conversacional I'],
      ['FOT-110', 'Fotografía básica'],
    ]);
    expect(element.querySelector('.cards')).toBeNull();
  });

  it('la columna principal enlaza al detalle', () => {
    const { element } = create(false);
    const links = [...element.querySelectorAll<HTMLAnchorElement>('td a')];

    expect(links.map((a) => a.getAttribute('href'))).toEqual(['/cursos/1', '/cursos/2']);
    expect(links[0].closest('td')?.classList).toContain('primary');
  });

  it('por debajo de 600 px: tarjetas encabezadas por la columna principal, con los rótulos', () => {
    const { element, text } = create(true);

    expect(element.querySelector('table')).toBeNull();
    const cards = [...element.querySelectorAll('.card')];
    expect(cards).toHaveLength(2);
    expect(text(cards[0].querySelector('.card-title'))).toBe('Inglés conversacional I');
    expect(cards[0].querySelector('.card-title a')?.getAttribute('href')).toBe('/cursos/1');
    expect([...cards[0].querySelectorAll('dt')].map(text)).toEqual(['Código']);
    expect([...cards[0].querySelectorAll('dd')].map(text)).toEqual(['ING-101']);
  });

  it('el paginador muestra la página de la API (desde 1) y el total', () => {
    const { element, text } = create(false);
    // Sin el MatPaginatorIntl de la aplicación (core), el rango usa el texto de Material.
    expect(text(element.querySelector('.mat-mdc-paginator-range-label'))).toBe('21 – 40 of 45');
  });

  it('avisa la página siguiente desde 1 y el cambio de tamaño', () => {
    const { fixture, host, element } = create(false);

    element.querySelector<HTMLButtonElement>('.mat-mdc-paginator-navigation-next')!.click();
    fixture.detectChanges();
    expect(host.changes).toEqual([{ page: 3, pageSize: 20 }]);
  });

  it('ofrece 10, 20 y 50 filas por página', () => {
    const { fixture, element } = create(false);
    const paginator = fixture.debugElement.query((node) => node.name === 'mat-paginator');
    expect(paginator.componentInstance.pageSizeOptions).toEqual([10, 20, 50]);
    expect(element.querySelector('mat-paginator')).not.toBeNull();
  });
});
