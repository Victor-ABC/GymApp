/* Autor: Victor Corbet */

import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
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
        <ion-tab tab="tab-settings">
            <ion-nav></ion-nav>
        </ion-tab>
        <ion-tab tab="tab-project-list">
            <ion-nav></ion-nav>
        </ion-tab>
        <ion-tab tab="tab-my-activities">
            <ion-nav></ion-nav>
        </ion-tab>
        <ion-tab-bar slot="bottom">
            <ion-tab-button tab="tab-my-activities" href="/activities">
                <ion-icon name="home"></ion-icon>
                <ion-label>Aufgaben</ion-label>
            </ion-tab-button>
            <ion-tab-button tab="tab-project-list" href="/projects">
                <ion-icon name="home"></ion-icon>
                <ion-label>Aufgaben</ion-label>
            </ion-tab-button>
            <ion-tab-button tab="tab-settings" href="/settings">
                <ion-icon name="settings-outline"></ion-icon>
                <ion-label>Aufgaben</ion-label>
            </ion-tab-button>
        </ion-tab-bar>
    </ion-tabs>
    `;
  }
}
