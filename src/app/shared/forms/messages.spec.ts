import { FormControl, Validators } from '@angular/forms';
import { errorMessage } from './messages';
import { minDate, passwordPolicy } from './validators';

describe('errorMessage (§5.2)', () => {
  it('sin errores, null', () => {
    expect(errorMessage(null)).toBeNull();
    expect(errorMessage({})).toBeNull();
  });

  it('required con y sin el nombre del dato', () => {
    expect(errorMessage({ required: true }, 'los apellidos')).toBe('Indique los apellidos.');
    expect(errorMessage({ required: true })).toBe('Indique este dato.');
  });

  it('el largo de maxlength y minlength', () => {
    expect(errorMessage(new FormControl('abc', Validators.maxLength(2)).errors)).toBe('Use hasta 2 caracteres.');
    expect(errorMessage({ minlength: { requiredLength: 8, actualLength: 3 } })).toBe('Use al menos 8 caracteres.');
  });

  it('los validadores propios', () => {
    expect(errorMessage(new FormControl('abc', passwordPolicy).errors)).toBe(
      'Use al menos 8 caracteres, con una mayúscula y un número.',
    );
    expect(errorMessage(new FormControl('1899-12-31', minDate('1900-01-01')).errors)).toBe(
      'La fecha no puede ser anterior al 01/01/1900.',
    );
    expect(errorMessage({ greaterThan: { limit: 0 } })).toBe('Use un valor mayor que 0.');
    expect(errorMessage({ telefono: true })).toBe('De 8 a 20 caracteres: dígitos, espacios, + y -.');
  });

  it('el error del servidor muestra su texto', () => {
    expect(errorMessage({ server: 'La cédula ya está registrada.' })).toBe('La cédula ya está registrada.');
  });

  it('solo el primer error', () => {
    expect(errorMessage({ required: true, server: 'Otro' }, 'la cédula')).toBe('Indique la cédula.');
  });

  it('un error sin mensaje propio no muestra su nombre técnico (RUI-05)', () => {
    expect(errorMessage({ algoNuevo: true })).toBe('Revise este dato.');
  });
});
