/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import express, { Express } from 'express';
import http from 'node:http';
import https from 'node:https';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import users from './routes/users.js';
import chat from './routes/chat.js';
import startDB from './db.js';
import { corsService } from './services/cors.service.js';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import courses from './routes/courses.js';

import workouts from './routes/workouts.js';
import exercises from './routes/exercises.js';
import memberincourses from './routes/member-in-courses.js';
import tasks from './routes/tasks.js';
import messages from './routes/massages.js';

import { startWebSocketServer } from './ws-server.js';
import config from '../config.json' assert { type: 'json' };

function configureApp(app: Express) {
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  app.use(express.json());
  app.use(corsService.corsMiddleware);
  app.use('/api/users', users);
  app.use('/api/workouts', workouts);
  app.use('/api/exercises', exercises);
  app.use('/api/courses', courses);
  app.use('/api/memberincourses', memberincourses);
  app.use('/api/messages', messages);
  app.use('/api/chat', chat);
  app.use('/api/tasks', tasks);
}

export async function start() {
  const app = express();

  configureApp(app);
  const stopDB = await startDB(app);
  const stopHttpServer = await startHttpServer(app, config.server.port);
  return async () => {
    await stopHttpServer();
    await stopDB();
  };
}

async function startHttpServer(app: Express, port: number) {
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
  startWebSocketServer(httpServer);
  await new Promise<void>(resolve => {
    httpServer.listen(port, () => {
      console.log(`Server running at http${config.server.https ? 's' : ''}://localhost:${port}`);
      resolve();
    });
  });
  return async () => await new Promise<void>(resolve => httpServer.close(() => resolve()));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  start();
}
