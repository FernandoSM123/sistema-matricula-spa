import { Rol } from '../../api/models';

/** Quién ve una opción: un rol con sesión, o el visitante sin ella. */
export type Audience = Rol | 'Visitante';

export interface NavItem {
  path: string;
  label: string;
  roles: readonly Audience[];
  /** Sección del menú; solo el del administrador las tiene (§2.3). */
  section?: string;
}

export interface NavSection {
  title?: string;
  items: readonly NavItem[];
}

const E = 'Estudiante';
const P = 'Profesor';
const A = 'Administrador';
const V = 'Visitante';

/**
 * La lista única de opciones del menú principal (§4.4 de la arquitectura), con las rutas de §2.4.
 * El orden de la lista da el de cada rol en §2.3 de los requerimientos. "Oferta académica" va dos
 * veces porque el administrador la ve al final de "Académico", y los demás, antes de "Cursos".
 */
export const NAV_ITEMS: readonly NavItem[] = [
  { path: '/mis-matriculas', label: 'Mis matrículas', roles: [E] },
  { path: '/mis-grupos', label: 'Mis grupos', roles: [P] },
  { path: '/mi-horario', label: 'Mi horario', roles: [E, P] },
  { path: '/oferta', label: 'Oferta académica', roles: [V, E, P] },
  { path: '/grupos', label: 'Grupos', roles: [A], section: 'Académico' },
  { path: '/cursos', label: 'Cursos', roles: [E, P, A], section: 'Académico' },
  { path: '/periodos', label: 'Periodos', roles: [A], section: 'Académico' },
  { path: '/aulas', label: 'Aulas', roles: [P, A], section: 'Académico' },
  { path: '/oferta', label: 'Oferta académica', roles: [A], section: 'Académico' },
  { path: '/estudiantes', label: 'Estudiantes', roles: [A], section: 'Personas' },
  { path: '/profesores', label: 'Profesores', roles: [A], section: 'Personas' },
  { path: '/administradores', label: 'Administradores', roles: [A], section: 'Personas' },
  { path: '/auditoria', label: 'Auditoría', roles: [A], section: 'Sistema' },
  { path: '/errores', label: 'Errores', roles: [A], section: 'Sistema' },
  { path: '/iniciar-sesion', label: 'Iniciar sesión', roles: [V] },
  { path: '/registro', label: 'Registrarse', roles: [V] },
];

/**
 * El menú del rol, o el del visitante sin sesión, en secciones consecutivas. Solo tiene lo que el
 * rol puede usar (§4.4). Las secciones solo se muestran al administrador.
 */
export function navFor(rol: Rol | null): readonly NavSection[] {
  const audience: Audience = rol ?? V;
  const withSections = audience === A;
  const sections: { title?: string; items: NavItem[] }[] = [];
  for (const item of NAV_ITEMS) {
    if (!item.roles.includes(audience)) continue;
    const title = withSections ? item.section : undefined;
    const last = sections.at(-1);
    if (last && last.title === title) last.items.push(item);
    else sections.push({ title, items: [item] });
  }
  return sections;
}

/** El menú de la cuenta, para cualquier rol con sesión (§2.3). "Cerrar sesión" es una acción aparte. */
export const USER_MENU_ITEMS: readonly Pick<NavItem, 'path' | 'label'>[] = [
  { path: '/mi-perfil', label: 'Mi perfil' },
  { path: '/cambiar-contrasena', label: 'Cambiar contraseña' },
];
