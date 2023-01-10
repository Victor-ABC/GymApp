/* Autor: Pascal Thesing */
import { LitElement, html } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';
import { notificationService } from '../../notification.js';
import { repeat } from 'lit/directives/repeat.js';
import { format } from 'date-fns';
import { IonItem, IonSlides, IonText, IonTextarea } from '@ionic/core/components';
import { Camera, CameraResultType } from '@capacitor/camera';
import componentStyle from './exercise-create.css';
import { TaskSyncDao } from "./../../offline/sync-dao";


@customElement('app-exercise-create')
class ExerciseCreateComponent extends PageMixin(LitElement){
    static styles = [componentStyle];

    @state() private exercisePictures: Array<string> = [];

    @query('#imageSwiper') private imageSwiper!: IonSlides;
    @query('#description') private description!: IonText;
    @query('#taskType') private taskType!: HTMLIonSelectElement;
    @query('#muscle') private muscle!: HTMLIonSelectElement;
    @query('#name') private name!: IonText;
    async firstUpdated() {
    }

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
      }

    render() {
        return this.buildBody();
    }

    openCreateExercise(): void {
        router.navigate('exercises/create');
    }

    async takePhoto() {
      try {
        const photo = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.Base64
        });
        const articlePictures = this.exercisePictures;
        articlePictures.push('data:image/jpeg;charset=utf-8;base64,' + photo.base64String!);
        this.exercisePictures = [];
        this.exercisePictures = [...articlePictures];
      } catch (e) {
        console.warn('User cancelled', e);
      }
    }
  
    async deletePicture() {
      const index = await this.imageSwiper.getActiveIndex();
      const halfBefore = this.exercisePictures.slice(0, index);
      const halfAfter = this.exercisePictures.slice(index + 1);
      const newArticlePictures = halfBefore.concat(halfAfter);
      this.exercisePictures = [];
      this.exercisePictures = [...newArticlePictures];
    }

    async submit() {
      const task = {
        pictures: this.exercisePictures,
        name: this.name.value,
        description: this.description.value,
        taskType: this.taskType.value,
        muscle: this.muscle.value
      }
    
      await TaskSyncDao.create(task);
      router.navigate('/exercises');
    }
  

    buildBody() {
        return html `
        <ion-content class="ion-padding">
        <h1>Übung erstellen</h1>
        <form>
            <ion-card>
                <ion-card-content>
                <ion-slides id="imageSwiper" pager="true">
                ${this.exercisePictures!.length == 0
                  ? html` <ion-slide>
                      <img id="standardUploadImage" src="./standardUploadImage.png" />
                    </ion-slide>`
                  : null}
                ${this.exercisePictures!.map(exercisePicture => {
                  return html`<ion-slide><img class="uploadedImages" src="${exercisePicture}" /></ion-slide>`;
                })}
              </ion-slides>
              <ion-item lines="full">
                    <ion-grid>
                      <ion-row>
                        ${this.exercisePictures.length <= 6
                          ? html`<ion-col
                              ><ion-button id="pictureBtn" expand="block" @click="${this.takePhoto}"
                                >Ein foto machen</ion-button
                              ></ion-col
                            >`
                          : html`<ion-col
                              ><ion-button expand="block" disabled="true"
                                >Maximale Anzahl an fotos</ion-button
                              ></ion-col
                            >`}
                        ${this.exercisePictures.length > 0
                          ? html`<ion-col
                              ><ion-button id="deletePictureBtn" expand="block" @click="${this.deletePicture}"
                                >Foto löschen</ion-button
                              ></ion-col
                            >`
                          : null}
                      </ion-row>
                    </ion-grid>
                  </ion-item>

                    <ion-item>
                        <ion-label position="fixed">Name</ion-label>
                        <ion-input type="text" required placeholder="Übungsname vergeben" id="name"></ion-input>
                    </ion-item>
                    <ion-item>
                            <ion-label position="fixed">Art</ion-label>
                            <ion-select interface="alert" placeholder="Art wählen" id="taskType">
                                <ion-select-option value="cardio">Cardio</ion-select-option>
                                <ion-select-option value="weight">Gewicht heben</ion-select-option>
                            </ion-select>
                      </ion-item>
                      <ion-item>
                      <ion-label position="fixed">Muskel</ion-label>
                      <ion-select interface="alert" placeholder="Art wählen" id="muscle">
                          <ion-select-option value="Brust">Brust</ion-select-option>
                          <ion-select-option value="Beine">Beine</ion-select-option>
                      </ion-select>
                </ion-item>
                    <ion-item>
                        <ion-label position="fixed">Beschreibung</ion-label>
                        <ion-input type="text" required placeholder="Beschreibung vergeben" id="description"></ion-input>
                    </ion-item>
                </ion-card-content>
            </ion-card>
            <ion-row>
            <ion-col>
                <ion-button color="primary" type="button" @click="${this.submit}" expand="block">Workout erstellen</ion-button>
            </ion-col>
        </ion-row>
          </form?
        `;
    }
}