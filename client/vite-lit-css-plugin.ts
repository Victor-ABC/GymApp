/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import { Plugin } from 'vite';

const cssMap = new Map<string, string>();

export default function litCssPlugin(): Plugin[] {
  return [
    {
      name: 'vite-plugin-lit-css-pre',
      transform(code: string, id: string) {
        if (id.includes('/components/') && (id.endsWith('.css') || id.endsWith('.css?used'))) {
          cssMap.set(id, code);
        }
        return code;
      }
    },
    {
      name: 'vite-plugin-lit-css-post',
      enforce: 'post',
      transform(code: string, id: string) {
        if (cssMap.has(id)) {
          const css = cssMap.get(id);
          cssMap.delete(id);
          return `import {css} from 'lit'; export default css\`${css}\`;`;
        }
      }
    }
  ];
}
