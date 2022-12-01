/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
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

  buildBrowser() {
    return html`
      <app-header title="${this.appTitle}" .linkItems=${this.linkItems}> </app-header>
      <div class="main">${this.renderRouterOutlet()}</div>
    `;
  }

  render() {
    return html`${when(
      Capacitor.isNativePlatform(),
      () => this.buildBrowser(),
      () => this.buildMobile()
    )}`;
  }

  buildMobile() {
    return html` <ion-app>
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
