/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import fs from 'node:fs';

const configFile = JSON.parse(fs.readFileSync(new URL('./config.json', import.meta.url), 'utf-8'));

class Config {
  launchOptions = { headless: configFile.headless, slowMo: configFile.slowMo };

  clientUrl(relUrl: string) {
    return this.url(configFile.client, relUrl);
  }

  serverUrl(relUrl: string) {
    return this.url(configFile.server, relUrl);
  }

  private url(baseUrl: string, relUrl: string) {
    return `${baseUrl}${relUrl.startsWith('/') ? '' : '/'}${relUrl}`;
  }
}

export default new Config();
