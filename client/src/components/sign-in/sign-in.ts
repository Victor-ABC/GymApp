/* Autor: Victor Corbet */

import { LitElement, html, PropertyValueMap } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';
import { notificationService } from '../../notification.js'
import { authenticationService } from '../../authenticationService.js';
import { navigate } from 'ionicons/icons';
import { IonRouter } from '@ionic/core/components';

@customElement('app-sign-in')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class SignInComponent extends PageMixin(LitElement) {

  @query('form') private form!: HTMLFormElement;

  @query('#sign_in_email') private emailElement!: HTMLIonInputElement;

  @query('#sign_in_password') private passwordElement!: HTMLIonInputElement;

  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }

  async firstUpdated(): Promise<void> {
    if(authenticationService.isAuthenticated()) {
      router.navigate('/home');
      return 
    }

    const child = document.querySelector('app-header') as LitElement;
    if(child) {
      child.requestUpdate();
    }
  }

  render() {
    return this.buildBody();
  }

  buildBody() {
    return html`
      <ion-content class="ion-padding">
      ${!Capacitor.isNativePlatform() ? html`
      <h1>Anmelden</h1>
  ` : null }
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
              <ion-button color="primary" type="button" @click="${this.submit}" expand="block">Anmelden</ion-button>
        </form>
        <ion-button color="secondary" type="button" @click="${this.signup}" expand="block">Regestrieren</ion-button>
      </ion-content>
    `;
  }

  async submit() {
    if (this.isFormValid()) {
      const authData = {
        email: this.emailElement.value,
        password: this.passwordElement.value
      };
      try {
        const user = await httpClient.post('/users/sign-in', authData);
        await authenticationService.storeUser(await user.json());
        const child = document.querySelector('app-root') as LitElement;
        if(child) {
          await child.requestUpdate();
        }
        router.navigate('/home');
      } catch (e) {
        notificationService.showNotification((e as Error).message, 'error');
      }
    }
    else {
      this.form.classList.add('was-validated');
      return;
    }
  }

  async signup() {
    await router.navigate('/users/sign-up');
  }

  isFormValid() {
    return this.form.checkValidity();
  }
}
