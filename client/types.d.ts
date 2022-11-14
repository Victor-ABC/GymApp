/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

declare module '*.css' {
  import { CSSResult } from 'lit';
  const css: CSSResult;
  export default css;
}

declare module 'postcss-preset-env' {
  const plugin: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  export default plugin;
}
