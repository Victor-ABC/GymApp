/* Autor: Pascal Thesing (FH Münster) */

import { html } from 'lit';
  
export class NotificationService {
    private element;

    public init(element) {
        this.element = element;
    }

    public showNotification(content = '', type: 'error' | 'info' = 'info') {
        this.element.showNotification(content, type);
  }
}
  
  export const notificationService = new NotificationService();
  