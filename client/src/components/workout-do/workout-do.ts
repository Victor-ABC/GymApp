/* Autor: Pascal Thesing */
import { LitElement, html } from 'lit';
import { customElement, state, property, query } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';
import { notificationService } from '../../notification.js';
import { repeat } from 'lit/directives/repeat.js';
import { range } from 'lit/directives/range.js';
import { isThisISOWeek } from 'date-fns';
import { IonItem, IonModal } from '@ionic/core/components';
import { Exercise } from '../../interfaces.js';
import { th } from 'date-fns/locale';
import { TaskSyncDao, WorkoutSyncDao, ExerciseSyncDao } from "../../offline/sync-dao";

@customElement('app-workout-do')
class WorkoutDoComponent extends PageMixin(LitElement){

    @state() private workout: object = {};

    @state() private exercises: object[] = [];

    @state() private results: object[][] = [];

    @state() tasks: object = {}


    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

  async firstUpdated() {
    (await TaskSyncDao.findAll()).forEach(element => {
        this.tasks[element.id] = element;
    })

    this.workout = await WorkoutSyncDao.findOne({id: this.id});
    this.exercises = await ExerciseSyncDao.findAll({ workoutId: this.id });

    this.preFillResults();
    }

    preFillResults() {
        this.exercises.forEach((ex, index) => {
            for(var i = 0; i < ex.sets; i++) {
                if(!this.results[index]) {
                    this.results[index] = [];
                }

                this.results[index][i] = {
                    repetitions: ex.repetitions,
                    weight: ex.weight
                }
            }
        })
    }

    openModal(event: PointerEvent, index: number) {
        const modal = document.getElementById('model-' + index) as IonModal;
        modal.isOpen = true
    }

    closeModal(event: PointerEvent, index: number) {
        const modal = document.getElementById('model-' + index) as IonModal;
        modal.isOpen = false
    }

    async finishExercise(event: PointerEvent, index: number, exercise: object) {
        const modal = document.getElementById('model-' + index) as IonModal;
        modal.isOpen = false

        const item = document.getElementById('exercise-' + index) as IonItem;
        item.color = "success";
        item.lines = "none";

        exercise.finished = true;

        await this.setWorkoutData();
    }

    render() {
        return html`
        <ion-content class="ion-padding">
            <h1>Workout</h1>

            <ion-card>
            <ion-card-content>

            <ion-list>
            <ion-item-group>

            ${repeat(this.exercises,
                (exercise, index) => html`
            
                ${this.tasks[exercise.taskId].muscle !== (this.tasks?.[this.exercises[index - 1]?.taskId]?.muscle ?? null) ? html`
                        
                <ion-item-divider color="secondary">
                <ion-label>
                ${this.tasks[exercise.taskId].muscle}
                </ion-label>
              </ion-item-divider>
                `
                    : null
                }


                ${this.getItemContent(exercise, index)}
                `
            )}

            </ion-list>
            </ion-item-group>

            </ion-card-content>
                    </ion-card>


            <ion-row>
                <ion-col>
                    <ion-button @click="${this.finishTraining}" color="primary" type="button" expand="block">Workout beenden</ion-button>
                </ion-col>
            </ion-row>
        `
    }

    getItemContent(exercise, index) {
        return html`
        <ion-item id="exercise-${index}" @click="${event => this.openModal(event, index)}" button>

                <ion-thumbnail slot="start">
                ${this.tasks[exercise.taskId].pictures == 0
                  ? html` <ion-slide>
                      <img src="https://ionicframework.com/docs/img/demos/thumbnail.svg" />
                    </ion-slide>`
                  : html`        
                  <img src="${this.tasks[exercise.taskId].pictures[0]}" />
                  `
                  }
                </ion-thumbnail>

                ${this.tasks[exercise.taskId].name}
                </ion-item>

                <ion-modal id="model-${index}" backdrop-dismiss="false">
                <ion-content>

                <ion-header>
                <ion-toolbar>
                  <ion-button id="button-${index}" slot="start" fill="clear">
                        <ion-icon slot="icon-only" name="information-circle-outline"></ion-icon>
                    </ion-button>
                    <ion-popover trigger="button-${index}" triggerAction="click">
                      ${this.tasks[exercise.taskId].description}
                  </ion-popover>


                  <ion-title class="exercise-title">${this.tasks[exercise.taskId].name}</ion-title>
                  <ion-buttons slot="end">
                    <ion-button @click="${event => this.closeModal(event, index)}">Close</ion-button>
                  </ion-buttons>
                </ion-toolbar>
              </ion-header>

              <ion-slides id="imageSwiper" pager="true">
              ${this.tasks[exercise.taskId].pictures!.length == 0
                ? html` <ion-slide>
                    <img id="standardUploadImage" src="./standardUploadImage.png" />
                  </ion-slide>`
                : null}
              ${this.tasks[exercise.taskId].pictures!.map(exercisePicture => {
                return html`<ion-slide><img class="uploadedImages" src="${exercisePicture}" /></ion-slide>`;
              })}
            </ion-slides>

                ${repeat([...range(exercise.sets)], (setIndex) => html`
                    <ion-item>
                        <ion-row class="ion-justify-content-around">
                            <ion-col size="3">
                            <ion-item class="set" lines="none">
                                Satz ${setIndex}
                            </ion-item>
                            </ion-col>
                            <ion-col size="5">
                                <ion-item lines="none">
                                    <ion-label position="stacked">Wiederholungen:</ion-label>
                                    <ion-input color="primary" @input=${event => this.onInput(event, index, setIndex)} type="number" id="repetitions" value="${exercise.repetitions}"></ion-input>
                                </ion-item>
                            </ion-col>
                            <ion-col size="4">
                            <ion-item lines="none">
                                    <ion-label position="stacked">Kg: </ion-label>
                                    <ion-input color="primary" @input=${event => this.onInput(event, index, setIndex)} type="number" id="weight" value="${exercise.weight}"></ion-input>
                                </ion-item>
                            </ion-col>
                        </ion-row>
                    </ion-item>
                    `
                )}
                <ion-row>
                <ion-col>
                    <ion-button @click="${event => this.finishExercise(event, index, exercise)}" color="primary" type="button" expand="block">Übung beenden</ion-button>
                </ion-col>
              </ion-row>
                </ion-content>

                </ion-modal>       
        `;
    }

    onInput(event, index, setIndex) {
        const inputEl = event.target as HTMLInputElement;

        if(!this.results[index]) {
            this.results[index] = [];
        }

        if(!this.results[index][setIndex]) {
            this.results[index][setIndex] = {};
        }


        this.results[index][setIndex][inputEl.offsetParent.id] = inputEl.value;
    }

    async setWorkoutData() {
        await this.results.map(async (sets, index) => {
            const maxWeight = Math.max(...sets.map(o => o.weight));
            const maxRepetitions = Math.max(...sets.map(o => o.repetitions));

            await ExerciseSyncDao.update({...this.exercises[index], weight: maxWeight, repetitions: maxRepetitions});
        })
    }

    async finishTraining() {
        await this.setWorkoutData();

        await router.navigate('/home')
    }
}

