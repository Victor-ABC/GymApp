/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { authenticationService } from '../../authenticationService';
import componentStyle from './header.css';
import { RouteItem } from '../app/app';
import { router } from '../../router/router';

@customElement('app-header')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class HeaderComponent extends LitElement {
  static styles = componentStyle;

  @property() title = '';

  @property({ type: Array }) routeItems: RouteItem[] = [];

  @property() private currentRoute!: RouteItem;

  @state() menuOpen = false; 

  render() {
    return html`
      <a class="title">${this.title}</a>
      <span class="menu-button" @click="${this.toggleMenu}"></span>
      <ol ?open=${this.menuOpen}>
        ${this.routeItems.filter(routeItem => {
          if(routeItem.authRequired !== authenticationService.isAuthenticated()) {
            return false;
          }

          if(routeItem.trainerRequired == true && !authenticationService.isTrainer()) {
            return false;
          }

          return routeItem.inBrowserHeader;
        })
        .map(
          routeItem => html`<li><a @click="${() => this.navigate(routeItem.routePath)}">${routeItem.title}</a></li>`
        )}
      </ol>
    `;
  }

  navigate(route) {
    this.menuOpen = false;
    router.navigate(route);
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
}
