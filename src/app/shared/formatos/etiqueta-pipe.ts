import { Pipe, PipeTransform } from '@angular/core';
import { etiquetar, TipoEtiqueta } from './etiquetas';

/** `{{ grupo.estado | etiqueta: 'estadoGrupo' }}` → `En curso` (RUI-19). */
@Pipe({ name: 'etiqueta' })
export class EtiquetaPipe implements PipeTransform {
  transform(valor: string | null | undefined, tipo: TipoEtiqueta): string {
    return etiquetar(tipo, valor);
  }
}
