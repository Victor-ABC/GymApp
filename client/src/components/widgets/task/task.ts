/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import componentStyle from './task.css';

@customElement('app-task')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class TaskComponent extends LitElement {
  static styles = componentStyle;

  @property() status = 'open';

  render() {
    return html`
      <span class="toggle-status" @click=${() => this.emit('apptaskstatusclick')}>
        ${this.status === 'done' ? html`<span class="status"></span>` : nothing}
      </span>
      <slot name="title" @click="${() => this.emit('apptaskclick')}"></slot>
      <span class="remove-task" @click="${() => this.emit('apptaskremoveclick')}"></span>
    `;
  }

  emit(eventType: string, eventData = {}) {
    const event = new CustomEvent(eventType, {
      detail: eventData,
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }
}
