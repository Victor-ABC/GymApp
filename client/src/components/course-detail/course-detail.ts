/* Autor: Henrik Bruns */

import { LitElement, html } from 'lit';
import { customElement, state, query, property } from 'lit/decorators.js';
import { PageMixin } from '../page.mixin.js';
import { format } from 'date-fns';
import { notificationService } from '../../notification.js';
import { router } from '../../router/router.js';
import { authenticationService } from '../../authenticationService.js';

import { CourseSyncDao, UserSyncDao, MemberInCourseSyncDao } from "./../../offline/sync-dao";

interface Course {
    id?: string;
    name?: string;
    description?: string;
    dayOfWeek?: string;
    startDate: Date;
    endDate: Date;
    startTime?: string;
    endTime?: string;
    trainerId?: string;
}

interface Trainer {
    id?: string;
    name?: string;
    mail?: string;
    createdAt?: string;
}

@customElement('app-course-detail')
class CourseDetailComponent extends PageMixin(LitElement){ 
    
    @property() id = '';

    @state() private course: Course = {startDate: new Date(), endDate: new Date()};
    @state() private trainer: Trainer = {};

    async firstUpdated() {
        this.course = await CourseSyncDao.findOne({id: this.id});
        this.trainer = await UserSyncDao.findOne({id: this.course.trainerId})
    }

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    render() {
        return html `
            <ion-content class="ion-padding">
            ${!Capacitor.isNativePlatform() ? html`
            <h1>Kursdetails</h1>
        ` : null }

                <div class="course">
                    <ion-card>
                        <ion-card-header>
                            <ion-card-title>${this.course.name}</ion-card-title>
                        </ion-card-header>
                        <ion-card-content>
                            <ion-item lines="full">
                                <ion-label class="ion-text-wrap">Beschreibung: ${this.course.description}</ion-label>
                                <ion-icon slot="start" name="document-text-outline"></ion-icon>
                            </ion-item>
                            <ion-item lines="full">
                                <ion-label class="ion-text-wrap">Trainer: ${this.trainer.name}</ion-label>
                                <ion-icon slot="start" name="person-circle-outline"></ion-icon>
                                ${this.checkIfTrainerIsCurrentUser(this.trainer.id!) ?
                                    html`` : html` <ion-button slot="end" size="small" fill="outline" type="button" @click="${() => this.openChatWithMember(this.trainer.id!, this.trainer.name!, this.trainer.mail!, this.trainer.createdAt!)}">Chat</ion-button>
                                    `}
                            </ion-item>
                            <ion-item lines="full">
                                <ion-label class="ion-text-wrap">Wochentag: ${this.course.dayOfWeek}</ion-label>
                                <ion-icon slot="start" name="calendar-outline"></ion-icon>
                            </ion-item>
                            <ion-item lines="full">
                                <ion-label class="ion-text-wrap">Beginn: ${this.course.startTime} Uhr</ion-label>
                                <ion-icon slot="start" name="time-outline"></ion-icon>
                            </ion-item>
                            <ion-item lines="full">
                                <ion-label class="ion-text-wrap">Ende: ${this.course.endTime} Uhr</ion-label>
                                <ion-icon slot="start" name="time-outline"></ion-icon>
                            </ion-item>
                            <ion-item lines="full">
                                <ion-label class="ion-text-wrap">Zeitraum: ${format(new Date(this.course.startDate!), 'dd.MM.yyyy')} bis  ${format(new Date(this.course.endDate!), 'dd.MM.yyyy')}</ion-label>
                                <ion-icon slot="start" name="calendar-number-outline"></ion-icon>
                            </ion-item>
                            <ion-item lines="none">
                                <ion-button type="button" @click="${() => this.bookCourse(this.course!)}">Kurs buchen</ion-button>
                                ${authenticationService.isTrainer() ? html`
                                    <ion-button color="danger" type="button" @click="${() => this.deleteCourse(this.course.id!)}">Kurs löschen</ion-button>
                            ` : html``}
                            </ion-item>
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

    async deleteCourse(courseId: string) {
        await CourseSyncDao.delete(courseId);
        router.navigate(`course`);
    }

    async openChatWithMember(memberId: string, memberName: string, memberEmail: string, memberCreatedAt: string) {
        router.navigate(`chat/${memberId}/${memberCreatedAt}/${memberEmail}/${memberName}`);

    }

    checkIfTrainerIsCurrentUser(trainerId: string){
        return trainerId === authenticationService.getUser().id;
    }
}