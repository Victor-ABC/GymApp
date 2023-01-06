import * as IonComponents from '@ionic/core/components';
import { addIcons } from 'ionicons';


Object.keys(IonComponents).forEach(key => {
    if (/^Ion[A-Z]\w+$/.test(key)) {
      customElements.define(key.split(/(?=[A-Z])/).join('-').toLowerCase(), IonComponents[key]);
    }
});

import { initialize } from '@ionic/core/components';
import '@ionic/core/css/ionic.bundle.css';

import * as IonIcons from 'ionicons/icons';


let icons = {};
Object.keys(IonIcons).forEach(key => {
    let formattedKey = key.split(/(?=[A-Z])/).join('-').toLowerCase();
    icons[formattedKey] = IonIcons[key];
});


import '@ionic/core/css/core.css'; // core ist die Minimalanforderung

initialize();


addIcons(icons);


document.documentElement.classList.add('ion-ce');


