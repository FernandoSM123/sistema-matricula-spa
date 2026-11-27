import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ERROR_400 } from '../../../../testing/api-errors';
import { groupErrorMatcher } from '../group-error-matcher';
import { applyServerErrors } from '../server-errors';
import { fieldsMatch } from '../validators';
import { FieldError } from './field-error';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FieldError],
  template: `
    <sm-field-error class="cedula" [control]="form.controls.cedula" field="la cédula" />
    <sm-field-error class="confirmacion" [control]="form.controls.confirmacion" groupError="fieldsMatch" />
  `,
})
class Host {
  readonly form = new FormGroup(
    {
      cedula: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(20)] }),
      contrasena: new FormControl('Abcdefg1', { nonNullable: true }),
      confirmacion: new FormControl('', { nonNullable: true }),
    },
    { validators: fieldsMatch('contrasena', 'confirmacion') },
  );
}

describe('FieldError (§5.2)', () => {
  function create() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const text = (selector: string) =>
      (fixture.nativeElement.querySelector(selector) as HTMLElement).textContent?.trim();
    return { fixture, form: fixture.componentInstance.form, text };
  }

  it('required, con el dato y su artículo', () => {
    expect(create().text('.cedula')).toBe('Indique la cédula.');
  });

  it('cambia con el valor, aunque el componente sea OnPush', () => {
    const { fixture, form, text } = create();

    form.controls.cedula.setValue('1'.repeat(21));
    fixture.detectChanges();
    expect(text('.cedula')).toBe('Use hasta 20 caracteres.');

    form.controls.cedula.setValue('1-2345-6789');
    fixture.detectChanges();
    expect(text('.cedula')).toBe('');
  });

  it('el error del servidor', () => {
    const { fixture, form, text } = create();
    form.controls.cedula.setValue('1-2345-6789');
    applyServerErrors(form, ERROR_400);
    fixture.detectChanges();

    expect(text('.cedula')).toBe('La cédula no puede superar los 20 caracteres.');
  });

  it('el error del grupo en el campo, si el campo no tiene uno propio', () => {
    const { fixture, form, text } = create();
    expect(text('.confirmacion')).toBe('');

    form.controls.confirmacion.setValue('Otra1234');
    fixture.detectChanges();
    expect(text('.confirmacion')).toBe('Las contraseñas no coinciden.');

    form.controls.contrasena.setValue('Otra1234');
    fixture.detectChanges();
    expect(text('.confirmacion')).toBe('');
  });
});

describe('groupErrorMatcher', () => {
  const group = () =>
    new FormGroup(
      { contrasena: new FormControl('Abcdefg1'), confirmacion: new FormControl('Otra1234') },
      { validators: fieldsMatch('contrasena', 'confirmacion') },
    );

  it('marca el campo con el error del grupo, al salir del campo', () => {
    const matcher = groupErrorMatcher('fieldsMatch');
    const confirmacion = group().controls.confirmacion;

    expect(matcher.isErrorState(confirmacion, null)).toBe(false);
    confirmacion.markAsTouched();
    expect(matcher.isErrorState(confirmacion, null)).toBe(true);
  });

  it('sin error en el grupo ni en el campo, no lo marca', () => {
    const g = group();
    g.controls.confirmacion.setValue('Abcdefg1');
    g.controls.confirmacion.markAsTouched();
    expect(groupErrorMatcher('fieldsMatch').isErrorState(g.controls.confirmacion, null)).toBe(false);
  });
});
