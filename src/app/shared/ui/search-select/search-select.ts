import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormGroupDirective, NgControl, NgForm, Validators } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatAutocomplete, MatAutocompleteTrigger, MatOption } from '@angular/material/autocomplete';
import { MatError, MatFormField, MatHint, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { catchError, debounceTime, distinctUntilChanged, map, Observable, of, startWith, switchMap } from 'rxjs';
import { FieldError } from '../../forms/field-error/field-error';

/** Una opción del selector: el id que se guarda, el texto que se muestra y un dato secundario. */
export interface SearchOption {
  id: number;
  text: string;
  /** El dato secundario del wireframe: "Básico · 48 horas". */
  detail?: string;
}

/** Retardo antes de buscar, para no pedir en cada tecla (§3.4). */
export const SEARCH_DELAY_MS = 300;
/** Opciones que se muestran como máximo (§6.2, fila 5). */
export const MAX_OPTIONS = 10;

type Results =
  | { state: 'idle' }
  | { state: 'searching' }
  | { state: 'done'; options: readonly SearchOption[] }
  | { state: 'failed' };

/**
 * Selector con búsqueda (RUI-11, excepción; docs/arquitectura.md §6.2 fila 5), sobre
 * `mat-autocomplete`. Es un control de formulario (`formControlName`) cuyo valor es el `id` de la
 * opción elegida; muestra su `text`.
 *
 * - Sugiere mientras se escribe, con 300 ms de retardo y hasta 10 opciones.
 * - Escribir después de elegir quita la elección: el valor queda `null` hasta elegir otra opción.
 * - En un formulario de edición, `initialText` es el texto del valor que trae el formulario.
 * - Con una opción elegida, el botón "Quitar" la borra.
 */
@Component({
  selector: 'sm-search-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FieldError,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatError,
    MatFormField,
    MatHint,
    MatIcon,
    MatIconButton,
    MatInput,
    MatLabel,
    MatOption,
    MatSuffix,
  ],
  templateUrl: './search-select.html',
  styleUrl: './search-select.scss',
})
export class SearchSelect implements ControlValueAccessor, AfterContentInit {
  /** El control del formulario, si lo hay. Se inyecta en lugar de `NG_VALUE_ACCESSOR` para mostrar sus errores. */
  protected readonly ngControl = inject(NgControl, { self: true, optional: true });
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly label = input.required<string>();
  readonly search = input.required<(text: string) => Observable<readonly SearchOption[]>>();
  /** El texto del valor inicial, en los formularios de edición. */
  readonly initialText = input<string>();
  /** Para el mensaje del error: "Indique el curso." */
  readonly field = input<string>();
  readonly hint = input<string>();
  readonly placeholder = input('');
  /** El mensaje cuando la búsqueda no trae nada: "No hay profesores activos que coincidan." */
  readonly noResults = input('Sin resultados.');

  private readonly inputElement = viewChild.required<ElementRef<HTMLInputElement>>('box');
  private readonly matInput = viewChild(MatInput);

  protected readonly value = signal<number | null>(null);
  protected readonly disabled = signal(false);
  /** La opción elegida en esta sesión del control. */
  private readonly chosen = signal<SearchOption | null>(null);
  /** Lo que se está escribiendo; `null` si se muestra la opción elegida. */
  private readonly typed = signal<string | null>(null);

  protected readonly text = computed(() => {
    const typed = this.typed();
    if (typed !== null) return typed;
    const value = this.value();
    if (value === null) return '';
    const chosen = this.chosen();
    return chosen?.id === value ? chosen.text : (this.initialText() ?? '');
  });

  protected readonly results = toSignal(
    toObservable(this.typed).pipe(
      map((text) => text?.trim() ?? ''),
      distinctUntilChanged(),
      debounceTime(SEARCH_DELAY_MS),
      switchMap((text) =>
        text === ''
          ? of<Results>({ state: 'idle' })
          : this.search()(text).pipe(
              map((options): Results => ({ state: 'done', options: options.slice(0, MAX_OPTIONS) })),
              catchError(() => of<Results>({ state: 'failed' })),
              startWith<Results>({ state: 'searching' }),
            ),
      ),
    ),
    { initialValue: { state: 'idle' } as Results },
  );

  protected readonly options = computed(() => {
    const results = this.results();
    return results.state === 'done' ? results.options : [];
  });

  /** "Buscando…", "Sin resultados." o el fallo de la búsqueda, como una opción deshabilitada. */
  protected readonly message = computed(() => {
    const results = this.results();
    if (results.state === 'searching') return 'Buscando…';
    if (results.state === 'failed') return 'No se pudo buscar. Intente de nuevo.';
    if (results.state === 'done' && results.options.length === 0) return this.noResults();
    return null;
  });

  protected readonly clearLabel = computed(() => `Quitar ${this.label().toLocaleLowerCase('es-CR')}`);

  /** El asterisco de obligatorio sigue al control del formulario. */
  protected readonly required = signal(false);

  /** El borde rojo y el mensaje siguen al control del formulario, no al `input` interno. */
  protected readonly errorMatcher: ErrorStateMatcher = {
    isErrorState: (_control, form: FormGroupDirective | NgForm | null) => {
      const control = this.ngControl?.control;
      return !!control && control.invalid && (control.touched || !!form?.submitted);
    },
  };

  private onChange: (value: number | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor() {
    if (this.ngControl !== null) this.ngControl.valueAccessor = this;
  }

  /**
   * `formControlName` conecta su control después del `ngOnInit` de este componente, pero antes de
   * dibujarlo. `MatInput` solo calcula su estado de error si tiene su propio control, y el `input`
   * interno no lo tiene: se recalcula con cada evento del control (tocarlo, enviar, validar).
   */
  ngAfterContentInit(): void {
    const control = this.ngControl?.control;
    if (!control) return;
    this.required.set(control.hasValidator(Validators.required));
    control.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.matInput()?.updateErrorState(); // Puede llegar un evento antes de crear la vista.
      this.changeDetector.markForCheck();
    });
  }

  writeValue(value: number | null): void {
    this.value.set(value ?? null);
    this.typed.set(null);
    if (this.chosen()?.id !== value) this.chosen.set(null);
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled.set(disabled);
  }

  protected readonly displayOption = (option: SearchOption | string | null): string =>
    typeof option === 'string' ? option : (option?.text ?? '');

  protected onInput(text: string): void {
    this.typed.set(text);
    if (this.value() !== null) this.update(null);
  }

  protected select(option: SearchOption): void {
    this.chosen.set(option);
    this.typed.set(null);
    this.update(option.id);
  }

  protected blur(): void {
    this.onTouched();
  }

  protected clear(): void {
    this.chosen.set(null);
    this.typed.set(null);
    this.update(null);
    this.inputElement().nativeElement.focus();
  }

  private update(value: number | null): void {
    this.value.set(value);
    this.onChange(value);
  }
}
