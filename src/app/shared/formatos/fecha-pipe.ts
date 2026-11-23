import { Pipe, PipeTransform } from '@angular/core';
import { formatearFecha } from './formateadores';

/** `{{ '2026-03-05' | fecha }}` → `05/03/2026` (RUI-15). */
@Pipe({ name: 'fecha' })
export class FechaPipe implements PipeTransform {
  transform(valor: string | null | undefined): string {
    return formatearFecha(valor);
  }
}
