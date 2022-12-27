/* Autor: Pascal Thesing */
import { LitElement, html } from 'lit';
import { customElement, state, property, query } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';
import { notificationService } from '../../notification.js';
import componentStyle from './create-workout.css';
import { repeat } from 'lit/directives/repeat.js';
import { range } from 'lit/directives/range.js';
import { isThisISOWeek } from 'date-fns';

@customElement('app-do-workout')
class DoWorkoutComponent extends PageMixin(LitElement){

    @state() private workout: object = {};

    @state() private exercises: object[] = [];

    @state() private results: object[][] = [];

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    render() {
        return this.buildBody();
    }

  async firstUpdated() {
    const workoutResponse = await httpClient.get('/workouts/' + this.id);
    this.workout = (await workoutResponse.json()).data; 

    const response = await httpClient.get('/exercises/workout/' + this.id);
    this.exercises = (await response.json()).results; 
}

    buildBody(){
        return html `
        <ion-content class="ion-padding">
            <h1>Workout</h1>

            ${repeat(
                this.exercises,
                (exercise, index) => html`
                <ion-card>
                <ion-card-header>
                <ion-card-title>Übung: ${exercise.name}</ion-card-title>
                </ion-card-header>

                <ion-card-content>
                ${repeat([...range(exercise.sets)], (setIndex) => html`
                    <ion-item>
                        <ion-row class="ion-justify-content-around">
                            <ion-col size="auto">
                            <ion-item lines="none">
                                Satz ${setIndex}:
                            </ion-item>
                            </ion-col>
                            <ion-col size="auto">
                                <ion-item lines="none">
                                    <ion-label>Wiederholungen: </ion-label>
                                    <ion-input @input=${event => this.onInput(event, index, setIndex)} type="number" id="repetitions" value="${exercise.repetitions}"></ion-input>
                                </ion-item>
                            </ion-col>
                            <ion-col size="auto">
                            <ion-item lines="none">
                                    <ion-label>Gewicht in kg: </ion-label>
                                    <ion-input @input=${event => this.onInput(event, index, setIndex)} type="number" id="weight" value="${exercise.weight}"></ion-input>
                                </ion-item>
                            </ion-col>
                        </ion-row>
                    </ion-item>
                    `
                )}
                </ion-card-content>
                </ion-card>                  
                `
            )}

        <ion-row>
            <ion-col>
                <ion-button @click="${this.finishTraining}" color="primary" type="button" expand="block">Workout beenden</ion-button>
            </ion-col>
          </ion-row>

        </ion-content>
        `;
    }

    onInput(event, index, setIndex) {
        const inputEl = event.target as HTMLInputElement;

        console.log(inputEl.value);
        console.log(index);
        console.log(setIndex);
        console.log(inputEl.offsetParent.id);
        console.log(this.results);

        if(!this.results[index]) {
            this.results[index] = [];
        }

        if(!this.results[index][setIndex]) {
            this.results[index][setIndex] = {};
        }


        this.results[index][setIndex][inputEl.offsetParent.id] = inputEl.value;
    }

    finishTraining() {
        this.results.map((sets, index) => {
            const maxWeight = Math.max(...sets.map(o => o.weight));
            const maxRepetitions = Math.max(...sets.map(o => o.repetitions));

            httpClient.patch('exercises/' + this.exercises[index].id, {...this.exercises[index], weight: maxWeight, repetitions: maxRepetitions});
        })

        router.navigate('/home')
    }
}