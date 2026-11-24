import { Rol } from '../../api/modelos';

/** Quién ve una opción: un rol con sesión, o el visitante sin ella. */
export type Audiencia = Rol | 'Visitante';

export interface OpcionMenu {
  ruta: string;
  etiqueta: string;
  roles: readonly Audiencia[];
  /** Grupo del menú; solo el del administrador los tiene (§2.3). */
  grupo?: string;
}

export interface GrupoMenu {
  grupo?: string;
  opciones: readonly OpcionMenu[];
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
export const OPCIONES_MENU: readonly OpcionMenu[] = [
  { ruta: '/mis-matriculas', etiqueta: 'Mis matrículas', roles: [E] },
  { ruta: '/mis-grupos', etiqueta: 'Mis grupos', roles: [P] },
  { ruta: '/mi-horario', etiqueta: 'Mi horario', roles: [E, P] },
  { ruta: '/oferta', etiqueta: 'Oferta académica', roles: [V, E, P] },
  { ruta: '/grupos', etiqueta: 'Grupos', roles: [A], grupo: 'Académico' },
  { ruta: '/cursos', etiqueta: 'Cursos', roles: [E, P, A], grupo: 'Académico' },
  { ruta: '/periodos', etiqueta: 'Periodos', roles: [A], grupo: 'Académico' },
  { ruta: '/aulas', etiqueta: 'Aulas', roles: [P, A], grupo: 'Académico' },
  { ruta: '/oferta', etiqueta: 'Oferta académica', roles: [A], grupo: 'Académico' },
  { ruta: '/estudiantes', etiqueta: 'Estudiantes', roles: [A], grupo: 'Personas' },
  { ruta: '/profesores', etiqueta: 'Profesores', roles: [A], grupo: 'Personas' },
  { ruta: '/administradores', etiqueta: 'Administradores', roles: [A], grupo: 'Personas' },
  { ruta: '/auditoria', etiqueta: 'Auditoría', roles: [A], grupo: 'Sistema' },
  { ruta: '/errores', etiqueta: 'Errores', roles: [A], grupo: 'Sistema' },
  { ruta: '/iniciar-sesion', etiqueta: 'Iniciar sesión', roles: [V] },
  { ruta: '/registro', etiqueta: 'Registrarse', roles: [V] },
];

/**
 * El menú del rol, o el del visitante sin sesión, en grupos consecutivos. Solo tiene lo que el
 * rol puede usar (§4.4). Los grupos solo se muestran al administrador.
 */
export function menuDe(rol: Rol | null): readonly GrupoMenu[] {
  const audiencia: Audiencia = rol ?? V;
  const conGrupos = audiencia === A;
  const grupos: { grupo?: string; opciones: OpcionMenu[] }[] = [];
  for (const opcion of OPCIONES_MENU) {
    if (!opcion.roles.includes(audiencia)) continue;
    const grupo = conGrupos ? opcion.grupo : undefined;
    const ultimo = grupos.at(-1);
    if (ultimo && ultimo.grupo === grupo) ultimo.opciones.push(opcion);
    else grupos.push({ grupo, opciones: [opcion] });
  }
  return grupos;
}

/** El menú de la cuenta, para cualquier rol con sesión (§2.3). "Cerrar sesión" es una acción aparte. */
export const OPCIONES_CUENTA: readonly Pick<OpcionMenu, 'ruta' | 'etiqueta'>[] = [
  { ruta: '/mi-perfil', etiqueta: 'Mi perfil' },
  { ruta: '/cambiar-contrasena', etiqueta: 'Cambiar contraseña' },
];
