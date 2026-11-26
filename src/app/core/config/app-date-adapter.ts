import { EnvironmentProviders, Injectable, makeEnvironmentProviders } from '@angular/core';
import { DateFnsAdapter } from '@angular/material-date-fns-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { es } from 'date-fns/locale';
import { formatTime } from '../../shared/formatting/formatters';
import { TIME_FORMAT, DATE_FORMATS } from './date-formats';

/**
 * El adaptador de date-fns, salvo al escribir horas: date-fns da "6:30 PM" o "6:30 p.m.",
 * y RUI-17 pide "6:30 p. m." (§7.3).
 */
@Injectable()
export class AppDateAdapter extends DateFnsAdapter {
  override format(date: Date, displayFormat: string): string {
    if (displayFormat !== TIME_FORMAT) {
      return super.format(date, displayFormat);
    }
    if (!this.isValid(date)) {
      throw Error('AppDateAdapter: no se puede escribir una hora inválida.');
    }
    const time = `${twoDigits(date.getHours())}:${twoDigits(date.getMinutes())}`;
    // Con espacios normales: el selector vuelve a leer lo que escribe, y date-fns no
    // reconoce "p. m." con los espacios que no se parten que usa Intl en algunos navegadores.
    return formatTime(time).replace(/\s/g, ' ');
  }
}

/** El adaptador, sus formatos y el locale `es` de date-fns, en lugar de `provideDateFnsAdapter()`. */
export function provideAppDateAdapter(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_LOCALE, useValue: es },
    { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
  ]);
}

function twoDigits(value: number): string {
  return String(value).padStart(2, '0');
}
