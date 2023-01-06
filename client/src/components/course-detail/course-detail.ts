import { LitElement, html } from 'lit';
import { customElement, state, query, property } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { PageMixin } from '../page.mixin.js';
import { format } from 'date-fns';
import { notificationService } from '../../notification.js';
import { router } from '../../router/router.js';
import { authenticationService } from '../../authenticationService.js';
import { User } from '../../interfaces.js';


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
        const response = await httpClient.get('/courses/' + this.id);
        this.course = (await response.json()).course;

        const trainerResponse = await httpClient.get('users/' + this.course.trainerId);
        this.trainer = (await trainerResponse.json()).result;
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
                <h1>Course Detail</h1>
                <div class="course">
                    <ion-card>
                        <ion-card-header>
                            <ion-card-title>${this.course.name}</ion-card-title>
                        </ion-card-header>
                        <ion-card-content>
                            <ion-item lines="full">
                                <ion-label>Beschreibung: ${this.course.description}</ion-label>
                                <ion-icon slot="start" name="document-text-outline"></ion-icon>
                            </ion-item>
                            <ion-item lines="full">
                                <ion-label>Trainer: ${this.trainer.name}</ion-label>
                                <ion-icon slot="start" name="person-circle-outline"></ion-icon>
                                ${this.checkIfTrainerIsCurrentUser(this.trainer.id!) ?
                                    html`` : html` <ion-button slot="end" size="small" fill="outline" type="button" @click="${() => this.openChatWithMember(this.trainer.id!, this.trainer.name!, this.trainer.mail!, this.trainer.createdAt!)}">Chat</ion-button>
                                    `}
                            </ion-item>
                            <ion-item lines="full">
                                <ion-label>Wochentag: ${this.course.dayOfWeek}</ion-label>
                                <ion-icon slot="start" name="calendar-outline"></ion-icon>
                            </ion-item>
                            <ion-item lines="full">
                                <ion-label>Beginn: ${this.course.startTime} Uhr</ion-label>
                                <ion-icon slot="start" name="time-outline"></ion-icon>
                            </ion-item>
                            <ion-item lines="full">
                                <ion-label>Ende: ${this.course.endTime} Uhr</ion-label>
                                <ion-icon slot="start" name="time-outline"></ion-icon>
                            </ion-item>
                            <ion-item lines="full">
                                <ion-label>Zeitraum: ${format(new Date(this.course.startDate!), 'dd.MM.yyyy')} bis  ${format(new Date(this.course.endDate!), 'dd.MM.yyyy')}</ion-label>
                                <ion-icon slot="start" name="calendar-number-outline"></ion-icon>
                            </ion-item>
                            <ion-item lines="none">
                                <ion-button fill="outline" type="button" @click="${() => this.bookCourse(this.course!)}">Kurs buchen</ion-button>
                                ${authenticationService.isTrainer() ? html`
                                    <ion-button fill="outline" color="danger" type="button" @click="${() => this.deleteCourse(this.course.id!)}">Kurs löschen</ion-button>
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
            await httpClient.post('/memberincourses', memberInCourse);
            notificationService.showNotification(`Der Kurs ${courseToBook.name} wurde erfolgreich gebucht!` , "info");
        } catch (error) {
            notificationService.showNotification((error as Error).message , "error");
        }
    }

    async deleteCourse(courseId: string) {
        await httpClient.delete('/courses/' + courseId);
        router.navigate(`course`);
    }

    async openChatWithMember(memberId: string, memberName: string, memberEmail: string, memberCreatedAt: string) {
        router.navigate(`chat/${memberId}/${memberCreatedAt}/${memberEmail}/${memberName}`);

    }

    checkIfTrainerIsCurrentUser(trainerId: string){
        return trainerId === authenticationService.getUser().id;
    }
}