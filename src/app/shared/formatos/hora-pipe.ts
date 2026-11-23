import { Pipe, PipeTransform } from '@angular/core';
import { formatearHora } from './formateadores';

/** `{{ '18:30:00' | hora }}` → `6:30 p. m.` (RUI-17). */
@Pipe({ name: 'hora' })
export class HoraPipe implements PipeTransform {
  transform(valor: string | null | undefined): string {
    return formatearHora(valor);
  }
}
