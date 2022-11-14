/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import { defineConfig } from 'vite';
import postcssPresetEnv from 'postcss-preset-env';
import viteLitCssPlugin from './vite-lit-css-plugin.js';
import viteHtmlReplacePlugin from './vite-html-replace-plugin.js';

export default defineConfig({
  plugins: [
    viteLitCssPlugin(),
    {
      ...viteHtmlReplacePlugin([
        [`href="/"`, `href="/app/"`],
        [/\/assets/g, `./assets`]
      ]),
      apply: 'build'
    }
  ],
  server: { port: 8080 },
  css: {
    postcss: {
      plugins: [postcssPresetEnv({ stage: 2 })]
    }
  }
});
