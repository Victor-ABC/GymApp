import { LitElement, html } from 'lit';
import { customElement, state, query, property } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';
import { notificationService } from '../../notification.js';
import { repeat } from 'lit/directives/repeat.js';
import { format } from 'date-fns';
import componentStyle from './course-bookings.css';

interface Course {
    id: string;
    name: string;
    description: string;
    dayOfWeek: string;
    startDate: Date;
    endDate: Date;
    startTime: string;
    endTime: string;
    bookingDate: string;
    bookingId: string;
}

interface Booking {
    id: string;
    memberId: string;
    courseId: string;
    createdAt: string;
}

@customElement('app-course-bookings')
class CourseBookingsComponent extends PageMixin(LitElement){
    //static styles = [componentStyle]; 

    @state() private bookedCourse!: Course;
    @state() private mycourses: Course[] = [];
    @state() private bookings: Booking[] = [];

    private dataReady: Boolean = false;
 
    static get properties() {
        return {
          dataReady: {type: Boolean}
        };
    }


    async firstUpdated() {
        try {
          const responseBookings = await httpClient.get('/memberincourses');
          this.bookings = (await responseBookings.json()).results;

          for(const booking of this.bookings) {
            const resonseBookedCourse = await httpClient.get(`/courses/${booking.courseId}`);
            this.bookedCourse = (await resonseBookedCourse.json()).course;
            this.bookedCourse.bookingDate = format(new Date(booking.createdAt), 'dd.MM.yyyy HH:mm');
            this.bookedCourse.bookingId = booking.id;
            this.mycourses.push(this.bookedCourse)
          }

        } catch (e) {
            if ((e as { statusCode: number }).statusCode === 401) {
              router.navigate('/users/sign-in');
            } else {
              notificationService.showNotification((e as Error).message, 'error');
            }
        }
        finally {
            this.dataReady = true;
        }
    }

    render() {
        return this.buildBody();
    }

    buildBody(){
       return html `
            <ion-content class="ion-padding">
                <h1>Meine Buchungen</h1>
                <div class="courses">
                    ${repeat(
                        this.mycourses,
                        course => course.id,
                        course => html`
                            <div class="course">
                                <ion-card>
                                    <ion-card-header>
                                        <ion-card-title>${course.name}</ion-card-title>
                                    </ion-card-header>
                                    <ion-card-content>

                                        <ion-item lines="full">
                                            <ion-label>Buchungszeitpunkt: ${course.bookingDate}</ion-label>
                                            <ion-icon slot="start" name="time-outline"></ion-icon>
                                        </ion-item>
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
                                            <ion-button fill="outline" type="button" @click="${() => this.removeCourse(course)}">Remove Course</ion-button>
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

    removeCourse(courseToRemove: Course) {
        try {
            httpClient.delete('/memberincourses/' + courseToRemove.bookingId);
            window.location.reload();
        } catch (error) {
            notificationService.showNotification((error as Error).message , "error");
        }
    }
}