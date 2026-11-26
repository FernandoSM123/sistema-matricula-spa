import { version } from '../../package.json';

// Reemplaza a environment.ts en desarrollo (fileReplacements de angular.json).
export const environment = {
  apiUrl: 'http://localhost:5022/api/v1',
  instituteName: 'Instituto de Cursos Libres',
  version,
};
