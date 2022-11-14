/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import { expect } from 'chai';
import sinon from 'sinon';
import { LitElement } from 'lit';
import { fixture } from '@open-wc/testing-helpers';
import { httpClient } from '../../http-client.js';
import './tasks';

describe('app-tasks', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should fetch the tasks on first update', async () => {
    const stub = sinon.stub(httpClient, 'get');
    const element = (await fixture('<app-tasks></app-tasks>')) as LitElement;
    await element.updateComplete;
    expect(stub.calledOnce).to.be.true;
  });

  it('should render the fetched tasks', async () => {
    const tasks = [
      { id: 1, title: 'Aufgabe 1', status: 'done' },
      { id: 2, title: 'Aufgabe 2', status: 'open' }
    ];

    sinon.stub(httpClient, 'get').returns(
      Promise.resolve({
        json() {
          return Promise.resolve({ results: tasks });
        }
      } as Response)
    );

    const element = (await fixture('<app-tasks></app-tasks>')) as LitElement;
    await element.updateComplete;
    element.requestUpdate(); // da in firstUpdated() das Property tasks asynchron gesetzt wird
    await element.updateComplete;

    const taskElems = element.shadowRoot!.querySelectorAll('app-task');
    expect(taskElems.length).to.equal(2);
  });
});
