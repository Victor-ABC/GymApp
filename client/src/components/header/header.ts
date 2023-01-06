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

  @property() private currentRoute!: RouteItem;

  @state() menuOpen = false; 

  render() {
    return html`
      <a class="title">${this.title}</a>
      <span class="menu-button" @click="${this.toggleMenu}"></span>
      <ol ?open=${this.menuOpen}>
        ${this.routeItems.filter(routeItem => {
          if(!authenticationService.isTrainer()){
            return routeItem.authRequired == authenticationService.isAuthenticated() && routeItem.routePath != 'course/create'
          }
          else{
            return routeItem.authRequired == authenticationService.isAuthenticated()
          }
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
