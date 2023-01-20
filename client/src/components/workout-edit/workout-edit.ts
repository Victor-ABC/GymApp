/* Autor: Pascal Thesing */
import { LitElement, html } from 'lit';
import { customElement, state, property, query } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';
import { notificationService } from '../../notification.js';
import { repeat } from 'lit/directives/repeat.js';
import { isThisISOWeek } from 'date-fns';
import { TaskSyncDao, WorkoutSyncDao, ExerciseSyncDao } from "../../offline/sync-dao";

@customElement('app-workout-edit')
class WorkoutEditComponent extends PageMixin(LitElement){

    @query('form') private form!: HTMLFormElement;
    @query('#name > input') private nameElement!: HTMLInputElement;

    @property({ reflect: true }) exercises: object[] = [{}];

    @property({ reflect: true }) workout: object = {};

    @state() tasks: object[] = []


    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    render() {
        return this.buildBody();
    }

    async firstUpdated() {
        this.workout = await WorkoutSyncDao.findAll({id: this.id})
  
        this.tasks = await TaskSyncDao.findAll();

        this.exercises = await ExerciseSyncDao.findAll({ workoutId: this.id })
    }


    buildBody(){
        return html `
        <ion-content class="ion-padding">
        ${!Capacitor.isNativePlatform() ? html`
        <h1>Workout editieren</h1>
      ` : null }

            <form>
                <ion-card class="workoutcard">
                    <ion-card-header>
                        <ion-card-title>Basisinformationen</ion-card-title>
                    </ion-card-header>
                    <ion-card-content>
                        <ion-item>
                            <ion-label position="fixed">Name:</ion-label>
                            <ion-input @change=${this.adjustName} type="text" required placeholder="Name vergeben" id="name" value=${this.workout.name}></ion-input>
                        </ion-item>
                    </ion-card-content>
                </ion-card>

                ${repeat(
                    this.exercises,
                    (exercise, index) => html`
                    <ion-card>
                    <ion-card-content>

                    <ion-row>
                    <img id="picture-${index}" src="" />
                    </ion-row>

                    <ion-item>
                        <ion-label position="fixed">Übung</ion-label>
                        <ion-select id="taskId" @ionChange=${event => this.onInputChange(event, index)} interface="action-sheet" placeholder="Übung wählen" value="${exercise.taskId}">
                        ${repeat(
                            this.tasks,
                            task => html`
                                <ion-select-option value="${task.id}">${task.name}</ion-select-option>
                        `)}
                    </ion-select>
                    </ion-item>
                        <ion-item lines="none">
                            <ion-label position="fixed">Gewicht</ion-label>
                            <ion-input @input=${event => this.onInput(event, index)} type="number" required placeholder="Gewicht angeben" id="weight" value="${exercise.weight}"></ion-input>
                        </ion-item>
                        <ion-item lines="none">
                            <ion-label position="fixed">Sätze</ion-label>
                            <ion-input @input=${event => this.onInput(event, index)} type="number" required placeholder="Sätze angeben" id="sets" value="${exercise.sets}"></ion-input>
                        </ion-item>
                        <ion-item lines="none">
                            <ion-label position="fixed">Wiederholungen</ion-label>
                            <ion-input @input=${event => this.onInput(event, index)} type="number" required placeholder="Sätze angeben" id="repetitions" value="${exercise.repetitions}"></ion-input>
                        </ion-item>
                        <ion-item lines="none">
                            <ion-label position="fixed">Pausezeit</ion-label>
                            <ion-input @input=${event => this.onInput(event, index)} type="number" required placeholder="Pause zeit angeben in" id="timeToRest" value="${exercise.timeToRest}"></ion-input>
                        </ion-item>
                    </ion-card-content>

                        <ion-row>
                            <ion-col>
                                <ion-button color="primary" type="button" @click="${() => this.removeExercise(index)}" expand="block">Übung löschen</ion-button>
                            </ion-col>
                        </ion-row>
                    </ion-card>                  
                    `
                )}
                
                <ion-row>
                    <ion-col>
                        <ion-button color="secondary" type="button" @click="${this.addExercise}" expand="block">Übung hinzufügen</ion-button>
                    </ion-col>
                    </ion-row>
                    <ion-row>
                    <ion-col>
                        <ion-button color="primary" type="button" @click="${this.submit}" expand="block">Workout updaten</ion-button>
                    </ion-col>
                </ion-row>

            </form>

        </ion-content>
        `;
    }


    adjustName(event) {
        const inputEl = event.target as HTMLInputElement;
        this.workout.name = inputEl.value;
    }

    onInput(event, index) {
        const inputEl = event.target as HTMLInputElement;
        this.exercises[index][inputEl.offsetParent.id] = inputEl.value;
    }

    onInputChange(event, index) {
        const inputEl = event.target as HTMLInputElement;
        this.exercises[index][inputEl.id] = inputEl.value;

        const element = this.tasks.filter(task => task.id === inputEl.value)[0];
        const img = document.getElementById('picture-' + index);
    
        if(img) {
            img.src = element.pictures[0] ?? './noImage.png';
        }
    }


    async removeExercise(index: number) {
        const item = this.exercises.splice(index, 1);

        if(item.id) {
            await ExerciseSyncDao.delete(item.id);
        }

        this.requestUpdate();
    }

    addExercise() {
        this.exercises.push({});

        this.requestUpdate();
    }

    async submit() {
        if (this.isFormValid()) {}

        const workoutResponse = await WorkoutSyncDao.update(this.workout);

        const workout = (await workoutResponse.json());
        this.exercises.map(async exercise => {
            if(exercise.id) {
                await ExerciseSyncDao.update(exercise);
            } else {
                await ExerciseSyncDao.create({...exercise, workoutId: this.workout.id});
            }
        })

        router.navigate('home');
        notificationService.showNotification(`Der Kurs ${this.workout.name} wurde erfolgreich aktuallisiert!` , "info");
    }

    isFormValid() {
        return this.form.checkValidity();
    }
}