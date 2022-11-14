/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import { expect } from 'chai';
import { UserSession } from './user-session.js';

describe('/tasks', () => {
  let userSession: UserSession;

  beforeEach(async () => {
    userSession = new UserSession();
    await userSession.registerUser();
  });

  afterEach(async () => {
    await userSession.deleteUser();
  });

  describe('#POST', () => {
    it('should return a proper task json document', async () => {
      const now = new Date().getTime();
      const response = await userSession.post('/tasks', {
        title: 'Testaufgabe 1'
      });
      expect(response.status).to.equal(201);
      const json = (await response.json()) as Record<string, string>;
      expect(json.title).to.equal('Testaufgabe 1');
      expect(json.id).not.to.be.empty;
      expect(json.createdAt).not.to.be.undefined;
      expect(Number(json.createdAt)).to.be.greaterThanOrEqual(now);
    });
  });

  describe('#GET', () => {
    it('should return an empty list of tasks given a new user', async () => {
      const response = await userSession.get('/tasks');
      expect(response.status).to.equal(200);
      const json = (await response.json()) as { results: Array<Record<string, string>> };
      expect(json.results).to.deep.equal([]);
    });

    it('should return a list with a single task given a user with a single task', async () => {
      await userSession.post('/tasks', { title: 'Testaufgabe 1' });

      const response = await userSession.get('/tasks');
      expect(response.status).to.equal(200);
      const json = (await response.json()) as { results: Array<Record<string, string>> };
      expect(json.results.length).to.equal(1);
      expect(json.results[0].title).to.equal('Testaufgabe 1');
    });
  });
});
