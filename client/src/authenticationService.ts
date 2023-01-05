/* Autor: Pascal Thesing (FH Münster) */

import { User } from "./interfaces/User";
import { CapacitorCookies } from "@capacitor/core";

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

  }
}

let auth = new AuthenticationService();
  
export const authenticationService = auth;
  