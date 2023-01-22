/* Autor: Henrik Bruns */
/* Autor: Pascal Thesing */
/* Autor: Victor Corbet */

import { v4 as uuidv4 } from 'uuid';
import { Entity } from './entity.js';
import { GenericDAO } from './generic.dao.js';
import { httpClient } from '../http-client.js';
import { Storage } from "@ionic/storage";
import { User } from '../interfaces.js';

export class SyncDAO<T extends Entity> implements GenericDAO<T> {
  private entities = new Map<string, T>();
  private route!: string
  private storage!: Storage

  constructor(route: string) {
    this.route = route;
  }

  async init(){
    if(!this.storage) {
    this.storage = new Storage();
    await this.storage.create();
  }
  }

  async sync() {
    await this.init();

    if(httpClient.isOffline) {
      return;
    }

    const response = await httpClient.get(this.route);
    const responseData = (await response.json());

    const map: Map<string, T> = new Map();

    responseData.forEach(async (responseDatum) => {
      map.set(responseDatum.id, responseDatum)
    }) 
    
    this.storage.set(this.route, map)
  }

  public async create(partEntity: Omit<T, keyof Entity>) {
    await this.init();

    const entity = { ...partEntity, id: uuidv4(), createdAt: new Date().getTime() };

    const map = await this.getMap();

    await map.set(entity.id, entity as T);
    this.setMap(map);

    await httpClient.post(this.route, entity);

    return Promise.resolve(entity as T);
  }

  public async findAll(entityFilter?: Partial<T>) {
    await this.sync();

    const result = [] as T[];

    for (const entity of (await this.getMap()).values()) {
      if (!entityFilter || this._matches(entity, entityFilter)) {
        result.push(entity);
      }
    }
    return Promise.resolve(result);
  }

  public async findOne(entityFilter: Partial<T>) {
    await this.sync();

    for (const entity of (await this.getMap()).values()) {
      if (this._matches(entity, entityFilter)) {
        return Promise.resolve(entity);
      }
    }
    return Promise.resolve(null);
  }

  public async update(entity: Partial<T> & Pick<Entity, 'id'>) {
    await this.init();

    const map = await this.getMap();

    if (entity.id && map.has(entity.id)) {

      this._update(map.get(entity.id)!, entity);

      await this.setMap(map);

      await httpClient.patch(this.route + '/' + entity.id, entity);

      return Promise.resolve(true);
    } else {
      return Promise.resolve(false);
    }
  }

  public async delete(id: string) {
    await this.init();

    await httpClient.delete(this.route + '/' + id);

    const map = await this.getMap();
    const result = map.delete(id);
    await this.setMap(map);

    return Promise.resolve(result);
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

  async getMap(): Promise<Map<string, T>> {
    return await this.storage.get(this.route);
  }

  async setMap(map: Map<string, T>) {
    return await this.storage.set(this.route, map);
  }
}

export const WorkoutSyncDao = new SyncDAO('/workouts');
export const TaskSyncDao = new SyncDAO('/tasks');
export const ExerciseSyncDao = new SyncDAO('/exercises');
export const CourseSyncDao = new SyncDAO('/courses');
export const MemberInCourseSyncDao = new SyncDAO('/memberincourses');
export const UserSyncDao = new SyncDAO<User>('/users');
export const MassageSyncDao = new SyncDAO<User>('/messages');