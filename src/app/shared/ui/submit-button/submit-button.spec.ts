import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SubmitButton } from './submit-button';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SubmitButton],
  template: `
    <form (submit)="$event.preventDefault(); submits.set(submits() + 1)">
      <sm-submit-button [submitting]="submitting()" [waitSeconds]="wait()" working="Registrando…">
        Registrar estudiante
      </sm-submit-button>
    </form>
  `,
})
class Host {
  readonly submitting = signal(false);
  readonly wait = signal(0);
  readonly submits = signal(0);
}

describe('SubmitButton (RUI-08)', () => {
  function create() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const button = (): HTMLButtonElement => fixture.nativeElement.querySelector('button');
    return { fixture, host: fixture.componentInstance, button };
  }

  it('envía el formulario con su texto', () => {
    const { host, button } = create();

    expect(button().type).toBe('submit');
    expect(button().textContent?.trim()).toBe('Registrar estudiante');
    button().click();
    expect(host.submits()).toBe(1);
  });

  it('mientras envía: deshabilitado, con el indicador y el texto de trabajo', () => {
    const { fixture, host, button } = create();
    host.submitting.set(true);
    fixture.detectChanges();

    expect(button().disabled).toBe(true);
    expect(button().querySelector('mat-progress-spinner')).not.toBeNull();
    expect(button().textContent?.trim()).toBe('Registrando…');
  });

  it('durante la espera de un 429: deshabilitado, con su texto', () => {
    const { fixture, host, button } = create();
    host.wait.set(30);
    fixture.detectChanges();

    expect(button().disabled).toBe(true);
    expect(button().textContent?.trim()).toBe('Registrar estudiante');
  });
});
