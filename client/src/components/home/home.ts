/* Autor: Pascal Thesing (FH Münster) */

import { LitElement, html } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { PageMixin } from '../page.mixin.js';
import { authenticationService } from '../../authenticationService.js';
import { router } from '../../router/router.js';
import { httpClient } from '../../http-client.js';
import { repeat } from 'lit/directives/repeat.js';

import componentStyle from './home.css';
import { Capacitor } from '@capacitor/core';

interface User {
    name: string;
    email: string;
    avatar: string | null
}

interface CourseBooking {
  id: string;
  courseId: string;
  name: string;
  dayOfWeek: string;
  startTime: string;
  bookingId: string;
}

interface Workout {
    name: string
}

@customElement('app-home')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class HomeComponent extends PageMixin(LitElement) {
  static styles = [componentStyle];

  @state() private myWorkouts: Workout[] = [];
  @state() private myCourseBookings: CourseBooking[] = [];


  @state() private user: object = {};

  async firstUpdated() {
      this.user = authenticationService.getUser();

  
      const responseBookings = await httpClient.get('/memberincourses');
      this.myCourseBookings = (await responseBookings.json()).results;

      const responseWorkouts = await httpClient.get('workouts');
      this.myWorkouts = (await responseWorkouts.json()).results;
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
                <ion-card-title>
                  Willkommen zurück ${this.user.name} <ion-avatar class="userAvatar"><img src="data:image/png;base64, ${this.user.avatar}"></ion-avatar>
                </ion-card-title> 
            </ion-card-header>
        </ion-card>

        ${Capacitor.isNativePlatform() ? 
          html`
            ${this.buildCourseContent()}
            ${this.buildWorkoutContent()}
          `: html`
            <ion-grid>
              <ion-row>
                <ion-col>
                  ${this.buildCourseContent()}
                </ion-col>
                <ion-col>
                  ${this.buildWorkoutContent()}
                </ion-col>
              </ion-row>
            </ion-grid>
          `}
      </ion-content>
    `;
  }

  openCreateWorkout() {
    router.navigate('workouts/create');
  }

  openCreateCourse() {
    router.navigate('course');
  }

  async deleteWorkout(workoutId: string) {
    await httpClient.delete(`workouts/${workoutId}`);
    await this.firstUpdated();
    this.requestUpdate();
  }

  async deleteCourseBooking(bookingId: string) {
    await httpClient.delete('/memberincourses/' + bookingId);
    await this.firstUpdated();
    this.requestUpdate();
  }

  openWorkout(workoutId: string) {
    router.navigate(`workouts/${workoutId}`);
  }

  openCourse(courseBookingId: string) {
    router.navigate(`coursebookings/${courseBookingId}`);
  }

  buildCourseContent() {
    return html`
      <ion-card>
        <ion-card-header>
          <ion-row class="ion-justify-content-between ion-align-items-center">
            <ion-col>
              <ion-card-title>Deine gebuchten Kurse:</ion-card-title>
            </ion-col>
            <ion-col size="auto">
              <ion-button @click="${this.openCreateCourse}">
                <ion-icon slot="icon-only" name="add"></ion-icon>
              </ion-button>
            </ion-col>
          </ion-row>
        </ion-card-header>
        <ion-card-content>
          <ion-list>
            ${repeat(
              this.myCourseBookings,
              course => course.id,
              course => html`
                <ion-item-sliding>
                  <ion-item button="true">
                    <ion-thumbnail slot="start">
                      <img alt="Silhouette of mountains" src="https://ionicframework.com/docs/img/demos/thumbnail.svg" />
                    </ion-thumbnail>
                    <ion-label>${course.name} | ${course.dayOfWeek}s, Start: ${course.startTime} Uhr</ion-label>

                    <ion-button fill="clear" @click="${() => this.openCourse(course.bookingId)}">Open</ion-button>
                    <ion-button fill="clear" id="click-trigger-${course.bookingId}">
                      <ion-icon slot="icon-only" name="menu-sharp"></ion-icon>
                    </ion-button>
                    <ion-popover trigger="click-trigger-${course.bookingId}" trigger-action="click" show-backdrop="false">
                      <ion-list mode="ios">
                        <ion-item button="true" detail="false" @click="${() => this.deleteCourseBooking(course.bookingId)}" color="danger">Buchung stornieren</ion-item>
                      </ion-list>
                    </ion-popover>
                  </ion-item>

                  <ion-item-options side="end">
                    <ion-item-option color="danger" @click="${() => this.deleteCourseBooking(course.bookingId)}">
                      <ion-icon slot="icon-only" name="trash"></ion-icon>
                    </ion-item-option>
                  </ion-item-options>

                </ion-item-sliding>
              `
            )}
          </ion-list>
        </ion-card-content>
      </ion-card>
    `
  }

  buildWorkoutContent() {
    return html`
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
          <ion-list>
            ${repeat(
              this.myWorkouts,
              workout => workout.id,
              workout => html`
              <ion-item-sliding>
                <ion-item button="true">
                  <ion-thumbnail slot="start">
                    <img alt="Silhouette of mountains" src="https://ionicframework.com/docs/img/demos/thumbnail.svg" />
                  </ion-thumbnail>
                  <ion-label>${workout.name}</ion-label>

                  <ion-button fill="clear" @click="${() => this.openWorkout(workout.id)}">
                    Open
                  </ion-button>
                  <ion-button fill="clear" id="click-trigger-${workout.id}">
                    <ion-icon slot="icon-only" name="menu-sharp"></ion-icon>
                  </ion-button>
                  <ion-popover trigger="click-trigger-${workout.id}" trigger-action="click" show-backdrop="false">

                    <ion-list mode="ios">
                    <ion-item button="true" detail="false" @click="${() => this.deleteWorkout(workout.id)}" color="danger">Löschen</ion-item>
                    </ion-list>

                  </ion-popover>
                </ion-item>

                <ion-item-options side="end">
                  <ion-item-option color="danger" @click="${() => this.deleteWorkout(workout.id)}">
                    <ion-icon slot="icon-only" name="trash"></ion-icon>
                  </ion-item-option>
                </ion-item-options>
              </ion-item-sliding>                     
              `
            )}
        </ion-card-content>
      </ion-card>
    `
  }

}
