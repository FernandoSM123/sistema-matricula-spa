import { Pipe, PipeTransform } from '@angular/core';
import { formatearMoneda } from './formateadores';

/** `{{ 25000 | moneda }}` → `₡25 000,00` (RUI-18). */
@Pipe({ name: 'moneda' })
export class MonedaPipe implements PipeTransform {
  transform(valor: number | null | undefined): string {
    return formatearMoneda(valor);
  }
}
