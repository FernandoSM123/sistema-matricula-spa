import { EnvironmentProviders, Injectable, makeEnvironmentProviders } from '@angular/core';
import { DateFnsAdapter } from '@angular/material-date-fns-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { es } from 'date-fns/locale';
import { formatearHora } from '../../shared/formatos/formateadores';
import { FORMATO_HORA, FORMATOS_FECHA } from './formatos-fecha';

/**
 * El adaptador de date-fns, salvo al escribir horas: date-fns da "6:30 PM" o "6:30 p.m.",
 * y RUI-17 pide "6:30 p. m." (§7.3).
 */
@Injectable()
export class AdaptadorFechas extends DateFnsAdapter {
  override format(date: Date, displayFormat: string): string {
    if (displayFormat !== FORMATO_HORA) {
      return super.format(date, displayFormat);
    }
    if (!this.isValid(date)) {
      throw Error('AdaptadorFechas: no se puede escribir una hora inválida.');
    }
    const hora = `${dosDigitos(date.getHours())}:${dosDigitos(date.getMinutes())}`;
    // Con espacios normales: el selector vuelve a leer lo que escribe, y date-fns no
    // reconoce "p. m." con los espacios que no se parten que usa Intl en algunos navegadores.
    return formatearHora(hora).replace(/\s/g, ' ');
  }
}

/** El adaptador, sus formatos y el locale `es` de date-fns, en lugar de `provideDateFnsAdapter()`. */
export function provideAdaptadorFechas(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: DateAdapter, useClass: AdaptadorFechas },
    { provide: MAT_DATE_LOCALE, useValue: es },
    { provide: MAT_DATE_FORMATS, useValue: FORMATOS_FECHA },
  ]);
}

function dosDigitos(valor: number): string {
  return String(valor).padStart(2, '0');
}
