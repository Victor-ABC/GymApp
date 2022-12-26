/* Autor: Pascal Thesing (FH Münster) */

import { LitElement, html } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { PageMixin } from '../page.mixin.js';
import { authenticationService } from '../../authenticationService.js';
import { router } from '../../router/router.js';

import componentStyle from './home.css';

interface User {
    name: string;
    email: string;
    avatar: string | null
}

interface Workout {
    name: string
}

@customElement('app-home')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class HomeComponent extends PageMixin(LitElement) {
  static styles = [componentStyle];

  @state() private myWorkouts: Workout[] = [];


  @state() private user: object = {};

  async firstUpdated() {
      this.user = authenticationService.getUser();
  }

  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }

  render() {
    return this.buildBody();
  }

  buildBody() {
    return html`
      <ion-content class="ion-padding">

        <ion-card>
            <ion-card-header>
                <ion-card-title>Willkommen zurück ${this.user.name} <img src="data:image/png;base64, ${this.user.avatar}"></ion-card-title> 
            </ion-card-header>
            <ion-card-content>
            </ion-card-content>
        </ion-card>

        <ion-card>
            <ion-card-header>
              <ion-row class="ion-justify-content-between ion-align-items-center">
              <ion-col>
              <ion-card-title>Deine Kurse:</ion-card-title>
              </ion-col>
              <ion-col size="auto">

              <ion-button>
              <ion-icon slot="icon-only" name="add"></ion-icon>
              </ion-button>
              </ion-col>
              </ion-row>
            </ion-card-header>
            <ion-card-content>
            </ion-card-content>
        </ion-card>

        <ion-card>
        <ion-card-header>
          <ion-row class="ion-justify-content-between ion-align-items-center">
          <ion-col>
          <ion-card-title>Deine Workouts:</ion-card-title>
          </ion-col>
          <ion-col size="auto">

          <ion-button @click="${this.openCreateWorkout}">
          <ion-icon slot="icon-only" name="add"></ion-icon>
          </ion-button>
          </ion-col>
          </ion-row>
        </ion-card-header>


          <ion-card-content>
          </ion-card-content>
        </ion-card>
      </ion-content>
    `;
  }

  openCreateWorkout() {
    router.navigate('workouts/create');
  }
}
