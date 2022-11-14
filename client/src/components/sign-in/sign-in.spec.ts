/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import { expect } from 'chai';
import { fixture } from '@open-wc/testing-helpers';
import './sign-in';

describe('app-sign-in', () => {
  it('should render the title "Anmelden"', async () => {
    const element = await fixture('<app-sign-in></app-sign-in>');
    const h1Elem = element.shadowRoot!.querySelector('h1') as HTMLElement;
    expect(h1Elem.innerText).to.equal('Anmelden');
  });
});
