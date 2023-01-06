/* Autor: Henrik Bruns */
import { LitElement, html } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';
import { notificationService } from '../../notification.js';
import { repeat } from 'lit/directives/repeat.js';
import { authenticationService } from '../../authenticationService.js';
import componentStyle from './course-overview.css';

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
    //static styles = [componentStyle];

    @state() private courses: Course[] = [];

    async firstUpdated() {
        const response = await httpClient.get('/courses');
        this.courses = (await response.json()).results;
    }

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
      }

    render() {
        return this.buildBody();
    }

    buildBody(){
        return html `
            <ion-content class="ion-padding">
                <h1>Course Overview</h1>
                <div class="courses">
                    ${this.courses.length === 0 ?
                        html`Keine Kurse im System` : html`
                        <ion-card>
                        <ion-card-content>
                            <ion-list>
                                ${repeat(
                                    this.courses,
                                    course => course.id,
                                    course => html`
                                        <ion-item-sliding>
                                            <ion-item>
                                                <ion-thumbnail slot="start">
                                                    <img alt="Silhouette of mountains" src="https://ionicframework.com/docs/img/demos/thumbnail.svg" />
                                                </ion-thumbnail>
                                                <ion-label>${course.name} | ${course.dayOfWeek}s, Start: ${course.startTime} Uhr</ion-label>
                                                <ion-button fill="clear" @click="${() => this.openCourse(course.id)}">Details</ion-button>
                                                <ion-button fill="clear" id="click-trigger-${course.id}">
                                                    <ion-icon slot="icon-only" name="menu-sharp"></ion-icon>
                                                </ion-button>
                                                <ion-popover trigger="click-trigger-${course.id}" trigger-action="click" show-backdrop="false">
                                                    <ion-list mode="ios">
                                                        <ion-item button="true" detail="false" @click="${() => this.bookCourse(course)}">Kurs buchen</ion-item>
                                                        ${authenticationService.isTrainer() ? html`
                                                            <ion-item button="true" detail="false" @click="${() => this.deleteCourse(course.id)}">Kurs löschen</ion-item>
                                                        ` : html``}
                                                    </ion-list>
                                                </ion-popover>
                                            </ion-item>

                                            <ion-item-options side="end">
                                                <ion-item-option @click="${() => this.bookCourse(course)}">
                                                <ion-icon slot="icon-only" name="add-circle-outline"></ion-icon>
                                                </ion-item-option>
                                            </ion-item-options>
                                        </ion-item-sliding>
                                    `
                                )}
                            </ion-list>
                        </ion-card-content>
                    </ion-card>
                            `
                    }
                    
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
            notificationService.showNotification(`Der Kurs ${courseToBook.name} wurde erfolgreich gebucht!` , "info");
        } catch (error) {
            notificationService.showNotification((error as Error).message , "error");
        }
    }

    openCourse(courseId: string) {
        router.navigate(`course/${courseId}`);
    }

    async deleteCourse(courseId: string) {
        await httpClient.delete('/courses/' + courseId);
        this.firstUpdated();
    }
}