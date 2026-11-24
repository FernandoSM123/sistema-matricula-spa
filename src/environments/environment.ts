import { version } from '../../package.json';

// Todo lo de este archivo llega al navegador: nunca van secretos (docs/arquitectura.md §11.3).
export const environment = {
  // Sin despliegue definido todavía: mismo valor que en desarrollo (§3.1).
  apiUrl: 'http://localhost:5022/api/v1',
  // RUI-23
  instituteName: 'Instituto de Cursos Libres',
  version,
};
