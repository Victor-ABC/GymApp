/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
import { BrowserContext } from 'playwright';
import config from './config.js';

export class UserSession {
  name: string;
  email: string;
  password: string;
  token?: string;

  constructor(public context: BrowserContext) {
    const uuid = uuidv4();
    this.name = `name_${uuid}`;
    this.email = `email_${uuid}@example.org`;
    this.password = `pw_${uuid}`;
  }

  signInData() {
    return { email: this.email, password: this.password };
  }

  signUpData() {
    return { name: this.name, email: this.email, password: this.password, passwordCheck: this.password };
  }

  async registerUser() {
    const response = await fetch(config.serverUrl('users'), {
      method: 'POST',
      body: JSON.stringify(this.signUpData()),
      headers: { 'Content-Type': 'application/json' }
    });
    const cookie = response.headers.raw()['set-cookie'].find(cookie => cookie.startsWith('jwt-token'));
    if (!cookie) {
      throw new Error('Failed to extract jwt-token');
    }
    this.token = cookie.split('=')[1].split(';')[0];

    await this.context.addCookies([
      { name: 'jwt-token', value: this.token!, domain: new URL(config.serverUrl('')).hostname, path: '/' }
    ]);
  }

  async deleteUser() {
    const response = await fetch(config.serverUrl('users'), {
      method: 'DELETE',
      headers: { Cookie: `jwt-token=${this.token}` }
    });
    if (response.status !== 200) {
      throw new Error('Failed to delete user for token ' + this.token);
    }
    await this.context.clearCookies();
  }
}
