/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import componentStyle from './header.css';

@customElement('app-header')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class HeaderComponent extends LitElement {
  static styles = componentStyle;

  @property() title = '';

  @property({ type: Array }) linkItems: Array<{ title: string; routePath: string }> = [];

  @state() menuOpen = false; 

  render() {
    return html`
      <a href="" class="title">${this.title}</a>
      <span class="menu-button" @click="${this.toggleMenu}"></span>
      <ol ?open=${this.menuOpen}>
        ${this.linkItems.map(
          linkItem => html`<li><a href="${linkItem.routePath}" @click=${this.closeMenu}>${linkItem.title}</a></li>`
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
