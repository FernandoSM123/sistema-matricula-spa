// Listados paginados de la API (docs/arquitectura.md §3.3 y §3.4, RUI-10).

/** Una página de resultados, como la devuelven todos los listados (`PagedResultOf...`). */
export interface Page<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

/** Parámetros comunes de los listados, con los mismos nombres que la API. */
export interface ListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  incluirInactivos?: boolean;
}

export type ParamValue = string | number | boolean | null | undefined;

/**
 * Convierte los filtros en parámetros de la petición: quita los vacíos (`null`, `undefined` y
 * textos en blanco), recorta los textos y pasa los números y booleanos a texto.
 */
export function toParams(filters: object): Record<string, string> {
  const params: Record<string, string> = {};
  for (const [key, value] of Object.entries(filters) as [string, ParamValue][]) {
    if (value === null || value === undefined) continue;
    const text = String(value).trim();
    if (text !== '') params[key] = text;
  }
  return params;
}
