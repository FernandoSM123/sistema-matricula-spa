import { TestBed } from '@angular/core/testing';
import { BadgeKind, StatusBadge, toBadge } from './status-badge';

describe('StatusBadge (RUI-19, RUI-20)', () => {
  function render(kind: BadgeKind, value: string | boolean) {
    const fixture = TestBed.createComponent(StatusBadge);
    fixture.componentRef.setInput('kind', kind);
    fixture.componentRef.setInput('value', value);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    return {
      text: element.textContent?.trim(),
      classes: [...element.classList].filter((c) => /^(tone|shape)-/.test(c)).sort((a, b) => b.localeCompare(a)),
    };
  }

  it.each([
    ['Planificado', 'Planificado', 'tone-neutral', 'shape-dashed'],
    ['Abierto', 'Abierto', 'tone-success', 'shape-filled'],
    ['Cerrado', 'Cerrado', 'tone-warning', 'shape-double'],
    ['EnCurso', 'En curso', 'tone-info', 'shape-plain'],
    ['Finalizado', 'Finalizado', 'tone-muted', 'shape-plain'],
    ['Cancelado', 'Cancelado', 'tone-error', 'shape-struck'],
  ])('grupo %s: "%s", %s y %s', (value, text, tone, shape) => {
    expect(render('estadoGrupo', value)).toEqual({ text, classes: [tone, shape] });
  });

  it('matrícula: Activa rellena y Retirada apagada', () => {
    expect(render('estadoMatricula', 'Activa')).toEqual({ text: 'Activa', classes: ['tone-success', 'shape-filled'] });
    expect(render('estadoMatricula', 'Retirada').classes).toContain('tone-muted');
  });

  it('registro: Activo e Inactivo', () => {
    expect(render('activo', true)).toEqual({ text: 'Activo', classes: ['tone-success', 'shape-plain'] });
    expect(render('activo', false)).toEqual({ text: 'Inactivo', classes: ['tone-muted', 'shape-plain'] });
  });

  it('marcas', () => {
    expect(toBadge('marca', 'vigente').text).toBe('Vigente');
    expect(toBadge('marca', 'yaMatriculado').text).toBe('Ya matriculado');
    expect(toBadge('marca', 'sinCupo')).toEqual({ text: 'Sin cupo', tone: 'warning', shape: 'double' });
    expect(toBadge('marca', 'sistema').text).toBe('Sistema');
  });

  it('un valor desconocido: neutro, con su texto tal como llega', () => {
    expect(render('estadoGrupo', 'Suspendido')).toEqual({
      text: 'Suspendido',
      classes: ['tone-neutral', 'shape-plain'],
    });
    expect(toBadge('marca', 'otra')).toEqual({ text: 'otra', tone: 'neutral', shape: 'plain' });
  });
});
