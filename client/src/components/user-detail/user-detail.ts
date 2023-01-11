/* Autor: Pascal Thesing */

import { LitElement, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';
import { notificationService } from '../../notification.js'
import { authenticationService } from '../../authenticationService.js';
import { Camera, CameraResultType } from '@capacitor/camera';
import { MemberInCourseSyncDao, UserSyncDao, WorkoutSyncDao } from '../../offline/sync-dao.js';
import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { thumbsUpSharp } from 'ionicons/icons';
import { repeat } from 'lit/directives/repeat.js';

@customElement('app-user-detail')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class UserDetailComponent extends LitElement {

    @state() private avatar!: string;
  
  
    @state() private user: Object = {}

    @state() private myWorkouts: Object[] = [];
    @state() private myCourseBookings: Object[] = [];
  
  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }
  
  async firstUpdated() {
    this.user = await UserSyncDao.findOne({id: this.id});
    this.avatar = this.user.avatar;

    this.myCourseBookings = await MemberInCourseSyncDao.findAll();
    this.myWorkouts = await WorkoutSyncDao.findAll({createdBy: this.id});

  }
  
  render() {
    return html`
      <ion-content class="ion-padding">
        <ion-card>
            <ion-card-header>
                <ion-card-title class="home-header">
                  User: ${this.user.name} <ion-avatar class="userAvatar"><img src="${this.avatar ?? './avatar.png'}"></ion-avatar>
                </ion-card-title> 
            </ion-card-header>
        </ion-card>

        ${Capacitor.isNativePlatform() ? 
          html`
            ${this.buildCourseContent()}
            ${this.buildWorkoutContent()}
          `: html`
            <ion-grid class="home-grid">
            <ion-row>
              <ion-col class="home-col--left">
                ${this.buildCourseContent()}
              </ion-col>
              <ion-col class="home-col--right">
                ${this.buildWorkoutContent()}
                </ion-col>
              </ion-row>
            </ion-grid>
          `}
      </ion-content>
    `;
  }


  buildCourseContent() {
    return html`
      <ion-card>
        <ion-card-header>
          <ion-row class="ion-justify-content-between ion-align-items-center">
            <ion-col>
              <ion-card-title>Gebuchten Kurse:</ion-card-title>
            </ion-col>
          </ion-row>
        </ion-card-header>
        <ion-card-content>
        ${this.myCourseBookings.length === 0 ?
          html`<div class="no-content">Du hast momentan keine Kurse gebucht</div>` : html`
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
          `}
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
              <ion-card-title>Workouts:</ion-card-title>
            </ion-col>
            <ion-col size="auto">
              <ion-button @click="${this.openCreateWorkout}">
                <ion-icon slot="icon-only" name="add"></ion-icon>
              </ion-button>
            </ion-col>
          </ion-row>
        </ion-card-header>

        <ion-card-content>
        ${this.myWorkouts.length === 0 ?
          html`<div class="no-content">Du hast momentan keine Training gebucht</div>` : html`
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
                    Editieren
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
            </ion-list>
            `}
        </ion-card-content>
      </ion-card>
    `
  }

  openCreateWorkout() {
    router.navigate('workouts/create/' + this.id);
  }

  async deleteWorkout(workoutId: string) {
    await WorkoutSyncDao.delete(workoutId);
    
    await this.firstUpdated();
    this.requestUpdate();
  }

  async deleteCourseBooking(bookingId: string) {
    await MemberInCourseSyncDao.delete(bookingId);
    await this.firstUpdated();
    this.requestUpdate();
  }

  openWorkout(workoutId: string) {
    router.navigate(`/workouts/edit/${workoutId}`);
  }

  openCourse(courseBookingId: string) {
    router.navigate(`coursebookings/${courseBookingId}`);
  }
}