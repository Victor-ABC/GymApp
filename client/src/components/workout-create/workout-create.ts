/* Autor: Pascal Thesing */
import { LitElement, html, PropertyValueMap } from 'lit';
import { customElement, state, property, query } from 'lit/decorators.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';
import { notificationService } from '../../notification.js';
import { repeat } from 'lit/directives/repeat.js';
import { isThisISOWeek } from 'date-fns';
import { TaskSyncDao, WorkoutSyncDao, ExerciseSyncDao } from "../../offline/sync-dao";
import { authenticationService, AuthenticationService } from '../../authenticationService.js';

@customElement('app-workout-create')
class WorkoutCreateComponent extends PageMixin(LitElement){

    @query('form') private form!: HTMLFormElement;
    @query('#name > input') private nameElement!: HTMLInputElement;

    @property({ reflect: true }) exercies: object[] = [{}];

    @state() tasks: object[] = [];

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    render() {
        return this.buildBody();
    }

    async firstUpdated() {
        this.tasks = await TaskSyncDao.findAll();
    }


    buildBody(){
        return html `
        <ion-content class="ion-padding">
            ${!Capacitor.isNativePlatform() ? html`
            <h1>Workout erstellen</h1>
          ` : null }

            <form>
                <ion-card class="workoutcard">
                    <ion-card-header>
                        <ion-card-title>Basisinformationen</ion-card-title>
                    </ion-card-header>
                    <ion-card-content>
                        <ion-item>
                            <ion-label position="fixed">Workoutname:</ion-label>
                            <ion-input type="text" required placeholder="Name vergeben" id="name"></ion-input>
                        </ion-item>
                    </ion-card-content>
                </ion-card>

                ${repeat(
                    this.exercies,
                    (exercise, index) => html`
                    <ion-card>
                    <ion-card-content>

                    <ion-row>
                    <img id="picture-${index}" src="" />
                    </ion-row>

                        <ion-item>
                            <ion-label position="fixed">Übung</ion-label>
                            <ion-select id="taskId" @ionChange=${event => this.onInputChange(event, index)} interface="action-sheet" placeholder="Übung wählen">
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
                        <ion-button color="primary" type="button" @click="${this.submit}" expand="block">Workout erstellen</ion-button>
                    </ion-col>
                </ion-row>

            </form>

        </ion-content>
        `;
    }

    onInput(event, index) {
        const inputEl = event.target as HTMLInputElement;
        this.exercies[index][inputEl.offsetParent.id] = inputEl.value;
    }

    onInputChange(event, index) {
        const inputEl = event.target as HTMLInputElement;
        this.exercies[index][inputEl.id] = inputEl.value;

        const element = this.tasks.filter(task => task.id === inputEl.value)[0];
        const img = document.getElementById('picture-' + index);
        if(img) {
            img.src = element.pictures[0] ?? './noImage.png';
        }
    }

    removeExercise(index: number) {
        this.exercies.splice(index, 1);

        this.requestUpdate();
    }

    addExercise() {
        this.exercies.push({});

        this.requestUpdate();
    }

    async submit() {
        if (this.isFormValid()) {}

        const workoutData = {
            name: this.nameElement.value,
            createdBy: this.userId ?? authenticationService.getUser().id
        };

        const workout = await WorkoutSyncDao.create(workoutData);

        this.exercies.map(async exercise => {
            await ExerciseSyncDao.create({...exercise, workoutId: workout.id})
        })

        router.navigate('home');
        notificationService.showNotification(`Der Kurs ${workout.name} wurde erfolgreich erstellt!` , "info");
    }

    isFormValid() {
        return this.form.checkValidity();
    }
}