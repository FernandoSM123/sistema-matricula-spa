import { EnvironmentProviders, Injectable, makeEnvironmentProviders } from '@angular/core';
import { MatDatepickerIntl } from '@angular/material/datepicker';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldDefaultOptions } from '@angular/material/form-field';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { formatearNumero } from '../../shared/formatos/formateadores';
import { provideAdaptadorFechas } from './adaptador-fechas';

/** Textos del paginador (RUI-10): "Filas por página" y "21–40 de 134". */
@Injectable()
export class PaginadorIntl extends MatPaginatorIntl {
  override itemsPerPageLabel = 'Filas por página';
  override nextPageLabel = 'Página siguiente';
  override previousPageLabel = 'Página anterior';
  override firstPageLabel = 'Primera página';
  override lastPageLabel = 'Última página';

  override getRangeLabel = (pagina: number, tamano: number, total: number): string => {
    if (total === 0 || tamano === 0) {
      return `0 de ${formatearNumero(total)}`;
    }
    const inicio = pagina * tamano;
    // Como Material: si la página quedó fuera del total, el rango no se recorta.
    const fin = inicio < total ? Math.min(inicio + tamano, total) : inicio + tamano;
    return `${formatearNumero(inicio + 1)}–${formatearNumero(fin)} de ${formatearNumero(total)}`;
  };
}

/** Textos del selector de fecha, que leen los lectores de pantalla. */
@Injectable()
export class SelectorFechaIntl extends MatDatepickerIntl {
  override calendarLabel = 'Calendario';
  override openCalendarLabel = 'Abrir el calendario';
  override closeCalendarLabel = 'Cerrar el calendario';
  override prevMonthLabel = 'Mes anterior';
  override nextMonthLabel = 'Mes siguiente';
  override prevYearLabel = 'Año anterior';
  override nextYearLabel = 'Año siguiente';
  override prevMultiYearLabel = 'Años anteriores';
  override nextMultiYearLabel = 'Años siguientes';
  override switchToMonthViewLabel = 'Elegir la fecha';
  override switchToMultiYearViewLabel = 'Elegir el mes y el año';
  override startDateLabel = 'Fecha de inicio';
  override endDateLabel = 'Fecha de fin';
  override comparisonDateLabel = 'Rango de comparación';

  override formatYearRange(inicio: string, fin: string): string {
    return `${inicio}–${fin}`;
  }

  override formatYearRangeLabel(inicio: string, fin: string): string {
    return `de ${inicio} a ${fin}`;
  }
}

const OPCIONES_CAMPOS: MatFormFieldDefaultOptions = {
  appearance: 'outline',
  subscriptSizing: 'dynamic',
};

/**
 * Opciones por defecto de los campos, el paginador y el selector de fecha (§6.1), y el adaptador
 * de fechas (§7.3).
 *
 * No se registran en app.config.ts: cada área las registra en los providers de su ruta
 * diferida (§2.5). Si la raíz importara este archivo, el primer uso de esos controles en una
 * vista diferida metería sus módulos completos en la carga inicial (fundacion T6), y el
 * adaptador agrega date-fns, que solo usan los formularios (nucleo T1: 70 kB).
 */
export function provideMaterialVistas(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: OPCIONES_CAMPOS },
    { provide: MatPaginatorIntl, useClass: PaginadorIntl },
    { provide: MatDatepickerIntl, useClass: SelectorFechaIntl },
    provideAdaptadorFechas(),
  ]);
}
