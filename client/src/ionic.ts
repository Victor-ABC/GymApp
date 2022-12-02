import { IonApp } from '@ionic/core/components/ion-app.js';
import { IonBackButton } from '@ionic/core/components/ion-back-button.js';
import { IonButton } from '@ionic/core/components/ion-button.js';
import { IonButtons } from '@ionic/core/components/ion-buttons.js';
import { IonCheckbox } from '@ionic/core/components/ion-checkbox.js';
import { IonCol } from '@ionic/core/components/ion-col.js';
import { IonContent } from '@ionic/core/components/ion-content.js';
import { IonFooter } from '@ionic/core/components/ion-footer';
import { IonHeader } from '@ionic/core/components/ion-header';

import { IonIcon } from 'ionicons/components/ion-icon.js';
import { IonInput } from '@ionic/core/components/ion-input.js';
import { IonItem } from '@ionic/core/components/ion-item.js';
import { IonItemDivider } from '@ionic/core/components/ion-item-divider';
import { IonGrid } from '@ionic/core/components/ion-grid';
import { IonItemGroup } from '@ionic/core/components/ion-item-group';
import { IonLabel } from '@ionic/core/components/ion-label.js';
import { IonList } from '@ionic/core/components/ion-list.js';
import { IonListHeader } from '@ionic/core/components/ion-list-header.js';
import { IonMenu } from '@ionic/core/components/ion-menu.js';
import { IonMenuButton } from '@ionic/core/components/ion-menu-button.js';
import { IonMenuToggle } from '@ionic/core/components/ion-menu-toggle';
import { IonNav } from '@ionic/core/components/ion-nav.js';
import { IonRippleEffect } from '@ionic/core/components/ion-ripple-effect.js';
import { IonRow } from '@ionic/core/components/ion-row.js';
import { IonRoute } from '@ionic/core/components/ion-route.js'
import { IonRouteRedirect } from '@ionic/core/components/ion-route-redirect'
import { IonRouter } from '@ionic/core/components/ion-router.js'
import { IonRouterLink } from '@ionic/core/components/ion-router-link'
import { IonRouterOutlet } from '@ionic/core/components/ion-router-outlet'
import { IonTab } from '@ionic/core/components/ion-tab.js';
import { IonTabBar } from '@ionic/core/components/ion-tab-bar.js';
import { IonTabButton } from '@ionic/core/components/ion-tab-button.js';
import { IonTabs } from '@ionic/core/components/ion-tabs.js';
import { IonTitle } from '@ionic/core/components/ion-title.js';
import { IonToggle } from '@ionic/core/components/ion-toggle.js';
import { IonToolbar } from '@ionic/core/components/ion-toolbar.js';
import { addIcons } from 'ionicons';
import { IonCard } from '@ionic/core/components/ion-card';
import { IonCardContent } from '@ionic/core/components/ion-card-content';
import { IonCardHeader } from '@ionic/core/components/ion-card-header';
import { IonCardTitle } from '@ionic/core/components/ion-card-title';
import { IonCardSubtitle } from '@ionic/core/components/ion-card-subtitle';
 

import { IonProgressBar } from '@ionic/core/components/ion-progress-bar';

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

customElements.define('ion-card', IonCard);
customElements.define('ion-card-content', IonCardContent);
customElements.define('ion-card-header', IonCardHeader);
customElements.define('ion-card-title', IonCardTitle);
customElements.define('ion-card-subtitle', IonCardSubtitle);
customElements.define('ion-progress-bar', IonProgressBar);
customElements.define('ion-app', IonApp);
customElements.define('ion-back-button', IonBackButton);
customElements.define('ion-button', IonButton);
customElements.define('ion-buttons', IonButtons);
customElements.define('ion-checkbox', IonCheckbox);
customElements.define('ion-col', IonCol);
customElements.define('ion-content', IonContent);
customElements.define('ion-footer', IonFooter);
customElements.define('ion-grid', IonGrid);
customElements.define('ion-header', IonHeader);
customElements.define('ion-icon', IonIcon as any);
customElements.define('ion-input', IonInput);
customElements.define('ion-item', IonItem);
customElements.define('ion-item-divider', IonItemDivider);
customElements.define('ion-item-group', IonItemGroup);
customElements.define('ion-label', IonLabel);
customElements.define('ion-list', IonList);
customElements.define('ion-list-header', IonListHeader);
customElements.define('ion-menu', IonMenu);
customElements.define('ion-menu-button', IonMenuButton);
customElements.define('ion-menu-toggle', IonMenuToggle);
customElements.define('ion-nav', IonNav);
customElements.define('ion-route', IonRoute);
customElements.define('ion-route-redirect', IonRouteRedirect);
customElements.define('ion-router', IonRouter);
customElements.define('ion-router-link', IonRouterLink);
customElements.define('ion-router-outlet', IonRouterOutlet);
customElements.define('ion-ripple-effect', IonRippleEffect);
customElements.define('ion-row', IonRow);
customElements.define('ion-tab', IonTab);
customElements.define('ion-tab-bar', IonTabBar);
customElements.define('ion-tab-button', IonTabButton);
customElements.define('ion-tabs', IonTabs);
customElements.define('ion-title', IonTitle);
customElements.define('ion-toggle', IonToggle);
customElements.define('ion-toolbar', IonToolbar);

document.documentElement.classList.add('ion-ce');
