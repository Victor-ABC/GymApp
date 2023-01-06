/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { authenticationService } from '../../authenticationService';
import componentStyle from './header.css';
import { RouteItem } from '../app/app';

@customElement('app-header')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class HeaderComponent extends LitElement {
  static styles = componentStyle;

  @property() title = '';

  @property({ type: Array }) routeItems: RouteItem[] = [];

  @property() private currentItem!: RouteItem;

  @state() menuOpen = false; 

  render() {
    return html`
      <a href="" class="title">${this.title}</a>
      <span class="menu-button" @click="${this.toggleMenu}"></span>
      <ol ?open=${this.menuOpen}>
        ${this.routeItems.filter(routeItem => {
          if(routeItem.authRequired != authenticationService.isAuthenticated()) {
            console.log('not Authenticated')
            return false;
          }

          if(routeItem.trainerRequired != authenticationService.isTrainer()) {

            console.log('not a trainer')
            return false;
          }

          return true;
        })
        .map(
          routeItem => html`<li><a href="${routeItem.routePath}" @click=${this.closeMenu}>${routeItem.title}</a></li>`
        )}
      </ol>
    `;
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }
}
