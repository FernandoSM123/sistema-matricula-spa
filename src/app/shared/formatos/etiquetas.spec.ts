import { etiquetar, TipoEtiqueta } from './etiquetas';

describe('etiquetar (RUI-19)', () => {
  it.each<[TipoEtiqueta, string, string]>([
    ['rol', 'Administrador', 'Administrador'],
    ['nivelCurso', 'Basico', 'Básico'],
    ['modalidad', 'Hibrida', 'Híbrida'],
    ['estadoGrupo', 'EnCurso', 'En curso'],
    ['estadoMatricula', 'Retirada', 'Retirada'],
    ['motivoRetiro', 'CancelacionGrupo', 'Cancelación del grupo'],
    ['dia', 'Miercoles', 'Miércoles'],
    ['accionAuditoria', 'Modificacion', 'Modificación'],
    ['origenError', 'Peticion', 'Solicitud'],
  ])('%s: %s → %s', (tipo, valor, esperado) => {
    expect(etiquetar(tipo, valor)).toBe(esperado);
  });

  it('devuelve tal cual un valor que no está en la tabla', () => {
    expect(etiquetar('estadoGrupo', 'Suspendido')).toBe('Suspendido');
  });

  it('no confunde un valor con una propiedad heredada', () => {
    expect(etiquetar('dia', 'toString')).toBe('toString');
  });

  it.each([null, undefined, ''])('%s → texto vacío', (valor) => {
    expect(etiquetar('rol', valor)).toBe('');
  });
});
