import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ERROR_400, ERROR_409_RF09, ERROR_409_RN39, ERROR_500, apiError } from '../../../testing/api-errors';
import { applyServerErrors } from './server-errors';

function form() {
  return new FormGroup({
    cedula: new FormControl('123456789012345678901', Validators.required),
    nombre: new FormControl('María'),
    contrasenaActual: new FormControl('Secreta1'),
    horarios: new FormArray([
      new FormGroup({ horaInicio: new FormControl('08:00'), horaFin: new FormControl('07:00') }),
    ]),
  });
}

describe('applyServerErrors (RUI-02, §5.3)', () => {
  it('pone el mensaje en el campo, sin distinguir mayúsculas (Cedula ↔ cedula)', () => {
    const f = form();
    applyServerErrors(f, ERROR_400);

    const cedula = f.controls.cedula;
    expect(cedula.errors).toEqual({ server: 'La cédula no puede superar los 20 caracteres.' });
    expect(cedula.touched).toBe(true);
  });

  it('sigue rutas con índice y con punto', () => {
    const f = form();
    applyServerErrors(f, ERROR_400);
    expect(f.get('horarios.0.horaFin')?.errors).toEqual({
      server: 'La hora de fin debe ser posterior a la hora de inicio.',
    });

    const g = form();
    applyServerErrors(g, apiError({ status: 400, errors: { 'Horarios.0.HoraInicio': ['Ingrese la hora.'] } }));
    expect(g.get('horarios.0.horaInicio')?.errors).toEqual({ server: 'Ingrese la hora.' });
  });

  it('devuelve los mensajes sin campo, para FormErrors', () => {
    expect(applyServerErrors(form(), ERROR_400)).toEqual(['El periodo no existe.', 'Seleccione otro periodo.']);
  });

  it('un 409 de codeFields va a su campo (RF-09, RUI-04)', () => {
    const f = form();
    const unplaced = applyServerErrors(f, ERROR_409_RF09, { 'RF-09': 'contrasenaActual' });

    expect(unplaced).toEqual([]);
    expect(f.controls.contrasenaActual.errors).toEqual({ server: 'La contraseña actual no es correcta.' });
  });

  it('un 409 sin campo en codeFields, y los demás errores, los deja a ActionError', () => {
    expect(applyServerErrors(form(), ERROR_409_RN39, { 'RF-09': 'contrasenaActual' })).toEqual([]);
    expect(applyServerErrors(form(), ERROR_500)).toEqual([]);
  });

  it('un 409 de codeFields con un campo que no existe devuelve el detail', () => {
    expect(applyServerErrors(form(), ERROR_409_RF09, { 'RF-09': 'otro' })).toEqual([
      'La contraseña actual no es correcta.',
    ]);
  });

  it('no cambia lo que el usuario escribió (RUI-01)', () => {
    const f = form();
    const before = f.getRawValue();
    applyServerErrors(f, ERROR_400);
    expect(f.getRawValue()).toEqual(before);
  });

  it('el error desaparece cuando el usuario cambia el campo', () => {
    const f = form();
    applyServerErrors(f, ERROR_400);
    f.controls.cedula.setValue('1-2345-6789');
    expect(f.controls.cedula.errors).toBeNull();
  });
});
