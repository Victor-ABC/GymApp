/* Autor: Henrik Bruns */

import { IonRouter } from '@ionic/core/components';
import { html } from 'lit';
  
export class RouterService {
    public async navigate(url: string) {
        const router = document.getElementById('router') as IonRouter;

        await router.push(url);
  }
}
  
  export const router = new RouterService();
  