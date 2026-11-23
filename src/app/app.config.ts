import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAdaptadorFechas } from './core/config/adaptador-fechas';
import { provideIconos } from './core/config/iconos';
import { provideLocale } from './core/config/locale';
import { provideMaterial } from './core/config/material';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(), // nucleo le agrega los interceptores (§4.2)
    provideLocale(),
    provideAdaptadorFechas(),
    provideMaterial(),
    provideIconos(),
  ],
};
