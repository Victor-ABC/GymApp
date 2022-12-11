/* Autor: Henrik Bruns */
import { Capacitor } from '@capacitor/core';
import { IonInputCustomEvent } from '@ionic/core';
import { LitElement, html } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';

@customElement('app-create-course')
class CreateCourseComponent extends PageMixin(LitElement){

/* Klasse für die Erstellung eines neuen Kurses durch einen Trainer
*/

    @query('form') private form!: HTMLFormElement;
    @query('#name > input') private nameElement!: HTMLInputElement;
    @query('#dayOfWeek > select') private dayOfWeekElement!: HTMLSelectElement;

    @query('#startTimeHours > input') private startTimeHoursElement!: HTMLInputElement;
    @query('#startTimeMinutes > input') private startTimeMinutesElement!: HTMLInputElement;
    @query('#endTimeHours > input') private endTimeHoursElement!: HTMLInputElement;
    @query('#endTimeMinutes > input') private endTimeMinutesElement!: HTMLInputElement;
    @query('#startKW > input') private startKWElement!: HTMLInputElement;
    @query('#startJahr > input') private startJahrElement!: HTMLInputElement;
    @query('#endKW > input') private endKWElement!: HTMLInputElement;
    @query('#endJahr > input') private endJahrElement!: HTMLInputElement;


    render() {
        return html`${when(
          Capacitor.isNativePlatform(),
          () => html`<ion-content>${this.buildBody()}</ion-content>`,
          () => this.buildBody()
        )}`;
    }

    buildBody(){
        return html `
            ${this.renderNotification()}
            <h1>Kurs erstellen</h1>
            <form>
                <ion-item>
                    <ion-label position="floating">Kursname</ion-label>
                    <ion-input type="text" required placeholder="Kursnamen vergeben" id="name"></ion-input>
                </ion-item>
            </form>
        `;
    }
}