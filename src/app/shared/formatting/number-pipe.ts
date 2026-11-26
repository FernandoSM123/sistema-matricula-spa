import { Pipe, PipeTransform } from '@angular/core';
import { formatNumber } from './formatters';

/** `{{ 1234 | smNumber }}` → `1 234` (RUI-18). */
@Pipe({ name: 'smNumber' })
export class SmNumberPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    return formatNumber(value);
  }
}
