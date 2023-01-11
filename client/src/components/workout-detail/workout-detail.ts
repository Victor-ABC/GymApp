/* Autor: Pascal Thesing (FH Münster) */

import { LitElement, html } from 'lit';

import { customElement, property, state, query } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';
import { notificationService } from '../../notification.js'
import { repeat } from 'lit/directives/repeat.js';
import { Capacitor } from '@capacitor/core';
import { TaskSyncDao, WorkoutSyncDao, ExerciseSyncDao } from "./../../offline/sync-dao";

@customElement('app-workout-detail')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class HomeComponent extends PageMixin(LitElement) {
  @property() id = '';

  @state() private workout: object = {};

  @state() private exercises: object[] = [];

  @state() tasks: object[] = []

  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }

  render() {
    return this.buildBody();
  }

  async firstUpdated() {
      this.workout = await WorkoutSyncDao.findOne({id: this.id});

      this.tasks = await TaskSyncDao.findAll();

      this.exercises = await ExerciseSyncDao.findAll({workoutId: this.id}); 
  }

  getNameByTaskId(taskId) {
    return this.tasks.filter(task => task.id == taskId)[0].name;
  }

  getPicturesByTaskId(taskId) {
    return this.tasks.filter(task => task.id == taskId)[0].pictures;
  }

  buildBody() {
    return html`
      <ion-content class="ion-padding">
        <h1>Workout detail: ${this.workout.name}</h1>

        <ion-card>
        <ion-card-content>
        <ion-list>
        ${repeat(
          this.exercises,
          (exercise, index) => html`

          <ion-item>
          <ion-thumbnail slot="start">

          ${this.getPicturesByTaskId(exercise.taskId)!.length == 0
            ? html` <ion-slide>
                <img src="https://ionicframework.com/docs/img/demos/thumbnail.svg" />
              </ion-slide>`
            : html`        
            <img src="${this.getPicturesByTaskId(exercise.taskId)[0]}" />
            `
            }
          </ion-thumbnail>

            <ion-label>${this.getNameByTaskId(exercise.taskId)}</ion-label>
          </ion-item>
              
          `
      )}
      </ion-list>
      </ion-card-content>
      </ion-card>    

      <ion-row>
        <ion-col>
            <ion-button @click="${this.doTraining}" color="primary" type="button" expand="block">Training starten</ion-button>
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
