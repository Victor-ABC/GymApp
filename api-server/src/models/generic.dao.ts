/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import { Entity } from './entity.js';

export interface GenericDAO<T extends Entity> {
  create(partEntity: Omit<T, keyof Entity>): Promise<T>;

  findAll(entityFilter?: Partial<T>): Promise<T[]>;

  findOne(entityFilter: Partial<T>): Promise<T | null>;

  update(entity: Partial<T>): Promise<boolean>;

  delete(id: string): Promise<boolean>;

  deleteAll(entityFilter?: Partial<T>): Promise<number>;
}
