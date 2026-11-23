import { EnvironmentProviders, inject, provideAppInitializer } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

/**
 * Íconos de Material Symbols (Apache-2.0, aviso en public/iconos/LICENSE), copiados a
 * public/iconos/ con el mismo nombre (docs/arquitectura.md §6.6). Se usan con
 * `<mat-icon svgIcon="buscar" />`.
 */
export const ICONOS = [
  'menu',
  'buscar',
  'cerrar',
  'editar',
  'eliminar',
  'mostrar',
  'ocultar',
  'copiar',
  'calendario',
  'reloj',
  'exito',
  'aviso',
  'error',
  'informacion',
  'primera-pagina',
  'anterior',
  'siguiente',
  'ultima-pagina',
  'salir',
] as const;

export type Icono = (typeof ICONOS)[number];

/** Registra los íconos en el arranque. Material los descarga con HttpClient al usarlos. */
export function provideIconos(): EnvironmentProviders {
  return provideAppInitializer(() => {
    const registro = inject(MatIconRegistry);
    const sanitizer = inject(DomSanitizer);
    for (const icono of ICONOS) {
      // Única excepción a bypassSecurityTrust* (AGENTS.md, §6.6): addSvgIcon exige una URL
      // confiable, y esta es una ruta fija del propio sitio, nunca un dato externo.
      registro.addSvgIcon(icono, sanitizer.bypassSecurityTrustResourceUrl(`iconos/${icono}.svg`));
    }
  });
}
