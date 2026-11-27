// Los controles con error: los que llevan la clase `ng-invalid` de Angular, sin contar el
// formulario ni los grupos, que la llevan si alguno de sus campos es inválido.
const INVALID_CONTROL = '.ng-invalid:not(form):not([formgroupname]):not([formarrayname])';
const FOCUSABLE = 'input, textarea, select, button, [tabindex]:not([tabindex="-1"])';

/**
 * Lleva el foco al primer campo con error, en el orden del formulario (docs/arquitectura.md §5.4),
 * para el teclado y los lectores de pantalla. Si el control es un componente propio
 * (`PasswordField`, `SearchSelect`), enfoca su primer elemento enfocable. Devuelve si encontró uno.
 */
export function focusFirstError(element: HTMLElement): boolean {
  const invalid = element.querySelector<HTMLElement>(INVALID_CONTROL);
  if (invalid === null) return false;
  const target = invalid.matches(FOCUSABLE) ? invalid : invalid.querySelector<HTMLElement>(FOCUSABLE);
  target?.focus();
  return target !== null;
}
