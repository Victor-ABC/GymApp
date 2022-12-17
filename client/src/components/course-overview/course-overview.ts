/* Autor: Henrik Bruns */
import { LitElement, html } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';
import { notificationService } from '../../notification.js';
import { repeat } from 'lit/directives/repeat.js';
import { format } from 'date-fns';

/* Basisklasse für die Kurse im Fitnessstudio. Hier sollen folgende Funktionen abgebildet werden:
    - Übersicht aller angebotenen Kurse (Darstellung in Cards)
    - Anmeldung/Abmeldung eines Nutzers für einen Kurs (Bspw. Button am Kurs "Anmelden"/"Abmelden")
*/

interface Course {
        id: string;
        name: string;
        description: string;
        dayOfWeek: string;
        startDate: Date;
        endDate: Date;
        startTime: string;
        endTime: string;
}

@customElement('app-course-overview')
class CourseOverviewComponent extends PageMixin(LitElement){

    @state() private courses: Course[] = [];

    async firstUpdated() {
        try {
          const response = await httpClient.get('/courses');
          this.courses = (await response.json()).results;
        } catch (e) {
            if ((e as { statusCode: number }).statusCode === 401) {
              router.navigate('/users/sign-in');
            } else {
              notificationService.showNotification((e as Error).message, 'error');
            }
        }
    }

    render() {
        return this.buildBody();
    }

    buildBody(){
        return html `
            <h1>Hello Course Overview</h1>
            <ion-content>
                <div class="courses">
                    ${repeat(
                        this.courses,
                        course => course.id,
                        course => html`
                            <ion-card>
                                <ion-card-header>
                                    <ion-card-title>Kurs: ${course.name}</ion-card-title>
                                </ion-card-header>
                                <ion-card-content>
                                    <ion-item>
                                        <ion-label>Beschreibung: ${course.description}</ion-label>
                                    </ion-item>
                                    <ion-item>
                                        <ion-label>Wochentag: ${course.dayOfWeek}</ion-label>
                                    </ion-item>
                                    <ion-item>
                                        <ion-label>Beginn: ${course.startTime} Uhr</ion-label>
                                    </ion-item>
                                    <ion-item>
                                        <ion-label>Ende: ${course.endTime} Uhr</ion-label>
                                    </ion-item>
                                    <ion-item>
                                        <ion-label>Erster Termin: ${format(new Date(course.startDate), 'dd MMMM yyyy')}</ion-label>
                                    </ion-item>
                                    <ion-item>
                                        <ion-label>Letzter Termin: ${format(new Date(course.endDate), 'dd MMMM yyyy')}</ion-label>
                                    </ion-item>
                                </ion-card-content>
                            </ion-card>
                        `
                    )}
                </div>
            </ion-content>
            
        `;
    }
}