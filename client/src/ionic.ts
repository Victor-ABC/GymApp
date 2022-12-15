
import * as IonComponents from '@ionic/core/components';
import { addIcons } from 'ionicons';

Object.keys(IonComponents).forEach(key => {
    if (/^Ion[A-Z]\w+$/.test(key)) {
      customElements.define(key.split(/(?=[A-Z])/).join('-').toLowerCase(), IonComponents[key]);
    }
});

import { initialize } from '@ionic/core/components';
import '@ionic/core/css/ionic.bundle.css';

// Icons that are used by internal components
import { arrowBackSharp, informationCircleOutline, caretBackSharp, chevronBack, chevronDown, chevronForward, close, closeCircle, closeSharp, menuOutline, menuSharp, reorderThreeOutline, reorderTwoSharp, searchOutline, searchSharp, todayOutline } from 'ionicons/icons';

// Application specific icons
import { home, logoHtml5, logoCss3, logoJavascript, logoNodejs, logoPython, settings } from 'ionicons/icons';

import '@ionic/core/css/core.css'; // core ist die Minimalanforderung

initialize();

addIcons({
  'information-circle-outline' : informationCircleOutline,
  'arrow-back-sharp': arrowBackSharp,
  'caret-back-sharp': caretBackSharp,
  'chevron-back': chevronBack,
  'chevron-forward': chevronForward,
  'chevron-down': chevronDown,
  'close': close,
  'close-circle': closeCircle,
  'close-sharp': closeSharp,
  'menu-outline': menuOutline,
  'menu-sharp': menuSharp,
  'reorder-two-sharp': reorderTwoSharp,
  'reorder-three-outline': reorderThreeOutline,
  'search-outline': searchOutline,
  'search-sharp': searchSharp,
});

addIcons({
  'home': home,
  'logo-javascript': logoJavascript,
  'logo-html5': logoHtml5,
  'logo-css3': logoCss3,
  'logo-nodejs': logoNodejs,
  'logo-python': logoPython,
  'settings': settings
});

document.documentElement.classList.add('ion-ce');
