import { Pipe, PipeTransform } from '@angular/core';
import { formatDateTime, APP_TIME_ZONE } from './formatters';

/** `{{ '2026-03-06T00:30:00Z' | smDateTime }}` → `05/03/2026 6:30 p. m.` (RUI-16). */
@Pipe({ name: 'smDateTime' })
export class SmDateTimePipe implements PipeTransform {
  transform(value: string | null | undefined, timeZone: string = APP_TIME_ZONE): string {
    return formatDateTime(value, timeZone);
  }
}
