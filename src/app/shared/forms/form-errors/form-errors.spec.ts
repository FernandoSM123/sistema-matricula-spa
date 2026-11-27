import { TestBed } from '@angular/core/testing';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { FormErrors } from './form-errors';

describe('FormErrors (RUI-02)', () => {
  function create(messages: string[], heading?: string) {
    TestBed.configureTestingModule({ imports: [MatIconTestingModule] });
    const fixture = TestBed.createComponent(FormErrors);
    fixture.componentRef.setInput('messages', messages);
    if (heading) fixture.componentRef.setInput('heading', heading);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('sin mensajes, no dibuja nada', () => {
    expect(create([]).children).toHaveLength(0);
  });

  it('un mensaje, como alerta', () => {
    const element = create(['No hay un periodo abierto.'], 'No se pudo registrar el estudiante.');

    expect(element.querySelector('[role="alert"]')).not.toBeNull();
    expect(element.textContent).toContain('No se pudo registrar el estudiante.');
    expect(element.textContent).toContain('No hay un periodo abierto.');
  });

  it('varios mensajes, como lista', () => {
    const items = [...create(['Uno.', 'Dos.']).querySelectorAll('li')].map((li) => li.textContent);
    expect(items).toEqual(['Uno.', 'Dos.']);
  });
});
