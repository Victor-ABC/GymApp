/* Autor: Pascal Thesing */

import { Capacitor } from '@capacitor/core';
import { repeat } from 'ionicons/icons';
import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { AuthenticationService, authenticationService } from '../../authenticationService';
import { UserSyncDao } from '../../offline/sync-dao';
import { router } from '../../router/router';
import { repeat } from 'lit/directives/repeat.js';
import { IonPopover } from '@ionic/core/components';

@customElement('app-user-overview')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class UserOverviewComponent extends LitElement {

  @state() private users: Object[] = [];

  async firstUpdated() {
      this.users = await UserSyncDao.findAll();
      this.authUser = authenticationService.getUser();
  }


  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }

  render() {
    return html `
        <ion-content class="ion-padding">
            <div class="header-overview">
            ${!Capacitor.isNativePlatform() ? html`
            <h1>User-Übersicht</h1>
          ` : null }
                ${authenticationService.isTrainer() && Capacitor.getPlatform() === 'web' ? html`
                    <ion-button @click="${() => this.openCreateUser()}">
                        <ion-icon slot="icon-only" name="add"></ion-icon>
                    </ion-button>
                ` : html``}
            </div>
            <div class="users">
                    <ion-card>
                    <ion-card-content>
                    ${this.users.length === 0 ?
                        html`<div class="no-content">Keine User im System</div>` : html`
                        <ion-list>
                            ${repeat(
                                this.users,
                                (user, index) => html`
                                    ${this.authUser.id === user.id ? null : html` 
                                    <ion-item-sliding>
                                        <ion-item>
                                            <ion-thumbnail slot="start">
                                            ${user.avatar ? html`
                                            <img alt="Silhouette of mountains" src="${user.avatar}"/>
                                            `: html`
                                            <img alt="Silhouette of mountains" src="./avatar.png"/>
                                            ` }
                                            </ion-thumbnail>
                                            <ion-label>${user.name}</ion-label>
                                            <ion-button fill="clear" @click="${() => this.openUser(user.id)}">Details</ion-button>
                                            <ion-button fill="clear" id="click-trigger-${index}">
                                                <ion-icon slot="icon-only" name="menu-sharp"></ion-icon>
                                            </ion-button>
                                            <ion-popover trigger="click-trigger-${index}" id="popover-${index}" trigger-action="click">
                                                <ion-list mode="ios">
                                                        <ion-item button="true" color="danger" detail="false" @click="${() => this.deleteUser(user.id, index)}">User löschen</ion-item>
                                                        <ion-item button="true" color="warning" detail="false" @click="${() => this.editUser(user.id, index)}">User editieren</ion-item>
                                                </ion-list>
                                            </ion-popover>
                                        </ion-item>

                                        <ion-item-options side="end">
                                          <ion-item-option color="danger" @click="${() => this.deleteUser(user.id)}">
                                            <ion-icon slot="icon-only" name="trash"></ion-icon>
                                          </ion-item-option>
                                          <ion-item-option color="warning" @click="${() => this.editUser(user.id)}">
                                            <ion-icon slot="icon-only" name="pencil-outline"></ion-icon>
                                          </ion-item-option>
                                      </ion-item-options>

                                    </ion-item-sliding>`}
                                `
                            )}
                        </ion-list>
                        `}
                    </ion-card-content>
                </ion-card>                
            </div>
        </ion-content>
    `;
}

openUser(userId: string, index: string) {
    router.navigate(`users/detail/${userId}`);
    const popover = document.getElementById('popover-' + index) as IonPopover;
    popover.dismiss();
}

editUser(userId: string, index: string) {
  router.navigate(`users/edit/${userId}`);
  const popover = document.getElementById('popover-' + index) as IonPopover;
  popover.dismiss();
}

openCreateUser() {
    router.navigate(`users/create`);
}

async deleteUser(userId: string) {
    await UserSyncDao.delete(userId);
    this.firstUpdated();
}
}
