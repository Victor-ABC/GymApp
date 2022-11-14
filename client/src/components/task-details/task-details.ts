/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import { LitElement, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';

import sharedStyle from '../shared.css';
import componentStyle from './task-details.css';

export interface Task {
  id: string;
  title: string;
  status: 'open' | 'done';
  dueDate: string;
  description: string;
}

@customElement('app-task-details')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class TaskDetailsComponent extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];

  @property() taskId!: string;

  @query('form') private form!: HTMLFormElement;

  @query('#title') private titleElement!: HTMLInputElement;

  @query('#dueDate') private dueDateElement!: HTMLInputElement;

  @query('#description') private descriptionElement!: HTMLInputElement;

  private task!: Task;

  async firstUpdated() {
    try {
      const response = await httpClient.get('/tasks/' + this.taskId);
      this.task = await response.json();
      this.requestUpdate();
      await this.updateComplete;
    } catch (e) {
      if ((e as { statusCode: number }).statusCode === 401) {
        router.navigate('/users/sign-in');
      } else {
        this.showNotification((e as Error).message, 'error');
      }
    }
  }

  render() {
    return html`
      ${this.renderNotification()}
      <h1>Aufgabendetails</h1>
      <form novalidate>
        <div>
          <label for="title">Titel</label>
          <input type="text" autofocus required id="title" .value=${this.task?.title || ''} />
          <div class="invalid-feedback">Titel ist erforderlich</div>
        </div>
        <div>
          <label for="title">Fälligkeit</label>
          <input type="date" id="dueDate" .value=${this.task?.dueDate || ''} />
          <div class="invalid-feedback">Datum ist ungültig</div>
        </div>
        <div class="form-group">
          <label for="description">Beschreibung</label>
          <textarea id="description" rows="5" .value=${this.task?.description || ''}></textarea>
        </div>
        <button type="button" @click="${this.submit}">Speichern</button>
        <button type="button" @click="${this.cancel}">Abbrechen</button>
      </form>
    `;
  }

  async submit() {
    if (this.isFormValid()) {
      const updatedTask: Task = {
        ...this.task,
        title: this.titleElement.value,
        dueDate: this.dueDateElement.value,
        description: this.descriptionElement.value
      };
      try {
        await httpClient.patch('/tasks/' + updatedTask.id, updatedTask);
        router.navigate('/tasks');
      } catch (e) {
        this.showNotification((e as Error).message, 'error');
      }
    } else {
      this.form.classList.add('was-validated');
    }
  }

  cancel() {
    router.navigate('/tasks');
  }

  isFormValid() {
    return this.form.checkValidity();
  }
}
