import { EnvironmentProviders, inject, provideAppInitializer } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

/**
 * Íconos de Material Symbols (Apache-2.0, aviso en public/icons/LICENSE), copiados a
 * public/icons/ con el mismo nombre (docs/arquitectura.md §6.6). Se usan con
 * `<mat-icon svgIcon="search" />`.
 */
export const ICONS = [
  'menu',
  'search',
  'close',
  'edit',
  'delete',
  'visibility',
  'visibility-off',
  'copy',
  'calendar',
  'clock',
  'success',
  'warning',
  'error',
  'info',
  'first-page',
  'previous',
  'next',
  'last-page',
  'logout',
] as const;

export type IconName = (typeof ICONS)[number];

/** Registra los íconos en el arranque. Material los descarga con HttpClient al usarlos. */
export function provideIcons(): EnvironmentProviders {
  return provideAppInitializer(() => {
    const registry = inject(MatIconRegistry);
    const sanitizer = inject(DomSanitizer);
    for (const icon of ICONS) {
      // Única excepción a bypassSecurityTrust* (AGENTS.md, §6.6): addSvgIcon exige una URL
      // confiable, y esta es una ruta fija del propio sitio, nunca un dato externo.
      registry.addSvgIcon(icon, sanitizer.bypassSecurityTrustResourceUrl(`icons/${icon}.svg`));
    }
  });
}
