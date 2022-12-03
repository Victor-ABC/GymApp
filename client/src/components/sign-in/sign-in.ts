/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import { Capacitor } from '@capacitor/core';
import { IonInputCustomEvent } from '@ionic/core';
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

  @query('#sign_in_email') private emailElement!: HTMLIonInputElement;

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
      ${this.renderNotification()}
      <h1>Anmelden</h1>
      <form novalidate onSubmit="submit">
        <ion-item lines="full">
          <ion-label position="floating">Email</ion-label>
          <ion-input type="email" required placeholder="Text eingeben" id="sign_in_email"></ion-input>
          <ion-note slot="error">Invalid email</ion-note>
        </ion-item>
        <ion-item lines="full">
          <ion-label position="floating">Passwort</ion-label>
          <ion-input type="password" required placeholder="Text eingeben" id="sign_in_password"></ion-input>
        </ion-item>
        <ion-row>
          <ion-col>
            <button onClick="this.doIt">Normal Button</button>
            <ion-button href="chat/all" type="submit" color="primary" expand="block" onclick="this.logSomething"
              >Anmelden</ion-button
            >
          </ion-col>
        </ion-row>
      </form>
    `;
  }

  doIt() {
    console.log('it');
    alert('it');
  }

  async submit() {
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
