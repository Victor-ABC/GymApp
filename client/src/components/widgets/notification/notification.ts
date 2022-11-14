/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import componentStyle from './notification.css';

@customElement('app-notification')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class NotificationComponent extends LitElement {
  static styles = componentStyle;

  @property() content = '';
  @property() type: 'error' | 'info' = 'info';

  render() {
    return html` ${this.content ? html`<div class="${this.type}">${this.content}</div>` : nothing} `;
  }
}
