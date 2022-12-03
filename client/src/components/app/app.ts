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
    { title: 'Chat', routePath: 'chat/all' }
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

  renderRouterOutlet() {
    return router.select(
      {
        'users/sign-in': () => html`<app-sign-in></app-sign-in>`,
        'users/sign-up': () => html`<app-sign-up></app-sign-up>`,
        'users/sign-out': () => html`<app-sign-out></app-sign-out>`,
        'chat/all': () => html`<app-chat-all></app-chat-all>`
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
      <app-header title="${this.appTitle}" .linkItems=${this.linkItems}> </app-header>
      <ion-content class="ion-padding">
        <ion-grid>
          <ion-row>
            <ion-col></ion-col>
            <ion-col size="7">${this.renderRouterOutlet()}</ion-col>
            <ion-col></ion-col>
          </ion-row>
        </ion-grid>
      </ion-content>
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
    <ion-app class="toast-wrapper">
      <ion-router use-hash="false">
        <ion-route-redirect from="/" to="users/sign-in"></ion-route-redirect>
        <ion-route component="app-tabs">
          <ion-route url="users/sign-in" component="app-sign-in"></ion-route>
          <ion-route url="users/sign-up" component="app-sign-up"></ion-route>
          <ion-route url="chat/all" component="app-chat-all"></ion-route>
        </ion-route>
      </ion-router>
      <ion-nav root="app-sign-up"></ion-nav>
    </ion-app>`;
  }
}
