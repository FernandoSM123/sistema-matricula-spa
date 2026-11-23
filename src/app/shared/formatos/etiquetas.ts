// Etiquetas legibles de los enums de la API (RUI-19). Un valor que no está en la tabla
// se muestra tal como llega.

const ETIQUETAS = {
  rol: {
    Administrador: 'Administrador',
    Profesor: 'Profesor',
    Estudiante: 'Estudiante',
  },
  nivelCurso: {
    Basico: 'Básico',
    Intermedio: 'Intermedio',
    Avanzado: 'Avanzado',
  },
  modalidad: {
    Presencial: 'Presencial',
    Virtual: 'Virtual',
    Hibrida: 'Híbrida',
  },
  estadoGrupo: {
    Planificado: 'Planificado',
    Abierto: 'Abierto',
    Cerrado: 'Cerrado',
    EnCurso: 'En curso',
    Finalizado: 'Finalizado',
    Cancelado: 'Cancelado',
  },
  estadoMatricula: {
    Activa: 'Activa',
    Retirada: 'Retirada',
  },
  motivoRetiro: {
    RetiroVoluntario: 'Retiro voluntario',
    CambioGrupo: 'Cambio de grupo',
    CancelacionGrupo: 'Cancelación del grupo',
  },
  dia: {
    Lunes: 'Lunes',
    Martes: 'Martes',
    Miercoles: 'Miércoles',
    Jueves: 'Jueves',
    Viernes: 'Viernes',
    Sabado: 'Sábado',
    Domingo: 'Domingo',
  },
  accionAuditoria: {
    Creacion: 'Creación',
    Modificacion: 'Modificación',
    Eliminacion: 'Eliminación',
  },
  origenError: {
    Peticion: 'Solicitud',
    Correo: 'Correo',
  },
} as const satisfies Record<string, Record<string, string>>;

export type TipoEtiqueta = keyof typeof ETIQUETAS;

/** `etiquetar('estadoGrupo', 'EnCurso')` → `En curso`. */
export function etiquetar(tipo: TipoEtiqueta, valor: string | null | undefined): string {
  if (!valor) return '';
  const tabla: Record<string, string> = ETIQUETAS[tipo];
  // Object.hasOwn evita tomar como etiqueta una propiedad heredada, como 'toString'.
  return Object.hasOwn(tabla, valor) ? tabla[valor] : valor;
}
