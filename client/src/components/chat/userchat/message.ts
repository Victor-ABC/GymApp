/* Autor: Victor Corbet */

import { Capacitor } from '@capacitor/core';
import { LitElement, html, nothing } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import { httpClient } from '../../../http-client.js';
import { notificationService } from '../../../notification.js';
import { PageMixin } from '../../page.mixin.js';

type Message = {
  content: string;
  from: string;
  to: string;
  id: string;
  createdAt: number;
} | null;

@customElement('app-chat-message')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class SignOutComponent extends PageMixin(LitElement) {
  @property()
  message: Message = null;
  @property() isLeft: boolean = true;
  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }
  log() {
    console.log("Success");  
  }
  render() {
    return html`
      ${this.message
        ? html`
            <ion-card style=${this.isLeft ? "float:left;" : "float:right;"}>
            <ion-item color=${this.isLeft ? 'secondary' : 'primary'}> ${this.message!.content} </ion-item>
            </ion-card>
          `
        : nothing}
    `;
  }
}
