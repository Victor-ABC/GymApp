/* Autor: Pascal Thesing */

import { LitElement, html } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';
import { notificationService } from '../../notification.js';
import { repeat } from 'lit/directives/repeat.js';
import { format, isThisSecond } from 'date-fns';
import { TaskSyncDao } from "./../../offline/sync-dao";

interface Exercise {
    id: string,
    description: string,
    pictures: string,
    name: string,
}


@customElement('app-exercise-overview')
class ExerciseOverviewComponent extends PageMixin(LitElement){
    @state() private exercises: Exercise[] = [];

    async firstUpdated() {
        this.exercises = await TaskSyncDao.findAll() as unknown;
    }

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
      }

    editExercise(id: string): void {
        router.navigate('exercises/edit/' + id);
    }

    async deleteExercise(id: string): Promise<void> {
        await TaskSyncDao.delete(id);
        await this.firstUpdated();
        this.requestUpdate();
    }

    openCreateExercise(): void {
        router.navigate('exercises/create');
    }

    render() {
        return html `
            <ion-content class="ion-padding">
              <div class="header-overview">
              ${!Capacitor.isNativePlatform() ? html`
              <h1>Alle Übungen</h1>
          ` : null }
                <ion-button @click="${this.openCreateExercise}">
                  <ion-icon slot="icon-only" name="add"></ion-icon>
                </ion-button>
              </div>
                    <ion-card>
                        <ion-card-content>
                        ${this.exercises.length === 0 ?
                          html`<div class="no-content">Keine Übungen im System</div>` : html`
                            <ion-list>
                            ${repeat(
                                this.exercises,
                                exercise => html`
                                  <ion-item-sliding>
                                    <ion-item button="true">
                                      <ion-thumbnail slot="start">

                                      ${exercise.pictures!.length == 0
                                        ? html` <ion-slide>
                                            <img src="https://ionicframework.com/docs/img/demos/thumbnail.svg" />
                                          </ion-slide>`
                                        : html`        
                                        <img src="${exercise.pictures[0]}" />
                                        `
                                        }
                                      </ion-thumbnail>
                                      <ion-label>${exercise.name}</ion-label>

                                      <ion-button fill="clear" @click="${() => this.editExercise(exercise.id)}">Open</ion-button>
                                      <ion-button fill="clear" id="click-trigger-${exercise.id}">
                                        <ion-icon slot="icon-only" name="menu-sharp"></ion-icon>
                                      </ion-button>
                                      <ion-popover trigger="click-trigger-${exercise.id}" trigger-action="click" show-backdrop="false">
                                        <ion-list mode="ios">
                                          <ion-item button="true" detail="false" @click="${() => this.deleteExercise(exercise.id)}" color="danger">Übung löschen</ion-item>
                                        </ion-list>
                                      </ion-popover>
                                    </ion-item>
        
                                    <ion-item-options side="end">
                                      <ion-item-option color="danger" @click="${() => this.deleteExercise(exercise.id)}">
                                        <ion-icon slot="icon-only" name="trash"></ion-icon>
                                      </ion-item-option>
                                    </ion-item-options>
        
                                  </ion-item-sliding>
                                `
                              )}
                            </ion-list>
                            `}
                            
                        </ion-card-content>
                    </ion-card>
            </ion-content>
        `;
    }
}