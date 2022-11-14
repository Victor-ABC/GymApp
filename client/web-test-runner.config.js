/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import vite from './web-test-runner.vite-plugin.js';

export default {
  files: 'src/**/*.spec.ts',
  plugins: [vite(['src/**/*.{js,ts}'])],
  coverageConfig: {
    include: ['src/**/*.{js,ts}']
  }
};
