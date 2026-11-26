import { MatDateFormats } from '@angular/material/core';

/** Formato de las horas. `AppDateAdapter` lo reconoce y escribe la hora con Intl (§7.3). */
export const TIME_FORMAT = 'h:mm a';

/** Formatos de date-fns para los selectores de fecha y de hora (RUI-15, RUI-17). */
export const DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: ['dd/MM/yyyy', 'd/M/yyyy'],
    timeInput: [TIME_FORMAT, 'H:mm'],
  },
  display: {
    dateInput: 'dd/MM/yyyy',
    monthYearLabel: 'LLL yyyy',
    dateA11yLabel: 'PPP',
    monthYearA11yLabel: 'LLLL yyyy',
    timeInput: TIME_FORMAT,
    timeOptionLabel: TIME_FORMAT,
  },
};
