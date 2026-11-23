import { afterNextRender, ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { environment } from '../../environments/environment';
import { ICONOS } from '../core/config/iconos';
import { EtiquetaPipe } from '../shared/formatos/etiqueta-pipe';
import { FechaHoraPipe } from '../shared/formatos/fecha-hora-pipe';
import { FechaPipe } from '../shared/formatos/fecha-pipe';
import { HoraPipe } from '../shared/formatos/hora-pipe';
import { MonedaPipe } from '../shared/formatos/moneda-pipe';
import { NumeroPipe } from '../shared/formatos/numero-pipe';

interface ColorDeMuestra {
  variable: string;
  uso: string;
}

const PALETA: { grupo: string; colores: ColorDeMuestra[] }[] = [
  {
    grupo: '60 %, neutro',
    colores: [
      { variable: '--sm-fondo', uso: 'Fondo de la página' },
      { variable: '--sm-superficie', uso: 'Superficies' },
      { variable: '--sm-texto', uso: 'Texto principal' },
      { variable: '--sm-texto-secundario', uso: 'Texto secundario' },
      { variable: '--sm-borde-control', uso: 'Borde de los controles' },
      { variable: '--sm-texto-deshabilitado', uso: 'Texto deshabilitado' },
    ],
  },
  {
    grupo: '30 %, secundario',
    colores: [
      { variable: '--sm-marca', uso: 'Barra superior' },
      { variable: '--sm-secundario-suave', uso: 'Menú y encabezados' },
      { variable: '--sm-secundario-activo', uso: 'Opción activa del menú' },
    ],
  },
  {
    grupo: '10 %, acento',
    colores: [
      { variable: '--sm-acento', uso: 'Acción principal, enlaces y foco' },
      { variable: '--sm-acento-hover', uso: 'Acento al pasar el puntero' },
      { variable: '--sm-foco-sobre-marca', uso: 'Foco sobre la barra superior' },
    ],
  },
];

const ESTADOS = [
  { tono: 'exito', ejemplo: 'Abierto' },
  { tono: 'error', ejemplo: 'Cancelado' },
  { tono: 'aviso', ejemplo: 'Cerrado' },
  { tono: 'informacion', ejemplo: 'En curso' },
  { tono: 'neutro', ejemplo: 'Planificado' },
  { tono: 'apagado', ejemplo: 'Finalizado' },
];

/**
 * PROVISIONAL (fundacion T6, supuesto 3 de la spec): página de muestra del tema, los
 * formatos y los íconos, cargada en diferido en la ruta `/`. `nucleo` la borra y pone
 * sus rutas.
 */
@Component({
  selector: 'sm-muestra',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTimepickerModule,
    EtiquetaPipe,
    FechaHoraPipe,
    FechaPipe,
    HoraPipe,
    MonedaPipe,
    NumeroPipe,
  ],
  templateUrl: './muestra.html',
  styleUrl: './muestra.scss',
})
export class Muestra {
  protected readonly entorno = environment;
  protected readonly paleta = PALETA;
  protected readonly estados = ESTADOS;
  protected readonly iconos = ICONOS;

  /** Valores de :root leídos en el navegador, para comprobarlos contra §6.6. */
  protected readonly valores = signal<Record<string, string>>({});

  protected readonly correo = new FormControl('correo-sin-arroba', {
    nonNullable: true,
    validators: [Validators.required, Validators.email],
  });
  protected readonly fecha = new FormControl<Date | null>(null);
  protected readonly hora = new FormControl<Date | null>(null);

  constructor() {
    // Así el error del campo se ve sin tener que tocarlo.
    this.correo.markAsTouched();

    afterNextRender(() => {
      const estilos = getComputedStyle(document.documentElement);
      const valores: Record<string, string> = {};
      for (const { colores } of PALETA) {
        for (const { variable } of colores) {
          valores[variable] = estilos.getPropertyValue(variable).trim();
        }
      }
      this.valores.set(valores);
    });
  }
}
