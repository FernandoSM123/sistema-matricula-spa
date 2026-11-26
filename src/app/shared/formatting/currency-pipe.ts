import { Pipe, PipeTransform } from '@angular/core';
import { formatCurrency } from './formatters';

/** `{{ 25000 | smCurrency }}` → `₡25 000,00` (RUI-18). */
@Pipe({ name: 'smCurrency' })
export class SmCurrencyPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    return formatCurrency(value);
  }
}
