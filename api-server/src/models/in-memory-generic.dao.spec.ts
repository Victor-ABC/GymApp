/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import { expect } from 'chai';
import { InMemoryGenericDAO } from './in-memory-generic.dao.js';
import { Entity } from './entity.js';

interface Person extends Entity {
  name: string;
}

describe('InMemoryGenericDAO', () => {
  let personDAO: InMemoryGenericDAO<Person>;

  beforeEach(() => {
    personDAO = new InMemoryGenericDAO<Person>();
  });

  describe('#create()', () => {
    it('should return a promise', () => {
      const promise = personDAO.create({ name: 'john doe' });
      expect(promise).to.be.an.instanceof(Promise);
    });

    it('should set the id property', async () => {
      const person = await personDAO.create({ name: 'john doe' });
      expect(person.id).not.to.be.empty;
    });
  });

  describe('#findOne()', () => {
    it('should return an object given its id', async () => {
      const createdPerson = await personDAO.create({ name: 'john doe' });
      const retrievedPerson = await personDAO.findOne({ id: createdPerson.id });
      expect(retrievedPerson).to.deep.equal(createdPerson);
    });
  });
});
