/* Autor: Pascal Thesing (FH Münster) */

import { ConnectionStatus, Network } from "@capacitor/network";
import { Storage } from "@ionic/storage";
import { v4 as uuidv4 } from 'uuid';
import { notificationService } from "./notification";
import { ChatSyncDao } from "./offline/chat-sync-dao";
import { CourseSyncDao, ExerciseSyncDao, MassageSyncDao, MemberInCourseSyncDao, TaskSyncDao, UserSyncDao, WorkoutSyncDao } from "./offline/sync-dao";

export interface HttpClientConfig {
  baseURL: string;
}

interface Request {
  path: string,
  requestOptions: string,
}

const REQUEST_KEY = 'Request';
const JWT_KEY = 'jwt-token';

export class HttpClient {
  private config!: HttpClientConfig;
  private storage!: Storage;
  public isOffline: boolean = false;

  init(config: HttpClientConfig) {
    this.config = config;

    Network.getStatus().then(async status => {
      await this.onNetworkStatusChanged(status, false);
    })

    Network.addListener('networkStatusChange', async status => {
      await this.onNetworkStatusChanged(status, true);
    })
  }

  public get(url: string) {
    return this.createFetch('GET', url);
  }

  public post(url: string, body: unknown) {
    return this.createFetch('POST', url, body);
  }

  public put(url: string, body: unknown) {
    return this.createFetch('PUT', url, body);
  }

  public patch(url: string, body: unknown) {
    return this.createFetch('PATCH', url, body);
  }

  public delete(url: string) {
    return this.createFetch('DELETE', url);
  }

  private async createFetch(method: string, url: string, body?: unknown) {
    const requestOptions: RequestInit = {
      headers: { 'Content-Type': 'application/json; charset=utf-8', authentication: (await this.storage.get(JWT_KEY)) ?? null },
      method: method,
    };

    if (body) {
      requestOptions.body = JSON.stringify(body);
    }

    const path = this.config.baseURL + (url.startsWith('/') ? url.substring(1) : url);

    if(this.isOffline) {
      let requests: Request[] = await this.getRequestArray() ?? [];
      requests.push({
        path: path,
        requestOptions: requestOptions
      });

      await this.setRequestArray(requests);

      return;
    }

    return this.doFetch(path, requestOptions);
  }

  async doFetch(path: string, requestOptions: string) {
    const response = await fetch(path, requestOptions);

    if (response.ok) {
      if(response.headers.has('authentication'))      {
        await this.storage.set(JWT_KEY, response.headers.get('authentication'));
      }

      return response;
    } else {
      let message = await response.text();
      try {
        message = JSON.parse(message).message;
      } catch (e) {
        message = (e as Error).message;
      }
      message = message || response.statusText;
      return Promise.reject({ message, statusCode: response.status });
    }
  }


  private async onNetworkStatusChanged(status: ConnectionStatus, showNotification = false) {
    if(!this.storage) {
      this.storage = new Storage();
      await this.storage.create();  
    }

    this.isOffline = !status.connected;

    if(!status.connected) {
      notificationService.showNotification('Sie sind nun offline!', 'info')
      return;
    }

    if(showNotification) {
      notificationService.showNotification('Sie sind wieder online!', 'info')
    }

    const requests: Request[] = [];

    ((await this.getRequestArray()) ?? []).forEach(async (value: Request) => {
      await this.doFetch(value.path, value.requestOptions)
    })

    await this.clearStorage();
  }

  private async getRequestArray(): Promise<Request[]> {
    return await this.storage.get(REQUEST_KEY)
  }

  private async setRequestArray(requests: Request[]): Promise<void> {
    return await this.storage.set(REQUEST_KEY, requests);
  }

  private async clearStorage(): Promise<void> {
    return await this.storage.remove(REQUEST_KEY);
  }
}


export const httpClient = new HttpClient();
