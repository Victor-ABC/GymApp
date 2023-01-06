/* Autor: Pascal Thesing (FH Münster) */

import { IonRouter } from '@ionic/core/components';
import { html } from 'lit';
  
export class RouterService {
    private router: IonRouter;

    public init(router) {
        this.router = router;
    }

    public navigate(url: string) {
        this.router.push(url)
  }
}
  
  export const router = new RouterService();
  