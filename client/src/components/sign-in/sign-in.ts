/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import { Capacitor } from '@capacitor/core';
import { LitElement, html } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';

import componentStyle from './sign-in.css';

@customElement('app-sign-in')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class SignInComponent extends PageMixin(LitElement) {
  static styles = [componentStyle];

  @query('form') private form!: HTMLFormElement;

  @query('#email') private emailElement!: HTMLIonInputElement;

  @query('#sign_in_password') private passwordElement!: HTMLIonInputElement;

  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }

  render() {
    return html`${when(
      Capacitor.isNativePlatform(),
      () => html`<ion-content>${this.buildBody()}</ion-content>`,
      () => this.buildBody()
    )}`;
  }

  buildBody() {
    return html`
        <h1>Registrieren</h1>
        <form novalidate>
          <ion-item lines="full">
            <ion-label position="floating">Email</ion-label>
            <ion-input type="email" required placeholder="Text eingeben" id="email"></ion-input>
          </ion-item>
          <ion-item lines="full">
            <ion-label position="floating">Passwort</ion-label>
            <ion-input type="password" required placeholder="Text eingeben" id="sign_in_password"></ion-input>
          </ion-item>
          <ion-row>
            <ion-col>
              <ion-button type="submit" color="primary" expand="block" onclick="this.submit">Anmelden</ion-button>
            </ion-col>
          </ion-row>
        </form>
    `;
  }

  async submit() {
    console.log("called submit method");
    if (this.isFormValid()) {
      const authData = {
        email: this.emailElement.value,
        password: this.passwordElement.value
      };
      try {
        await httpClient.post('/users/sign-in', authData);
        router.navigate('/'); //todo: route to default page of screen
      } catch (e) {
        this.showNotification((e as Error).message, 'error');
      }
    } else {
      this.form.classList.add('was-validated');
    }
  }

  isFormValid() {
    return this.form.checkValidity();
  }
}
