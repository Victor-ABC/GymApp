/* Autor: Victor Corbet */

import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { PageMixin } from '../page.mixin.js';

@customElement('app-tabs')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class TabsComponent extends PageMixin(LitElement) {
  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }

  render() {
    return html` 
    <ion-tabs>
        <ion-tab tab="app-sign-up" component="app-sign-up">
        </ion-tab>
        <ion-tab tab="app-sign-in" component="app-sign-in">
        </ion-tab>
        <ion-tab tab="app-chat-all" component="app-chat-all">
        </ion-tab>
        <ion-tab tab="app-course-overview" component="app-course-overview">
        </ion-tab>
        <ion-tab tab="app-create-course" component="app-create-course">
        </ion-tab>
        <ion-tab-bar slot="bottom">
            <ion-tab-button tab="app-chat-all" href="/chat/all">
                <ion-icon name="home"></ion-icon>
                <ion-label>Aufgaben</ion-label>
            </ion-tab-button>
            <ion-tab-button tab="app-sign-in" href="/users/sign-in">
                <ion-icon name="home"></ion-icon>
                <ion-label>Sign In</ion-label>
            </ion-tab-button>
            <ion-tab-button tab="app-sign-up" href="/users/sign-up">
                <ion-icon name="home"></ion-icon>
                <ion-label>Sign Up</ion-label>
            </ion-tab-button>
            <ion-tab-button tab="app-course-overview" href="/course">
                <ion-icon name="home"></ion-icon>
                <ion-label>Kurse</ion-label>
            </ion-tab-button>
            <ion-tab-button tab="app-create-course" href="/course/create">
                <ion-icon name="home"></ion-icon>
                <ion-label>Kurs erstellen</ion-label>
            </ion-tab-button>
        </ion-tab-bar>
    </ion-tabs>
    `;
  }
}
