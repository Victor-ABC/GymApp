/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import { expect } from 'chai';
import { UserSession } from './user-session.js';

describe('/users/sign-in', () => {
  let userSession: UserSession;

  beforeEach(async () => {
    userSession = new UserSession();
  });

  it('should fail given wrong credentials', async () => {
    const response = await userSession.post('/users/sign-in', userSession.signInData());
    expect(response.status).to.equal(401);
  });

  it('should succeed given proper credentials', async () => {
    await userSession.registerUser();
    const response = await userSession.post('/users/sign-in', userSession.signInData());
    expect(response.status).to.equal(201);
    userSession.deleteUser();
  });
});
