import { EnvironmentProviders, Injectable, makeEnvironmentProviders } from '@angular/core';
import { MatDatepickerIntl } from '@angular/material/datepicker';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldDefaultOptions } from '@angular/material/form-field';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { formatNumber } from '../../shared/formatting/formatters';
import { provideAppDateAdapter } from './app-date-adapter';

/** Textos del paginador (RUI-10): "Filas por página" y "21–40 de 134". */
@Injectable()
export class PaginatorIntl extends MatPaginatorIntl {
  override itemsPerPageLabel = 'Filas por página';
  override nextPageLabel = 'Página siguiente';
  override previousPageLabel = 'Página anterior';
  override firstPageLabel = 'Primera página';
  override lastPageLabel = 'Última página';

  override getRangeLabel = (page: number, size: number, total: number): string => {
    if (total === 0 || size === 0) {
      return `0 de ${formatNumber(total)}`;
    }
    const start = page * size;
    // Como Material: si la página quedó fuera del total, el rango no se recorta.
    const end = start < total ? Math.min(start + size, total) : start + size;
    return `${formatNumber(start + 1)}–${formatNumber(end)} de ${formatNumber(total)}`;
  };
}

/** Textos del selector de fecha, que leen los lectores de pantalla. */
@Injectable()
export class DatepickerIntl extends MatDatepickerIntl {
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

  override formatYearRange(start: string, end: string): string {
    return `${start}–${end}`;
  }

  override formatYearRangeLabel(start: string, end: string): string {
    return `de ${start} a ${end}`;
  }
}

const FIELD_OPTIONS: MatFormFieldDefaultOptions = {
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
export function provideMaterialDefaults(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: FIELD_OPTIONS },
    { provide: MatPaginatorIntl, useClass: PaginatorIntl },
    { provide: MatDatepickerIntl, useClass: DatepickerIntl },
    provideAppDateAdapter(),
  ]);
}
