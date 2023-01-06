/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import { LitElement, html, PropertyValueMap } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { when } from 'lit/directives/when.js';
import { Capacitor } from '@capacitor/core';
import componentStyle from './app.css';
import { IonRouter, RouteTree } from '@ionic/core/components';
import { router } from '../../router/router.js';
import { authenticationService, AuthenticationService } from '../../authenticationService.js';

export type RouteItem = {
  title: string,
  component: string,
  routePath: string,
  authRequired: boolean,
  trainerRequired: boolean,
  props?: { [key: string]: any };
}

@customElement('app-root')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class AppComponent extends LitElement {
  static styles = componentStyle;

  @state() private appTitle = 'Gym+';

  @query('#main') private mainFrame!: HTMLIonContentElement;


  @query('#router') private ionRouter!: IonRouter;

  @state() private routeItems: RouteItem[] = [
    { title: 'Home', routePath: 'home', authRequired: true, trainerRequired: false, component: 'app-home' },
    { title: 'Chat', routePath: 'chats/all', authRequired: true, trainerRequired: false, component: 'app-chat' },
    { title: 'Kurse', routePath: 'course', authRequired: true, trainerRequired: false, component: 'app-course-overview'},
    { title: 'Kurs erstellen', routePath: 'course/create', authRequired: true, trainerRequired: true, component: 'app-create-course' },
    //{ title: 'Meine Kurse', routePath: 'coursebookings', authRequired: true},
    //{ title: 'Meine Workouts', routePath: 'workouts', authRequired: true},
    { title: 'Abmelden', routePath: 'users/sign-out', authRequired: true, trainerRequired: false, component: 'app-sign-out' },
    { title: 'Konto erstellen', routePath: 'users/sign-up', authRequired: false, trainerRequired: false, component: 'app-sign-up' },
    { title: 'Anmelden', routePath: 'users/sign-in', authRequired: false, trainerRequired: false, component: 'app-sign-in' },
  ];

  constructor() {
    super();

    const port = location.protocol === 'https:' ? 3443 : 3000;


    if(Capacitor.isNativePlatform()) {

      httpClient.init({ baseURL: `http://10.0.2.2:${port}/api/` });
    } else {
      httpClient.init({ baseURL: `${location.protocol}//${location.hostname}:${port}/api/` });
    }
  }

  protected firstUpdated(): void {
    console.log(this.ionRouter);
    router.init(this.ionRouter);

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


  buildBody() {
    return html` 
    <ion-app class="toast-wrapper">
    <app-header title="${this.appTitle}" .currentRoute=${this.currentRoute} .routeItems=${this.routeItems}></app-header>
    <app-notification></app-notification>
      <ion-router use-hash="false" id="router" @ionRouteWillChange="${this.setCurrentRoute}">
        <ion-route-redirect from="/" to="users/sign-in"></ion-route-redirect>
        <ion-route url=":" component="app-404-not-found"></ion-route>
        ${this.routeItems.map(route => {
          return html`
          <ion-route url="${route.routePath}" component="${route.component}" .componentProps="${route.props}"></ion-route>
          `;
        })}
        
        ${Capacitor.isNativePlatform() ? html`
        <ion-route component="app-tabs">
            <ion-route url="chats/all" component="app-chats"></ion-route>
            <ion-route url="home" component="app-home"></ion-route>
            <ion-route url="course" component="app-course-overview"></ion-route>
            <ion-route url="course/create" component="app-create-course"></ion-route>
            <ion-route url="course/bookings" component="app-course-bookings"></ion-route>
        </ion-route>
          ` : '' }
      </ion-router>


      <ion-content>
        <ion-router-outlet></ion-router-outlet>
      </ion-content>
    </ion-app>`;
  }
}
