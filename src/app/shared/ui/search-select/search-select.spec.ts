import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MATERIAL_ANIMATIONS } from '@angular/material/core';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { Observable, of, throwError } from 'rxjs';
import { MAX_OPTIONS, SEARCH_DELAY_MS, SearchOption, SearchSelect } from './search-select';

const CURSOS: SearchOption[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  text: `PRO-${100 + i} · Curso ${i + 1}`,
  detail: 'Básico',
}));

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, SearchSelect],
  template: `
    <form [formGroup]="form">
      <sm-search-select
        formControlName="cursoId"
        label="Curso"
        field="el curso"
        [search]="search"
        [initialText]="initialText"
      />
    </form>
  `,
})
class Host {
  readonly form = inject(NonNullableFormBuilder).group({ cursoId: [null as number | null, Validators.required] });
  initialText = 'PRO-103 · Curso 4';
  readonly searched: string[] = [];
  result: (text: string) => Observable<readonly SearchOption[]> = (text) =>
    of(CURSOS.filter((c) => c.text.toLowerCase().includes(text.toLowerCase())));
  readonly search = (text: string) => {
    this.searched.push(text);
    return this.result(text);
  };
}

describe('SearchSelect (RUI-11, excepción)', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  function create(configure: (host: Host) => void = () => undefined) {
    TestBed.configureTestingModule({
      imports: [MatIconTestingModule],
      providers: [{ provide: MATERIAL_ANIMATIONS, useValue: { animationsDisabled: true } }],
    });
    const fixture = TestBed.createComponent(Host);
    configure(fixture.componentInstance);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    const control = host.form.controls.cursoId;
    return { fixture, host, input, control };
  }

  async function type(fixture: ComponentFixture<Host>, input: HTMLInputElement, text: string) {
    input.focus();
    input.value = text;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(SEARCH_DELAY_MS);
    fixture.detectChanges();
  }

  const options = () => [...document.querySelectorAll<HTMLElement>('mat-option')];
  const optionTexts = () => options().map((o) => o.querySelector('.option-text')?.textContent ?? o.textContent?.trim());

  it('busca con 300 ms de retardo, no en cada tecla', async () => {
    const { fixture, host, input } = create();
    input.value = 'p';
    input.dispatchEvent(new Event('input'));
    input.value = 'pr';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(SEARCH_DELAY_MS - 1);
    expect(host.searched).toEqual([]);

    await vi.advanceTimersByTimeAsync(1);
    expect(host.searched).toEqual(['pr']);
  });

  it('muestra hasta 10 opciones, con su dato secundario', async () => {
    const { fixture, input } = create();
    await type(fixture, input, 'pro');

    expect(options()).toHaveLength(MAX_OPTIONS);
    expect(optionTexts()[0]).toBe('PRO-100 · Curso 1');
    expect(options()[0].querySelector('.option-detail')?.textContent).toBe('Básico');
  });

  it('elegir una opción guarda su id y muestra su texto', async () => {
    const { fixture, input, control } = create();
    await type(fixture, input, 'curso 3');

    options()[0].click();
    fixture.detectChanges();
    expect(control.value).toBe(3);
    expect(input.value).toBe('PRO-102 · Curso 3');
  });

  it('el valor inicial muestra su texto', () => {
    const { fixture, host, input } = create();
    host.form.setValue({ cursoId: 4 });
    fixture.detectChanges();
    expect(input.value).toBe('PRO-103 · Curso 4');
  });

  it('borrar el texto deja el valor en null', async () => {
    const { fixture, host, input, control } = create();
    host.form.setValue({ cursoId: 4 });
    fixture.detectChanges();

    await type(fixture, input, '');
    expect(control.value).toBeNull();
  });

  it('escribir después de elegir quita la elección', async () => {
    const { fixture, host, input, control } = create();
    host.form.setValue({ cursoId: 4 });
    fixture.detectChanges();

    await type(fixture, input, 'PRO-103 · Curso');
    expect(control.value).toBeNull();
  });

  it('"Quitar" borra la elección y devuelve el foco al campo', () => {
    const { fixture, host, input, control } = create();
    host.form.setValue({ cursoId: 4 });
    fixture.detectChanges();

    const clear = fixture.nativeElement.querySelector('button[aria-label="Quitar curso"]') as HTMLButtonElement;
    clear.click();
    fixture.detectChanges();
    expect(control.value).toBeNull();
    expect(input.value).toBe('');
    expect(document.activeElement).toBe(input);
    expect(fixture.nativeElement.querySelector('button[aria-label="Quitar curso"]')).toBeNull();
  });

  it('sin resultados: un mensaje, como opción deshabilitada', async () => {
    const { fixture, input } = create();
    await type(fixture, input, 'zúñiga');

    expect(optionTexts()).toEqual(['Sin resultados.']);
    expect(options()[0].getAttribute('aria-disabled')).toBe('true');
  });

  it('si la búsqueda falla, lo dice sin romper el campo', async () => {
    const { fixture, input } = create((host) => (host.result = () => throwError(() => new Error('x'))));
    await type(fixture, input, 'pro');
    expect(optionTexts()).toEqual(['No se pudo buscar. Intente de nuevo.']);
  });

  it('el error del control: el asterisco y el mensaje al tocarlo', () => {
    const { fixture, host } = create();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('input')?.required).toBe(true);

    host.form.markAllAsTouched();
    fixture.detectChanges();
    expect(element.querySelector('mat-error')?.textContent?.trim()).toBe('Indique el curso.');
  });

  it('deshabilitado con el control', () => {
    const { fixture, host, input } = create();
    host.form.controls.cursoId.disable();
    fixture.detectChanges();
    expect(input.disabled).toBe(true);
  });
});
