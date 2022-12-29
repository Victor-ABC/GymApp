import { LitElement, html } from 'lit';
import { customElement, state, query, property } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { PageMixin } from '../page.mixin.js';
import { format } from 'date-fns';

interface Course {
    id?: string;
    name?: string;
    description?: string;
    dayOfWeek?: string;
    startDate: Date;
    endDate: Date;
    startTime?: string;
    endTime?: string;
}

@customElement('app-course-detail')
class CourseDetailComponent extends PageMixin(LitElement){ 
    
    @property() id = '';

    @state() private course: Course = {startDate: new Date(), endDate: new Date()};

    async firstUpdated() {
        const response = await httpClient.get('/courses/' + this.id);
        this.course = (await response.json()).course;
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
                                <ion-label>Erster Termin: ${format(new Date(this.course.startDate!), 'dd.MM.yyyy')}</ion-label>
                                <ion-icon slot="start" name="calendar-number-outline"></ion-icon>
                            </ion-item>
                            <ion-item lines="full">
                                <ion-label>Letzter Termin: ${format(new Date(this.course.endDate!), 'dd.MM.yyyy')}</ion-label>
                                <ion-icon slot="start" name="calendar-number-outline"></ion-icon>
                            </ion-item>
                        </ion-card-content>
                    </ion-card>
                </div>
            </ion-content>
        `;
    }
}