import { Pipe, PipeTransform } from '@angular/core';
import { formatTime } from './formatters';

/** `{{ '18:30:00' | smTime }}` → `6:30 p. m.` (RUI-17). */
@Pipe({ name: 'smTime' })
export class SmTimePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return formatTime(value);
  }
}
