import { LitElement, html } from 'lit';
import { customElement, state, query, property } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { PageMixin } from '../page.mixin.js';
import { format } from 'date-fns';
import { router } from '../../router/router.js';
import { repeat } from 'lit/directives/repeat.js';
import { authenticationService } from '../../authenticationService.js';



interface CourseBooking {
    id?: string;
    name?: string;
    description?: string;
    dayOfWeek?: string;
    startDate: Date;
    endDate: Date;
    startTime?: string;
    endTime?: string;
    bookingId?: string,
    bookingDate?: string,
    trainerId?: string
}

interface Member {
    id: string;
    name: string;
    email: string;
}

interface Trainer {
    id?: string;
    name?: string;
}

@customElement('app-coursebooking-detail')
class CourseBookingDetailComponent extends PageMixin(LitElement) {

    @property() id = '';

    @state() private coursebooking: CourseBooking = {startDate: new Date(), endDate: new Date()};
    @state() private member: Member[] = [];
    @state() private trainer: Trainer = {};


    async firstUpdated() {
        const responseBooking = await httpClient.get('/memberincourses/' + this.id);
        this.coursebooking = (await responseBooking.json()).result;

        const trainerResponse = await httpClient.get('users/' + this.coursebooking.trainerId);
        this.trainer = (await trainerResponse.json()).result;

        const responseMember = await httpClient.get('memberincourses/member/' + this.coursebooking.id);
        this.member = (await responseMember.json()).result;
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

                <ion-grid>
                    <ion-row>
                        <ion-col>
                            <ion-card>
                                <ion-card-header>
                                    <ion-card-title>${this.coursebooking.name}</ion-card-title>
                                </ion-card-header>
                                <ion-card-content>
                                    <ion-item lines="full">
                                        <ion-label>Buchungszeitpunkt: ${this.coursebooking.bookingDate}</ion-label>
                                        <ion-icon slot="start" name="create-outline"></ion-icon>
                                    </ion-item>
                                    <ion-item lines="full">
                                        <ion-label>Beschreibung: ${this.coursebooking.description}</ion-label>
                                        <ion-icon slot="start" name="document-text-outline"></ion-icon>
                                    </ion-item>
                                    <ion-item lines="full">
                                        <ion-label>Trainer: ${this.trainer.name}</ion-label>
                                        <ion-icon slot="start" name="person-circle-outline"></ion-icon>
                                    </ion-item>
                                    <ion-item lines="full">
                                        <ion-label>Wochentag: ${this.coursebooking.dayOfWeek}</ion-label>
                                        <ion-icon slot="start" name="calendar-outline"></ion-icon>
                                    </ion-item>
                                    <ion-item lines="full">
                                        <ion-label>Beginn: ${this.coursebooking.startTime} Uhr</ion-label>
                                        <ion-icon slot="start" name="time-outline"></ion-icon>
                                    </ion-item>
                                    <ion-item lines="full">
                                        <ion-label>Ende: ${this.coursebooking.endTime} Uhr</ion-label>
                                        <ion-icon slot="start" name="time-outline"></ion-icon>
                                    </ion-item>
                                    <ion-item lines="full">
                                        <ion-label>Zeitraum: ${format(new Date(this.coursebooking.startDate!), 'dd.MM.yyyy')} bis  ${format(new Date(this.coursebooking.endDate!), 'dd.MM.yyyy')}</ion-label>
                                        <ion-icon slot="start" name="calendar-number-outline"></ion-icon>
                                    </ion-item>
                                    <ion-item lines="none">
                                        <ion-button color="danger" fill="outline" type="button" @click="${() => this.deleteCourseBooking(this.coursebooking.bookingId!)}">Buchung stornieren</ion-button>
                                    </ion-item>
                                </ion-card-content>
                            </ion-card>
                        </ion-col>
                        <ion-col>
                            <ion-card>
                                <ion-card-content>
                                    <ion-accordion-group>
                                        <ion-accordion>
                                            <ion-item slot="header">
                                                <ion-label>Teilnehmer</ion-label>
                                                <ion-icon slot="start" name="people-outline"></ion-icon>
                                            </ion-item>
                                            ${repeat(
                                                this.member,
                                                member => member.id,
                                                member => html`
                                                    <div slot="content">
                                                        <ion-item>
                                                            <ion-label>${member.email}</ion-label>
                                                            ${this.checkIfMemberIsCurrentUser(member.id) ?
                                                                html`` : html` <ion-button slot="end" size="small" fill="outline" type="button" @click="${() => this.openChatWithMember(member.id)}">Chat</ion-button>
                                                                `}
                                                        </ion-item>
                                                    </div>
                                                `)}
                                        </ion-accordion>
                                    </ion-accordion-group>
                                </ion-card-content>
                            </ion-card>
                        </ion-col>
                    </ion-row>
                </ion-grid>
            </ion-content>
        `;
    }

    async deleteCourseBooking(bookingId: string) {
        await httpClient.delete('/memberincourses/' + bookingId);
        router.navigate(`home`);
      }

    async openChatWithMember(memberId: string) {
        router.navigate('chat/' + memberId)
    }

    checkIfMemberIsCurrentUser(memberId: string){
        return memberId === authenticationService.getUser().id;
    }

}