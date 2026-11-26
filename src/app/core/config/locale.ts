import { registerLocaleData } from '@angular/common';
import localeEsCR from '@angular/common/locales/es-CR';
import { EnvironmentProviders, LOCALE_ID, makeEnvironmentProviders } from '@angular/core';
import { APP_LOCALE } from '../../shared/formatting/formatters';

/** Locale `es-CR` para Angular (docs/arquitectura.md §7.1). */
export function provideLocale(): EnvironmentProviders {
  registerLocaleData(localeEsCR, APP_LOCALE);
  return makeEnvironmentProviders([{ provide: LOCALE_ID, useValue: APP_LOCALE }]);
}
