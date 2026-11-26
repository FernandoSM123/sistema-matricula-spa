import { Rol } from '../../api/models';
import { SessionService } from './session-service';

/** Rutas del sistema que usan las guardas y los interceptores (§2.4 de la arquitectura). */
export const APP_PATHS = {
  oferta: '/oferta',
  login: '/iniciar-sesion',
  passwordChange: '/cambio-obligatorio',
  forbidden: '/sin-permiso',
} as const;

/** Página de inicio de cada rol (§2.2 de los requerimientos). */
export const HOME_BY_ROL: Readonly<Record<Rol, string>> = {
  Administrador: '/grupos',
  Estudiante: '/mis-matriculas',
  Profesor: '/mis-grupos',
};

/** El texto del enlace a cada página de inicio, como en los wireframes de `V-09` y `V-10`. */
const HOME_LABELS: Readonly<Record<string, string>> = {
  [APP_PATHS.oferta]: 'Ir a la oferta académica',
  [APP_PATHS.passwordChange]: 'Ir al cambio de contraseña',
  [HOME_BY_ROL.Estudiante]: 'Ir a Mis matrículas',
  [HOME_BY_ROL.Profesor]: 'Ir a Mis grupos',
  [HOME_BY_ROL.Administrador]: 'Ir a Grupos',
};

export interface HomeLink {
  path: string;
  label: string;
}

/** El enlace "Ir a…" a la página de inicio según la sesión. */
export function homeLink(session: SessionService): HomeLink {
  const path = homeRoute(session);
  return { path, label: HOME_LABELS[path] ?? 'Ir al inicio' };
}

/**
 * A dónde lleva "inicio" según la sesión: la oferta sin sesión (o con la sesión vencida), el cambio
 * obligatorio con un cambio pendiente (RN-24) y, si no, la página de inicio del rol.
 */
export function homeRoute(session: SessionService): string {
  const rol = session.rol();
  if (!session.isActive() || rol === null) return APP_PATHS.oferta;
  if (session.passwordChangePending()) return APP_PATHS.passwordChange;
  return HOME_BY_ROL[rol];
}
