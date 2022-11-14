/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import { LitElement, html } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';

import sharedStyle from '../shared.css';
import componentStyle from './tasks.css';

interface Task {
  id: string;
  title: string;
  status: 'open' | 'done';
}

@customElement('app-tasks')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class TasksComponent extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];

  @state() private tasks: Task[] = [];

  @query('#title') private titleElement!: HTMLInputElement;

  async firstUpdated() {
    try {
      this.startAsyncInit();
      const response = await httpClient.get('/tasks' + location.search);
      this.tasks = (await response.json()).results;
    } catch (e) {
      if ((e as { statusCode: number }).statusCode === 401) {
        router.navigate('/users/sign-in');
      } else {
        this.showNotification((e as Error).message, 'error');
      }
    } finally {
      this.finishAsyncInit();
    }
  }

  render() {
    return html`
      ${this.renderNotification()}
      <h1>Aufgaben</h1>
      <form novalidate @submit="${this.submit}">
        <div>
          <input type="text" autofocus required id="title" placeholder="Neue Aufgabe" />
        </div>
      </form>
      <div class="tasks">
        ${repeat(
          this.tasks,
          task => task.id,
          task => html`
            <app-task
              status=${task.status}
              @apptaskstatusclick=${() => this.toggleTaskStatus(task)}
              @apptaskremoveclick=${() => this.removeTask(task)}
              @apptaskclick=${() => this.showTaskDetails(task)}
            >
              <span slot="title">${task.title}</span>
            </app-task>
          `
        )}
      </div>
    `;
  }

  async toggleTaskStatus(taskToToggle: Task) {
    const updatedTask: Task = {
      ...taskToToggle,
      status: taskToToggle.status === 'open' ? 'done' : 'open'
    };

    try {
      await httpClient.patch('/tasks/' + updatedTask.id, updatedTask);
      this.tasks = this.tasks.map(task =>
        task === taskToToggle
          ? ({ ...task, status: (task.status || 'open') === 'open' ? 'done' : 'open' } as Task)
          : task
      );
    } catch (e) {
      this.showNotification((e as Error).message, 'error');
    }
  }

  async removeTask(taskToRemove: Task) {
    try {
      await httpClient.delete('/tasks/' + taskToRemove.id);
      this.tasks = this.tasks.filter(task => task.id !== taskToRemove.id);
    } catch (e) {
      this.showNotification((e as Error).message, 'error');
    }
  }

  async showTaskDetails(task: Task) {
    router.navigate(`/tasks/${task.id}`);
  }
  async submit(event: Event) {
    event.preventDefault();
    const partialTask: Partial<Task> = { title: this.titleElement.value };
    try {
      const response = await httpClient.post('/tasks', partialTask);
      const task: Task = await response.json();
      this.tasks = [...this.tasks, task];
      this.titleElement.value = '';
    } catch (e) {
      this.showNotification((e as Error).message, 'error');
    }
  }
}
