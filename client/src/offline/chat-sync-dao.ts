/* Autor: Henrik Bruns */
/* Autor: Pascal Thesing */
/* Autor: Victor Corbet */

import { v4 as uuidv4 } from 'uuid';
import { Entity } from './entity.js';
import { GenericDAO } from './generic.dao.js';
import { Storage } from "@ionic/storage";
import { httpClient } from '../http-client.js';
import { Storage } from "@ionic/storage";
import { User } from '../interfaces.js';

export class ChatSyncDAO<T extends Entity>{
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
      return
    }

    await this.setRouteData(this.route);
    await this.setRouteData(this.route + '/all/users');
  }

  private async setRouteData(route: string) {
    const response = await httpClient.get(route);
    const responseData = (await response.json());

    const map: Map<string, T> = new Map();

    responseData.forEach(async (responseDatum) => {
      map.set(responseDatum.id, responseDatum)
    }) 

    this.setMap(map, route)
  }

  public async getAllUsers() {
    await this.sync();

    const result = [] as T[];

    for (const entity of (await this.getMap(this.route + '/all/users')).values()) {
        result.push(entity);
    }
    return Promise.resolve(result);
  }

  public async getAllChats() {
    await this.sync();

    const result = [] as T[];

    for (const entity of (await this.getMap(this.route)).values()) {
        result.push(entity);
    }
    return Promise.resolve(result);
  }

  async getMap(route: string): Promise<Map<string, T>> {
    return await this.storage.get(route);
  }

  async setMap(map: Map<string, T>, route: string) {
    return await this.storage.set(route, map);
  }
}

export const ChatSyncDao = new ChatSyncDAO('/chat');