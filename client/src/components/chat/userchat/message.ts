/* Autor: Victor Corbet */

import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { PageMixin } from '../../page.mixin.js';

type Message = {
  content: string;
  from: string;
  to: string;
  id: string;
  createdAt: number;
  recieved: boolean;
} | null;

@customElement('app-chat-message')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class MessageComponent extends PageMixin(LitElement) {
  @property()
  message: Message = null;
  @property() isLeft: boolean = true;

  protected createRenderRoot(): Element | ShadowRoot {
    return this;
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
  /*
  <ion-card-title color=${this.isLeft ? 'secondary' : 'primary'}>${this.message!.content}</ion-card-title>
  */
  render() {
    return html`
      ${this.message
        ? html`
            <ion-card style=${this.isLeft ? 'float:left;' : 'float:right;'}>
              <ion-row>
                <ion-card-content> ${this.message!.content}</ion-card-content>
                <ion-card-content style="float:right;">
                  <ion-row style="padding-top: 4px">
                    <small>${this.buildDate(this.message.createdAt)}</small>
                    ${this.isLeft == false ? html`<ion-icon color="primary" name=${this.message!.recieved ? "checkmark-done-outline" : "checkmark-outline"}></ion-icon>` : nothing}
                  </ion-row>
                </ion-card-content>
              </ion-row>
            </ion-card>
          `
        : nothing}
    `;
  }
}
