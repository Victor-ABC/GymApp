/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import { v4 as uuidv4 } from 'uuid';
import { Entity } from './entity.js';
import { GenericDAO } from './generic.dao.js';

export class InMemoryGenericDAO<T extends Entity> implements GenericDAO<T> {
  private entities = new Map<string, T>();

  public async create(partEntity: Omit<T, keyof Entity>) {
    const entity = { ...partEntity, id: uuidv4(), createdAt: new Date().getTime() };
    this.entities.set(entity.id, entity as T);
    return Promise.resolve(entity as T);
  }

  public async findAll(entityFilter?: Partial<T>) {
    const result = [] as T[];
    for (const entity of this.entities.values()) {
      if (!entityFilter || this._matches(entity, entityFilter)) {
        result.push(entity);
      }
    }
    return Promise.resolve(result);
  }

  public async findOne(entityFilter: Partial<T>) {
    for (const entity of this.entities.values()) {
      if (this._matches(entity, entityFilter)) {
        return Promise.resolve(entity);
      }
    }
    return Promise.resolve(null);
  }

  public async update(entity: Partial<T> & Pick<Entity, 'id'>) {
    if (entity.id && this.entities.has(entity.id)) {
      this._update(this.entities.get(entity.id)!, entity);
      return Promise.resolve(true);
    } else {
      return Promise.resolve(false);
    }
  }

  public async delete(id: string) {
    return Promise.resolve(this.entities.delete(id));
  }

  public async deleteAll(entityFilter?: Partial<T>) {
    if (!entityFilter) {
      const entityCount = this.entities.size;
      this.entities.clear();
      return Promise.resolve(entityCount);
    } else {
      const entities = await this.findAll(entityFilter);
      for (const entity of entities) {
        this.entities.delete(entity.id);
      }
      return Promise.resolve(entities.length);
    }
  }

  private _matches(entity: T, filter: Partial<T>) {
    for (const prop of Object.getOwnPropertyNames(filter) as [keyof Partial<T>]) {
      if (entity[prop] !== filter[prop]) {
        return false;
      }
    }
    return true;
  }

  private _update(entity: T, updateEntity: Partial<T>) {
    for (const prop of Object.getOwnPropertyNames(updateEntity) as [keyof Partial<T>]) {
      entity[prop] = updateEntity[prop]!;
    }
  }
}
