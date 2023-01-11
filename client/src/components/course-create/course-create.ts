/* Autor: Henrik Bruns */
import { LitElement, html } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';
import { notificationService } from '../../notification.js';
import { repeat } from 'lit/directives/repeat.js';

import { CourseSyncDao, UserSyncDao, MemberInCourseSyncDao } from "../../offline/sync-dao";

interface Trainer {
    id: string;
    name: string;
}

@customElement('app-course-create')
class CourseCreateComponent extends PageMixin(LitElement){
    @query('form') private form!: HTMLFormElement;
    @query('#name > input') private nameElement!: HTMLInputElement;
    @query('#description > input') private descriptionElement!: HTMLInputElement;
    @query('#trainer') private trainerElement!: HTMLIonSelectElement;

    @query('#dayOfWeek') private dayOfWeekElement!: HTMLIonSelectElement;
    @query('#startDate') private startDateElement!: HTMLIonDatetimeElement;
    @query('#endDate') private endDateElement!: HTMLIonDatetimeElement;
    @query('#startTime') private startTimeElement!: HTMLIonDatetimeElement;
    @query('#endTime') private endTimeElement!: HTMLIonDatetimeElement;

    @state() private trainer: Trainer[] = [];


    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    async firstUpdated() {
       this.trainer = await UserSyncDao.findAll({isTrainer: true})
    }

    render() {
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
                        <ion-item lines="none">
                            <ion-label position="fixed">Trainer</ion-label>
                            <ion-select interface="action-sheet" placeholder="Trainer wählen" id="trainer">
                                ${repeat(
                                    this.trainer,
                                    trainer => trainer.id,
                                    trainer => html`
                                        <ion-select-option value="${trainer.id}">${trainer.name}</ion-select-option>
                                `)}
                            </ion-select>
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
                            <ion-select interface="action-sheet" placeholder="Wochentag wählen" id="dayOfWeek">
                                <ion-select-option value="Montag">Montag</ion-select-option>
                                <ion-select-option value="Dienstag">Dienstag</ion-select-option>
                                <ion-select-option value="Mittwoch">Mittwoch</ion-select-option>
                                <ion-select-option value="Donnerstag">Donnerstag</ion-select-option>
                                <ion-select-option value="Freitag">Freitag</ion-select-option>
                                <ion-select-option value="Samstag">Samstag</ion-select-option>
                                <ion-select-option value="Sonntag">Sonntag</ion-select-option>
                            </ion-select>
                        </ion-item>
                        <ion-item>
                            <ion-label position="fixed">Startdatum</ion-label>
                            <ion-datetime-button datetime="startDate"></ion-datetime-button>

                            <ion-modal [keepContentsMounted]="true">
                                    <ion-datetime class="force-black-font" presentation="date" id="startDate"></ion-datetime>
                            </ion-modal>
                        </ion-item>

                        <ion-item>
                            <ion-label position="fixed">Enddatum</ion-label>
                            <ion-datetime-button datetime="endDate"></ion-datetime-button>

                            <ion-modal [keepContentsMounted]="true">
                                    <ion-datetime class="force-black-font" presentation="date" id="endDate"></ion-datetime>
                            </ion-modal>
                        </ion-item>

                        <ion-item>
                            <ion-label position="fixed">Startzeit</ion-label>
                            <ion-datetime-button datetime="startTime"></ion-datetime-button>

                            <ion-modal [keepContentsMounted]="true">
                            <ion-datetime class="force-black-font" presentation="time" id="startTime"></ion-datetime>
                    </ion-modal>
                        </ion-item>

                        <ion-item lines="none">
                            <ion-label position="fixed">Endzeit</ion-label>
                            <ion-datetime-button datetime="endTime"></ion-datetime-button>

                            <ion-modal [keepContentsMounted]="true">
                                <ion-datetime class="force-black-font" presentation="time" id="endTime"></ion-datetime>
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
            const date = (new Date()).toISOString()

            const course = {
                name: this.nameElement.value,
                description: this.descriptionElement.value,
                dayOfWeek: this.dayOfWeekElement.value,
                startDate: this.startDateElement.value ?? date,
                endDate: this.endDateElement.value ?? date,
                startTime: this.startTimeElement.value ?? date,
                endTime: this.endTimeElement.value ?? date,
                trainerId: this.trainerElement.value
            };

            try {
                await CourseSyncDao.create(course);
                router.navigate('/course');
                notificationService.showNotification(`Der Kurs ${course.name} wurde erfolgreich erstellt!` , "info");
            } catch (error) {
                notificationService.showNotification((error as Error).message , "error");
            }
        
    }

    isFormValid() {
        return this.form.checkValidity();
    }
}