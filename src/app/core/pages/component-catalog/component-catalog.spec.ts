import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideMaterialDefaults } from '../../config/material-defaults';
import { NAV_ITEMS, USER_MENU_ITEMS } from '../../layout/nav-items';
import { CATALOG_SECTIONS } from './catalog-sections';
import { ComponentCatalog } from './component-catalog';

describe('ComponentCatalog (decisión 1 de SPEC-componentes)', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([]), provideMaterialDefaults()] }));

  it('ningún menú de la aplicación lleva al catálogo', () => {
    const paths = [...NAV_ITEMS, ...USER_MENU_ITEMS].map((item) => item.path);
    expect(paths.filter((path) => path.startsWith('/componentes'))).toEqual([]);
  });

  it('tiene las 11 secciones del catálogo de los wireframes, en su orden', () => {
    const fixture = TestBed.createComponent(ComponentCatalog);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;

    const headings = [...element.querySelectorAll('section h2')].map((h) => h.textContent?.trim());
    expect(headings).toHaveLength(11);
    expect(headings[0]).toBe('1. Listado paginado');
    expect(headings[10]).toBe('11. Encabezado de detalle y pestañas');
    expect(element.querySelectorAll('nav li')).toHaveLength(CATALOG_SECTIONS.length);
  });

  it('el índice lleva el foco a la sección sin navegar', () => {
    const fixture = TestBed.createComponent(ComponentCatalog);
    fixture.detectChanges();
    document.body.appendChild(fixture.nativeElement);
    const element: HTMLElement = fixture.nativeElement;
    const section = element.querySelector<HTMLElement>('#c-estados')!;
    section.scrollIntoView = vi.fn();

    const link = [...element.querySelectorAll<HTMLAnchorElement>('nav a')].find(
      (a) => a.textContent?.trim() === 'Estados de contenido',
    )!;
    const click = new MouseEvent('click', { cancelable: true });
    link.dispatchEvent(click);

    expect(click.defaultPrevented).toBe(true);
    expect(section.scrollIntoView).toHaveBeenCalled();
    expect(document.activeElement).toBe(section);
    fixture.nativeElement.remove();
  });
});
