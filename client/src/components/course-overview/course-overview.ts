/* Autor: Henrik Bruns */
import { LitElement, html } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';
import { notificationService } from '../../notification.js';
import { repeat } from 'lit/directives/repeat.js';
import { authenticationService } from '../../authenticationService.js';
import { Capacitor } from '@capacitor/core';

import { CourseSyncDao, UserSyncDao, MemberInCourseSyncDao } from "./../../offline/sync-dao";


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
        this.courses = await CourseSyncDao.findAll();
    }

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
      }

    render() {
        return html `
            <ion-content>
                <div class="header-overview">
                    <h1>Course Overview</h1>
                    ${authenticationService.isTrainer() && Capacitor.getPlatform() === 'web' ? html`
                        <ion-button @click="${() => this.openCreateCourse()}">
                            <ion-icon slot="icon-only" name="add"></ion-icon>
                        </ion-button>
                    ` : html``}
                </div>
                <div class="courses">
                <ion-card>
                <ion-card-content>
                    ${this.courses.length === 0 ?
                        html`<div class="no-content">Keine Kurse vorhanden</div>` : html`
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
                            `
                    }
                    </ion-card-content>
                    </ion-card>
                </div>
            </ion-content>
        `;
    }

    async bookCourse(courseToBook: Course) {
        const memberInCourse = {
            courseId: courseToBook.id
        }

        try {
            await MemberInCourseSyncDao.create(memberInCourse);
            notificationService.showNotification(`Der Kurs ${courseToBook.name} wurde erfolgreich gebucht!` , "info");
        } catch (error) {
            notificationService.showNotification((error as Error).message , "error");
        }
    }

    openCourse(courseId: string) {
        router.navigate(`course/${courseId}`);
    }

    openCreateCourse() {
        router.navigate(`course/create`);
    }

    async deleteCourse(courseId: string) {
        await CourseSyncDao.delete(courseId);
        this.firstUpdated();
    }
}