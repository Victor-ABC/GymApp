/* Autor: Pascal Thesing (FH Münster) */

import { LitElement, html } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';
import { notificationService } from '../../notification.js'

import componentStyle from './overlay.css';

@customElement('app-overlay')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class HomeComponent extends PageMixin(LitElement) {
  static styles = componentStyle;

  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }

  render() {
    return this.buildBody();
  }

  buildBody() {
    return html`
    <div style="width: 100%; height: 100%; position: absolute; top: 0; left: 0;">
      <ion-content class="ion-padding">
        <h1>Loading</h1>
      </ion-content>
      </div>
    `;
  }

  async firstUpdated() {
    if(document.cookie.indexOf('jwt-token=') !== -1) {
        router.navigate('home');
        return;
    }

    router.navigate('users/sign-in');
  }
}
