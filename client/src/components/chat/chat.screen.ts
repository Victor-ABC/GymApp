/* Autor: Victor Corbet */

import { LitElement, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { notificationService } from '../../notification.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';
import date from '../../service/date.service.js';
import { MassageSyncDao } from './../../offline/sync-dao';
import { httpClient } from '../../http-client.js';
import { ChatSyncDao } from '../../offline/chat-sync-dao.js';

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
        <div class="header-overview">
          <h1>Chats</h1>
          <ion-button @click="${this.newChat}">
            <ion-icon name="add"></ion-icon>
          </ion-button>
        </div>

          ${this.chatPartners.length === 0 ?
              html`
              <ion-card>
                <ion-card-content>
                  <div class="no-content">Du hast momentan keine Chats</div>
                </ion-card>
              </ion-card-content>
          ` : html`
            <ion-list> ${this.chatPartners.map(chatPartner => this.buildChat(chatPartner))} </ion-list>
          `}
      </ion-content>
    `;
  }

  newChat() {
    router.navigate('/newchat');
  }

  async firstUpdated() {
    if (this.chatPartners.length == 0) { 
        this.chatPartners = await ChatSyncDao.getAllChats() as User[];
        this.requestUpdate();
        await this.updateComplete;
    }
  }

  buildChat(chatPartner: User) {
    return html`
      <ion-card>
        <ion-item
          button
          @click="${() => this.createChat(chatPartner)}"
        >
          <ion-label>
            <h2>${chatPartner.name}</h2>
            <p>Existiert seit: ${date(chatPartner.createdAt)}</p>
          </ion-label>
        </ion-item>
      </ion-card>
    `;
  }

  createChat(chatPartner: User) {
    router.navigate(`/chat/${chatPartner.id}`)
  }
}
