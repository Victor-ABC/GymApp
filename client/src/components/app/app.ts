/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import { LitElement, html } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { router } from '../../router/router.js';
import { httpClient } from '../../http-client.js';
import { when } from 'lit/directives/when.js';
import { Capacitor } from '@capacitor/core';
import componentStyle from './app.css';

@customElement('app-root')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class AppComponent extends LitElement {
  static styles = componentStyle;

  @state() private appTitle = 'Gym+';

  @query('#main') private mainFrame!: HTMLIonContentElement;

  @state() private linkItems = [
    { title: 'Home', routePath: 'home', authRequired: true },
    { title: 'Chat', routePath: 'chats/all', authRequired: true },
    { title: 'Kurse', routePath: 'course', authRequired: true },
    { title: 'Kurs erstellen', routePath: 'course/create', authRequired: true },
    //{ title: 'Meine Kurse', routePath: 'coursebookings', authRequired: true},
    //{ title: 'Meine Workouts', routePath: 'workouts', authRequired: true},
    { title: 'Abmelden', routePath: 'users/sign-out', authRequired: true },
    { title: 'Konto erstellen', routePath: 'users/sign-up', authRequired: false },
    { title: 'Anmelden', routePath: 'users/sign-in', authRequired: false },
  ];

  constructor() {
    super();
    const port = location.protocol === 'https:' ? 3443 : 3000;

    if(Capacitor.isNativePlatform()) {
      httpClient.init({ baseURL: `${location.protocol}//${location.hostname}:${port}/api/` });
    } else {
      httpClient.init({ baseURL: `http://10.0.2.2:3000/api/` });
    }
  }

  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }

  firstUpdated() {
    router.subscribe(() => this.requestUpdate());
  }

  renderRouterOutlet() {
    return router.select(
      {
        'home': () => html`<app-home></app-home>`,
        'chats/all': () => html`<app-chats></app-chats>`,
        'chat/:id': params => html`<app-chat .id=${params.id}></app-chat>`,
        'course': () => html`<app-course-overview></app-course-overview>`,
        'course/create': () => html`<app-create-course></app-create-course>`,
        'course/:id': params => html`<app-course-detail .id=${params.id}></app-course-detail>`,
        'coursebookings': () => html`<app-course-bookings></app-course-bookings>`,
        'coursebookings/:id': params => html`<app-coursebooking-detail .id=${params.id}></app-coursebooking-detail>`,
        'workouts/create': () => html`<app-create-workout></app-create-workout>`,
        'workouts/edit/:id': params => html`<app-edit-workout .id=${params.id}></app-create-workout>`,
        'workouts/do/:id': params => html`<app-do-workout .id=${params.id}></app-do-workout>`,
        'workouts/:id': params => html`<app-workout-detail .id=${params.id}></app-workout-detail>`
      },
      {
        'users/sign-in': () => html`<app-sign-in></app-sign-in>`,
        'users/sign-up': () => html`<app-sign-up></app-sign-up>`,
        'users/sign-out': () => html`<app-sign-out></app-sign-out>`,
      },
      () => html`<app-overlay></app-overlay>`,
    );
  }
  /*
    Diese Methode sorgt dafür, dass 
    alle Seiten (=Custom-Elements/Lit-Elements) richtig angezeigt werden.
    -> alle haben die höhe Max
    -> alle haben die Breite 7/12 vom Bildschirm (immer responsiv)
  */
  buildBrowser() {
    return html`
      <app-header title="${this.appTitle}" .linkItems=${this.linkItems}></app-header>
      <app-notification id='notification'></app-notification>
      <div class="container">
          ${this.renderRouterOutlet()}
      </div>
    `;
  }

  render() {
    var isNative = Capacitor.isNativePlatform();
    //For Testing Smartphone and Browser without using AndroidStudio + Capacitor
    //isNative = true;  
    return html`${when(
      isNative,
      () => this.buildMobile(),
      () => this.buildBrowser()
    )}`;
  }

  buildMobile() {
    return html` 
    <app-notification></app-notification>
    <ion-app class="toast-wrapper">
      <ion-router use-hash="false">
        <ion-route-redirect from="/" to="users/sign-in"></ion-route-redirect>
        <ion-route url="chat/:id" component="app-chat"></ion-route>
        <ion-route component="app-tabs">
          <ion-route url="users/sign-in" component="app-sign-in"></ion-route>
          <ion-route url="users/sign-up" component="app-sign-up"></ion-route>
          <ion-route url="chats/all" component="app-chats"></ion-route>
          <ion-route url="course" component="app-course-overview"></ion-route>
          <ion-route url="course/create" component="app-create-course"></ion-route>
          <ion-route url="course/bookings" component="app-course-bookings"></ion-route>
      </ion-router>
      <ion-nav root="app-sign-up"></ion-nav>
    </ion-app>`;
  }
}
