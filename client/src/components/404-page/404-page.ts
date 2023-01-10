/* Autor: Pascal Thesing */

import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('app-404-page')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Page404Component extends LitElement {

  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  } 

  render() {
    return html`
    <div class="site-not-found">
      <h1>Leider gibt es die angeforderte Seite nicht!</h1>
      <p>Deshlab starte dein Training durch mit Gym+</p>
      <div>
        <img src="./favicon.png"/>
      </div>
    </div>
    `;
  }
}
