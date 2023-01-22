/* Autor: Victor Corbet */

import { Capacitor } from '@capacitor/core';
import { LitElement, html, PropertyValueMap, nothing } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import { httpClient } from '../../http-client.js';
import { notificationService } from '../../notification.js';
import { PageMixin } from '../page.mixin.js';
import { router } from '../../router/router.js';
import date from '../../service/date.service.js';

import { UserSyncDao, MassageSyncDao } from './../../offline/sync-dao';

type Message = {
  content: string;
  from: string;
  to: string;
  id: string;
  createdAt: number;
  recieved: boolean;
};

@customElement('app-chat')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ChatComponent extends PageMixin(LitElement) {

  @query('#text') private textInputElement!: HTMLInputElement;
  @query('#chat-list') private chatList!: HTMLIonListElement;
  @property() id = ''; //id of other user
  @state() messages: Array<Message> = [];
  @state() user: Object = {}

  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }

  async firstUpdated() {
      this.textInputElement.addEventListener("keyup", (e) => e.key === "Enter" ? this.onEnter() : nothing);
      this.user = await UserSyncDao.findOne({id: this.id});
      this.messages = [...await MassageSyncDao.findAll({ to: this.id }), ...await MassageSyncDao.findAll({ from: this.id })]

      this.requestUpdate();
      await this.setupWebSocket();
      await this.updateComplete;
  }

  async setupWebSocket() {
    if(httpClient.isOffline) {
      return;
    }

    const jwt = await httpClient.getJwt()

    let webSocket = null;

    if(Capacitor.getPlatform() === 'android') {
      webSocket = new WebSocket('ws://10.0.2.2:3000/?jwt=' + jwt);
    } else if(Capacitor.getPlatform() === 'ios') {

      webSocket = new WebSocket('ws://127.0.0.1:3000/?jwt=' + jwt);
    } else {
      webSocket = new WebSocket('ws://localhost:3000?jwt=' + jwt);
    }

    webSocket.onmessage = event => {
      var data = JSON.parse(event.data);
      //new Message
      if (data.newMessage) {
        this.messages = [...this.messages, data.newMessage];
        this.updateComplete.then(async c => {
          const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
          await delay(200);
          this.chatList.scrollIntoView({ block: 'end', behavior: 'smooth' });
        });
        //Send path to tell other user, that message was recieved
        //this.id is the id of the user, we are writing witih (1 Chat = 1 Other User = His ID)
        if (this.id === data.newMessage.from) {
          httpClient.patch('/messages/read', {
            id: data.newMessage.id,
            to: this.id
          });
        }
      }
      //1. Message read by other client
      if (data.readNotification) {
        var m = this.messages.find(e => e.id === data.readNotification);
        if (m) {
          m!.recieved = true;
          this.messages[this.messages.indexOf(m!)] = m;
          this.messages = [...this.messages];
        }
      }
      //N Messages read by other client
      if (data.readNotifications) {
        var array = [];
        for (var message of this.messages) {
          message.recieved = true;
          array.push(message);
        }
        this.messages = array;
      }
    };
  }

  render() {
    return html`
      <ion-card>
        <ion-card-header>
          <ion-card-title>${this.user.name} <ion-avatar class="userAvatar"><img src="${this.user.avatar ?? './avatar.png'}"></ion-avatar></ion-card-title>
        </ion-card>
      </ion-card-header>
      <ion-content color="grey">
        <ion-list style="display: flex; flex-direction: column;" id="chat-list">
          ${this.messages
            .sort((a, b) => {
              if (a.createdAt < b.createdAt) {
                return -1;
              }
              return 1;
            })
            .map(m => this.renderMessage(m, m.from === this.id))}
        </ion-list>
      </ion-content>

      ${Capacitor.getPlatform() === "ios" ? 
          html`
            <ion-footer style="margin-bottom: 40px;">
              <ion-row>
                <ion-input style="display: flex;" type="text" required placeholder="Text eingeben" id="text"></ion-input>
                <ion-button @click="${this.onEnter}" style="margin-bottom: 5px">
                  <ion-icon name="send-outline"></ion-icon>
                </ion-button>
              </ion-row>
            </ion-footer>
          `: html`
            <ion-footer>
              <ion-row>
                <ion-input style="display: flex;" type="text" required placeholder="Text eingeben" id="text"></ion-input>
                <ion-button @click="${this.onEnter}" style="margin-bottom: 5px">
                  <ion-icon name="send-outline"></ion-icon>
                </ion-button>
              </ion-row>
            </ion-footer>
          `}
    `;
  }

  renderMessage(message: Message, isLeft: boolean) {
    return html`
      <div>
        <ion-card style=${isLeft ? 'float:left;' : 'float:right;'}>
          <ion-row>
            <ion-card-content> 
          <b>${message!.content}</b>  
            
          </ion-card-content>
            <ion-card-content>
              <ion-row style="padding-top: 4px">
                <small>${date(message.createdAt)}</small>
                ${isLeft == false
                  ? html`<ion-icon
                      color="primary"
                      name=${message!.recieved ? 'checkmark-done-outline' : 'checkmark-outline'}
                    ></ion-icon>`
                  : nothing}
              </ion-row>
            </ion-card-content>
          </ion-row>
        </ion-card>
      </div>
    `;
  }

  async onEnter() {
      const data = {
        to: this.id,
        content: this.textInputElement.value!
      };
      this.textInputElement.value = null;
      await MassageSyncDao.create(data);
      const messages = this.messages;
      messages.push(data);
      this.messages = messages;
      await this.requestUpdate();
  }
}

