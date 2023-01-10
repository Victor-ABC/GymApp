/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import { LitElement, html, PropertyValueMap } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { Capacitor } from '@capacitor/core';
import componentStyle from './app.css';
import { IonHeader, IonRouter, RouteTree } from '@ionic/core/components';
import { router } from '../../router/router.js';
import { authenticationService, AuthenticationService } from '../../authenticationService.js';

import { ChatSyncDao, CourseSyncDao, ExerciseSyncDao, TaskSyncDao, WorkoutSyncDao, MemberInCourseSyncDao, UserSyncDao } from "../../offline/sync-dao";

export type RouteItem = {
  title: string,
  component: string,
  routePath: string,
  authRequired: boolean,
  trainerRequired: boolean,
  props?: { [key: string]: any },
  nativeHeader: boolean,
  inBrowserHeader: boolean
}

@customElement('app-root')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class AppComponent extends LitElement {
  static styles = componentStyle;

  @state() private appTitle = 'Gym+';

  @query('#router') private ionRouter!: IonRouter;

  @state() private routeItems: RouteItem[] = [
    { title: '404 Page', routePath: ':', authRequired: false, trainerRequired: false, component: 'app-404-page', nativeHeader: false, inBrowserHeader: false },

    { title: 'Home', routePath: '/home', authRequired: true, trainerRequired: false, component: 'app-home', nativeHeader: false, inBrowserHeader: true },
    { title: 'Chat', routePath: '/chats/all', authRequired: true, trainerRequired: false, component: 'app-chats', nativeHeader: true, inBrowserHeader: true },

    { title: 'Kurse', routePath: '/course', authRequired: true, trainerRequired: false, component: 'app-course-overview', nativeHeader: true, inBrowserHeader: true },
    { title: 'Kurs erstellen', routePath: '/course/create', authRequired: true, trainerRequired: true, component: 'app-course-create', nativeHeader: true, inBrowserHeader: false },
    { title: 'Kurs Info', routePath: '/course/:id', authRequired: true, trainerRequired: false, component: 'app-course-detail', nativeHeader: true, inBrowserHeader: false },
    { title: 'Kursbuchung Info', routePath: '/coursebookings/:id', authRequired: true, trainerRequired: false, component: 'app-coursebooking-detail', nativeHeader: true, inBrowserHeader: false },

    { title: 'Workout erstellen', routePath: '/workouts/create', authRequired: true, trainerRequired: false, component: 'app-workout-create', nativeHeader: true, inBrowserHeader: false },
    { title: 'Workout erstellen', routePath: '/workouts/create/:userId', authRequired: true, trainerRequired: false, component: 'app-workout-create', nativeHeader: true, inBrowserHeader: false },
    { title: 'Workout durchführen', routePath: '/workouts/do/:id', authRequired: true, trainerRequired: false, component: 'app-workout-do', nativeHeader: true, inBrowserHeader: false },
    { title: 'Workout editieren', routePath: '/workouts/edit/:id', authRequired: true, trainerRequired: false, component: 'app-workout-edit', nativeHeader: true, inBrowserHeader: false },
    { title: 'Workout details', routePath: '/workouts/:id', authRequired: true, trainerRequired: false, component: 'app-workout-detail', nativeHeader: true, inBrowserHeader: false },

    { title: 'Übungen', routePath: '/exercises', authRequired: true, trainerRequired: true, component: 'app-exercise-overview', nativeHeader: false, inBrowserHeader: true },
    { title: 'Übung erstellen', routePath: '/exercises/create', authRequired: true, trainerRequired: true, component: 'app-exercise-create', nativeHeader: true, inBrowserHeader: false },
    { title: 'Übung editieren', routePath: '/exercises/edit/:id', authRequired: true, trainerRequired: true, component: 'app-exercise-edit', nativeHeader: true, inBrowserHeader: false },

    { title: 'Mitglieder', routePath: '/users', authRequired: true, trainerRequired: false, component: 'app-user-overview', nativeHeader: false, inBrowserHeader: true },
    { title: 'Mitglied detials', routePath: '/users/detail/:id', authRequired: true, trainerRequired: false, component: 'app-user-detail', nativeHeader: true, inBrowserHeader: false },
    { title: 'Mitglied editieren', routePath: '/users/edit/:id', authRequired: true, trainerRequired: false, component: 'app-user-edit', nativeHeader: true, inBrowserHeader: false },
    { title: 'Mitglied erstelen', routePath: '/users/create', authRequired: true, trainerRequired: false, component: 'app-user-create', nativeHeader: true, inBrowserHeader: false },
    
    { title: 'Profil', routePath: '/profile', authRequired: true, trainerRequired: false, component: 'app-profile', nativeHeader: true, inBrowserHeader: false },
    { title: 'Abmelden', routePath: '/users/sign-out', authRequired: true, trainerRequired: false, component: 'app-sign-out', nativeHeader: false, inBrowserHeader: true },
    { title: 'Konto erstellen', routePath: '/users/sign-up', authRequired: false, trainerRequired: false, component: 'app-sign-up', nativeHeader: false , inBrowserHeader: true},
    { title: 'Anmelden', routePath: '/users/sign-in', authRequired: false, trainerRequired: false, component: 'app-sign-in', nativeHeader: false, inBrowserHeader: true },
  ];

  constructor() {
    super();

    const port = location.protocol === 'https:' ? 3443 : 3000;

    this.currentRoute = this.routeItems[0];

    if(Capacitor.getPlatform() === 'android') {
      httpClient.init({ baseURL: `http://10.0.2.2:${port}/api/` });
    } else if(Capacitor.getPlatform() === 'ios') {
      httpClient.init({ baseURL: `http://127.0.0.1:${port}/api/` });
    } else if (Capacitor.getPlatform() === 'web') {
      httpClient.init({ baseURL: `${location.protocol}//${location.hostname}:${port}/api/` });
    }
  }

  async firstUpdated(): Promise<void> {
    router.init(this.ionRouter);

    await WorkoutSyncDao.init();
    await TaskSyncDao.init();
    await ExerciseSyncDao.init();
    await CourseSyncDao.init();
    await ChatSyncDao.init();
    await MemberInCourseSyncDao.init();
    await UserSyncDao.init();
  }

  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }

  render() {
    return this.buildBody();
  }

  @state() private currentRoute!: RouteItem;

  setCurrentRoute(e: CustomEvent) {
    this.currentRoute = this.routeItems.find(route => route.routePath === e.detail.to)!;
  }


  applyBackButtion() {
    this.ionRouter.back();
  }

  buildBody() {
    return html` 
    <ion-app class="toast-wrapper">

    ${Capacitor.isNativePlatform() ? `` : html`<app-header id="header" title="${this.appTitle}" .currentRoute=${this.currentRoute} .routeItems=${this.routeItems}></app-header>`}
    
    <app-notification></app-notification>
  
    <ion-router use-hash="false" id="router" @ionRouteWillChange="${this.setCurrentRoute}">
      ${authenticationService.isAuthenticated() ? 
        html`
          <ion-route-redirect from="/" to="users/sign-in"></ion-route-redirect>
        `:
        html`
        <ion-route-redirect from="/" to="home"></ion-route-redirect>
        ` 
      }
      <ion-route-redirect from="/" to="users/sign-in"></ion-route-redirect>
      <ion-route url=":" component="app-404-page"></ion-route>
      <ion-route url="newchat" component="app-chat-new-users"></ion-route>
      <ion-route url="chat/:id/:createdAt/:email/:name" component="app-chat"></ion-route>
      <ion-route url="course/:id" component="app-course-detail"></ion-route>
      <ion-route url="coursebookings/:id" component="app-coursebooking-detail"></ion-route>

      ${this.routeItems.map(route => {
        return html`
        <ion-route url="${route.routePath}" component="${route.component}" .componentProps="${route.props}"></ion-route>
        `;
      })}
      

      ${Capacitor.isNativePlatform() ? html`
      <ion-route component="app-tabs">
          <ion-route url="chat/:id/:createdAt/:email/:name" component="app-chat"></ion-route>
          <ion-route url="newchat" component="app-chat-new-users"></ion-route>
          <ion-route url="chats/all" component="app-chats"></ion-route>
          <ion-route url="home" component="app-home"></ion-route>
          <ion-route url="course" component="app-course-overview"></ion-route>
          <ion-route url="course/create" component="app-course-create"></ion-route>
          <ion-route url="course/bookings" component="app-course-bookings"></ion-route>
      </ion-route>
    ` : ``}

    </ion-router>

    ${(Capacitor.isNativePlatform() && this.currentRoute.nativeHeader) ? html`
      <ion-header id="header">
        <ion-toolbar>
        <ion-button @click="${this.applyBackButtion}" id="backButton" slot="start" fill="clear">
        <ion-icon slot="icon-only" name="arrow-back-outline"></ion-icon>
        </ion-button>
          <ion-title>${this.currentRoute!.title}</ion-title>
        </ion-toolbar>
      </ion-header>
    ` : ``}

      <div class="container">
        <ion-content class="ion-padding">
          <ion-router-outlet></ion-router-outlet>
        </ion-content>
      </div>
    </ion-app>`;
  }
}
