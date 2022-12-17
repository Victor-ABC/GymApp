/* Autor: Victor Corbet */

import { Capacitor } from '@capacitor/core';
import { LitElement, html, PropertyValueMap, nothing } from 'lit';
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
  recieved: boolean;
};

@customElement('app-chat')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ChatComponent extends PageMixin(LitElement) {
  @query('#text') private textInputElement!: HTMLIonInputElement;
  @query('#chat-list') private chatList!: HTMLIonListElement;
  @property() id = ''; //id of other user
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
      var data = JSON.parse(event.data);
      console.log(data);
      //new Message
      if (data.newMessage) {
        console.log("2.1) client recieven newMessage(WS) with new message");
        this.messages = [...this.messages, data.newMessage];
        this.updateComplete.then(async c => {
          const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
          await delay(200);
          this.chatList.scrollIntoView({ block: 'end', behavior: 'smooth' });
        });
        //Send path to tell other user, that message was recieved
        //this.id is the id of the user, we are writing witih (1 Chat = 1 Other User = His ID)
        if(this.id === data.newMessage.from) {
          console.log("3) sended patch with id: " + data.newMessage.id + " to: " + data.newMessage.from);
          httpClient.patch('/chat/read', {
            id: data.newMessage.id,
            to: this.id
          });
        }
      }
      //1. Message read by other client
      if (data.readNotification) {
        console.log("5.1 1 read Notification: reciefed notificatoin to show 2 check-icons (WS)")
        var m = this.messages.find(e => e.id === data.readNotification);
        if (m) {
          m!.recieved = true;
          this.messages[this.messages.indexOf(m!)] = m;
          this.messages = [...this.messages];
        } else {
          console.log('Something went wrong! 5.1 1 read Notification:');
        }
      }
      //N Messages read by other client
      if (data.readNotifications) {
        console.log("5.2) N read Notification: reciefed notificatoin to show 2 check-icons (WS)")
        var array = [];
        for (var message of this.messages) {
          message.recieved = true;
          array.push(message);
        }
        this.messages = array;
        console.log("5.2) N read Notification: trigger rerender with new messages: " + JSON.stringify(this.messages));
      }
    };
  }

  render() {
    return html`${when(
      Capacitor.isNativePlatform(),
      () => html`<ion-content>${this.buildBody()}</ion-content>`,
      () => this.buildBody()
    )}`;
  }
  //isleft =
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
              return 1;
            })
            .map(m => this.renderMessage(m, m.from === this.id))}
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

  renderMessage(message: Message, isLeft: boolean) {
    return html`
      ${message
        ? html`
            <ion-card style=${isLeft ? 'float:left; width=10%' : 'float:right; width=10%;'}>
              <ion-row>
                <ion-card-content> ${message!.content}</ion-card-content>
                <ion-card-content>
                  <ion-row style="padding-top: 4px">
                    <small>${this.buildDate(message.createdAt)}</small>
                    ${isLeft == false ? html`<ion-icon color="primary" name=${message!.recieved ? "checkmark-done-outline" : "checkmark-outline"}></ion-icon>` : nothing}
                  </ion-row>
                </ion-card-content>
              </ion-row>
            </ion-card>
          `
        : nothing}
    `;
  }

  zeroPrefix(num: number) {
    return num < 10 ? '0' + num : num;
  }

  buildDate(createdAt: number) {
    const date = new Date(createdAt);
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();
    return (
      this.zeroPrefix(hours) +
      ':' +
      this.zeroPrefix(minutes) +
      ' (' +
      this.zeroPrefix(day) +
      '.' +
      this.zeroPrefix(month) +
      '.' +
      this.zeroPrefix(year) +
      ')'
    );
  }
  async onEnter() {
    try {
      const data = {
        to: this.id,
        content: this.textInputElement.value!
      };
      this.textInputElement.value = null;
      console.log("1) Post to create new Message")
      await httpClient.post('/chat/new', data);
    } catch (e) {
      notificationService.showNotification((e as Error).message, 'info');
    }
  }
}
