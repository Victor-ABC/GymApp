/* Autor: Victor Corbet */

import { LitElement, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { notificationService } from '../../notification.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';
import date from '../../service/date.service.js';
import { ChatSyncDao } from './../../offline/sync-dao';
import { httpClient } from '../../http-client.js';

type User = {
  name: string;
  email: string;
  password: string;
  isTrainer: boolean;
  id: string;
  createdAt: number;
};

@customElement('app-chats')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ChatScreen extends PageMixin(LitElement) {
  @query('#text') private textInputElement!: HTMLIonInputElement;

  @property()
  chatPartners: Array<User> = [];

  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }

  render() {
    return html`
      <ion-content class="ion-padding">
        <ion-row style="display: flex; flex-wrap: nowrap; justify-content: space-between;">
          <h1>Chats</h1>
          <ion-button style="border-radius: 50%;" href="/newchat">
            <ion-icon name="add"></ion-icon>
          </ion-button>
        </ion-row>
        <ion-list> ${this.chatPartners.map(chatPartner => this.buildChat(chatPartner))} </ion-list>
      </ion-content>
    `;
  }

  async firstUpdated() {
    if (this.chatPartners.length == 0) {
      try {
        //this.chatPartners = await ChatSyncDao.findAll();
        const response = await httpClient.get('/chat/');
        this.chatPartners = response.json();
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
  }

  buildChat(chatPartner: User) {
    //${title}
    return html`
      <ion-card>
        <ion-item
          button
          href="/chat/${chatPartner.id}/${chatPartner.createdAt}/${chatPartner.email}/${chatPartner.name}"
        >
          <ion-label>
            <h2>${chatPartner.name}</h2>
            <p>Existiert seit: ${date(chatPartner.createdAt)}</p>
          </ion-label>
        </ion-item>
      </ion-card>
    `;
  }

  async onEnter() {
    try {
      const data = {
        to: 'Simon',
        content: this.textInputElement.value!
      };
      this.textInputElement.value = null;
      await ChatSyncDao.create(data);
    } catch (e) {
      notificationService.showNotification((e as Error).message, 'info');
    }
  }
}
