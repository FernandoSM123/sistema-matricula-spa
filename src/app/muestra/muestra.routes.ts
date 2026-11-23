import { Routes } from '@angular/router';
import { provideMaterialVistas } from '../core/config/material-vistas';
import { Muestra } from './muestra';

// PROVISIONAL (fundacion T6). Mismo patrón que las áreas: las opciones de Material de las
// vistas se registran en la ruta diferida, no en app.config.ts (§6.1).
export default [{ path: '', providers: [provideMaterialVistas()], component: Muestra }] satisfies Routes;
