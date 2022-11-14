/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import { LitElement, html } from 'lit';
import { state } from 'lit/decorators.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PageMixin = <T extends new (...args: any[]) => LitElement>(base: T) => {
  class Page extends base {
    @state() private notification: { content: string; type: 'info' | 'error' } = { content: '', type: 'info' };

    private initComplete?: Promise<void>;

    private resolveInitComplete?: () => void;

    protected renderNotification() {
      return html`
        <app-notification .content=${this.notification.content} .type=${this.notification.type}></app-notification>
      `;
    }

    protected showNotification(content = '', type: 'error' | 'info' = 'info') {
      this.notification = { content, type };
      if (content) {
        setTimeout(() => this.showNotification(), 3000);
      }
    }

    protected startAsyncInit() {
      this.initComplete = new Promise<void>(resolve => {
        this.resolveInitComplete = resolve;
      });
    }

    protected finishAsyncInit() {
      this.resolveInitComplete!();
    }

    protected async getUpdateComplete() {
      const result = await super.getUpdateComplete();
      if (this.initComplete) {
        await this.initComplete;
      }
      return result;
    }
  }

  return Page;
};
