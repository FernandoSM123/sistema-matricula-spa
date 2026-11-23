import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAdaptadorFechas } from './core/config/adaptador-fechas';
import { provideLocale } from './core/config/locale';
import { provideMaterial } from './core/config/material';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideLocale(),
    provideAdaptadorFechas(),
    provideMaterial(),
  ],
};
