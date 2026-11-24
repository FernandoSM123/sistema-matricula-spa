import { Pipe, PipeTransform } from '@angular/core';
import { toLabel, LabelType } from './labels';

/** `{{ grupo.estado | smLabel: 'estadoGrupo' }}` → `En curso` (RUI-19). */
@Pipe({ name: 'smLabel' })
export class SmLabelPipe implements PipeTransform {
  transform(value: string | null | undefined, type: LabelType): string {
    return toLabel(type, value);
  }
}
