/* Autor: Victor Corbet */

import { Capacitor } from '@capacitor/core';
import { LitElement, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import { httpClient } from '../../http-client.js';
import { notificationService } from '../../notification.js';
import { PageMixin } from '../page.mixin.js';
import { router } from '../../router/router.js';

type Message = {
  content: string;
  from: string;
  to: string;
  id: string;
  createdAt: number;
};



@customElement('app-chat')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class SignOutComponent extends PageMixin(LitElement) {

  @query('#text') private textInputElement!: HTMLIonInputElement;

  @property() id = '';
  @property() messages: Array<Message> = []
  
  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }
  async firstUpdated() {
    try {
      const response = await httpClient.get('/chat/' + this.id);
      this.messages = (await response.json()).data; 
      this.requestUpdate();
      this.setupWebSocket();
      await this.updateComplete;
    } catch (e) {
      if ((e as { statusCode: number }).statusCode === 401) {
        router.navigate('/users/sign-in');
      } else {
        notificationService.showNotification((e as Error).message, 'error');
      }
    }
  }

  setupWebSocket() {
    const webSocket = new WebSocket('ws://localhost:3000');
    webSocket.onmessage = event => {
      this.messages = [...this.messages, JSON.parse(event.data).newMessage];
    };
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
        <ion-grid style="height: 90%">
          <ion-col size="6">
            <ion-list style="height: 85%"> ${this.messages.map(m => html` <app-chat-message .message=${m}></app-chat-message> `)} </ion-list>
          </ion-col>
          <ion-col size="6">
            <ion-card>
              <ion-row>
              <ion-item lines="full" full style="width: 80%">
              <ion-label position="floating">Text</ion-label>
              <ion-input
                type="text"
                required
                placeholder="Text eingeben"
                id="text"
              ></ion-input>
              <ion-note slot="error">Invalid Text</ion-note>
            </ion-item>
            <ion-button @click="${this.onEnter}" style="margin-top: 1%">send</ion-button>
              </ion-row>
            </ion-card>
          </ion-col>
        </ion-grid>
      </ion-content>
    `;
  }

  async onEnter() {
    try{
        const data = {
          to: this.id,
          content: this.textInputElement.value!
        };
        this.textInputElement.value = null;
        await httpClient.post('/chat/new', data);
    } catch (e) {
      notificationService.showNotification((e as Error).message, 'info');
    }
  }
}
