/* Autor: Henrik Bruns */
import { Capacitor } from '@capacitor/core';
import { IonInputCustomEvent } from '@ionic/core';
import { LitElement, html } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';

/* Basisklasse für die Kurse im Fitnessstudio. Hier sollen folgende Funktionen abgebildet werden:
    - Übersicht aller angebotenen Kurse (Darstellung in Cards)
    - Anmeldung/Abmeldung eines Nutzers für einen Kurs (Bspw. Button am Kurs "Anmelden"/"Abmelden")
*/

@customElement('app-course-overview')
class CourseOverviewComponent extends PageMixin(LitElement){

    render() {
        return html`${when(
          Capacitor.isNativePlatform(),
          () => html`<ion-content>${this.buildBody()}</ion-content>`,
          () => this.buildBody()
        )}`;
    }

    buildBody(){
        return html `
            <h1>Hello Course Overview</h1>
        `;
    }
}