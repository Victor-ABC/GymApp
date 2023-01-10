/* Autor: Pascal Thesing (FH Münster) */

import { User } from "./interfaces";
import { CapacitorCookies } from "@capacitor/core";
import { ChatSyncDao, CourseSyncDao, ExerciseSyncDao, TaskSyncDao, WorkoutSyncDao, MemberInCourseSyncDao, UserSyncDao } from "./offline/sync-dao";

const storageKey = 'USER_STORAGE_KEY';

export class AuthenticationService  {

  isAuthenticated(): boolean {
    return !!localStorage.getItem(storageKey);
  }

  isTrainer() {
    try {
        return this.getUser().isTrainer;
    } catch (error) {
        return false;
    }
  }

  resetUserStorage() {
    localStorage.removeItem(storageKey);
  }

  getUser(): User {
    const user = localStorage.getItem(storageKey);

    if(!user) {
      throw Error('User was not set');
    }

    return JSON.parse(user);
  }

  async storeUser(user: User) {
    localStorage.setItem(storageKey, JSON.stringify(user));

    await WorkoutSyncDao.sync();
    await TaskSyncDao.sync();
    await ExerciseSyncDao.sync();
    await CourseSyncDao.sync();
    await ChatSyncDao.sync();
    await MemberInCourseSyncDao.sync();
    await UserSyncDao.sync();
  }
}

let auth = new AuthenticationService();
  
export const authenticationService = auth;
  