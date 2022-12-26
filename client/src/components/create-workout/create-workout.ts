/* Autor: Pascal Thesing */
import { LitElement, html } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';
import { notificationService } from '../../notification.js';
import componentStyle from './create-workout.css';

@customElement('app-create-workout')
class CreateWorkoutComponent extends PageMixin(LitElement){


    @query('form') private form!: HTMLFormElement;
    @query('#name > input') private nameElement!: HTMLInputElement;

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    render() {
        return this.buildBody();
    }


    buildBody(){
        return html `
        <ion-content class="ion-padding">
            <h1>Workout erstellen</h1>

            <form>

            <ion-card>
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


            <ion-row>
                <ion-col>
                    <ion-button color="primary" type="button" @click="${this.submit}" expand="block" >Workout erstellen</ion-button>
                </ion-col>
            </ion-row>

            </form>

        </ion-content>
        `;
    }


    async submit() {
        if (this.isFormValid()) {
            const workout = {
                name: this.nameElement.value,
            };

            try {
                await httpClient.post('workouts', workout);
                // router.navigate('/workouts');
                notificationService.showNotification(`Der Kurs ${workout.name} wurde erfolgreich erstellt!` , "info");
            } catch (error) {
                notificationService.showNotification((error as Error).message , "error");
            }
        }
    }

    isFormValid() {
        return this.form.checkValidity();
    }
}