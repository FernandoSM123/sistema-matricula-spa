import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { environment } from '../environments/environment';
import { API_URL } from './api/api-url';
import { routes } from './app.routes';
import { provideIcons } from './core/config/icons';
import { provideLocale } from './core/config/locale';
import { errorInterceptor } from './core/http/error-interceptor';
import { tokenInterceptor } from './core/http/token-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // El orden importa: errorInterceptor necesita ver el token que agrega tokenInterceptor (§4.2).
    provideHttpClient(withInterceptors([tokenInterceptor, errorInterceptor])),
    { provide: API_URL, useValue: environment.apiUrl }, // §3.1
    provideLocale(),
    provideIcons(),
  ],
};
