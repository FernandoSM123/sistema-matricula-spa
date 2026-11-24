import { registerLocaleData } from '@angular/common';
import localeEsCR from '@angular/common/locales/es-CR';
import { EnvironmentProviders, LOCALE_ID, makeEnvironmentProviders } from '@angular/core';
import { LOCALE_INSTITUTO } from '../../shared/formatos/formateadores';

/** Locale `es-CR` para Angular (docs/arquitectura.md §7.1). */
export function provideLocale(): EnvironmentProviders {
  registerLocaleData(localeEsCR, LOCALE_INSTITUTO);
  return makeEnvironmentProviders([{ provide: LOCALE_ID, useValue: LOCALE_INSTITUTO }]);
}
