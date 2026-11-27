import { ChangeDetectionStrategy, Component, ElementRef, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { focusFirstError } from './focus-first-error';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form">
      <input formControlName="nombre" />
      <div formGroupName="contacto">
        <input formControlName="correo" />
        <input formControlName="telefono" />
      </div>
      <span class="custom" formControlName="custom" ngDefaultControl><button type="button">Mostrar</button></span>
    </form>
  `,
})
class Host {
  readonly element = inject(ElementRef<HTMLElement>).nativeElement;
  readonly form = new FormGroup({
    nombre: new FormControl('María'),
    contacto: new FormGroup({
      correo: new FormControl('', Validators.required),
      telefono: new FormControl('', Validators.required),
    }),
    custom: new FormControl(''),
  });
}

describe('focusFirstError (§5.4)', () => {
  function create() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    document.body.appendChild(fixture.nativeElement);
    return fixture;
  }

  afterEach(() => document.body.replaceChildren());

  it('enfoca el primer campo con error, en el orden del formulario, sin detenerse en el grupo', () => {
    const fixture = create();
    const host = fixture.componentInstance;

    expect(focusFirstError(host.element)).toBe(true);
    expect(document.activeElement).toBe(host.element.querySelector('[formcontrolname="correo"]'));
  });

  it('en un componente propio, enfoca su primer elemento enfocable', () => {
    const fixture = create();
    const host = fixture.componentInstance;
    host.form.controls.contacto.disable();
    host.form.controls.custom.setValidators(Validators.required);
    host.form.controls.custom.updateValueAndValidity();
    fixture.detectChanges();

    expect(focusFirstError(host.element)).toBe(true);
    expect(document.activeElement).toBe(host.element.querySelector('.custom button'));
  });

  it('sin errores, no enfoca nada', () => {
    const fixture = create();
    const host = fixture.componentInstance;
    host.form.controls.contacto.disable();
    fixture.detectChanges();

    expect(focusFirstError(host.element)).toBe(false);
  });
});
