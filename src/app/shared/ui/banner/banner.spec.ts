import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { Banner, BannerTone } from './banner';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Banner],
  template: `
    <sm-banner
      [tone]="tone()"
      heading="No se pudo enviar el correo."
      message="Puede reenviarla después."
      [closable]="closable()"
      (closed)="closedCount.set(closedCount() + 1)"
    >
      <button bannerActions type="button">Reenviar temporal</button>
    </sm-banner>
  `,
})
class Host {
  readonly tone = signal<BannerTone>('warning');
  readonly closable = signal(false);
  readonly closedCount = signal(0);
}

describe('Banner (RUI-21)', () => {
  function create() {
    TestBed.configureTestingModule({ imports: [MatIconTestingModule] });
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const banner = (): HTMLElement => fixture.nativeElement.querySelector('sm-banner');
    const buttons = () => [...banner().querySelectorAll('button')].map((b) => b.textContent?.trim());
    return { fixture, banner, buttons };
  }

  it('muestra el texto, el ícono del tono y las acciones de la vista', () => {
    const { banner, buttons } = create();

    expect(banner().textContent).toContain('No se pudo enviar el correo.');
    expect(banner().textContent).toContain('Puede reenviarla después.');
    expect(banner().querySelector('mat-icon')?.getAttribute('data-mat-icon-name')).toBe('warning');
    expect(buttons()).toEqual(['Reenviar temporal']);
  });

  it.each<[BannerTone, string, string]>([
    ['warning', 'warning', 'status'],
    ['info', 'info', 'status'],
    ['success', 'success', 'status'],
    ['error', 'error', 'alert'],
  ])('tono %s: ícono %s y rol %s', (tone, icon, role) => {
    const { fixture, banner } = create();
    fixture.componentInstance.tone.set(tone);
    fixture.detectChanges();

    expect(banner().classList).toContain(`tone-${tone}`);
    expect(banner().querySelector('mat-icon')?.getAttribute('data-mat-icon-name')).toBe(icon);
    expect(banner().getAttribute('role')).toBe(role);
  });

  it('con closable, "Cerrar" avisa', () => {
    const { fixture, buttons, banner } = create();
    fixture.componentInstance.closable.set(true);
    fixture.detectChanges();

    expect(buttons()).toEqual(['Reenviar temporal', 'Cerrar']);
    [...banner().querySelectorAll('button')].at(-1)?.click();
    expect(fixture.componentInstance.closedCount()).toBe(1);
  });
});
