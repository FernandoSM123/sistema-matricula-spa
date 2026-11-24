import { Routes } from '@angular/router';

export const routes: Routes = [
  // PROVISIONAL (fundacion T6): la página de muestra, en diferido para no pesar en la carga
  // inicial (§2.5, §8.3). `nucleo` la borra y pone las rutas de las áreas.
  { path: '', loadChildren: () => import('./muestra/muestra.routes') },
];
