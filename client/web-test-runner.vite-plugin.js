/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import { createServer } from 'vite';

export default function (filesToWatch) {
  let server;

  return {
    name: 'wtr-vite-plugin',

    async serverStart({ app, fileWatcher }) {
      filesToWatch.forEach(entry => fileWatcher.add(entry));
      server = await createServer({ server: { middlewareMode: true }, optimizeDeps: { include: ['chai'] } });
      app.use((ctx, next) => new Promise(() => server.middlewares(ctx.req, ctx.res, next)));
    },

    async transformImport({ source }) {
      return source.split('?')[0]; // remove the queryString otherwise vite will fail resolving
    },

    async serverStop() {
      return server.close();
    }
  };
}
