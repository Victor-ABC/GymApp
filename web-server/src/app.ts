/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import express from 'express';
import path from 'node:path';
import http from 'node:http';
import https from 'node:https';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

import config from '../config.json' assert { type: 'json' };

export async function start() {
  const basedir = fileURLToPath(path.dirname(import.meta.url));
  const clientDir = path.join(basedir, '..', config.client.dir);

  const app = express();
  app.get('/', (_, res) => res.redirect('/app/index.html'));
  app.use('/app', express.static(clientDir));
  app.use('/app', (_, res) => res.sendFile(path.join(clientDir, 'index.html')));

  const createOptions = () => {
    const basedir = fileURLToPath(path.dirname(import.meta.url));
    const certDir = path.join(basedir, 'certs');
    return {
      key: fs.readFileSync(path.join(certDir, 'server.key.pem')),
      cert: fs.readFileSync(path.join(certDir, 'server.cert.pem')),
      ca: fs.readFileSync(path.join(certDir, 'intermediate-ca.cert.pem'))
    };
  };
  const httpServer = config.server.https ? https.createServer(createOptions(), app) : http.createServer(app);
  await new Promise<void>(resolve => {
    httpServer.listen(config.server.port, () => {
      console.log(`WebServer running at http${config.server.https ? 's' : ''}://localhost:${config.server.port}`);
      resolve();
    });
  });
  return async () => await new Promise<void>(resolve => httpServer.close(() => resolve()));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  start();
}
