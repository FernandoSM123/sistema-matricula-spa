import { Rol } from '../../api/modelos';
import { SesionService } from './sesion-service';

/** Rutas del sistema que usan las guardas y los interceptores (§2.4 de la arquitectura). */
export const RUTAS = {
  oferta: '/oferta',
  inicioSesion: '/iniciar-sesion',
  cambioObligatorio: '/cambio-obligatorio',
  sinPermiso: '/sin-permiso',
} as const;

/** Página de inicio de cada rol (§2.2 de los requerimientos). */
export const INICIO_POR_ROL: Readonly<Record<Rol, string>> = {
  Administrador: '/grupos',
  Estudiante: '/mis-matriculas',
  Profesor: '/mis-grupos',
};

/**
 * A dónde lleva "inicio" según la sesión: la oferta sin sesión (o con la sesión vencida), el cambio
 * obligatorio con un cambio pendiente (RN-24) y, si no, la página de inicio del rol.
 */
export function rutaDeInicio(sesion: SesionService): string {
  const rol = sesion.rol();
  if (!sesion.activa() || rol === null) return RUTAS.oferta;
  if (sesion.cambioPendiente()) return RUTAS.cambioObligatorio;
  return INICIO_POR_ROL[rol];
}
