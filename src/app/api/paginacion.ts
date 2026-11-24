// Listados paginados de la API (docs/arquitectura.md §3.3 y §3.4, RUI-10).

/** Una página de resultados, como la devuelven todos los listados (`PagedResultOf...`). */
export interface Pagina<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

/** Parámetros comunes de los listados, con los mismos nombres que la API. */
export interface ParametrosListado {
  page?: number;
  pageSize?: number;
  search?: string;
  incluirInactivos?: boolean;
}

export type ValorParametro = string | number | boolean | null | undefined;

/**
 * Convierte los filtros en parámetros de la petición: quita los vacíos (`null`, `undefined` y
 * textos en blanco), recorta los textos y pasa los números y booleanos a texto.
 */
export function aParametros(filtros: object): Record<string, string> {
  const parametros: Record<string, string> = {};
  for (const [clave, valor] of Object.entries(filtros) as [string, ValorParametro][]) {
    if (valor === null || valor === undefined) continue;
    const texto = String(valor).trim();
    if (texto !== '') parametros[clave] = texto;
  }
  return parametros;
}
