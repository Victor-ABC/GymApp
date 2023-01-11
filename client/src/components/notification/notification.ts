/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { notificationService } from '../../notification.js'
import componentStyle from './notification.css';

@customElement('app-notification')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class NotificationComponent extends LitElement {
  constructor() {
    super();
    notificationService.init(this);
  }

  static styles = componentStyle;

  @property() content = '';
  @property() type: 'error' | 'info' = 'info';

  render() {
    return html` ${this.content ? html`<div class="notification ${this.type}">${this.content}</div>` : nothing} `;
  }

  public showNotification(content = '', type: 'error' | 'info' = 'info') {
    this.content = content;
    this.type = type;
    if (content) {
        setTimeout(() => this.showNotification(), 3000);
    }
}
}
