/* Autor: Henrik Bruns */
import { LitElement, html } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';
import { notificationService } from '../../notification.js';
import { repeat } from 'lit/directives/repeat.js';
import { format } from 'date-fns';
import { formatWithOptions } from 'date-fns/fp';

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
            <ion-content>
                <h1>Course Overview</h1>
                <div class="courses">
                    ${repeat(
                        this.courses,
                        course => course.id,
                        course => html`
                            <div class="course">
                                <ion-card>
                                    <ion-card-header>
                                        <ion-card-title>${course.name}</ion-card-title>
                                    </ion-card-header>
                                    <ion-card-content>
                                        <ion-item lines="full">
                                            <ion-label>Beschreibung: ${course.description}</ion-label>
                                            <ion-icon slot="start" name="document-text-outline"></ion-icon>
                                        </ion-item>
                                        <ion-item lines="full">
                                            <ion-label>Wochentag: ${course.dayOfWeek}</ion-label>
                                            <ion-icon slot="start" name="calendar-outline"></ion-icon>
                                        </ion-item>
                                        <ion-item lines="full">
                                            <ion-label>Beginn: ${course.startTime} Uhr</ion-label>
                                            <ion-icon slot="start" name="time-outline"></ion-icon>
                                        </ion-item>
                                        <ion-item lines="full">
                                            <ion-label>Ende: ${course.endTime} Uhr</ion-label>
                                            <ion-icon slot="start" name="time-outline"></ion-icon>
                                        </ion-item>
                                        <ion-item lines="full">
                                            <ion-label>Erster Termin: ${format(new Date(course.startDate), 'dd.MM.yyyy')}</ion-label>
                                            <ion-icon slot="start" name="calendar-number-outline"></ion-icon>
                                        </ion-item>
                                        <ion-item lines="full">
                                            <ion-label>Letzter Termin: ${format(new Date(course.endDate), 'dd.MM.yyyy')}</ion-label>
                                            <ion-icon slot="start" name="calendar-number-outline"></ion-icon>
                                        </ion-item>
                                        <ion-item lines="none">
                                            <ion-button fill="outline" type="button" @click="${() => this.bookCourse(course)}">Book Course</ion-button>
                                        </ion-item>
                                    </ion-card-content>
                                </ion-card>
                            </div>
                        `
                    )}
                </div>
            </ion-content>
        `;
    }

    async bookCourse(courseToBook: Course) {
        const memberInCourse = {
            courseId: courseToBook.id
        }

        try {
            await httpClient.post('/memberincourses', memberInCourse);
        } catch (error) {
            notificationService.showNotification((error as Error).message , "error");
        }
    }
}