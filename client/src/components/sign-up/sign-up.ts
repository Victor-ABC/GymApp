/* Autor: Victor Corbet*/

import { LitElement, html } from 'lit';
import { customElement, query, property } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';
//Json for all Text -> All Text at 1 place.
import text from './text.json';

import sharedStyle from '../shared.css';
import componentStyle from './sign-up.css';

@customElement('app-sign-up')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class SignUpComponent extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];

  @query('#password-strength')
  displayPasswordStrengthElement!: HTMLDivElement;

  @query('#problems')
  allProblems!: HTMLDivElement;

  @query('#password')
  inputOfPasswordElement!: HTMLInputElement;

  @property()
  isFirstinputOfPasswordElement = true;


  @query('form') private form!: HTMLFormElement;

  @query('#name') private nameElement!: HTMLInputElement;

  @query('#email') private emailElement!: HTMLInputElement;

  @query('#password') private passwordElement!: HTMLInputElement;

  @query('#password-check') private passwordCheckElement!: HTMLInputElement;

  //<app-pwt></app-pwt>

  async firstUpdated() {
    this.inputOfPasswordElement.addEventListener('input', () => {
      this.computeStrengthOfPasswordAgain();
    });
  }

  render() {
    return html`
    <ion-content>
            ${this.renderNotification()}
      <h1>Konto erstellen</h1>
      <form novalidate>
        <div>
          <label for="name">Name</label>
          <input type="text" autofocus required id="name" />
          <div class="invalid-feedback">Name ist erforderlich</div>
        </div>
        <div>
          <label for="email">E-Mail</label>
          <input type="email" required id="email" />
          <div class="invalid-feedback">E-Mail ist erforderlich und muss gültig sein</div>
        </div>
        <div>
          <label for="password">Passwort</label>
          <input type="password" required minlength="10" id="password" />
          <div id="password-strength" class="password-strength"></div>
          <div id="problems" class="problems"></div>
          <div class="invalid-feedback">Passwort ist nicht komplex genug</div>
        </div>
        <div>
          <label for="password-check">Passwort nochmals eingeben</label>
          <input type="password" required minlength="10" id="password-check" @focus="${this.removeValueFrominputOfPasswordElementElement}"/>
          <div class="invalid-feedback">
            Erneute Passworteingabe ist erforderlich und muss mit der ersten Passworteingabe übereinstimmen
          </div>
        </div>
        <button type="button" @click="${this.submit}">Konto erstellen</button>
      </form>
    </ion-content>

    `;
  }


  removeValueFrominputOfPasswordElementElement() {
    if (this.isFirstinputOfPasswordElement) {
      this.isFirstinputOfPasswordElement = false;
      this.inputOfPasswordElement.value = '';
    }
  }

  computeStrengthOfPasswordAgain() {
    const errors = this.computeStrengthOfPassword(this.inputOfPasswordElement.value);
    let strength = 100;
    this.allProblems.innerHTML = '';

    errors.forEach(errors => {
      if (errors == null) return;
      strength -= errors.punishment;
      const errorMessageElement = document.createElement('p');
      errorMessageElement.innerText = errors.errorMessage;
      this.allProblems.appendChild(errorMessageElement);
    });
    this.displayPasswordStrengthElement.style.setProperty('--passwordStrength', String(strength));
    if (strength < 45) {
      this.displayPasswordStrengthElement.style.setProperty('--passwordStrength_color', 'red');
    } else if (strength >= 45 && strength < 70) {
      this.displayPasswordStrengthElement.style.setProperty('--passwordStrength_color', 'yellow');
    } else {
      this.displayPasswordStrengthElement.style.setProperty('--passwordStrength_color', 'green');
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
  /*
    Todo: auch in json auslageer
  */
    lowercaseError(password: string) {
      return this.genericErrorFinder(password, /[a-z]/g, text.passwordRequirements.lowerCase);
    }
    uppercaseError(password: string) {
      return this.genericErrorFinder(password, /[A-Z]/g, text.passwordRequirements.upperCase);
    }
    numberError(password: string) {
      return this.genericErrorFinder(password, /[0-9]/g, text.passwordRequirements.numbers);
    }
    specialCharactersError(password: string) {
      return this.genericErrorFinder(password, /[^0-9a-zA-Z\s]/g, text.passwordRequirements.specialLetters);
    }

  genericErrorFinder(password: string, regex: RegExp, requirement: string) {
    const matches = password.match(regex) || [];
    //1/2 -> bad
    if (matches.length == 1) {
      return {
        errorMessage: text.passwordRequirements.doesOnlyHaveOne + requirement,
        punishment: 10
      };
    }
    //0/2 -> worse
    if (matches.length == 0) {
      return {
        errorMessage: text.passwordRequirements.doesNotHave + requirement,
        punishment: 15
      };
    }
  }
  reapeatCharactersError(password: string) {
    const matches = password.match(/(.)\1/g) || [];
    if (matches.length > 0) {
      return {
        errorMessage: text.passwordRequirements.noDublicateChars,
        punishment: matches.length * 10
      };
    }
  }
  lenghtProblem(password: string) {
    const length = password.length;
    if (length <= 4) {
      return {
        errorMessage: text.passwordRequirements.toShortSmallLength,
        punishment: 40
      };
    }
    if (length < 10) {
      return {
        errorMessage: text.passwordRequirements.toShortMediumLenghth,
        punishment: 25
      };
    }
  }

  async submit() {
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
    if (this.passwordElement.value !== this.passwordCheckElement.value) {
      this.passwordCheckElement.setCustomValidity(text.passwordRequirements.equalityToPasswordCheck);
    } else {
      this.passwordCheckElement.setCustomValidity('');
    }
    return this.form.checkValidity();
  }
}
