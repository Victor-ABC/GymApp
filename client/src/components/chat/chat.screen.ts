/* Autor: Victor Corbet */

import { LitElement, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
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

@customElement('app-chats')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class SignOutComponent extends PageMixin(LitElement) {
  @query('#text') private textInputElement!: HTMLIonInputElement;

  @property()
  chatPartners: Array<User> = [];

  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }

  render() {
    return html`
      <ion-content class="ion-padding">
        <h1>Chats</h1>
        <ion-grid>
          <ion-col>
            <ion-list> ${this.chatPartners.map(chatPartner => this.buildChat(chatPartner))} </ion-list>
          </ion-col>
          <ion-col size="auto">
            <ion-card>
            <ion-item button href="/newchat" color="primary">
              <ion-label>
                <h2>new chat</h2>
              </ion-label>
            </ion-item>
            </ion-card>
          </ion-col>
        </ion-grid>
      </ion-content>
    `;
  }

  async firstUpdated() {
    if (this.chatPartners.length == 0) {
      try {
        const response = await httpClient.get('/chat/chats');
        this.chatPartners = (await response.json()).data;
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
        <ion-item button href="/chat/${chatPartner.id}/${chatPartner.createdAt}/${chatPartner.email}/${chatPartner.name}">
          <ion-label>
            <h2>${chatPartner.name}</h2>
            <p>Existiert seit: ${this.buildDate(chatPartner.createdAt)}</p>
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
    return day + '.' + month + '.' + year;
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
