import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { environment } from '../environments/environment';
import { API_URL } from './api/api-url';
import { routes } from './app.routes';
import { provideIconos } from './core/config/iconos';
import { provideLocale } from './core/config/locale';
import { erroresInterceptor } from './core/http/errores-interceptor';
import { tokenInterceptor } from './core/http/token-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // El orden importa: erroresInterceptor necesita ver el token que agrega tokenInterceptor (§4.2).
    provideHttpClient(withInterceptors([tokenInterceptor, erroresInterceptor])),
    { provide: API_URL, useValue: environment.apiUrl }, // §3.1
    provideLocale(),
    provideIconos(),
  ],
};
