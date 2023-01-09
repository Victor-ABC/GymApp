/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { PageMixin } from '../page.mixin.js';
import { notificationService } from '../../notification.js'
import { router } from '../../router/router.js';
import { authenticationService, AuthenticationService } from '../../authenticationService.js';

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
      await httpClient.delete('/users/sign-out');
      authenticationService.resetUserStorage();
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
