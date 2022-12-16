/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import { LitElement, html } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { router } from '../../router/router.js';
import { httpClient } from '../../http-client.js';
import { when } from 'lit/directives/when.js';
import { Capacitor } from '@capacitor/core';
import componentStyle from './app.css';

@customElement('app-root')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class AppComponent extends LitElement {
  static styles = componentStyle;

  @state() private appTitle = 'Gym+';

  @query('#main') private mainFrame!: HTMLIonContentElement;

  @state() private linkItems = [
    { title: 'Konto erstellen', routePath: 'users/sign-up' },
    { title: 'Anmelden', routePath: 'users/sign-in' },
    { title: 'Abmelden', routePath: 'users/sign-out' },
    { title: 'Chat', routePath: 'chats/all' }
  ];

  constructor() {
    super();
    const port = location.protocol === 'https:' ? 3443 : 3000;
    httpClient.init({ baseURL: `${location.protocol}//${location.hostname}:${port}/api/` });
  }

  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }

  firstUpdated() {
    router.subscribe(() => this.requestUpdate());
  }
  ////<ion-item button href="/chat/${chatPartner.id}/${chatPartner.createdAt}/${chatPartner.email}/${chatPartner.name}">
  renderRouterOutlet() {
    return router.select(
      {
        'users/sign-in': () => html`<app-sign-in></app-sign-in>`,
        'users/sign-up': () => html`<app-sign-up></app-sign-up>`,
        'users/sign-out': () => html`<app-sign-out></app-sign-out>`,
        'chats/all': () => html`<app-chats></app-chats>`,
        "chat/:id/:createdAt/:email/:name": params => html`<app-chat .id=${params.id} .createdAt=${params.createdAt} .email=${params.email} .name=${params.name}></app-chat>`,
        "newchat": () => html`<app-chat-new-users></app-chat-new-users>`,
      },
      () => html`<app-sign-in></app-sign-in>`
    );
  }

  /*
    Diese Methode sorgt dafür, dass 
    alle Seiten (=Custom-Elements/Lit-Elements) richtig angezeigt werden.
    -> alle haben die höhe Max
    -> alle haben die Breite 7/12 vom Bildschirm (immer responsiv)
  */
  buildBrowser() {
    return html`
      <app-notification id='notification'></app-notification>
      <app-header title="${this.appTitle}" .linkItems=${this.linkItems}></app-header>
      <div class="container">
          ${this.renderRouterOutlet()}
      </div>
    `;
  }

  render() {
    var isNative = Capacitor.isNativePlatform();
    //For Testing Smartphone and Browser without using AndroidStudio + Capacitor
    //isNative = true;  
    return html`${when(
      isNative,
      () => this.buildMobile(),
      () => this.buildBrowser()
    )}`;
  }

  buildMobile() {
    return html` 
    <app-notification></app-notification>
    <ion-app class="toast-wrapper">
      <ion-router use-hash="false">
        <ion-route-redirect from="/" to="users/sign-in"></ion-route-redirect>
        <ion-route url="chat/:id/:createdAt/:email/:name" component="app-chat"></ion-route>
        <ion-route url="newchat" component="app-chat-new-users"></ion-route>
        <ion-route component="app-tabs">
          <ion-route url="users/sign-in" component="app-sign-in"></ion-route>
          <ion-route url="users/sign-up" component="app-sign-up"></ion-route>
          <ion-route url="chats/all" component="app-chats"></ion-route>
        </ion-route>
      </ion-router>
      <ion-nav root="app-sign-up"></ion-nav>
    </ion-app>`;
  }
}
