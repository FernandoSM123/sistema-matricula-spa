import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { toLabel } from '../../formatting/labels';

/** Qué dato muestra la etiqueta. */
export type BadgeKind = 'estadoGrupo' | 'estadoMatricula' | 'activo' | 'marca';

/** Las marcas que no son un enum de la API (wireframe, sección 9). */
export type Marca = 'vigente' | 'yaMatriculado' | 'sinCupo' | 'sistema';

type Tone = 'success' | 'error' | 'warning' | 'info' | 'neutral' | 'muted';
/** El refuerzo visual, para que el estado no dependa solo del color (RUI-20). */
type Shape = 'plain' | 'dashed' | 'filled' | 'double' | 'struck';

interface Badge {
  text: string;
  tone: Tone;
  shape: Shape;
}

const ESTADO_GRUPO: Record<string, Omit<Badge, 'text'>> = {
  Planificado: { tone: 'neutral', shape: 'dashed' },
  Abierto: { tone: 'success', shape: 'filled' },
  Cerrado: { tone: 'warning', shape: 'double' },
  EnCurso: { tone: 'info', shape: 'plain' },
  Finalizado: { tone: 'muted', shape: 'plain' },
  Cancelado: { tone: 'error', shape: 'struck' },
};

const ESTADO_MATRICULA: Record<string, Omit<Badge, 'text'>> = {
  Activa: { tone: 'success', shape: 'filled' },
  Retirada: { tone: 'muted', shape: 'plain' },
};

const MARCAS: Record<Marca, Badge> = {
  vigente: { text: 'Vigente', tone: 'info', shape: 'plain' },
  yaMatriculado: { text: 'Ya matriculado', tone: 'success', shape: 'plain' },
  sinCupo: { text: 'Sin cupo', tone: 'warning', shape: 'double' },
  sistema: { text: 'Sistema', tone: 'neutral', shape: 'plain' },
};

const UNKNOWN: Omit<Badge, 'text'> = { tone: 'neutral', shape: 'plain' };

/** La etiqueta, el tono y el refuerzo de un estado (§6.6). Un valor desconocido, neutro con su texto. */
export function toBadge(kind: BadgeKind, value: string | boolean): Badge {
  switch (kind) {
    case 'activo':
      return value === true
        ? { text: 'Activo', tone: 'success', shape: 'plain' }
        : { text: 'Inactivo', tone: 'muted', shape: 'plain' };
    case 'marca':
      return MARCAS[value as Marca] ?? { text: String(value), ...UNKNOWN };
    case 'estadoGrupo':
    case 'estadoMatricula': {
      const text = toLabel(kind, String(value));
      const style = (kind === 'estadoGrupo' ? ESTADO_GRUPO : ESTADO_MATRICULA)[String(value)] ?? UNKNOWN;
      return { text, ...style };
    }
  }
}

/**
 * Etiqueta de estado (RUI-19, RUI-20, docs/arquitectura.md §6.2 fila 9): el texto legible, con el
 * tono de §6.6 y un refuerzo de forma (discontinuo, relleno, doble, tachado) que no depende del color.
 */
@Component({
  selector: 'sm-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '{{ badge().text }}',
  styleUrl: './status-badge.scss',
  host: { '[class]': '"tone-" + badge().tone + " shape-" + badge().shape' },
})
export class StatusBadge {
  readonly kind = input.required<BadgeKind>();
  readonly value = input.required<string | boolean>();

  protected readonly badge = computed(() => toBadge(this.kind(), this.value()));
}
