/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import fs from 'node:fs';

const configFile = JSON.parse(fs.readFileSync(new URL('./config.json', import.meta.url), 'utf-8'));

class Config {
  url(relUrl: string) {
    return `${configFile.server}${relUrl.startsWith('/') ? '' : '/'}${relUrl}`;
  }
}

export default new Config();
