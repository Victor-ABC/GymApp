import { LitElement, html } from 'lit';
import { customElement, state, query, property } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { PageMixin } from '../page.mixin.js';
import { format } from 'date-fns';
import { router } from '../../router/router.js';


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
    bookingDate?: string
}

@customElement('app-coursebooking-detail')
class CourseBookingDetailComponent extends PageMixin(LitElement) {

    @property() id = '';

    @state() private coursebooking: CourseBooking = {startDate: new Date(), endDate: new Date()};

    async firstUpdated() {
        const response = await httpClient.get('/memberincourses/' + this.id);
        this.coursebooking = (await response.json()).result;
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
                            <ion-card-title>${this.coursebooking.name}</ion-card-title>
                        </ion-card-header>
                        <ion-card-content>
                            <ion-item lines="full">
                                <ion-label>Buchungszeitpunkt: ${this.coursebooking.bookingDate}</ion-label>
                                <ion-icon slot="start" name="document-text-outline"></ion-icon>
                            </ion-item>
                            <ion-item lines="full">
                                <ion-label>Beschreibung: ${this.coursebooking.description}</ion-label>
                                <ion-icon slot="start" name="document-text-outline"></ion-icon>
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
                                <ion-label>Erster Termin: ${format(new Date(this.coursebooking.startDate!), 'dd.MM.yyyy')}</ion-label>
                                <ion-icon slot="start" name="calendar-number-outline"></ion-icon>
                            </ion-item>
                            <ion-item lines="full">
                                <ion-label>Letzter Termin: ${format(new Date(this.coursebooking.endDate!), 'dd.MM.yyyy')}</ion-label>
                                <ion-icon slot="start" name="calendar-number-outline"></ion-icon>
                            </ion-item>
                            <ion-item lines="none">
                                <ion-button color="danger" fill="outline" type="button" @click="${() => this.deleteCourseBooking(this.coursebooking.bookingId!)}">Buchung stornieren</ion-button>
                            </ion-item>
                        </ion-card-content>
                    </ion-card>
                </div>
            </ion-content>
        `;
    }

    async deleteCourseBooking(bookingId: string) {
        await httpClient.delete('/memberincourses/' + bookingId);
        router.navigate(`home`);
      }

}