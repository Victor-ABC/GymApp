/* Autor: Pascal Thesing (FH Münster) */

import { LitElement, html } from 'lit';

import { customElement, property, state, query } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';
import { notificationService } from '../../notification.js'
import { repeat } from 'lit/directives/repeat.js';

import componentStyle from './workout-detail.css';

@customElement('app-workout-detail')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class HomeComponent extends PageMixin(LitElement) {
  static styles = componentStyle;

  @property() id = '';

  @state() private workout: object = {};

  @state() private exercises: object[] = [];

  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }

  render() {
    return this.buildBody();
  }

  async firstUpdated() {
      const workoutResponse = await httpClient.get('/workouts/' + this.id);
      this.workout = (await workoutResponse.json()).data; 

      const response = await httpClient.get('/exercises/workout/' + this.id);
      this.exercises = (await response.json()).results; 
  }

  buildBody() {
    return html`
      <ion-content class="ion-padding">
        <h1>Workout detail: ${this.workout.name}</h1>

        ${repeat(
          this.exercises,
          (exercise, index) => html`
          <ion-card>
          <ion-card-content>
              <ion-item>
              <ion-label>${exercise.name}</ion-label>
              </ion-item>
          </ion-card-content>
          </ion-card>                  
          `
      )}

      <ion-row>
        <ion-col>
            <ion-button @click="${this.doTraining}" color="primary" type="button" expand="block">Training starten</ion-button>
        </ion-col>
      </ion-row>
      <ion-row>
        <ion-col>
            <ion-button color="secondary" type="button" expand="block">Training frotsetzen</ion-button>
        </ion-col>
      </ion-row>
      <ion-row>
        <ion-col>
            <ion-button @click="${this.onEditTraining}" color="warning" type="button" expand="block">Training bearbeiten</ion-button>
        </ion-col>
      </ion-row>
      </ion-content>
    `;
  }

  onEditTraining() {
    router.navigate('workouts/edit/'+ this.workout.id);
  }

  doTraining() {
    router.navigate('workouts/do/'+ this.workout.id);
  }
}
