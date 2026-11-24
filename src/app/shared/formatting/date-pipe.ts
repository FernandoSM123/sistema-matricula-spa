import { Pipe, PipeTransform } from '@angular/core';
import { formatDate } from './formatters';

/** `{{ '2026-03-05' | smDate }}` → `05/03/2026` (RUI-15). */
@Pipe({ name: 'smDate' })
export class SmDatePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return formatDate(value);
  }
}
