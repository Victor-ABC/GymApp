/* Autor: Henrik Bruns */

import { LitElement, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';
import { notificationService } from '../../notification.js'
import { authenticationService } from '../../authenticationService.js';
import { Camera, CameraResultType } from '@capacitor/camera';
import { UserSyncDao } from '../../offline/sync-dao.js';
import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { thumbsUpSharp } from 'ionicons/icons';
import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('app-user-edit')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class UserEditComponent extends LitElement {

  @query('#password')
  inputOfPasswordElement!: HTMLInputElement;

  @state() private avatar!: string;

  @state() private user!: Object = {};

  @property()
  isFirstinputOfPasswordElement = true;

  @property({ type: Array<CustomError> }) errors = [];

  @query('form') private form!: HTMLFormElement;

  @query('#password-progress') private passwordProgressBar!: HTMLIonProgressBarElement;

  @query('#name > input') private nameElement!: HTMLInputElement;

  @query('#email > input') private emailElement!: HTMLInputElement;

  @query('#password > input') private passwordElement!: HTMLInputElement;

  @query('#password-check > input') private passwordCheckElement!: HTMLInputElement;

  @query('#is-trainer') private isTrainerCheckboxElement!: HTMLIonToggleElement;


protected createRenderRoot(): Element | ShadowRoot {
  return this;
}

render() {
  return this.buildBody();
}

async firstUpdated() {
  this.user = await UserSyncDao.findOne({id: this.id});
  this.avatar = this.user.avatar;

  this.inputOfPasswordElement.addEventListener('input', () => {
    this.computeStrengthOfPasswordAgain();
  });
}

buildBody() {
  return html`
    <ion-content class="ion-padding">
    ${!Capacitor.isNativePlatform() ? html`
    <h1>User editieren</h1>
  ` : null }

    <form>

    ${this.avatar
      ? html`
      <img class="uploadedImages" src="${this.avatar}" />
      `
      : html` <ion-slide>
          <img id="standardUploadImage" src="./standardUploadImage.png" />
        </ion-slide>`
      }
    <ion-item lines="full">
    <ion-grid>
    <ion-row>
        <ion-col
            ><ion-button id="pictureBtn" expand="block" @click="${this.takePhoto}"
              >Ein foto machen</ion-button
            ></ion-col
          >
    </ion-row>
  </ion-grid>
  </ion-item>

    <ion-item lines="full">
      <ion-label position="floating">Name</ion-label>
      <ion-input value="${this.user.name}" type="text" required placeholder="Text eingeben" id="name"></ion-input>
    </ion-item>
    <ion-item lines="full">
      <ion-label position="floating">Email</ion-label>
      <ion-input value="${this.user.email}" type="email" required placeholder="Text eingeben" id="email"></ion-input>
    </ion-item>
    <ion-item lines="full">
      <ion-label position="floating">Passwort</ion-label>
      <ion-input type="password" id="password" placeholder="Text eingeben"></ion-input>
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
      <ion-input type="password" laceholder="Text eingeben" id="password-check"></ion-input>
    </ion-item>
    <ion-item>
      <ion-label>Trainer</ion-label>
      <ion-toggle checked="${this.user.isTrainer}" id="is-trainer" slot="end"></ion-toggle>
    </ion-item>
    <ion-button color="primary" type="button" @click="${this.submit}" expand="block">Update Profile</ion-button>
  </form>
    </ion-content>
  `;
}

async takePhoto() {
  try {
    const photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64
    });
    this.avatar='data:image/jpeg;charset=utf-8;base64,' + photo.base64String!;
  } catch (e) {
    console.warn('User cancelled', e);
  }
}

async submit() {
  if (this.isFormValid()) {
    let accountData = {
      id: this.user.id,
      name: this.nameElement.value,
      email: this.emailElement.value,
      password: !!this.passwordElement.value ? this.passwordElement.value : this.user.password,
      passwordCheck: this.passwordCheckElement.value,
      isTrainer: !!this.isTrainerCheckboxElement.checked ? this.isTrainerCheckboxElement.checked : this.user.isTrainer,
      avatar: this.avatar 
    };

    UserSyncDao.update(accountData);

    notificationService.showNotification('Das Profil wurde geupdated')
    router.navigate('/users');
  } else {
    notificationService.showNotification('Bitte überprüfen Sie ihre eingaben.')
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
  this.passwordProgressBar.value = strength / 100;
  if (strength < 45) {
    this.passwordProgressBar.style.setProperty('--color', '#ff3838'); //red
  } else if (strength >= 45 && strength < 70) {
    this.passwordProgressBar.style.setProperty('--color', '#cef717'); //yellow
  } else {
    this.passwordProgressBar.style.setProperty('--color', '#1ac228'); //green
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

async signout() {
  router.navigate('/users/sign-out');
  notificationService.showNotification('Sie wurden ausgeloggt')
}
}