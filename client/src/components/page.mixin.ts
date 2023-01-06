/* Autor: Prof. Dr. Norman Lahme-HÃ¼tig (FH MÃ¼nster) */

import { LitElement, html } from 'lit';
import { state } from 'lit/decorators.js';
import { Capacitor } from '@capacitor/core';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PageMixin = <T extends new (...args: any[]) => LitElement>(base: T) => {
  class Page extends base {
    
  }

  return Page;
};
