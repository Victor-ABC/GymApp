/* Autor: Victor Corbet */

import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { PageMixin } from '../page.mixin.js';
import { authenticationService } from '../../authenticationService.js';

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
        <ion-tab tab="app-home" component="app-home">
        </ion-tab>
        <ion-tab tab="app-sign-in" component="app-sign-in">
        </ion-tab>
        <ion-tab tab="app-chats" component="app-chats">
        </ion-tab>
        <ion-tab tab="app-course-overview" component="app-course-overview">
        </ion-tab>
        <ion-tab tab="app-course-create" component="app-course-create">
        </ion-tab>
        <ion-tab tab="app-course-bookings" component="app-course-bookings">
        </ion-tab>
        </ion-tab>
        <ion-tab tab="app-course-create" component="app-course-create">
        </ion-tab>
        <ion-tab tab="app-profile" component="app-profile">
        </ion-tab>
        ${authenticationService.isAuthenticated() ?
            html`
            <ion-tab-bar slot="bottom">
            <ion-tab-button tab="app-home" href="/home">
                <ion-icon name="home"></ion-icon>
                <ion-label>Home</ion-label>
            </ion-tab-button>
            <ion-tab-button tab="app-chats" href="/chats/all">
                <ion-icon name="chatbubble-outline"></ion-icon>
                <ion-label>Chat</ion-label>
            </ion-tab-button>
            <ion-tab-button tab="app-course-overview" href="/course">
                <ion-icon name="calendar-outline"></ion-icon>
                <ion-label>Kurse</ion-label>
            </ion-tab-button>
            <ion-tab-button tab="app-profile" href="/profile">
              <ion-icon name="person-outline"></ion-icon>
              <ion-label>Profile</ion-label>
            </ion-tab-button>
        </ion-tab-bar>
        ` : html``
          }
    </ion-tabs>
    `;
  }
}
