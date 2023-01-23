/* Autor: Pascal Thesing (FH Münster) */

import { User } from "./interfaces";
import { Storage } from "@ionic/storage";
import { CourseSyncDao, ExerciseSyncDao, TaskSyncDao, WorkoutSyncDao, MemberInCourseSyncDao, UserSyncDao, MassageSyncDao } from "./offline/sync-dao";
import { ChatSyncDao } from "./offline/chat-sync-dao";

const storageKey = 'USER_STORAGE_KEY';

class AuthenticationService  {
  public storage!: Storage;

  private user!: string|null;

  async init(): Promise<void> {
      this.storage = new Storage();
      await this.storage.create();  
      this.user = await this.storage.get(storageKey);
  }

  isAuthenticated(): boolean {
    return !!this.user;
  }

  isTrainer() {
    try {
        return this.getUser().isTrainer;
    } catch (error) {
        return false;
    }
  }

  async resetUserStorage() {
    await this.storage.remove(storageKey);
    this.user = null;
  }

  getUser(): Promise<User> {
    const user = this.user;

    if(!user) {
      throw Error('User was not set');
    }

    return JSON.parse(user);
  }

  async storeUser(user: User) {
    this.storage.set(storageKey, JSON.stringify(user));
    this.user = JSON.stringify(user);

    await WorkoutSyncDao.sync();
    await TaskSyncDao.sync();
    await ExerciseSyncDao.sync();
    await CourseSyncDao.sync();
    await ChatSyncDao.sync();
    await MemberInCourseSyncDao.sync();
    await UserSyncDao.sync();
    await MassageSyncDao.sync();
  }
}


export const authenticationService = new AuthenticationService();