import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { environment } from '../environments/environment';
import { API_URL } from './api/api-url';
import { routes } from './app.routes';
import { provideIconos } from './core/config/iconos';
import { provideLocale } from './core/config/locale';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(), // nucleo le agrega los interceptores en T3 (§4.2)
    { provide: API_URL, useValue: environment.apiUrl }, // §3.1
    provideLocale(),
    provideIconos(),
  ],
};
