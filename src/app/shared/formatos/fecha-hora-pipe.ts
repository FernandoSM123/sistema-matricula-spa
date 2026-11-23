import { Pipe, PipeTransform } from '@angular/core';
import { formatearFechaHora, ZONA_INSTITUTO } from './formateadores';

/** `{{ '2026-03-06T00:30:00Z' | fechaHora }}` → `05/03/2026 6:30 p. m.` (RUI-16). */
@Pipe({ name: 'fechaHora' })
export class FechaHoraPipe implements PipeTransform {
  transform(valor: string | null | undefined, zona: string = ZONA_INSTITUTO): string {
    return formatearFechaHora(valor, zona);
  }
}
