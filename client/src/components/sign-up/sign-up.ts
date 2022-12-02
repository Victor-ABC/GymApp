/* Autor: Victor Corbet*/

import { Capacitor } from '@capacitor/core';
import { LitElement, html } from 'lit';
import { customElement, query, property } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';
import componentStyle from './sign-up.css';

type CustomError = {
  errorMessage: string;
  punishment: number;
};

@customElement('app-sign-up')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class SignUpComponent extends PageMixin(LitElement) {
  static styles = [componentStyle];

  @query('#password')
  inputOfPasswordElement!: HTMLInputElement;

  @property()
  isFirstinputOfPasswordElement = true;

  @property({ type: Array<CustomError> }) errors = [];

  @query('form') private form!: HTMLFormElement;

  @query('#name') private nameElement!: HTMLInputElement;

  @query('#email') private emailElement!: HTMLInputElement;

  @query('#password-progress') private passwordElement!: HTMLIonProgressBarElement;

  @query('#password-check') private passwordCheckElement!: HTMLInputElement;

  //<app-pwt></app-pwt>

  async firstUpdated() {
    this.inputOfPasswordElement.addEventListener('input', () => {
      this.computeStrengthOfPasswordAgain();
    });
  }

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
      <form>
        <ion-item lines="full">
          <ion-label position="floating">Name</ion-label>
          <ion-input type="text" required placeholder="Text eingeben"></ion-input>
        </ion-item>
        <ion-item lines="full">
          <ion-label position="floating">Email</ion-label>
          <ion-input type="email" required placeholder="Text eingeben"></ion-input>
        </ion-item>
        <ion-item lines="full">
          <ion-label position="floating">Passwort</ion-label>
          <ion-input type="password" required id="password" placeholder="Text eingeben"></ion-input>
        </ion-item>
        <ion-progress-bar id="password-progress"></ion-progress-bar>
        <ion-list id="problems" class="problems">
          ${this.errors.map(
            (error, index) =>
              html`
                <ion-item>
                  <ion-icon name="information-circle-outline" color="danger"></ion-icon>
                  <ion-label>
                    <p>${(error as CustomError).errorMessage}</p>
                  </ion-label>
                </ion-item>
              `
          )}
        </ion-list>
        <ion-item lines="full">
          <ion-label position="floating">Passwort-check</ion-label>
          <ion-input type="password" required laceholder="Text eingeben"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label>Trainer</ion-label>
          <ion-checkbox></ion-checkbox>
        </ion-item>
        <ion-button href="chat/all" type="submit" color="primary" expand="block" onclick="this.logSomething">Registrieren</ion-button>
      </form>
    `;
  }

  logSomething() {
    alert("asdf");
  }

  async submit() {
    console.log('called sign-up submit');
    if (this.isFormValid()) {
      const accountData = {
        name: this.nameElement.value,
        email: this.emailElement.value,
        password: this.passwordElement.value,
        passwordCheck: this.passwordCheckElement.value
      };
      try {
        await httpClient.post('users', accountData);
        router.navigate('/'); //todo: add starting page route
      } catch (e) {
        this.showNotification((e as Error).message, 'error');
      }
    } else {
      this.form.classList.add('was-validated');
    }
  }

  isFormValid() {
    if (this.inputOfPasswordElement.value !== this.passwordCheckElement.value) {
      this.passwordCheckElement.setCustomValidity('Passwörter müssen gleich sein');
    } else {
      this.passwordCheckElement.setCustomValidity('');
    }
    return this.form.checkValidity();
  }

  computeStrengthOfPasswordAgain() {
    const errors = this.computeStrengthOfPassword(this.inputOfPasswordElement.value);
    let strength = 100;
    //this.allProblems.innerHTML = '';
    const newErrorList: Array<CustomError> = [];
    errors.forEach(error => {
      if (error == null) return;
      strength -= error.punishment;
      newErrorList.push(error);
    });
    (this.errors as Array<CustomError>) = newErrorList;
    this.passwordElement.value = strength / 100;
    if (strength < 45) {
      this.passwordElement.style.setProperty('--color', '#ff3838'); //red
    } else if (strength >= 45 && strength < 70) {
      this.passwordElement.style.setProperty('--color', '#cef717'); //yellow
    } else {
      this.passwordElement.style.setProperty('--color', '#1ac228'); //green
    }
  }

  computeStrengthOfPassword(password: string) {
    const errors = [];
    errors.push(this.lenghtProblem(password));
    errors.push(this.lowercaseError(password));
    errors.push(this.uppercaseError(password));
    errors.push(this.numberError(password));
    errors.push(this.specialCharactersError(password));
    errors.push(this.reapeatCharactersError(password));
    return errors;
  }

  lowercaseError(password: string) {
    return this.genericErrorFinder(password, /[a-z]/g, 'Kleinbuchstaben');
  }
  uppercaseError(password: string) {
    return this.genericErrorFinder(password, /[A-Z]/g, 'Großbuchstaben');
  }
  numberError(password: string) {
    return this.genericErrorFinder(password, /[0-9]/g, 'Zahlen');
  }
  specialCharactersError(password: string) {
    return this.genericErrorFinder(password, /[^0-9a-zA-Z\s]/g, 'Sonderzeichen (!$%&*...)');
  }

  genericErrorFinder(password: string, regex: RegExp, requirement: string) {
    const matches = password.match(regex) || [];
    //1/2 -> bad
    if (matches.length == 1) {
      return {
        errorMessage: 'Passwort hat nur ein ' + requirement,
        punishment: 10
      };
    }
    //0/2 -> worse
    if (matches.length == 0) {
      return {
        errorMessage: 'Passwort hat keine ' + requirement,
        punishment: 15
      };
    }
  }
  reapeatCharactersError(password: string) {
    const matches = password.match(/(.)\1/g) || [];
    if (matches.length > 0) {
      return {
        errorMessage: 'Bitte keine selben Zeichen nebeneinander',
        punishment: matches.length * 10
      };
    }
  }
  lenghtProblem(password: string) {
    const length = password.length;
    if (length <= 4) {
      return {
        errorMessage: 'Passwort zu kurz',
        punishment: 40
      };
    }
    if (length < 10) {
      return {
        errorMessage: 'Passwort könnte länger sein',
        punishment: 25
      };
    }
  }
}
