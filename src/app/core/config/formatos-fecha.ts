import { MatDateFormats } from '@angular/material/core';

/** Formato de las horas. `AdaptadorFechas` lo reconoce y escribe la hora con Intl (§7.3). */
export const FORMATO_HORA = 'h:mm a';

/** Formatos de date-fns para los selectores de fecha y de hora (RUI-15, RUI-17). */
export const FORMATOS_FECHA: MatDateFormats = {
  parse: {
    dateInput: ['dd/MM/yyyy', 'd/M/yyyy'],
    timeInput: [FORMATO_HORA, 'H:mm'],
  },
  display: {
    dateInput: 'dd/MM/yyyy',
    monthYearLabel: 'LLL yyyy',
    dateA11yLabel: 'PPP',
    monthYearA11yLabel: 'LLLL yyyy',
    timeInput: FORMATO_HORA,
    timeOptionLabel: FORMATO_HORA,
  },
};
