/* Autor: Victor Corbet */

import { Capacitor } from '@capacitor/core';
import { LitElement, html, PropertyValueMap } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import { httpClient } from '../../../http-client.js';
import { notificationService } from '../../../notification.js';
import { PageMixin } from '../../page.mixin.js';
import { router } from '../../../router/router.js';

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
  @query('#chat-list') private chatList!: HTMLIonListElement;
  @property() id = '';
  @property() createdAt = new Date().getTime();
  @property() email = '';
  @property() name = '';
  @property() messages: Array<Message> = [];


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
      this.updateComplete.then( async (c) => {
        const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
        await delay(1);
        this.chatList.scrollIntoView({block: "end", behavior: "smooth"})
      });
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
      <ion-card>
        <ion-card-title>${this.name}</ion-card-title>
        <ion-card-subtitle>${this.email}</ion-card-subtitle>
      </ion-card>
      <ion-content style="height: 70%" color="grey">
        <ion-list style="display: flex; flex-direction: column;" id="chat-list">
          ${this.messages
            .sort((a, b) => {
              if (a.createdAt < b.createdAt) {
                return -1;
              }
              if ((a.createdAt = b.createdAt)) {
                return 0;
              }
              return 1;
            })
            .map(m => html`<app-chat-message .message=${m} .isLeft=${m.from === this.id}></app-chat-message> `)}
        </ion-list>
      </ion-content>
      <ion-content>
        <ion-card style="display: flex; flex-grow: 2n">
          <ion-item lines="full" full style="flex-grow: 1;">
            <ion-label position="floating">Text</ion-label>
            <ion-input style="display: flex;" type="text" required placeholder="Text eingeben" id="text"></ion-input>
            <ion-note slot="error">Invalid Text</ion-note>
          </ion-item>
          <ion-button @click="${this.onEnter}" style="margin-top: 1%">send</ion-button>
        </ion-card>
      </ion-content>
    `;
  }

  buildDate(createdAt: number) {
    const date = new Date(createdAt);
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();
    return day + '.' + month + '.' + year;
  }

  async onEnter() {
    try {
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
