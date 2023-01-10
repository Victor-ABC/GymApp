/* Autor: Victor Corbet */

import { LitElement, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { notificationService } from '../../notification.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';
import date from '../../service/date.service.js';
type User = {
  name: string;
  email: string;
  password: string;
  isTrainer: boolean;
  id: string;
  createdAt: number;
};

@customElement('app-chat-new-users')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class AppChatNewUsers extends PageMixin(LitElement) {

  @property()
  allUsers: Array<User> = [];

  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }

  render() {
    return html`
      <ion-content class="ion-padding">
        <h1>Users</h1>
        <ion-list> ${this.allUsers.map(user => this.buildUsers(user))} </ion-list>
      </ion-content>
    `;
  }

  buildUsers(chatPartner: User) {
    //${title}
    return html`
      <ion-card>
        <ion-item button href="/chat/${chatPartner.id}/${chatPartner.createdAt}/${chatPartner.email}/${chatPartner.name}">
          <ion-label>
            <h2>${chatPartner.name}</h2>
            <p>Existiert seit: ${date(chatPartner.createdAt)}</p>
          </ion-label>
        </ion-item>
      </ion-card>
    `;
  }

  async firstUpdated() {
    if (this.allUsers.length == 0) {
      try {
        const response = await httpClient.get('/chat/all/users');
        var allUsers = (await response.json());
        this.allUsers = allUsers;
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
}
