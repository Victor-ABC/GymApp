/* Autor: Victor Corbet */

import { Capacitor } from '@capacitor/core';
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import { httpClient } from '../../http-client.js';
import { PageMixin } from '../page.mixin.js';

type Message = {
  from: string;
  to: string;
  date: Date;
  content: string;
};

@customElement('app-chat-all')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class SignOutComponent extends PageMixin(LitElement) {
  @property()
  messages: Array<Message> = [
    {
      from: 'timID',
      to: 'simonID',
      date: new Date(),
      content: 'Message1'
    },
    {
      from: 'timID',
      to: 'simonID',
      date: new Date(),
      content: 'Message2'
    },
    {
      from: 'simonID',
      to: 'timID',
      date: new Date(),
      content: 'Message3'
    },
    {
      from: 'timID',
      to: 'simonID',
      date: new Date(),
      content: 'Message4'
    }
  ];

  render() {
    return html`${when(
      Capacitor.isNativePlatform(),
      () => html`<ion-content>${this.buildBody()}</ion-content>`,
      () => this.buildBody()
    )}`;
  }

  buildBody() {
    return html` <ion-list> ${this.messages.map(m => html` <ion-item>${m.content}</ion-item> `)} </ion-list> `;
  }
}
