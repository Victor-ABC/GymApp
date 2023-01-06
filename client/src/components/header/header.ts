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
          if(!authenticationService.isAuthenticated()){
            return routeItem.inBrowserHeader == true && routeItem.authRequired == false
          }
          else if(!authenticationService.isTrainer()){
            return routeItem.inBrowserHeader == true && routeItem.authRequired == true && routeItem.trainerRequired == false
          }
          else{
            return routeItem.inBrowserHeader == true && routeItem.authRequired == true
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
