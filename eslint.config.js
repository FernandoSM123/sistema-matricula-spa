// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

// Dependencias entre carpetas (docs/arquitectura.md §2.3, §2.4 y §10.2).
// Los patrones solo miran imports relativos ('./' o '../'), para no confundir
// una carpeta del SPA con un paquete como '@angular/core'.
const carpeta = (nombre) => `^\\.{1,2}/(.*/)?${nombre}(/|$)`;

const AREAS = ['acceso', 'oferta', 'cuenta', 'personas', 'catalogos', 'grupos', 'matricula', 'sistema'];
// Áreas que abren las ventanas o el retiro de matricula (tabla de §2.4).
const IMPORTAN_MATRICULA = ['oferta', 'personas', 'catalogos', 'grupos'];
const MENSAJE_AREAS = 'Entre áreas, solo el index.ts de matricula y desde las áreas de la tabla (§2.4)';

const restringir = (patterns) => ({ '@typescript-eslint/no-restricted-imports': ['error', { patterns }] });

const reglasDeArea = (area) =>
  restringir(
    AREAS.filter((otra) => otra !== area).map((otra) =>
      otra === 'matricula' && IMPORTAN_MATRICULA.includes(area)
        ? // Solo el index.ts: '../../matricula' o '../../matricula/index'.
          { regex: `^\\.{1,2}/(.*/)?matricula/(?!index$).+`, message: MENSAJE_AREAS }
        : { regex: carpeta(otra), message: MENSAJE_AREAS },
    ),
  );

module.exports = defineConfig([
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
    rules: restringir([
      {
        regex: carpeta('(core|shared|features)'),
        message: 'api no depende del SPA (§2.3)',
      },
    ]),
  },
  {
    files: ['src/app/shared/**/*.ts'],
    rules: restringir([
      {
        regex: carpeta('(core|features)'),
        message: 'shared no conoce core ni features (§2.3)',
      },
      {
        regex: carpeta('api'),
        allowTypeImports: true,
        message: 'shared solo importa tipos de api, con import type (§2.3)',
      },
    ]),
  },
  {
    files: ['src/app/core/**/*.ts'],
    rules: restringir([
      {
        regex: carpeta('features'),
        message: 'core no conoce features (§2.3)',
      },
    ]),
  },
  ...AREAS.map((area) => ({
    files: [`src/app/features/${area}/**/*.ts`],
    rules: reglasDeArea(area),
  })),
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {},
  },
]);
