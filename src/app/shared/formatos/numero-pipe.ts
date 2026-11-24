import { Pipe, PipeTransform } from '@angular/core';
import { formatearNumero } from './formateadores';

/** `{{ 1234 | numero }}` → `1 234` (RUI-18). */
@Pipe({ name: 'numero' })
export class NumeroPipe implements PipeTransform {
  transform(valor: number | null | undefined): string {
    return formatearNumero(valor);
  }
}
