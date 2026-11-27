import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { delay, Observable, of } from 'rxjs';
import { SearchOption, SearchSelect } from '../../../../shared/ui/search-select/search-select';

const CURSOS: readonly SearchOption[] = [
  ['ING-101 · Inglés conversacional I', 'Básico · 48 horas'],
  ['ING-201 · Inglés conversacional II', 'Intermedio · 48 horas'],
  ['ING-301 · Inglés conversacional III', 'Avanzado · 48 horas'],
  ['FOT-110 · Fotografía básica', 'Básico · 24 horas'],
  ['FOT-210 · Fotografía de retrato', 'Intermedio · 24 horas'],
  ['COC-120 · Cocina costarricense', 'Básico · 30 horas'],
  ['PRO-100 · Programación desde cero', 'Básico · 60 horas'],
  ['PRO-110 · Programación en Python', 'Básico · 60 horas'],
  ['PRO-200 · Desarrollo web', 'Intermedio · 60 horas'],
  ['PRO-210 · Desarrollo web con Angular', 'Intermedio · 60 horas'],
  ['PRO-220 · Pruebas de software', 'Intermedio · 40 horas'],
  ['PRO-300 · Bases de datos', 'Avanzado · 60 horas'],
  ['PRO-310 · Programación de móviles', 'Avanzado · 60 horas'],
  ['PRO-320 · Programación de videojuegos', 'Avanzado · 60 horas'],
].map(([text, detail], i) => ({ id: i + 1, text, detail }));

const PROFESORES: readonly SearchOption[] = [
  'Ana Lucía Vargas Soto',
  'Carlos Andrés Mora Jiménez',
  'Gabriela Rojas Castro',
  'Jorge Esteban Calderón Arias',
].map((text, i) => ({ id: i + 1, text }));

const AULAS: readonly SearchOption[] = [
  { id: 7, text: 'B-201 · Edificio B, laboratorio de cómputo', detail: 'Capacidad 18' },
  { id: 8, text: 'B-202 · Edificio B, aula', detail: 'Capacidad 30' },
  { id: 9, text: 'C-101 · Edificio C, cocina', detail: 'Capacidad 12' },
];

/** Sin tildes ni mayúsculas, para comparar. */
function plain(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLocaleLowerCase('es-CR');
}

/** Una búsqueda en memoria con 400 ms de espera, como la API. */
function searchIn(options: readonly SearchOption[]) {
  return (text: string): Observable<readonly SearchOption[]> =>
    of(options.filter((option) => plain(option.text).includes(plain(text)))).pipe(delay(400));
}

/**
 * Sección 5 del catálogo: `SearchSelect` en un formulario, como el del grupo (V-29). "pro" encuentra
 * 11 cursos y muestra 10; un profesor que no existe muestra el mensaje sin resultados; el aula
 * viene elegida, como en un formulario de edición.
 */
@Component({
  selector: 'sm-search-select-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [JsonPipe, ReactiveFormsModule, SearchSelect],
  template: `
    <form class="grid" [formGroup]="form" novalidate>
      <sm-search-select
        formControlName="cursoId"
        label="Curso"
        field="el curso"
        placeholder="Código o nombre"
        [search]="searchCursos"
      />
      <sm-search-select
        formControlName="profesorId"
        label="Profesor"
        field="el profesor"
        noResults="No hay profesores activos que coincidan."
        [search]="searchProfesores"
      />
      <sm-search-select
        formControlName="aulaId"
        label="Aula"
        hint="Opcional. Viene elegida, como al editar."
        initialText="B-201 · Edificio B, laboratorio de cómputo"
        [search]="searchAulas"
      />
    </form>
    <p class="result">Valor del formulario: {{ value() | json }}</p>
  `,
  styles: `
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
      align-items: start;
      gap: var(--sm-space-3);
    }
    .result {
      margin: var(--sm-space-2) 0 0;
      color: var(--sm-text-secondary);
    }
  `,
})
export class SearchSelectExample {
  protected readonly form = inject(NonNullableFormBuilder).group({
    cursoId: [null as number | null, Validators.required],
    profesorId: [null as number | null, Validators.required],
    aulaId: [7 as number | null],
  });
  protected readonly value = toSignal(this.form.valueChanges, { initialValue: this.form.value });

  protected readonly searchCursos = searchIn(CURSOS);
  protected readonly searchProfesores = searchIn(PROFESORES);
  protected readonly searchAulas = searchIn(AULAS);
}
