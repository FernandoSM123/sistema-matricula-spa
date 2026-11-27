import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DetailHeader } from './detail-header';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DetailHeader],
  template: `
    <sm-detail-header heading="Inglés conversacional I" subtitle="ING-101">
      <a detailBreadcrumb href="/cursos">Cursos</a>
      <span detailStatus class="badge">Activo</span>
      <button detailActions type="button">Editar</button>
      <button detailActions type="button">Eliminar</button>
    </sm-detail-header>
  `,
})
class Host {}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DetailHeader],
  template: `<sm-detail-header heading="Solo el título" />`,
})
class MinimalHost {}

describe('DetailHeader', () => {
  it('el título como h1, con su estado, el subtítulo, las migas y las acciones', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('h1')?.textContent).toBe('Inglés conversacional I');
    expect(element.querySelector('.title .badge')?.textContent).toBe('Activo');
    expect(element.querySelector('.subtitle')?.textContent).toBe('ING-101');
    const crumbs = element.querySelector('nav[aria-label="Migas de pan"]');
    expect(crumbs?.querySelector('a')?.getAttribute('href')).toBe('/cursos');
    expect(crumbs?.querySelector('[aria-current="page"]')?.textContent).toBe('Detalle');
    expect([...element.querySelectorAll('.actions button')].map((b) => b.textContent)).toEqual(['Editar', 'Eliminar']);
  });

  it('no pone el atributo title en el elemento', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('sm-detail-header').hasAttribute('title')).toBe(false);
  });

  it('sin subtítulo ni acciones, no los dibuja', () => {
    const fixture = TestBed.createComponent(MinimalHost);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('.subtitle')).toBeNull();
    expect(element.querySelector('.actions')?.children).toHaveLength(0);
  });
});
