/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import { Plugin } from 'vite';

export default function htmlReplacePlugin(replacements: Array<[string | RegExp, string]>): Plugin {
  return {
    name: 'html-replace-plugin',
    transformIndexHtml: {
      enforce: 'post',
      transform(html: string) {
        for (const replacement of replacements) {
          html = html.replace(replacement[0], replacement[1]);
        }
        return html;
      }
    }
  };
}
