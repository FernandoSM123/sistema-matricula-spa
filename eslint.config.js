// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

// Dependencias entre carpetas (docs/arquitectura.md §2.3, §2.4 y §10.2).
// Los patrones solo miran imports relativos ('./' o '../'), para no confundir
// una carpeta del SPA con un paquete como '@angular/core'.
const folder = (name) => `^\\.{1,2}/(.*/)?${name}(/|$)`;

const AREAS = ['acceso', 'oferta', 'cuenta', 'personas', 'catalogos', 'grupos', 'matricula', 'sistema'];
// Áreas que abren las ventanas o el retiro de matricula (tabla de §2.4).
const MATRICULA_IMPORTERS = ['oferta', 'personas', 'catalogos', 'grupos'];
const AREAS_MESSAGE = 'Entre áreas, solo el index.ts de matricula y desde las áreas de la tabla (§2.4)';

const restrict = (patterns) => ({ '@typescript-eslint/no-restricted-imports': ['error', { patterns }] });

const areaRules = (area) =>
  restrict(
    AREAS.filter((other) => other !== area).map((other) =>
      other === 'matricula' && MATRICULA_IMPORTERS.includes(area)
        ? // Solo el index.ts: '../../matricula' o '../../matricula/index'.
          { regex: `^\\.{1,2}/(.*/)?matricula/(?!index$).+`, message: AREAS_MESSAGE }
        : { regex: folder(other), message: AREAS_MESSAGE },
    ),
  );

module.exports = defineConfig([
  // Generado por openapi-typescript (pnpm api:types): no se edita ni se revisa (§3.2).
  { ignores: ['src/app/api/schema.d.ts'] },
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'sm',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'sm',
          style: 'kebab-case',
        },
      ],
      'no-console': 'error', // §4.5
      '@typescript-eslint/no-explicit-any': 'error', // §8.2
    },
  },
  {
    files: ['src/app/api/**/*.ts'],
    rules: restrict([
      {
        regex: folder('(core|shared|features)'),
        message: 'api no depende del SPA (§2.3)',
      },
    ]),
  },
  {
    files: ['src/app/shared/**/*.ts'],
    rules: restrict([
      {
        regex: folder('(core|features)'),
        message: 'shared no conoce core ni features (§2.3)',
      },
      {
        regex: folder('api'),
        allowTypeImports: true,
        message: 'shared solo importa tipos de api, con import type (§2.3)',
      },
    ]),
  },
  {
    files: ['src/app/core/**/*.ts'],
    rules: restrict([
      {
        regex: folder('features'),
        message: 'core no conoce features (§2.3)',
      },
    ]),
  },
  ...AREAS.map((area) => ({
    files: [`src/app/features/${area}/**/*.ts`],
    rules: areaRules(area),
  })),
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {},
  },
]);
