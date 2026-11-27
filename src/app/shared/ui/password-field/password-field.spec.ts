import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MATERIAL_ANIMATIONS } from '@angular/material/core';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { fieldsMatch } from '../../forms/validators';
import { PasswordField } from './password-field';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PasswordField, ReactiveFormsModule],
  template: `
    <form [formGroup]="form">
      <sm-password-field
        class="nueva"
        [control]="form.controls.contrasena"
        label="Contraseña nueva"
        field="la nueva contraseña"
        autocomplete="new-password"
        hint="Al menos 8 caracteres."
      />
      <sm-password-field
        class="confirmacion"
        [control]="form.controls.confirmacion"
        label="Confirmar contraseña"
        groupError="fieldsMatch"
      />
    </form>
  `,
})
class Host {
  readonly form = new FormGroup(
    {
      contrasena: new FormControl('', { nonNullable: true, validators: Validators.required }),
      confirmacion: new FormControl('', { nonNullable: true }),
    },
    { validators: fieldsMatch('contrasena', 'confirmacion') },
  );
}

describe('PasswordField (RUI-06)', () => {
  function create() {
    TestBed.configureTestingModule({
      imports: [MatIconTestingModule],
      providers: [{ provide: MATERIAL_ANIMATIONS, useValue: { animationsDisabled: true } }],
    });
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const field = (name: string): HTMLElement => fixture.nativeElement.querySelector(`.${name}`);
    const input = (name: string): HTMLInputElement => field(name).querySelector('input')!;
    const toggle = (name: string): HTMLButtonElement => field(name).querySelector('button')!;
    return { fixture, form: fixture.componentInstance.form, field, input, toggle };
  }

  it('etiqueta, ayuda, autocomplete y oculta por defecto', () => {
    const { field, input, toggle } = create();

    expect(field('nueva').querySelector('mat-label')?.textContent).toBe('Contraseña nueva');
    expect(field('nueva').textContent).toContain('Al menos 8 caracteres.');
    expect(input('nueva').type).toBe('password');
    expect(input('nueva').autocomplete).toBe('new-password');
    expect(toggle('nueva').getAttribute('aria-label')).toBe('Mostrar contraseña nueva');
    expect(toggle('nueva').getAttribute('aria-pressed')).toBe('false');
  });

  it('"Mostrar" cambia el tipo del campo, y "Ocultar" lo regresa', () => {
    const { fixture, input, toggle } = create();

    toggle('nueva').click();
    fixture.detectChanges();
    expect(input('nueva').type).toBe('text');
    expect(toggle('nueva').getAttribute('aria-label')).toBe('Ocultar contraseña nueva');
    expect(toggle('nueva').getAttribute('aria-pressed')).toBe('true');

    toggle('nueva').click();
    fixture.detectChanges();
    expect(input('nueva').type).toBe('password');
  });

  it('escribe en el control del formulario', () => {
    const { form, input } = create();
    input('nueva').value = 'Abcdefg1';
    input('nueva').dispatchEvent(new Event('input'));

    expect(form.controls.contrasena.value).toBe('Abcdefg1');
  });

  it('muestra su error al salir del campo', () => {
    const { fixture, field, input } = create();
    input('nueva').dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(field('nueva').querySelector('mat-error')?.textContent?.trim()).toBe('Indique la nueva contraseña.');
  });

  it('muestra el error del grupo en la confirmación', () => {
    const { fixture, form, field, input } = create();
    form.controls.contrasena.setValue('Abcdefg1');
    input('confirmacion').value = 'Otra1234';
    input('confirmacion').dispatchEvent(new Event('input'));
    input('confirmacion').dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(field('confirmacion').querySelector('mat-error')?.textContent?.trim()).toBe('Las contraseñas no coinciden.');
  });
});
