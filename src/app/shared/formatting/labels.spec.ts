import { toLabel, LabelType } from './labels';

describe('toLabel (RUI-19)', () => {
  it.each<[LabelType, string, string]>([
    ['rol', 'Administrador', 'Administrador'],
    ['nivelCurso', 'Basico', 'Básico'],
    ['modalidad', 'Hibrida', 'Híbrida'],
    ['estadoGrupo', 'EnCurso', 'En curso'],
    ['estadoMatricula', 'Retirada', 'Retirada'],
    ['motivoRetiro', 'CancelacionGrupo', 'Cancelación del grupo'],
    ['dia', 'Miercoles', 'Miércoles'],
    ['accionAuditoria', 'Modificacion', 'Modificación'],
    ['origenError', 'Peticion', 'Solicitud'],
  ])('%s: %s → %s', (type, value, expected) => {
    expect(toLabel(type, value)).toBe(expected);
  });

  it('devuelve tal cual un valor que no está en la tabla', () => {
    expect(toLabel('estadoGrupo', 'Suspendido')).toBe('Suspendido');
  });

  it('no confunde un valor con una propiedad heredada', () => {
    expect(toLabel('dia', 'toString')).toBe('toString');
  });

  it.each([null, undefined, ''])('%s → texto vacío', (value) => {
    expect(toLabel('rol', value)).toBe('');
  });
});
