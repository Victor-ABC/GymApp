/* Autor: Pascal Thesing (FH Münster) */

import { IonRouter } from '@ionic/core/components';
import { html } from 'lit';
  
export class RouterService {
    public navigate(url: string) {
        const router = document.getElementById('router') as IonRouter;

        router.push(url)
  }
}
  
  export const router = new RouterService();
  