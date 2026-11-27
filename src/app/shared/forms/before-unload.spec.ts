import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { warnBeforeUnload } from './before-unload';

@Component({ changeDetection: ChangeDetectionStrategy.OnPush, template: '' })
class Form {
  readonly dirty = signal(false);

  constructor() {
    warnBeforeUnload(() => this.dirty());
  }
}

describe('warnBeforeUnload (RUI-09, §5.5)', () => {
  /** Simula la salida de la página y devuelve si el formulario pidió el aviso del navegador. */
  function unload(): boolean {
    const event = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(event);
    return event.defaultPrevented;
  }

  it('con cambios, pide el aviso del navegador', () => {
    const fixture = TestBed.createComponent(Form);
    fixture.componentInstance.dirty.set(true);

    expect(unload()).toBe(true);
    fixture.destroy();
  });

  it('sin cambios, no lo pide', () => {
    const fixture = TestBed.createComponent(Form);

    expect(unload()).toBe(false);
    fixture.destroy();
  });

  it('se quita al destruir el formulario', () => {
    const fixture = TestBed.createComponent(Form);
    fixture.componentInstance.dirty.set(true);
    fixture.destroy();

    expect(unload()).toBe(false);
  });
});
