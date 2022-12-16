/* Autor: Victor Corbet */

import { Capacitor } from '@capacitor/core';
import { LitElement, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import { httpClient } from '../../http-client.js';
import { notificationService } from '../../notification.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';

type User = {
  name: string;
  email: string;
  password: string;
  isTrainer: boolean;
  id: string;
  createdAt: number;
};
type Chat = {
  members: Array<User>;
  messages: Array<Message>;
  id: string;
  createdAt: number;
};
type Message = {
  content: string;
  from: string;
  to: string;
  id: string;
  createdAt: number;
};

@customElement('app-chats')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class SignOutComponent extends PageMixin(LitElement) {
  @query('#text') private textInputElement!: HTMLIonInputElement;

  @property()
  chats: Array<Chat> = [];

  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }

  render() {
    return html`
      <ion-content class="ion-padding">
        <h1>Chats</h1>
        <ion-list> ${this.chats.map(chat => this.buildChat(chat))} </ion-list>
      </ion-content>
    `;
  }

  async firstUpdated() {
    try {
      const response = await httpClient.get('/chat/chats');
      var json = await response.json();
      console.log(json)
      console.log(JSON.stringify(json))
      this.chats = [...json.data];
      this.requestUpdate();
      await this.updateComplete;
    } catch (e) {
      if ((e as { statusCode: number }).statusCode === 401) {
        router.navigate('/users/sign-in');
      } else {
        notificationService.showNotification((e as Error).message, 'error');
      }
    }
  }

  
  buildChat(chat: Chat) {
    var title = '';
    for (var i = 0; i < chat.members.length; i++) {
      if (i < chat.members.length - 1) {
        title += chat.members[i].name + ', ';
      } else {
        title += chat.members[i].name;
      }
      if(chat.members[i].isTrainer) {
        title += "(Trainer) "
      }
    }
    //${title}
    return html`
    <ion-card>
      <ion-item button href="/chat/${chat.id}">
        <ion-label>
          <h2>${title}</h2>
          <p>Unterhaltung seit: ${this.buildDate(chat.createdAt)}</p>
        </ion-label>
      </ion-item>
      </ion-card>
    `;
  }

  buildDate(createdAt: number) {
    const date = new Date(createdAt);
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();
    return day + "." + month + "." + year;
  }

  async onEnter() {
    try {
      const data = {
        to: 'Simon',
        content: this.textInputElement.value!
      };
      this.textInputElement.value = null;
      await httpClient.post('/chat/', data);
    } catch (e) {
      notificationService.showNotification((e as Error).message, 'info');
    }
  }
}
