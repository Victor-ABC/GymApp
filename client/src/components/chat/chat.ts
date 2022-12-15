/* Autor: Victor Corbet */

import { Capacitor } from '@capacitor/core';
import { LitElement, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import { httpClient } from '../../http-client.js';
import { notificationService } from '../../notification.js';
import { PageMixin } from '../page.mixin.js';

type Message = {
  from: string;
  to: string;
  date: Date;
  content: string;
};

@customElement('app-chat-all')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class SignOutComponent extends PageMixin(LitElement) {

  @query('#text') private textInputElement!: HTMLIonInputElement;

  @property()
  messages: Array<Message> = [
    {
      from: 'timID',
      to: 'simonID',
      date: new Date(),
      content: 'Message1'
    },
    {
      from: 'timID',
      to: 'simonID',
      date: new Date(),
      content: 'Message2'
    },
    {
      from: 'simonID',
      to: 'timID',
      date: new Date(),
      content: 'Message3'
    },
    {
      from: 'timID',
      to: 'simonID',
      date: new Date(),
      content: 'Message4'
    }
  ];

  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }

  render() {
    return html`${when(
      Capacitor.isNativePlatform(),
      () => html`<ion-content>${this.buildBody()}</ion-content>`,
      () => this.buildBody()
    )}`;
  }

  buildBody() {
    return html`
      <ion-content class="ion-padding">
        <ion-grid>
          <ion-col size="6">
            <ion-list> ${this.messages.map(m => html` <ion-item>${m.content}</ion-item> `)} </ion-list>
          </ion-col>
          <ion-col size="6">
            <ion-item lines="full" full>
              <ion-label position="floating">Text</ion-label>
              <ion-input
                type="text"
                required
                placeholder="Text eingeben"
                id="text"
              ></ion-input>
              <ion-note slot="error">Invalid Text</ion-note>
            </ion-item>
            <ion-button @click="${this.onEnter}">send</ion-button>
          </ion-col>
        </ion-grid>
      </ion-content>
    `;
  }

  async onEnter() {
    try{
        const data = {
          to: "Simon",
          content: this.textInputElement.value!
        };
        await httpClient.post('/chat/', data);
    } catch (e) {
      notificationService.showNotification((e as Error).message, 'error');
    }
  }
}
