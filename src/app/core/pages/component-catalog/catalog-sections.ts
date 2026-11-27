/** Una sección del catálogo, con el mismo número, título y reglas que `docs/wireframes/componentes.html`. */
export interface CatalogSection {
  /** Id del ancla, el mismo del wireframe (`c-listado`…). */
  readonly id: string;
  readonly title: string;
  readonly rules: string;
  /** Dónde se construye, mientras la sección no tiene contenido. */
  readonly pending: string;
}

export const CATALOG_SECTIONS: readonly CatalogSection[] = [
  { id: 'c-listado', title: 'Listado paginado', rules: 'RUI-10 · RUI-13 · RUI-14', pending: 'componentes T8' },
  { id: 'c-filtros', title: 'Búsqueda y filtros', rules: 'RUI-11 · RUI-12', pending: 'componentes T8' },
  {
    id: 'c-formulario',
    title: 'Formulario',
    rules: 'RUI-02 · RUI-06 · RUI-08 · RUI-09',
    pending: 'componentes T4 y T5',
  },
  { id: 'c-fecha-hora', title: 'Selectores de fecha y hora', rules: 'RUI-15 · RUI-17', pending: 'componentes T9' },
  { id: 'c-combo', title: 'Selector con búsqueda', rules: 'RUI-11 (excepción)', pending: 'componentes T9' },
  {
    id: 'c-confirmacion',
    title: 'Ventanas de confirmación',
    rules: 'RUI-07 · RUI-09 · RUI-01 · RUI-08',
    pending: 'componentes T3',
  },
  { id: 'c-mensajes', title: 'Mensajes', rules: 'RUI-01 · RUI-03 · RUI-04 · RUI-21', pending: 'componentes T3 y T6' },
  {
    id: 'c-estados',
    title: 'Estados de contenido',
    rules: 'RUI-13 · §2.5 (registro inexistente)',
    pending: 'componentes T7',
  },
  { id: 'c-etiquetas', title: 'Etiquetas de estado', rules: 'RUI-19 · RUI-20 · RUI-12', pending: 'componentes T8' },
  { id: 'c-horario', title: 'Grilla del horario semanal', rules: 'RFF-29 · RUI-17', pending: 'el módulo grupos' },
  {
    id: 'c-detalle',
    title: 'Encabezado de detalle y pestañas',
    rules: 'Patrón de los detalles',
    pending: 'componentes T9',
  },
];
