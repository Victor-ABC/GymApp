/* Autor: Henrik Bruns */
import { LitElement, html } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';
import { notificationService } from '../../notification.js'

@customElement('app-create-course')
class CreateCourseComponent extends PageMixin(LitElement){

    @query('form') private form!: HTMLFormElement;
    @query('#name > input') private nameElement!: HTMLInputElement;
    @query('#description > input') private descriptionElement!: HTMLInputElement;

    @query('#dayOfWeek') private dayOfWeekElement!: HTMLIonSelectElement;
    @query('#startDate') private startDateElement!: HTMLIonDatetimeElement;
    @query('#endDate') private endDateElement!: HTMLIonDatetimeElement;
    @query('#startTime') private startTimeElement!: HTMLIonDatetimeElement;
    @query('#endTime') private endTimeElement!: HTMLIonDatetimeElement;


    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    render() {
        return this.buildBody();
    }

    buildBody(){
        return html `
        <ion-content class="ion-padding">
            <h1>Kurs erstellen</h1>
            <form>
                <ion-card>
                    <ion-card-header>
                        <ion-card-title>Basisinformationen</ion-card-title>
                    </ion-card-header>
                    <ion-card-content>
                        <ion-item>
                            <ion-label position="fixed">Kursname</ion-label>
                            <ion-input type="text" required placeholder="Kursnamen vergeben" id="name"></ion-input>
                        </ion-item>
                        <ion-item>
                            <ion-label position="fixed">Beschreibung</ion-label>
                            <ion-input type="text" required placeholder="Kursbeschreibung vergeben" id="description"></ion-input>
                        </ion-item>
                    </ion-card-content>
                </ion-card>

                <ion-card>
                    <ion-card-header>
                        <ion-card-title>Termininformationen</ion-card-title>
                    </ion-card-header>
                    <ion-card-content>
                        <ion-item>
                            <ion-label position="fixed">Wochentag</ion-label>
                            <ion-select interface="alert" placeholder="Wochentag wählen" id="dayOfWeek">
                                <ion-select-option value="Montag">Montag</ion-select-option>
                                <ion-select-option value="Dienstag">Dienstag</ion-select-option>
                                <ion-select-option value="Mittwoch">Mittwoch</ion-select-option>
                                <ion-select-option value="Donnerstag">Donnerstag</ion-select-option>
                                <ion-select-option value="Freitag">Freitag</ion-select-option>
                                <ion-select-option value="Samstag">Samstag</ion-select-option>
                                <ion-select-option value="Sonntag">Sonntag</ion-select-option>
                            </ion-select>
                        </ion-item>
                        <ion-item lines="full">
                            <ion-label position="fixed">Startdatum</ion-label>
                            <ion-datetime-button datetime="startDate"></ion-datetime-button>

                            <ion-modal [keepContentsMounted]="true">
                            <ng-template>
                                <ion-datetime presentation="date" id="startDate"></ion-datetime>
                            </ng-template>
                            </ion-modal>
                        </ion-item>

                        <ion-item>
                            <ion-label position="fixed">Enddatum</ion-label>
                            <ion-datetime-button datetime="endDate"></ion-datetime-button>

                            <ion-modal [keepContentsMounted]="true">
                            <ng-template>
                                <ion-datetime presentation="date" id="endDate"></ion-datetime>
                            </ng-template>
                            </ion-modal>
                        </ion-item>

                        <ion-item>
                            <ion-label position="fixed">Startzeit</ion-label>
                            <ion-datetime-button datetime="startTime"></ion-datetime-button>

                            <ion-modal [keepContentsMounted]="true">
                            <ng-template>
                                <ion-datetime presentation="time" id="startTime"></ion-datetime>
                            </ng-template>
                            </ion-modal>
                        </ion-item>

                        <ion-item>
                            <ion-label position="fixed">Endzeit</ion-label>
                            <ion-datetime-button datetime="endTime"></ion-datetime-button>

                            <ion-modal [keepContentsMounted]="true">
                            <ng-template>
                                <ion-datetime presentation="time" id="endTime"></ion-datetime>
                            </ng-template>
                            </ion-modal>
                        </ion-item>

                    </ion-card-content>
                </ion-card>
                
                <ion-row>
                    <ion-col>
                        <ion-button color="primary" type="button" @click="${this.submit}" expand="block" >Kurs erstellen</ion-button>
                    </ion-col>
                </ion-row>
            </form>
        </ion-content>
        `;
    }

    async submit() {
        if (this.isFormValid()) {
            const course = {
                name: this.nameElement.value,
                description: this.descriptionElement.value,
                dayOfWeek: this.dayOfWeekElement.value,
                startDate: this.startDateElement.value,
                endDate: this.endDateElement.value,
                startTime: this.startTimeElement.value,
                endTime: this.endTimeElement.value,
            };

            try {
                await httpClient.post('courses', course);
                router.navigate('/course');
            } catch (error) {
                notificationService.showNotification((error as Error).message , "error");
            }
        }
    }

    isFormValid() {
        return this.form.checkValidity();
      }
}