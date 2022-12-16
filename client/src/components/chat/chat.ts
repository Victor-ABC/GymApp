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
  /*
  @property()
  messages: Array<Message> = [
    {
      from: 'timID',
      to: 'simonID',
      createdAt: (new Date()).getMilliseconds(),
      content: 'Message1',
      id: "UUID1"
    },
    {
      from: 'timID',
      to: 'simonID',
      createdAt: (new Date()).getMilliseconds(),
      content: 'Message2',
      id: "UUID2"
    },
    {
      from: 'timID',
      to: 'simonID',
      createdAt: (new Date()).getMilliseconds(),
      content: 'Message3',
      id: "UUID3"
    },
    {
      from: 'timID',
      to: 'simonID',
      createdAt: (new Date()).getMilliseconds(),
      content: 'Message4',
      id: "UUID4"
    },
  ];
  */

  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }
  async firstUpdated() {
    try {
      const response = await httpClient.get('/chat/' + this.id);
      var json = await response.json();
      this.messages = [...json.data];
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
      console.log(event);
      console.log(JSON.parse(event.data).newMessage);
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
        <ion-grid>
          <ion-col size="6">
            <ion-list> ${this.messages.map(m => html` <app-chat-message .message=${m}></app-chat-message> `)} </ion-list>
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
        this.textInputElement.value = null;
        await httpClient.post('/chat/', data);
    } catch (e) {
      notificationService.showNotification((e as Error).message, 'info');
    }
  }
}
