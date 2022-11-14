/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import path from 'node:path';
import fetch from 'node-fetch';
import { exec } from 'child_process';
import { fileURLToPath } from 'node:url';

export const mochaHooks = async () => {
  const childProcesses = await Promise.all([
    startServer('api-server', 'http://localhost:3000'),
    startServer('web-server', 'http://localhost:8080')
  ]);
  return {
    afterAll() {
      childProcesses.forEach(childProcess => childProcess.kill());
    }
  };
};

async function startServer(name: string, url: string) {
  const baseDir = fileURLToPath(path.dirname(import.meta.url));
  const dir = path.join(baseDir, '..', '..', '..', name, 'src');

  const childProcess = exec(`npm start`, { cwd: dir });

  // wait for the server to come up
  for (let i = 0; i < 30; i++) {
    try {
      await fetch(url);
      console.log(`${name} started`);
      return childProcess;
    } catch (error) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  // stop execution since the server did not come up
  console.log(`could not start ${name}`);
  process.exit();
}
