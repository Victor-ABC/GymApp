/* Autor: Victor Corbet */

import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { PageMixin } from '../page.mixin.js';
import { notificationService } from '../../notification.js'
import { router } from '../../router/router.js';
import { authenticationService, AuthenticationService } from '../../authenticationService.js';
import { Storage } from "@ionic/storage";

@customElement('app-sign-out')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class SignOutComponent extends PageMixin(LitElement) {
  render() {
    return html``;
  }

  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }

  async firstUpdated() {
    try {
      const storage = new Storage();
      storage.create();
      storage.clear();
      await httpClient.delete('/users/sign-out');
      await authenticationService.resetUserStorage();
      notificationService.showNotification('Sie wurden erfolgreich abgemeldet!' , "info");
      router.navigate('/users/sign-in');
      const child = document.querySelector('app-header') as LitElement;
      if(child) {
        child.requestUpdate();
      }
    } catch (e) {
      notificationService.showNotification((e as Error).message , "error");
    }
  }
}
